import React from 'react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { BarcodeQRScannerModalDesktop } from './BarcodeQRScannerModal.desktop';
import { BarcodeQRScannerModalMobile } from './BarcodeQRScannerModal.mobile';
import { BarcodeQRScannerModalProps } from './BarcodeQRScannerModal.types';

export * from './BarcodeQRScannerModal.types';

export const BarcodeQRScannerModal: React.FC<BarcodeQRScannerModalProps> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return isDesktop ? (
    <BarcodeQRScannerModalDesktop {...props} />
  ) : (
    <BarcodeQRScannerModalMobile {...props} />
  );
};
