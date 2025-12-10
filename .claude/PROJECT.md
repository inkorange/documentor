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
