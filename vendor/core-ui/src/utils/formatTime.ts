/**
 * Formats a raw timestamp (ISO string, epoch ms, or Date) into a concise WhatsApp-style time label.
 * e.g.
 * - Today: '12:53 PM'
 * - Yesterday: 'Yesterday'
 * - Current year: '27 Oct'
 * - Older: '27/10/25'
 */
export function formatWhatsAppTime(raw?: string | number | Date | null): string {
  if (!raw) return '';
  if (raw === 'AI') return 'AI';

  // If already formatted like '12:53 PM' or 'Yesterday', return as-is
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (/^\d{1,2}:\d{2}\s*(am|pm)?$/i.test(trimmed) || trimmed === 'Yesterday') {
      return trimmed;
    }
  }

  const date = raw instanceof Date ? raw : new Date(raw);
  if (isNaN(date.getTime())) {
    return typeof raw === 'string' ? raw : '';
  }

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return 'Yesterday';
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
}
