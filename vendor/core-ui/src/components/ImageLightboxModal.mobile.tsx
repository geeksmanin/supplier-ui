import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { resolveMediaUrl } from '../utils/media';
import { ImageLightboxModalProps } from './ImageLightboxModal.types';

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100dvh',
  backgroundColor: 'rgba(15, 23, 42, 0.96)',
  backdropFilter: 'blur(8px)',
  zIndex: 999999,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none',
  touchAction: 'none',
  WebkitOverflowScrolling: 'touch',
};

const topBarStyle: React.CSSProperties = {
  position: 'absolute',
  top: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))',
  left: 'max(0.75rem, env(safe-area-inset-left, 0.75rem))',
  right: 'max(0.75rem, env(safe-area-inset-right, 0.75rem))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  zIndex: 1000000,
};

const topActionsWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

const downloadBtnStyle: React.CSSProperties = {
  backgroundColor: 'rgba(30, 41, 59, 0.85)',
  border: 'none',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '0.85rem',
  padding: '6px 12px',
  borderRadius: '20px',
  cursor: 'pointer',
};

const closeBtnStyle: React.CSSProperties = {
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
};

const viewportContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  padding: '1rem',
  boxSizing: 'border-box',
  touchAction: 'none',
};

export const ImageLightboxModalMobile: React.FC<ImageLightboxModalProps> = ({
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
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const [hasError, setHasError] = useState(false);

  const initialDistanceRef = useRef<number | null>(null);
  const initialZoomRef = useRef<number>(1);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTapRef = useRef<number>(0);
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const activeSrc = imageList[currentIndex] || src || '';
  const resolvedSrc = activeSrc ? resolveMediaUrl(activeSrc) : '';

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPan({ x: 0, y: 0 });
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
      setPan({ x: 0, y: 0 });
      setHasError(false);
      if (onIndexChange) onIndexChange(idx);
    }
  };

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

  const getDistance = (t1: React.Touch, t2: React.Touch) => {
    return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Two-finger pinch start
      setIsInteracting(true);
      initialDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
      initialZoomRef.current = zoom;
    } else if (e.touches.length === 1) {
      // Single finger drag or double-tap detection
      const touch = e.touches[0];
      panStartRef.current = { x: touch.clientX, y: touch.clientY };
      panCurrentRef.current = { ...pan };
      if (zoom <= 1) {
        swipeStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      }

      const now = Date.now();
      if (now - lastTapRef.current < 300) {
        // Double-tap toggle between 1x and 2.5x
        if (zoom > 1) {
          setZoom(1);
          setPan({ x: 0, y: 0 });
        } else {
          setZoom(2.5);
        }
        lastTapRef.current = 0;
      } else {
        lastTapRef.current = now;
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistanceRef.current !== null) {
      // Pinch to zoom gesture
      e.preventDefault();
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scaleFactor = currentDistance / initialDistanceRef.current;
      const newZoom = Math.min(Math.max(initialZoomRef.current * scaleFactor, 1), 4);
      setZoom(newZoom);
      if (newZoom <= 1) {
        setPan({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && zoom > 1) {
      // Pan/drag image when zoomed
      e.preventDefault();
      setIsInteracting(true);
      const touch = e.touches[0];
      const deltaX = touch.clientX - panStartRef.current.x;
      const deltaY = touch.clientY - panStartRef.current.y;
      setPan({
        x: panCurrentRef.current.x + deltaX,
        y: panCurrentRef.current.y + deltaY,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0) {
      setIsInteracting(false);
      initialDistanceRef.current = null;
      if (zoom <= 1) {
        setPan({ x: 0, y: 0 });
        if (swipeStartRef.current && imageList.length > 1) {
          const deltaX = (e.changedTouches[0]?.clientX || 0) - swipeStartRef.current.x;
          const deltaTime = Date.now() - swipeStartRef.current.time;
          if (Math.abs(deltaX) > 40 && deltaTime < 400) {
            if (deltaX < 0) {
              // Swiped left ➔ Next image
              handleSelectIndex((currentIndex + 1) % imageList.length);
            } else {
              // Swiped right ➔ Previous image
              handleSelectIndex((currentIndex - 1 + imageList.length) % imageList.length);
            }
          }
        }
      }
      swipeStartRef.current = null;
    } else if (e.touches.length === 1) {
      // Switched from pinch to single finger
      initialDistanceRef.current = null;
      const touch = e.touches[0];
      panStartRef.current = { x: touch.clientX, y: touch.clientY };
      panCurrentRef.current = { ...pan };
    }
  };

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={modalOverlayStyle}
    >
      {/* Mobile Top Bar: Download and Close */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={topBarStyle}
      >
        <div style={topActionsWrapStyle}>
          <button
            type="button"
            onClick={handleDownload}
            style={downloadBtnStyle}
          >
            ⬇
          </button>
          <button
            type="button"
            onClick={onClose}
            style={closeBtnStyle}
          >
            ✕
          </button>
        </div>
      </div>

      <div
        style={viewportContainerStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {hasError ? (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '24px',
              backgroundColor: 'rgba(30, 41, 59, 0.85)',
              borderRadius: '12px',
              color: '#ffffff',
              textAlign: 'center',
              maxWidth: '85vw',
            }}
          >
            <p style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600 }}>Unable to load image</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
              The image source could not be resolved or network failed.
            </p>
          </div>
        ) : (
          <img
            src={resolvedSrc || src}
            alt={alt}
            onError={() => setHasError(true)}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '92vw',
              maxHeight: '82vh',
              objectFit: 'contain',
              borderRadius: '8px',
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: isInteracting ? 'none' : 'transform 0.25s cubic-bezier(0.25, 0.1, 0.25, 1)',
              pointerEvents: 'auto',
            }}
          />
        )}
      </div>

      {/* Bottom Thumbnail Strip for Multi-photo on Mobile */}
      {imageList.length > 1 && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            padding: '6px 12px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            maxWidth: '92vw',
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
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
                  width: '44px',
                  height: '44px',
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


