#!/usr/bin/env node

// CLI entry point - runs compiled JavaScript
const path = require('path');
const fs = require('fs');

// Check if we're in development (TypeScript files exist) or production (compiled JS)
const devCliPath = path.join(__dirname, '../cli/index.ts');
const prodCliPath = path.join(__dirname, '../dist/cli/index.js');

if (fs.existsSync(prodCliPath)) {
  // Production: Run compiled JavaScript
  require(prodCliPath);
} else if (fs.existsSync(devCliPath)) {
  // Development: Run TypeScript with ts-node
  const { execSync } = require('child_process');
  try {
    execSync(`npx ts-node --transpile-only --project tsconfig.cli.json ${devCliPath} ${process.argv.slice(2).join(' ')}`, {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
  } catch (error) {
    process.exit(1);
  }
} else {
  console.error('Error: CLI files not found. Please run "npm run build:cli" first.');
  process.exit(1);
}
