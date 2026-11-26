import React from 'react';
import { DevServerModalProps } from './DevServerModal.types';
import { useDevServerModal } from './useDevServerModal';
import { DevServerModalContent } from './DevServerModalContent';

export const DevServerModalDesktop: React.FC<DevServerModalProps> = ({
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
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
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
          maxWidth: '460px',
          maxHeight: '90vh',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--color-border, #E2E8F0)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <DevServerModalContent appName={appName} defaultProductionUrl={defaultProductionUrl} onClose={onClose} state={state} />
      </div>
    </div>
  );
};
