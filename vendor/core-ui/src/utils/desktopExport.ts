import { apiClient } from '../api/client';
import * as XLSX from 'xlsx';

export async function saveDesktopExportFile(workbook: XLSX.WorkBook, filename: string, b64: string): Promise<void> {
  try {
    const res = await apiClient.post('/runtime/save-file', {
      filename,
      content: b64,
      is_base64: true,
    });
    if (res.data?.cancelled) {
      return;
    }
    const path = res.data?.data?.path || res.data?.path || '';
    console.info(`File exported successfully: ${path}`);
  } catch (err: any) {
    console.warn('Native save failed, falling back to browser write:', err);
    XLSX.writeFile(workbook, filename);
  }
}
