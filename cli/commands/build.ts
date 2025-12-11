import { buildDocumentation } from '../../generator/builder';
import { loadConfig } from '../utils/config-loader';
import * as fs from 'fs';
import * as path from 'path';
import { copyTemplateToOutput } from '../utils/template-copier';

export interface BuildOptions {
  config: string;
  baseUrl?: string;
  clean?: boolean;
  verbose?: boolean;
}

export async function buildCommand(options: BuildOptions) {
  console.log('📦 Building documentation...\n');

  try {
    const config = await loadConfig(options.config);

    if (options.baseUrl) {
      config.output.baseUrl = options.baseUrl;
    }

    const outputDir = config.output.directory;

    // Clean output directory if requested
    if (options.clean && fs.existsSync(outputDir)) {
      console.log(`🧹 Cleaning ${outputDir}...`);
      fs.rmSync(outputDir, { recursive: true });
    }

    // Create output directory
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`📖 Project: ${config.name}`);
    console.log(`📂 Source: ${config.source.include.join(', ')}`);
    console.log(`📁 Output: ${outputDir}`);
    console.log(`🔗 Base URL: ${config.output.baseUrl}\n`);

    const result = await buildDocumentation(config, options.verbose);

    // Copy template website to output directory
    console.log('\n📋 Copying website template...');
    await copyTemplateToOutput(outputDir, options.verbose);

    console.log('\n✅ Build complete!');
    console.log(`📄 Generated ${result.componentCount} component pages`);
    console.log(`📊 Total variants: ${result.variantCount}`);
    console.log(`🎨 CSS variables: ${result.cssVariableCount}`);
    console.log(`\n📂 Output: ${path.resolve(outputDir)}`);
    console.log(`💡 Run "documentor serve" to preview your documentation`);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}
