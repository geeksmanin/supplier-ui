export type DocumentCategory =
  | 'pdf'
  | 'spreadsheet'
  | 'word'
  | 'presentation'
  | 'text'
  | 'archive'
  | 'audio'
  | 'video'
  | 'image'
  | 'generic';

export interface DocTheme {
  bg: string;
  color: string;
  ext: string;
  category: DocumentCategory;
}

/**
 * Extracts a clean file extension from a filename or URL, ignoring query params and hash.
 */
export function getDocumentExtension(filenameOrUrl: string): string {
  if (!filenameOrUrl) return 'FILE';
  const clean = filenameOrUrl.split('?')[0].split('#')[0];
  const parts = clean.split('.');
  if (parts.length <= 1) return 'FILE';
  const ext = parts.pop()?.trim().toUpperCase() || 'FILE';
  return ext;
}

/**
 * getDocTheme returns styling (bg, color) and uppercase extension tag
 * for rendering document badges, cards, and previews consistently across applications.
 */
export function getDocTheme(filenameOrUrl: string): DocTheme {
  const ext = getDocumentExtension(filenameOrUrl);

  if (ext === 'PDF') {
    return { bg: '#FEE2E2', color: '#DC2626', ext: 'PDF', category: 'pdf' };
  }
  if (['XLS', 'XLSX', 'CSV', 'ODS', 'TSV'].includes(ext)) {
    return { bg: '#DCFCE7', color: '#16A34A', ext, category: 'spreadsheet' };
  }
  if (['DOC', 'DOCX', 'ODT', 'RTF'].includes(ext)) {
    return { bg: '#DBEAFE', color: '#2563EB', ext, category: 'word' };
  }
  if (['PPT', 'PPTX', 'ODP', 'KEY'].includes(ext)) {
    return { bg: '#FFEDD5', color: '#EA580C', ext, category: 'presentation' };
  }
  if (['TXT', 'LOG', 'JSON', 'MD', 'XML', 'YAML', 'YML'].includes(ext)) {
    return { bg: '#E0F2FE', color: '#0284C7', ext, category: 'text' };
  }
  if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ', 'BZ2'].includes(ext)) {
    return { bg: '#FEF3C7', color: '#D97706', ext, category: 'archive' };
  }
  if (['MP3', 'WAV', 'OGG', 'M4A', 'AAC', 'WEBM', 'FLAC', 'OPUS'].includes(ext)) {
    return { bg: '#EDE9FE', color: '#7C3AED', ext, category: 'audio' };
  }
  if (['MP4', 'MOV', 'AVI', 'MKV'].includes(ext)) {
    return { bg: '#FCE7F3', color: '#DB2777', ext, category: 'video' };
  }
  if (['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'SVG', 'BMP', 'ICO'].includes(ext)) {
    return { bg: '#FEF9C3', color: '#CA8A04', ext, category: 'image' };
  }

  return {
    bg: '#E6F4EA',
    color: '#008069',
    ext: ext.length <= 5 ? ext : 'DOC',
    category: 'generic'
  };
}

/**
 * Checks whether a given filename or URL represents a document file.
 */
export function isDocumentFile(filenameOrUrl?: string, mimeType?: string): boolean {
  if (mimeType) {
    const lower = mimeType.toLowerCase();
    if (
      lower.includes('pdf') ||
      lower.includes('document') ||
      lower.includes('text') ||
      lower.includes('sheet') ||
      lower.includes('presentation') ||
      lower.includes('excel') ||
      lower.includes('word') ||
      lower.includes('csv') ||
      lower.includes('zip')
    ) {
      return true;
    }
  }
  if (filenameOrUrl) {
    const ext = getDocumentExtension(filenameOrUrl);
    return [
      'PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'CSV', 'TXT', 'MD',
      'JSON', 'LOG', 'RTF', 'ODT', 'ODS', 'PPT', 'PPTX', 'ZIP',
      'RAR', '7Z', 'TAR', 'GZ', 'XML', 'YAML', 'YML'
    ].includes(ext);
  }
  return false;
}

/**
 * Checks whether a given string is a URL, API media path, or data/blob URI.
 */
export function isUrlString(val?: string): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  return /^(https?:\/\/|\/|data:|blob:)/i.test(trimmed);
}

/**
 * Extracts a media URL from structured message properties or fallback multi-line plain text.
 * Centralized utility to prevent code duplication across chat message bubbles and cards.
 */
export function extractMediaUrl(mediaUrl?: string, fallbackContent?: string): string {
  if (mediaUrl) return mediaUrl;
  if (!fallbackContent || typeof fallbackContent !== 'string') return '';

  const trimmed = fallbackContent.trim();
  if (isUrlString(trimmed) && !trimmed.includes('\n')) {
    return trimmed;
  }

  const lines = fallbackContent.split('\n');
  for (let i = 1; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    if (isUrlString(trimmedLine)) {
      return trimmedLine;
    }
  }

  const urlMatch = fallbackContent.match(/(\/api\/v1\/media\/[^\s]+|https?:\/\/[^\s]+)/);
  return urlMatch ? urlMatch[1] : '';
}
