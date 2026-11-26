import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Z_INDEX } from '../../constants';

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
  if (!isOpen || !renderMoreDetailsDrawer) return null;

  const drawerContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: Z_INDEX.DRAWER_BACKDROP,
        backgroundColor: 'rgba(15, 23, 42, 0.25)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Additional Document Details"
        style={{
          position: 'relative',
          width: '420px',
          maxWidth: '100vw',
          height: '100%',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid #cbd5e1',
          boxShadow: '-8px 0 25px rgba(0, 0, 0, 0.15)',
          zIndex: Z_INDEX.DRAWER,
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
          {renderMoreDetailsDrawer(isOpen, onClose)}
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(drawerContent, document.body);
  }
  return drawerContent;
};
