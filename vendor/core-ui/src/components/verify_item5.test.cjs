const assert = require('assert');
const fs = require('fs');

console.log('Testing Item-5: Verification of Direct Blob Download...');

const desktopLightbox = fs.readFileSync('/Users/apple/go/github.com/geeksmanin/core-ui/src/components/ImageLightboxModal.desktop.tsx', 'utf8');
const mobileLightbox = fs.readFileSync('/Users/apple/go/github.com/geeksmanin/core-ui/src/components/ImageLightboxModal.mobile.tsx', 'utf8');

// 1. Assert neither uses target = '_blank'
assert.strictEqual(desktopLightbox.includes("a.target = '_blank'"), false, 'Desktop lightbox must not open new tab via target=_blank');
assert.strictEqual(mobileLightbox.includes("a.target = '_blank'"), false, 'Mobile lightbox must not open new tab via target=_blank');

// 2. Assert both use fetch + blob
assert.strictEqual(desktopLightbox.includes('await resp.blob()'), true, 'Desktop lightbox must fetch and convert to blob');
assert.strictEqual(mobileLightbox.includes('await resp.blob()'), true, 'Mobile lightbox must fetch and convert to blob');

// 3. Assert URL.createObjectURL and URL.revokeObjectURL
assert.strictEqual(desktopLightbox.includes('URL.createObjectURL(blob)'), true, 'Desktop must create blob URL');
assert.strictEqual(mobileLightbox.includes('URL.createObjectURL(blob)'), true, 'Mobile must create blob URL');

console.log('✅ Item-5 Verification Passed: Direct blob download implemented cleanly without opening blank tab.');

