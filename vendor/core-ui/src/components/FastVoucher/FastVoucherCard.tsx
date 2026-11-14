import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { FastVoucherCardDesktop } from './FastVoucherCard.desktop';
import { FastVoucherCardMobile } from './FastVoucherCard.mobile';
import { FastVoucherCardProps } from './FastVoucherCard.types';

export * from './FastVoucherCard.types';
export { FastVoucherCardDesktop } from './FastVoucherCard.desktop';
export { FastVoucherCardMobile } from './FastVoucherCard.mobile';

export const FastVoucherCard: React.FC<FastVoucherCardProps> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return isDesktop ? (
    <FastVoucherCardDesktop {...props} />
  ) : (
    <FastVoucherCardMobile {...props} />
  );
};

export default FastVoucherCard;

