import React from 'react';
import { useMediaQuery } from '@geeksman/core-ui';
import { useNotification } from './NotificationContext';
import { NotificationDrawerDesktop } from './NotificationDrawer.desktop';
import { NotificationDrawerMobile } from './NotificationDrawer.mobile';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (link: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const context = useNotification();

  const mergedProps = {
    ...props,
    ...context,
  };

  return isDesktop ? (
    <NotificationDrawerDesktop {...mergedProps} />
  ) : (
    <NotificationDrawerMobile {...mergedProps} />
  );
};
