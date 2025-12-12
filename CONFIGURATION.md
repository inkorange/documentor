# DocSpark Configuration Guide

This document provides a comprehensive reference for all configuration options available in DocSpark. All configuration is managed through a `docspark.config.json` file in your project root.

## Table of Contents

- [Basic Configuration](#basic-configuration)
- [Source Configuration](#source-configuration)
- [Output Configuration](#output-configuration)
- [Server Configuration](#server-configuration)
- [Variants Configuration](#variants-configuration)
- [Theme Configuration](#theme-configuration)
- [Coverage Configuration](#coverage-configuration)
- [Features Configuration](#features-configuration)
- [Complete Example](#complete-example)

---

## Basic Configuration

### `name` (required)
**Type:** `string`

The name of your component library or project. This appears in the documentation site header and page titles.

```json
{
  "name": "My Component Library"
}
```

### `description` (optional)
**Type:** `string`

A brief description of your component library. Displayed on the documentation homepage.

```json
{
  "description": "Beautiful, accessible React components"
}
```

### `version` (optional)
**Type:** `string`

The version of your component library. Useful for tracking documentation versions.

```json
{
  "version": "1.0.0"
}
```

---

## Source Configuration

The `source` object defines where DocSpark should look for your components and how to process them.

### `source.include` (required)
**Type:** `string[]`

Glob patterns for files to include in documentation generation. DocSpark will scan these patterns to find your components.

```json
{
  "source": {
    "include": [
      "src/components/**/*.{tsx,jsx}",
      "lib/**/*.tsx"
    ]
  }
}
```

**Common patterns:**
- `src/components/**/*.tsx` - All TypeScript React components in src/components
- `src/**/*.{tsx,jsx}` - All React components anywhere in src
- `components/**/*.jsx` - All JavaScript React components in components folder

### `source.exclude` (optional)
**Type:** `string[]`
**Default:** `["**/*.test.{tsx,jsx}", "**/*.stories.{tsx,jsx}"]`

Glob patterns for files to exclude from documentation. Useful for excluding test files, stories, and other non-component files.

```json
{
  "source": {
    "exclude": [
      "**/*.test.{tsx,jsx}",
      "**/*.stories.{tsx,jsx}",
      "**/*.spec.{tsx,jsx}",
      "**/internal/**"
    ]
  }
}
```

### `source.styleFiles` (optional)
**Type:** `string[]`
**Default:** `[".css", ".scss", ".module.css", ".module.scss"]`

File extensions to look for when searching for component styles. DocSpark will automatically parse CSS variables from these files.

```json
{
  "source": {
    "styleFiles": [".css", ".scss", ".module.css", ".module.scss", ".less"]
  }
}
```

---

## Output Configuration

The `output` object controls where and how documentation is generated.

### `output.directory` (required)
**Type:** `string`

The directory where generated documentation will be written. This folder will contain both the static website and metadata JSON files.

```json
{
  "output": {
    "directory": "./docs"
  }
}
```

**Note:** This directory will be created if it doesn't exist. All contents will be overwritten on each build.

### `output.baseUrl` (optional)
**Type:** `string`
**Default:** `"/"`

The base URL path for your documentation site. Useful when deploying to a subdirectory.

```json
{
  "output": {
    "baseUrl": "/component-docs/"
  }
}
```

**Examples:**
- `"/"` - Root of domain (https://example.com/)
- `"/docs/"` - Subdirectory (https://example.com/docs/)
- `"/my-library/"` - GitHub Pages project site

### `output.staticAssets` (optional)
**Type:** `string`

Path to a directory containing static assets (images, fonts, etc.) to copy to the output directory.

```json
{
  "output": {
    "staticAssets": "./public"
  }
}
```

---

## Server Configuration

The `server` object configures the development server and static file server.

### `server.port` (optional)
**Type:** `number`
**Default:** `6006`

The port number for the development server. If the port is in use, DocSpark will automatically try the next available port.

```json
{
  "server": {
    "port": 8080
  }
}
```

### `server.open` (optional)
**Type:** `boolean`
**Default:** `true`

Whether to automatically open the documentation site in your default browser when starting the dev server.

```json
{
  "server": {
    "open": false
  }
}
```

---

## Variants Configuration

The `variants` object controls automatic generation of component variants for the playground.

### `variants.autoGenerate` (optional)
**Type:** `boolean`
**Default:** `true`

Enable or disable automatic variant generation. When enabled, DocSpark creates multiple component examples by combining different prop values.

```json
{
  "variants": {
    "autoGenerate": true
  }
}
```

### `variants.maxPermutations` (optional)
**Type:** `number`
**Default:** `20`

Maximum number of variants to generate per component. Prevents generating too many combinations for components with many props.

```json
{
  "variants": {
    "maxPermutations": 50
  }
}
```

### `variants.defaultValues` (optional)
**Type:** `object`

Default values to use when generating variants for different prop types.

```json
{
  "variants": {
    "defaultValues": {
      "string": "Example text",
      "number": 42,
      "children": "Button Text"
    }
  }
}
```

**Available keys:**
- `string` - Default value for string props
- `number` - Default value for number props
- `children` - Default value for children/content props

---

## Theme Configuration

The `theme` object controls the visual appearance of your documentation site.

### `theme.tokens` (optional)
**Type:** `Array<Record<string, string | { source: string; background?: string }>>`

Define multiple themes for your documentation. Each theme can reference a CSS file containing CSS custom properties.

```json
{
  "theme": {
    "tokens": [{
      "light": {
        "source": "src/themes/light.css",
        "background": "#FFFFFF"
      },
      "dark": {
        "source": "src/themes/dark.css",
        "background": "#1a1a1a"
      },
      "high-contrast": {
        "source": "src/themes/high-contrast.css",
        "background": "#000000"
      }
    }]
  }
}
```

**Theme object properties:**
- `source` (required) - Path to CSS file containing theme tokens
- `background` (optional) - Background color for theme preview

**CSS file format:**
Your theme CSS files should define CSS custom properties:

```css
/* light.css */
:root {
  --primary-color: #0066cc;
  --text-color: #333333;
  --background-color: #ffffff;
  /* ... more variables */
}
```

### `theme.defaultTheme` (optional)
**Type:** `string`

The name of the theme to use by default. Must match one of the theme names in `theme.tokens`.

```json
{
  "theme": {
    "defaultTheme": "dark"
  }
}
```

### `theme.primaryColor` (optional)
**Type:** `string`

Primary accent color for the documentation site interface (not component preview).

```json
{
  "theme": {
    "primaryColor": "#0066cc"
  }
}
```

### `theme.logo` (optional)
**Type:** `string`

Path to a logo image to display in the documentation header.

```json
{
  "theme": {
    "logo": "./assets/logo.svg"
  }
}
```

### `theme.favicon` (optional)
**Type:** `string`

Path to a favicon for the documentation site.

```json
{
  "theme": {
    "favicon": "./assets/favicon.ico"
  }
}
```

---

## Coverage Configuration

The `coverage` object configures test coverage tracking and display.

**Important Prerequisites:**
Before enabling coverage, you must have a test runner configured in your project. DocSpark supports:
- **Jest** with `--coverage` flag
- **Vitest** with coverage enabled
- Any test runner that generates coverage reports in standard formats

Your test runner must be configured to generate coverage reports that DocSpark can parse.

### `coverage.enabled` (optional)
**Type:** `boolean`
**Default:** `false`

Enable or disable coverage tracking for components.

```json
{
  "coverage": {
    "enabled": true
  }
}
```

**Requirements when enabled:**
1. A test runner (Jest, Vitest, etc.) must be installed and configured
2. Coverage reporting must be enabled in your test runner config
3. Test files should follow the patterns in `coverage.testPatterns`

### `coverage.testPatterns` (optional)
**Type:** `string[]`
**Default:** `["**/*.test.{tsx,jsx,ts,js}", "**/*.spec.{tsx,jsx,ts,js}"]`

Glob patterns to identify test files for coverage calculations.

```json
{
  "coverage": {
    "testPatterns": [
      "**/__tests__/**/*.{tsx,jsx}",
      "**/*.test.{tsx,jsx}",
      "**/*.spec.{tsx,jsx}"
    ]
  }
}
```

### `coverage.coverageReportPath` (optional)
**Type:** `string`
**Default:** `"./coverage/coverage-summary.json"`

Path to your test runner's coverage report JSON file.

```json
{
  "coverage": {
    "coverageReportPath": "./coverage/lcov-report/coverage-summary.json"
  }
}
```

**Jest configuration example:**
```json
{
  "collectCoverage": true,
  "coverageDirectory": "coverage",
  "coverageReporters": ["json", "json-summary", "lcov", "text"]
}
```

**Vitest configuration example:**
```typescript
export default {
  test: {
    coverage: {
      enabled: true,
      reporter: ['json', 'json-summary', 'lcov']
    }
  }
}
```

### `coverage.thresholds` (optional)
**Type:** `object`

Define minimum coverage thresholds. Components below these thresholds will be highlighted.

```json
{
  "coverage": {
    "thresholds": {
      "statements": 80,
      "branches": 80,
      "functions": 80,
      "lines": 80
    }
  }
}
```

**Threshold properties:**
- `statements` - Minimum percentage of statements covered (0-100)
- `branches` - Minimum percentage of branches covered (0-100)
- `functions` - Minimum percentage of functions covered (0-100)
- `lines` - Minimum percentage of lines covered (0-100)

### `coverage.displayInSidebar` (optional)
**Type:** `boolean`
**Default:** `false`

Show coverage badges in the component sidebar navigation.

```json
{
  "coverage": {
    "displayInSidebar": true
  }
}
```

### `coverage.badgeStyle` (optional)
**Type:** `string`
**Default:** `"flat"`

Visual style for coverage badges.

```json
{
  "coverage": {
    "badgeStyle": "flat"
  }
}
```

**Available styles:**
- `"flat"` - Flat, modern style
- `"rounded"` - Rounded corners
- `"shield"` - Shield.io style

---

## Features Configuration

The `features` object enables or disables specific documentation features.

### `features.search` (optional)
**Type:** `boolean`
**Default:** `true`

Enable component search functionality in the documentation.

```json
{
  "features": {
    "search": true
  }
}
```

### `features.darkMode` (optional)
**Type:** `boolean`
**Default:** `true`

Enable dark mode toggle for the documentation interface (not component preview themes).

```json
{
  "features": {
    "darkMode": true
  }
}
```

### `features.codeSnippets` (optional)
**Type:** `boolean`
**Default:** `true`

Show code snippets and usage examples for components.

```json
{
  "features": {
    "codeSnippets": true
  }
}
```

### `features.playground` (optional)
**Type:** `boolean`
**Default:** `false`

Enable the interactive component playground with live prop editing.

```json
{
  "features": {
    "playground": true
  }
}
```

**Note:** The playground feature allows users to modify component props in real-time and see changes immediately.

### `features.testCoverage` (optional)
**Type:** `boolean`
**Default:** `true`

Display test coverage information in the documentation.

```json
{
  "features": {
    "testCoverage": false
  }
}
```

**Note:** This only controls display. You must also configure the `coverage` section and have a test runner set up.

---

## Complete Example

Here's a comprehensive configuration example showing all available options:

```json
{
  "name": "Acme Design System",
  "description": "Production-ready React components for modern web applications",
  "version": "2.1.0",

  "source": {
    "include": [
      "src/components/**/*.{tsx,jsx}",
      "packages/*/src/**/*.tsx"
    ],
    "exclude": [
      "**/*.test.{tsx,jsx}",
      "**/*.stories.{tsx,jsx}",
      "**/*.spec.{tsx,jsx}",
      "**/internal/**",
      "**/__tests__/**"
    ],
    "styleFiles": [".css", ".scss", ".module.css", ".module.scss"]
  },

  "output": {
    "directory": "./docs",
    "baseUrl": "/",
    "staticAssets": "./public"
  },

  "server": {
    "port": 8080,
    "open": true
  },

  "variants": {
    "autoGenerate": true,
    "maxPermutations": 30,
    "defaultValues": {
      "string": "Sample text",
      "number": 100,
      "children": "Click me"
    }
  },

  "theme": {
    "tokens": [{
      "light": {
        "source": "src/themes/light.css",
        "background": "#FFFFFF"
      },
      "dark": {
        "source": "src/themes/dark.css",
        "background": "#0a0a0a"
      },
      "high-contrast": {
        "source": "src/themes/high-contrast.css",
        "background": "#000000"
      }
    }],
    "defaultTheme": "light",
    "primaryColor": "#0066cc",
    "logo": "./assets/logo.svg",
    "favicon": "./assets/favicon.ico"
  },

  "coverage": {
    "enabled": true,
    "testPatterns": [
      "**/__tests__/**/*.{tsx,jsx}",
      "**/*.test.{tsx,jsx}"
    ],
    "coverageReportPath": "./coverage/coverage-summary.json",
    "thresholds": {
      "statements": 85,
      "branches": 80,
      "functions": 85,
      "lines": 85
    },
    "displayInSidebar": true,
    "badgeStyle": "flat"
  },

  "features": {
    "search": true,
    "darkMode": true,
    "codeSnippets": true,
    "playground": true,
    "testCoverage": true
  }
}
```

---

## Validation

DocSpark automatically validates your configuration when you run build or dev commands. If there are issues, you'll see clear error messages indicating what needs to be fixed.

Common validation errors:
- Missing required fields (`name`, `source.include`, `output.directory`)
- Invalid glob patterns
- Non-existent file paths (for themes, logo, favicon)
- Invalid coverage report path
- Missing test runner setup when coverage is enabled

---

## Tips and Best Practices

1. **Start simple** - Begin with minimal configuration and add options as needed
2. **Use relative paths** - Keep paths relative to your project root for portability
3. **Version control** - Commit your `docspark.config.json` to version control
4. **Test coverage setup** - Ensure your test runner is properly configured before enabling coverage features
5. **Theme consistency** - Keep theme token names consistent across all theme files
6. **Exclude patterns** - Be specific with exclude patterns to avoid documenting test files
7. **Max permutations** - Adjust based on component complexity (fewer for complex components)
8. **Base URL** - Set correctly for your deployment target (especially for GitHub Pages)

---

## Need Help?

- Check the [README.md](./README.md) for quick start guide
- Report issues at [GitHub Issues](https://github.com/your-org/docspark/issues)
- See example configurations in the `examples/` directory
