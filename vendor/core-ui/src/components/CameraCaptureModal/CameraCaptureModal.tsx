import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { CameraCaptureModalProps } from './CameraCaptureModal.types';
import { CameraCaptureModalDesktop } from './CameraCaptureModal.desktop';
import { CameraCaptureModalMobile } from './CameraCaptureModal.mobile';

export * from './CameraCaptureModal.types';
export { CameraCaptureModalDesktop } from './CameraCaptureModal.desktop';
export { CameraCaptureModalMobile } from './CameraCaptureModal.mobile';

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (!props.isOpen) return null;

  return isDesktop ? (
    <CameraCaptureModalDesktop {...props} />
  ) : (
    <CameraCaptureModalMobile {...props} />
  );
};
