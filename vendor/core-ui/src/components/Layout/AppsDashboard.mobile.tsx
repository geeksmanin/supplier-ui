import React from 'react';
import { AppConfig } from './AppsDashboard';

interface AppsDashboardMobileProps {
  navItems: AppConfig[];
  onNavigate: (path: string) => void;
  userEmail?: string;
  onLogout?: () => void;
}

export const AppsDashboardMobile: React.FC<AppsDashboardMobileProps> = ({ navItems, onNavigate, userEmail, onLogout }) => {
  const displayItems = navItems.filter((item: any) => !item.parentId);
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '1.5rem 1rem 3rem 1rem',
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

      {/* User Session Profile & Logout Card */}
      <div style={{
        marginTop: '2.5rem',
        padding: '1rem 1.15rem',
        borderRadius: '16px',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.95rem',
            flexShrink: 0,
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
          }}>
            {userEmail ? userEmail[0].toUpperCase() : 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#0f172a',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {userEmail ? userEmail.split('@')[0] : 'Logged In User'}
            </span>
            <span style={{
              fontSize: '0.7rem',
              color: '#64748b',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {userEmail || 'Active Session'}
            </span>
          </div>
        </div>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.45rem 0.85rem',
              borderRadius: '9px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background-color 0.15s ease',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        )}
      </div>
    </div>
  );
};
