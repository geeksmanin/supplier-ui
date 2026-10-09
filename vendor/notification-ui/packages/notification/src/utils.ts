export const formatNotificationBody = (rawText?: string): string => {
  if (!rawText) return '';
  let cleaned = rawText;
  const hasTable = /<table\b/i.test(cleaned);

  // 1. Replace <table>...</table> structures with generic [Table] placeholder
  cleaned = cleaned.replace(/<table\b[^>]*>.*?<\/table>|<table\b[^>]*>/gis, ' [Table] ');

  // 2. Replace block breaks with space so words don't concatenate
  cleaned = cleaned.replace(/<\s*(?:br\s*\/|\/p|\/div|\/tr|\/li|\/h[1-6]|\/blockquote)\s*>/gi, ' ');

  // 3. Strip all other HTML tags
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');

  // 4. Decode HTML entities
  cleaned = cleaned
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  // 5. Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // If text was only a table or table placeholder
  if (!cleaned && hasTable) {
    return '[Table]';
  }

  return cleaned || rawText;
};

export const isImageMedia = (url?: string, type?: string): boolean => {
  if (!url) return false;
  if (type && (type.startsWith('image/') || type.toLowerCase() === 'image')) return true;
  const cleanUrl = url.split('?')[0].toLowerCase();
  return /\.(jpe?g|png|webp|gif|svg|bmp|avif|ico)$/i.test(cleanUrl);
};
