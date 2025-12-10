import * as fs from 'fs';
import * as path from 'path';
import postcss from 'postcss';
import postcssScss from 'postcss-scss';

export interface CSSVariable {
  name: string;
  description: string;
  default?: string;
}

export interface StyleMetadata {
  cssVariables: CSSVariable[];
  filePath: string;
}

export class StyleParser {
  /**
   * Parse a CSS/SCSS file and extract CSS variables
   */
  async parseStyleFile(filePath: string): Promise<StyleMetadata> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const cssVariables = this.extractCSSVariables(content);

      return {
        cssVariables,
        filePath,
      };
    } catch (error) {
      console.error(`Error parsing style file ${filePath}:`, error);
      return {
        cssVariables: [],
        filePath,
      };
    }
  }

  /**
   * Extract CSS variables from file content
   * Reads both from comments and from actual CSS var() usage
   */
  private extractCSSVariables(content: string): CSSVariable[] {
    const variables: CSSVariable[] = [];
    const variableMap = new Map<string, CSSVariable>();

    // First, extract from comment documentation
    const commentVars = this.extractFromComments(content);
    commentVars.forEach(v => variableMap.set(v.name, v));

    // Then, extract from actual CSS declarations
    const declaredVars = this.extractFromDeclarations(content);
    declaredVars.forEach(v => {
      const existing = variableMap.get(v.name);
      if (existing) {
        // Merge: use comment description, but add default if found
        variableMap.set(v.name, { ...existing, default: v.default || existing.default });
      } else {
        variableMap.set(v.name, v);
      }
    });

    return Array.from(variableMap.values());
  }

  /**
   * Extract CSS variables documented in comments
   * Format: --variable-name: Description
   */
  private extractFromComments(content: string): CSSVariable[] {
    const variables: CSSVariable[] = [];

    // Match comment blocks with CSS variable documentation
    const commentRegex = /\/\*\*[\s\S]*?\*\//g;
    const matches = content.match(commentRegex);

    if (!matches) return variables;

    for (const comment of matches) {
      // Look for lines like: * --primary-background-color: Primary button background color
      const varRegex = /\*\s*(--[\w-]+):\s*(.+)/g;
      let match;

      while ((match = varRegex.exec(comment)) !== null) {
        const name = match[1].trim();
        const description = match[2].trim();

        variables.push({
          name,
          description,
        });
      }
    }

    return variables;
  }

  /**
   * Extract CSS variables from var() usage and their fallback values
   */
  private extractFromDeclarations(content: string): CSSVariable[] {
    const variables: CSSVariable[] = [];
    const variableMap = new Map<string, string>();

    // Match var() usage with fallbacks
    // e.g., var(--primary-color, #0066cc)
    const varRegex = /var\((--[\w-]+)(?:,\s*([^)]+))?\)/g;
    let match;

    while ((match = varRegex.exec(content)) !== null) {
      const name = match[1];
      const fallback = match[2]?.trim();

      if (!variableMap.has(name)) {
        variableMap.set(name, fallback || '');
      }
    }

    // Convert map to array
    variableMap.forEach((defaultValue, name) => {
      variables.push({
        name,
        description: '', // Will be filled from comments if available
        default: defaultValue || undefined,
      });
    });

    return variables;
  }

  /**
   * Resolve a style file path relative to a component file
   */
  resolveStylePath(componentPath: string, styleImport: string): string {
    const componentDir = path.dirname(componentPath);
    return path.resolve(componentDir, styleImport);
  }
}
