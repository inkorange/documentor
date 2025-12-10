# Documentor

**Automated Component Documentation for React**

Documentor is a zero-config documentation tool that automatically generates comprehensive component documentation by parsing your existing React TypeScript components. No story files, no manual configuration—just point it at your components and go.

## Current Status: Phase 1 (MVP)

Phase 1 is complete! Documentor can now:
- ✅ Parse React TypeScript components (`.tsx`, `.jsx`)
- ✅ Extract props, types, and documentation from JSDoc/comments
- ✅ Parse CSS/SCSS files to extract design tokens (CSS variables)
- ✅ Automatically generate all component variants based on prop types
- ✅ Generate comprehensive JSON metadata for each component
- ✅ Watch files and rebuild automatically in dev mode

**Coming in Phase 2:** React documentation website with live component previews

---

## Installation

```bash
# Install dependencies
npm install

# Or with legacy peer deps (recommended for CRA projects)
npm install --legacy-peer-deps
```

---

## Quick Start

### 1. Create a Configuration File

Create `documentor.config.json` in your project root:

```json
{
  "name": "My Component Library",
  "description": "Beautiful, accessible React components",
  "version": "1.0.0",

  "source": {
    "include": [
      "src/components/**/*.{tsx,jsx}"
    ],
    "exclude": [
      "**/*.test.{tsx,jsx}",
      "**/*.stories.{tsx,jsx}"
    ]
  },

  "output": {
    "directory": "./docs"
  },

  "server": {
    "port": 6006
  }
}
```

### 2. Annotate Your Components

Documentor reads your existing TypeScript interfaces and JSDoc comments. Use special annotations to control variant generation:

```typescript
// src/components/Button.tsx
import React from 'react';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps {
  /**
   * Visual variant of the button
   * @renderVariants true
   */
  variant?: ButtonVariant;

  /** Button content */
  children: React.ReactNode;
}

/**
 * Button component that supports multiple variants
 */
const Button: React.FC<ButtonProps> = ({ variant = 'primary', children }) => {
  return <button className={styles[variant]}>{children}</button>;
};

export default Button;
```

**Supported Comment Styles:**
- JSDoc format: `/** @renderVariants true */`
- Inline format: `/* renderVariants: true */`

### 3. Document Your CSS Variables

Add CSS variable documentation to your SCSS files:

```scss
// Button.module.scss

/**
 * CSS Variables:
 * --primary-background-color: Primary button background color
 * --primary-text-color: Primary button text color
 * --secondary-background-color: Secondary button background color
 */

.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
}

.primary {
  background-color: var(--primary-background-color, #0066cc);
  color: var(--primary-text-color, #ffffff);
}
```

### 4. Build Documentation

```bash
# Generate documentation
npm run docs:build

# Or with verbose output
npm run docs:build -- --verbose
```

This will:
1. Scan all files matching `source.include` patterns
2. Parse component interfaces and extract prop metadata
3. Parse style files and extract CSS variables
4. Generate all variant combinations automatically
5. Create JSON metadata files in `./docs/metadata/`

---

## CLI Commands

Documentor provides three main commands:

### `build` - Generate Static Documentation

Generate JSON metadata files for all components.

```bash
# Basic build
npm run docs:build

# Build with options
node ./bin/documentor.js build [options]
```

**Options:**
- `-c, --config <path>` - Path to config file (default: `./documentor.config.json`)
- `--base-url <url>` - Base URL for the site (default: `/`)
- `--clean` - Clean output directory before building
- `--verbose` - Show detailed build output

**Examples:**
```bash
# Build with custom config
npm run documentor build --config ./custom-config.json

# Build with verbose output and clean
npm run documentor build --verbose --clean

# Build with custom base URL
npm run documentor build --base-url /my-components/
```

**Output:**
```
./docs/
├── metadata/
│   ├── index.json          # Component index and stats
│   ├── Button.json         # Button component metadata
│   └── InputField.json     # InputField component metadata
```

### `dev` - Development Server (Coming Soon)

Start development server with file watching and hot reload.

```bash
npm run docs:dev
```

**Options:**
- `-p, --port <port>` - Server port (default: `6006`)
- `-c, --config <path>` - Path to config file

**What it does:**
- Watches component and style files for changes
- Rebuilds metadata automatically when files change
- Serves documentation website (Phase 2)

### `serve` - Serve Built Documentation (Coming Soon)

Serve the built documentation site.

```bash
npm run docs:serve
```

**Options:**
- `-p, --port <port>` - Server port (default: `8080`)
- `-d, --dir <directory>` - Documentation directory (default: `./docs`)

---

## Configuration Reference

### Full Configuration Example

```json
{
  "name": "My Component Library",
  "description": "Beautiful, accessible React components",
  "version": "1.0.0",

  "source": {
    "include": [
      "src/components/**/*.{tsx,jsx}",
      "src/ui/**/*.{tsx,jsx}"
    ],
    "exclude": [
      "**/*.test.{tsx,jsx}",
      "**/*.stories.{tsx,jsx}",
      "**/internal/**"
    ],
    "styleFiles": [".css", ".scss", ".module.css", ".module.scss"]
  },

  "output": {
    "directory": "./docs",
    "baseUrl": "/"
  },

  "server": {
    "port": 6006,
    "open": true
  },

  "variants": {
    "autoGenerate": true,
    "maxPermutations": 20,
    "defaultValues": {
      "string": "Example text",
      "number": 42,
      "children": "Button Text"
    }
  },

  "theme": {
    "primaryColor": "#0066cc",
    "logo": "./logo.svg",
    "favicon": "./favicon.ico"
  },

  "features": {
    "search": true,
    "darkMode": true,
    "codeSnippets": true,
    "playground": false,
    "testCoverage": false
  }
}
```

### Configuration Options

#### `source` (required)

Controls which files are parsed.

- **`include`** (string[]): Glob patterns for component files
- **`exclude`** (string[]): Glob patterns to exclude
- **`styleFiles`** (string[]): Style file extensions to parse

#### `output`

Controls where documentation is generated.

- **`directory`** (string): Output directory (default: `./docs`)
- **`baseUrl`** (string): Base URL for deployed site (default: `/`)

#### `server`

Development server configuration.

- **`port`** (number): Server port (default: `6006`)
- **`open`** (boolean): Auto-open browser (default: `true`)

#### `variants`

Variant generation settings.

- **`autoGenerate`** (boolean): Auto-generate variants (default: `true`)
- **`maxPermutations`** (number): Max variants per component (default: `20`)
- **`defaultValues`** (object): Default prop values
  - **`string`**: Default string value
  - **`number`**: Default number value
  - **`children`**: Default children value

#### `theme`

Documentation site theming (Phase 2).

- **`primaryColor`** (string): Primary theme color
- **`logo`** (string): Logo file path
- **`favicon`** (string): Favicon file path

#### `features`

Enable/disable documentation features (Phase 2).

- **`search`** (boolean): Full-text search
- **`darkMode`** (boolean): Dark mode support
- **`codeSnippets`** (boolean): Copy-to-clipboard for code
- **`playground`** (boolean): Interactive playground
- **`testCoverage`** (boolean): Show test coverage

---

## Special Annotations

### Component Props

Use these annotations in your prop JSDoc comments:

#### `@renderVariants`

Generate all variants for this prop.

```typescript
export interface ButtonProps {
  /**
   * Button variant
   * @renderVariants true
   */
  variant?: 'primary' | 'secondary' | 'outline';
}
```

**Result:** Generates 3 variants (one for each value)

#### `@exampleValue`

Override the default example value.

```typescript
export interface ButtonProps {
  /**
   * Button label
   * @exampleValue "Click Me!"
   */
  label?: string;
}
```

#### `@hideInDocs`

Hide internal props from documentation.

```typescript
export interface ButtonProps {
  /**
   * Internal test ID
   * @hideInDocs
   */
  _testId?: string;
}
```

### CSS Variables

Document CSS variables in stylesheet comments:

```scss
/**
 * --primary-color: Primary theme color
 * --secondary-color: Secondary theme color
 * --font-family: Default font family
 */
```

Documentor extracts:
- Variable name
- Description
- Default value from `var()` fallbacks

---

## Generated Metadata

Documentor generates comprehensive JSON metadata for each component.

### Example: Button.json

```json
{
  "component": {
    "name": "Button",
    "description": "Button component that supports multiple variants",
    "filePath": "src/components/Button.tsx",
    "props": {
      "variant": {
        "type": "ButtonVariant",
        "values": ["primary", "secondary", "outline"],
        "optional": true,
        "default": "primary",
        "description": "Visual variant of the button",
        "renderVariants": true
      },
      "children": {
        "type": "React.ReactNode",
        "optional": false,
        "description": "Button content"
      }
    },
    "styleFiles": ["./Button.module.scss"]
  },
  "variants": [
    {
      "props": {
        "variant": "primary",
        "children": "Button Text"
      },
      "code": "<Button variant=\"primary\">\n  Button Text\n</Button>"
    }
  ],
  "cssVariables": [
    {
      "name": "--primary-background-color",
      "description": "Primary button background color",
      "default": "#0066cc"
    }
  ]
}
```

### Index File

`docs/metadata/index.json` contains:

- Project configuration
- List of all components
- Build statistics

```json
{
  "config": {
    "name": "My Component Library",
    "description": "...",
    "version": "1.0.0"
  },
  "components": [
    {
      "name": "Button",
      "description": "...",
      "filePath": "src/components/Button.tsx",
      "variantCount": 3,
      "cssVariableCount": 14
    }
  ],
  "stats": {
    "componentCount": 2,
    "variantCount": 15,
    "cssVariableCount": 32
  }
}
```

---

## NPM Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "docs:build": "node ./bin/documentor.js build --verbose",
    "docs:dev": "node ./bin/documentor.js dev",
    "docs:serve": "node ./bin/documentor.js serve"
  }
}
```

Or use the CLI directly:

```bash
# Via npx
npx documentor build

# Via node
node ./bin/documentor.js build
```

---

## Project Structure

```
your-project/
├── src/
│   └── components/
│       ├── Button.tsx              # Component file
│       └── Button.module.scss      # Style file
├── docs/                           # Generated documentation
│   └── metadata/
│       ├── index.json              # Component index
│       ├── Button.json             # Button metadata
│       └── InputField.json         # InputField metadata
├── documentor.config.json          # Configuration file
└── package.json
```

---

## How It Works

1. **File Discovery**: Scans directories matching `source.include` patterns
2. **Component Parsing**: Uses TypeScript Compiler API (ts-morph) to parse `.tsx/.jsx` files
   - Extracts interface/type definitions
   - Reads JSDoc comments and annotations
   - Identifies union types for variants
   - Finds default prop values
3. **Style Parsing**: Uses PostCSS to parse CSS/SCSS files
   - Extracts CSS variable documentation from comments
   - Identifies variable usage and fallback values
4. **Variant Generation**: Creates all permutations of props marked with `@renderVariants`
   - Limits to `maxPermutations` to avoid explosion
   - Uses sensible defaults for required props
5. **Metadata Generation**: Outputs comprehensive JSON files
   - Component metadata with props and descriptions
   - Variant examples with JSX code snippets
   - CSS variables with defaults

---

## Example Output

Running `npm run docs:build` with the Button component:

```
📦 Building documentation...

📖 Project: Documentor Reference Components
📂 Source: src/components/**/*.{tsx,jsx}
📁 Output: ./docs
🔗 Base URL: /

🔍 Scanning for components...
📄 Found 2 files matching src/components/**/*.{tsx,jsx}

📝 Parsing src/components/Button.tsx...
  🎨 Found 14 CSS variables in ./Button.module.scss
  ✨ Generated 3 variants
  💾 Saved metadata to docs/metadata/Button.json

📝 Parsing src/components/InputField.tsx...
  🎨 Found 18 CSS variables in ./InputField.module.scss
  ✨ Generated 12 variants
  💾 Saved metadata to docs/metadata/InputField.json

💾 Saved index to docs/metadata/index.json

✅ Build complete!
📄 Generated 2 component pages
📊 Total variants: 15
🎨 CSS variables: 32

📂 Output: /Users/you/project/docs
```

---

## Roadmap

### ✅ Phase 1: MVP (Complete)
- ✅ CLI tool with build command
- ✅ Component parser (TypeScript AST)
- ✅ Style parser (CSS variables)
- ✅ Variant generator
- ✅ JSON metadata generation
- ✅ File watching

### 🚧 Phase 2: Documentation Website (In Progress)
- [ ] React SPA for documentation
- [ ] Sidebar navigation
- [ ] Component pages with live previews
- [ ] Props table
- [ ] CSS variables table
- [ ] Variant showcase
- [ ] Code snippets with copy
- [ ] Search functionality

### 📋 Phase 3: CI/CD & Deployment
- [ ] Static HTML export
- [ ] GitHub Actions integration
- [ ] Deployment to hosting platforms
- [ ] Version management
- [ ] Test coverage integration

### 🎯 Phase 4: Advanced Features
- [ ] Interactive playground
- [ ] CSS variable editor
- [ ] Accessibility testing
- [ ] Visual regression testing
- [ ] AI-powered suggestions

---

## Troubleshooting

### Components not found

**Problem:** "No component found" warnings during build

**Solutions:**
- Ensure your component exports an interface named `ComponentNameProps`
- Check that the component is exported (default or named export)
- Verify file matches `source.include` patterns

### CSS variables not extracted

**Problem:** CSS variables not appearing in metadata

**Solutions:**
- Document variables in comments: `* --variable-name: Description`
- Use `var(--variable-name, default)` syntax for fallbacks
- Check that style file is imported in component

### Build errors with TypeScript

**Problem:** TypeScript compilation errors

**Solutions:**
- Install dependencies with `--legacy-peer-deps` flag
- Ensure TypeScript version compatibility
- Check `tsconfig.cli.json` for parser configuration

---

## Contributing

See [.claude/PROJECT.md](/.claude/PROJECT.md) for detailed project documentation and architecture.

---

## License

MIT
