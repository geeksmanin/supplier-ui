import React from 'react';
import { useMediaQuery } from '@geeksman/core-ui';
import { CommentThreadDesktop } from './CommentThread.desktop';
import { CommentThreadMobile } from './CommentThread.mobile';

export const CommentThread: React.FC<any> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  return isDesktop ? <CommentThreadDesktop {...props} /> : <CommentThreadMobile {...props} />;
};
