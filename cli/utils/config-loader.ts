import * as fs from 'fs';
import * as path from 'path';
import { DocSparkConfig, defaultConfig } from '../../config/schema';
import { DocSparkConfigSchema, formatValidationError } from '../../config/validation';
import { ZodError } from 'zod';

export async function loadConfig(configPath: string): Promise<DocSparkConfig> {
  const resolvedPath = path.resolve(configPath);

  if (!fs.existsSync(resolvedPath)) {
    console.warn(`⚠️  Config file not found: ${resolvedPath}`);
    console.log('📝 Using default configuration\n');
    return {
      name: 'Component Library',
      ...defaultConfig,
    } as DocSparkConfig;
  }

  try {
    const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
    const userConfig = JSON.parse(fileContent);

    // Merge with defaults
    const mergedConfig = {
      ...defaultConfig,
      ...userConfig,
      source: {
        ...defaultConfig.source,
        ...userConfig.source,
      },
      output: {
        ...defaultConfig.output,
        ...userConfig.output,
      },
      server: {
        ...defaultConfig.server,
        ...userConfig.server,
      },
      variants: {
        ...defaultConfig.variants,
        ...userConfig.variants,
      },
      features: {
        ...defaultConfig.features,
        ...userConfig.features,
      },
    };

    // Validate configuration with Zod
    try {
      const validatedConfig = DocSparkConfigSchema.parse(mergedConfig);
      console.log('✅ Configuration validated successfully\n');
      return validatedConfig as unknown as DocSparkConfig;
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        const errorMessage = formatValidationError(validationError);
        console.error(`❌ ${errorMessage}\n`);
        console.error('Please fix the configuration errors and try again.\n');
        process.exit(1);
      }
      throw validationError;
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error(`❌ Invalid JSON in config file: ${resolvedPath}`);
      console.error(`   ${error.message}\n`);
      process.exit(1);
    }
    console.error(`❌ Error loading config file: ${error}`);
    throw error;
  }
}
