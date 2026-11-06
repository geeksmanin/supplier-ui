import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { resolveMediaUrl } from '../utils/media';
import { ImageLightboxModalProps } from './ImageLightboxModal.types';

export const ImageLightboxModalDesktop: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  src,
  alt = '',
  onClose,
}) => {
  const [zoom, setZoom] = useState(1);
  const [hasError, setHasError] = useState(false);

  const resolvedSrc = src ? resolveMediaUrl(src) : '';

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setHasError(false);
    }
  }, [isOpen, src]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.25, 4));
      if (e.key === '-' || e.key === '_') setZoom((z) => Math.max(z - 0.25, 0.5));
      if (e.key === '0') setZoom(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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
      onWheel={(e) => {
        e.stopPropagation();
        if (e.deltaY < 0) {
          setZoom((z) => Math.min(z + 0.25, 4));
        } else {
          setZoom((z) => Math.max(z - 0.25, 0.5));
        }
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.94)',
        backdropFilter: 'blur(10px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          backdropFilter: 'blur(12px)',
          padding: '6px 12px',
          borderRadius: '30px',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          zIndex: 1000000,
        }}
      >
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
          disabled={zoom <= 0.5}
          title="Zoom Out (-)"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: zoom <= 0.5 ? 'rgba(255,255,255,0.3)' : 'var(--color-text-inverse, #ffffff)',
            fontWeight: 700,
            fontSize: '1.1rem',
            cursor: zoom <= 0.5 ? 'default' : 'pointer',
            padding: '2px 8px',
          }}
        >
          −
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          title="Reset Zoom"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            border: 'none',
            color: 'var(--color-text-inverse, #ffffff)',
            padding: '3px 8px',
            borderRadius: '12px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(z + 0.25, 4))}
          disabled={zoom >= 4}
          title="Zoom In (+)"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: zoom >= 4 ? 'rgba(255,255,255,0.3)' : 'var(--color-text-inverse, #ffffff)',
            fontWeight: 700,
            fontSize: '1.1rem',
            cursor: zoom >= 4 ? 'default' : 'pointer',
            padding: '2px 8px',
          }}
        >
          +
        </button>
        <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '0 2px' }} />
        <button
          type="button"
          onClick={handleDownload}
          title="Download image"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--color-text-inverse, #ffffff)',
            fontWeight: 600,
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
          }}
        >
          ⬇ Download
        </button>
        <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255, 255, 255, 0.2)', margin: '0 2px' }} />
        <button
          type="button"
          onClick={onClose}
          title="Close"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.85)',
            border: 'none',
            color: 'var(--color-text-inverse, #ffffff)',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem',
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: zoom > 1 ? 'auto' : 'hidden',
          padding: '2rem',
          boxSizing: 'border-box',
        }}
      >
        {hasError ? (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '32px',
              backgroundColor: 'rgba(30, 41, 59, 0.85)',
              borderRadius: '12px',
              color: '#ffffff',
              textAlign: 'center',
              maxWidth: '500px',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 600 }}>Unable to load image</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
              The image source could not be resolved or network failed.
            </p>
          </div>
        ) : (
          <img
            src={resolvedSrc || src}
            alt={alt}
            onError={() => setHasError(true)}
            onClick={(e) => {
              e.stopPropagation();
              setZoom((z) => (z === 1 ? 2 : 1));
            }}
            style={{
              maxWidth: zoom <= 1 ? '85vw' : undefined,
              maxHeight: zoom <= 1 ? '85vh' : undefined,
              objectFit: 'contain',
              borderRadius: '10px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
              cursor: zoom === 1 ? 'zoom-in' : 'zoom-out',
            }}
          />
        )}
      </div>
    </div>,
    document.body
  );
};

