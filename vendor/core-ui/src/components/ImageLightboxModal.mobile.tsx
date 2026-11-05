import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { resolveMediaUrl } from '../utils/media';
import { ImageLightboxModalProps } from './ImageLightboxModal.types';

export const ImageLightboxModalMobile: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  src,
  alt = '',
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (isOpen) setZoom(1);
  }, [isOpen, src]);

  if (!isOpen || !src || typeof document === 'undefined') return null;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const downloadUrl = resolveMediaUrl(src, { download: true });
    const a = document.createElement('a');
    a.href = downloadUrl;
    const ext = src.split('.').pop()?.split('?')[0] || 'jpg';
    a.download = (alt ? alt.replace(/\s+/g, '_') : 'image') + '.' + ext;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.96)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      {/* Mobile Top Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '0.75rem',
          left: '0.75rem',
          right: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 1000000,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(30, 41, 59, 0.85)', padding: '4px 8px', borderRadius: '20px' }}>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
            disabled={zoom <= 0.5}
            style={{ border: 'none', background: 'none', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', padding: '2px 6px' }}
          >
            −
          </button>
          <button
            type="button"
            onClick={() => setZoom(1)}
            style={{ border: 'none', background: 'none', color: '#ffffff', fontWeight: 700, fontSize: '0.7rem', padding: '2px 4px' }}
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
            disabled={zoom >= 3}
            style={{ border: 'none', background: 'none', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', padding: '2px 6px' }}
          >
            +
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleDownload}
            style={{
              backgroundColor: 'rgba(30, 41, 59, 0.85)',
              border: 'none',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.8rem',
              padding: '6px 10px',
              borderRadius: '20px',
              cursor: 'pointer',
            }}
          >
            ⬇
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.85)',
              border: 'none',
              color: '#ffffff',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            ✕
          </button>
        </div>
      </div>

      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: zoom > 1 ? 'auto' : 'hidden',
          padding: '1rem',
          boxSizing: 'border-box',
        }}
      >
        <img
          src={src}
          alt={alt}
          onClick={(e) => {
            e.stopPropagation();
            setZoom((z) => (z === 1 ? 1.75 : 1));
          }}
          style={{
            maxWidth: zoom <= 1 ? '92vw' : undefined,
            maxHeight: zoom <= 1 ? '80vh' : undefined,
            objectFit: 'contain',
            borderRadius: '8px',
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
          }}
        />
      </div>
    </div>,
    document.body
  );
};

