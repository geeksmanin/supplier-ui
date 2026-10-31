import React, { useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

export interface OperationCardShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  statusBadge?: React.ReactNode;
  accentColor?: string;
  onClose?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void | Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitDisabled?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const shellRootStyle: React.CSSProperties = {
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
  overflow: 'hidden',
  margin: '8px 0',
  animation: 'transactionBubbleEntrance 0.3s cubic-bezier(0.25, 0.1, 0.25, 1) both',
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderBottom: '1px solid #F1F5F9',
  backgroundColor: '#FAFCFD',
  gap: 10,
};

const titleWrapStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  minWidth: 0,
  flex: 1,
};

const titleTextStyle: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 700,
  color: '#0F172A',
  lineHeight: 1.25,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
};

const subtitleTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#64748B',
  marginTop: 2,
};

const closeBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 6,
  borderRadius: 6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#64748B',
  transition: 'background-color 0.15s ease',
  flexShrink: 0,
};

const bodyStyle: React.CSSProperties = {
  padding: '14px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  boxSizing: 'border-box',
  overflowY: 'auto',
  maxHeight: 'calc(80vh - 120px)',
};

const footerStyle: React.CSSProperties = {
  padding: '12px 16px',
  borderTop: '1px solid #F1F5F9',
  backgroundColor: '#FFFFFF',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 10,
  boxSizing: 'border-box',
};

const cancelBtnStyle: React.CSSProperties = {
  padding: '10px 18px',
  borderRadius: 10,
  border: '1px solid #CBD5E1',
  backgroundColor: '#FFFFFF',
  color: '#475569',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
};

export const OperationCardShell: React.FC<OperationCardShellProps> = ({
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
      className={`operation-card-shell ${className}`}
      style={{
        ...shellRootStyle,
        borderTop: `3px solid ${accentColor}`,
        ...style,
      }}
      data-operation-card="true"
    >
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleWrapStyle}>
          {icon && <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>{icon}</div>}
          <div style={{ minWidth: 0 }}>
            <div style={titleTextStyle}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {title}
              </span>
              {statusBadge && <div>{statusBadge}</div>}
            </div>
            {subtitle && <div style={subtitleTextStyle}>{subtitle}</div>}
          </div>
        </div>

        {(onClose || onCancel) && (
          <button
            type="button"
            onClick={onClose || onCancel}
            style={closeBtnStyle}
            title="Dismiss card"
            aria-label="Dismiss card"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Body */}
      <div style={bodyStyle}>{children}</div>

      {/* Footer */}
      {(onSubmit || onCancel) && (
        <div style={footerStyle}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              style={cancelBtnStyle}
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
                backgroundColor: isSubmitDisabled || isSubmitting ? '#94A3B8' : accentColor,
                color: '#FFFFFF',
                fontSize: 14,
                fontWeight: 700,
                cursor: isSubmitDisabled || isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: isSubmitDisabled || isSubmitting ? 'none' : `0 2px 8px ${accentColor}40`,
                transition: 'all 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              <span>{submitLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
