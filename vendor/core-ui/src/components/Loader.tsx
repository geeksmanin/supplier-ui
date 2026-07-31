import React from 'react';

export interface LoaderProps {
  message?: string;
  fullscreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({
  message = 'Loading data...',
  fullscreen = false,
  size = 'md',
}) => {
  const sizeMap = {
    sm: '32px',
    md: '54px',
    lg: '80px',
  };

  const currentSize = sizeMap[size];

  // CSS inject helper for glowing gradient keyframe animations
  const styles = `
    @keyframes antigravity-glow-spin {
      0% {
        transform: rotate(0deg);
        filter: hue-rotate(0deg) drop-shadow(0 0 8px rgba(37, 99, 235, 0.4));
      }
      50% {
        filter: hue-rotate(180deg) drop-shadow(0 0 16px rgba(168, 85, 247, 0.7));
      }
      100% {
        transform: rotate(360deg);
        filter: hue-rotate(360deg) drop-shadow(0 0 8px rgba(37, 99, 235, 0.4));
      }
    }
    @keyframes antigravity-pulse-text {
      0%, 100% { opacity: 0.6; transform: scale(0.98); }
      50% { opacity: 1; transform: scale(1.02); }
    }
  `;

  const containerStyle: React.CSSProperties = fullscreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(12px)',
        zIndex: 99999,
        fontFamily: 'Inter, system-ui, sans-serif',
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        minHeight: '200px',
        fontFamily: 'Inter, system-ui, sans-serif',
      };

  const spinnerStyle: React.CSSProperties = {
    width: currentSize,
    height: currentSize,
    borderRadius: '50%',
    background: 'conic-gradient(from 0deg, transparent 20%, #2563eb, #a855f7, #ec4899)',
    WebkitMask: 'radial-gradient(farthest-side, transparent 65%, black 66%)',
    mask: 'radial-gradient(farthest-side, transparent 65%, black 66%)',
    animation: 'antigravity-glow-spin 1.4s linear infinite',
  };

  const textStyle: React.CSSProperties = {
    marginTop: '1.25rem',
    fontSize: size === 'sm' ? '0.8rem' : '0.92rem',
    fontWeight: 600,
    color: fullscreen ? '#f8fafc' : '#1e293b',
    letterSpacing: '0.03em',
    animation: 'antigravity-pulse-text 2s ease-in-out infinite',
  };

  return (
    <div style={containerStyle}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div style={spinnerStyle} />
      {message && <div style={textStyle}>{message}</div>}
    </div>
  );
};
