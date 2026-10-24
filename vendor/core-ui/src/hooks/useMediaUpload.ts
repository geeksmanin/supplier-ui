import { useState, useCallback } from 'react';
import { uploadMediaFile, resolveMediaUrl } from '../utils/media';

export interface UseMediaUploadOptions {
  bucket?: string;
  onSuccess?: (url: string) => void;
  onError?: (err: Error) => void;
}

export interface UseMediaUploadReturn {
  uploading: boolean;
  error: string | null;
  uploadedUrl: string | null;
  upload: (file: File, customBucket?: string) => Promise<string>;
  uploadMedia: (
    file: File,
    customBucket?: string,
    options?: UseMediaUploadOptions
  ) => Promise<{ url: string; filename: string; file_id: string; upload_id: string }>;
  resolveUrl: (path: string) => string;
  reset: () => void;
}

/**
 * useMediaUpload is a standardized Core hook for uploading files to /media/upload,
 * managing loading/error states, and resolving media URLs automatically.
 */
export function useMediaUpload(options: UseMediaUploadOptions = {}): UseMediaUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const upload = useCallback(
    async (file: File, customBucket?: string): Promise<string> => {
      setUploading(true);
      setError(null);
      try {
        const bucket = customBucket || options.bucket || 'samwad';
        const url = await uploadMediaFile(file, bucket);
        setUploadedUrl(url);
        if (options.onSuccess) options.onSuccess(url);
        return url;
      } catch (err: any) {
        const msg = err?.message || 'Media upload failed';
        setError(msg);
        if (options.onError) options.onError(err);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    [options]
  );

  const uploadMedia = useCallback(
    async (
      file: File,
      customBucket?: string,
      customOptions?: UseMediaUploadOptions
    ): Promise<{ url: string; filename: string; file_id: string; upload_id: string }> => {
      const url = await upload(file, customBucket);
      if (customOptions?.onSuccess) {
        customOptions.onSuccess(url);
      }
      return { url, filename: url, file_id: url, upload_id: url };
    },
    [upload]
  );

  const resolveUrl = useCallback((path: string) => resolveMediaUrl(path), []);

  const reset = useCallback(() => {
    setUploading(false);
    setError(null);
    setUploadedUrl(null);
  }, []);

  return {
    uploading,
    error,
    uploadedUrl,
    upload,
    uploadMedia,
    resolveUrl,
    reset,
  };
}
