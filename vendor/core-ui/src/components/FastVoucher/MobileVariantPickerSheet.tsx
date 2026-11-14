import React, { useState, useEffect } from 'react';
import { MobileVariantPickerSheetProps } from './MobileVariantPickerSheet.types';
import { MobileVariantPickerSheetDesktop } from './MobileVariantPickerSheet.desktop';
import { MobileVariantPickerSheetMobile } from './MobileVariantPickerSheet.mobile';

export * from './MobileVariantPickerSheet.types';
export { MobileVariantPickerSheetDesktop } from './MobileVariantPickerSheet.desktop';
export { MobileVariantPickerSheetMobile } from './MobileVariantPickerSheet.mobile';

export const MobileVariantPickerSheet: React.FC<MobileVariantPickerSheetProps> = (props) => {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isMobile) {
    return <MobileVariantPickerSheetMobile {...props} />;
  }

  return <MobileVariantPickerSheetDesktop {...props} />;
};

export default MobileVariantPickerSheet;
