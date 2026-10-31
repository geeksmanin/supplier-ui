import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { OperationCardShellDesktop } from './OperationCardShell.desktop';
import { OperationCardShellMobile } from './OperationCardShell.mobile';
import { OperationCardShellProps } from './OperationCardShell.types';

export * from './OperationCardShell.types';
export { OperationCardShellDesktop } from './OperationCardShell.desktop';
export { OperationCardShellMobile } from './OperationCardShell.mobile';

export const OperationCardShell: React.FC<OperationCardShellProps> = (props) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  if (isDesktop) {
    return <OperationCardShellDesktop {...props} />;
  }

  return <OperationCardShellMobile {...props} />;
};
