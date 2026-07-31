import React from 'react';
import { Button } from './Button';

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string | null;
  title: string;
  onToast?: (message: string, type: 'success' | 'error') => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  url,
  title,
  onToast
}) => {
  if (!isOpen || !url) return null;

  const isImage = url.toLowerCase().endsWith('.svg') || 
                  url.toLowerCase().includes('.svg?') || 
                  url.toLowerCase().includes('.png') || 
                  url.toLowerCase().includes('.jpg') || 
                  url.toLowerCase().includes('.jpeg') || 
                  url.toLowerCase().includes('image/svg+xml') ||
                  url.toLowerCase().includes('data:image');

  const handleDownload = async () => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const ext = url.split('.').pop()?.split('?')[0] || 'svg';
      a.download = `${title.replace(/\s+/g, '_')}_document.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      if (onToast) {
        onToast('Failed to download file directly. Attempting backup download.', 'error');
      }
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.click();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.98)',
      backdropFilter: 'blur(12px)',
      zIndex: 40000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>
            Document Preview - {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#e2e8f0',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>

        <div style={{
          flex: 1,
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          overflow: 'auto',
          minHeight: '300px'
        }}>
          {isImage ? (
            <img
              src={url}
              alt={title}
              style={{
                maxWidth: '100%',
                maxHeight: '50vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          ) : (
            <iframe
              src={url}
              title={title}
              style={{
                width: '100%',
                height: '50vh',
                border: 'none',
                borderRadius: '8px'
              }}
            />
          )}
        </div>

        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          backgroundColor: '#ffffff'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              transition: 'background-color 0.15s'
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: '#1a56db',
              color: '#ffffff',
              transition: 'background-color 0.15s'
            }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};
