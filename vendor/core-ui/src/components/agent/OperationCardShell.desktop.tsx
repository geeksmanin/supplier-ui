import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { OperationCardShellProps } from './OperationCardShell.types';

export const OperationCardShellDesktop: React.FC<OperationCardShellProps> = ({
  title,
  subtitle,
  icon,
  statusBadge,
  accentColor = '#008069',
  onClose,
  onCancel,
  onSubmit,
  isSubmitting = false,
  submitLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isSubmitDisabled = false,
  children,
  className = '',
  style = {},
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (onClose || onCancel)) {
        (onClose || onCancel)?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onCancel]);

  return (
    <div
      className={`operation-card-shell-desktop ${className}`}
      role="region"
      aria-label={title}
      style={{
        width: '100%',
        maxWidth: 580,
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'visible',
        margin: '8px 0',
        animation: 'transactionBubbleEntrance 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) both',
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderBottom: '1px solid #F1F5F9',
          backgroundColor: '#FAFCFD',
          gap: 10,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          {icon && (
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: `${accentColor}18`,
                color: accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', lineHeight: 1.25, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{title}</span>
              {statusBadge}
            </div>
            {subtitle && (
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close card"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Body: Natural height, zero internal scroll trapping, scrolls with chat stream */}
      <div
        style={{
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          boxSizing: 'border-box',
          overflowY: 'visible',
          maxHeight: 'none',
        }}
      >
        {children}
      </div>

      {/* Footer */}
      {(onSubmit || onCancel) && (
        <div
          style={{
            padding: '12px 18px',
            borderTop: '1px solid #F1F5F9',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 10,
            boxSizing: 'border-box',
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
          }}
        >
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              style={{
                padding: '10px 18px',
                borderRadius: 10,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#475569',
                fontSize: 13,
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {cancelLabel}
            </button>
          )}

          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitDisabled || isSubmitting}
              style={{
                padding: '10px 22px',
                borderRadius: 10,
                border: 'none',
                backgroundColor: isSubmitDisabled ? '#94A3B8' : accentColor,
                color: '#FFFFFF',
                fontSize: 13,
                fontWeight: 700,
                cursor: isSubmitDisabled || isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: isSubmitDisabled ? 'none' : `0 2px 6px ${accentColor}40`,
                transition: 'all 0.15s ease',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                submitLabel
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
