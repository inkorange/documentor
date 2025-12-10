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
   * @default 20
   */
  maxPermutations: z.number().int().positive().optional(),

  /**
   * Default values to use for common prop types
   * @example { "children": "Example" }
   */
  defaultValues: z.object({
    string: z.string().optional(),
    number: z.number().optional(),
    children: z.string().optional(),
  }).optional(),
}).describe('Variant generation configuration');

/**
 * Theme token configuration schema
 * Supports both legacy string format and new object format with background
 */
const ThemeTokenSchema = z.union([
  z.string(), // Legacy format: "src/themes/light.css"
  z.object({
    source: z.string().min(1, 'Theme source path is required'),
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Background must be a valid hex color (e.g., #FFFFFF)').optional(),
  }),
]);

/**
 * Theme configuration schema
 */
const ThemeSchema = z.object({
  /**
   * Array of theme token configurations
   * Maps theme names to their CSS file paths and optional backgrounds
   * @example [{ "light": "src/themes/light.css", "dark": "src/themes/dark.css" }]
   */
  tokens: z.array(z.record(z.string(), ThemeTokenSchema)).optional(),

  /**
   * Default theme to load on page load
   * @example "light"
   */
  defaultTheme: z.string().optional(),

  /**
   * Primary color for documentation UI
   * @example "#0066cc"
   */
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Primary color must be a valid hex color').optional(),

  /**
   * Path to custom logo image
   * @example "./assets/logo.svg"
   */
  logo: z.string().optional(),

  /**
   * Path to custom favicon
   * @example "./assets/favicon.ico"
   */
  favicon: z.string().optional(),
}).describe('Theme and branding configuration');

/**
 * Test coverage configuration schema
 */
const CoverageSchema = z.object({
  /**
   * Whether to enable test coverage tracking
   * @default true
   */
  enabled: z.boolean().optional(),

  /**
   * Glob patterns to match test files
   * @example ["**\/*.test.{ts,tsx}", "**\/*.spec.{ts,tsx}"]
   */
  testPatterns: z.array(z.string()).optional(),

  /**
   * Path to coverage report file
   * @example "./coverage/coverage-summary.json"
   */
  coverageReportPath: z.string().optional(),

  /**
   * Minimum coverage thresholds
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
 * All fields are validated according to their type and constraints
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

/**
 * Infer TypeScript type from Zod schema
 */
export type DocumentorConfig = z.infer<typeof DocumentorConfigSchema>;

/**
 * Format Zod validation errors into human-readable messages
 */
export function formatValidationError(error: z.ZodError): string {
  const errors = error.issues.map((err: any) => {
    const path = err.path.join('.');
    const message = err.message;

    if (err.code === 'invalid_type') {
      return `  • ${path}: Expected ${err.expected}, received ${err.received}`;
    }

    if (err.code === 'too_small' && err.type === 'array') {
      return `  • ${path}: ${message}`;
    }

    if (err.code === 'invalid_string' && err.validation === 'regex') {
      return `  • ${path}: ${message}`;
    }

    if (err.code === 'unrecognized_keys') {
      const keys = err.keys.join(', ');
      return `  • Unrecognized configuration keys: ${keys}`;
    }

    return `  • ${path}: ${message}`;
  });

  return `Configuration validation failed:\n${errors.join('\n')}`;
}
