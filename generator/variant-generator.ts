import { ComponentMetadata, PropMetadata } from '../parser/component-parser';

export interface VariantExample {
  props: Record<string, any>;
  code: string;
  title: string;
  isPermutation?: boolean; // True if this variant combines multiple variant props
  combinedProps?: string[]; // Names of props that are combined in this permutation
}

export class VariantGenerator {
  private maxPermutations: number;
  private defaultValues: Record<string, any>;

  constructor(maxPermutations: number = 20, defaultValues?: Record<string, any>) {
    this.maxPermutations = maxPermutations;
    this.defaultValues = defaultValues || {
      string: 'Example text',
      number: 42,
      children: 'Button Text',
    };
  }

  /**
   * Generate all variant combinations for a component
   */
  generateVariants(component: ComponentMetadata): VariantExample[] {
    const variantProps = this.findVariantProps(component.props);

    if (variantProps.length === 0) {
      // No variant props, return a single default example
      return [this.generateDefaultExample(component)];
    }

    // Generate single-prop variants
    const singleVariants = this.generateSinglePropVariants(variantProps, component.props, component);

    // Generate smart permutations (combinations of multiple variant props)
    const permutationVariants = this.generateSmartPermutations(variantProps, component.props, component);

    // Combine and limit to max permutations
    const allVariants = [...singleVariants, ...permutationVariants];
    const limited = allVariants.slice(0, this.maxPermutations);

    return limited;
  }

  /**
   * Find props that should be used for variant generation
   */
  private findVariantProps(props: Record<string, PropMetadata>): string[] {
    const variantProps: string[] = [];

    for (const [propName, metadata] of Object.entries(props)) {
      if (metadata.renderVariants && metadata.values) {
        variantProps.push(propName);
      }
    }

    return variantProps;
  }

  /**
   * Generate variants for single props (one variant prop at a time)
   */
  private generateSinglePropVariants(
    variantProps: string[],
    allProps: Record<string, PropMetadata>,
    component: ComponentMetadata
  ): VariantExample[] {
    const variants: VariantExample[] = [];

    for (const propName of variantProps) {
      const propMeta = allProps[propName];
      const values = propMeta.values || [];

      for (const value of values) {
        const props = { [propName]: value };
        const complete = this.addRequiredProps(props, allProps);

        const example = this.createExample(component, complete, [propName]);

        variants.push(example);
      }
    }

    return variants;
  }

  /**
   * Generate smart permutations of multiple variant props
   * Respects exclusion rules from @variantExclude tags
   */
  private generateSmartPermutations(
    variantProps: string[],
    allProps: Record<string, PropMetadata>,
    component: ComponentMetadata
  ): VariantExample[] {
    if (variantProps.length < 2) {
      return []; // Need at least 2 variant props to create permutations
    }

    const permutations: VariantExample[] = [];
    const maxCombinations = 10; // Limit permutations to avoid explosion

    // Generate all combinations of variant props (2 or more props combined)
    const combinations = this.generatePropCombinations(variantProps, 2, Math.min(variantProps.length, 3));

    for (const propCombination of combinations) {
      if (permutations.length >= maxCombinations) break;

      // Check if this combination is valid (no exclusions)
      if (!this.isValidCombination(propCombination, allProps)) {
        continue;
      }

      // Generate a few meaningful value combinations for these props
      const valueCombinations = this.generateValueCombinations(propCombination, allProps);

      for (const valueCombo of valueCombinations) {
        if (permutations.length >= maxCombinations) break;

        const complete = this.addRequiredProps(valueCombo, allProps);

        const example = this.createExample(component, complete, propCombination);

        // Mark as permutation
        example.isPermutation = true;
        example.combinedProps = propCombination;

        permutations.push(example);
      }
    }

    return permutations;
  }

  /**
   * Generate combinations of props (subsets of size minSize to maxSize)
   */
  private generatePropCombinations(props: string[], minSize: number, maxSize: number): string[][] {
    const combinations: string[][] = [];

    const combine = (start: number, current: string[]) => {
      if (current.length >= minSize && current.length <= maxSize) {
        combinations.push([...current]);
      }

      if (current.length >= maxSize) return;

      for (let i = start; i < props.length; i++) {
        combine(i + 1, [...current, props[i]]);
      }
    };

    combine(0, []);
    return combinations;
  }

  /**
   * Check if a combination of props is valid (no exclusion conflicts)
   */
  private isValidCombination(props: string[], allProps: Record<string, PropMetadata>): boolean {
    for (let i = 0; i < props.length; i++) {
      const propName = props[i];
      const propMeta = allProps[propName];

      if (propMeta.excludedWith) {
        for (const excludedProp of propMeta.excludedWith) {
          if (props.includes(excludedProp)) {
            return false; // This combination is excluded
          }
        }
      }
    }

    return true;
  }

  /**
   * Generate meaningful value combinations for a set of props
   * Takes first 2 values of each prop to avoid explosion
   */
  private generateValueCombinations(
    props: string[],
    allProps: Record<string, PropMetadata>
  ): Array<Record<string, any>> {
    if (props.length === 0) return [{}];

    const valueCombos: Array<Record<string, any>> = [];
    const maxPerProp = 2; // Limit to 2 values per prop to keep permutations reasonable

    const generate = (index: number, current: Record<string, any>) => {
      if (index === props.length) {
        valueCombos.push({ ...current });
        return;
      }

      const propName = props[index];
      const propMeta = allProps[propName];
      const values = (propMeta.values || []).slice(0, maxPerProp);

      for (const value of values) {
        generate(index + 1, { ...current, [propName]: value });
      }
    };

    generate(0, {});
    return valueCombos;
  }

  /**
   * Add required props with default values
   */
  private addRequiredProps(
    props: Record<string, any>,
    allProps: Record<string, PropMetadata>
  ): Record<string, any> {
    const result = { ...props };

    for (const [propName, metadata] of Object.entries(allProps)) {
      // Skip if already set or if it should be hidden
      if (result[propName] !== undefined || metadata.hideInDocs) {
        continue;
      }

      // Add required props or props with defaults
      if (!metadata.optional || metadata.default) {
        result[propName] = this.getDefaultValue(propName, metadata);
      }
    }

    return result;
  }

  /**
   * Get a sensible default value for a prop
   */
  private getDefaultValue(propName: string, metadata: PropMetadata): any {
    // Use example from JSDoc @example tag if provided
    if (metadata.example) {
      return this.parseExampleValue(metadata.example);
    }

    // Use default value from component if available
    if (metadata.default) {
      return this.parseExampleValue(metadata.default);
    }

    // Special handling for common prop names
    if (propName === 'children') {
      return this.defaultValues.children;
    }

    // Use type to infer default
    const type = metadata.type.toLowerCase();

    // Check for array types first (before checking for the base type)
    if (type.includes('[]') || type.includes('array')) {
      // Determine the array element type
      if (type.includes('string')) {
        return ['Option 1', 'Option 2', 'Option 3'];
      }
      if (type.includes('number')) {
        return [1, 2, 3];
      }
      // Default array
      return [];
    }

    if (type.includes('string')) {
      return this.defaultValues.string;
    }

    if (type.includes('number')) {
      return this.defaultValues.number;
    }

    if (type.includes('boolean')) {
      return false;
    }

    if (type.includes('reactnode') || type.includes('react.reactnode')) {
      return this.defaultValues.children;
    }

    // If it has values, use the first one
    if (metadata.values && metadata.values.length > 0) {
      return metadata.values[0];
    }

    return undefined;
  }

  /**
   * Parse example value from string
   */
  private parseExampleValue(value: string): any {
    // Try to evaluate simple values
    const trimmed = value.trim().replace(/^['"]|['"]$/g, '');

    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (!isNaN(Number(trimmed))) return Number(trimmed);

    // Check if it's a JSX/React element (starts with < and ends with >)
    if (trimmed.startsWith('<') && trimmed.endsWith('>')) {
      // Return the JSX string as-is for React.ReactNode props
      return trimmed;
    }

    return trimmed;
  }

  /**
   * Generate a default example for components without variant props
   */
  private generateDefaultExample(component: ComponentMetadata): VariantExample {
    const props: Record<string, any> = {};

    for (const [propName, metadata] of Object.entries(component.props)) {
      if (metadata.hideInDocs) continue;

      if (!metadata.optional) {
        props[propName] = this.getDefaultValue(propName, metadata);
      }
    }

    return this.createExample(component, props, []);
  }

  /**
   * Create an example with code snippet and title
   */
  private createExample(
    component: ComponentMetadata,
    props: Record<string, any>,
    variantProps: string[]
  ): VariantExample {
    const code = this.generateCodeSnippet(component.name, props);
    const title = this.generateTitle(component, props, variantProps);

    return {
      props,
      code,
      title,
    };
  }

  /**
   * Generate variant title using displayTemplate or default format
   */
  private generateTitle(
    component: ComponentMetadata,
    props: Record<string, any>,
    variantProps: string[]
  ): string {
    // Look for any variant prop with a displayTemplate
    if (variantProps.length > 0) {
      for (const propName of variantProps) {
        const propMeta = component.props[propName];
        if (propMeta?.displayTemplate) {
          // Found a displayTemplate, use it with all variant props
          return this.applyDisplayTemplate(
            propMeta.displayTemplate,
            props,
            variantProps
          );
        }
      }
    }

    // Default format: prop="value" for each variant prop
    if (variantProps.length > 0) {
      const parts = variantProps.map(propName => {
        const value = props[propName];
        return `${propName}="${value}"`;
      });
      return parts.join(' ');
    }

    // No variant props, use "Default"
    return 'Default';
  }

  /**
   * Apply display template to generate variant title
   * @param template - Template string like "{size} {variant} InputField"
   * @param props - All props for this variant
   * @param variantProps - Names of variant props to replace in template
   * @returns Formatted title (e.g., "Small Primary InputField")
   */
  private applyDisplayTemplate(
    template: string,
    props: Record<string, any>,
    variantProps: string[]
  ): string {
    let result = template;

    // Replace each {propName} placeholder with its formatted value
    for (const propName of variantProps) {
      const propValue = props[propName];
      if (propValue !== undefined) {
        // Convert prop value to Initial Uppercase
        const formattedValue = String(propValue).charAt(0).toUpperCase() + String(propValue).slice(1);

        // Replace {propName} with formatted value
        const placeholder = `{${propName}}`;
        result = result.replace(placeholder, formattedValue);
      }
    }

    return result;
  }

  /**
   * Generate JSX code snippet
   */
  private generateCodeSnippet(componentName: string, props: Record<string, any>): string {
    const propStrings: string[] = [];

    for (const [key, value] of Object.entries(props)) {
      if (key === 'children') continue;

      if (typeof value === 'string') {
        propStrings.push(`${key}="${value}"`);
      } else if (typeof value === 'boolean') {
        if (value) {
          propStrings.push(key);
        }
      } else if (typeof value === 'number') {
        propStrings.push(`${key}={${value}}`);
      } else {
        propStrings.push(`${key}={${JSON.stringify(value)}}`);
      }
    }

    const propsString = propStrings.length > 0 ? ' ' + propStrings.join(' ') : '';
    const children = props.children;

    if (children) {
      return `<${componentName}${propsString}>\n  ${children}\n</${componentName}>`;
    }

    return `<${componentName}${propsString} />`;
  }
}
