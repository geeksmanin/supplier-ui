import React from 'react';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Discard',
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(4px)',
          zIndex: 100000,
          transition: 'all 0.25s ease'
        }}
        onClick={onCancel}
      />
      {/* Dialog container */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '400px',
          backgroundColor: 'var(--bg-primary, #ffffff)',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid var(--border-color, #e2e8f0)',
          padding: '1.5rem',
          zIndex: 100001,
          fontFamily: 'Inter, system-ui, sans-serif',
          animation: 'scaleInConfirm 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <style>{`
          @keyframes scaleInConfirm {
            from { transform: translate(-50%, -45%) scale(0.95); opacity: 0; }
            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
        `}</style>
        
        {/* Title */}
        <h3
          style={{
            margin: '0 0 0.5rem 0',
            fontSize: '1.125rem',
            fontWeight: 700,
            color: 'var(--text-primary, #1f2937)'
          }}
        >
          {title}
        </h3>
        
        {/* Message */}
        <p
          style={{
            margin: '0 0 1.5rem 0',
            fontSize: '0.9rem',
            color: 'var(--text-secondary, #4b5563)',
            lineHeight: 1.5
          }}
        >
          {message}
        </p>
        
        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem'
          }}
        >
          <Button 
            variant="secondary" 
            onClick={onCancel}
            style={{
              backgroundColor: '#f1f5f9',
              color: '#334155',
              border: '1px solid #cbd5e1',
            }}
          >
            {cancelText}
          </Button>
          <Button 
            variant={variant} 
            onClick={onConfirm}
            style={{
              backgroundColor: variant === 'danger' ? '#ef4444' : '#1a56db',
              color: '#ffffff',
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </>
  );
};
