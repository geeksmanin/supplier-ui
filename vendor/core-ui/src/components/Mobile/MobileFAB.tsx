import React from 'react';

export interface MobileFABProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  badge?: number | string;
  color?: string;
  bottom?: string;
  right?: string;
  title?: string;
}

export const MobileFAB: React.FC<MobileFABProps> = ({
  onClick,
  icon,
  label,
  badge,
  color = '#2563eb',
  bottom = '84px',
  right = '20px',
  title = 'Create New',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: 'fixed',
        bottom,
        right,
        zIndex: 900,
        height: label ? '46px' : '52px',
        padding: label ? '0 18px 0 14px' : '0',
        width: label ? 'auto' : '52px',
        borderRadius: label ? '23px' : '50%',
        backgroundColor: color,
        color: '#ffffff',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        boxShadow: '0 8px 20px -2px rgba(37, 99, 235, 0.45), 0 4px 10px rgba(0, 0, 0, 0.1)',
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        fontWeight: 700,
        fontSize: '0.85rem',
      }}
      title={title}
    >
      {/* Plus icon default */}
      {icon ? (
        icon
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      )}

      {label && <span>{label}</span>}

      {badge !== undefined && badge !== null && (
        <span style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          backgroundColor: '#ef4444',
          color: '#ffffff',
          fontSize: '0.65rem',
          fontWeight: 800,
          minWidth: '18px',
          height: '18px',
          borderRadius: '9px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 4px',
          border: '1.5px solid #ffffff',
        }}>
          {badge}
        </span>
      )}
    </button>
  );
};
