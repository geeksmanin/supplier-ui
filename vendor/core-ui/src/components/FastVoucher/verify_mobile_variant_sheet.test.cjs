const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Verifying Mobile Variant Picker Sheet UX ---');

const baseDir = path.resolve(__dirname, '../../../../');
const sheetPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/MobileVariantPickerSheet.tsx');
const mobileSheetPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/MobileVariantPickerSheet.mobile.tsx');
const hookPickerPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/useMobileVariantPicker.ts');
const hookPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/useVariantMatrixModal.tsx');

assert.ok(fs.existsSync(sheetPath), 'MobileVariantPickerSheet.tsx must exist');
assert.ok(fs.existsSync(mobileSheetPath), 'MobileVariantPickerSheet.mobile.tsx must exist');
assert.ok(fs.existsSync(hookPickerPath), 'useMobileVariantPicker.ts must exist');
const sheetContent = fs.readFileSync(mobileSheetPath, 'utf8');
const pickerHookContent = fs.readFileSync(hookPickerPath, 'utf8');

assert.ok(
  sheetContent.includes('updateQuantity') && sheetContent.includes('setDirectPrice'),
  'MobileVariantPickerSheet.mobile.tsx must provide touch steppers and unit rate controls'
);

assert.ok(
  pickerHookContent.includes('onAddVariants'),
  'useMobileVariantPicker must dispatch onAddVariants callback'
);

const hookContent = fs.readFileSync(hookPath, 'utf8');
assert.ok(
  hookContent.includes('MobileVariantPickerSheet'),
  'useVariantMatrixModal must import MobileVariantPickerSheet'
);

assert.ok(
  hookContent.includes('isMobile') || hookContent.includes('innerWidth < 768'),
  'useVariantMatrixModal must conditionally render MobileVariantPickerSheet for mobile screens'
);

console.log('✅ Mobile Variant Picker Sheet UX verification passed!');
