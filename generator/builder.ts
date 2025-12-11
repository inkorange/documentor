import { glob } from 'glob';
import { ComponentParser } from '../parser/component-parser';
import { StyleParser } from '../parser/style-parser';
import { CoverageParser } from '../parser/coverage-parser';
import { ThemeParser } from '../parser/theme-parser';
import { VariantGenerator } from './variant-generator';
import { DocumentorConfig } from '../config/schema';
import * as fs from 'fs';
import * as path from 'path';

export interface BuildResult {
  componentCount: number;
  variantCount: number;
  cssVariableCount: number;
}

export interface ComponentDocumentation {
  component: any;
  variants: any[];
  cssVariables: any[];
  coverage?: any;
}

export async function buildDocumentation(
  config: DocumentorConfig,
  verbose: boolean = false
): Promise<BuildResult> {
  const componentParser = new ComponentParser();
  const styleParser = new StyleParser();
  const coverageParser = new CoverageParser();
  const themeParser = new ThemeParser();
  const variantGenerator = new VariantGenerator(
    config.variants?.maxPermutations,
    config.variants?.defaultValues
  );

  const outputDir = config.output.directory;
  const metadataDir = path.join(outputDir, 'metadata');

  // Create metadata directory
  if (!fs.existsSync(metadataDir)) {
    fs.mkdirSync(metadataDir, { recursive: true });
  }

  // Parse and copy theme files
  if (config.theme?.tokens && Array.isArray(config.theme.tokens)) {
    const themeMap = themeParser.parseThemeConfig(config);
    const themes: any[] = [];

    if (themeMap.size > 0) {
      if (verbose) console.log(`\n🎨 Loading ${themeMap.size} theme(s)...`);

      const themesDir = path.join(outputDir, 'themes');
      if (!fs.existsSync(themesDir)) {
        fs.mkdirSync(themesDir, { recursive: true });
      }

      for (const [themeName, themeConfig] of themeMap.entries()) {
        try {
          const theme = await themeParser.parseThemeFile(themeConfig.source);
          themes.push({
            id: theme.id,
            name: theme.name,
            filePath: theme.filePath,
            background: themeConfig.background,
            tokenCount: theme.tokens.length,
            metadata: theme.metadata
          });

          // Copy theme CSS file to output directory
          const sourceFile = path.resolve(process.cwd(), theme.filePath);
          const targetFile = path.join(themesDir, `${theme.id}.css`);
          fs.copyFileSync(sourceFile, targetFile);

          if (verbose) {
            const bgInfo = themeConfig.background ? ` (bg: ${themeConfig.background})` : '';
            console.log(`  ✓ Loaded "${theme.name}" theme with ${theme.tokens.length} tokens${bgInfo}`);
          }
        } catch (error) {
          if (verbose) {
            console.error(`  ✗ Failed to load ${themeName} theme from ${themeConfig.source}:`, error);
          }
        }
      }

      // Generate theme index JSON
      const themeIndex = {
        themes,
        defaultTheme: themes[0]?.id || 'light'
      };

      const themesOutputPath = path.join(metadataDir, 'themes.json');
      fs.writeFileSync(themesOutputPath, JSON.stringify(themeIndex, null, 2));

      if (verbose) {
        console.log(`  💾 Saved theme index to ${themesOutputPath}`);
      }
    }
  }

  let componentCount = 0;
  let variantCount = 0;
  let cssVariableCount = 0;

  const allComponents: ComponentDocumentation[] = [];

  // Find all component files
  if (verbose) console.log('🔍 Scanning for components...');

  for (const pattern of config.source.include) {
    const files = await glob(pattern, {
      ignore: config.source.exclude || [],
    });

    if (verbose) console.log(`📄 Found ${files.length} files matching ${pattern}`);

    for (const file of files) {
      if (verbose) console.log(`\n📝 Parsing ${file}...`);

      // Parse component
      const component = await componentParser.parseComponent(file);
      if (!component) {
        if (verbose) console.log(`⚠️  Skipped ${file} (no component found)`);
        continue;
      }

      componentCount++;

      // Parse style files
      const cssVariables: any[] = [];
      for (const styleImport of component.styleFiles) {
        const stylePath = styleParser.resolveStylePath(file, styleImport);
        if (fs.existsSync(stylePath)) {
          const styleData = await styleParser.parseStyleFile(stylePath);
          cssVariables.push(...styleData.cssVariables);
          cssVariableCount += styleData.cssVariables.length;

          if (verbose) {
            console.log(`  🎨 Found ${styleData.cssVariables.length} CSS variables in ${styleImport}`);
          }
        }
      }

      // Generate variants
      const variants = variantGenerator.generateVariants(component);
      variantCount += variants.length;

      if (verbose) {
        console.log(`  ✨ Generated ${variants.length} variants`);
      }

      // Extract coverage data
      const coverage = coverageParser.extractComponentCoverage(file);
      if (coverage && verbose) {
        const avgCoverage = (
          coverage.metrics.statements.percentage +
          coverage.metrics.branches.percentage +
          coverage.metrics.functions.percentage +
          coverage.metrics.lines.percentage
        ) / 4;
        console.log(`  📊 Coverage: ${avgCoverage.toFixed(1)}% (${coverage.hasTests ? 'has tests' : 'no tests'})`);
      }

      const documentation: ComponentDocumentation = {
        component,
        variants,
        cssVariables,
        coverage,
      };

      allComponents.push(documentation);

      // Write component metadata to file
      const metadataFile = path.join(metadataDir, `${component.name}.json`);
      fs.writeFileSync(metadataFile, JSON.stringify(documentation, null, 2));

      if (verbose) {
        console.log(`  💾 Saved metadata to ${metadataFile}`);
      }
    }
  }

  // Write index file with all components
  const indexFile = path.join(metadataDir, 'index.json');
  const index = {
    config: {
      name: config.name,
      description: config.description,
      version: config.version,
    },
    components: allComponents.map(doc => ({
      name: doc.component.name,
      description: doc.component.description,
      filePath: doc.component.filePath,
      variantCount: doc.variants.length,
      cssVariableCount: doc.cssVariables.length,
    })),
    stats: {
      componentCount,
      variantCount,
      cssVariableCount,
    },
  };

  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));

  if (verbose) {
    console.log(`\n💾 Saved index to ${indexFile}`);
  }

  return {
    componentCount,
    variantCount,
    cssVariableCount,
  };
}
