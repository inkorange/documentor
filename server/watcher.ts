import chokidar from 'chokidar';
import { DocumentorConfig } from '../config/schema';

export function watchFiles(config: DocumentorConfig, onChange: () => void): void {
  const patterns = [...config.source.include];

  // Add style file patterns
  if (config.source.styleFiles) {
    patterns.push(...config.source.styleFiles.map(ext => `**/*${ext}`));
  }

  const watcher = chokidar.watch(patterns, {
    ignored: config.source.exclude,
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on('change', (path) => {
    console.log(`📝 Changed: ${path}`);
    onChange();
  });

  watcher.on('add', (path) => {
    console.log(`➕ Added: ${path}`);
    onChange();
  });

  watcher.on('unlink', (path) => {
    console.log(`➖ Removed: ${path}`);
    onChange();
  });
}
