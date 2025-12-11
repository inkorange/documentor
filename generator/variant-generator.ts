import { ComponentMetadata, PropMetadata } from '../parser/component-parser';

export interface VariantExample {
  props: Record<string, any>;
  code: string;
  title: string;
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

    // Generate permutations
    const permutations = this.generatePermutations(variantProps, component.props);

    // Limit to max permutations
    const limited = permutations.slice(0, this.maxPermutations);

    // Convert to examples with code and titles
    return limited.map(props => this.createExample(component, props, variantProps));
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
   * Generate all permutations of variant props
   */
  private generatePermutations(
    variantProps: string[],
    allProps: Record<string, PropMetadata>
  ): Array<Record<string, any>> {
    if (variantProps.length === 0) {
      return [{}];
    }

    const permutations: Array<Record<string, any>> = [];

    const generate = (index: number, current: Record<string, any>) => {
      if (index === variantProps.length) {
        // Add required props and sensible defaults
        const complete = this.addRequiredProps({ ...current }, allProps);
        permutations.push(complete);
        return;
      }

      const propName = variantProps[index];
      const propMeta = allProps[propName];
      const values = propMeta.values || [];

      for (const value of values) {
        generate(index + 1, { ...current, [propName]: value });
      }
    };

    generate(0, {});
    return permutations;
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
    // Use exampleValue from JSDoc if provided
    if (metadata.exampleValue) {
      return this.parseExampleValue(metadata.exampleValue);
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
