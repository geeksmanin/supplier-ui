import React from 'react';
import { AppConfig } from './AppsDashboard';

interface AppsDashboardMobileProps {
  navItems: AppConfig[];
  onNavigate: (path: string) => void;
}

export const AppsDashboardMobile: React.FC<AppsDashboardMobileProps> = ({ navItems, onNavigate }) => {
  const displayItems = navItems.filter((item: any) => !item.parentId);
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
        gap: '2rem 1.25rem',
        width: '100%',
        justifyContent: 'center'
      }}>
        {displayItems.map((item) => {
          const bgGradient = item.bgGradient || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
          const isTransparentBg = bgGradient === 'transparent' || bgGradient === 'none';
          const iconColor = item.iconColor || '#ffffff';
          const label = item.label;
          const sublabel = item.sublabel || '';

          const appIcon = item.icon;
          const needsBorder = !isTransparentBg && (bgGradient.includes('#ffffff') || bgGradient.includes('#f3f4f6'));

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
            >
              <div
                className="app-icon-box"
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: isTransparentBg ? '0px' : '16px',
                  background: isTransparentBg ? 'transparent' : bgGradient,
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
                  width: isTransparentBg ? '100%' : 'auto',
                  height: isTransparentBg ? '100%' : 'auto',
                  transform: isTransparentBg ? 'none' : 'scale(1.1)'
                }}>
                  {appIcon}
                </div>
              </div>

              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#1f2937',
                marginBottom: '0.15rem',
                whiteSpace: 'normal',
                lineHeight: '1.25',
                maxWidth: '80px'
              }}>
                {label}
              </span>

              {sublabel ? (
                <span style={{
                  fontSize: '0.65rem',
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
