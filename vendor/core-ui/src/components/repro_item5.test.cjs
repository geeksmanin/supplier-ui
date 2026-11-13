const assert = require('assert');
const fs = require('fs');

console.log('Testing Item-5: Direct Blob Download Bug Reproduction...');

const desktopLightbox = fs.readFileSync('/Users/apple/go/github.com/geeksmanin/core-ui/src/components/ImageLightboxModal.desktop.tsx', 'utf8');
const mobileLightbox = fs.readFileSync('/Users/apple/go/github.com/geeksmanin/core-ui/src/components/ImageLightboxModal.mobile.tsx', 'utf8');

// Check if download triggers target = '_blank' navigation instead of fetching blob
const desktopOpensTab = desktopLightbox.includes("a.target = '_blank'") && !desktopLightbox.includes('fetch(');
const mobileOpensTab = mobileLightbox.includes("a.target = '_blank'") && !mobileLightbox.includes('fetch(');

console.log(`Desktop lightbox opens tab without fetching blob: ${desktopOpensTab}`);
console.log(`Mobile lightbox opens tab without fetching blob: ${mobileOpensTab}`);

if (desktopOpensTab || mobileOpensTab) {
  console.log('[REPRO CONFIRMED] Item-5: Media download navigates browser tab instead of direct blob save!');
  process.exit(1);
} else {
  console.log('Item-5 bug not present.');
  process.exit(0);
}

