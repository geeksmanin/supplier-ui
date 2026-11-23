import React from 'react';
import { X } from 'lucide-react';

export interface FastVoucherMoreDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  renderMoreDetailsDrawer?: (isOpen: boolean, onClose: () => void) => React.ReactNode;
}

export const FastVoucherMoreDetailsDrawer: React.FC<FastVoucherMoreDetailsDrawerProps> = ({
  isOpen,
  onClose,
  renderMoreDetailsDrawer,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '420px',
        backgroundColor: '#ffffff',
        borderLeft: '1px solid #cbd5e1',
        boxShadow: '-8px 0 25px rgba(0, 0, 0, 0.15)',
        zIndex: 70,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
          Additional Document Details
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
        {renderMoreDetailsDrawer ? (
          renderMoreDetailsDrawer(isOpen, onClose)
        ) : (
          <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
            No additional fields configured for this voucher.
          </div>
        )}
      </div>
    </div>
  );
};
