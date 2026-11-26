import React, { useState, useEffect } from 'react';
import { DevServerModalProps } from './DevServerModal.types';
import { DevServerModalDesktop } from './DevServerModal.desktop';
import { DevServerModalMobile } from './DevServerModal.mobile';

export * from './DevServerModal.types';

export const DevServerModal: React.FC<DevServerModalProps> = (props) => {
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
    return <DevServerModalMobile {...props} />;
  }

  return <DevServerModalDesktop {...props} />;
};
