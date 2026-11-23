const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- Verifying FastVoucher Search Dropdown Auto-Scroll & Sticky Header ---');

const dropdownPath = path.resolve(__dirname, '../src/components/FastVoucher/FastVoucherCatalogSearchDropdown.tsx');
assert.ok(fs.existsSync(dropdownPath), 'FastVoucherCatalogSearchDropdown.tsx must exist');

const content = fs.readFileSync(dropdownPath, 'utf8');

// 1. Verify containerRef is defined and attached
assert.ok(
  content.includes('const containerRef = useRef<HTMLDivElement>(null);'),
  'Must declare containerRef with useRef'
);
assert.ok(
  content.includes('ref={containerRef}'),
  'Must attach ref={containerRef} to the scroll container'
);

// 2. Verify auto-scroll logic on selectedResultIndex change
assert.ok(
  content.includes('selectedResultIndex') && content.includes('container.scrollTop'),
  'Must update container.scrollTop when selectedResultIndex changes'
);
assert.ok(
  content.includes('offsetTop') && content.includes('clientHeight'),
  'Must compute relative offsetTop and container clientHeight for scroll bounds'
);

// 3. Verify sticky header
assert.ok(
  content.includes("position: 'sticky'") && content.includes('top: 0'),
  'Header must have position: sticky and top: 0 to remain visible during scroll'
);

console.log('✅ FastVoucher Search Dropdown Auto-Scroll & Sticky Header verified successfully!');
