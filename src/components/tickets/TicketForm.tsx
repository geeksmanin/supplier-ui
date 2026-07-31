import React from 'react';
import { useMediaQuery } from '@geeksman/core-ui';
import { TicketFormDesktop } from './TicketForm.desktop';
import { TicketFormMobile } from './TicketForm.mobile';

export const TicketForm: React.FC<any> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  return isDesktop ? <TicketFormDesktop {...props} /> : <TicketFormMobile {...props} />;
};
