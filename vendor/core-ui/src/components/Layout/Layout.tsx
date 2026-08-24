import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, matchPath, UNSAFE_RouteContext, UNSAFE_LocationContext } from 'react-router-dom';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { LayoutDesktop } from './Layout.desktop';
import { LayoutMobile } from './Layout.mobile';
import { UIRegistry, NavItemConfig, SearchItemConfig, RouteConfig } from '../../registry/registry';
import { apiClient, getWorkspaceFromUrl, getBaseUrl } from '../../api/client';
import { NotificationProvider, NotificationDrawer, NotificationToastContainer, useNotification } from '@geeksman/notification';
import { useToast } from '../Toast/Toast';

export interface NavItem {
  id?: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  section?: 'main' | 'extended' | 'settings';
  parentId?: string;
  bgGradient?: string;
  sublabel?: string;
  iconColor?: string;
  requiredPermission?: string;
}

export interface LayoutProps {
  navItems: NavItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  userEmail?: string;
  onLogout: () => void;
  children: React.ReactNode;
  searchItems: SearchItemConfig[];
}

interface CustomLayoutProps {
  children: React.ReactNode;
  customNavItems?: NavItem[];
}

interface Tab {
  path: string;
  title: string;
  element: React.ReactNode;
  pattern: string;
  params: any;
}

/** Create/edit form routes are ephemeral — discard their tab (and React state) when left. */
const isFormTabPath = (path: string) => path.endsWith('/new') || path.includes('/edit');

const resolveTabTitle = (path: string, navItems: NavItem[], routes: RouteConfig[]) => {
  const cleanPath = path.split('?')[0];
  const queryStr = path.includes('?') ? path.split('?')[1] : '';
  const searchParams = new URLSearchParams(queryStr);

  // 1. Check if route definition registered a custom title string or dynamic title resolver
  for (const r of routes) {
    const match = matchPath({ path: r.path, end: true }, cleanPath);
    if (match && r.title) {
      if (typeof r.title === 'function') {
        return r.title(path, searchParams);
      }
      return r.title;
    }
  }

  // 2. Fall back to matching registered navigation items
  const exact = navItems.find(item => item.path === cleanPath || item.path === path);
  if (exact) return exact.label;

  let bestMatch: NavItem | null = null;
  for (const item of navItems) {
    if (item.path !== '/' && cleanPath.startsWith(item.path)) {
      if (!bestMatch || item.path.length > bestMatch.path.length) {
        bestMatch = item;
      }
    }
  }

  const baseTitle = bestMatch ? bestMatch.label : 'Document';
  
  if (cleanPath.endsWith('/new')) {
    const singleName = baseTitle.endsWith('ies') ? baseTitle.slice(0, -3) + 'y' : baseTitle.endsWith('s') ? baseTitle.slice(0, -1) : baseTitle;
    return `New ${singleName}`;
  }
  if (cleanPath.includes('/edit')) {
    const parts = cleanPath.split('/');
    const editIndex = parts.indexOf('edit');
    const id = editIndex > 0 ? parts[editIndex - 1] : parts[parts.length - 1];
    const singleName = baseTitle.endsWith('ies') ? baseTitle.slice(0, -3) + 'y' : baseTitle.endsWith('s') ? baseTitle.slice(0, -1) : baseTitle;
    return `Edit ${singleName} #${id}`;
  }
  return baseTitle;
};

export const TabContentWrapper: React.FC<{ tab: Tab; isActive: boolean }> = ({ tab, isActive }) => {
  const globalLocation = useLocation();
  const [localLocation, setLocalLocation] = React.useState(globalLocation);

  React.useEffect(() => {
    if (isActive) {
      setLocalLocation(globalLocation);
      // Dispatch tab focus event so useRefreshOnVisible registers the navigation switch
      window.dispatchEvent(new Event('geeksman-tab-focused'));
    }
  }, [isActive, globalLocation]);

  const routeContextValue = React.useMemo(() => {
    return {
      matches: [
        {
          params: tab.params,
          pathname: tab.path,
          pathnameBase: tab.path,
          route: {
            path: tab.pattern,
          }
        }
      ],
      isPrimary: true
    };
  }, [tab.params, tab.path, tab.pattern]);

  const locationContextValue = React.useMemo(() => {
    return {
      location: localLocation,
      navigationType: 'PUSH' as const,
    };
  }, [localLocation]);

  return (
    <UNSAFE_LocationContext.Provider value={locationContextValue as any}>
      <UNSAFE_RouteContext.Provider value={routeContextValue as any}>
        {tab.element}
      </UNSAFE_RouteContext.Provider>
    </UNSAFE_LocationContext.Provider>
  );
};

const LayoutInner: React.FC<CustomLayoutProps> = ({ children, customNavItems }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [registryNavItems, setRegistryNavItems] = React.useState<NavItem[]>(() => {
    return UIRegistry.getNavItems().map(item => ({
      id: item.id,
      label: item.label,
      path: item.path,
      icon: item.icon,
      section: item.section,
      parentId: item.parentId,
      bgGradient: item.bgGradient,
      sublabel: item.sublabel,
      iconColor: item.iconColor,
      requiredPermission: item.requiredPermission
    }));
  });

  React.useEffect(() => {
    if (customNavItems) return;
    const unsubscribe = UIRegistry.subscribe(() => {
      setRegistryNavItems(
        UIRegistry.getNavItems().map(item => ({
          id: item.id,
          label: item.label,
          path: item.path,
          icon: item.icon,
          section: item.section,
          parentId: item.parentId,
          bgGradient: item.bgGradient,
          sublabel: item.sublabel,
          iconColor: item.iconColor,
          requiredPermission: item.requiredPermission
        }))
      );
    });
    return unsubscribe;
  }, [customNavItems]);

  const [userPermissions, setUserPermissions] = useState<string[]>(() => {
    const cached = localStorage.getItem('user_permissions');
    return cached ? JSON.parse(cached) : [];
  });

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await apiClient.get('/tenant/users/me/permissions');
        const permsList = res.data?.data?.permissions || [];
        const permKeys = permsList.map((p: any) => p.key);
        localStorage.setItem('user_permissions', JSON.stringify(permKeys));
        setUserPermissions(permKeys);
      } catch (err) {
        console.error('Failed to fetch user permissions:', err);
      }
    };
    fetchPermissions();
  }, []);

  const rawNavItems: NavItem[] = customNavItems || registryNavItems;
  const navItems = rawNavItems.filter(item => {
    if (item.requiredPermission) {
      if (!userPermissions.includes('*') && !userPermissions.includes(item.requiredPermission)) {
        return false;
      }
    }
    const lowerId = item.id?.toLowerCase() || '';
    const lowerLabel = item.label?.toLowerCase() || '';
    if (lowerId.includes('requisition') || lowerLabel.includes('requisition')) return false;
    if (lowerId.includes('rfq') || lowerLabel.includes('rfq')) return false;
    if (lowerId.includes('pricing') || lowerLabel.includes('pricing') || (lowerLabel.includes('quotation') && !item.parentId)) return false;
    return true;
  });


  // Sort navItems so that 'Settings' is always last
  const sortedNavItems = [...navItems].sort((a, b) => {
    const isASettings = a.id === 'tenant-settings' || a.label.toLowerCase() === 'settings';
    const isBSettings = b.id === 'tenant-settings' || b.label.toLowerCase() === 'settings';
    if (isASettings && !isBSettings) return 1;
    if (!isASettings && isBSettings) return -1;
    return 0;
  });

  // Fallback default items if registry is empty
  const finalNavItems = sortedNavItems.length > 0 ? sortedNavItems : [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: '📊', section: 'main' as const },
    { id: 'tenant-setup', label: 'New Tenant', path: '/tenant-setup', icon: '🏢', section: 'main' as const },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  const [installPrompt, setInstallPrompt] = React.useState<any>(null);
  const [updateAvailable, setUpdateAvailable] = React.useState<boolean>(false);
  const [swRegistration, setSwRegistration] = React.useState<ServiceWorkerRegistration | null>(null);

  const [installDismissed, setInstallDismissed] = React.useState<boolean>(false);
  const [updateDismissed, setUpdateDismissed] = React.useState<boolean>(false);

  // TDI state management
  const [tabs, setTabs] = React.useState<Tab[]>([]);
  const [activeTabPath, setActiveTabPath] = React.useState<string>('/dashboard');
  // Mirror tabs into a ref so handleCloseTab always reads the latest list without
  // stale closures — state updater functions work but calling navigate() inside
  // one is a React anti-pattern and can cause subtle double-render issues.
  const tabsRef = React.useRef<Tab[]>([]);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [activeTabPath]);

  const routes = UIRegistry.getRoutes();

  React.useEffect(() => {
    const cleanPath = location.pathname;
    const fullPath = location.pathname + (location.search || '');
    if (cleanPath === '/login') return;

    let matchedRoute: (typeof routes)[number] | null = null;
    let matchedParams: Record<string, string | undefined> = {};
    let matchedPattern = '';

    for (const r of routes) {
      const match = matchPath({ path: r.path, end: true }, cleanPath);
      if (match) {
        matchedRoute = r;
        matchedParams = match.params;
        matchedPattern = r.path;
        break;
      }
    }

    setTabs(prev => {
      if (prev.some(t => t.path === fullPath || t.path === cleanPath)) {
        tabsRef.current = prev;
        return prev;
      }

      if (matchedRoute) {
        const result = [
          ...prev,
          {
            path: fullPath,
            title: resolveTabTitle(fullPath, finalNavItems, routes),
            element: matchedRoute.element,
            pattern: matchedPattern,
            params: matchedParams
          }
        ];
        tabsRef.current = result;
        return result;
      }

      tabsRef.current = prev;
      return prev;
    });
    setActiveTabPath(fullPath);
  }, [location.pathname, location.search, routes, finalNavItems]);

  const handleCloseTab = (pathClose: string) => {
    // Read current tabs from the ref — always up-to-date, no stale closure.
    const current = tabsRef.current;
    const index = current.findIndex(t => t.path === pathClose);
    if (index === -1) return;

    const newTabs = current.filter(t => t.path !== pathClose);
    tabsRef.current = newTabs;
    setTabs(newTabs);

    const fullCurrent = location.pathname + (location.search || '');
    if (fullCurrent === pathClose || location.pathname === pathClose) {
      const nextPath = newTabs.length > 0
        ? newTabs[Math.min(index, newTabs.length - 1)].path
        : '/dashboard';
      navigate(nextPath);
    }
  };

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Track active service worker and listen for updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        setSwRegistration(reg);
        if (reg.waiting) {
          setUpdateAvailable(true);
        }
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          }
        });
      });
    }

    // Periodically check for updates via the REST API
    const checkUpdates = async () => {
      const token = localStorage.getItem('token');
      const isDesktop = !!(window as any).wails ||
                        window.location.hostname === 'wails' ||
                        window.location.protocol === 'wails:' ||
                        window.location.hostname.includes('wails');
      if (!token && !isDesktop) return;
      try {
        const res = await apiClient.get('/tenant/check-updates');
        if (res.data && res.data.data && res.data.data.update_available) {
          setUpdateAvailable(true);
          // Trigger native notification
          if ('Notification' in window) {
            const trigger = () => {
              new Notification('Geeksman OS Update Available', {
                body: `A new version ${res.data.data.latest_version} is ready. Click the update icon in the sidebar to update.`,
                icon: '/favicon.png'
              });
            };
            if (Notification.permission === 'granted') {
              trigger();
            } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                if (permission === 'granted') trigger();
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to auto-check updates', err);
      }
    };

    // Run check once on start (wait 5s so app is fully loaded)
    const initialCheckTimeout = setTimeout(checkUpdates, 5000);
    // Poll every 10 minutes
    const updateInterval = setInterval(checkUpdates, 10 * 60 * 1000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      clearTimeout(initialCheckTimeout);
      clearInterval(updateInterval);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleUpdate = async () => {
    const isDesktop = !!(window as any).wails ||
                      window.location.hostname === 'wails' ||
                      window.location.protocol === 'wails:' ||
                      window.location.hostname.includes('wails');
    if (isDesktop) {
      try {
        await apiClient.post('/runtime/trigger-update');
        setUpdateAvailable(false);
      } catch (err: any) {
        console.error('Failed to trigger desktop update', err);
        const errMsg = err.response?.data?.message || err.response?.data?.error?.message || err.message;
        showToast(`Failed to trigger update: ${errMsg}`, 'error');
      }
    } else {
      if (swRegistration && swRegistration.waiting) {
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      } else if (swRegistration) {
        swRegistration.update().catch(err => console.error('Failed to trigger service worker update', err));
      }
      setUpdateAvailable(false);
      window.location.reload();
    }
  };

  const { unreadCount } = useNotification();
  const [drawerOpen, setDrawerOpen] = React.useState(false);


  const props: any = {
    navItems: finalNavItems,
    currentPath: location.pathname,
    onNavigate: (path: string) => navigate(path),
    userEmail: localStorage.getItem('user_email') || 'admin@geeksman.com',
    onLogout: handleLogout,
    children,
    searchItems: UIRegistry.getSearchItems(),
    showInstallBanner: !!installPrompt && !installDismissed,
    onInstall: handleInstall,
    showUpdateBanner: updateAvailable && !updateDismissed,
    onUpdate: handleUpdate,
    tabs,
    activeTabPath,
    onCloseTab: handleCloseTab,
    onSelectTab: (path: string) => navigate(path),
    unreadCount,
    onOpenNotifications: () => setDrawerOpen(true),
  };

  // Modern Premium styles for PWA Banners
  const bannerContainerStyle = (type: 'install' | 'update'): React.CSSProperties => {
    const isDesktopView = isDesktop;
    return {
      position: 'fixed',
      zIndex: 9999,
      bottom: isDesktopView ? '24px' : 'auto',
      top: isDesktopView ? 'auto' : '16px',
      right: isDesktopView ? '24px' : '16px',
      left: isDesktopView ? 'auto' : '16px',
      maxWidth: isDesktopView ? '420px' : 'none',
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(16px) saturate(180%)',
      WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      border: '1px solid rgba(255, 255, 255, 0.5)',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(255, 255, 255, 0.6)',
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      animation: isDesktopView ? 'slide-up-right 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'slide-down 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    };
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slide-up-right {
          from { transform: translateY(30px) scale(0.95); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes slide-down {
          from { transform: translateY(-30px); opacity: 0; }
          to { transform: translateY(0) opacity: 1; }
        }
      `}} />
      {isDesktop ? <LayoutDesktop {...props} /> : <LayoutMobile {...props} />}

      {/* Installation Banner */}
      {!!installPrompt && !installDismissed && (
        <div style={bannerContainerStyle('install')}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #e15b13 0%, #ff8833 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(225, 91, 19, 0.2)',
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1f2937', marginBottom: '0.2rem' }}>
                Install Geeksman OS
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4b5563', lineHeight: '1.4' }}>
                Add Geeksman OS to your home screen for quick, offline-ready access and a full-screen native experience.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              onClick={() => setInstallDismissed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4b5563',
                fontSize: '0.8rem',
                fontWeight: 500,
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Later
            </button>
            <button
              onClick={handleInstall}
              style={{
                background: 'linear-gradient(135deg, #e15b13 0%, #f97316 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(225, 91, 19, 0.2)',
                transition: 'transform 0.15s, opacity 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              Install App
            </button>
          </div>
        </div>
      )}

      {/* Update Available Banner */}
      {updateAvailable && !updateDismissed && (
        <div style={bannerContainerStyle('update')}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
              flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1f2937', marginBottom: '0.2rem' }}>
                Application Update Available
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4b5563', lineHeight: '1.4' }}>
                A new version of Geeksman OS is ready. Reload now to apply the latest improvements and features.
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              onClick={() => setUpdateDismissed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#4b5563',
                fontSize: '0.8rem',
                fontWeight: 500,
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Dismiss
            </button>
            <button
              onClick={handleUpdate}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                padding: '0.5rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.2)',
                transition: 'transform 0.15s, opacity 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              Update Now
            </button>
          </div>
        </div>
      )}

      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={(path) => navigate(path)}
      />
      <NotificationToastContainer onNavigate={(path) => navigate(path)} />
    </>
  );
};

export const Layout: React.FC<CustomLayoutProps> = (props) => {
  const baseUrl = getBaseUrl() || '';
  const userId = localStorage.getItem('user_email') || 'admin@geeksman.com';
  const tenantCode = getWorkspaceFromUrl();
  const token = localStorage.getItem('token') || '';

  return (
    <NotificationProvider
      baseUrl={baseUrl}
      userId={userId}
      tenantCode={tenantCode}
      token={token}
    >
      <LayoutInner {...props} />
    </NotificationProvider>
  );
};
