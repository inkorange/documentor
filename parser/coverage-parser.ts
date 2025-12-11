import * as fs from 'fs';
import * as path from 'path';

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

/**
 * Parse Jest coverage data from coverage-summary.json
 */
export class CoverageParser {
  /**
   * Extract coverage data for a specific component file
   */
  extractComponentCoverage(componentPath: string): ComponentCoverage | null {
    const coverageFile = path.join(process.cwd(), 'coverage', 'coverage-summary.json');

    if (!fs.existsSync(coverageFile)) {
      console.warn('⚠️  No coverage data found. Run tests with --coverage to generate coverage.');
      return null;
    }

    try {
      const coverageData = JSON.parse(fs.readFileSync(coverageFile, 'utf-8'));
      const normalizedPath = path.resolve(componentPath);

      // Find coverage data for this specific file
      let fileCoverage = coverageData[normalizedPath];

      // Try relative path if absolute doesn't work
      if (!fileCoverage) {
        const relativePath = path.relative(process.cwd(), normalizedPath);
        fileCoverage = coverageData[relativePath];
      }

      // Try with leading slash
      if (!fileCoverage) {
        const withSlash = '/' + path.relative(process.cwd(), normalizedPath);
        fileCoverage = coverageData[withSlash];
      }

      if (!fileCoverage) {
        // Component not in coverage report (no tests)
        return this.createEmptyCoverage(componentPath);
      }

      const componentName = path.basename(componentPath, path.extname(componentPath));
      const testFilePath = this.findTestFile(componentPath);

      return {
        componentName,
        filePath: componentPath,
        metrics: {
          statements: {
            covered: fileCoverage.statements.covered,
            total: fileCoverage.statements.total,
            percentage: fileCoverage.statements.pct,
          },
          branches: {
            covered: fileCoverage.branches.covered,
            total: fileCoverage.branches.total,
            percentage: fileCoverage.branches.pct,
          },
          functions: {
            covered: fileCoverage.functions.covered,
            total: fileCoverage.functions.total,
            percentage: fileCoverage.functions.pct,
          },
          lines: {
            covered: fileCoverage.lines.covered,
            total: fileCoverage.lines.total,
            percentage: fileCoverage.lines.pct,
          },
        },
        hasTests: testFilePath !== null,
        testFilePath: testFilePath || undefined,
      };
    } catch (error) {
      console.error(`Error parsing coverage for ${componentPath}:`, error);
      return null;
    }
  }

  /**
   * Create empty coverage data for components without tests
   */
  private createEmptyCoverage(componentPath: string): ComponentCoverage {
    const componentName = path.basename(componentPath, path.extname(componentPath));
    const testFilePath = this.findTestFile(componentPath);

    return {
      componentName,
      filePath: componentPath,
      metrics: {
        statements: { covered: 0, total: 0, percentage: 0 },
        branches: { covered: 0, total: 0, percentage: 0 },
        functions: { covered: 0, total: 0, percentage: 0 },
        lines: { covered: 0, total: 0, percentage: 0 },
      },
      hasTests: testFilePath !== null,
      testFilePath: testFilePath || undefined,
    };
  }

  /**
   * Find the test file for a component
   */
  private findTestFile(componentPath: string): string | null {
    const dir = path.dirname(componentPath);
    const baseName = path.basename(componentPath, path.extname(componentPath));

    // Common test file patterns
    const patterns = [
      `${baseName}.test.tsx`,
      `${baseName}.test.ts`,
      `${baseName}.spec.tsx`,
      `${baseName}.spec.ts`,
      `__tests__/${baseName}.test.tsx`,
      `__tests__/${baseName}.spec.tsx`,
    ];

    for (const pattern of patterns) {
      const testPath = path.join(dir, pattern);
      if (fs.existsSync(testPath)) {
        return testPath;
      }
    }

    return null;
  }

  /**
   * Get coverage badge color based on percentage
   */
  getCoverageBadgeColor(percentage: number): string {
    if (percentage >= 80) return 'green';
    if (percentage >= 60) return 'yellow';
    if (percentage >= 40) return 'orange';
    return 'red';
  }

  /**
   * Get coverage badge label based on percentage
   */
  getCoverageBadgeLabel(percentage: number): string {
    if (percentage >= 80) return 'excellent';
    if (percentage >= 60) return 'good';
    if (percentage >= 40) return 'fair';
    return 'poor';
  }
}
