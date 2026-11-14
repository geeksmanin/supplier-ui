import React from 'react';

export interface OperationCardShellProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  statusBadge?: React.ReactNode;
  accentColor?: string;
  maxWidth?: number | string;
  fullWidth?: boolean;
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
