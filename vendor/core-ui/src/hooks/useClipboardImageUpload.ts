import React, { useState } from 'react';
import { apiClient } from '../api/client';

export interface UseClipboardImageUploadOptions {
  folder: string;
  maxFiles?: number;
  onUploaded?: (url: string) => void;
}

function getExtensionFromMime(mimeType: string): string {
  if (!mimeType) return 'bin';
  const subType = mimeType.split('/')[1] || '';

  if (subType.includes('pdf')) return 'pdf';
  if (subType.includes('png')) return 'png';
  if (subType.includes('jpeg') || subType.includes('jpg')) return 'jpg';
  if (subType.includes('webp')) return 'webp';
  if (subType.includes('svg')) return 'svg';
  if (subType.includes('gif')) return 'gif';
  if (subType.includes('word')) return 'docx';
  if (subType.includes('excel') || subType.includes('sheet')) return 'xlsx';
  if (subType.includes('zip')) return 'zip';
  if (subType.includes('text') || subType.includes('plain')) return 'txt';

  return subType.split('+')[0] || 'bin';
}

export function useClipboardImageUpload({
  folder,
  maxFiles = 5,
  onUploaded,
}: UseClipboardImageUploadOptions) {
  const [uploading, setUploading] = useState(false);

  const handlePaste = async (
    e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement> | ClipboardEvent
  ) => {
    const clipboardData =
      (e as React.ClipboardEvent).clipboardData || (e as ClipboardEvent).clipboardData;
    if (!clipboardData) return;

    const filesToUpload: File[] = [];

    // 1. Check items for files (images, PDFs, documents, etc.)
    const items = clipboardData.items;
    if (items && items.length > 0) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) {
            filesToUpload.push(file);
          }
        }
      }
    }

    // 2. Check clipboardData.files fallback
    if (filesToUpload.length === 0 && clipboardData.files && clipboardData.files.length > 0) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        const file = clipboardData.files[i];
        if (file) {
          filesToUpload.push(file);
        }
      }
    }

    if (filesToUpload.length === 0) return;

    // Prevent default browser paste when pasting files
    if ('preventDefault' in e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    setUploading(true);
    try {
      let count = 0;
      for (const file of filesToUpload) {
        if (count >= maxFiles) break;

        // Preserve actual file name & extension if present; only generate fallback for nameless blobs
        let fileToPrepare = file;
        if (!file.name || file.name === 'blob' || file.name === 'file' || file.name === 'image.png') {
          const ext = getExtensionFromMime(file.type);
          const prefix = file.type?.startsWith('image/') ? 'pasted-image' : 'pasted-file';
          fileToPrepare = new File([file], `${prefix}-${Date.now()}-${count}.${ext}`, {
            type: file.type || 'application/octet-stream',
          });
        }

        const formData = new FormData();
        formData.append('file', fileToPrepare);
        formData.append('bucket', folder);

        const res = await apiClient.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const d = res.data?.data || res.data;
        const url = d?.upload_id || d?.uploadId || d?.media_url || d?.url;
        if (url && onUploaded) {
          onUploaded(String(url));
        }
        count++;
      }
    } catch (err: any) {
      console.error('Failed to upload pasted file:', err);
    } finally {
      setUploading(false);
    }
  };

  return { handlePaste, uploading };
}
