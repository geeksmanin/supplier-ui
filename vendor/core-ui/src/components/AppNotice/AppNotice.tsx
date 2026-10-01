import React, { useState } from 'react';
import { useAppVersion } from '../../hooks/useAppVersion';
import { AppNoticeProps } from './types';
import { AppInstallBanner } from './AppInstallBanner';
import { AppUpdateBanner } from './AppUpdateBanner';

export const AppNotice: React.FC<AppNoticeProps> = ({
  appName = 'App',
  appSubtitle,
  appIcon,
  hasNativeApk = false,
  apkDownloadUrl = '/downloads/app.apk',
  version: propVersion,
  updateReady: propUpdateReady,
  onUpdateNow,
  onInstallPwa,
  onDownloadApk,
  desktopInstallVariant = 'floating-top-right',
  dismissStorageKey = 'app_install_dismissed_until',
  snoozeHours = 24,
  forceShowInstall = false,
  forceShowUpdate = false,
}) => {
  // Automatically connect with useAppVersion for SW updates and version info
  const appVersionState = useAppVersion();

  const [updateDismissed, setUpdateDismissed] = useState(false);

  // Resolved version & update status
  const effectiveVersion = propVersion || appVersionState.uiVersion;
  const isUpdateReady =
    forceShowUpdate ||
    (propUpdateReady !== undefined ? propUpdateReady : appVersionState.updateReady);

  const showUpdate = isUpdateReady && !updateDismissed;

  const handleUpdateNow = () => {
    if (onUpdateNow) {
      onUpdateNow();
      return;
    }
    appVersionState.checkForUpdates();
  };

  return (
    <>
      {/* 1. App Update Banner:
          - Mobile: Bottom banner
          - Desktop: Floating bottom-right card
      */}
      {showUpdate && (
        <AppUpdateBanner
          appName={appName}
          version={effectiveVersion}
          isOpen={showUpdate}
          onClose={() => setUpdateDismissed(true)}
          onUpdateNow={handleUpdateNow}
        />
      )}

      {/* 2. App Install Banner:
          - Mobile: Bottom banner (offering Android APK if hasNativeApk=true + Web App)
          - Desktop: Non-intrusive floating top-right card / top banner
      */}
      <AppInstallBanner
        appName={appName}
        appSubtitle={appSubtitle}
        appIcon={appIcon}
        hasNativeApk={hasNativeApk}
        apkDownloadUrl={apkDownloadUrl}
        desktopInstallVariant={desktopInstallVariant}
        dismissStorageKey={dismissStorageKey}
        snoozeHours={snoozeHours}
        onInstallPwa={onInstallPwa}
        onDownloadApk={onDownloadApk}
        forceShowInstall={forceShowInstall}
      />
    </>
  );
};

// Convenient alias for semantic clarity
export const AppInstallUpdateNotice = AppNotice;
