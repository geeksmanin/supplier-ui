import { useState, useCallback } from 'react';
import { uploadMediaFile, resolveMediaUrl, ResolveMediaOptions } from '../utils/media';
import { downloadFile } from '../utils/downloader';

export interface UseMediaOptions {
  bucket?: string;
  onSuccess?: (url: string) => void;
  onError?: (err: Error) => void;
}

export interface UseMediaReturn {
  uploading: boolean;
  downloading: boolean;
  error: string | null;
  uploadedUrl: string | null;
  upload: (file: File, customBucket?: string) => Promise<string>;
  download: (urlOrId: string, customFilename?: string) => Promise<void>;
  resolveUrl: (path: string, options?: ResolveMediaOptions) => string;
  getPreview: (file: File) => Promise<string>;
  reset: () => void;
}

/**
 * useMedia is the unified Core hook for all media operations across Geeksman ERP:
 * uploading to /media/upload, downloading files, resolving complete paths from relative IDs,
 * and generating instant local previews.
 */
export function useMedia(options: UseMediaOptions = {}): UseMediaReturn {
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
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

  const download = useCallback(
    async (urlOrId: string, customFilename?: string): Promise<void> => {
      setDownloading(true);
      setError(null);
      try {
        const fullUrl = resolveMediaUrl(urlOrId, { download: true });
        await downloadFile(fullUrl, customFilename);
      } catch (err: any) {
        const msg = err?.message || 'Media download failed';
        setError(msg);
        if (options.onError) options.onError(err);
        throw err;
      } finally {
        setDownloading(false);
      }
    },
    [options]
  );

  const resolveUrl = useCallback((path: string, opts?: ResolveMediaOptions) => {
    return resolveMediaUrl(path, opts);
  }, []);

  const getPreview = useCallback((file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }, []);

  const reset = useCallback(() => {
    setUploading(false);
    setDownloading(false);
    setError(null);
    setUploadedUrl(null);
  }, []);

  return {
    uploading,
    downloading,
    error,
    uploadedUrl,
    upload,
    download,
    resolveUrl,
    getPreview,
    reset,
  };
}
