import React from 'react';

export type DesktopInstallVariant = 'floating-top-right' | 'top-banner' | 'floating-bottom-right';

export interface AppNoticeProps {
  /** Name of the application (e.g. "Samvad", "संवाद", "Geeksman ERP") */
  appName?: string;

  /** Short descriptive subtitle */
  appSubtitle?: string;

  /** App icon (URL image path or React component) */
  appIcon?: string | React.ReactNode;

  /**
   * Whether a native Android APK is available for download.
   * If true, shows options for both Native APK and Web App (PWA).
   * If false, only shows Web App (PWA) installation.
   */
  hasNativeApk?: boolean;

  /** Download URL for the native APK (e.g. "/downloads/app.apk") */
  apkDownloadUrl?: string;

  /** Current or latest application version (e.g. "v1.0.10") */
  version?: string;

  /**
   * Override update ready state.
   * If not provided, automatically connects to service worker / useAppVersion.
   */
  updateReady?: boolean;

  /** Custom callback when user clicks "Update Now". Defaults to SW skipWaiting + reload */
  onUpdateNow?: () => void;

  /** Custom callback when user triggers PWA installation */
  onInstallPwa?: () => void;

  /** Custom callback when user starts downloading APK */
  onDownloadApk?: () => void;

  /** Desktop install UI style: 'floating-top-right' (default) | 'top-banner' | 'floating-bottom-right' */
  desktopInstallVariant?: DesktopInstallVariant;

  /** LocalStorage key to remember install prompt dismissal */
  dismissStorageKey?: string;

  /** How many hours to snooze the install prompt when dismissed (default: 24 hours, 0 for session only) */
  snoozeHours?: number;

  /** Manually force show install prompt (for testing or debugging) */
  forceShowInstall?: boolean;

  /** Manually force show update banner (for testing or debugging) */
  forceShowUpdate?: boolean;
}

export interface AppInstallBannerProps extends Omit<AppNoticeProps, 'updateReady' | 'onUpdateNow' | 'forceShowUpdate'> {
  isOpen?: boolean;
  onClose?: () => void;
}

export interface AppUpdateBannerProps {
  appName?: string;
  version?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onUpdateNow?: () => void;
  changelog?: string;
  isDownloading?: boolean;
  downloadProgress?: number;
}
