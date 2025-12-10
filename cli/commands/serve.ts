import express from 'express';
import * as path from 'path';
import * as fs from 'fs';

export interface ServeOptions {
  port: string;
  dir: string;
}

export async function serveCommand(options: ServeOptions) {
  const port = parseInt(options.port) || 8080;
  const directory = path.resolve(options.dir);

  if (!fs.existsSync(directory)) {
    console.error(`❌ Directory not found: ${directory}`);
    console.error('💡 Run "documentor build" first to generate documentation.');
    process.exit(1);
  }

  const app = express();

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
