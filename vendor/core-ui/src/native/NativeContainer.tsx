import React from 'react';
import { usePushNotifications } from './usePushNotifications';
import { useNativeDevice, UseNativeDeviceOptions } from './useNativeDevice';

export interface NativeContainerProps {
  children?: React.ReactNode;
  onNavigate?: (route: string) => void;
  options?: UseNativeDeviceOptions;
}

export const NativeContainer: React.FC<NativeContainerProps> = ({
  children,
  onNavigate,
  options,
}) => {
  usePushNotifications(onNavigate);
  useNativeDevice(options);

  return <>{children}</>;
};
