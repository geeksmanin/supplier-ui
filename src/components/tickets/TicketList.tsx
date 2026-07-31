import React from 'react';
import { useMediaQuery } from '@geeksman/core-ui';
import { TicketListDesktop } from './TicketList.desktop';
import { TicketListMobile } from './TicketList.mobile';

export const TicketList: React.FC<any> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  return isDesktop ? <TicketListDesktop {...props} /> : <TicketListMobile {...props} />;
};
