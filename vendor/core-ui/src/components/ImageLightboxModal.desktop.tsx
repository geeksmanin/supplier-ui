import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { resolveMediaUrl } from '../utils/media';
import { ImageLightboxModalProps } from './ImageLightboxModal.types';

export const ImageLightboxModalDesktop: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  src,
  alt = '',
  onClose,
  images,
  initialIndex,
  onIndexChange,
}) => {
  const imageList = images && images.length > 0 ? images : [src];
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (typeof initialIndex === 'number' && initialIndex >= 0 && initialIndex < imageList.length) {
      return initialIndex;
    }
    const idx = imageList.indexOf(src);
    return idx >= 0 ? idx : 0;
  });

  const [zoom, setZoom] = useState(1);
  const [hasError, setHasError] = useState(false);

  const activeSrc = imageList[currentIndex] || src || '';
  const resolvedSrc = activeSrc ? resolveMediaUrl(activeSrc) : '';

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setHasError(false);
      if (typeof initialIndex === 'number' && initialIndex >= 0 && initialIndex < imageList.length) {
        setCurrentIndex(initialIndex);
      } else {
        const idx = imageList.indexOf(src);
        if (idx >= 0) setCurrentIndex(idx);
      }
    }
  }, [isOpen, src, initialIndex]);

  const handleSelectIndex = (idx: number) => {
    if (idx >= 0 && idx < imageList.length) {
      setCurrentIndex(idx);
      setZoom(1);
      setHasError(false);
      if (onIndexChange) onIndexChange(idx);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === '+' || e.key === '=') setZoom((z) => Math.min(z + 0.25, 4));
      if (e.key === '-' || e.key === '_') setZoom((z) => Math.max(z - 0.25, 0.5));
      if (e.key === '0') setZoom(1);
      if (e.key === 'ArrowRight' && imageList.length > 1) {
        handleSelectIndex((currentIndex + 1) % imageList.length);
      }
      if (e.key === 'ArrowLeft' && imageList.length > 1) {
        handleSelectIndex((currentIndex - 1 + imageList.length) % imageList.length);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, currentIndex, imageList]);

  if (!isOpen || !activeSrc || typeof document === 'undefined') return null;

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const downloadUrl = resolveMediaUrl(activeSrc, { download: true });
    const ext = activeSrc.split('.').pop()?.split('?')[0] || 'jpg';
    const filename = (alt ? alt.replace(/\s+/g, '_') : 'image') + '_' + (currentIndex + 1) + '.' + ext;

    try {
      const resp = await fetch(downloadUrl);
      if (!resp.ok) throw new Error('Fetch failed');
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch {
      // Fallback
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
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
      {/* Previous Arrow for Multi-photo */}
      {imageList.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectIndex((currentIndex - 1 + imageList.length) % imageList.length);
          }}
          title="Previous Image (Left Arrow)"
          style={{
            position: 'absolute',
            left: '1.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(30, 41, 59, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1000000,
            fontSize: '1.4rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            transition: 'background-color 0.15s ease',
          }}
        >
          ‹
        </button>
      )}

      {/* Next Arrow for Multi-photo */}
      {imageList.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectIndex((currentIndex + 1) % imageList.length);
          }}
          title="Next Image (Right Arrow)"
          style={{
            position: 'absolute',
            right: '1.5rem',
            top: '50%',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(30, 41, 59, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#FFFFFF',
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1000000,
            fontSize: '1.4rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
            transition: 'background-color 0.15s ease',
          }}
        >
          ›
        </button>
      )}

      {/* Bottom Thumbnail Strip for Multi-photo */}
      {imageList.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(12px)',
            padding: '6px 12px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            maxWidth: '90vw',
            overflowX: 'auto',
            zIndex: 1000000,
          }}
        >
          {imageList.map((imgUrl, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectIndex(idx)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #38BDF8' : '1px solid rgba(255, 255, 255, 0.2)',
                  overflow: 'hidden',
                  padding: 0,
                  backgroundColor: '#0F172A',
                  cursor: 'pointer',
                  opacity: isSelected ? 1 : 0.6,
                  transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <img
                  src={resolveMediaUrl(imgUrl)}
                  alt={`Thumbnail ${idx + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>,
    document.body
  );
};

