#!/usr/bin/env node

/**
 * generate-assets.js
 * Validates and syncs Android launcher icons and splash drawables.
 */

import fs from 'fs';
import path from 'path';

export function setupAppAssets(targetResDir, customIconPath) {
  if (!customIconPath || !fs.existsSync(customIconPath)) {
    return false;
  }

  const densities = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
  const iconBuffer = fs.readFileSync(customIconPath);

  for (const density of densities) {
    const mipmapDir = path.join(targetResDir, `mipmap-${density}`);
    if (!fs.existsSync(mipmapDir)) {
      fs.mkdirSync(mipmapDir, { recursive: true });
    }
    // Copy icon to launcher targets
    fs.writeFileSync(path.join(mipmapDir, 'ic_launcher.png'), iconBuffer);
    fs.writeFileSync(path.join(mipmapDir, 'ic_launcher_round.png'), iconBuffer);
  }

  console.log(`[Assets] Custom icon installed from: ${customIconPath}`);
  return true;
}
