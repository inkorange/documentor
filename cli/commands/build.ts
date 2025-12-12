import { buildDocumentation } from '../../generator/builder';
import { loadConfig } from '../utils/config-loader';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { copyTemplateToOutput } from '../utils/template-copier';

export interface BuildOptions {
  config: string;
  baseUrl?: string;
  clean?: boolean;
  verbose?: boolean;
}

/**
 * Run npm test with coverage flag
 */
async function runTestsWithCoverage(verbose: boolean): Promise<boolean> {
  return new Promise((resolve) => {
    console.log('🧪 Running tests with coverage...\n');

    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    let output = '';

    const testProcess = spawn(npmCommand, ['test', '--', '--coverage', '--watchAll=false'], {
      stdio: verbose ? 'inherit' : 'pipe',
      shell: true,
    });

    // Capture output to check for "No tests found"
    if (!verbose && testProcess.stdout) {
      testProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
    }
    if (!verbose && testProcess.stderr) {
      testProcess.stderr.on('data', (data) => {
        output += data.toString();
      });
    }

    testProcess.on('close', (code) => {
      // Check if no tests were found
      if (output.includes('No tests found') || output.includes('no test specified')) {
        console.warn('⚠️  No tests found. Make sure you have a "test" script in package.json and test files exist.\n');
        console.warn('Continuing with build without coverage data...\n');
        resolve(false);
      } else if (code === 0) {
        console.log('✅ Tests completed successfully\n');
        resolve(true);
      } else {
        console.warn(`⚠️  Tests exited with code ${code}, continuing with build...\n`);
        if (verbose) {
          console.warn('Hint: Make sure your package.json has a valid "test" script configured.\n');
        }
        resolve(false);
      }
    });

    testProcess.on('error', (error) => {
      console.warn(`⚠️  Failed to run tests: ${error.message}`);
      console.warn('Continuing with build without coverage data...\n');
      resolve(false);
    });
  });
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

    // Run tests with coverage if enabled in config
    if (config.coverage?.enabled === true) {
      await runTestsWithCoverage(options.verbose || false);
    }

    const result = await buildDocumentation(config, options.verbose);

    // Copy template website to output directory
    console.log('\n📋 Copying website template...');
    await copyTemplateToOutput(outputDir, options.verbose);

    console.log('\n✅ Build complete!');
    console.log(`📄 Generated ${result.componentCount} component pages`);
    console.log(`📊 Total variants: ${result.variantCount}`);
    console.log(`🎨 CSS variables: ${result.cssVariableCount}`);
    console.log(`\n📂 Output: ${path.resolve(outputDir)}`);
    console.log(`💡 Run "docspark serve" to preview your documentation`);
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}
