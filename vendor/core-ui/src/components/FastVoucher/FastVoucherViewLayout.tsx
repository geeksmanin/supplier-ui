import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { FastVoucherViewLayoutProps } from './FastVoucherViewLayout.types';
import { FastVoucherViewLayoutDesktop } from './FastVoucherViewLayout.desktop';
import { FastVoucherViewLayoutMobile } from './FastVoucherViewLayout.mobile';

export const FastVoucherViewLayout: React.FC<FastVoucherViewLayoutProps> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <FastVoucherViewLayoutDesktop {...props} />;
  }

  return <FastVoucherViewLayoutMobile {...props} />;
};

export default FastVoucherViewLayout;
