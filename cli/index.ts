#!/usr/bin/env node

import { Command } from 'commander';
import { devCommand } from './commands/dev';
import { buildCommand } from './commands/build';
import { serveCommand } from './commands/serve';

const program = new Command();

program
  .name('docspark')
  .description('Automated component documentation tool')
  .version('1.0.0');

program
  .command('dev')
  .description('Start development server with hot reload')
  .option('-p, --port <port>', 'Server port', '6006')
  .option('-c, --config <path>', 'Config file path', './docspark.config.json')
  .action(devCommand);

program
  .command('build')
  .description('Build static documentation site')
  .option('-c, --config <path>', 'Config file path', './docspark.config.json')
  .option('--base-url <url>', 'Base URL for the site', '/')
  .option('--clean', 'Clean build directory before building')
  .option('--verbose', 'Verbose output')
  .action(buildCommand);

program
  .command('serve')
  .description('Serve built documentation')
  .option('-p, --port <port>', 'Server port', '8080')
  .option('-d, --dir <directory>', 'Documentation directory', './docs')
  .action(serveCommand);

program.parse(process.argv);
