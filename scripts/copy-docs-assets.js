#!/usr/bin/env node

/**
 * Copy documentation assets (metadata, themes) to website build directory
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const WEBSITE_BUILD_DIR = path.join(__dirname, '..', 'website', 'build');

function copyDirectory(source, destination) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  // Read source directory
  const entries = fs.readdirSync(source, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const destPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destPath);
    } else {
      fs.copyFileSync(sourcePath, destPath);
    }
  }
}

function main() {
  console.log('📋 Copying documentation assets to website build...\n');

  // Check if docs directory exists
  if (!fs.existsSync(DOCS_DIR)) {
    console.error('❌ Error: docs/ directory not found.');
    console.error('   Run "npm run docs:build" first to generate documentation.\n');
    process.exit(1);
  }

  // Check if website build directory exists
  if (!fs.existsSync(WEBSITE_BUILD_DIR)) {
    console.error('❌ Error: website/build/ directory not found.');
    console.error('   Run "npm run build:website" first to build the website.\n');
    process.exit(1);
  }

  try {
    // Copy metadata directory
    const metadataSource = path.join(DOCS_DIR, 'metadata');
    const metadataDest = path.join(WEBSITE_BUILD_DIR, 'metadata');

    if (fs.existsSync(metadataSource)) {
      copyDirectory(metadataSource, metadataDest);
      const fileCount = fs.readdirSync(metadataSource).length;
      console.log(`  ✓ Copied ${fileCount} metadata files`);
    }

    // Copy themes directory
    const themesSource = path.join(DOCS_DIR, 'themes');
    const themesDest = path.join(WEBSITE_BUILD_DIR, 'themes');

    if (fs.existsSync(themesSource)) {
      copyDirectory(themesSource, themesDest);
      const themeCount = fs.readdirSync(themesSource).length;
      console.log(`  ✓ Copied ${themeCount} theme files`);
    }

    console.log('\n✅ Documentation assets copied successfully!\n');
  } catch (error) {
    console.error('❌ Error copying documentation assets:', error.message);
    process.exit(1);
  }
}

main();
