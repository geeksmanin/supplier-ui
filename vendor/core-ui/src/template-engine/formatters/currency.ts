/**
 * Currency formatting utilities for Indian Rupee standard
 */

export function formatDecimal(val: any, decimals: number = 2): string {
  const num = Number(val);
  if (isNaN(num)) return '0.00';
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatINR(val: any): string {
  return `₹${formatDecimal(val, 2)}`;
}

const ONES = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertBelowThousand(n: number): string {
  let str = '';
  if (n >= 100) {
    str += `${ONES[Math.floor(n / 100)]} Hundred `;
    n %= 100;
  }
  if (n >= 20) {
    str += `${TENS[Math.floor(n / 10)]} `;
    n %= 10;
  }
  if (n > 0) {
    str += `${ONES[n]} `;
  }
  return str.trim();
}

/**
 * Converts a numeric amount to Indian Rupee Words (Lakhs, Crores, Thousands)
 * e.g. 102450.50 -> "One Lakh Two Thousand Four Hundred Fifty Rupees and Fifty Paise Only"
 */
export function numberToWordsINR(amount: any): string {
  const num = Math.abs(Number(amount));
  if (isNaN(num) || num === 0) return 'Zero Rupees Only';

  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  let n = intPart;
  let words = '';

  const crores = Math.floor(n / 10000000);
  n %= 10000000;

  const lakhs = Math.floor(n / 100000);
  n %= 100000;

  const thousands = Math.floor(n / 1000);
  n %= 1000;

  const remaining = n;

  if (crores > 0) {
    words += `${convertBelowThousand(crores)} Crore `;
  }
  if (lakhs > 0) {
    words += `${convertBelowThousand(lakhs)} Lakh `;
  }
  if (thousands > 0) {
    words += `${convertBelowThousand(thousands)} Thousand `;
  }
  if (remaining > 0) {
    words += `${convertBelowThousand(remaining)} `;
  }

  words = words.trim() + ' Rupees';

  if (decPart > 0) {
    words += ` and ${convertBelowThousand(decPart)} Paise`;
  }

  return `${words} Only`;
}
