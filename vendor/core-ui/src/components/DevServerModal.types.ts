export interface DevServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductionUrl?: string;
  defaultStagingUrl?: string;
  appName?: string;
}

export type DevServerPreset = 'prod' | 'staging' | 'emulator' | 'custom';
export type DevServerTab = 'server' | 'console' | 'diagnostics';
