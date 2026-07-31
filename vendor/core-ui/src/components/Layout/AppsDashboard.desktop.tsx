import React from 'react';
import { AppConfig } from './AppsDashboard';

interface AppsDashboardDesktopProps {
  navItems: AppConfig[];
  onNavigate: (path: string) => void;
}

export const AppsDashboardDesktop: React.FC<AppsDashboardDesktopProps> = ({ navItems, onNavigate }) => {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '3rem 2.5rem',
        width: '100%',
        justifyContent: 'center'
      }}>
        {navItems.map((item) => {
          const bgGradient = item.bgGradient || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
          const iconColor = item.iconColor || '#ffffff';
          const label = item.label;
          const sublabel = item.sublabel || '';

          const appIcon = item.icon;
          const needsBorder = bgGradient.includes('#ffffff') || bgGradient.includes('#f3f4f6');

          return (
            <div
              key={item.id || item.path}
              onClick={() => onNavigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                const iconBox = e.currentTarget.querySelector('.app-icon-box') as HTMLElement;
                if (iconBox) {
                  iconBox.style.transform = 'translateY(-5px)';
                  iconBox.style.boxShadow = '0 12px 24px -10px rgba(59, 130, 246, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                const iconBox = e.currentTarget.querySelector('.app-icon-box') as HTMLElement;
                if (iconBox) {
                  iconBox.style.transform = 'translateY(0)';
                  iconBox.style.boxShadow = 'none';
                }
              }}
            >
              <div
                className="app-icon-box"
                style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '22px',
                  background: bgGradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  marginBottom: '0.75rem',
                  color: iconColor,
                  border: needsBorder ? '1px solid #e5e7eb' : 'none'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'scale(1.4)'
                }}>
                  {appIcon}
                </div>
              </div>

              <span style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#1f2937',
                marginBottom: '0.15rem',
                whiteSpace: 'normal',
                lineHeight: '1.25',
                maxWidth: '120px'
              }}>
                {label}
              </span>

              {sublabel ? (
                <span style={{
                  fontSize: '0.7rem',
                  color: '#9ca3af',
                  fontWeight: 500
                }}>
                  {sublabel}
                </span>
              ) : (
                <span style={{ height: '14px' }}></span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
