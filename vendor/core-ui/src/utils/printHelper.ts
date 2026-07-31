import { apiClient } from '../api/client';

/**
 * Sends HTML content to the core backend printing service, which launches
 * an isolated Wails print dialog window loading the shared PrintPage route.
 * 
 * @param html The template/printable inner HTML content.
 * @param css Optional CSS stylesheet rules (e.g. for widths, margins).
 */
export const printHTML = async (html: string, css?: string): Promise<void> => {
  if (!html) {
    console.warn('printHTML: No content provided');
    return;
  }
  try {
    await apiClient.post('/runtime/print-html', { html, css: css || '' });
  } catch (error) {
    console.error('printHTML: Shared print service failed, falling back to window.print()', error);
    window.print();
  }
};
