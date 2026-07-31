import React, { useState, useEffect } from 'react';
import { BottomNavProps } from './BottomNav.types';
import BottomNavMobile from './BottomNav.mobile';
import BottomNavDesktop from './BottomNav.desktop';

const BottomNav: React.FC<BottomNavProps> = (props) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? (
    <BottomNavMobile {...props} />
  ) : (
    <BottomNavDesktop {...props} />
  );
};

export default BottomNav;
