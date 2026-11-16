const fs = require('fs');
const path = require('path');
const assert = require('assert');

const mediaCachePath = path.join(__dirname, 'mediaCache.ts');
const content = fs.readFileSync(mediaCachePath, 'utf8');

// Assert that mediaCache does NOT inject Authorization header into media requests
// (Sending Authorization causes Cloudflare to bypass edge caching with cf-cache-status: BYPASS)
const hasAuthInjection = content.includes("headers['Authorization']") || content.includes('headers["Authorization"]');
assert.strictEqual(hasAuthInjection, false, 'FAIL REPRO: mediaCache.ts injects Authorization header, causing Cloudflare edge cache bypass');
console.log('PASS: mediaCache.ts does not send Authorization header on public media requests');
