import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { WhatsAppDataListProps } from './WhatsAppDataList.types';
import { WhatsAppDataListDesktop } from './WhatsAppDataList.desktop';
import { WhatsAppDataListMobile } from './WhatsAppDataList.mobile';

export function WhatsAppDataList<T = any>(props: WhatsAppDataListProps<T>) {
  const isDesktopQuery = useMediaQuery('(min-width: 768px)');
  const isDesktop = props.isMobile === true ? false : (props.isMobile === false ? true : isDesktopQuery);

  if (isDesktop) {
    return <WhatsAppDataListDesktop {...props} />;
  }

  return <WhatsAppDataListMobile {...props} />;
}

export { WhatsAppDataListDesktop } from './WhatsAppDataList.desktop';
export { WhatsAppDataListMobile } from './WhatsAppDataList.mobile';
export { WhatsAppListItem } from './WhatsAppListItem';
export type {
  WhatsAppDataListProps,
  WhatsAppDataListItem,
  WhatsAppListItemData,
  WhatsAppFilterPill,
} from './WhatsAppDataList.types';
