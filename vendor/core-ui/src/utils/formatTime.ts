/**
 * Canonical date and time formatting utilities shared across @geeksman/core-ui consumers.
 * All UI card, timeline, and chat timestamps MUST format consistently in 12-hour AM/PM.
 */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export function parseDate(val: string | number | Date | null | undefined): Date | null {
  if (val === null || val === undefined || val === '') return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  if (typeof val === 'number') {
    if (val <= 0 || isNaN(val)) return null;
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const normalized = trimmed.includes(' ') && !trimmed.includes('T') ? trimmed.replace(' ', 'T') : trimmed;
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function isSameDay(
  d1: string | number | Date | null | undefined,
  d2: string | number | Date | null | undefined,
): boolean {
  const date1 = parseDate(d1);
  const date2 = parseDate(d2);
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function formatDateDivider(val: string | number | Date | null | undefined): string {
  const d = parseDate(val);
  if (!d) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()];
  return `${day} ${month} ${d.getFullYear()}`;
}

/**
 * Format a timestamp into canonical 12-hour AM/PM clock time (e.g. "2:05 PM").
 */
export function formatTime(val: string | number | Date | null | undefined): string {
  const d = parseDate(val);
  if (!d) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/**
 * Format a timestamp for operational card footers:
 * - Today: "Today, 2:05 PM"
 * - Yesterday: "Yesterday, 2:05 PM"
 * - Current year: "15 Jan, 2:05 PM"
 * - Previous year: "15 Jan 2025, 2:05 PM"
 */
export function formatCardTimestamp(val: string | number | Date | null | undefined): string {
  const d = parseDate(val);
  if (!d) return '';

  const timeStr = formatTime(d);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((today.getTime() - target.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;

  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()];
  if (d.getFullYear() === now.getFullYear()) {
    return `${day} ${month}, ${timeStr}`;
  }
  return `${day} ${month} ${d.getFullYear()}, ${timeStr}`;
}

/**
 * Formats a raw timestamp (ISO string, epoch ms, or Date) into a concise WhatsApp-style inbox label.
 */
export function formatWhatsAppTime(raw?: string | number | Date | null): string {
  if (!raw) return '';
  if (raw === 'AI') return 'AI';

  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (/^\d{1,2}:\d{2}\s*(am|pm)?$/i.test(trimmed) || trimmed === 'Yesterday') {
      return trimmed;
    }
  }

  const date = parseDate(raw);
  if (!date) {
    return typeof raw === 'string' ? raw : '';
  }

  const now = new Date();
  if (isSameDay(date, now)) {
    return formatTime(date);
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(date, yesterday)) {
    return 'Yesterday';
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

/**
 * Formats a list-item timestamp while hiding date-only 00:00:00 midnight placeholders.
 */
export function formatWhatsAppDate(dateStr?: string | number | Date | null): string {
  const date = parseDate(dateStr);
  if (!date) return '';
  if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) {
    return '';
  }
  return formatTime(date);
}
