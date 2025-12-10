import * as fs from 'fs';
import * as path from 'path';
import { DocumentorConfig, defaultConfig } from '../../config/schema';

export async function loadConfig(configPath: string): Promise<DocumentorConfig> {
  const resolvedPath = path.resolve(configPath);

  if (!fs.existsSync(resolvedPath)) {
    console.warn(`⚠️  Config file not found: ${resolvedPath}`);
    console.log('📝 Using default configuration\n');
    return {
      name: 'Component Library',
      ...defaultConfig,
    } as DocumentorConfig;
  }

  try {
    const fileContent = fs.readFileSync(resolvedPath, 'utf-8');
    const userConfig = JSON.parse(fileContent);

    // Merge with defaults
    const config: DocumentorConfig = {
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

    return config;
  } catch (error) {
    console.error(`❌ Error loading config file: ${error}`);
    throw error;
  }
}
