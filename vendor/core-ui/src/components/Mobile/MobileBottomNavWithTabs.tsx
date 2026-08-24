import React from 'react';
import type { AppFolderGroup } from '../../types/MobileTabTypes';

export interface MobileNavItemConfig {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  path?: string;
  isFolder?: boolean;
  folderGroup?: AppFolderGroup;
  badge?: number;
}

export interface MobileBottomNavWithTabsProps {
  currentPath: string;
  tabCount: number;
  navItems: MobileNavItemConfig[];
  onNavigate: (path: string) => void;
  onOpenFolder: (group: AppFolderGroup) => void;
  onOpenTabSwitcher: () => void;
  isFloating?: boolean;
}

const HomeColorIcon: React.FC<{ isActive?: boolean; size?: number }> = ({ isActive = false, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      color: isActive ? '#ffffff' : '#2563eb',
      filter: isActive ? 'drop-shadow(0 2px 4px rgba(37, 99, 235, 0.4))' : 'none',
      transition: 'all 0.2s ease',
    }}
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill={isActive ? 'currentColor' : 'none'} />
    <polyline points="9 22 9 12 15 12 15 22" stroke={isActive ? '#ffffff' : 'currentColor'} />
  </svg>
);

export const MobileBottomNavWithTabs: React.FC<MobileBottomNavWithTabsProps> = ({
  currentPath,
  tabCount,
  navItems,
  onNavigate,
  onOpenFolder,
  onOpenTabSwitcher,
  isFloating = true,
}) => {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: isFloating ? '14px' : 0,
        left: isFloating ? '16px' : 0,
        right: isFloating ? '16px' : 0,
        height: '62px',
        backgroundColor: isFloating ? 'rgba(255, 255, 255, 0.76)' : '#ffffff',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: isFloating ? '1px solid rgba(255, 255, 255, 0.65)' : '1px solid #e2e8f0',
        borderRadius: isFloating ? '9999px' : '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 10000,
        boxShadow: isFloating
          ? '0 12px 32px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06)'
          : '0 -4px 12px rgba(0, 0, 0, 0.04)',
        padding: isFloating ? '0 0.75rem' : '0 0.5rem calc(env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {navItems.map((item) => {
        const isFolder = Boolean(item.isFolder && item.folderGroup);
        const isHome = item.id === 'home' || item.path === '/home' || item.path === '/';
        const isActive = isFolder
          ? item.folderGroup?.items.some((sub) => sub.path === currentPath)
          : item.path === currentPath;

        const dynamicBadge = isFolder && item.folderGroup
          ? item.folderGroup.items.reduce((sum, sub) => sum + (sub.badge || 0), item.badge || 0)
          : (item.badge || 0);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (isFolder && item.folderGroup) {
                onOpenFolder(item.folderGroup);
              } else if (item.path) {
                onNavigate(item.path);
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              padding: '4px 6px',
              color: isActive ? '#2563eb' : '#475569',
              cursor: 'pointer',
              flex: 1,
              position: 'relative',
              outline: 'none',
              transition: 'transform 0.15s ease',
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isHome ? (
                /* Colorful Attractive Home Button */
                <div
                  style={{
                    width: '32px',
                    height: '28px',
                    borderRadius: '12px',
                    background: isActive
                      ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                      : 'rgba(37, 99, 235, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isActive ? '0 4px 10px rgba(37, 99, 235, 0.35)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <HomeColorIcon isActive={isActive} size={18} />
                </div>
              ) : isFolder && item.folderGroup ? (
                /* 3x3 Mini App Folder Preview in Bottom Nav */
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.14)' : 'rgba(241, 245, 249, 0.85)',
                    border: isActive ? '1.5px solid #2563eb' : '1px solid rgba(203, 213, 225, 0.75)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 6px)',
                    gridTemplateRows: 'repeat(3, 6px)',
                    gap: '2px',
                    justifyContent: 'center',
                    alignContent: 'center',
                    padding: '2px',
                    boxSizing: 'border-box',
                    boxShadow: isActive ? '0 4px 10px rgba(37, 99, 235, 0.25)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.folderGroup.items.slice(0, 9).map((sub, i) => (
                    <div
                      key={i}
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '2px',
                        backgroundColor: sub.color || '#2563eb',
                      }}
                    />
                  ))}
                </div>
              ) : item.icon ? (
                React.createElement(item.icon, { size: 20 })
              ) : null}

              {/* Red Notification Badge */}
              {dynamicBadge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-7px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    borderRadius: '9999px',
                    padding: '0 4px',
                    minWidth: '14px',
                    textAlign: 'center',
                    border: '1.5px solid #ffffff',
                    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
                  }}
                >
                  {dynamicBadge > 99 ? '99+' : dynamicBadge}
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#2563eb' : '#475569',
                letterSpacing: '-0.01em',
                marginTop: '1px',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Chrome / Safari Style Tab Counter Button */}
      <button
        type="button"
        onClick={onOpenTabSwitcher}
        style={{
          background: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          padding: '4px 6px',
          color: '#475569',
          cursor: 'pointer',
          flex: 1,
          outline: 'none',
          transition: 'transform 0.15s ease',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '7px',
            border: '2px solid #64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: '#1e293b',
            lineHeight: 1,
            backgroundColor: 'rgba(241, 245, 249, 0.75)',
          }}
        >
          {tabCount || 1}
        </div>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 600,
            color: '#475569',
            letterSpacing: '-0.01em',
            marginTop: '1px',
          }}
        >
          Tabs
        </span>
      </button>
    </nav>
  );
};
