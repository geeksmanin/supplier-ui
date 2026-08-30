import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { resolveMediaUrl } from '../utils/media';

export interface ImageThumbnailWithZoomProps {
  src?: string;
  alt?: string;
  size?: number;
  zoomSize?: number;
  rounded?: number | string;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const ImageThumbnailWithZoom: React.FC<ImageThumbnailWithZoomProps> = ({
  src,
  alt = '',
  size = 38,
  zoomSize = 200,
  rounded = 6,
  onClick,
  style,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!src || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let left = rect.right + 12;
    let top = rect.top - (zoomSize - rect.height) / 2;

    // Keep within viewport boundaries
    if (left + zoomSize > window.innerWidth - 16) {
      left = rect.left - zoomSize - 12;
    }
    if (top < 16) top = 16;
    if (top + zoomSize > window.innerHeight - 16) {
      top = window.innerHeight - zoomSize - 16;
    }

    setPopoverPos({ top, left });
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (!src) {
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: typeof rounded === 'number' ? `${rounded}px` : rounded,
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          color: '#cbd5e1',
          ...style,
        }}
        title="No image"
      >
        <svg
          width={Math.round(size * 0.5)}
          height={Math.round(size * 0.5)}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      </div>
    );
  }

  const fullUrl = resolveMediaUrl(src);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: typeof rounded === 'number' ? `${rounded}px` : rounded,
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        ...style,
      }}
    >
      <img
        src={fullUrl}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
        loading="lazy"
      />

      {isHovered &&
        typeof document !== 'undefined' &&
        ReactDOM.createPortal(
          <div
            style={{
              position: 'fixed',
              top: `${popoverPos.top}px`,
              left: `${popoverPos.left}px`,
              width: `${zoomSize}px`,
              height: `${zoomSize}px`,
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
              padding: '6px',
              zIndex: 99999,
              pointerEvents: 'none',
              animation: 'imgZoomFadeIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <img
              src={fullUrl}
              alt={alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '8px',
                backgroundColor: '#f8fafc',
                display: 'block',
              }}
            />
            <style>{`
              @keyframes imgZoomFadeIn {
                from { opacity: 0; transform: scale(0.92); }
                to { opacity: 1; transform: scale(1); }
              }
            `}</style>
          </div>,
          document.body
        )}
    </div>
  );
};
