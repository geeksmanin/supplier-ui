import React from 'react';

export interface VersionBadgeProps {
  version: string;
  onClick?: () => void;
  updateReady?: boolean;
  prefix?: string;
  style?: React.CSSProperties;
  className?: string;
  showDot?: boolean;
}

export const VersionBadge: React.FC<VersionBadgeProps> = ({
  version,
  onClick,
  updateReady = false,
  prefix = 'UI',
  style,
  className = '',
  showDot = true,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`version-badge-pill ${className}`}
      title="Click to view full version and system details"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '0.2rem 0.55rem',
        borderRadius: '9999px',
        backgroundColor: updateReady ? '#fef2f2' : '#f1f5f9',
        border: updateReady ? '1px solid #fecaca' : '1px solid #e2e8f0',
        color: updateReady ? '#b91c1c' : '#475569',
        fontSize: '0.7rem',
        fontWeight: 700,
        fontFamily: '"Outfit", "Inter", monospace, sans-serif',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease-in-out',
        outline: 'none',
        lineHeight: 1.2,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = updateReady ? '#fee2e2' : '#e2e8f0';
          e.currentTarget.style.borderColor = updateReady ? '#fca5a5' : '#cbd5e1';
          e.currentTarget.style.color = updateReady ? '#991b1b' : '#0f172a';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = updateReady ? '#fef2f2' : '#f1f5f9';
          e.currentTarget.style.borderColor = updateReady ? '#fecaca' : '#e2e8f0';
          e.currentTarget.style.color = updateReady ? '#b91c1c' : '#475569';
        }
      }}
    >
      {showDot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: updateReady ? '#ef4444' : '#10b981',
            boxShadow: updateReady ? '0 0 6px #ef4444' : '0 0 4px #10b981',
            flexShrink: 0,
          }}
        />
      )}
      <span>{prefix ? `${prefix} ${version}` : version}</span>
    </button>
  );
};
