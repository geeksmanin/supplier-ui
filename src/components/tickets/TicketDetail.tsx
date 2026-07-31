import React from 'react';
import { useMediaQuery } from '@geeksman/core-ui';
import { TicketDetailDesktop } from './TicketDetail.desktop';
import { TicketDetailMobile } from './TicketDetail.mobile';

export const TicketDetail: React.FC<any> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  return isDesktop ? <TicketDetailDesktop {...props} /> : <TicketDetailMobile {...props} />;
};
