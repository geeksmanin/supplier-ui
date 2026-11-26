import React from 'react';
import { DevServerModalProps } from './DevServerModal.types';
import { useDevServerModal } from './useDevServerModal';
import { DevServerModalContent } from './DevServerModalContent';

export const DevServerModalMobile: React.FC<DevServerModalProps> = ({
  isOpen,
  onClose,
  defaultProductionUrl = typeof window !== 'undefined' ? window.location.origin : 'https://business.samwad.geeksman.co.in',
  defaultStagingUrl,
  appName = typeof document !== 'undefined' && document.title ? document.title.split('|')[0].trim() : 'App',
}) => {
  const state = useDevServerModal({ isOpen, onClose, defaultProductionUrl, defaultStagingUrl, appName });
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !state.isSaving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          backgroundColor: 'var(--color-bg-primary, #FFFFFF)',
          color: 'var(--color-text-primary, #0F172A)',
          width: '100%',
          maxHeight: '90vh',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <DevServerModalContent appName={appName} defaultProductionUrl={defaultProductionUrl} onClose={onClose} state={state} />
      </div>
    </div>
  );
};
