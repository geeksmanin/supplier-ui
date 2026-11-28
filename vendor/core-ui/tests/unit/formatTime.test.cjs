const assert = require('assert');
const {
  parseDate,
  isSameDay,
  formatTime,
  formatDateDivider,
  formatCardTimestamp,
} = require('../../src/utils/formatTime.cjs');

const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(yesterday.getDate() - 1);
const oldDate = new Date('2025-01-15T14:05:00.000Z');

assert.strictEqual(parseDate(''), null);
assert.strictEqual(parseDate(0), null);
assert.ok(parseDate('2025-01-15 12:00:00') instanceof Date);
assert.strictEqual(isSameDay(now, now.toISOString()), true);
assert.strictEqual(isSameDay(now, yesterday), false);

assert.strictEqual(formatDateDivider(now.toISOString()), 'Today');
assert.strictEqual(formatDateDivider(yesterday.toISOString()), 'Yesterday');
assert.strictEqual(formatDateDivider(oldDate.toISOString()), '15 Jan 2025');

const ampmRe = /\b(AM|PM)$/i;
assert.ok(ampmRe.test(formatTime(oldDate.toISOString())), 'formatTime must include AM/PM');
assert.ok(formatCardTimestamp(now.toISOString()).startsWith('Today, '), 'Today card footer must start with Today,');
assert.ok(formatCardTimestamp(yesterday.toISOString()).startsWith('Yesterday, '), 'Yesterday card footer must start with Yesterday,');
assert.ok(formatCardTimestamp(oldDate.toISOString()).includes('15 Jan 2025, '), 'Past-year card footer must preserve calendar date');

console.log('All core-ui formatTime tests passed!');
