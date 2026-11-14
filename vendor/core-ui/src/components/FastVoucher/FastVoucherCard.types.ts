import React from 'react';
import { FastVoucherEntryLayoutProps } from './FastVoucherEntryLayout.types';

export interface FastVoucherModeOption {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export interface FastVoucherCardProps extends FastVoucherEntryLayoutProps {
  onClose?: () => void;
  accentColor?: string;
  icon?: React.ReactNode;
  maxWidth?: number | string;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
  modeOptions?: FastVoucherModeOption[];
  activeMode?: string;
  onModeChange?: (mode: string) => void;
}
