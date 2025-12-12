export interface PropMetadata {
  type: string;
  values?: string[];
  optional: boolean;
  default?: string;
  description?: string;
  renderVariants?: boolean;
  displayTemplate?: string;
  hideInDocs?: boolean;
  example?: string;
}

export interface ComponentMetadata {
  name: string;
  description: string;
  filePath: string;
  props: Record<string, PropMetadata>;
  styleFiles: string[];
}

export interface VariantExample {
  props: Record<string, any>;
  code: string;
  title: string;
}

export interface CSSVariable {
  name: string;
  description: string;
  default?: string;
}

export interface CoverageMetrics {
  statements: { covered: number; total: number; percentage: number };
  branches: { covered: number; total: number; percentage: number };
  functions: { covered: number; total: number; percentage: number };
  lines: { covered: number; total: number; percentage: number };
}

export interface ComponentCoverage {
  componentName: string;
  filePath: string;
  metrics: CoverageMetrics;
  hasTests: boolean;
  testFilePath?: string;
}

export interface ComponentDocumentation {
  component: ComponentMetadata;
  variants: VariantExample[];
  cssVariables: CSSVariable[];
  coverage?: ComponentCoverage;
}

export interface ComponentSummary {
  name: string;
  description: string;
  filePath: string;
  variantCount: number;
  cssVariableCount: number;
}

export interface IndexMetadata {
  config: {
    name: string;
    description?: string;
    version?: string;
  };
  components: ComponentSummary[];
  stats: {
    componentCount: number;
    variantCount: number;
    cssVariableCount: number;
  };
}
