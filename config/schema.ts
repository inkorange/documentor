/**
 * Configuration schema for DocSpark
 * This defines the TypeScript types for configuration
 */

export interface DocSparkConfig {
  name: string;
  description?: string;
  version?: string;

  source: {
    include: string[];
    exclude?: string[];
    styleFiles?: string[];
  };

  output: {
    directory: string;
    baseUrl?: string;
    staticAssets?: string;
  };

  server?: {
    port?: number;
    open?: boolean;
  };

  variants?: {
    autoGenerate?: boolean;
    maxPermutations?: number;
    defaultValues?: {
      string?: string;
      number?: number;
      children?: string;
    };
  };

  theme?: {
    tokens?: Array<Record<string, string | { source: string; background?: string }>>;
    defaultTheme?: string;
    primaryColor?: string;
    logo?: string;
    favicon?: string;
    customStylesheet?: string;
  };

  coverage?: {
    enabled?: boolean;
    testPatterns?: string[];
    coverageReportPath?: string;
    thresholds?: {
      statements?: number;
      branches?: number;
      functions?: number;
      lines?: number;
    };
    displayInSidebar?: boolean;
    badgeStyle?: string;
  };

  features?: {
    search?: boolean;
    darkMode?: boolean;
    codeSnippets?: boolean;
    playground?: boolean;
    testCoverage?: boolean;
  };
}

export const defaultConfig: Partial<DocSparkConfig> = {
  source: {
    include: ['src/components/**/*.{tsx,jsx}'],
    exclude: ['**/*.test.{tsx,jsx}', '**/*.stories.{tsx,jsx}'],
    styleFiles: ['.css', '.scss', '.module.css', '.module.scss'],
  },
  output: {
    directory: './docs',
    baseUrl: '/',
  },
  server: {
    port: 6006,
    open: true,
  },
  variants: {
    autoGenerate: true,
    maxPermutations: 20,
    defaultValues: {
      string: 'Example text',
      number: 42,
      children: 'Button Text',
    },
  },
  features: {
    search: true,
    darkMode: true,
    codeSnippets: true,
    playground: false,
    testCoverage: true,
  },
};
