import React, { useRef, useState } from 'react';
import { apiClient, getWorkspaceFromUrl } from '../api/client';
import { Button } from './Button';

interface ImageUploadProps {
  folder: string;
  label?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  folder,
  label,
  value,
  onChange,
  multiple = false,
  maxFiles = 5,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const atLimit = value.length >= maxFiles;

  const getMediaUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    const baseURL = apiClient.defaults.baseURL || '';
    if (path.startsWith('/')) {
      if (baseURL.startsWith('http://') || baseURL.startsWith('https://')) {
        try {
          const origin = new URL(baseURL).origin;
          return `${origin}${path}`;
        } catch (e) {
          // ignore invalid URL parsing
        }
      }
      return path;
    }
    const tenantCode = localStorage.getItem('tenant_code') || getWorkspaceFromUrl() || 'platform';
    return `${baseURL}/media/${tenantCode}/${path}`;
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', folder);

    const res = await apiClient.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const url = res.data?.url || res.data?.uploadId || res.data?.upload_id;
    if (!url) throw new Error('Upload did not return a valid URL or ID');
    return String(url);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError('');

    try {
      const next = [...value];
      const toUpload = multiple ? Array.from(files) : [files[0]];

      for (const file of toUpload) {
        if (next.length >= maxFiles) break;
        // Limit to 10MB (10 * 1024 * 1024 bytes)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds the 10MB limit.`);
        }
        const url = await uploadFile(file);
        if (multiple) {
          next.push(url);
        } else {
          next.splice(0, next.length, url);
        }
      }
      onChange(next);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: '0.375rem',
  };

  const isImageUrl = (path: string) => {
    if (!path) return false;
    const cleanUrl = path.toLowerCase().split('?')[0];
    return cleanUrl.endsWith('.png') ||
      cleanUrl.endsWith('.jpg') ||
      cleanUrl.endsWith('.jpeg') ||
      cleanUrl.endsWith('.gif') ||
      cleanUrl.endsWith('.webp') ||
      cleanUrl.endsWith('.svg') ||
      cleanUrl.endsWith('.bmp') ||
      path.startsWith('data:image/');
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label ? <label style={labelStyle}>{label}</label> : null}
      {error ? (
        <div style={{ fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>{error}</div>
      ) : null}
      {value.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          {value.map((url, i) => (
            <div key={`${url}-${i}`} style={{ position: 'relative' }}>
              {!isImageUrl(url) ? (
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  color: '#4b5563',
                  padding: '4px',
                  textAlign: 'center',
                  wordBreak: 'break-all',
                  boxSizing: 'border-box'
                }}>
                  <span style={{ fontSize: '1.25rem', marginBottom: '2px' }}>📄</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', whiteSpace: 'nowrap' }}>
                    {url.split('/').pop()?.substring(0, 12) || 'File'}
                  </span>
                </div>
              ) : (
                <img
                  src={getMediaUrl(url)}
                  alt={`Upload ${i + 1}`}
                  onClick={() => setPreviewImage(url)}
                  style={{
                    width: '72px',
                    height: '72px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                  }}
                />
              )}
              <button
                type="button"
                onClick={() => removeAt(i)}
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  fontSize: '0.7rem',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button
        type="button"
        variant="primary"
        isLoading={uploading}
        disabled={atLimit}
        onClick={() => inputRef.current?.click()}
        style={{
          backgroundColor: '#1a56db',
          color: '#ffffff',
          boxShadow: '0 2px 4px rgba(26, 86, 219, 0.2)'
        }}
      >
        {atLimit ? `Max ${maxFiles} files` : multiple ? 'Add attachment' : 'Upload attachment'}
      </Button>

      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.98)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            cursor: 'pointer',
            padding: '1rem',
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <img
              src={getMediaUrl(previewImage)}
              alt="Preview"
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(null);
              }}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0px',
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '2rem',
                cursor: 'pointer',
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
