const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Verifying Fast Voucher Party Props Injection ---');

const baseDir = path.resolve(__dirname, '../../../../');
const typesPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/FastVoucherEntryLayout.types.ts');
const hookPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/useFastVoucherPartySearch.ts');
const orchPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/useFastVoucherOrchestrator.ts');

assert.ok(fs.existsSync(typesPath), 'FastVoucherEntryLayout.types.ts must exist');
const typesContent = fs.readFileSync(typesPath, 'utf8');

assert.ok(
  typesContent.includes("partyRole?: 'supplier' | 'customer' | 'both'"),
  'FastVoucherEntryLayoutProps must define partyRole prop'
);

assert.ok(fs.existsSync(hookPath), 'useFastVoucherPartySearch.ts must exist');
const hookContent = fs.readFileSync(hookPath, 'utf8');

assert.ok(
  hookContent.includes('effectivePartyRole') && hookContent.includes('organisation_type'),
  'useFastVoucherPartySearch must infer effectivePartyRole and query organisation_type'
);

assert.ok(
  hookContent.includes('supplier') && hookContent.includes('customer'),
  'useFastVoucherPartySearch must support both supplier and customer party roles'
);

const orchContent = fs.readFileSync(orchPath, 'utf8');
assert.ok(
  orchContent.includes('partyRole: props.partyRole') || orchContent.includes('props.partyRole'),
  'useFastVoucherOrchestrator must inject partyRole into party search hook'
);

console.log('✅ Fast Voucher Party Props Injection verification passed!');
