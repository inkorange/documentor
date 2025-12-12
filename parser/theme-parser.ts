import * as fs from 'fs';
import * as path from 'path';
import postcss from 'postcss';

export interface ThemeToken {
  name: string;
  value: string;
  description?: string;
}

export interface Theme {
  id: string;
  name: string;
  filePath: string;
  background?: string;
  tokens: ThemeToken[];
  metadata?: {
    description?: string;
    author?: string;
    version?: string;
  };
}

export class ThemeParser {
  /**
   * Parse a theme configuration from documentor.config.json
   */
  parseThemeConfig(config: any): Map<string, { source: string; background?: string }> {
    const themeMap = new Map<string, { source: string; background?: string }>();

    if (!config.theme?.tokens || !Array.isArray(config.theme.tokens)) {
      return themeMap;
    }

    // Extract theme files from configuration
    for (const tokenGroup of config.theme.tokens) {
      for (const [themeName, themeConfig] of Object.entries(tokenGroup)) {
        // Support both old format (string) and new format (object with source and background)
        if (typeof themeConfig === 'string') {
          themeMap.set(themeName, { source: themeConfig });
        } else if (typeof themeConfig === 'object' && themeConfig !== null) {
          const config = themeConfig as any;
          themeMap.set(themeName, {
            source: config.source,
            background: config.background
          });
        }
      }
    }

    return themeMap;
  }

  /**
   * Parse a CSS/SCSS theme file and extract tokens
   */
  async parseThemeFile(filePath: string, themeName?: string): Promise<Theme> {
    const absolutePath = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Theme file not found: ${filePath}`);
    }

    const content = fs.readFileSync(absolutePath, 'utf-8');
    const tokens = await this.extractTokensFromCSS(content);
    const metadata = this.extractMetadataFromComments(content);

    // Use provided theme name from config, or fall back to filename
    const id = themeName || path.basename(filePath, path.extname(filePath));

    return {
      id,
      name: this.formatThemeName(id),
      filePath,
      tokens,
      metadata
    };
  }

  /**
   * Extract CSS custom properties using PostCSS
   */
  private async extractTokensFromCSS(cssContent: string): Promise<ThemeToken[]> {
    const tokens: ThemeToken[] = [];

    try {
      const root = postcss.parse(cssContent);

      root.walkDecls(decl => {
        if (decl.prop.startsWith('--')) {
          // Check for inline comment describing the token
          const description = this.extractInlineDescription(decl);

          tokens.push({
            name: decl.prop,
            value: decl.value,
            description
          });
        }
      });
    } catch (error) {
      console.warn('Warning: Failed to parse CSS with PostCSS, falling back to regex extraction');
      // Fallback to regex-based extraction if PostCSS fails
      return this.extractTokensWithRegex(cssContent);
    }

    return tokens;
  }

  /**
   * Fallback method to extract CSS variables using regex
   */
  private extractTokensWithRegex(cssContent: string): ThemeToken[] {
    const tokens: ThemeToken[] = [];
    const varRegex = /--([\w-]+)\s*:\s*([^;]+);/g;
    let match;

    while ((match = varRegex.exec(cssContent)) !== null) {
      tokens.push({
        name: `--${match[1]}`,
        value: match[2].trim()
      });
    }

    return tokens;
  }

  /**
   * Extract theme metadata from leading comment block
   */
  private extractMetadataFromComments(content: string): Theme['metadata'] {
    const metadata: Theme['metadata'] = {};

    // Match the first comment block
    const commentMatch = content.match(/\/\*\*([\s\S]*?)\*\//);
    if (!commentMatch) return metadata;

    const commentText = commentMatch[1];

    // Extract description (first non-empty line after /**)
    const descriptionMatch = commentText.match(/\*\s*(.+)/);
    if (descriptionMatch) {
      metadata.description = descriptionMatch[1].trim();
    }

    // Extract @author tag
    const authorMatch = commentText.match(/@author\s+(.+)/);
    if (authorMatch) {
      metadata.author = authorMatch[1].trim();
    }

    // Extract @version tag
    const versionMatch = commentText.match(/@version\s+(.+)/);
    if (versionMatch) {
      metadata.version = versionMatch[1].trim();
    }

    return metadata;
  }

  /**
   * Extract inline comment for a CSS declaration
   */
  private extractInlineDescription(decl: any): string | undefined {
    // Check if there's a comment before this declaration
    const prev = decl.prev();
    if (prev && prev.type === 'comment') {
      return prev.text.trim();
    }
    return undefined;
  }

  /**
   * Format theme name for display (e.g., "dark-mode" -> "Dark Mode")
   */
  private formatThemeName(id: string): string {
    return id
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Validate theme file has required tokens
   */
  validateTheme(theme: Theme, requiredTokens: string[]): { valid: boolean; missing: string[] } {
    const tokenNames = new Set(theme.tokens.map(t => t.name));
    const missing = requiredTokens.filter(token => !tokenNames.has(token));

    return {
      valid: missing.length === 0,
      missing
    };
  }
}
