import React from 'react';
import type { AppFolderGroup } from '../../types/MobileTabTypes';

export interface MobileNavItemConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
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
}

export const MobileBottomNavWithTabs: React.FC<MobileBottomNavWithTabsProps> = ({
  currentPath,
  tabCount,
  navItems,
  onNavigate,
  onOpenFolder,
  onOpenTabSwitcher,
}) => {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.04)',
        padding: '0 0.5rem calc(env(safe-area-inset-bottom, 0px))',
      }}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isFolder = Boolean(item.isFolder && item.folderGroup);
        const isActive = isFolder
          ? item.folderGroup?.items.some((sub) => sub.path === currentPath)
          : item.path === currentPath;

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
              color: isActive ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              flex: 1,
              position: 'relative',
              outline: 'none',
            }}
          >
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon size={20} />
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-6px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    borderRadius: '9999px',
                    padding: '0 4px',
                    minWidth: '14px',
                    textAlign: 'center',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.01em',
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
          color: '#64748b',
          cursor: 'pointer',
          flex: 1,
          outline: 'none',
        }}
      >
        <div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '5px',
            border: '2px solid #64748b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.68rem',
            fontWeight: 800,
            color: '#334155',
            lineHeight: 1,
          }}
        >
          {tabCount || 1}
        </div>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: 500,
            letterSpacing: '-0.01em',
          }}
        >
          Tabs
        </span>
      </button>
    </nav>
  );
};
