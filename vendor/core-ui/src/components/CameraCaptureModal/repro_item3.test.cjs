const assert = require('assert');
const fs = require('fs');

console.log('Testing Item-3 Reproduction: Asserting un-portalized inline modal behavior...');

const mobileCamera = fs.readFileSync('/Users/apple/go/github.com/geeksmanin/core-ui/src/components/CameraCaptureModal/CameraCaptureModal.mobile.tsx', 'utf8');

// The original buggy code directly returned the JSX inside the parent component tree without createPortal
const hasBug = !mobileCamera.includes('createPortal(content, document.body)');
if (hasBug) {
  console.log('🔴 Repro Confirmed: CameraCaptureModal renders inline in document flow without createPortal');
  process.exit(1);
} else {
  console.log('✅ Fix Applied: CameraCaptureModal uses createPortal(content, document.body)');
  process.exit(0);
}
