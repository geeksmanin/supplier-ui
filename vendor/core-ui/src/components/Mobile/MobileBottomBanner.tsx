import React, { useEffect, useState } from 'react';

export interface MobileBottomBannerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  headerRight?: React.ReactNode;
  height?: string;
  maxHeight?: string;
  showDragHandle?: boolean;
  hideHeader?: boolean;
  children: React.ReactNode;
}

export const MobileBottomBanner: React.FC<MobileBottomBannerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  headerRight,
  height = '88vh',
  maxHeight = '94vh',
  showDragHandle = true,
  hideHeader = false,
  children,
}) => {
  const [mounted, setMounted] = useState(isOpen);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      const timer = setTimeout(() => setAnimateIn(true), 15);
      // Lock background scrolling
      document.body.style.overflow = 'hidden';
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => setMounted(false), 280);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10002,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        pointerEvents: 'auto',
      }}
    >
      {/* Semi-transparent Dimmed Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: animateIn ? 1 : 0,
          transition: 'opacity 0.26s ease-out',
        }}
      />

      {/* Slide-Up Bottom Banner Sheet */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height,
          maxHeight,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 -10px 40px -5px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transform: animateIn ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
          boxSizing: 'border-box',
          zIndex: 1,
        }}
      >
        {/* Drag Indicator Handle */}
        {showDragHandle && (
          <div
            onClick={onClose}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              padding: '8px 0 4px 0',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: '36px',
                height: '4px',
                borderRadius: '9999px',
                backgroundColor: '#cbd5e1',
              }}
            />
          </div>
        )}

        {/* Optional Header */}
        {!hideHeader && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.5rem 1rem 0.6rem 1rem',
              borderBottom: '1px solid #f1f5f9',
              flexShrink: 0,
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {typeof title === 'string' ? (
                    <span
                      style={{
                        fontSize: '1rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {title}
                    </span>
                  ) : (
                    title
                  )}
                  {badge}
                </div>
                {subtitle && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#64748b',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {subtitle}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              {headerRight}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: 0,
                  transition: 'background-color 0.15s ease',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content Container */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
