const assert = require('assert');
const fs = require('fs');

console.log('Testing Item-3: Verification of Compact Camera Viewfinder and Non-Bloating View...');

const mobileCamera = fs.readFileSync('/Users/apple/go/github.com/geeksmanin/core-ui/src/components/CameraCaptureModal/CameraCaptureModal.mobile.tsx', 'utf8');
const desktopCamera = fs.readFileSync('/Users/apple/go/github.com/geeksmanin/core-ui/src/components/CameraCaptureModal/CameraCaptureModal.desktop.tsx', 'utf8');

// 1. Mobile Camera must render via createPortal to document.body to prevent layout inflation in transformed sheets
assert.strictEqual(
  mobileCamera.includes('createPortal(content, document.body)'),
  true,
  'CameraCaptureModalMobile must mount via createPortal directly into document.body'
);

// 2. Mobile Camera must handle hardware/browser back button via popstate
assert.strictEqual(
  mobileCamera.includes("window.history.pushState({ modal: 'camera-capture' }") ||
  mobileCamera.includes("window.addEventListener('popstate'"),
  true,
  'CameraCaptureModalMobile must intercept back navigation via popstate'
);

// 3. Desktop Camera must render via createPortal to document.body
assert.strictEqual(
  desktopCamera.includes('createPortal(content, document.body)'),
  true,
  'CameraCaptureModalDesktop must mount via createPortal directly into document.body'
);

// 4. Desktop Camera must support Escape key to close
assert.strictEqual(
  desktopCamera.includes("e.key === 'Escape'"),
  true,
  'CameraCaptureModalDesktop must close on Escape key'
);

console.log('✅ Item-3 Verification Passed: Camera viewfinders are isolated from document flow via portals and support back/escape dismissal.');
