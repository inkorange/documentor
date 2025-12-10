import { startDevServer } from '../../server/server';
import { loadConfig } from '../utils/config-loader';

export interface DevOptions {
  port: string;
  config: string;
}

export async function devCommand(options: DevOptions) {
  console.log('🚀 Starting Documentor development server...\n');

  try {
    const config = await loadConfig(options.config);
    const port = parseInt(options.port) || config.server?.port || 6006;

    console.log(`📖 Project: ${config.name}`);
    console.log(`📂 Source: ${config.source.include.join(', ')}`);
    console.log(`🌐 Port: ${port}\n`);

    await startDevServer(config, port);

    console.log(`✅ Server running at http://localhost:${port}`);
    console.log('👀 Watching for file changes...\n');
  } catch (error) {
    console.error('❌ Error starting dev server:', error);
    process.exit(1);
  }
}
