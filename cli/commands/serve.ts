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

  // Try to listen on the port, with automatic fallback
  await tryListenOnPort(app, port, directory);
}

/**
 * Try to listen on a port, automatically trying next ports if busy
 */
async function tryListenOnPort(app: express.Application, startPort: number, directory: string, maxAttempts: number = 10): Promise<void> {
  let currentPort = startPort;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const server = app.listen(currentPort)
          .on('listening', () => {
            if (currentPort !== startPort) {
              console.log(`⚠️  Port ${startPort} was in use, using port ${currentPort} instead\n`);
            }
            console.log(`✅ Serving documentation at http://localhost:${currentPort}`);
            console.log(`📂 Directory: ${directory}\n`);
            resolve();
          })
          .on('error', (err: NodeJS.ErrnoException) => {
            if (err.code === 'EADDRINUSE') {
              reject(err);
            } else {
              // For other errors, throw immediately
              throw err;
            }
          });
      });
      // Success! Port is available
      return;
    } catch (err: any) {
      if (err.code === 'EADDRINUSE' && attempt < maxAttempts - 1) {
        // Port is in use, try next port
        currentPort++;
        continue;
      } else {
        // Either not a port-in-use error, or we've exhausted attempts
        console.error(`❌ Failed to start server. Tried ports ${startPort}-${currentPort}.`);
        console.error('All ports appear to be in use. Please specify a different port or free up one of these ports.');
        process.exit(1);
      }
    }
  }
}
