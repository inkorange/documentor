import express from 'express';
import * as path from 'path';
import { DocSparkConfig } from '../config/schema';
import { buildDocumentation } from '../generator/builder';
import { watchFiles } from './watcher';

export async function startDevServer(config: DocSparkConfig, port: number): Promise<number> {
  const app = express();

  // Initial build
  console.log('🔨 Building documentation...\n');
  await buildDocumentation(config, true);

  const outputDir = config.output.directory;

  // Serve metadata as JSON
  app.use('/api/metadata', express.static(path.join(outputDir, 'metadata')));

  // Serve static files from the website build
  // In development: website/build directory in project root
  // This is only used for dev server, not production builds
  const websitePath = path.join(process.cwd(), 'website/build');
  if (require('fs').existsSync(websitePath)) {
    app.use(express.static(websitePath));
  }

  // SPA fallback
  app.get('*', (req, res) => {
    const indexPath = path.join(websitePath, 'index.html');
    if (require('fs').existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.json({
        message: 'Documentor Dev Server',
        api: '/api/metadata',
      });
    }
  });

  // Start file watcher
  watchFiles(config, async () => {
    console.log('\n🔄 Files changed, rebuilding...');
    await buildDocumentation(config, false);
    console.log('✅ Rebuild complete\n');
  });

  // Try to listen on the port, with automatic fallback
  const actualPort = await tryListenOnPort(app, port);
  return actualPort;
}

/**
 * Try to listen on a port, automatically trying next ports if busy
 */
async function tryListenOnPort(app: express.Application, startPort: number, maxAttempts: number = 10): Promise<number> {
  let currentPort = startPort;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      await new Promise<void>((resolve, reject) => {
        const server = app.listen(currentPort)
          .on('listening', () => {
            if (currentPort !== startPort) {
              console.log(`⚠️  Port ${startPort} was in use, using port ${currentPort} instead`);
            }
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
      return currentPort;
    } catch (err: any) {
      if (err.code === 'EADDRINUSE' && attempt < maxAttempts - 1) {
        // Port is in use, try next port
        currentPort++;
        continue;
      } else {
        // Either not a port-in-use error, or we've exhausted attempts
        throw new Error(
          `Failed to start server. Tried ports ${startPort}-${currentPort}. ` +
          `All ports appear to be in use. Please specify a different port or free up one of these ports.`
        );
      }
    }
  }

  // This should never be reached, but TypeScript requires a return
  throw new Error('Failed to start server after all attempts');
}
