const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Verifying In-App Product Creation at Voucher Entry (Issue #34) ---');

const baseDir = path.resolve(__dirname, '../../');
const coreUiDir = path.join(baseDir, 'core-ui/src/components/FastVoucher');
const catalogueDir = path.join(baseDir, 'catalogue-ui/packages/catalogue/src/components/ProductList');

// 1. Verify types declaration in core-ui
console.log('Test 1: VoucherCatalogConfig types...');
const typesContent = fs.readFileSync(path.join(coreUiDir, 'FastVoucherEntryLayout.types.ts'), 'utf8');
assert.ok(typesContent.includes('allowProductCreation?: boolean;'), 'VoucherCatalogConfig must declare allowProductCreation');
assert.ok(typesContent.includes('onNavigateToCreateProduct?: (searchQuery: string) => void;'), 'VoucherCatalogConfig must declare onNavigateToCreateProduct');
console.log('  ✓ VoucherCatalogConfig types verified');

// 2. Verify FastVoucherCatalogSearchDropdown
console.log('Test 2: FastVoucherCatalogSearchDropdown header CTA and empty state...');
const dropdownContent = fs.readFileSync(path.join(coreUiDir, 'FastVoucherCatalogSearchDropdown.tsx'), 'utf8');
assert.ok(dropdownContent.includes('data-testid="fast-voucher-create-product-btn"'), 'Dropdown must render New Product button in header');
assert.ok(dropdownContent.includes('data-testid="fast-voucher-empty-create-btn"'), 'Dropdown must render Create Product button on empty search');
assert.ok(dropdownContent.includes('F3'), 'Dropdown must show F3 shortcut badge');
assert.ok(dropdownContent.includes('onNavigateToCreateProduct'), 'Dropdown must accept and invoke onNavigateToCreateProduct');
console.log('  ✓ Dropdown CTA and empty state verified');

// 3. Verify useFastVoucherCatalogSearch open state persistence
console.log('Test 3: useFastVoucherCatalogSearch empty search open state...');
const searchHookContent = fs.readFileSync(path.join(coreUiDir, 'useFastVoucherCatalogSearch.ts'), 'utf8');
assert.ok(
  searchHookContent.includes('setIsSearchOpen(merged.length > 0 || searchQuery.trim().length > 0);'),
  'useFastVoucherCatalogSearch must keep search dropdown open when query is typed even with 0 results'
);
console.log('  ✓ Search hook open state verified');

// 4. Verify useFastVoucherOrchestrator navigation and return-trip handler
console.log('Test 4: useFastVoucherOrchestrator in-app navigation & return auto-injection...');
const orchContent = fs.readFileSync(path.join(coreUiDir, 'useFastVoucherOrchestrator.ts'), 'utf8');
assert.ok(orchContent.includes('handleNavigateToCreateProduct'), 'Orchestrator must define and return handleNavigateToCreateProduct');
assert.ok(orchContent.includes("params.set('returnUrl', returnUrl)"), 'Orchestrator must encode and pass returnUrl');
assert.ok(orchContent.includes('saveFormDraft'), 'Orchestrator must flush draft before navigating to product form');
assert.ok(orchContent.includes('addedProductId'), 'Orchestrator must inspect addedProductId on return trip');
assert.ok(orchContent.includes('autoRestore'), 'Orchestrator must check autoRestore on return trip');
assert.ok(orchContent.includes('catalogConfig.resolveProductById(addedProductId)'), 'Orchestrator must invoke resolveProductById resolver');
const typesContent2 = fs.readFileSync(path.join(coreUiDir, 'FastVoucherEntryLayout.types.ts'), 'utf8');
assert.ok(typesContent2.includes('resolveProductById?: (id: string) => Promise<any>;'), 'VoucherCatalogConfig must declare resolveProductById');
const catServiceContent = fs.readFileSync(path.join(baseDir, 'catalogue-ui/packages/catalogue/src/services/catalogueService.ts'), 'utf8');
assert.ok(catServiceContent.includes('fetchCatalogueVariantById'), 'catalogueService must export fetchCatalogueVariantById');
assert.ok(orchContent.includes('window.history.replaceState'), 'Orchestrator must clean URL query parameters after injection');
console.log('  ✓ Orchestrator navigation & return auto-injection verified');

// 5. Verify FastVoucherActionRow shortcut handling
console.log('Test 5: FastVoucherActionRow keyboard shortcuts...');
const actionRowContent = fs.readFileSync(path.join(coreUiDir, 'FastVoucherActionRow.tsx'), 'utf8');
assert.ok(actionRowContent.includes("e.key === 'F3'"), 'ActionRow must handle F3 key');
assert.ok(actionRowContent.includes("e.altKey && e.key.toLowerCase() === 'n'"), 'ActionRow must handle Alt+N key');
assert.ok(actionRowContent.includes('onNavigateToCreateProduct'), 'ActionRow must pass onNavigateToCreateProduct to dropdown');
console.log('  ✓ ActionRow shortcut handling verified');

// 6. Verify catalogue-ui register.ts ProductListRouteWrapper In-App Navigation Interceptor
console.log('Test 6: register.ts ProductListRouteWrapper In-App Navigation Interceptor...');
const registerContent = fs.readFileSync(path.join(baseDir, 'catalogue-ui/packages/catalogue/src/register.ts'), 'utf8');
assert.ok(registerContent.includes('ProductListRouteWrapper'), 'register.ts must declare ProductListRouteWrapper');
assert.ok(registerContent.includes("searchParams.get('returnUrl')"), 'ProductListRouteWrapper must inspect returnUrl query parameter');
assert.ok(registerContent.includes('addedProductId='), 'ProductListRouteWrapper must append addedProductId on return redirect');
assert.ok(registerContent.includes('autoRestore=true'), 'ProductListRouteWrapper must append autoRestore=true on return redirect');
console.log('  ✓ ProductListRouteWrapper navigation interceptor verified');

// 7. Verify purchase-ui Fast Form integration
console.log('Test 7: purchase-ui Fast Form wiring with resolveProductById...');
const piHookContent = fs.readFileSync(path.join(baseDir, 'purchase-ui/src/hooks/usePurchaseInvoiceFastForm.ts'), 'utf8');
assert.ok(piHookContent.includes('fetchCatalogueVariantById'), 'usePurchaseInvoiceFastForm must import fetchCatalogueVariantById');
assert.ok(piHookContent.includes('resolveProductById: fetchCatalogueVariantById'), 'Purchase Invoice catalogConfig must configure resolveProductById');
console.log('  ✓ purchase-ui Fast Form integration verified');

console.log('✅ ALL IN-APP PRODUCT CREATION TESTS PASSED SUCCESSFULLY!');
