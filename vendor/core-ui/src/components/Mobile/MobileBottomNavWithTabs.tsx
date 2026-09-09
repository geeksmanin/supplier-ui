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

const HomeColorIcon: React.FC<{ isActive?: boolean; size?: number }> = ({ isActive = false, size = 15 }) => (
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
        bottom: isFloating ? '8px' : 0,
        left: isFloating ? '12px' : 0,
        right: isFloating ? '12px' : 0,
        height: '46px',
        backgroundColor: isFloating ? 'rgba(255, 255, 255, 0.85)' : '#ffffff',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isFloating ? '1px solid rgba(255, 255, 255, 0.75)' : '1px solid #e2e8f0',
        borderRadius: isFloating ? '9999px' : '0px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 10000,
        boxShadow: isFloating
          ? '0 8px 24px -4px rgba(0, 0, 0, 0.1), 0 2px 8px -2px rgba(0, 0, 0, 0.05)'
          : '0 -2px 8px rgba(0, 0, 0, 0.04)',
        padding: isFloating ? '0 0.5rem' : '0 0.4rem calc(env(safe-area-inset-bottom, 0px))',
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
              gap: '1px',
              padding: '2px 3px',
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
                /* Compact Colorful Attractive Home Button */
                <div
                  style={{
                    width: '24px',
                    height: '22px',
                    borderRadius: '8px',
                    background: isActive
                      ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)'
                      : 'rgba(37, 99, 235, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <HomeColorIcon isActive={isActive} size={14} />
                </div>
              ) : isFolder && item.folderGroup ? (
                /* Compact 3x3 Mini App Folder Preview in Bottom Nav */
                <div
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '7px',
                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.14)' : 'rgba(241, 245, 249, 0.85)',
                    border: isActive ? '1.5px solid #2563eb' : '1px solid rgba(203, 213, 225, 0.75)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 4.5px)',
                    gridTemplateRows: 'repeat(3, 4.5px)',
                    gap: '1.5px',
                    justifyContent: 'center',
                    alignContent: 'center',
                    padding: '1.5px',
                    boxSizing: 'border-box',
                    boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.2)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.folderGroup.items.slice(0, 9).map((sub, i) => (
                    <div
                      key={i}
                      style={{
                        width: '4.5px',
                        height: '4.5px',
                        borderRadius: '1.5px',
                        backgroundColor: sub.color || '#2563eb',
                      }}
                    />
                  ))}
                </div>
              ) : item.icon ? (
                React.createElement(item.icon, { size: 16 })
              ) : null}

              {/* Red Notification Badge */}
              {dynamicBadge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-6px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.5rem',
                    fontWeight: 800,
                    borderRadius: '9999px',
                    padding: '0 3px',
                    minWidth: '12px',
                    textAlign: 'center',
                    border: '1px solid #ffffff',
                    boxShadow: '0 1px 3px rgba(239, 68, 68, 0.3)',
                  }}
                >
                  {dynamicBadge > 99 ? '99+' : dynamicBadge}
                </span>
              )}
            </div>

            <span
              style={{
                fontSize: '0.58rem',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#2563eb' : '#475569',
                letterSpacing: '-0.01em',
                marginTop: '0px',
                lineHeight: 1.1,
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
          gap: '1px',
          padding: '2px 3px',
          color: '#475569',
          cursor: 'pointer',
          flex: 1,
          outline: 'none',
          transition: 'transform 0.15s ease',
        }}
      >
        <div
          style={{
            width: '19px',
            height: '19px',
            borderRadius: '5px',
            border: '1.5px solid #64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.62rem',
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
            fontSize: '0.58rem',
            fontWeight: 600,
            color: '#475569',
            letterSpacing: '-0.01em',
            marginTop: '0px',
            lineHeight: 1.1,
          }}
        >
          Tabs
        </span>
      </button>
    </nav>
  );
};
