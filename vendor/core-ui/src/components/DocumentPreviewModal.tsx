import React, { useState, useEffect } from 'react';
import { DocumentPreviewModalProps } from './DocumentPreviewModal.types';
import { DocumentPreviewModalDesktop } from './DocumentPreviewModal.desktop';
import { DocumentPreviewModalMobile } from './DocumentPreviewModal.mobile';

export * from './DocumentPreviewModal.types';

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = (props) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <DocumentPreviewModalMobile {...props} />;
  }

  return <DocumentPreviewModalDesktop {...props} />;
};
