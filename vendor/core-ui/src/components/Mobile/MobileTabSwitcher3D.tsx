import React, { useState } from 'react';
import { X, Plus, Check, Trash2, Home } from 'lucide-react';
import type { AppTab } from '../../types/MobileTabTypes';

export interface MobileTabSwitcher3DProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: AppTab[];
  activePath: string;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string, e: React.MouseEvent) => void;
  onCloseAllTabs: () => void;
  onNewTab: () => void;
}

export const MobileTabSwitcher3D: React.FC<MobileTabSwitcher3DProps> = ({
  isOpen,
  onClose,
  tabs,
  activePath,
  onSelectTab,
  onCloseTab,
  onCloseAllTabs,
  onNewTab,
}) => {
  const [swipedPath, setSwipedPath] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent, path: string) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, tab: AppTab) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;

    // If swiped left or right by > 80px, dismiss tab (if closable)
    if (Math.abs(diff) > 80 && tab.closable !== false && tab.path !== '/home') {
      setSwipedPath(tab.path);
      setTimeout(() => {
        onCloseTab(tab.path, e as any);
        setSwipedPath(null);
      }, 200);
    }
    setTouchStartX(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        backgroundColor: '#090d16',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* ── Top Header Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            Open Tabs
          </span>
          <span
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.25)',
              color: '#60a5fa',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '9999px',
              border: '1px solid rgba(96, 165, 250, 0.4)',
            }}
          >
            {tabs.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {tabs.length > 1 && (
            <button
              type="button"
              onClick={onCloseAllTabs}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <Trash2 size={13} />
              Close All
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#2563eb',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>

      {/* ── 3D Card Stack Viewport ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1.5rem 1.25rem 6rem',
          perspective: '1200px',
          perspectiveOrigin: '50% 20%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = activePath === tab.path;
          const isBeingDismissed = swipedPath === tab.path;
          const TabIcon = tab.icon || Home;
          const isHome = tab.path === '/home' || tab.path === '/';

          return (
            <div
              key={tab.path}
              onTouchStart={(e) => handleTouchStart(e, tab.path)}
              onTouchEnd={(e) => handleTouchEnd(e, tab)}
              onClick={() => {
                onSelectTab(tab.path);
                onClose();
              }}
              style={{
                width: '100%',
                maxWidth: '360px',
                height: '190px',
                borderRadius: '20px',
                backgroundColor: '#1e293b',
                border: isActive
                  ? '2.5px solid #3b82f6'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isActive
                  ? '0 20px 30px -10px rgba(59, 130, 246, 0.5), 0 0 0 1px #3b82f6 inset'
                  : '0 15px 25px -5px rgba(0, 0, 0, 0.6)',
                transform: `rotateX(8deg) scale(${1 - Math.min(index * 0.015, 0.08)}) ${
                  isBeingDismissed ? 'translateX(100vw)' : 'translateX(0)'
                }`,
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                opacity: isBeingDismissed ? 0 : 1,
              }}
            >
              {/* Card Top Title Bar */}
              <div
                style={{
                  height: '38px',
                  backgroundColor: isActive ? '#1d4ed8' : '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 0.85rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <TabIcon size={16} color={isActive ? '#ffffff' : '#94a3b8'} />
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab.label}
                  </span>
                </div>

                {!isHome && tab.closable !== false && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.path, e);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      cursor: 'pointer',
                      marginLeft: '0.5rem',
                    }}
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Card Body Snapshot Container */}
              <div
                style={{
                  flex: 1,
                  backgroundColor: '#0f172a',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '0.72rem',
                      color: '#64748b',
                      marginBottom: '0.35rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    {tab.path}
                  </div>
                  <div
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      color: '#cbd5e1',
                    }}
                  >
                    {tab.label}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.68rem',
                      color: '#64748b',
                    }}
                  >
                    Swipe left/right to dismiss
                  </span>
                  {isActive && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: '#60a5fa',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <Check size={12} /> Active Tab
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Floating Bottom Action Bar (+ New Tab) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0.85rem 1.25rem calc(0.85rem + env(safe-area-inset-bottom, 0px))',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => {
            onNewTab();
            onClose();
          }}
          style={{
            backgroundColor: '#2563eb',
            border: 'none',
            borderRadius: '9999px',
            color: '#ffffff',
            padding: '0.65rem 1.75rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.5)',
            cursor: 'pointer',
          }}
        >
          <Plus size={18} />
          New Tab (Home)
        </button>
      </div>
    </div>
  );
};
