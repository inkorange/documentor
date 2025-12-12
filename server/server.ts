import express from 'express';
import * as path from 'path';
import { DocSparkConfig } from '../config/schema';
import { buildDocumentation } from '../generator/builder';
import { watchFiles } from './watcher';

export async function startDevServer(config: DocSparkConfig, port: number): Promise<void> {
  const app = express();

  // Initial build
  console.log('🔨 Building documentation...\n');
  await buildDocumentation(config, true);

  const outputDir = config.output.directory;

  // Serve metadata as JSON
  app.use('/api/metadata', express.static(path.join(outputDir, 'metadata')));

  // Serve static files from the website build
  const websitePath = path.join(__dirname, '../website/build');
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

  app.listen(port);
}
