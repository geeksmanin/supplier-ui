import React from 'react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { AppsDashboardDesktop } from './AppsDashboard.desktop';
import { AppsDashboardMobile } from './AppsDashboard.mobile';

export interface AppConfig {
  id?: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  bgGradient?: string;
  sublabel?: string;
  iconColor?: string;
}

interface AppsDashboardProps {
  navItems: AppConfig[];
  onNavigate: (path: string) => void;
}

export const AppsDashboard: React.FC<AppsDashboardProps> = (props) => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  return isMobile ? <AppsDashboardMobile {...props} /> : <AppsDashboardDesktop {...props} />;
};
