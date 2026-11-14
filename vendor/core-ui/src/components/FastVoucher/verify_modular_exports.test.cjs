const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Verifying Fast Voucher Modular Exports ---');

const baseDir = path.resolve(__dirname, '../../../../');
const indexPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/index.ts');

assert.ok(fs.existsSync(indexPath), 'core-ui/src/components/FastVoucher/index.ts must exist');
const indexContent = fs.readFileSync(indexPath, 'utf8');

const expectedExports = [
  'FastVoucherHeaderRibbon',
  'FastVoucherTableSection',
  'FastVoucherCatalogSearchDropdown',
  'MobileVariantPickerSheet',
  'useFastVoucherOrchestrator',
  'useFastVoucherPartySearch',
  'useFastVoucherCatalogSearch',
  'FastVoucherCard',
  'FastVoucherEntryLayout',
];

expectedExports.forEach((exp) => {
  assert.ok(
    indexContent.includes(exp),
    `FastVoucher index.ts must export ${exp}`
  );
});

console.log('✅ Fast Voucher Modular Exports verification passed!');
