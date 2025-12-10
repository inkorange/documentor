#!/usr/bin/env node

// Development entry point for the CLI
// In production, this would be compiled from TypeScript

const { execSync } = require('child_process');
const path = require('path');

// Run the TypeScript CLI directly with ts-node for development
const cliPath = path.join(__dirname, '../cli/index.ts');

try {
  execSync(`npx ts-node --project tsconfig.cli.json ${cliPath} ${process.argv.slice(2).join(' ')}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
  });
} catch (error) {
  process.exit(1);
}
