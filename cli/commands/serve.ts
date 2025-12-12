import express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { loadConfig } from '../utils/config-loader';

export interface ServeOptions {
  port?: string;
  dir?: string;
  config?: string;
}

export async function serveCommand(options: ServeOptions) {
  // Load config file to get defaults
  let config;
  try {
    config = await loadConfig(options.config || './docspark.config.json');
  } catch (error) {
    // Config is optional for serve command, use defaults if not found
    config = { output: { directory: './docs' }, server: { port: 8080 } };
  }

  // Command line options override config
  const port = options.port ? parseInt(options.port) : (config.server?.port || 8080);
  const directory = path.resolve(options.dir || config.output.directory);

  if (!fs.existsSync(directory)) {
    console.error(`❌ Directory not found: ${directory}`);
    console.error('💡 Run "docspark build" first to generate documentation.');
    process.exit(1);
  }

  const app = express();

  // Serve metadata as JSON API (must be before static files middleware)
  app.use('/api/metadata', express.static(path.join(directory, 'metadata')));

  // Serve static files
  app.use(express.static(directory));

  // SPA fallback - serve index.html for all routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(directory, 'index.html'));
  });

  app.listen(port, () => {
    console.log(`✅ Serving documentation at http://localhost:${port}`);
    console.log(`📂 Directory: ${directory}\n`);
  });
}
