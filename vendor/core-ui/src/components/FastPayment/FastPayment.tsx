import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { FastPaymentProps } from './FastPayment.types';
import { useFastPayment } from './useFastPayment';
import { FastPaymentDesktop } from './FastPayment.desktop';
import { FastPaymentMobile } from './FastPayment.mobile';

export const FastPayment: React.FC<FastPaymentProps> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const state = useFastPayment(props);

  return isDesktop ? (
    <FastPaymentDesktop props={props} state={state} />
  ) : (
    <FastPaymentMobile props={props} state={state} />
  );
};

export default FastPayment;
