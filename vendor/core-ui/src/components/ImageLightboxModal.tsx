import React, { useState, useEffect } from 'react';
import { ImageLightboxModalProps } from './ImageLightboxModal.types';
import { ImageLightboxModalDesktop } from './ImageLightboxModal.desktop';
import { ImageLightboxModalMobile } from './ImageLightboxModal.mobile';

export * from './ImageLightboxModal.types';

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = (props) => {
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
    return <ImageLightboxModalMobile {...props} />;
  }

  return <ImageLightboxModalDesktop {...props} />;
};
