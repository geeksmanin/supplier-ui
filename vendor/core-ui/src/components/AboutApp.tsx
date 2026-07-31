import React from 'react';
import { useToast } from './Toast/Toast';

export interface AboutAppProps {
  version: string;
  cacheId: string;
  title?: string;
  style?: React.CSSProperties;
}

export const AboutApp: React.FC<AboutAppProps> = ({
  version,
  cacheId,
  title = 'About Platform',
  style
}) => {
  const { showToast } = useToast();

  return (
    <div 
      style={{
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '0.75rem',
        textAlign: 'left',
        fontSize: '0.75rem',
        color: '#475569',
        fontFamily: '"Outfit", "Inter", sans-serif',
        width: '100%',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <div style={{ fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.15rem' }}>
        <span>App Version:</span>
        <span style={{ fontWeight: 700, color: '#0f172a' }}>{version}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span>Cache ID:</span>
        <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>{cacheId}</span>
      </div>
      <button
        onClick={() => {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then((reg) => {
              if (reg) {
                showToast("Checking for updates...", "info");
                reg.update().then(() => {
                  if (reg.waiting) {
                    reg.waiting.postMessage({ type: 'SKIP_WAITING' });
                    showToast("Update found! Reloading app...", "info");
                    setTimeout(() => {
                      window.location.reload();
                    }, 500);
                  } else {
                    showToast("App is up to date!", "success");
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }
                }).catch((err) => {
                  console.error("Update check failed:", err);
                  showToast("Unable to check for updates right now.", "error");
                  setTimeout(() => {
                    window.location.reload();
                  }, 1500);
                });
              } else {
                showToast("Refreshing application...", "info");
                window.location.reload();
              }
            }).catch(() => {
              window.location.reload();
            });
          } else {
            window.location.reload();
          }
        }}
        style={{
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '6px',
          padding: '6px 12px',
          fontSize: '0.7rem',
          fontWeight: 800,
          cursor: 'pointer',
          textAlign: 'center',
          width: '100%',
          marginTop: '0.25rem',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
      >
        Check for Updates
      </button>
    </div>
  );
};
