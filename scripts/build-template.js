#!/usr/bin/env node

/**
 * Build the website template for npm distribution
 * This script builds the React website and packages it into the template/ directory
 * so it can be distributed with the npm package and used by end users
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const WEBSITE_DIR = path.join(process.cwd(), 'website');
const TEMPLATE_DIR = path.join(process.cwd(), 'template');
const BUILD_DIR = path.join(WEBSITE_DIR, 'build');

async function buildTemplate() {
  console.log('🏗️  Building website template for distribution...\n');

  // Step 1: Clean previous builds
  console.log('🧹 Cleaning previous builds...');
  if (fs.existsSync(TEMPLATE_DIR)) {
    fs.rmSync(TEMPLATE_DIR, { recursive: true });
  }
  if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true });
  }

  // Step 2: Copy example components for the build
  console.log('📋 Copying example components...');
  execSync('npm run copy-components', { stdio: 'inherit' });

  // Step 3: Build the React website
  console.log('\n📦 Building React website...');
  execSync('cd website && BUILD_PATH=build react-scripts build', {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Step 4: Create template directory structure
  console.log('\n📁 Creating template directory...');
  fs.mkdirSync(TEMPLATE_DIR, { recursive: true });

  // Step 5: Copy built website to template
  console.log('📋 Copying built website to template/...');
  copyDirectory(BUILD_DIR, TEMPLATE_DIR);

  // Step 6: Create a README in the template
  const readmeContent = `# Documentor Template

This directory contains the pre-built React website that gets deployed
when users run \`documentor build\`.

**DO NOT EDIT** - This is generated automatically by \`npm run build:template\`
`;
  fs.writeFileSync(path.join(TEMPLATE_DIR, 'README.md'), readmeContent);

  // Step 7: Clean up build artifacts
  console.log('🧹 Cleaning up build artifacts...');
  fs.rmSync(BUILD_DIR, { recursive: true });

  console.log('\n✅ Template built successfully!');
  console.log(`📂 Template location: ${TEMPLATE_DIR}`);

  // Show template size
  const templateSize = getDirectorySize(TEMPLATE_DIR);
  console.log(`📊 Template size: ${(templateSize / 1024 / 1024).toFixed(2)} MB\n`);
}

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      // Skip source map files - they're only needed for development debugging
      if (entry.name.endsWith('.map')) {
        continue;
      }
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getDirectorySize(dirPath) {
  let size = 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      size += getDirectorySize(fullPath);
    } else {
      size += fs.statSync(fullPath).size;
    }
  }

  return size;
}

// Run the script
buildTemplate().catch(error => {
  console.error('❌ Error building template:', error);
  process.exit(1);
});
