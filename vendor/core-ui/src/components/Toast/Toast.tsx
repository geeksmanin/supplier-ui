import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const getToastColors = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a', text: '#166534' };
      case 'error':
        return { bg: '#fef2f2', border: '#fecaca', accent: '#dc2626', text: '#991b1b' };
      case 'warning':
        return { bg: '#fffbeb', border: '#fef3c7', accent: '#d97706', text: '#92400e' };
      case 'info':
      default:
        return { bg: '#f0f9ff', border: '#bae6fd', accent: '#2563eb', text: '#1e40af' };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container overlay */}
      <div style={{
        position: 'fixed',
        top: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        pointerEvents: 'none',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}>
        {toasts.map((t) => {
          const colors = getToastColors(t.type);
          return (
            <div
              key={t.id}
              style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderLeft: `4px solid ${colors.accent}`,
                color: colors.text,
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 500,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                pointerEvents: 'auto',
                animation: 'toastFadeIn 0.25s ease-out',
                maxWidth: '90vw',
                textAlign: 'left'
              }}
            >
              <span style={{ fontSize: '1rem', color: colors.accent, display: 'flex', alignItems: 'center' }}>
                {t.type === 'success' && '✓'}
                {t.type === 'error' && '✗'}
                {t.type === 'warning' && '⚠️'}
                {t.type === 'info' && 'ℹ'}
              </span>
              <span>{t.message}</span>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toastFadeIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
