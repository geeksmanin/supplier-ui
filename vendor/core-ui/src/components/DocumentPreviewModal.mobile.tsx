import React, { useState, useEffect } from 'react';
import { DocumentPreviewModalProps } from './DocumentPreviewModal.types';

export const DocumentPreviewModalMobile: React.FC<DocumentPreviewModalProps> = ({
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
      flexDirection: 'column',
      justifyContent: 'flex-end'
    }}>
      <div style={{
        backgroundColor: 'var(--color-bg-primary, #ffffff)',
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        width: '100%',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden'
      }}>
        {/* Grabber handle */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '8px' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: 'var(--color-border-subtle, #cbd5e1)' }} />
        </div>

        <div style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--color-border-subtle, #f1f5f9)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary, #1e293b)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
            {title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isImage && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', backgroundColor: 'var(--color-bg-subtle, #e2e8f0)', borderRadius: '16px', padding: '1px 4px' }}>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  disabled={zoom <= 0.5}
                  style={{ border: 'none', background: 'none', fontWeight: 700, fontSize: '0.9rem', color: '#334155', padding: '2px 4px' }}
                >
                  −
                </button>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  style={{ border: 'none', background: 'none', fontWeight: 700, fontSize: '0.7rem', color: '#334155', padding: '2px 2px' }}
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                  disabled={zoom >= 3}
                  style={{ border: 'none', background: 'none', fontWeight: 700, fontSize: '0.9rem', color: '#334155', padding: '2px 4px' }}
                >
                  +
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-bg-subtle, #e2e8f0)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{
          flex: 1,
          padding: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-bg-secondary, #f8fafc)',
          overflow: isImage && zoom > 1 ? 'auto' : 'hidden',
          minHeight: '260px'
        }}>
          {isImage ? (
            <img
              src={url}
              alt={title}
              onClick={() => setZoom((z) => (z === 1 ? 1.75 : 1))}
              style={{
                maxWidth: zoom <= 1 ? '100%' : undefined,
                maxHeight: zoom <= 1 ? '45vh' : undefined,
                objectFit: 'contain',
                borderRadius: '8px',
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)'
              }}
            />
          ) : (
            <iframe
              src={url}
              title={title}
              style={{ width: '100%', height: '45vh', border: 'none', borderRadius: '8px' }}
            />
          )}
        </div>

        <div style={{
          padding: '0.75rem 1rem',
          borderTop: '1px solid var(--color-border-subtle, #f1f5f9)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '0.5rem',
          backgroundColor: 'var(--color-bg-primary, #ffffff)'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              backgroundColor: '#ef4444',
              color: '#ffffff'
            }}
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleDownload}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              backgroundColor: '#1a56db',
              color: '#ffffff'
            }}
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

