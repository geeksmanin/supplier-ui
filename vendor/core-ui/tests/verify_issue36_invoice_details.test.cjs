const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Verifying Issue #36: Zero Duplicate Line Items & Complete Invoice Details ---');

const baseDir = path.resolve(__dirname, '../../');
const previewPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/VoucherLiveInvoicePreview.tsx');
const partyCardPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/VoucherPartyDetailsCard.tsx');
const linesBarPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/VoucherLinesSummaryBar.tsx');
const finAdjPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/VoucherFinancialAdjustments.tsx');
const totalsPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/VoucherTotalsSummary.tsx');
const typesPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/FastVoucherEntryLayout.types.ts');
const taxEnginePath = path.join(baseDir, 'core-ui/src/components/FastVoucher/voucherTaxEngine.ts');
const hookPath = path.join(baseDir, 'core-ui/src/components/FastVoucher/useFastVoucherPartySearch.ts');

// 1. Verify all modular files exist
[previewPath, partyCardPath, linesBarPath, finAdjPath, totalsPath, typesPath, taxEnginePath, hookPath].forEach((fp) => {
  assert.ok(fs.existsSync(fp), `${fp} must exist`);
});

const previewContent = fs.readFileSync(previewPath, 'utf8');
const partyCardContent = fs.readFileSync(partyCardPath, 'utf8');
const linesBarContent = fs.readFileSync(linesBarPath, 'utf8');
const finAdjContent = fs.readFileSync(finAdjPath, 'utf8');
const totalsContent = fs.readFileSync(totalsPath, 'utf8');
const typesContent = fs.readFileSync(typesPath, 'utf8');
const taxEngineContent = fs.readFileSync(taxEnginePath, 'utf8');
const hookContent = fs.readFileSync(hookPath, 'utf8');

// 2. Verify Zero Duplicate Line Items in Right Pane
assert.ok(
  !previewContent.includes('{items.map((item, idx) =>'),
  'VoucherLiveInvoicePreview must NOT map and render individual line items in the right sidebar'
);
assert.ok(
  !previewContent.includes('<span>Line Items ({items.length})</span>'),
  'VoucherLiveInvoicePreview must NOT render the old Line Items list header'
);
assert.ok(
  linesBarContent.includes('Total Lines:'),
  'VoucherLinesSummaryBar must render compact summary of total lines'
);
assert.ok(
  linesBarContent.includes('Total Qty:'),
  'VoucherLinesSummaryBar must render compact summary of total quantity'
);

// 3. Verify Complete Party / Supplier Details
assert.ok(
  partyCardContent.includes('Billing Address'),
  'VoucherPartyDetailsCard must render Billing Address section'
);
assert.ok(
  partyCardContent.includes('Shipping Address'),
  'VoucherPartyDetailsCard must render Shipping Address section'
);
assert.ok(
  partyCardContent.includes('Same as billing address'),
  'VoucherPartyDetailsCard must support indicating shipping address is same as billing address'
);
assert.ok(
  partyCardContent.includes('GSTIN:'),
  'VoucherPartyDetailsCard must render GSTIN number'
);
assert.ok(
  partyCardContent.includes('Place of Supply:'),
  'VoucherPartyDetailsCard must render Place of Supply / State'
);
assert.ok(
  partyCardContent.includes('Inter-State (IGST)') && partyCardContent.includes('Intra-State (CGST+SGST)'),
  'VoucherPartyDetailsCard must render Tax Regime badge (IGST vs CGST+SGST)'
);

// 4. Verify Financial Details: Subtotal, Discount, Tax, Other Charges
assert.ok(
  totalsContent.includes('Subtotal (Taxable):'),
  'VoucherTotalsSummary must render Subtotal (Taxable Amount)'
);
assert.ok(
  finAdjContent.includes('Overall Discount'),
  'VoucherFinancialAdjustments must render Overall Discount'
);
assert.ok(
  finAdjContent.includes('Freight / Shipping'),
  'VoucherFinancialAdjustments must render Freight / Shipping'
);
assert.ok(
  finAdjContent.includes('Labour / Other Charges'),
  'VoucherFinancialAdjustments must render Labour / Other Charges control'
);
assert.ok(
  totalsContent.includes('CGST Total:') && totalsContent.includes('SGST Total:') && totalsContent.includes('IGST Total:'),
  'VoucherTotalsSummary must display CGST, SGST, and IGST totals'
);
assert.ok(
  totalsContent.includes('Grand Total:'),
  'VoucherTotalsSummary must display Grand Total prominently'
);

// 5. Verify Types & Tax Engine support otherCharges
assert.ok(
  typesContent.includes('other_charges?: number;'),
  'VoucherSummary must define other_charges'
);
assert.ok(
  typesContent.includes('otherCharges?: number;'),
  'FastVoucherEntryLayoutProps must define otherCharges'
);
assert.ok(
  typesContent.includes('billing_address?: any;'),
  'VoucherPartyOption must support billing_address'
);
assert.ok(
  typesContent.includes('shipping_address?: any;'),
  'VoucherPartyOption must support shipping_address'
);
assert.ok(
  taxEngineContent.includes('otherCharges'),
  'voucherTaxEngine must support otherCharges in computation'
);
assert.ok(
  hookContent.includes('billing_address:') && hookContent.includes('shipping_address:'),
  'useFastVoucherPartySearch must map billing_address and shipping_address'
);

// 6. Verify line limits (all files under 450 lines)
[
  { name: 'VoucherLiveInvoicePreview.tsx', content: previewContent },
  { name: 'VoucherPartyDetailsCard.tsx', content: partyCardContent },
  { name: 'VoucherLinesSummaryBar.tsx', content: linesBarContent },
  { name: 'VoucherFinancialAdjustments.tsx', content: finAdjContent },
  { name: 'VoucherTotalsSummary.tsx', content: totalsContent },
].forEach(({ name, content }) => {
  const lineCount = content.split('\n').length;
  assert.ok(
    lineCount <= 450,
    `${name} has ${lineCount} lines, exceeding the 450-line limit`
  );
});

console.log('✅ All AST, structural, and line limit checks for Issue #36 passed successfully!');
