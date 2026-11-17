import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ImageEditorModalProps } from './ImageEditorModal.types';
import { ImageEditorModalDesktop } from './ImageEditorModal.desktop';
import { ImageEditorModalMobile } from './ImageEditorModal.mobile';

export * from './ImageEditorModal.types';
export { ImageEditorModalDesktop } from './ImageEditorModal.desktop';
export { ImageEditorModalMobile } from './ImageEditorModal.mobile';
export { useImageEditor, COLOR_PALETTE, STROKE_WIDTH_MAP } from './useImageEditor';

export const ImageEditorModal: React.FC<ImageEditorModalProps> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (!props.isOpen) return null;

  return isDesktop ? (
    <ImageEditorModalDesktop {...props} />
  ) : (
    <ImageEditorModalMobile {...props} />
  );
};
