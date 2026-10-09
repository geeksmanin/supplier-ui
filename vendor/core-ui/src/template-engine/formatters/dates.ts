/**
 * Date and time formatting helpers for templates
 */

export function formatDate(val: any, format: 'DD/MM/YYYY' | 'DD-MM-YYYY' | 'DD_MMM_YYYY' = 'DD/MM/YYYY'): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) {
    // If it's already a formatted string like "06-10-2026", return as is
    return String(val);
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  if (format === 'DD-MM-YYYY') {
    return `${day}-${month}-${year}`;
  }
  if (format === 'DD_MMM_YYYY') {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${monthNames[d.getMonth()]} ${year}`;
  }
  return `${day}/${month}/${year}`;
}

export function formatTime(val: any): string {
  if (!val) return '';
  const d = new Date(val);
  if (isNaN(d.getTime())) {
    return String(val);
  }
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
