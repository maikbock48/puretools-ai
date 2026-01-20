#!/usr/bin/env node

/**
 * PWA Icon Generator Script
 *
 * This script generates all required PWA icons from the source SVG.
 *
 * Prerequisites:
 *   npm install sharp
 *
 * Usage:
 *   node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

async function generateIcons() {
  // Try to import sharp
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.log('Sharp not installed. Installing...');
    const { execSync } = require('child_process');
    execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    sharp = require('sharp');
  }

  const svgPath = path.join(__dirname, '../public/icons/icon.svg');
  const outputDir = path.join(__dirname, '../public/icons');

  // Icon sizes for PWA
  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Generating PWA icons...\n');

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✓ Generated icon-${size}x${size}.png`);
  }

  // Generate Apple Touch Icon (180x180)
  const appleTouchIconPath = path.join(outputDir, 'apple-touch-icon.png');
  await sharp(svgPath)
    .resize(180, 180)
    .png()
    .toFile(appleTouchIconPath);
  console.log('✓ Generated apple-touch-icon.png (180x180)');

  // Generate favicon (32x32)
  const faviconPath = path.join(__dirname, '../public/favicon.png');
  await sharp(svgPath)
    .resize(32, 32)
    .png()
    .toFile(faviconPath);
  console.log('✓ Generated favicon.png (32x32)');

  // Generate shortcut icons
  const shortcutIcons = ['qr-shortcut', 'compress-shortcut', 'pdf-shortcut'];
  for (const name of shortcutIcons) {
    const shortcutPath = path.join(outputDir, `${name}.png`);
    await sharp(svgPath)
      .resize(96, 96)
      .png()
      .toFile(shortcutPath);
    console.log(`✓ Generated ${name}.png (96x96)`);
  }

  console.log('\n✅ All icons generated successfully!');
  console.log('\nNote: For production, consider using a proper icon design.');
}

generateIcons().catch(console.error);
