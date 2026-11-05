import React, { useState, useEffect } from 'react';
import { DocumentPreviewModalProps } from './DocumentPreviewModal.types';

export const DocumentPreviewModalDesktop: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  url,
  title
}) => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
  }, [url, isOpen]);

  if (!isOpen || !url) return null;

  const isImage = url.toLowerCase().endsWith('.svg') || 
                  url.toLowerCase().includes('.svg?') || 
                  url.toLowerCase().includes('.png') || 
                  url.toLowerCase().includes('.jpg') || 
                  url.toLowerCase().includes('.jpeg') || 
                  url.toLowerCase().includes('image/svg+xml') ||
                  url.toLowerCase().includes('data:image');

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = url;
    const ext = url.split('.').pop()?.split('?')[0] || 'svg';
    a.download = `${title.replace(/\s+/g, '_')}_document.${ext}`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        backgroundColor: 'var(--color-bg-primary, #ffffff)',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid var(--color-border-subtle, #e2e8f0)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-border-subtle, #f1f5f9)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--color-bg-secondary, #f8fafc)'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary, #1e293b)' }}>
            Document Preview - {title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isImage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--color-bg-subtle, #e2e8f0)', borderRadius: '20px', padding: '2px 6px' }}>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  disabled={zoom <= 0.5}
                  title="Zoom Out"
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: zoom <= 0.5 ? 'default' : 'pointer',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: zoom <= 0.5 ? '#94a3b8' : '#334155',
                    padding: '2px 6px'
                  }}
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  title="Reset Zoom"
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: '#334155',
                    padding: '2px 4px'
                  }}
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
                  disabled={zoom >= 4}
                  title="Zoom In"
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: zoom >= 4 ? 'default' : 'pointer',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: zoom >= 4 ? '#94a3b8' : '#334155',
                    padding: '2px 6px'
                  }}
                >
                  +
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-subtle, #e2e8f0)',
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
        </div>

        <div
          onWheel={(e) => {
            if (!isImage) return;
            e.stopPropagation();
            if (e.deltaY < 0) {
              setZoom((z) => Math.min(z + 0.2, 4));
            } else {
              setZoom((z) => Math.max(z - 0.2, 0.5));
            }
          }}
          style={{
            flex: 1,
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-bg-secondary, #f8fafc)',
            overflow: isImage && zoom > 1 ? 'auto' : 'hidden',
            minHeight: '300px'
          }}
        >
          {isImage ? (
            <img
              src={url}
              alt={title}
              onClick={() => {
                if (zoom === 1) setZoom(2);
                else setZoom(1);
              }}
              style={{
                maxWidth: zoom <= 1 ? '100%' : undefined,
                maxHeight: zoom <= 1 ? '50vh' : undefined,
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                cursor: zoom === 1 ? 'zoom-in' : 'zoom-out'
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
          borderTop: '1px solid var(--color-border-subtle, #f1f5f9)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem',
          backgroundColor: 'var(--color-bg-primary, #ffffff)'
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

