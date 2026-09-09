import React, { useState, useEffect, useRef } from 'react';
import { LayoutProps } from './Layout';
import { AppsDashboard } from './AppsDashboard';
import { useAppVersion } from '../../hooks/useAppVersion';
import { VersionModal } from '../VersionModal';
import { VersionBadge } from '../VersionBadge';
import { Dashboard3DIcon } from '../icons3d';

export const LayoutMobile: React.FC<any> = ({
  navItems,
  currentPath,
  onNavigate,
  userEmail,
  onLogout,
  children,
  searchItems,
  showInstallBanner,
  onInstall,
  showUpdateBanner,
  onUpdate,
}) => {
  const isDashboard = currentPath === '/dashboard' || currentPath === '/';
  const mainNavItems = navItems.filter(item => !item.parentId);

  const getActiveParentId = (path: string, items: any[]) => {
    if (path === '/' || path === '/dashboard') return null;

    // 1. Exact match for child item with parentId
    const exactChild = items.find(item => item.path === path && item.parentId);
    if (exactChild) return exactChild.parentId;

    // 2. Exact match for parent item (with no parentId) that has children
    const exactParent = items.find(item => item.path === path && !item.parentId);
    if (exactParent && items.some(child => child.parentId === exactParent.id)) {
      return exactParent.id;
    }

    // 3. Prefix match for child items (e.g. /products/123 matches /products)
    const prefixChild = items.find(item => item.path !== '/' && item.path !== '/dashboard' && (path.startsWith(item.path + '/') || path.startsWith(item.path + '?')));
    if (prefixChild && prefixChild.parentId) return prefixChild.parentId;

    // 4. Prefix match for parent items that have children
    const prefixParent = items.find(item => item.path !== '/' && item.path !== '/dashboard' && (path.startsWith(item.path + '/') || path.startsWith(item.path + '?')));
    if (prefixParent && items.some(child => child.parentId === prefixParent.id)) {
      return prefixParent.id;
    }

    return null;
  };

  const activeParentId = getActiveParentId(currentPath, navItems);
  const activeSubNavs = activeParentId ? navItems.filter(item => item.parentId === activeParentId) : [];
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const {
    uiVersion,
    cacheId,
    backendVersion,
    updateReady,
    modalOpen: versionModalOpen,
    setModalOpen: setVersionModalOpen,
    checkForUpdates,
    copySystemInfo,
  } = useAppVersion();

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connSpeed, setConnSpeed] = useState<string>('4g');
  const [downlink, setDownlink] = useState<number>(9.2);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const updateConnection = () => {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn) {
        setConnSpeed(conn.effectiveType || '4g');
        setDownlink(conn.downlink || 9.2);
      }
    };
    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      conn.addEventListener('change', updateConnection);
      updateConnection();
    }
    return () => {
      if (conn) {
        conn.removeEventListener('change', updateConnection);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!navigator.onLine) return;
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      const base = conn?.downlink || 9.2;
      const variation = (Math.random() - 0.5) * 0.8;
      setDownlink(Math.max(0.1, +(base + variation).toFixed(1)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getNetworkIndicator = () => {
    if (!isOnline) {
      return {
        color: '#ef4444',
        statusText: 'OFFLINE',
        speedText: '0.0 Mbps',
      };
    }
    if (downlink < 5.0) {
      return {
        color: '#f97316',
        statusText: 'DEGRADED',
        speedText: `${downlink.toFixed(1)} Mbps`,
      };
    } else {
      return {
        color: '#10b981',
        statusText: 'STABLE',
        speedText: `${downlink.toFixed(1)} Mbps`,
      };
    }
  };

  const netInfo = getNetworkIndicator();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery('');
    searchInputRef.current?.blur();
  }, [currentPath]);

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const filteredSearchItems = trimmedQuery.length === 0 ? [] : searchItems.filter(item => {
    return (
      item.title.toLowerCase().includes(trimmedQuery) ||
      (item.description && item.description.toLowerCase().includes(trimmedQuery)) ||
      (item.keywords && item.keywords.some(kw => kw.toLowerCase().includes(trimmedQuery)))
    );
  });

  const categories = Array.from(new Set(filteredSearchItems.map(item => item.category))) as string[];

  const topBarStyle: React.CSSProperties = {
    height: '60px',
    width: '100%',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1rem',
    boxSizing: 'border-box',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: '#ffffff',
  };

  const mobileNavContainer: React.CSSProperties = {
    position: 'fixed',
    top: '60px',
    left: 0,
    width: '100%',
    backgroundColor: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-color)',
    display: menuOpen ? 'block' : 'none',
    zIndex: 19,
    padding: '1rem 0',
  };

  const bottomTabBarStyle: React.CSSProperties = {
    height: '60px',
    width: '100%',
    position: 'fixed',
    bottom: 0,
    left: 0,
    zIndex: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    boxSizing: 'border-box',
    borderTop: '1px solid var(--border-color)',
  };

  const mainContentStyle: React.CSSProperties = {
    paddingTop: '70px',
    paddingBottom: '70px',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    minHeight: '100vh',
    boxSizing: 'border-box',
    backgroundColor: 'var(--bg-primary)',
    overflowY: 'auto',
  };

  const getTabItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    cursor: 'pointer',
    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
    fontSize: '0.75rem',
  });

  const getMenuItemStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '0.75rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: isActive ? 'var(--accent)' : 'var(--text-primary)',
    fontSize: '0.95rem',
    borderBottom: '1px solid rgba(255, 255, 255, 0.02)',
  });

  // Display top priority items in bottom bar, others via drawer
  const bottomItems = navItems.slice(0, 4);

  const isFormRoute = currentPath.endsWith('/new') || currentPath.includes('/create') || currentPath.endsWith('/edit') || currentPath.includes('/new?') || currentPath.includes('/edit?');
  const [isNavHiddenByEvent, setIsNavHiddenByEvent] = useState(false);

  useEffect(() => {
    const handleToggleNav = (e: any) => {
      setIsNavHiddenByEvent(Boolean(e.detail?.hide));
    };
    window.addEventListener('geeksman:hide-bottom-nav', handleToggleNav as EventListener);
    return () => {
      window.removeEventListener('geeksman:hide-bottom-nav', handleToggleNav as EventListener);
    };
  }, []);

  const shouldHideNavbar = isNavHiddenByEvent || isFormRoute;

  const SUBNAV_GRADIENTS = [
    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue
    'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald
    'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', // Purple
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
    'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', // Pink
    'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', // Cyan
    'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', // Indigo
    'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', // Rose
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-dot {
          0% { transform: scale(0.85); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.85); opacity: 0.6; }
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
      {/* Top Header Bar - Only rendered on the main Apps Dashboard, hidden inside individual apps */}
      {isDashboard && (
        <header className="glass" style={topBarStyle}>
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              flex: 1,
              marginRight: '0.5rem',
              maxWidth: 'calc(100% - 72px)',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.4rem 0.8rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
                fontSize: '0.8rem',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <svg
                style={{ width: '13px', height: '13px', color: 'var(--text-secondary)' }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchQuery(val);
                  setSearchOpen(val.trim().length > 0);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length > 0) {
                    setSearchOpen(true);
                  }
                }}
                style={{
                  flex: 1,
                  border: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.8rem',
                  outline: 'none',
                  color: 'var(--text-primary)',
                  padding: 0,
                  width: '100%',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    setSearchOpen(false);
                    searchInputRef.current?.blur();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* PWA Update Action Icon */}
          {showUpdateBanner && (
            <div
              onClick={onUpdate}
              style={{
                cursor: 'pointer',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                backgroundColor: '#3b82f6',
                boxShadow: '0 0 8px #3b82f6',
                marginRight: '0.5rem',
                animation: 'pulse-dot 1.5s infinite ease-in-out',
              }}
              title="Update Available! Click to reload."
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
            </div>
          )}

          {/* PWA Install Action Icon */}
          {showInstallBanner && (
            <div
              onClick={onInstall}
              style={{
                cursor: 'pointer',
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                backgroundColor: '#e15b13',
                boxShadow: '0 0 8px #e15b13',
                marginRight: '0.5rem',
                animation: 'pulse-dot 2s infinite ease-in-out',
              }}
              title="Install App"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
          )}

          {/* Network Strength status Indicator - Mobile (only blinking color-coded dot) */}
          {localStorage.getItem('disable_network_status') !== 'true' && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              marginRight: '0.25rem',
            }} title={`Network: ${netInfo.statusText} (${netInfo.speedText})`}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: netInfo.color,
                animation: 'pulse-dot 1.5s infinite ease-in-out',
                boxShadow: `0 0 8px ${netInfo.color}`,
              }} />
            </div>
          )}

          <VersionBadge
            version={uiVersion}
            updateReady={updateReady}
            onClick={() => setVersionModalOpen(true)}
            style={{ marginRight: '0.35rem', padding: '0.18rem 0.45rem', fontSize: '0.65rem' }}
          />
        </header>
      )}

      {/* Main Content */}
      <main style={{
        ...mainContentStyle,
        paddingLeft: isDashboard ? '0' : mainContentStyle.paddingLeft,
        paddingRight: isDashboard ? '0' : mainContentStyle.paddingRight,
        paddingTop: isDashboard ? '80px' : '0.5rem',
        paddingBottom: shouldHideNavbar ? '16px' : '80px',
        transition: 'padding-bottom 0.25s ease, padding-top 0.25s ease',
      }}>
        {isDashboard ? (
          <AppsDashboard navItems={mainNavItems} onNavigate={onNavigate} />
        ) : (
          children
        )}
      </main>

      {/* Scrollable Floating Persistent Bottom Tab Bar (5 items visible, rest scrollable) */}
      <footer className="glass hide-scrollbar" style={{
        position: 'fixed',
        bottom: '10px',
        left: '6px',
        right: '6px',
        height: '48px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.09)',
        zIndex: 20,
        display: 'flex',
        overflowX: 'auto',
        overflowY: 'hidden',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '0 6px',
        gap: '2px',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        transform: shouldHideNavbar ? 'translateY(120px)' : 'translateY(0)',
        opacity: shouldHideNavbar ? 0 : 1,
        pointerEvents: shouldHideNavbar ? 'none' : 'auto',
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease',
      }}>
        {activeSubNavs.length > 0 ? (
          <>
            {/* Apps / Dashboard Home button */}
            <div
              onClick={() => onNavigate('/dashboard')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flex: '0 0 58px',
                minWidth: '58px',
                maxWidth: '64px',
                height: '100%',
                padding: '2px 0',
                opacity: isDashboard ? 1 : 0.8,
                transition: 'opacity var(--transition-fast)',
              }}
              title="All Applications"
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1px',
                boxShadow: isDashboard ? '0 2px 5px rgba(0,0,0,0.18)' : 'none',
                transform: isDashboard ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.15s ease',
              }}>
                <Dashboard3DIcon size={19} />
              </div>
              <span style={{ 
                fontSize: '0.58rem', 
                fontWeight: isDashboard ? 700 : 500,
                lineHeight: '1.1',
                maxWidth: '56px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center',
                color: isDashboard ? '#1f2937' : '#64748b'
              }}>
                Apps
              </span>
            </div>

            {/* App Subnavigation Tabs */}
            {activeSubNavs.map((sub, idx) => {
              const isActive = currentPath === sub.path || (sub.path !== '/' && (currentPath.startsWith(sub.path + '/') || currentPath.startsWith(sub.path + '?')));
              const bgGradient = (sub.bgGradient && sub.bgGradient !== 'transparent' && sub.bgGradient !== 'none')
                ? sub.bgGradient
                : SUBNAV_GRADIENTS[idx % SUBNAV_GRADIENTS.length];
              const isTransparent = sub.bgGradient === 'transparent' || sub.bgGradient === 'none';

              return (
                <div
                  key={`${sub.id || sub.path}-${idx}`}
                  ref={(el) => {
                    if (isActive && el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                  }}
                  onClick={() => onNavigate(sub.path)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flex: '0 0 58px',
                    minWidth: '58px',
                    maxWidth: '64px',
                    height: '100%',
                    padding: '2px 0',
                    opacity: isActive ? 1 : 0.75,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: isTransparent ? '0px' : '5px',
                    background: isTransparent ? 'transparent' : bgGradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    marginBottom: '1px',
                    boxShadow: (isActive && !isTransparent) ? '0 2px 4px rgba(0,0,0,0.18)' : 'none',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    transition: 'transform 0.15s ease',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: isTransparent ? '20px' : '100%',
                      height: isTransparent ? '20px' : '100%',
                      transform: isTransparent ? 'none' : 'scale(0.72)',
                    }}>
                      {React.isValidElement(sub.icon) && typeof sub.icon.type === 'string' && sub.icon.type !== 'svg' ? (
                        sub.icon
                      ) : React.isValidElement(sub.icon) ? (
                        React.cloneElement(sub.icon as React.ReactElement<any>, { 
                          style: { 
                            color: isTransparent ? (isActive ? '#3b82f6' : '#64748b') : '#ffffff',
                            width: '100%',
                            height: '100%',
                            display: 'block'
                          } 
                        })
                      ) : (
                        sub.icon
                      )}
                    </div>
                  </div>
                  <span style={{ 
                    fontSize: '0.58rem', 
                    fontWeight: isActive ? 700 : 500,
                    lineHeight: '1.1',
                    maxWidth: '56px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textAlign: 'center',
                    color: isActive ? '#1f2937' : '#64748b'
                  }}>
                    {sub.label}
                  </span>
                </div>
              );
            })}
          </>
        ) : (
          mainNavItems.map((item, idx) => {
            const isActive = currentPath === item.path || (item.path === '/dashboard' && isDashboard);
            return (
              <div
                key={`${item.id || item.path}-${idx}`}
                ref={(el) => {
                  if (isActive && el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }
                }}
                onClick={() => {
                  onNavigate(item.path);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flex: '0 0 58px',
                  minWidth: '58px',
                  maxWidth: '64px',
                  height: '100%',
                  padding: '2px 0',
                  opacity: isActive ? 1 : 0.75,
                  transition: 'opacity var(--transition-fast)',
                }}
              >
                {/* Icon block */}
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: (item.bgGradient && item.bgGradient !== 'transparent' && item.bgGradient !== 'none') ? '5px' : '0px',
                  background: (item.bgGradient && item.bgGradient !== 'transparent' && item.bgGradient !== 'none') ? item.bgGradient : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: (item.bgGradient && item.bgGradient !== 'transparent' && item.bgGradient !== 'none') ? '#ffffff' : (isActive ? '#2563eb' : '#64748b'),
                  marginBottom: '1px',
                  boxShadow: (isActive && item.bgGradient && item.bgGradient !== 'transparent' && item.bgGradient !== 'none') ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                  }}>
                    {React.isValidElement(item.icon) && typeof item.icon.type === 'string' && item.icon.type !== 'svg' ? (
                      item.icon
                    ) : React.isValidElement(item.icon) ? (
                      React.cloneElement(item.icon as React.ReactElement<any>, { 
                        style: { 
                          width: '100%',
                          height: '100%',
                          display: 'block'
                        } 
                      })
                    ) : (
                      item.icon
                    )}
                  </div>
                </div>
                <span style={{ 
                  fontSize: '0.58rem', 
                  fontWeight: isActive ? 700 : 500,
                  lineHeight: '1.1',
                  maxWidth: '56px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  textAlign: 'center',
                  color: isActive ? '#1f2937' : '#64748b'
                }}>
                  {item.label}
                </span>
              </div>
            );
          })
        )}
      </footer>

      {/* Inline Search Dropdown Overlay */}
      {searchOpen && searchQuery.trim().length > 0 && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.35)',
          backdropFilter: 'blur(2px)',
          zIndex: 18,
        }}
        onClick={() => {
          setSearchOpen(false);
          setSearchQuery('');
          searchInputRef.current?.blur();
        }}
        >
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '1rem',
            right: '1rem',
            maxHeight: 'calc(100vh - 140px)',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-xl)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            {/* Search Results */}
            <div style={{ overflowY: 'auto', padding: '0.85rem' }}>
              {filteredSearchItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  No results found for "{searchQuery}"
                </div>
              ) : (
                categories.map(category => (
                  <div key={category} style={{ marginBottom: '0.85rem' }}>
                    <div style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: 'var(--accent)',
                      marginBottom: '0.35rem',
                      letterSpacing: '0.05em'
                    }}>
                      {category}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                      {filteredSearchItems.filter(item => item.category === category).map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                            item.action((path) => onNavigate(path));
                          }}
                          style={{
                            padding: '0.5rem 0.6rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'background var(--transition-fast)',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            {item.title}
                          </div>
                          {item.description && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.05rem' }}>
                              {item.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <VersionModal
        isOpen={versionModalOpen}
        onClose={() => setVersionModalOpen(false)}
        uiVersion={uiVersion}
        cacheId={cacheId}
        backendVersion={backendVersion}
        onCheckUpdates={checkForUpdates}
        onCopyInfo={copySystemInfo}
        updateReady={updateReady}
      />
    </div>
  );
};
