import React, { useState, useEffect, useRef } from 'react';
import { LayoutProps } from './Layout';
import { AppsDashboard } from './AppsDashboard';

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
  const activeChild = navItems.find(item => item.path === currentPath);
  const activeParentId = activeChild?.parentId;
  const activeSubNavs = activeParentId ? navItems.filter(item => item.parentId === activeParentId) : [];
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  const filteredSearchItems = searchItems.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.keywords && item.keywords.some(kw => kw.toLowerCase().includes(query)))
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
      {/* Top Header Bar */}
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
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
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
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                  setSearchOpen(false);
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
      </header>      {/* Main Content */}
      <main style={{
        ...mainContentStyle,
        paddingLeft: isDashboard ? '0' : mainContentStyle.paddingLeft,
        paddingRight: isDashboard ? '0' : mainContentStyle.paddingRight,
        paddingTop: isDashboard ? '80px' : mainContentStyle.paddingTop,
        paddingBottom: '80px',
      }}>
        {isDashboard ? (
          <AppsDashboard navItems={navItems} onNavigate={onNavigate} />
        ) : (
          children
        )}
      </main>

      {/* Scrollable Floating Persistent Bottom Tab Bar (Custom Capsule style) */}
      <footer className="glass hide-scrollbar" style={{
        position: 'fixed',
        bottom: '16px',
        left: '12px',
        right: '12px',
        height: '56px',
        backgroundColor: '#ffffff',
        borderRadius: '32px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        zIndex: 20,
        display: 'flex',
        overflowX: 'hidden',
        overflowY: 'hidden',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 1rem',
        whiteSpace: 'nowrap',
        scrollbarWidth: 'none',
      }}>
        {activeSubNavs.length > 0 ? (
          activeSubNavs.map((sub, idx) => {
            const isActive = currentPath === sub.path;
            return (
              <div
                key={`${sub.id || sub.path}-${idx}`}
                onClick={() => onNavigate(sub.path)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  minWidth: '60px',
                  height: '100%',
                  opacity: isActive ? 1 : 0.65,
                  transition: 'opacity var(--transition-fast)',
                }}
              >
                <div style={{
                  color: isActive ? '#3b82f6' : '#64748b',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: 'scale(1.1)',
                }}>
                  {sub.icon}
                </div>
                <span style={{ 
                  fontSize: '0.6rem', 
                  fontWeight: isActive ? 600 : 500,
                  lineHeight: '1.2',
                  color: isActive ? '#1f2937' : '#64748b'
                }}>
                  {sub.label}
                </span>
              </div>
            );
          })
        ) : (
          navItems.filter(item => !item.parentId).map((item, idx) => {
            const isActive = currentPath === item.path || (item.path === '/dashboard' && isDashboard);
            return (
              <div
                key={`${item.id || item.path}-${idx}`}
                onClick={() => {
                  onNavigate(item.path);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  minWidth: '50px',
                  height: '100%',
                  opacity: isActive ? 1 : 0.75,
                  transition: 'opacity var(--transition-fast)',
                }}
              >
                {/* Colored background icon block matching dashboard */}
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: item.bgGradient || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  marginBottom: '2px',
                  boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'scale(0.7)',
                  }}>
                    {React.isValidElement(item.icon) && typeof item.icon.type === 'string' && item.icon.type !== 'svg' ? (
                      item.icon
                    ) : React.isValidElement(item.icon) ? (
                      React.cloneElement(item.icon as React.ReactElement<any>, { 
                        style: { 
                          color: '#ffffff',
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
                  fontSize: '0.6rem', 
                  fontWeight: isActive ? 600 : 500,
                  lineHeight: '1.2',
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
      {searchOpen && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.1)',
          backdropFilter: 'blur(1px)',
          zIndex: 18,
        }}
        onClick={() => setSearchOpen(false)}
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
    </div>
  );
};
