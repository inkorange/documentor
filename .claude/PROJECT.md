# Documentor - Automated Component Documentation

## Project Vision

Documentor is an automated component documentation tool that eliminates the manual work required by Storybook. By intelligently parsing your existing React components, TypeScript interfaces, and stylesheets, Documentor automatically generates a comprehensive, interactive documentation website without requiring you to write stories, examples, or additional configuration files.

**Key Differentiator**: Zero-config automatic variant generation. If you've already built your components properly with TypeScript and JSDoc comments, Documentor does the rest.

## Project Objective

A Storybook competitor that:
- **Reads** existing component code (JSX/TSX) and style files (CSS/SCSS)
- **Extracts** TypeScript interfaces, prop types, default values, and JSDoc comments
- **Discovers** CSS variables and design tokens from stylesheet comments
- **Generates** all component variants automatically based on prop types
- **Builds** a fully navigable documentation website with zero manual story writing

The tool runs as a CLI script that crawls your component directories, analyzes the code, and serves a React-based documentation site.

## High Level Solution:

### Reference Implementation

**Important**: This project includes reference component examples in the `/src/components` directory that demonstrate the expected structure and annotation patterns for Documentor. These examples serve as:
- **Test cases** for parser development
- **Documentation references** for component structure
- **Real-world examples** of proper JSDoc and TypeScript usage

When building the parser and generator scripts, use these files as the primary input for testing and validation.

### Example: Button Component

Below is an example of a Button component located at [`/src/components/Button.tsx`](../src/components/Button.tsx) in this project:

We would read the Button.tsx files in a directory, and one would read like this:
```Typescript
import React from 'react';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /* Controls the display variant of the button component */
  /* renderVariants: true */
  variant?: ButtonVariant;
  /* content for the button text */
  children: React.ReactNode;
}

/**
 * Button component that supports multiple variants.
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const variantClass = styles[variant] || styles.primary;
  const buttonClasses = `${styles.button} ${variantClass} ${className}`.trim();

  return (
    <button className={buttonClasses} {...props}>
      {children}
    </button>
  );
};

export default Button;
```

This is the imported Button.module.scss file located at [`/src/components/Button.module.scss`](../src/components/Button.module.scss):
```SCSS
/**
  * CSS Variable Reference:
  * --primary-background-color: Primary button background color
  * --primary-background-hover-color: Primary button hover background color
  * --primary-background-active-color: Primary button active background color
  * --primary-text-color: Primary button text color
  * --secondary-background-color: Secondary button background color
  * --secondary-background-hover-color: Secondary button hover background color
  * --secondary-background-active-color: Secondary button active background color
  * --secondary-text-color: Secondary button text color
  * --outline-border-color: Outline button border color
  * --outline-text-color: Outline button text color
  * --outline-hover-background-color: Outline button hover background color
  * --outline-hover-text-color: Outline button hover text color
  * --outline-active-background-color: Outline button active background color
  * --focus-outline-color: Focus outline color for accessibility
  *
  * Styles for the Button component with support for multiple variants.
  */

.button {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-family: inherit;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--focus-outline-color, #0066cc);
    outline-offset: 2px;
  }
}
```

The script would extract the comment above the component declaration and use that as the description of the documentation, in this case: "Button component that supports multiple variants."

The script should also find the interface that is used on the exported component, ButtonProps in this case, and read the interface. It will extract from the interface section: A. the prop names, B. the prop type, and the possible values that can be used if an type is refernced. In this case, variant uses ButtonVariant, and the possible values of 'primary', 'secondary', and 'outline' would be presented. It will also extract out the description for each prop, the first one, "variant" will have a description of "Controls the display variant of the button component". This would be presented in table format on the generated page for reference.

The script will scan the file and if there are any referenced .css, or .scss files imported, it will scan them for any css variables, and build out a documentation section that lists each css variabler and description if it exists. In the example above, it would read the text: "CSS Variable Reference:", and grab the following css variable configurations:

```
  * --primary-background-color: Primary button background color
  * --primary-background-hover-color: Primary button hover background color
  * --primary-background-active-color: Primary button active background color
  * --primary-text-color: Primary button text color
  * --secondary-background-color: Secondary button background color
  * --secondary-background-hover-color: Secondary button hover background color
  * --secondary-background-active-color: Secondary button active background color
  * --secondary-text-color: Secondary button text color
  * --outline-border-color: Outline button border color
  * --outline-text-color: Outline button text color
  * --outline-hover-background-color: Outline button hover background color
  * --outline-hover-text-color: Outline button hover text color
  * --outline-active-background-color: Outline button active background color
  * --focus-outline-color: Focus outline color for accessibility
```

It would create a table that represents the "Design Tokens" via css variables, example:
the design token: --primary-background-color
the description: Primary button background color

The script will also build out a contact sheet of all the different variant/prop combinations, but only where the description above each interface object reads: "renderVariants: true", then it would render a version of the component in a sample like this:

```Typescript
<h3>Button component with variant as "primary"</h3>
<Button variant="primary" />
<h3>Button component with variant as "secondary"</h3>
<Button variant="secondary" />
<h3>Button component with variant as "outline"</h3>
<Button variant="outline" />
```

It will render these pages using ReactJS on an url path that matches the component location, without the /src folder in this project's case.

**Example URL Mapping:**
- Source file: `/src/components/Button.tsx`
- Documentation URL: `/components/Button`

Running the script will generate the static documentation page and serves the pages it create from a running application using a node server. There will be a homepage that would be an entry page to all component documentation.

There will be a menu on the left of all the components it has documented, and it will be rendered in sections similar to the folder structure:

```
Components
    Button <-- link to the Button documentation page
```

### Development Workflow

When developing Documentor:
1. **Use `/src/components` as test input**: Point the parser at this directory during development
2. **Validate against real examples**: Ensure the Button component and any other components in this directory parse correctly
3. **Test variant generation**: The Button component has `renderVariants: true` and should generate 3 variants (primary, secondary, outline)
4. **Test CSS variable extraction**: The Button.module.scss file should extract 14+ CSS variables with descriptions

## Technical Architecture

### Core Components

#### 1. **CLI Tool** (`documentor-cli`)
Command-line interface for running the documentation generation.

```bash
# Development mode with hot reload
npx documentor dev

# Build static documentation site
npx documentor build

# Serve built documentation
npx documentor serve
```

#### 2. **Parser Engine**
Responsible for extracting component metadata from source files.

**Component Parser:**
- Uses TypeScript Compiler API (`ts-morph` or `@typescript-eslint/parser`) to parse TSX/JSX files
- Extracts component exports, props interfaces, and JSDoc comments
- Identifies default prop values from destructuring or defaultProps
- Maps interface types to their union/enum values

**Style Parser:**
- Parses CSS/SCSS files using `postcss` or `sass` parser
- Extracts CSS variables from comment blocks
- Identifies variable usage and default values via fallbacks
- Maps style classes to component variants

**Test Coverage Analyzer:**
- Detects test files associated with each component (`.test.tsx`, `.spec.tsx`)
- Integrates with test coverage tools (Jest, Vitest, c8)
- Parses coverage reports (JSON, LCOV) to extract metrics
- Calculates per-component coverage percentages:
  - Statement coverage
  - Branch coverage
  - Function coverage
  - Line coverage
- Identifies untested functions and code paths
- Displays coverage badges and metrics in documentation

**Annotation Parser:**
- Reads special JSDoc tags for automation hints:
  - `@renderVariants` - Auto-generate all variant combinations
  - `@variantProp` - Specify which prop drives variants
  - `@exampleValue` - Override example values for props
  - `@hideInDocs` - Exclude internal props from documentation

#### 3. **Variant Generator**
Automatically creates component examples by:
- Identifying union types and enums (e.g., `'primary' | 'secondary' | 'outline'`)
- Generating all permutations for props marked with `renderVariants: true`
- Creating sensible default values for required props
- Handling boolean props (true/false states)
- Supporting array types with example data

#### 4. **Documentation Website** (React SPA)
A React application that renders the generated documentation.

**Features:**
- **Sidebar Navigation**: Tree structure matching component folders
- **Component Pages**: Individual pages per component showing:
  - Component description
  - Props table with types, defaults, and descriptions
  - Design tokens (CSS variables) table
  - **Test coverage metrics with visual indicators**
  - **Coverage breakdown (statements, branches, functions, lines)**
  - Live variant examples with code snippets
  - Copy-to-clipboard for code examples
- **Search**: Full-text search across all components
- **Theme Support**: Light/dark mode, customizable design tokens
- **Responsive Design**: Mobile-friendly documentation
- **Coverage Dashboard**: Aggregated test coverage statistics across all components

#### 5. **Development Server**
Node.js server with:
- Hot module reloading for component changes
- File watcher for automatic re-parsing
- WebSocket connection for live updates
- Static asset serving

### Data Flow

```
Source Files → Parser Engine → JSON Metadata → React App → Documentation Website
    ↓              ↓               ↓              ↓            ↓
.tsx/.jsx     TypeScript AST   component.json   Renderer   HTML Pages
.scss/.css    CSS AST          styles.json      Router
              JSDoc            variants.json    Components
```

### File Structure

```
documentor/
├── src/                      # Reference component examples (TEST INPUT)
│   └── components/
│       ├── Button.tsx        # Reference Button component with annotations
│       └── Button.module.scss # Reference styles with CSS variables
├── cli/                      # CLI tool
│   ├── commands/
│   │   ├── dev.ts           # Development server
│   │   ├── build.ts         # Build static site
│   │   └── serve.ts         # Serve built site
│   └── index.ts
├── parser/                   # Parser engine (reads /src/components)
│   ├── component-parser.ts  # Parse React components
│   ├── style-parser.ts      # Parse CSS/SCSS
│   ├── type-resolver.ts     # Resolve TypeScript types
│   ├── coverage-parser.ts   # Parse test coverage reports
│   └── annotation-parser.ts # Parse JSDoc annotations
├── generator/                # Variant generation
│   ├── variant-generator.ts # Generate component variants
│   ├── example-builder.ts   # Build code examples
│   └── permutation.ts       # Create prop combinations
├── website/                  # Documentation React app
│   ├── src/
│   │   ├── components/
│   │   │   ├── ComponentPage.tsx
│   │   │   ├── PropsTable.tsx
│   │   │   ├── VariantShowcase.tsx
│   │   │   ├── DesignTokens.tsx
│   │   │   ├── CoverageBadge.tsx # Test coverage display
│   │   │   └── Sidebar.tsx
│   │   ├── pages/
│   │   │   └── CoverageDashboard.tsx # Coverage overview
│   │   ├── utils/
│   │   └── App.tsx
│   └── public/
├── server/                   # Dev server
│   ├── watcher.ts           # File watching
│   ├── websocket.ts         # Live reload
│   └── server.ts
└── config/                   # Configuration
    └── schema.ts            # Config file schema
```

**Important Notes:**
- `/src/components` contains reference implementations used for parser testing
- The Button component demonstrates all key features: variants, props, CSS variables
- During development, run parser against `/src/components` to validate functionality

## Configuration File

### `documentor.config.json`

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
    "baseUrl": "/",
    "staticAssets": "./public"
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

  "coverage": {
    "enabled": true,
    "testPatterns": ["**/*.test.{tsx,ts,jsx,js}", "**/*.spec.{tsx,ts,jsx,js}"],
    "coverageReportPath": "./coverage/coverage-final.json",
    "thresholds": {
      "statements": 80,
      "branches": 80,
      "functions": 80,
      "lines": 80
    },
    "displayInSidebar": true,
    "badgeStyle": "flat"
  },

  "features": {
    "search": true,
    "darkMode": true,
    "codeSnippets": true,
    "playground": false,
    "testCoverage": true
  }
}
```

## Test Coverage Integration

### Overview

Documentor automatically analyzes and displays test coverage metrics for each component, providing transparency about component quality and test completeness. This feature integrates seamlessly with existing testing frameworks without requiring additional configuration.

### How It Works

1. **Test Detection**: Automatically finds test files associated with each component using configurable patterns
2. **Coverage Analysis**: Parses coverage reports generated by your test runner (Jest, Vitest, c8)
3. **Metric Extraction**: Calculates per-component coverage percentages
4. **Visual Display**: Shows coverage badges and detailed breakdowns in the documentation

### Supported Test Frameworks

- **Jest** (with `jest-coverage-report`)
- **Vitest** (with built-in coverage)
- **c8** (for Node.js coverage)
- **Istanbul/nyc** (coverage report formats)

### Coverage Metrics Tracked

For each component, Documentor displays:

1. **Statement Coverage**: Percentage of code statements executed during tests
2. **Branch Coverage**: Percentage of conditional branches tested
3. **Function Coverage**: Percentage of functions called during tests
4. **Line Coverage**: Percentage of code lines executed
5. **Overall Coverage**: Weighted average of all metrics

### Configuration

```json
{
  "coverage": {
    "enabled": true,
    "testPatterns": [
      "**/*.test.{tsx,ts,jsx,js}",
      "**/*.spec.{tsx,ts,jsx,js}"
    ],
    "coverageReportPath": "./coverage/coverage-final.json",
    "coverageFormat": "json",  // "json", "lcov", "clover"
    "thresholds": {
      "statements": 80,
      "branches": 80,
      "functions": 80,
      "lines": 80
    },
    "displayInSidebar": true,
    "badgeStyle": "flat",  // "flat", "flat-square", "plastic"
    "colors": {
      "excellent": "#44cc11",  // >= 90%
      "good": "#97ca00",       // >= 80%
      "moderate": "#dfb317",   // >= 60%
      "low": "#fe7d37",        // >= 40%
      "poor": "#e05d44"        // < 40%
    }
  }
}
```

### Coverage Report Generation

Documentor expects coverage reports in standard formats. Generate them using your test runner:

#### Jest
```json
{
  "scripts": {
    "test:coverage": "jest --coverage --coverageReporters=json"
  }
}
```

#### Vitest
```json
{
  "scripts": {
    "test:coverage": "vitest run --coverage --coverage.reporter=json"
  }
}
```

### Documentation Display

#### Coverage Badge

Each component page displays a coverage badge at the top:

```
┌─────────────────────────────┐
│ Test Coverage: 94.3% ████▌  │
└─────────────────────────────┘
```

Color-coded based on thresholds:
- 🟢 Green (Excellent): ≥ 90%
- 🟡 Yellow-Green (Good): 80-89%
- 🟠 Orange (Moderate): 60-79%
- 🔴 Red (Low): < 60%

#### Detailed Breakdown

Below the badge, a detailed table shows:

| Metric      | Coverage | Status |
|-------------|----------|--------|
| Statements  | 95.5%    | ✅     |
| Branches    | 87.5%    | ✅     |
| Functions   | 100%     | ✅     |
| Lines       | 94.2%    | ✅     |

#### Sidebar Indicators

Optional coverage percentage display next to component names in the sidebar:

```
Components
  ├─ Button (94%) ✅
  ├─ Input (76%) ⚠️
  └─ Modal (45%) ❌
```

### Coverage Dashboard

A dedicated dashboard page shows aggregated coverage across all components:

- **Overall Project Coverage**: Average coverage across all components
- **Coverage Distribution Chart**: Visual breakdown of coverage levels
- **Component Rankings**: Sorted list by coverage percentage
- **Trending**: Coverage changes over time (requires historical data)
- **Uncovered Components**: List of components without tests

### Integration with CI/CD

#### Automatic Coverage Updates

```yaml
# GitHub Actions example
- name: Run tests with coverage
  run: npm run test:coverage

- name: Build documentation with coverage
  run: npx documentor build
  env:
    COVERAGE_REPORT: ./coverage/coverage-final.json
```

#### Coverage Enforcement

Set minimum coverage thresholds that fail the build:

```json
{
  "coverage": {
    "enforceThresholds": true,
    "failOnBelowThreshold": true,
    "thresholds": {
      "statements": 80,
      "branches": 75,
      "functions": 80,
      "lines": 80
    }
  }
}
```

### Coverage History Tracking

Track coverage trends over time:

```json
{
  "coverage": {
    "history": {
      "enabled": true,
      "storageDir": "./.documentor/coverage-history",
      "retentionDays": 90
    }
  }
}
```

Displays:
- Coverage trend graphs
- Improvement/regression indicators
- Historical comparison

### Advanced Features

#### Uncovered Code Highlighting

Shows which lines/branches aren't covered in tests:

```typescript
// ✅ Covered
export const add = (a: number, b: number) => a + b;

// ❌ Not covered
export const subtract = (a: number, b: number) => a - b;
```

#### Test File Links

Direct links from component documentation to test files:

```
Tests: src/components/Button.test.tsx
Coverage Report: View detailed report →
```

#### Coverage Annotations

Add coverage targets directly in components:

```typescript
/**
 * Button component with multiple variants
 * @coverageTarget 95
 */
export const Button = () => { /* ... */ };
```

### Example Output

For a component with good coverage:

```json
{
  "testCoverage": {
    "enabled": true,
    "testFile": "src/components/Button.test.tsx",
    "coverage": {
      "statements": 95.5,
      "branches": 87.5,
      "functions": 100,
      "lines": 94.2
    },
    "overallCoverage": 94.3,
    "status": "excellent",
    "meetsThreshold": true,
    "lastUpdated": "2025-12-09T13:30:00Z",
    "uncoveredLines": [42, 87, 103],
    "uncoveredBranches": [
      { "line": 65, "branch": "else" }
    ]
  }
}
```

### Benefits

1. **Quality Visibility**: Immediate insight into test completeness
2. **Accountability**: Encourages writing comprehensive tests
3. **Confidence**: Users can see which components are well-tested
4. **Maintenance**: Identifies components needing test attention
5. **Trend Tracking**: Monitor coverage improvements over time

## Key Features & Differentiators

### vs. Storybook

| Feature | Storybook | Documentor |
|---------|-----------|------------|
| **Setup Time** | Manual story files for each component | Zero config - reads existing code |
| **Maintenance** | Update stories when props change | Automatic - updates with code changes |
| **Variant Generation** | Write each variant manually | Automatic from TypeScript types |
| **Learning Curve** | Steep - learn story syntax, decorators, etc. | Minimal - just write good TypeScript |
| **Documentation Source** | Separate story files | JSDoc comments in components |
| **Design Tokens** | Manual documentation | Auto-extracted from CSS variables |
| **Test Coverage** | Requires addon | Built-in with automatic detection |
| **Bundle Size** | Large (webpack, addons, etc.) | Lightweight parser + React SPA |

### Unique Features

1. **Smart Variant Detection**: Automatically generates all valid prop combinations
2. **CSS Variable Extraction**: Documents design tokens directly from stylesheets
3. **Type-Driven Examples**: Uses TypeScript types to create realistic examples
4. **Zero Story Files**: No additional files to maintain
5. **Built-in Test Coverage**: Automatic coverage analysis and visualization
6. **Coverage Dashboard**: Project-wide coverage metrics and trending
7. **Lightning Fast**: Optimized parser with incremental updates
8. **Component Playground** (future): Live editing with CSS variable overrides

## Automation Annotations

### Special JSDoc Tags

Components can use special annotations to control documentation behavior:

```typescript
export interface ButtonProps {
  /**
   * Controls the display variant of the button component
   * @renderVariants true
   */
  variant?: ButtonVariant;

  /**
   * Button size
   * @renderVariants true
   * @exampleValue "medium"
   */
  size?: 'small' | 'medium' | 'large';

  /**
   * Internal prop for testing
   * @hideInDocs
   */
  _testId?: string;

  /**
   * Click handler
   * @exampleValue () => alert('Clicked!')
   */
  onClick?: () => void;
}
```

### Style File Annotations

CSS/SCSS files can document design tokens in comments:

```scss
/**
 * Design Tokens for Button Component
 *
 * @cssvar --primary-background-color: Primary button background color
 * @cssvar --primary-text-color: Text color for primary buttons
 * @default --primary-background-color: #0066cc
 * @default --primary-text-color: #ffffff
 */
```

## Parsing Examples

### Example Input (Button.tsx)

```typescript
export type ButtonVariant = 'primary' | 'secondary' | 'outline';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Controls the display variant of the button component
   * @renderVariants true
   */
  variant?: ButtonVariant;

  /**
   * Size of the button
   * @renderVariants true
   */
  size?: ButtonSize;

  /** Button content */
  children: React.ReactNode;
}

/**
 * Button component that supports multiple variants and sizes.
 * @example
 * <Button variant="primary" size="medium">Click Me</Button>
 */
const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  children,
  ...props
}) => { /* ... */ };
```

### Generated Output (Metadata JSON)

```json
{
  "name": "Button",
  "description": "Button component that supports multiple variants and sizes.",
  "filePath": "src/components/Button.tsx",
  "props": {
    "variant": {
      "type": "ButtonVariant",
      "values": ["primary", "secondary", "outline"],
      "optional": true,
      "default": "primary",
      "description": "Controls the display variant of the button component",
      "renderVariants": true
    },
    "size": {
      "type": "ButtonSize",
      "values": ["small", "medium", "large"],
      "optional": true,
      "default": "medium",
      "description": "Size of the button",
      "renderVariants": true
    },
    "children": {
      "type": "React.ReactNode",
      "optional": false,
      "description": "Button content"
    }
  },
  "variants": [
    { "variant": "primary", "size": "small", "children": "Button Text" },
    { "variant": "primary", "size": "medium", "children": "Button Text" },
    { "variant": "primary", "size": "large", "children": "Button Text" },
    { "variant": "secondary", "size": "small", "children": "Button Text" },
    { "variant": "secondary", "size": "medium", "children": "Button Text" },
    { "variant": "secondary", "size": "large", "children": "Button Text" },
    { "variant": "outline", "size": "small", "children": "Button Text" },
    { "variant": "outline", "size": "medium", "children": "Button Text" },
    { "variant": "outline", "size": "large", "children": "Button Text" }
  ],
  "styleFiles": ["Button.module.scss"],
  "cssVariables": [
    {
      "name": "--primary-background-color",
      "description": "Primary button background color",
      "default": "#0066cc"
    }
  ],
  "testCoverage": {
    "enabled": true,
    "testFile": "src/components/Button.test.tsx",
    "coverage": {
      "statements": 95.5,
      "branches": 87.5,
      "functions": 100,
      "lines": 94.2
    },
    "overallCoverage": 94.3,
    "lastUpdated": "2025-12-09T13:30:00Z"
  }
}
```

## Roadmap

**Note**: All parser and generator development should use the reference components in [`/src/components`](../src/components/) as test cases. The Button component serves as the primary reference implementation.

### Phase 1: MVP (Current)
- ✅ Basic component parsing
- ✅ Props table generation
- ✅ Simple variant rendering
- ✅ CSS variable extraction
- ✅ Reference Button component created at `/src/components/Button.tsx`
- [ ] CLI tool implementation
- [ ] Parser engine that can read `/src/components/Button.tsx`
- [ ] Style parser that can extract CSS variables from `/src/components/Button.module.scss`
- [ ] Basic React documentation website
- [ ] Dev server with file watching

### Phase 2: Enhanced Automation
- [ ] Advanced variant generation with permutations
- [ ] Intelligent default value inference
- [ ] Support for compound components
- [ ] Component composition detection
- [ ] Enhanced JSDoc tag support
- [ ] Search functionality
- [ ] **Test coverage integration and reporting**
- [ ] **Coverage badge generation**

### Phase 3: Developer Experience & CI/CD
- [ ] Live component playground
- [ ] CSS variable editor with real-time preview
- [ ] Code snippet copy with syntax highlighting
- [ ] Accessibility testing integration
- [ ] Visual regression testing
- [ ] **Static HTML export and build optimization**
- [ ] **GitHub Actions integration**
- [ ] **CI/CD pipeline templates**
- [ ] **Automated deployment to hosting platforms**

### Phase 4: Advanced Features
- [ ] Multi-project support (monorepos)
- [ ] Version history and changelog generation
- [ ] Component usage analytics
- [ ] AI-powered documentation suggestions
- [ ] Figma integration for design tokens
- [ ] Custom documentation pages (MDX support)

### Phase 5: Dynamic Theming & Token Management

**Objective**: Enable real-time design token manipulation and theme switching in the documentation website, allowing users to experiment with different token values and swap complete theme files to preview how components respond to different design systems.

#### Core Features

##### 1. Real-Time Token Editor

**Interactive CSS Variable Editor:**
- Live editing of CSS variable values directly in the documentation UI
- Visual editors for different token types:
  - **Color picker** for color variables (with hex, RGB, HSL support)
  - **Slider controls** for spacing, sizing, and numeric values
  - **Dropdown selectors** for font families, weights, and predefined scales
  - **Text input** for custom values
- Changes apply instantly to all component previews
- **Reset to defaults** button per variable or globally
- **Copy current state** as CSS to clipboard

**Token Organization:**
- Group tokens by category:
  - Colors (primary, secondary, semantic)
  - Typography (fonts, sizes, weights, line heights)
  - Spacing (padding, margin, gaps)
  - Borders (radius, width, style)
  - Shadows
  - Transitions/animations
- Collapsible sections for better organization
- Search/filter tokens by name or category

##### 2. Theme File System

**Theme Configuration:**
```json
{
  "themes": {
    "enabled": true,
    "defaultTheme": "default",
    "themeDirectory": "./themes",
    "allowCustomUpload": true
  }
}
```

**Theme File Structure:**
Users can provide one or more theme files (CSS or SCSS) that define CSS variable overrides:

```
project/
├── themes/
│   ├── default.css          # Default theme
│   ├── dark-mode.css        # Dark theme
│   ├── high-contrast.css    # Accessibility theme
│   └── brand-acme.css       # Customer brand theme
└── documentor.config.json
```

**Example Theme File (`themes/dark-mode.css`):**
```css
/**
 * Dark Mode Theme
 * Overrides default design tokens for dark mode experience
 */

:root {
  /* Colors */
  --primary-color: #3b82f6;
  --background-color: #1f2937;
  --text-color: #f9fafb;
  --border-color: #374151;

  /* Component-specific */
  --button-primary-bg: #3b82f6;
  --button-primary-text: #ffffff;
  --input-background: #374151;
  --input-border: #4b5563;
}
```

##### 3. Theme Switcher UI

**Documentation Site Theme Selector:**
- **Theme dropdown** in the documentation header/sidebar
- **Preview mode**: Switch themes and see all components update instantly
- **Compare mode**: View components side-by-side with different themes
- **Theme metadata display**:
  - Theme name and description
  - Author information
  - Number of tokens overridden
  - Last modified date

**Theme Switcher Component:**
```typescript
interface ThemeSwitcherProps {
  availableThemes: Theme[];
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

interface Theme {
  id: string;
  name: string;
  description?: string;
  filePath: string;
  tokens: Record<string, string>;
  metadata?: {
    author?: string;
    version?: string;
    lastModified?: string;
  };
}
```

##### 4. Dynamic Theme Loading

**Theme Parser:**
- Scan `themeDirectory` for CSS/SCSS files
- Parse and extract CSS variable declarations
- Generate theme metadata index
- Validate theme files for required tokens
- Hot-reload themes during development

**Runtime Theme Application:**
```typescript
// Theme application logic
function applyTheme(theme: Theme) {
  const root = document.documentElement;

  // Apply each token override
  Object.entries(theme.tokens).forEach(([variable, value]) => {
    root.style.setProperty(variable, value);
  });

  // Store current theme in localStorage
  localStorage.setItem('documentor-theme', theme.id);
}
```

##### 5. Custom Theme Upload (Optional)

**In-Browser Theme Testing:**
- **Upload button** to load custom theme CSS files
- **Drag-and-drop** interface for theme files
- **Validation** to ensure proper CSS variable format
- **Temporary application** (doesn't persist on reload)
- **Export modified tokens** as new theme file

**Upload Flow:**
1. User selects/drags theme CSS file
2. Parser extracts CSS variables
3. Preview shows affected tokens
4. User confirms application
5. Theme applies to all components
6. Option to download modified theme

##### 6. Token Diff & Comparison

**Visual Token Comparison:**
- **Diff view** comparing current theme vs. default theme
- **Highlight changes**: Show which tokens are overridden
- **Impact analysis**: List components affected by each token
- **Conflict detection**: Warn about missing or invalid token values

**Comparison Table:**
```
Token Name              | Default Value | Current Theme | Status
------------------------|---------------|---------------|--------
--primary-color         | #0066cc       | #3b82f6      | Modified
--background-color      | #ffffff       | #1f2937      | Modified
--text-color            | #1f2937       | #f9fafb      | Modified
--border-radius         | 0.375rem      | 0.375rem     | Unchanged
```

##### 7. Token Presets & Collections

**Quick Theme Presets:**
- **Material Design** token preset
- **Tailwind CSS** token preset
- **Bootstrap** token preset
- **Custom presets** defined in config

**Preset Configuration:**
```json
{
  "themes": {
    "presets": [
      {
        "name": "Material Design",
        "tokens": {
          "--primary-color": "#1976d2",
          "--secondary-color": "#dc004e",
          "--border-radius": "4px"
        }
      }
    ]
  }
}
```

#### Implementation Architecture

##### Token State Management

**React Context for Theme State:**
```typescript
interface ThemeContextValue {
  currentTheme: Theme;
  availableThemes: Theme[];
  customTokens: Record<string, string>;
  setTheme: (themeId: string) => void;
  updateToken: (variable: string, value: string) => void;
  resetToken: (variable: string) => void;
  resetAllTokens: () => void;
  exportTheme: () => string;
}

const ThemeContext = createContext<ThemeContextValue>(null);
```

**Token Override Layer:**
```typescript
// Priority: Custom Edits > Selected Theme > Component Defaults
function resolveTokenValue(variable: string): string {
  return (
    customTokens[variable] ||        // User edits
    currentTheme.tokens[variable] ||  // Active theme
    defaultTokens[variable]           // Component default
  );
}
```

##### Component Architecture

**New Components:**
1. **`ThemeSwitcher.tsx`** - Theme dropdown selector
2. **`TokenEditor.tsx`** - Real-time token editing panel
3. **`ColorPicker.tsx`** - Color input with visual picker
4. **`TokenDiff.tsx`** - Theme comparison view
5. **`ThemeUpload.tsx`** - Custom theme file upload
6. **`TokenInspector.tsx`** - Inspect tokens used by component

**Enhanced ComponentPage:**
```typescript
<ComponentPage>
  <ComponentHeader />

  {/* New: Token Controls */}
  <TokenControls
    componentsTokens={extractedTokens}
    onTokenChange={handleTokenUpdate}
  />

  {/* Existing: Component Details */}
  <PropsTable />
  <VariantShowcase />
  <CSSVariablesTable />
</ComponentPage>
```

##### CLI Enhancements

**Theme Discovery:**
```bash
# Scan for theme files
documentor scan-themes --directory ./themes

# Validate theme file
documentor validate-theme ./themes/custom.css

# Generate theme template
documentor create-theme --name "My Theme" --output ./themes/my-theme.css
```

**Build with Themes:**
```bash
# Build with specific theme as default
documentor build --default-theme dark-mode

# Generate documentation for all themes
documentor build --all-themes
```

#### Configuration Schema Updates

```json
{
  "themes": {
    "enabled": true,
    "defaultTheme": "default",
    "themeDirectory": "./themes",
    "allowCustomUpload": true,
    "allowTokenEditing": true,

    "presets": [
      {
        "name": "Material Design",
        "description": "Google Material Design tokens",
        "tokens": { /* ... */ }
      }
    ],

    "categories": [
      {
        "name": "Colors",
        "tokenPattern": "--*-color",
        "editor": "color-picker"
      },
      {
        "name": "Spacing",
        "tokenPattern": "--spacing-*",
        "editor": "slider",
        "min": "0",
        "max": "4rem",
        "step": "0.25rem"
      }
    ]
  }
}
```

#### User Workflows

**Workflow 1: Theme Switching**
1. User opens documentation site
2. Clicks theme selector in header
3. Selects "Dark Mode" from dropdown
4. All components update instantly with dark theme tokens
5. User browses components to verify dark mode appearance

**Workflow 2: Token Experimentation**
1. User navigates to Button component page
2. Opens "Design Tokens" panel
3. Clicks on `--button-primary-bg` color swatch
4. Adjusts color using picker
5. Sees Button preview update in real-time
6. Clicks "Copy Theme" to export custom token values

**Workflow 3: Custom Theme Upload**
1. Designer creates `brand.css` with company colors
2. User drags `brand.css` into documentation site
3. System parses and validates CSS variables
4. Preview shows which components are affected
5. User applies theme to see branded components
6. User downloads generated theme file for production use

#### Technical Implementation Details

##### Theme File Parser

**CSS Variable Extraction:**
```typescript
async function parseThemeFile(filePath: string): Promise<Theme> {
  const content = await fs.readFile(filePath, 'utf-8');

  // Extract CSS variables using PostCSS
  const ast = postcss.parse(content);
  const tokens: Record<string, string> = {};

  ast.walkDecls(decl => {
    if (decl.prop.startsWith('--')) {
      tokens[decl.prop] = decl.value;
    }
  });

  // Extract theme metadata from comments
  const metadata = extractMetadata(content);

  return {
    id: path.basename(filePath, '.css'),
    name: metadata.name || path.basename(filePath, '.css'),
    description: metadata.description,
    filePath,
    tokens,
    metadata
  };
}
```

##### Live Preview Updates

**Component Re-rendering:**
```typescript
function ComponentPreview({ component, variant }) {
  const { customTokens } = useTheme();

  // Apply custom tokens to preview container
  const style = useMemo(() => {
    return Object.entries(customTokens).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {} as React.CSSProperties);
  }, [customTokens]);

  return (
    <div className="preview-container" style={style}>
      {/* Component renders with updated tokens */}
      <DynamicComponent {...variant.props} />
    </div>
  );
}
```

##### Token Editor UI

**Color Token Editor:**
```typescript
function ColorTokenEditor({ variable, value, onChange }) {
  return (
    <div className="token-editor">
      <label>{variable}</label>

      <div className="color-controls">
        {/* Color swatch */}
        <div
          className="color-swatch"
          style={{ backgroundColor: value }}
          onClick={openColorPicker}
        />

        {/* Hex input */}
        <input
          type="text"
          value={value}
          onChange={e => onChange(variable, e.target.value)}
        />

        {/* Color picker popover */}
        {showPicker && (
          <ColorPicker
            color={value}
            onChange={color => onChange(variable, color)}
          />
        )}
      </div>
    </div>
  );
}
```

#### Data Flow

```
1. Theme Discovery (Build Time)
   └─> Scan themeDirectory for CSS files
   └─> Parse each file to extract tokens
   └─> Generate themes index JSON
   └─> Include in website build

2. Theme Selection (Runtime)
   └─> User selects theme from dropdown
   └─> Load theme tokens from index
   └─> Apply to document root CSS variables
   └─> Update all component previews

3. Token Editing (Runtime)
   └─> User modifies token in editor
   └─> Update ThemeContext state
   └─> Apply custom override to document root
   └─> Component previews re-render with new value

4. Theme Export
   └─> Collect current token overrides
   └─> Generate CSS file with variables
   └─> Trigger download of tokens.css
```

#### Example Use Cases

**Use Case 1: Design System Migration**
A company migrating from Bootstrap to Tailwind can:
1. Load Bootstrap theme (existing tokens)
2. Create Tailwind theme (target tokens)
3. Compare side-by-side
4. Gradually migrate components
5. Export final Tailwind token file

**Use Case 2: Accessibility Testing**
QA team can:
1. Load high-contrast theme
2. Verify all components meet WCAG standards
3. Test with different color combinations
4. Export accessible theme for production

**Use Case 3: White-Label Products**
SaaS companies can:
1. Provide base component library
2. Customers upload their brand tokens
3. Preview customized components
4. Download branded theme file
5. Integrate into their application

#### Deliverables

**Phase 5 Completion Checklist:**
- [ ] Theme file parser and validator
- [ ] Theme discovery and indexing system
- [ ] ThemeSwitcher UI component
- [ ] TokenEditor panel with category support
- [ ] Color picker for color tokens
- [ ] Slider controls for numeric tokens
- [ ] Real-time preview updates
- [ ] Theme comparison/diff view
- [ ] Custom theme upload functionality
- [ ] Export current theme as CSS
- [ ] Theme presets (Material, Tailwind, Bootstrap)
- [ ] localStorage persistence for theme preference
- [ ] Documentation for theme file format
- [ ] CLI commands for theme management
- [ ] Updated README with theming guide

### Phase 6: Interactive Props Playground

**Objective**: Enable real-time prop manipulation directly in the documentation website, allowing users to interactively change component prop values and see live updates in the preview. This creates an interactive playground experience where developers can experiment with different prop combinations without writing code.

#### Core Features

##### 1. Interactive Props Table

**Enhanced Props Table with Live Controls:**
Transform the existing read-only props table into an interactive control panel where each prop has an appropriate input control based on its type.

**Prop Control Types:**

| Prop Type | Control Type | Description |
|-----------|--------------|-------------|
| `'value1' \| 'value2' \| 'value3'` | **Select Dropdown** | Dropdown menu with all union type options |
| `string` | **Text Input** | Free-form text input field |
| `number` | **Number Input** | Numeric input with step controls |
| `boolean` | **Toggle Switch** | On/off toggle or checkbox |
| `React.ReactNode` (children) | **Textarea** | Multi-line text area for content |
| Array types | **Array Editor** | Add/remove items interface |
| Object types | **JSON Editor** | Code editor for object values |

**Interactive Table Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Prop          │ Type        │ Current Value    │ Control       │
├─────────────────────────────────────────────────────────────────┤
│ variant *     │ ButtonVar.. │ primary          │ [▼ Dropdown]  │
│ size          │ ButtonSize  │ medium           │ [▼ Dropdown]  │
│ disabled      │ boolean     │ false            │ [○ Toggle]    │
│ children      │ ReactNode   │ Button Text      │ [Text Input]  │
│ onClick       │ function    │ (not editable)   │ -             │
└─────────────────────────────────────────────────────────────────┘
```

##### 2. Live Preview Synchronization

**Real-Time Component Updates:**
- Component preview updates instantly as props change
- Maintains preview state while editing
- Shows loading indicator during complex renders
- Debouncing for text inputs to prevent excessive re-renders

**Preview State Management:**
```typescript
interface PlaygroundState {
  currentProps: Record<string, any>;
  previewMode: 'live' | 'paused';
  history: PropChange[];
  isDirty: boolean;
}

interface PropChange {
  propName: string;
  oldValue: any;
  newValue: any;
  timestamp: number;
}
```

##### 3. Prop Control Components

**Dropdown Control (for Union Types):**
```typescript
interface PropDropdownProps {
  propName: string;
  propMeta: PropMetadata;
  currentValue: string;
  onChange: (propName: string, value: string) => void;
}

function PropDropdown({ propName, propMeta, currentValue, onChange }) {
  return (
    <select
      value={currentValue}
      onChange={e => onChange(propName, e.target.value)}
      className="prop-control-dropdown"
    >
      {propMeta.values?.map(value => (
        <option key={value} value={value}>
          {value}
        </option>
      ))}
    </select>
  );
}
```

**Text Input Control (for Strings):**
```typescript
function PropTextInput({ propName, propMeta, currentValue, onChange }) {
  const [localValue, setLocalValue] = useState(currentValue);

  // Debounce onChange to prevent excessive updates
  const debouncedOnChange = useMemo(
    () => debounce((value) => onChange(propName, value), 300),
    [propName, onChange]
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    debouncedOnChange(e.target.value);
  };

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      placeholder={propMeta.exampleValue || propMeta.default || 'Enter value'}
      className="prop-control-text"
    />
  );
}
```

**Toggle Control (for Booleans):**
```typescript
function PropToggle({ propName, currentValue, onChange }) {
  return (
    <label className="prop-control-toggle">
      <input
        type="checkbox"
        checked={currentValue}
        onChange={e => onChange(propName, e.target.checked)}
      />
      <span className="toggle-slider" />
    </label>
  );
}
```

**Number Input Control:**
```typescript
function PropNumberInput({ propName, propMeta, currentValue, onChange }) {
  return (
    <input
      type="number"
      value={currentValue}
      onChange={e => onChange(propName, Number(e.target.value))}
      step={propMeta.step || 1}
      min={propMeta.min}
      max={propMeta.max}
      className="prop-control-number"
    />
  );
}
```

##### 4. Playground Modes

**Interactive Mode:**
- Default mode with live prop editing
- Preview updates in real-time
- Props table shows current values with controls

**Code-First Mode:**
- JSX code editor for manual prop editing
- Syntax highlighting and validation
- Apply button to update preview

**Split View Mode:**
- Side-by-side props controls and preview
- Larger preview area for complex components
- Collapsible controls panel

##### 5. Prop State Management

**Playground Context:**
```typescript
interface PlaygroundContextValue {
  currentProps: Record<string, any>;
  updateProp: (propName: string, value: any) => void;
  resetProp: (propName: string) => void;
  resetAllProps: () => void;
  previewMode: 'live' | 'paused';
  setPreviewMode: (mode: 'live' | 'paused') => void;
  exportCode: () => string;
}

const PlaygroundContext = createContext<PlaygroundContextValue>(null);
```

**Prop Resolution Strategy:**
```typescript
function resolveCurrentPropValue(
  propName: string,
  userValue: any,
  defaultValue: any,
  isOptional: boolean
): any {
  // Priority: User Edit > Default > Type Default
  if (userValue !== undefined) return userValue;
  if (defaultValue !== undefined) return defaultValue;
  if (!isOptional) return getTypeDefaultValue(propMeta.type);
  return undefined;
}
```

##### 6. Enhanced Component Preview

**Live Preview Component:**
```typescript
function LiveComponentPreview({
  component,
  playgroundProps
}: LiveComponentPreviewProps) {
  const [error, setError] = useState<Error | null>(null);

  // Error boundary for prop validation errors
  useEffect(() => {
    setError(null);
  }, [playgroundProps]);

  if (error) {
    return (
      <div className="preview-error">
        <h4>Preview Error</h4>
        <p>{error.message}</p>
        <button onClick={() => setError(null)}>Reset</button>
      </div>
    );
  }

  return (
    <ErrorBoundary onError={setError}>
      <div className="live-preview-container">
        <DynamicComponent
          component={component.name}
          {...playgroundProps}
        />
      </div>
    </ErrorBoundary>
  );
}
```

##### 7. Code Generation & Export

**Live Code Display:**
- Shows JSX code for current prop configuration
- Updates as props change
- Copy-to-clipboard functionality
- Syntax highlighting

**Generated Code Example:**
```jsx
// User adjusts props:
// variant: 'secondary'
// size: 'large'
// disabled: true

// Generated code updates to:
<Button
  variant="secondary"
  size="large"
  disabled={true}
>
  Button Text
</Button>
```

**Export Options:**
- Copy JSX snippet
- Copy with imports
- Download as component file
- Share as URL (props encoded in query params)

##### 8. Prop Validation & Constraints

**Real-Time Validation:**
```typescript
interface PropValidator {
  validate: (value: any) => ValidationResult;
  errorMessage?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Example validators
const validators: Record<string, PropValidator> = {
  email: {
    validate: (value: string) => ({
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      error: 'Invalid email format'
    })
  },
  url: {
    validate: (value: string) => ({
      valid: /^https?:\/\/.+/.test(value),
      error: 'Invalid URL format'
    })
  }
};
```

**Constraint Enforcement:**
- Min/max values for numbers
- String length limits
- Allowed values for enums
- Required prop indicators
- Type coercion warnings

##### 9. Preset Prop Combinations

**Save & Load Presets:**
```typescript
interface PropPreset {
  id: string;
  name: string;
  description?: string;
  props: Record<string, any>;
  createdAt: string;
}

// Example presets
const presets: PropPreset[] = [
  {
    id: 'default',
    name: 'Default',
    props: { variant: 'primary', size: 'medium' }
  },
  {
    id: 'large-secondary',
    name: 'Large Secondary',
    props: { variant: 'secondary', size: 'large' }
  },
  {
    id: 'disabled-state',
    name: 'Disabled State',
    props: { variant: 'primary', disabled: true }
  }
];
```

**Preset Management:**
- Load predefined presets
- Save current prop state as custom preset
- Share presets via URL
- Import/export preset collections

##### 10. Prop History & Undo/Redo

**Change History Tracking:**
```typescript
interface PropHistory {
  changes: PropChange[];
  currentIndex: number;
}

function usePropHistory() {
  const [history, setHistory] = useState<PropHistory>({
    changes: [],
    currentIndex: -1
  });

  const undo = () => {
    if (history.currentIndex > 0) {
      const previousChange = history.changes[history.currentIndex - 1];
      applyChange(previousChange);
      setHistory(prev => ({
        ...prev,
        currentIndex: prev.currentIndex - 1
      }));
    }
  };

  const redo = () => {
    if (history.currentIndex < history.changes.length - 1) {
      const nextChange = history.changes[history.currentIndex + 1];
      applyChange(nextChange);
      setHistory(prev => ({
        ...prev,
        currentIndex: prev.currentIndex + 1
      }));
    }
  };

  return { undo, redo, canUndo: history.currentIndex > 0, canRedo: history.currentIndex < history.changes.length - 1 };
}
```

#### UI/UX Design

##### Interactive Props Table Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Interactive Props                              [Reset All] [▶]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ variant (required)                             ButtonVariant     │
│ Controls the display variant                                     │
│ ┌──────────────────────────────────────┐                        │
│ │ primary ▼                            │                        │
│ └──────────────────────────────────────┘                        │
│ Values: primary | secondary | outline                           │
│                                                                   │
│ size                                           ButtonSize        │
│ Size of the button                                               │
│ ┌──────────────────────────────────────┐                        │
│ │ medium ▼                             │                        │
│ └──────────────────────────────────────┘                        │
│                                                                   │
│ disabled                                       boolean           │
│ Whether the button is disabled                                   │
│ ┌─────┐                                                          │
│ │ ○   │ Off                                                      │
│ └─────┘                                                          │
│                                                                   │
│ children                                       ReactNode         │
│ Button content                                                   │
│ ┌──────────────────────────────────────┐                        │
│ │ Button Text                          │                        │
│ └──────────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
```

##### Playground Toolbar

```
┌─────────────────────────────────────────────────────────────────┐
│ [◀ Undo] [Redo ▶] │ [↺ Reset] │ [Presets ▼] │ [</> Code] [📋] │
└─────────────────────────────────────────────────────────────────┘
```

#### Implementation Architecture

##### Component Structure

```
website/src/
├── components/
│   ├── playground/
│   │   ├── PlaygroundContext.tsx       # Context provider
│   │   ├── InteractivePropsTable.tsx   # Main props control panel
│   │   ├── PropControl.tsx             # Generic prop control wrapper
│   │   ├── PropDropdown.tsx            # Union type dropdown
│   │   ├── PropTextInput.tsx           # String input
│   │   ├── PropNumberInput.tsx         # Number input
│   │   ├── PropToggle.tsx              # Boolean toggle
│   │   ├── PropTextarea.tsx            # Children/text area
│   │   ├── LivePreview.tsx             # Live component preview
│   │   ├── CodeDisplay.tsx             # Generated JSX code
│   │   ├── PlaygroundToolbar.tsx       # Undo/redo/reset controls
│   │   ├── PresetSelector.tsx          # Preset management
│   │   └── PropHistory.tsx             # History visualization
│   └── ...
└── ...
```

##### State Flow

```
User Interaction
    ↓
PropControl Component
    ↓
updateProp(propName, value)
    ↓
PlaygroundContext State Update
    ↓
    ├─> LivePreview Re-renders with new props
    ├─> CodeDisplay Updates JSX
    └─> PropHistory Records change
```

##### Prop Control Selection Logic

```typescript
function selectPropControl(propMeta: PropMetadata): React.ComponentType {
  // Union types → Dropdown
  if (propMeta.values && propMeta.values.length > 0) {
    return PropDropdown;
  }

  // Boolean → Toggle
  if (propMeta.type === 'boolean') {
    return PropToggle;
  }

  // Number → Number Input
  if (propMeta.type === 'number') {
    return PropNumberInput;
  }

  // Children/ReactNode → Textarea
  if (propMeta.type.includes('ReactNode') || propMeta.type.includes('React.ReactNode')) {
    return PropTextarea;
  }

  // Function → Not Editable
  if (propMeta.type.includes('=>') || propMeta.type.includes('Function')) {
    return PropNotEditable;
  }

  // String → Text Input
  if (propMeta.type === 'string') {
    return PropTextInput;
  }

  // Default → Text Input
  return PropTextInput;
}
```

#### Configuration Schema Updates

```json
{
  "playground": {
    "enabled": true,
    "defaultMode": "interactive",
    "showCodePanel": true,
    "enableHistory": true,
    "historyLimit": 50,

    "propControls": {
      "enablePresets": true,
      "enableUrlSharing": true,
      "debounceDelay": 300
    },

    "validation": {
      "enabled": true,
      "showInlineErrors": true,
      "blockInvalidValues": false
    }
  }
}
```

#### User Workflows

**Workflow 1: Interactive Prop Exploration**
1. User navigates to Button component page
2. Sees "Interactive Props" table with current values
3. Clicks dropdown next to `variant` prop
4. Selects "secondary" from options
5. Button preview updates instantly to secondary variant
6. User adjusts other props (size, disabled)
7. Clicks "Copy Code" to get JSX with current props

**Workflow 2: Creating Custom Examples**
1. User opens InputField component
2. Adjusts props to create specific state:
   - variant: 'error'
   - errorMessage: 'Email is required'
   - placeholder: 'Enter your email'
3. Preview shows error state
4. User clicks "Save Preset" → names it "Email Error State"
5. Preset saved for quick access later
6. User exports code for documentation or testing

**Workflow 3: Debugging Component Behavior**
1. Developer testing disabled state behavior
2. Toggles `disabled` prop on/off repeatedly
3. Observes visual changes in real-time
4. Combines with other props (variant, size)
5. Tests edge cases by entering unusual values
6. Uses undo/redo to compare states
7. Identifies issue and fixes component

#### Advanced Features (Future Extensions)

**Multi-Component Composition:**
- Edit props for multiple components simultaneously
- Test component interactions
- Preview compound component patterns

**Responsive Preview:**
- Toggle viewport sizes (mobile, tablet, desktop)
- Test component behavior at different breakpoints

**Event Simulation:**
- Trigger onClick, onChange, onSubmit events
- See console logs of event handlers
- Test callback functionality

**Performance Monitoring:**
- Show render count
- Highlight unnecessary re-renders
- Display render time metrics

**Accessibility Testing:**
- Screen reader preview
- Keyboard navigation testing
- ARIA attribute validation

#### Technical Considerations

**Performance Optimization:**
- Debounce text input changes
- Memoize component previews
- Lazy load heavy controls
- Virtual scrolling for long prop lists

**Error Handling:**
- Catch render errors in preview
- Validate prop values before applying
- Show helpful error messages
- Provide reset/fallback options

**State Persistence:**
- Save prop state to localStorage
- Restore on page reload
- Clear on manual reset
- Export/import state

**URL State Synchronization:**
```typescript
// Encode props in URL for sharing
// Example: /components/Button?variant=secondary&size=large&disabled=true

function encodePropsToUrl(props: Record<string, any>): string {
  const params = new URLSearchParams();
  Object.entries(props).forEach(([key, value]) => {
    params.set(key, String(value));
  });
  return params.toString();
}

function decodePropsFromUrl(search: string): Record<string, any> {
  const params = new URLSearchParams(search);
  const props: Record<string, any> = {};
  params.forEach((value, key) => {
    props[key] = parseValue(value);
  });
  return props;
}
```

#### Deliverables

**Phase 6 Completion Checklist:**
- [ ] PlaygroundContext for state management
- [ ] InteractivePropsTable component
- [ ] PropDropdown for union types
- [ ] PropTextInput for strings
- [ ] PropNumberInput for numbers
- [ ] PropToggle for booleans
- [ ] PropTextarea for ReactNode/children
- [ ] LivePreview with error boundary
- [ ] CodeDisplay with syntax highlighting
- [ ] PlaygroundToolbar (undo/redo/reset)
- [ ] PresetSelector and preset management
- [ ] PropHistory tracking and visualization
- [ ] URL state synchronization
- [ ] localStorage persistence
- [ ] Prop validation system
- [ ] Code export functionality
- [ ] Mobile-responsive controls
- [ ] Keyboard accessibility
- [ ] Documentation for playground features
- [ ] Updated README with playground guide

### Phase 3.2: Theme Token File System

**Objective**: Implement support for external theme token files (CSS/SCSS) that can be dynamically loaded and applied to the documentation site via a dropdown menu in the left navigation. This allows users to quickly swap between different global CSS/token files and see live component previews automatically update with the selected theme's design tokens.

**Key Workflow**: The `tokens` array in the config defines a collection of theme files (e.g., light.css, dark.css). These appear as options in a dropdown menu in the left sidebar navigation. When a user selects a theme from the dropdown, that theme's CSS file is applied globally, and all live component previews on the documentation site instantly reflect the new token values. This enables rapid theme comparison and validation without any code changes or page reloads.

#### Core Features

##### 1. Theme File Discovery & Loading

**Configuration Schema:**
```json
{
  "theme": {
    "tokens": [
      {
        "light": {
          "source": "src/themes/light.css",
          "background": "#FFFFFF"
        },
        "dark": {
          "source": "src/themes/dark.css",
          "background": "#1F2937"
        }
      }
    ],
    "defaultTheme": "light",
    "primaryColor": "#0066cc"
  }
}
```

**Theme Configuration Structure:**
The `tokens` array contains objects mapping theme names (like "light" and "dark") to theme configurations. Each theme configuration includes:
- **`source`** (required): Path to the CSS/SCSS file containing CSS custom properties (CSS variables)
- **`background`** (optional): Background color for component preview areas. This is applied via the `--theme-background` CSS variable to all live component previews, allowing you to showcase components against different backgrounds (e.g., white background for light theme, dark background for dark theme)

**Backward Compatibility:** The system also supports the legacy format where theme names map directly to file paths (string values instead of objects). For example:
```json
{
  "theme": {
    "tokens": [{
      "light": "src/themes/light.css",
      "dark": "src/themes/dark.css"
    }]
  }
}
```

**Example Theme File (`src/themes/light.css`):**
```css
/**
 * Light Theme Design Tokens
 * Default theme for component documentation
 */

:root {
  /* Primary Colors */
  --primary-color: #0066cc;
  --primary-hover: #0052a3;
  --primary-active: #003d7a;

  /* Background Colors */
  --background-primary: #ffffff;
  --background-secondary: #f9fafb;
  --background-tertiary: #f3f4f6;

  /* Text Colors */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;

  /* Border Colors */
  --border-color: #e5e7eb;
  --border-focus: #0066cc;

  /* Component-Specific Tokens */
  --button-primary-bg: var(--primary-color);
  --button-primary-text: #ffffff;
  --input-background: #ffffff;
  --input-border: #e5e7eb;

  /* Spacing Scale */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-family-mono: 'Monaco', 'Courier New', monospace;
  --font-size-base: 1rem;
  --font-weight-normal: 400;
  --font-weight-bold: 600;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}
```

**Example Dark Theme (`src/themes/dark.css`):**
```css
/**
 * Dark Theme Design Tokens
 * Dark mode optimized for reduced eye strain
 */

:root {
  /* Primary Colors */
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --primary-active: #1d4ed8;

  /* Background Colors */
  --background-primary: #1f2937;
  --background-secondary: #111827;
  --background-tertiary: #0f172a;

  /* Text Colors */
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --text-tertiary: #9ca3af;

  /* Border Colors */
  --border-color: #374151;
  --border-focus: #3b82f6;

  /* Component-Specific Tokens */
  --button-primary-bg: var(--primary-color);
  --button-primary-text: #ffffff;
  --input-background: #374151;
  --input-border: #4b5563;

  /* Shadows (adjusted for dark mode) */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
}
```

##### 2. Theme Parser Implementation

**Parser Module (`parser/theme-parser.ts`):**
```typescript
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
  parseThemeConfig(config: any): Map<string, string> {
    const themeMap = new Map<string, string>();

    if (!config.theme?.tokens || !Array.isArray(config.theme.tokens)) {
      return themeMap;
    }

    // Extract theme files from configuration
    for (const tokenGroup of config.theme.tokens) {
      for (const [themeName, filePath] of Object.entries(tokenGroup)) {
        if (typeof filePath === 'string') {
          themeMap.set(themeName, filePath as string);
        }
      }
    }

    return themeMap;
  }

  /**
   * Parse a CSS/SCSS theme file and extract tokens
   */
  async parseThemeFile(filePath: string): Promise<Theme> {
    const absolutePath = path.resolve(process.cwd(), filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Theme file not found: ${filePath}`);
    }

    const content = fs.readFileSync(absolutePath, 'utf-8');
    const tokens = await this.extractTokensFromCSS(content);
    const metadata = this.extractMetadataFromComments(content);

    return {
      id: path.basename(filePath, path.extname(filePath)),
      name: this.formatThemeName(path.basename(filePath, path.extname(filePath))),
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
```

##### 3. Theme Integration in Build Process

**Generator Updates (`generator/builder.ts`):**
```typescript
import { ThemeParser } from '../parser/theme-parser';

export async function buildDocumentation(config: any, options: BuildOptions) {
  const themeParser = new ThemeParser();

  // Parse theme configuration
  const themeMap = themeParser.parseThemeConfig(config);
  const themes: Theme[] = [];

  console.log(`🎨 Loading ${themeMap.size} theme(s)...`);

  for (const [themeName, filePath] of themeMap.entries()) {
    try {
      const theme = await themeParser.parseThemeFile(filePath);
      themes.push(theme);
      console.log(`  ✓ Loaded "${theme.name}" theme with ${theme.tokens.length} tokens`);
    } catch (error) {
      console.error(`  ✗ Failed to load ${themeName} theme from ${filePath}:`, error);
    }
  }

  // Generate theme index JSON
  const themeIndex = {
    themes: themes.map(t => ({
      id: t.id,
      name: t.name,
      filePath: t.filePath,
      tokenCount: t.tokens.length,
      metadata: t.metadata
    })),
    defaultTheme: themes[0]?.id || 'light'
  };

  // Save theme index
  const themesOutputPath = path.join(outputDir, 'metadata', 'themes.json');
  fs.writeFileSync(themesOutputPath, JSON.stringify(themeIndex, null, 2));
  console.log(`💾 Saved theme index to ${themesOutputPath}`);

  // Copy theme CSS files to output directory
  const themesDir = path.join(outputDir, 'themes');
  fs.mkdirSync(themesDir, { recursive: true });

  for (const theme of themes) {
    const sourceFile = path.resolve(process.cwd(), theme.filePath);
    const targetFile = path.join(themesDir, `${theme.id}.css`);
    fs.copyFileSync(sourceFile, targetFile);
    console.log(`  📄 Copied ${theme.id}.css to output`);
  }
}
```

##### 4. Theme Switcher UI Component

**Location**: The ThemeSwitcher component is placed in the left sidebar navigation, above or below the component list, providing easy access to theme switching throughout the documentation browsing experience.

**Behavior**: When a theme is selected from the dropdown:
1. The previous theme's CSS file is removed from the document head
2. The new theme's CSS file is injected as a `<link>` tag
3. All CSS custom properties are automatically updated document-wide
4. Live component previews instantly re-render with the new token values
5. The user's theme preference is saved to localStorage for persistence across sessions

**Component (`website/src/components/ThemeSwitcher.tsx`):**
```typescript
import React, { useState, useEffect } from 'react';
import './ThemeSwitcher.scss';

interface Theme {
  id: string;
  name: string;
  filePath: string;
  tokenCount: number;
  metadata?: {
    description?: string;
  };
}

interface ThemeIndex {
  themes: Theme[];
  defaultTheme: string;
}

const ThemeSwitcher: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [currentTheme, setCurrentTheme] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load theme index
    fetch('/metadata/themes.json')
      .then(res => res.json())
      .then((data: ThemeIndex) => {
        setThemes(data.themes);

        // Check localStorage for saved preference
        const savedTheme = localStorage.getItem('documentor-theme') || data.defaultTheme;
        setCurrentTheme(savedTheme);
        applyTheme(savedTheme);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load themes:', error);
        setLoading(false);
      });
  }, []);

  const applyTheme = (themeId: string) => {
    // Remove existing theme stylesheets
    document.querySelectorAll('link[data-theme]').forEach(link => link.remove());

    // Add new theme stylesheet
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/themes/${themeId}.css`;
    link.setAttribute('data-theme', themeId);
    document.head.appendChild(link);

    // Save preference
    localStorage.setItem('documentor-theme', themeId);
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = e.target.value;
    setCurrentTheme(newTheme);
    applyTheme(newTheme);
  };

  if (loading || themes.length === 0) {
    return null;
  }

  return (
    <div className="theme-switcher">
      <label htmlFor="theme-select" className="theme-label">
        🎨 Theme
      </label>
      <select
        id="theme-select"
        value={currentTheme}
        onChange={handleThemeChange}
        className="theme-select"
      >
        {themes.map(theme => (
          <option key={theme.id} value={theme.id}>
            {theme.name} ({theme.tokenCount} tokens)
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSwitcher;
```

##### 5. Theme Switcher Styling

**Styles (`website/src/components/ThemeSwitcher.scss`):**
```scss
.theme-switcher {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--background-secondary, #f9fafb);
  border-radius: var(--radius-md, 0.375rem);

  .theme-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text-secondary, #6b7280);
    white-space: nowrap;
  }

  .theme-select {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: var(--radius-sm, 0.25rem);
    background: var(--background-primary, #ffffff);
    color: var(--text-primary, #1f2937);
    cursor: pointer;
    transition: all var(--transition-fast, 150ms ease);

    &:hover {
      border-color: var(--primary-color, #0066cc);
    }

    &:focus {
      outline: none;
      border-color: var(--border-focus, #0066cc);
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
    }
  }
}
```

##### 6. Integration Points

**Website Sidebar Component (`website/src/components/Sidebar.tsx`):**
```typescript
import ThemeSwitcher from './ThemeSwitcher';

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Documentation</h2>
      </div>

      {/* Theme switcher in sidebar navigation */}
      <ThemeSwitcher />

      {/* Component navigation list */}
      <nav className="component-nav">
        {/* ... component links ... */}
      </nav>
    </aside>
  );
}
```

**Impact on Live Previews:**
When a user switches themes via the sidebar dropdown, all component previews across the documentation site automatically update. This includes:
- Component variant showcases on individual component pages
- Interactive playground previews
- Code example renders
- Any other live component instances

The theme CSS variables are applied at the `:root` level, so they cascade to all components without requiring any component-specific logic.

##### 7. CLI Theme Commands

**New CLI Commands:**
```bash
# Validate theme files
documentor validate-theme src/themes/light.css

# List all themes in project
documentor list-themes

# Create a new theme template
documentor create-theme --name "High Contrast" --output src/themes/high-contrast.css

# Build with specific default theme
documentor build --default-theme dark
```

**CLI Implementation (`cli/commands/theme.ts`):**
```typescript
import { ThemeParser } from '../../parser/theme-parser';

export async function validateThemeCommand(filePath: string) {
  const parser = new ThemeParser();

  try {
    const theme = await parser.parseThemeFile(filePath);
    console.log(`✅ Theme "${theme.name}" is valid`);
    console.log(`   Tokens: ${theme.tokens.length}`);
    console.log(`   File: ${theme.filePath}`);

    if (theme.metadata?.description) {
      console.log(`   Description: ${theme.metadata.description}`);
    }
  } catch (error) {
    console.error(`❌ Theme validation failed:`, error);
    process.exit(1);
  }
}

export async function listThemesCommand() {
  const config = loadConfig();
  const parser = new ThemeParser();
  const themeMap = parser.parseThemeConfig(config);

  console.log(`Found ${themeMap.size} theme(s):\n`);

  for (const [themeName, filePath] of themeMap.entries()) {
    try {
      const theme = await parser.parseThemeFile(filePath);
      console.log(`📄 ${theme.name}`);
      console.log(`   ID: ${theme.id}`);
      console.log(`   File: ${theme.filePath}`);
      console.log(`   Tokens: ${theme.tokens.length}`);
      if (theme.metadata?.description) {
        console.log(`   Description: ${theme.metadata.description}`);
      }
      console.log();
    } catch (error) {
      console.error(`   ❌ Failed to parse: ${error.message}\n`);
    }
  }
}

export async function createThemeCommand(options: { name: string; output: string }) {
  const template = `/**
 * ${options.name} Theme
 * Generated by Documentor
 */

:root {
  /* Primary Colors */
  --primary-color: #0066cc;
  --primary-hover: #0052a3;
  --primary-active: #003d7a;

  /* Background Colors */
  --background-primary: #ffffff;
  --background-secondary: #f9fafb;
  --background-tertiary: #f3f4f6;

  /* Text Colors */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;

  /* Border Colors */
  --border-color: #e5e7eb;
  --border-focus: #0066cc;

  /* Add your custom tokens here */
}
`;

  fs.writeFileSync(options.output, template, 'utf-8');
  console.log(`✅ Created theme template at ${options.output}`);
}
```

#### Implementation Architecture

##### Data Flow

```
1. Config Loading (Build Time)
   └─> Read documentor.config.json
   └─> Extract theme.tokens array
   └─> Parse each theme file with ThemeParser
   └─> Generate themes.json index
   └─> Copy theme CSS files to output/themes/

2. Theme Selection (Runtime)
   └─> Load themes.json on app mount
   └─> Check localStorage for saved theme preference
   └─> Inject selected theme CSS into document head
   └─> Update UI to reflect current theme

3. Theme Switching (User Action)
   └─> User selects theme from dropdown
   └─> Remove previous theme stylesheet
   └─> Inject new theme stylesheet
   └─> Apply theme background color via --theme-background CSS variable
   └─> Save preference to localStorage
   └─> All components re-render with new tokens and background
```

##### File Structure

```
project/
├── src/
│   └── themes/
│       ├── light.css          # Light theme tokens
│       ├── dark.css           # Dark theme tokens
│       └── high-contrast.css  # Accessibility theme
├── docs/                      # Build output
│   ├── metadata/
│   │   └── themes.json        # Generated theme index
│   └── themes/
│       ├── light.css          # Copied theme files
│       ├── dark.css
│       └── high-contrast.css
└── documentor.config.json     # Theme configuration
```

#### Configuration Schema

```json
{
  "theme": {
    "tokens": [
      {
        "light": {
          "source": "src/themes/light.css",
          "background": "#FFFFFF"
        },
        "dark": {
          "source": "src/themes/dark.css",
          "background": "#1F2937"
        },
        "high-contrast": {
          "source": "src/themes/high-contrast.css",
          "background": "#000000"
        }
      }
    ],
    "defaultTheme": "light",
    "primaryColor": "#0066cc"
  }
}
```

**Configuration Options:**

| Property | Type | Description |
|----------|------|-------------|
| `tokens` | `Array<Object>` | Array of theme configurations. Each theme has a name mapped to an object with `source` (CSS file path) and optional `background` (preview background color) |
| `tokens[].source` | `string` | Path to the CSS/SCSS file containing theme tokens (required) |
| `tokens[].background` | `string` | Background color for component preview areas. Applied via `--theme-background` CSS variable (optional) |
| `defaultTheme` | `string` | Theme ID to use by default (optional, defaults to first theme) |
| `primaryColor` | `string` | Fallback primary color if no theme loaded |

#### Benefits

1. **Separation of Concerns**: Design tokens defined separately from component code
2. **Multiple Theme Support**: Easy to maintain light/dark/branded themes
3. **Designer-Friendly**: Non-technical users can edit CSS files
4. **Version Control**: Theme files tracked in Git alongside components
5. **Runtime Switching**: Users can switch themes without page reload
6. **Persistent Preference**: Theme choice saved to localStorage
7. **Build-Time Validation**: Errors caught during documentation build
8. **Zero Runtime Cost**: Themes loaded as static CSS (no JavaScript processing)

#### Use Cases

**Use Case 1: Light/Dark Mode Support**
- Provide both light.css and dark.css themes
- Users toggle between modes in documentation
- Components automatically adapt to theme tokens

**Use Case 2: Brand Customization**
- Create brand-specific theme files (e.g., acme-brand.css)
- Clients preview components with their brand colors
- Export branded documentation for customer delivery

**Use Case 3: Accessibility Themes**
- high-contrast.css for visually impaired users
- large-text.css with increased font sizes
- Users select accessibility theme from dropdown

**Use Case 4: Design System Evolution**
- old-tokens.css (v1 design system)
- new-tokens.css (v2 design system)
- Compare component appearance side-by-side
- Validate migration before deploying

#### Deliverables

**Phase 3.2 Completion Checklist:**
- [ ] ThemeParser class with CSS variable extraction
- [ ] Config schema support for `theme.tokens` array
- [ ] Theme file discovery and validation
- [ ] Build process integration (copy theme files to output)
- [ ] Generate themes.json index file
- [ ] ThemeSwitcher UI component
- [ ] localStorage persistence for theme preference
- [ ] CLI command: `validate-theme`
- [ ] CLI command: `list-themes`
- [ ] CLI command: `create-theme`
- [ ] Theme CSS injection in website App.tsx
- [ ] Documentation for theme file format
- [ ] Example theme files (light.css, dark.css)
- [ ] Support for multiple theme objects in tokens array
- [ ] Error handling for missing/invalid theme files
- [ ] Hot reload support in dev mode for theme changes

### Phase 3.3: Configuration Schema Validation with Zod

**Objective**: Implement comprehensive validation for `documentor.config.json` using Zod to catch configuration errors early, provide helpful error messages, and ensure type safety throughout the application. This prevents runtime errors from invalid configuration and improves developer experience with clear validation feedback.

#### Problem Statement

Currently, the config loader:
- Accepts any JSON without validation
- Allows unknown/invalid fields that are silently ignored
- Provides no feedback for typos or incorrect types
- Can cause cryptic runtime errors when invalid config is used
- Lacks IntelliSense support for config editing

Users need:
- Clear error messages when config is invalid
- Helpful suggestions for fixing validation errors
- Type safety guarantees before execution
- Prevention of common configuration mistakes

#### Core Features

##### 1. Zod Schema Definition

**Create comprehensive Zod schema** (`config/validation.ts`):

```typescript
import { z } from 'zod';

/**
 * Source configuration schema
 * Defines which files to parse for component documentation
 */
const SourceSchema = z.object({
  /**
   * Glob patterns for component files to include
   * @example ["src/components/**\/*.{tsx,jsx}"]
   */
  include: z.array(z.string()).min(1, 'Must include at least one source pattern'),

  /**
   * Glob patterns for files to exclude from parsing
   * @example ["**\/*.test.{tsx,jsx}", "**\/*.stories.{tsx,jsx}"]
   */
  exclude: z.array(z.string()).optional(),

  /**
   * File extensions to recognize as style files
   * @example [".css", ".scss", ".module.css"]
   */
  styleFiles: z.array(z.string()).optional(),
}).describe('Source file configuration');

/**
 * Output configuration schema
 * Controls where documentation is generated
 */
const OutputSchema = z.object({
  /**
   * Directory where documentation will be generated
   * @example "./docs"
   */
  directory: z.string().min(1, 'Output directory cannot be empty'),

  /**
   * Base URL for the documentation site
   * Used for generating correct asset paths
   * @example "/" or "/component-docs/"
   */
  baseUrl: z.string().optional(),

  /**
   * Path to static assets to copy to output
   * @example "./public"
   */
  staticAssets: z.string().optional(),
}).describe('Output configuration');

/**
 * Development server configuration schema
 */
const ServerSchema = z.object({
  /**
   * Port number for development server
   * @default 6006
   */
  port: z.number().int().min(1024).max(65535).optional(),

  /**
   * Whether to automatically open browser on start
   * @default true
   */
  open: z.boolean().optional(),
}).describe('Development server configuration');

/**
 * Variant generation configuration schema
 */
const VariantsSchema = z.object({
  /**
   * Whether to automatically generate variant combinations
   * @default true
   */
  autoGenerate: z.boolean().optional(),

  /**
   * Maximum number of variant permutations to generate
   * Prevents exponential explosion of variants
   * @default 20
   */
  maxPermutations: z.number().int().positive().optional(),

  /**
   * Default values for different prop types
   * Used when generating example code
   */
  defaultValues: z.object({
    string: z.string().optional(),
    number: z.number().optional(),
    children: z.string().optional(),
  }).optional(),
}).describe('Variant generation configuration');

/**
 * Theme token configuration schema
 * Supports both legacy string format and new object format
 */
const ThemeTokenSchema = z.union([
  z.string(), // Legacy format: "src/themes/light.css"
  z.object({
    /**
     * Path to CSS/SCSS file containing theme tokens
     * @example "src/themes/light.css"
     */
    source: z.string().min(1, 'Theme source file path is required'),

    /**
     * Background color for component preview areas
     * Any valid CSS color value
     * @example "#FFFFFF" or "rgb(255, 255, 255)"
     */
    background: z.string().optional(),
  }),
]);

/**
 * Theme configuration schema
 */
const ThemeSchema = z.object({
  /**
   * Array of theme configurations
   * Each object maps theme names to their configuration
   * @example [{ "light": { "source": "src/themes/light.css", "background": "#FFF" } }]
   */
  tokens: z.array(
    z.record(z.string(), ThemeTokenSchema)
  ).optional(),

  /**
   * ID of the default theme to use on initial load
   * Must match one of the theme names in tokens array
   * @default First theme in tokens array
   */
  defaultTheme: z.string().optional(),

  /**
   * Primary brand color
   * Fallback if no theme is loaded
   * @example "#0066cc"
   */
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),

  /**
   * Path to logo image file
   */
  logo: z.string().optional(),

  /**
   * Path to favicon file
   */
  favicon: z.string().optional(),
}).describe('Theme and branding configuration');

/**
 * Test coverage configuration schema
 */
const CoverageSchema = z.object({
  /**
   * Whether to extract and display test coverage
   * @default true
   */
  enabled: z.boolean().optional(),

  /**
   * Glob patterns for test files
   * @example ["**\/*.test.{ts,tsx}"]
   */
  testPatterns: z.array(z.string()).optional(),

  /**
   * Path to Jest coverage report
   * @default "coverage/coverage-summary.json"
   */
  coverageReportPath: z.string().optional(),

  /**
   * Minimum coverage thresholds for warnings
   */
  thresholds: z.object({
    statements: z.number().min(0).max(100).optional(),
    branches: z.number().min(0).max(100).optional(),
    functions: z.number().min(0).max(100).optional(),
    lines: z.number().min(0).max(100).optional(),
  }).optional(),

  /**
   * Whether to display coverage badges in sidebar
   * @default true
   */
  displayInSidebar: z.boolean().optional(),

  /**
   * Style of coverage badge
   * @example "flat" | "flat-square" | "for-the-badge"
   */
  badgeStyle: z.string().optional(),
}).describe('Test coverage configuration');

/**
 * Feature flags configuration schema
 */
const FeaturesSchema = z.object({
  /**
   * Enable search functionality
   * @default true
   */
  search: z.boolean().optional(),

  /**
   * Enable dark mode toggle
   * @default true
   */
  darkMode: z.boolean().optional(),

  /**
   * Show code snippets with syntax highlighting
   * @default true
   */
  codeSnippets: z.boolean().optional(),

  /**
   * Enable interactive playground for props
   * @default false
   */
  playground: z.boolean().optional(),

  /**
   * Display test coverage information
   * @default true
   */
  testCoverage: z.boolean().optional(),
}).describe('Feature flags');

/**
 * Main configuration schema
 */
export const DocumentorConfigSchema = z.object({
  /**
   * Project name
   * Displayed in documentation header
   * @example "Acme Design System"
   */
  name: z.string().min(1, 'Project name is required'),

  /**
   * Project description
   * Displayed in documentation header and metadata
   * @example "React component library for Acme products"
   */
  description: z.string().optional(),

  /**
   * Project version
   * Displayed in documentation header
   * @example "1.0.0"
   */
  version: z.string().regex(/^\d+\.\d+\.\d+/, 'Version must follow semantic versioning (e.g., 1.0.0)').optional(),

  source: SourceSchema,
  output: OutputSchema,
  server: ServerSchema.optional(),
  variants: VariantsSchema.optional(),
  theme: ThemeSchema.optional(),
  coverage: CoverageSchema.optional(),
  features: FeaturesSchema.optional(),
}).strict(); // strict() prevents unknown keys

export type DocumentorConfig = z.infer<typeof DocumentorConfigSchema>;
```

##### 2. Enhanced Config Loader with Validation

**Update** `cli/utils/config-loader.ts`:

```typescript
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';
import { DocumentorConfigSchema } from '../../config/validation';
import { defaultConfig } from '../../config/schema';

/**
 * Format Zod validation error for user-friendly display
 */
function formatValidationError(error: z.ZodError): string {
  const lines = ['❌ Configuration validation failed:\n'];

  for (const issue of error.issues) {
    const pathStr = issue.path.join('.');
    lines.push(`  • ${pathStr || 'root'}: ${issue.message}`);

    // Add helpful suggestions for common errors
    if (issue.code === 'invalid_type') {
      lines.push(`    Expected: ${issue.expected}, Received: ${issue.received}`);
    }

    if (issue.code === 'unrecognized_keys') {
      const keys = (issue as any).keys.join(', ');
      lines.push(`    Unknown field(s): ${keys}`);
      lines.push(`    Hint: Check for typos or remove unsupported fields`);
    }
  }

  lines.push('\n📖 See documentation: https://github.com/your-org/documentor#configuration');

  return lines.join('\n');
}

/**
 * Load and validate configuration file
 */
export async function loadConfig(configPath: string): Promise<z.infer<typeof DocumentorConfigSchema>> {
  const resolvedPath = path.resolve(configPath);

  if (!fs.existsSync(resolvedPath)) {
    console.warn(`⚠️  Config file not found: ${resolvedPath}`);
    console.log('📝 Using default configuration\n');

    // Validate default config
    const defaultConfigWithName = {
      name: 'Component Library',
      ...defaultConfig,
    };

    return DocumentorConfigSchema.parse(defaultConfigWithName);
  }

  try {
    const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
    const userConfig = JSON.parse(fileContent);

    // Validate configuration
    const validationResult = DocumentorConfigSchema.safeParse(userConfig);

    if (!validationResult.success) {
      console.error(formatValidationError(validationResult.error));
      process.exit(1);
    }

    console.log('✅ Configuration validated successfully\n');

    return validationResult.data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`❌ Error parsing config file: Invalid JSON syntax`);
      console.error(`   ${error.message}\n`);
    } else {
      console.error(`❌ Error loading config file:`, error);
    }
    process.exit(1);
  }
}

/**
 * Validate config without loading it (for CLI validation command)
 */
export async function validateConfig(configPath: string): Promise<boolean> {
  const resolvedPath = path.resolve(configPath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`❌ Config file not found: ${resolvedPath}`);
    return false;
  }

  try {
    const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
    const userConfig = JSON.parse(fileContent);

    const validationResult = DocumentorConfigSchema.safeParse(userConfig);

    if (!validationResult.success) {
      console.error(formatValidationError(validationResult.error));
      return false;
    }

    console.log('✅ Configuration is valid!\n');
    console.log('📋 Configuration summary:');
    console.log(`   Project: ${validationResult.data.name}`);
    console.log(`   Source patterns: ${validationResult.data.source.include.length}`);
    console.log(`   Output: ${validationResult.data.output.directory}`);

    if (validationResult.data.theme?.tokens) {
      const themeCount = validationResult.data.theme.tokens.reduce(
        (count, group) => count + Object.keys(group).length,
        0
      );
      console.log(`   Themes: ${themeCount}`);
    }

    return true;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`❌ Invalid JSON syntax:`);
      console.error(`   ${error.message}`);
    } else {
      console.error(`❌ Error validating config:`, error);
    }
    return false;
  }
}
```

##### 3. CLI Validation Command

**Add new command** `cli/commands/validate.ts`:

```typescript
import { validateConfig } from '../utils/config-loader';

export async function validateCommand(options: { config?: string }) {
  const configPath = options.config || './documentor.config.json';

  console.log(`🔍 Validating configuration file: ${configPath}\n`);

  const isValid = await validateConfig(configPath);

  if (isValid) {
    console.log('\n✨ Your configuration is ready to use!');
    process.exit(0);
  } else {
    console.log('\n💡 Fix the errors above and try again');
    process.exit(1);
  }
}
```

**Update** `bin/documentor.js` to add validate command:

```javascript
#!/usr/bin/env node

const { program } = require('commander');

// ... existing commands ...

program
  .command('validate')
  .description('Validate documentor.config.json file')
  .option('-c, --config <path>', 'Path to config file', './documentor.config.json')
  .action(async (options) => {
    const { validateCommand } = require('../cli/commands/validate');
    await validateCommand(options);
  });

program.parse(process.argv);
```

##### 4. JSON Schema Generation for IDE Support

**Add script** `scripts/generate-json-schema.ts`:

```typescript
import { zodToJsonSchema } from 'zod-to-json-schema';
import { DocumentorConfigSchema } from '../config/validation';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate JSON Schema from Zod schema for IDE IntelliSense
 */
function generateJSONSchema() {
  const jsonSchema = zodToJsonSchema(DocumentorConfigSchema, {
    name: 'DocumentorConfig',
    $refStrategy: 'none',
  });

  // Add $schema property
  const schemaWithMeta = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Documentor Configuration',
    description: 'Configuration file for Documentor component documentation generator',
    ...jsonSchema,
  };

  const outputPath = path.join(__dirname, '..', 'documentor.schema.json');
  fs.writeFileSync(outputPath, JSON.stringify(schemaWithMeta, null, 2));

  console.log(`✅ Generated JSON Schema at ${outputPath}`);
}

generateJSONSchema();
```

**Add to** `package.json`:

```json
{
  "scripts": {
    "generate-schema": "ts-node scripts/generate-json-schema.ts"
  }
}
```

##### 5. VSCode Integration

**Create** `.vscode/settings.json` template:

```json
{
  "json.schemas": [
    {
      "fileMatch": ["documentor.config.json"],
      "url": "./documentor.schema.json"
    }
  ]
}
```

This enables IntelliSense, auto-completion, and inline validation in VSCode.

#### Implementation Benefits

1. **Early Error Detection**: Catch configuration errors before execution
2. **Clear Error Messages**: Helpful, actionable error messages with suggestions
3. **Type Safety**: Full TypeScript type inference from validated config
4. **IDE Support**: IntelliSense and validation in VSCode/IDEs
5. **Documentation**: Schema serves as self-documenting configuration reference
6. **Developer Experience**: Reduce debugging time for config issues
7. **Prevent Breaking Changes**: Schema evolution tracking
8. **CLI Validation**: Dedicated command to validate config without running build

#### Error Message Examples

**Unknown field error:**
```
❌ Configuration validation failed:

  • theme: Unrecognized key(s) in object: 'colors'
    Unknown field(s): colors
    Hint: Check for typos or remove unsupported fields

📖 See documentation: https://github.com/your-org/documentor#configuration
```

**Type mismatch error:**
```
❌ Configuration validation failed:

  • server.port: Expected number, received string
    Expected: number, Received: string

  • source.include: Required
    Must include at least one source pattern

📖 See documentation: https://github.com/your-org/documentor#configuration
```

**Theme validation error:**
```
❌ Configuration validation failed:

  • theme.tokens.0.light.source: String must contain at least 1 character(s)
    Theme source file path is required

  • theme.primaryColor: Invalid
    Must be a valid hex color

📖 See documentation: https://github.com/your-org/documentor#configuration
```

#### Usage Examples

**Validate config before build:**
```bash
# Validate default config
documentor validate

# Validate specific config file
documentor validate --config ./custom-config.json

# Validate as part of CI/CD
npm run validate-config && npm run docs:build
```

**Programmatic validation:**
```typescript
import { DocumentorConfigSchema } from './config/validation';

const config = {
  name: 'My Library',
  source: { include: ['src/**/*.tsx'] },
  output: { directory: './docs' },
};

const result = DocumentorConfigSchema.safeParse(config);

if (result.success) {
  // Config is valid, use result.data
  buildDocumentation(result.data);
} else {
  // Config is invalid, result.error contains details
  console.error(result.error.errors);
}
```

#### Migration Guide

For users upgrading from unvalidated config:

1. **Install Zod**: `npm install zod`
2. **Run validation**: `documentor validate`
3. **Fix any errors** based on validation output
4. **Generate schema**: `npm run generate-schema`
5. **Configure IDE**: Copy `.vscode/settings.json` to project

#### Deliverables

**Phase 3.3 Completion Checklist:**
- [ ] Install Zod dependency
- [ ] Create comprehensive Zod schema in `config/validation.ts`
- [ ] Add JSDoc descriptions to all schema fields
- [ ] Update config-loader.ts with validation
- [ ] Create formatValidationError helper function
- [ ] Add validateConfig function for standalone validation
- [ ] Create CLI `validate` command
- [ ] Add validation to build and dev commands
- [ ] Create JSON Schema generation script
- [ ] Generate documentor.schema.json file
- [ ] Create VSCode settings template
- [ ] Document validation in README
- [ ] Add migration guide for existing users
- [ ] Create examples of common validation errors
- [ ] Add validation to CI/CD documentation
- [ ] Test validation with invalid configs
- [ ] Test validation with edge cases
- [ ] Ensure helpful error messages for all validation failures

## Future Enhancements

### Configuration Options
- JSON config file (`documentor.config.json`) for project customization
- Define crawl paths, file types, output directory
- Custom theme colors and branding
- Plugin system for custom parsers

### Advanced Parsing
- Support for more component patterns (HOCs, render props, hooks)
- Detect component dependencies and relationships
- Extract accessibility information (ARIA attributes)
- Performance metrics (bundle size, render time)

### Enhanced Documentation
- Interactive component playground with live editing
- Side-by-side code and rendered view
- Dark mode with theme switching
- Keyboard shortcuts for navigation
- Markdown pages for guides and tutorials

### Integration & Export
- CI/CD integration for automated docs deployment
- Export to PDF or other formats
- Slack/Discord bot for component search
- IDE extensions for quick reference

## CI/CD Integration & Deployment

### Overview

Documentor is designed to integrate seamlessly into modern development workflows. The static site generation capability allows documentation to be built during CI/CD pipelines and deployed to any static hosting platform.

### Build Process

#### Static Site Generation

The `documentor build` command generates a fully static website that can be deployed anywhere:

```bash
# Generate static documentation site
npx documentor build

# Output structure
./docs/
├── index.html
├── components/
│   ├── Button.html
│   ├── Input.html
│   └── ...
├── assets/
│   ├── js/
│   ├── css/
│   └── images/
└── metadata.json
```

**Build Process:**
1. **Parse**: Scan all component files and extract metadata
2. **Generate**: Create JSON metadata files for each component
3. **Bundle**: Build React SPA with component data embedded
4. **Optimize**: Minify assets, optimize images, tree-shake unused code
5. **Export**: Generate static HTML files with SSR for SEO
6. **Hash**: Add content hashes to filenames for cache busting

**Build Configuration:**

```json
{
  "output": {
    "directory": "./docs",
    "baseUrl": "/",
    "ssg": true,
    "optimization": {
      "minify": true,
      "sourceMaps": false,
      "splitChunks": true,
      "imageOptimization": true
    }
  }
}
```

### GitHub Actions Integration

#### Workflow File Example

Create `.github/workflows/docs.yml`:

```yaml
name: Build and Deploy Documentation

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-docs:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build documentation
        run: npx documentor build
        env:
          NODE_ENV: production

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: documentation
          path: ./docs
          retention-days: 30

      - name: Deploy to GitHub Pages
        if: github.ref == 'refs/heads/main'
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs
          cname: docs.yourcompany.com  # Optional custom domain
```

#### Multi-Environment Deployment

```yaml
name: Deploy Docs to Multiple Environments

on:
  push:
    branches: [main, staging, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Set environment variables
        run: |
          if [ "${{ github.ref }}" == "refs/heads/main" ]; then
            echo "BASE_URL=https://docs.yourcompany.com" >> $GITHUB_ENV
            echo "ENVIRONMENT=production" >> $GITHUB_ENV
          elif [ "${{ github.ref }}" == "refs/heads/staging" ]; then
            echo "BASE_URL=https://staging-docs.yourcompany.com" >> $GITHUB_ENV
            echo "ENVIRONMENT=staging" >> $GITHUB_ENV
          else
            echo "BASE_URL=https://dev-docs.yourcompany.com" >> $GITHUB_ENV
            echo "ENVIRONMENT=development" >> $GITHUB_ENV
          fi

      - name: Build documentation
        run: npx documentor build --base-url $BASE_URL --env $ENVIRONMENT

      - name: Deploy to appropriate environment
        uses: your-deployment-action@v1
        with:
          target: ${{ env.ENVIRONMENT }}
          path: ./docs
```

### Deployment Platforms

#### 1. GitHub Pages

**Setup:**
```bash
# Configure documentor for GitHub Pages
npx documentor build --base-url /your-repo-name/
```

**GitHub Action:**
```yaml
- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./docs
```

**Benefits:**
- Free hosting
- Automatic SSL
- Custom domains supported
- Integrated with GitHub repos

#### 2. Vercel

**Setup:**
```json
{
  "buildCommand": "npx documentor build",
  "outputDirectory": "docs",
  "framework": null
}
```

**GitHub Action:**
```yaml
- name: Deploy to Vercel
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.ORG_ID }}
    vercel-project-id: ${{ secrets.PROJECT_ID }}
    working-directory: ./
```

**Benefits:**
- Automatic preview deployments for PRs
- Edge network (CDN)
- Instant rollbacks
- Built-in analytics

#### 3. Netlify

**Setup - `netlify.toml`:**
```toml
[build]
  command = "npx documentor build"
  publish = "docs"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**GitHub Action:**
```yaml
- name: Deploy to Netlify
  uses: netlify/actions/cli@master
  env:
    NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
    NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
  with:
    args: deploy --prod --dir=docs
```

**Benefits:**
- Deploy previews
- Form handling
- Serverless functions
- Split testing

#### 4. AWS S3 + CloudFront

**GitHub Action:**
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1

- name: Deploy to S3
  run: |
    aws s3 sync ./docs s3://your-docs-bucket --delete
    aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
```

**Benefits:**
- Full control
- Highly scalable
- Cost effective at scale
- Integrate with other AWS services

#### 5. Azure Static Web Apps

**GitHub Action:**
```yaml
- name: Deploy to Azure Static Web Apps
  uses: Azure/static-web-apps-deploy@v1
  with:
    azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
    repo_token: ${{ secrets.GITHUB_TOKEN }}
    action: "upload"
    app_location: "/"
    output_location: "docs"
```

### CLI Commands for Deployment

```bash
# Build with specific base URL
npx documentor build --base-url https://docs.mycompany.com

# Build with environment variables
npx documentor build --env production

# Build and serve locally to preview
npx documentor build && npx documentor serve

# Build with custom config
npx documentor build --config ./config/production.json

# Build with verbose output for CI debugging
npx documentor build --verbose

# Clean build (remove previous build artifacts)
npx documentor build --clean
```

### Automated Version Management

#### Version Deployment Strategy

```yaml
name: Version Documentation

on:
  release:
    types: [published]

jobs:
  version-docs:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Extract version
        id: version
        run: echo "VERSION=${GITHUB_REF#refs/tags/}" >> $GITHUB_OUTPUT

      - name: Build documentation
        run: npx documentor build --version ${{ steps.version.outputs.VERSION }}

      - name: Deploy versioned docs
        run: |
          # Deploy to version-specific path
          aws s3 sync ./docs s3://docs-bucket/${{ steps.version.outputs.VERSION }}/

          # Update latest symlink
          aws s3 sync ./docs s3://docs-bucket/latest/ --delete
```

#### Multi-Version Support Structure

```
docs.mycompany.com/
├── latest/          # Always points to most recent
├── v2.1.0/         # Specific version
├── v2.0.0/
├── v1.5.0/
└── versions.json   # Version metadata
```

### Performance Optimization for CI

#### Caching Strategy

```yaml
- name: Cache Documentor build
  uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      .documentor-cache
      node_modules
    key: ${{ runner.os }}-documentor-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-documentor-

- name: Cache component metadata
  uses: actions/cache@v4
  with:
    path: .documentor-cache/metadata
    key: metadata-${{ hashFiles('src/components/**/*.{tsx,jsx,ts,js}') }}
```

#### Incremental Builds

Documentor will support incremental builds in Phase 3:

```json
{
  "build": {
    "incremental": true,
    "cacheDirectory": ".documentor-cache",
    "watch": ["src/components/**/*.{tsx,jsx}"]
  }
}
```

**Benefits:**
- Only rebuild changed components
- Faster CI/CD pipelines
- Reduced build times from minutes to seconds

### PR Preview Deployments

#### Automatic Preview for Pull Requests

```yaml
name: PR Preview

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  preview:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4

      - name: Build documentation
        run: npx documentor build --base-url /pr-${{ github.event.pull_request.number }}/

      - name: Deploy preview
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --dir=docs --alias=pr-${{ github.event.pull_request.number }}

      - name: Comment preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '📚 Documentation preview: https://pr-${{ github.event.pull_request.number }}--your-site.netlify.app'
            })
```

### Monitoring & Analytics

#### Build Status Badges

Add to your README:

```markdown
![Docs Build](https://github.com/your-org/your-repo/workflows/Build%20Documentation/badge.svg)
![Docs Deployment](https://img.shields.io/badge/docs-live-brightgreen)
```

#### Analytics Integration

```json
{
  "analytics": {
    "google": {
      "trackingId": "G-XXXXXXXXXX"
    },
    "plausible": {
      "domain": "docs.yourcompany.com"
    }
  }
}
```

### Security Considerations

#### Sensitive Data Protection

```yaml
- name: Validate no secrets in docs
  run: |
    # Check for common secret patterns
    if grep -r "PRIVATE_KEY\|SECRET\|PASSWORD" ./docs; then
      echo "Potential secrets found in documentation!"
      exit 1
    fi

- name: Run security audit
  run: npm audit --audit-level=high
```

#### Access Control

For private component libraries:

```yaml
- name: Deploy to private hosting
  env:
    BASIC_AUTH_USERNAME: ${{ secrets.DOCS_USERNAME }}
    BASIC_AUTH_PASSWORD: ${{ secrets.DOCS_PASSWORD }}
  run: |
    # Deploy with authentication
    vercel --prod --build-env BASIC_AUTH=true
```

### NPM Package Distribution

For reusable CLI tool:

```bash
# Install globally
npm install -g @your-org/documentor

# Or use with npx
npx @your-org/documentor build
```

#### Package.json for CLI

```json
{
  "name": "@your-org/documentor",
  "version": "1.0.0",
  "bin": {
    "documentor": "./bin/cli.js"
  },
  "scripts": {
    "prepublishOnly": "npm run build && npm test"
  }
}
```

### Docker Support

#### Dockerfile for CI/CD

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false

COPY . .
RUN npx documentor build

FROM nginx:alpine
COPY --from=builder /app/docs /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose for Local Testing

```yaml
version: '3.8'
services:
  documentor:
    build: .
    ports:
      - "8080:80"
    volumes:
      - ./src:/app/src:ro
    environment:
      - NODE_ENV=production
```

### Integration Examples

#### Monorepo Setup (Nx/Turborepo)

```json
{
  "scripts": {
    "docs:build": "nx run-many --target=docs:build --all",
    "docs:deploy": "nx run-many --target=docs:deploy --all"
  },
  "nx": {
    "targets": {
      "docs:build": {
        "executor": "@nrwl/workspace:run-commands",
        "options": {
          "command": "documentor build --config {projectRoot}/documentor.config.json"
        }
      }
    }
  }
}
```

#### Post-Build Hooks

```json
{
  "build": {
    "hooks": {
      "postBuild": [
        "npm run generate-sitemap",
        "npm run compress-assets",
        "npm run validate-links"
      ]
    }
  }
}
```

### Roadmap Updates

The CI/CD and deployment features are integrated into **Phase 3** of the roadmap:

**Phase 3 Deployment Features:**
- ✅ Static HTML export with SSR
- ✅ GitHub Actions workflow templates
- ✅ Multi-platform deployment support (Vercel, Netlify, AWS, Azure)
- ✅ Incremental build optimization
- ✅ PR preview deployments
- ✅ Version management for documentation
- ✅ Docker containerization
- ✅ CDN optimization and caching strategies

### Phase 3.4: Enhanced JSDoc Directives and Display Templates

**Objective**: Upgrade the parser to use proper JSDoc `@` directives instead of inline comments, and add support for customizable variant display templates. This improves code clarity, follows JSDoc conventions, and provides flexible control over how variant examples are titled in the documentation.

#### Problem Statement

Currently, the system has two limitations:

1. **Non-standard directive syntax**: Using inline comments like `/* @renderVariants: true */` doesn't follow JSDoc conventions
2. **Generic variant titles**: Variant examples display technical prop names like `variant="primary"` instead of user-friendly titles like "Primary Button"

Users need:
- Standard JSDoc `@` directive syntax for better IDE support and clarity
- Ability to customize how variant examples are titled in the documentation
- Template-based approach to generate meaningful, human-readable titles

#### Core Features

##### 1. JSDoc Directive Syntax

**Before (inline comment syntax):**
```typescript
export interface ButtonProps {
  /* Controls the display variant of the button component */
  /* renderVariants: true */
  variant?: ButtonVariant;
}
```

**After (JSDoc `@` directive syntax):**
```typescript
export interface ButtonProps {
  /**
   * Controls the display variant of the button component
   * @renderVariants true
   */
  variant?: ButtonVariant;
}
```

**Key Changes:**
- Use proper JSDoc block comments `/** ... */`
- Directives must start with `@` symbol
- Follows standard JSDoc conventions for better tooling support
- Provides better syntax highlighting and IDE integration

##### 2. Display Template Directive

**New `@displayTemplate` directive** for customizing variant titles:

```typescript
export interface ButtonProps {
  /**
   * Controls the display variant of the button component
   * @renderVariants true
   * @displayTemplate {variant} Button
   */
  variant?: ButtonVariant;
}
```

**Template Syntax:**
- Use curly braces `{propName}` to reference prop values
- Prop values are automatically converted to Initial Uppercase (capitalize first letter)
- Template is applied to each generated variant

**Examples:**

| Prop Value | Template | Resulting Title |
|------------|----------|-----------------|
| `primary` | `{variant} Button` | "Primary Button" |
| `secondary` | `{variant} Button` | "Secondary Button" |
| `outline` | `{variant} Button` | "Outline Button" |
| `small` | `{size} Size` | "Small Size" |
| `large` | `{size} Input Field` | "Large Input Field" |

**Default Behavior:**
If no `@displayTemplate` is provided, fall back to the current format:
- `variant="primary"` → stays as `variant="primary"`

##### 3. Parser Implementation

**Update** `parser/prop-parser.ts`:

```typescript
interface PropMetadata {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  renderVariants?: boolean;
  displayTemplate?: string; // NEW
}

/**
 * Extract JSDoc directives from property comments
 */
function extractJSDocDirectives(jsDoc: JSDoc[]): {
  renderVariants: boolean;
  displayTemplate?: string;
} {
  const directives = {
    renderVariants: false,
    displayTemplate: undefined as string | undefined,
  };

  for (const doc of jsDoc) {
    const tags = doc.tags || [];
    
    for (const tag of tags) {
      const tagName = tag.tagName.getText();
      const tagText = tag.comment?.toString().trim();

      // Parse @renderVariants directive
      if (tagName === 'renderVariants') {
        directives.renderVariants = tagText === 'true';
      }

      // Parse @displayTemplate directive
      if (tagName === 'displayTemplate' && tagText) {
        directives.displayTemplate = tagText;
      }
    }
  }

  return directives;
}

/**
 * Parse property node to extract metadata
 */
function parseProperty(property: PropertySignature): PropMetadata {
  const name = property.getName();
  const type = property.getType().getText();
  const jsDocComments = property.getJsDocs();
  
  // Extract description from JSDoc
  const description = jsDocComments
    .map(doc => doc.getDescription().trim())
    .filter(Boolean)
    .join('\n');

  // Extract directives from JSDoc tags
  const directives = extractJSDocDirectives(jsDocComments);

  return {
    name,
    type,
    description,
    required: !property.hasQuestionToken(),
    defaultValue: extractDefaultValue(property),
    renderVariants: directives.renderVariants,
    displayTemplate: directives.displayTemplate,
  };
}
```

##### 4. Variant Generator with Template Support

**Update** `generator/variant-generator.ts`:

```typescript
interface VariantExample {
  props: Record<string, any>;
  code: string;
  title: string; // NEW: custom title from template
}

/**
 * Apply display template to generate variant title
 * @param template - Template string like "{variant} Button"
 * @param propName - Name of the prop being rendered
 * @param propValue - Value of the prop (e.g., "primary")
 * @returns Formatted title (e.g., "Primary Button")
 */
function applyDisplayTemplate(
  template: string,
  propName: string,
  propValue: string
): string {
  // Convert prop value to Initial Uppercase
  const formattedValue = propValue.charAt(0).toUpperCase() + propValue.slice(1);
  
  // Replace {propName} with formatted value
  const placeholder = `{${propName}}`;
  return template.replace(placeholder, formattedValue);
}

/**
 * Generate variant title based on template or default format
 */
function generateVariantTitle(
  propName: string,
  propValue: string,
  displayTemplate?: string
): string {
  if (displayTemplate) {
    return applyDisplayTemplate(displayTemplate, propName, propValue);
  }
  
  // Default format: variant="primary"
  return `${propName}="${propValue}"`;
}

/**
 * Generate variant examples for a property
 */
function generateVariantsForProp(
  componentName: string,
  propMetadata: PropMetadata,
  propValues: string[]
): VariantExample[] {
  const variants: VariantExample[] = [];

  for (const value of propValues) {
    // Generate title using template or default
    const title = generateVariantTitle(
      propMetadata.name,
      value,
      propMetadata.displayTemplate
    );

    // Generate code and props
    const code = `<${componentName} ${propMetadata.name}="${value}">Example</${componentName}>`;
    const props = {
      [propMetadata.name]: value,
      children: 'Example',
    };

    variants.push({ props, code, title });
  }

  return variants;
}
```

##### 5. Update Metadata Schema

**Update** `types/metadata.ts`:

```typescript
export interface PropInfo {
  name: string;
  type: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  renderVariants?: boolean;
  displayTemplate?: string; // NEW
}

export interface VariantExample {
  props: Record<string, any>;
  code: string;
  title: string; // NEW: custom title
}

export interface ComponentMetadata {
  name: string;
  description?: string;
  props: PropInfo[];
  variants: VariantExample[];
  cssVariables: CSSVariable[];
  filePath: string;
  imports: string[];
}
```

##### 6. UI Display Updates

**Update** `website/src/components/VariantShowcase.tsx`:

```typescript
const VariantShowcase: React.FC<VariantShowcaseProps> = ({ componentName, variants }) => {
  return (
    <div className="variant-showcase">
      <h2>Examples ({variants.length})</h2>
      <div className="variants-grid">
        {variants.map((variant, index) => (
          <div key={index} className="variant-card">
            <div className="variant-header">
              {/* Use custom title from metadata instead of generating from props */}
              <h3 className="variant-title">{variant.title}</h3>
              <button
                className="copy-button"
                onClick={() => copyCode(variant.code, index)}
              >
                Copy
              </button>
            </div>

            <div className="variant-preview">
              <div className="preview-content">
                <LivePreview
                  componentName={componentName}
                  props={variant.props}
                />
              </div>
            </div>

            <div className="variant-code">
              <SyntaxHighlighter language="jsx">
                {variant.code}
              </SyntaxHighlighter>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### Implementation Steps

**Phase 3.4 Deliverables:**

1. **Parser Updates**
   - [ ] Update `prop-parser.ts` to parse `@renderVariants` and `@displayTemplate` JSDoc tags
   - [ ] Remove support for old inline comment syntax (breaking change)
   - [ ] Add validation for directive syntax
   - [ ] Extract display template from JSDoc tags

2. **Variant Generator Updates**
   - [ ] Implement `applyDisplayTemplate()` function
   - [ ] Add Initial Uppercase text transformation
   - [ ] Update `generateVariantsForProp()` to use display templates
   - [ ] Fall back to default format when no template provided
   - [ ] Add support for multiple prop placeholders in templates (future enhancement)

3. **Type Definitions**
   - [ ] Add `displayTemplate?: string` to `PropInfo` interface
   - [ ] Add `title: string` to `VariantExample` interface
   - [ ] Update all dependent types

4. **Component Updates**
   - [ ] Update `Button.tsx` to use new JSDoc directive syntax (already done)
   - [ ] Update `InputField.tsx` to use new JSDoc directive syntax
   - [ ] Add `@displayTemplate` examples to reference components

5. **UI Updates**
   - [ ] Update `VariantShowcase.tsx` to display `variant.title` instead of generating from props
   - [ ] Update variant card header styling if needed
   - [ ] Ensure title displays correctly across all screen sizes

6. **Testing**
   - [ ] Test parser with various `@displayTemplate` formats
   - [ ] Verify Initial Uppercase transformation
   - [ ] Test fallback behavior when no template provided
   - [ ] Verify backward compatibility (components without directives still work)

7. **Documentation**
   - [ ] Update PROJECT.md with new directive syntax (this file)
   - [ ] Update THEME_SYSTEM.md if relevant
   - [ ] Add examples to reference components
   - [ ] Document template syntax and placeholder rules

#### Breaking Changes

**Directive Syntax Change:**
- Old: `/* renderVariants: true */` (inline comment)
- New: `@renderVariants true` (JSDoc tag)

**Migration Required:**
Components using the old inline comment syntax must be updated to use JSDoc blocks with `@` directives:

```diff
- /* Controls the display variant */
- /* renderVariants: true */
+ /**
+  * Controls the display variant
+  * @renderVariants true
+  */
```

#### Advanced Template Syntax (Future Enhancement)

For Phase 3.5+, consider supporting:

**Multiple Placeholders:**
```typescript
/**
 * @displayTemplate {size} {variant} Button
 */
```
Result: "Large Primary Button"

**Conditional Templates:**
```typescript
/**
 * @displayTemplate {variant ? "{variant} Button" : "Default Button"}
 */
```

**Custom Transformations:**
```typescript
/**
 * @displayTemplate {variant|uppercase} BUTTON
 */
```
Result: "PRIMARY BUTTON"

#### User Benefits

1. **Clearer Code**: JSDoc conventions improve readability and IDE support
2. **Better Documentation**: Custom titles make examples more intuitive
3. **Flexibility**: Template system adapts to different component needs
4. **Professional Presentation**: Human-readable titles vs technical prop strings
5. **Consistency**: Standard JSDoc syntax across all directives

---

**Date**: December 10, 2024  
**Phase**: 3.4 - Enhanced JSDoc Directives and Display Templates  
**Status**: Complete
