import React, { useState, useEffect, useRef } from 'react';
import { LayoutProps, NavItem, TabContentWrapper } from './Layout';
import { SearchItemConfig } from '../../registry/registry';
import { AppsDashboard } from './AppsDashboard';
import { CommandPalette } from '../CommandPalette';


export const LayoutDesktop: React.FC<any> = ({
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
  // New props:
  tabs = [],
  activeTabPath = '/dashboard',
  onCloseTab = () => { },
  onSelectTab = () => { },
  unreadCount = 0,
  onOpenNotifications,
}) => {
  const isDashboard = currentPath === '/dashboard' || currentPath === '/';
  const [activeMainMenuId, setActiveMainMenuId] = useState<string | null>('tenant-settings');
  const [isSubNavCollapsed, setIsSubNavCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [tabSearchOpen, setTabSearchOpen] = useState(false);
  const [tabSearchQuery, setTabSearchQuery] = useState('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  
  const handleScrollSubnav = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleScrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 150;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getTabIcon = (path: string) => {
    const p = path.toLowerCase();
    if (p.includes('catalogue') || p.includes('products') || p.includes('variants') || p.includes('categories') || p.includes('groups') || p.includes('brands') || p.includes('hsn')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#db2777' }}>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    }
    if (p.includes('inventory') || p.includes('items')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#7c3aed' }}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    }
    if (p.includes('crm') || p.includes('leads')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#16a34a' }}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      );
    }
    if (p.includes('sales')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#e11d48' }}>
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
      );
    }
    if (p.includes('contact')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ea580c' }}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        </svg>
      );
    }
    if (p.includes('location')) {
      return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0d9488' }}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      );
    }
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#2563eb' }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    );
  };


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

  // Close profile dropdown & search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.profile-menu-container')) {
        setProfileMenuOpen(false);
      }
      if (!target.closest('.desktop-search-container')) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group items
  const mainNavItems = navItems.filter(item => !item.parentId);
  const extendedNavItems = navItems.filter(item => item.parentId === activeMainMenuId);

  // Auto-activate main menu parent based on active route path (including child prefix matching)
  useEffect(() => {
    const getMatchingNavItem = (path: string) => {
      // Prioritize exact matches that are main menu items (no parentId)
      let found = navItems.find(item => item.path === path && !item.parentId);
      if (found) return found;

      // Otherwise, find any exact match
      found = navItems.find(item => item.path === path);
      if (found) return found;

      // Prefix matching
      found = navItems.find(item => item.path !== '/' && path.startsWith(item.path + '/'));
      return found;
    };

    const activeItem = getMatchingNavItem(currentPath);
    if (activeItem) {
      if (activeItem.parentId) {
        setActiveMainMenuId(activeItem.parentId);
        const hasChildren = navItems.some(child => child.parentId === activeItem.parentId);
        setIsSubNavCollapsed(!hasChildren);
      } else if (activeItem.id) {
        setActiveMainMenuId(activeItem.id);
        const hasChildren = navItems.some(child => child.parentId === activeItem.id);
        setIsSubNavCollapsed(!hasChildren);
      }
    }
  }, [currentPath, navItems]);

  // Expanded Keyboard Engine (TDI Navigation, cycling, escape blur, Ctrl+K search)
  useEffect(() => {
    let gPressed = false;
    let gTimeout: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      const isInput = active && (
        active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.tagName === 'SELECT' ||
        active.getAttribute('contenteditable') === 'true'
      );

      if (e.key === 'Escape') {
        setSearchOpen(false);
        if (isInput) {
          (active as HTMLElement).blur();
          e.preventDefault();
        }
        return;
      }

      // Ctrl+Tab / Ctrl+Shift+Tab cycling
      if (e.ctrlKey && e.key === 'Tab') {
        e.preventDefault();
        if (tabs && tabs.length > 1) {
          const currentIndex = tabs.findIndex(t => t.path === activeTabPath);
          if (currentIndex !== -1) {
            let nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
            if (nextIndex < 0) nextIndex = tabs.length - 1;
            if (nextIndex >= tabs.length) nextIndex = 0;
            onSelectTab(tabs[nextIndex].path);
          }
        }
        return;
      }

      // Cmd+K / Ctrl+K search bar toggle
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (isInput && active !== searchInputRef.current) {
          return;
        }
        e.preventDefault();
        setSearchOpen(prev => !prev);
        return;
      }

      // Ctrl+Space command palette toggle
      if (e.ctrlKey && e.key === ' ') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
        return;
      }

      if (isInput) return;


      // g + 1-9 jumps
      if (e.key.toLowerCase() === 'g') {
        gPressed = true;
        if (gTimeout) clearTimeout(gTimeout);
        gTimeout = setTimeout(() => {
          gPressed = false;
        }, 1000);
        return;
      }

      if (gPressed && e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key, 10);
        const targetIndex = num - 1;
        if (tabs && tabs[targetIndex]) {
          e.preventDefault();
          onSelectTab(tabs[targetIndex].path);
        }
        gPressed = false;
        if (gTimeout) clearTimeout(gTimeout);
        return;
      }

      gPressed = false;
      if (gTimeout) clearTimeout(gTimeout);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      if (gTimeout) clearTimeout(gTimeout);
    };
  }, [tabs, activeTabPath, onSelectTab]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  }, [searchOpen]);

  const handleMainMenuClick = (item: NavItem) => {
    const hasChildren = navItems.some(child => child.parentId === item.id);
    if (hasChildren) {
      setActiveMainMenuId(item.id || null);
      setIsSubNavCollapsed(false);

      const firstChild = navItems.find(child => child.parentId === item.id);
      if (firstChild && firstChild.path) {
        onNavigate(firstChild.path);
      }
    } else {
      setActiveMainMenuId(item.id || null);
      setIsSubNavCollapsed(true);
      if (item.path) {
        onNavigate(item.path);
      }
    }
  };

  const filteredSearchItems = searchItems.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.keywords && item.keywords.some(kw => kw.toLowerCase().includes(query)))
    );
  });

  const categories = Array.from(new Set(filteredSearchItems.map(item => item.category))) as string[];

  // Width calculations based on state
  const leftSidebarWidth = '72px';
  const subNavWidth = '0px';
  const mainMarginLeft = `calc(${leftSidebarWidth} + ${subNavWidth})`;

  const activeParentItem = mainNavItems.find(item => item.id === activeMainMenuId);
  const subNavTitle = activeParentItem ? activeParentItem.label : 'Settings';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes pulse-dot {
          0% { transform: scale(0.85); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.85); opacity: 0.6; }
        }
      `}} />

      {/* 1. Persistent Leftmost Dock Sidebar */}
      <aside style={{
        width: leftSidebarWidth,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        backgroundColor: '#ffffff', // Matched to main app theme
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.25rem 0',
        zIndex: 30,
      }}>
        {/* Apps Grid Trigger Icon (nine dots) */}
        <div
          onClick={() => onNavigate('/dashboard')}
          style={{
            cursor: 'pointer',
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: isDashboard ? '#eff6ff' : 'transparent', // Light blue active highlight
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isDashboard ? 'var(--primary)' : '#4b5563',
            marginBottom: '1.5rem',
            transition: 'all var(--transition-fast)',
            border: isDashboard ? '1px solid #dbeafe' : '1px solid transparent',
          }}
          onMouseEnter={(e) => {
            if (!isDashboard) {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#111827';
            }
          }}
          onMouseLeave={(e) => {
            if (!isDashboard) {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#4b5563';
            }
          }}
          title="All Applications"
        >
          {/* 3x3 Grid Icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="4" height="4" rx="1" />
            <rect x="10" y="4" width="4" height="4" rx="1" />
            <rect x="16" y="4" width="4" height="4" rx="1" />
            <rect x="4" y="10" width="4" height="4" rx="1" />
            <rect x="10" y="10" width="4" height="4" rx="1" />
            <rect x="16" y="10" width="4" height="4" rx="1" />
            <rect x="4" y="16" width="4" height="4" rx="1" />
            <rect x="10" y="16" width="4" height="4" rx="1" />
            <rect x="16" y="16" width="4" height="4" rx="1" />
          </svg>
        </div>

        {/* Vertical Icon Menu List */}
        <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1, width: '100%', alignItems: 'center', overflowY: 'auto', paddingRight: '2px' }}>
          {mainNavItems.map((item) => {
            const isActive = activeMainMenuId === item.id && !isDashboard;

            // Map item to a beautiful, modern, colored SVG icon matching the main dashboard look
            const getAppIcon = (id: string, label: string) => {
              const lowerLabel = label.toLowerCase();
              const lowerId = id.toLowerCase();

              if (lowerId.includes('dashboard') || lowerLabel.includes('dashboard')) {
                return (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isActive ? 'var(--primary)' : '#3b82f6' }}>
                    <rect x="3" y="3" width="7" height="9" rx="1" fill={isActive ? 'rgba(59, 130, 246, 0.15)' : 'none'} />
                    <rect x="14" y="3" width="7" height="5" rx="1" fill={isActive ? 'rgba(59, 130, 246, 0.15)' : 'none'} />
                    <rect x="14" y="12" width="7" height="9" rx="1" fill={isActive ? 'rgba(59, 130, 246, 0.15)' : 'none'} />
                    <rect x="3" y="16" width="7" height="5" rx="1" fill={isActive ? 'rgba(59, 130, 246, 0.15)' : 'none'} />
                  </svg>
                );
              }
              if (lowerId.includes('catalogue') || lowerLabel.includes('catalogue')) {
                return (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isActive ? 'var(--primary)' : '#ec4899' }}>
                    <path d="M12 2L2 7l10 5 10-5-10-5z" fill={isActive ? 'rgba(236, 72, 153, 0.15)' : 'none'} />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                );
              }
              if (lowerId.includes('location') || lowerLabel.includes('location')) {
                return (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isActive ? 'var(--primary)' : '#14b8a6' }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill={isActive ? 'rgba(20, 184, 166, 0.15)' : 'none'} />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                );
              }
              if (lowerId.includes('inventory') || lowerLabel.includes('inventory')) {
                return (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isActive ? 'var(--primary)' : '#6366f1' }}>
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" fill={isActive ? 'rgba(99, 102, 241, 0.15)' : 'none'} />
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                    <line x1="12" y1="22.08" x2="12" y2="12" />
                  </svg>
                );
              }
              if (lowerId.includes('contact') || lowerLabel.includes('contacts')) {
                return (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isActive ? 'var(--primary)' : '#ea580c' }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill={isActive ? 'rgba(234, 88, 12, 0.15)' : 'none'} />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                );
              }

              if (lowerId.includes('sales') || lowerLabel.includes('sales')) {
                return (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isActive ? 'var(--primary)' : '#e11d48' }}>
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" fill={isActive ? 'rgba(225, 29, 72, 0.15)' : 'none'} />
                  </svg>
                );
              }
              if (lowerId.includes('purchase') || lowerLabel.includes('purchase')) {
                return (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isActive ? 'var(--primary)' : '#2563eb' }}>
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" fill={isActive ? 'rgba(37, 99, 235, 0.15)' : 'none'} />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                );
              }
              if (lowerId.includes('account') || lowerLabel.includes('accounts')) {
                return (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isActive ? 'var(--primary)' : '#2563eb' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" fill={isActive ? 'rgba(37, 99, 235, 0.15)' : 'none'} />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                );
              }
              if (lowerId.includes('payment') || lowerLabel.includes('payment')) {
                return (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isActive ? 'var(--primary)' : '#10b981' }}>
                    <rect x="2" y="5" width="20" height="14" rx="2" fill={isActive ? 'rgba(16, 185, 129, 0.15)' : 'none'} />
                    <line x1="2" y1="10" x2="22" y2="10" />
                  </svg>
                );
              }
              if (lowerId.includes('setting') || lowerLabel.includes('setting')) {
                return (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: isActive ? 'var(--primary)' : '#4b5563' }}>
                    <circle cx="12" cy="12" r="3" fill={isActive ? 'rgba(75, 85, 99, 0.15)' : 'none'} />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                );
              }

              // Fallback default icon (e.g. RFQs, Quotations, Requisitions use their original screen SVG icons)
              return item.icon;
            };

            return (
              <div
                key={item.id || item.path}
                onClick={() => handleMainMenuClick(item)}
                style={{
                  cursor: 'pointer',
                  width: '58px',
                  height: '62px',
                  borderRadius: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.2rem',
                  backgroundColor: isActive ? '#eff6ff' : 'transparent',
                  transition: 'all var(--transition-fast)',
                  border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                  padding: '4px 0',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                title={item.label}
              >
                {/* Colored background icon wrapper block matching dashboard */}
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: item.bgGradient || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.iconColor || '#ffffff',
                  boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    transform: 'scale(0.85)',
                    color: '#ffffff',
                  }}>
                    {/* Render raw icon in white since it's on a colored background block */}
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
                  fontSize: '0.62rem',
                  fontWeight: isActive ? 600 : 500,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '54px',
                  textAlign: 'center',
                  lineHeight: 1.1,
                  color: '#4b5563',
                }}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* PWA Update Banner Icon Action */}
        {showUpdateBanner && (
          <div
            onClick={onUpdate}
            style={{
              cursor: 'pointer',
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              backgroundColor: '#3b82f6', // Glowing blue update badge
              boxShadow: '0 0 12px #3b82f6',
              marginBottom: '0.6rem',
              transition: 'all var(--transition-fast)',
              animation: 'pulse-dot 1.5s infinite ease-in-out',
            }}
            title="A new version of Geeksman OS is available! Click to update."
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </div>
        )}

        {/* PWA Install Banner Icon Action */}
        {showInstallBanner && (
          <div
            onClick={onInstall}
            style={{
              cursor: 'pointer',
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              backgroundColor: '#e15b13', // Ubuntu orange highlight style install badge
              boxShadow: '0 0 12px #e15b13',
              marginBottom: '0.6rem',
              transition: 'all var(--transition-fast)',
              animation: 'pulse-dot 2s infinite ease-in-out',
            }}
            title="Install Geeksman OS as an App"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </div>
        )}

        {/* Logout Bottom Icon */}
        <div
          onClick={onLogout}
          style={{
            cursor: 'pointer',
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#4b5563',
            transition: 'all var(--transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef2f2';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#4b5563';
          }}
          title="Logout"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
        </div>
      </aside>



      {/* 3. Main content frame */}
      <div style={{
        marginLeft: mainMarginLeft,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        transition: 'margin-left var(--transition-normal)',
        flexGrow: 1,
        maxWidth: `calc(100vw - ${mainMarginLeft})`,
      }}>
        {/* Top Header containing Search Bar & Profile drop */}
        <header style={{
          height: '50px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          backgroundColor: '#ffffff',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          {/* Left panel placeholder (Logo/Breadcrumb) */}
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            {!isDashboard && isSubNavCollapsed && (
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#111827' }}>
                {subNavTitle}
              </h2>
            )}
          </div>

          {/* Center: Search Bar with inline Dropdown */}
          <div className="desktop-search-container" style={{ display: 'flex', justifyContent: 'center', flex: 1, position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.3rem 0.8rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: '#f9fafb',
                color: '#8e9aa8',
                fontSize: '0.85rem',
                width: '320px',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                <svg
                  style={{ width: '14px', height: '14px', color: '#8e9aa8', flexShrink: 0 }}
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
                  placeholder="Search settings, pages, products..."
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
                    fontSize: '0.85rem',
                    outline: 'none',
                    color: '#111827',
                    padding: 0,
                    width: '100%'
                  }}
                />
              </span>
              {searchQuery ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    setSearchOpen(false);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9ca3af',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              ) : (
                <kbd style={{
                  fontSize: '0.7rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  padding: '0.05rem 0.25rem',
                  borderRadius: '4px',
                  color: '#9ca3af',
                  fontWeight: 500,
                  flexShrink: 0
                }}>Ctrl+K</kbd>
              )}
            </div>

            {/* Inline search dropdown menu (absolute positioned under search input) */}
            {searchOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  marginTop: '8px',
                  width: '450px',
                  maxHeight: '350px',
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: 'var(--shadow-xl)',
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 100,
                  overflow: 'hidden'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                  {filteredSearchItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#6b7280', fontSize: '0.9rem' }}>
                      No results found for "{searchQuery}"
                    </div>
                  ) : (
                    categories.map(category => (
                      <div key={category} style={{ marginBottom: '1rem' }}>
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: 'var(--primary)',
                          marginBottom: '0.4rem',
                          letterSpacing: '0.05em'
                        }}>
                          {category}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          {filteredSearchItems.filter(item => item.category === category).map(item => (
                            <div
                              key={item.id}
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery('');
                                item.action((path) => onNavigate(path));
                              }}
                              style={{
                                padding: '0.6rem 0.75rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'background var(--transition-fast)',
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                                {item.title}
                              </div>
                              {item.description && (
                                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.1rem' }}>
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
            )}
          </div>

          {/* Right Header items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', justifyContent: 'flex-end', flex: 1 }}>
            {/* Premium Network Strength Status Indicator */}
            {localStorage.getItem('disable_network_status') !== 'true' && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.35rem 0.85rem',
                border: '1px solid #e5e7eb',
                borderRadius: '24px',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                whiteSpace: 'nowrap',
                fontFamily: 'Inter, system-ui, sans-serif'
              }} title={`Network Status: ${netInfo.statusText} (${netInfo.speedText})`}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={netInfo.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
                    <path d="M5 12.55a11 11 0 0 1 14 0" />
                    <path d="M9 16.55a6 6 0 0 1 6 0" />
                    <circle cx="12" cy="20" r="1.5" fill={netInfo.color} />
                  </svg>
                  <span style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '-3px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: netInfo.color,
                    animation: 'pulse-dot 1.5s infinite ease-in-out',
                    boxShadow: `0 0 8px ${netInfo.color}`,
                  }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.25 }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: netInfo.color, letterSpacing: '0.05em' }}>
                    {netInfo.statusText}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: '#6b7280', marginTop: '0.05rem' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12h3l3-9 4 18 3-9h5" />
                    </svg>
                    {netInfo.speedText}
                  </span>
                </div>
              </div>
            )}

            {/* Notification Bell */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4b5563',
                  transition: 'all 0.15s ease',
                  outline: 'none',
                  backgroundColor: '#f3f4f6',
                  width: '32px',
                  height: '32px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onClick={onOpenNotifications}
                title={`${unreadCount} Notifications`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {/* Red dot badge */}
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    border: '1.5px solid #ffffff'
                  }} />
                )}
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="profile-menu-container" style={{ position: 'relative' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '8px',
                  transition: 'background var(--transition-fast)',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}>
                  {userEmail ? userEmail[0].toUpperCase() : 'A'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827', lineHeight: 1.2 }}>
                    {userEmail ? userEmail.split('@')[0] : 'Administrator'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>
                    admin
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>▼</span>
              </div>

              {profileMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 100,
                  width: '180px',
                  textAlign: 'left',
                  overflow: 'hidden',
                  padding: '4px'
                }}>
                  <div
                    onClick={() => { setProfileMenuOpen(false); onNavigate('/settings/profile'); }}
                    style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px', color: '#374151' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    👤 My Profile
                  </div>
                  <div
                    onClick={() => { setProfileMenuOpen(false); onNavigate('/settings/workspace'); }}
                    style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px', color: '#374151', borderBottom: '1px solid #e5e7eb' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    ⚙️ Workspace Settings
                  </div>
                  <div
                    onClick={() => { setProfileMenuOpen(false); onLogout(); }}
                    style={{ padding: '0.6rem 0.8rem', fontSize: '0.85rem', cursor: 'pointer', borderRadius: '6px', color: '#ef4444', fontWeight: 600 }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    🚪 Sign Out
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Sticky Tab Bar */}
        {tabs && tabs.length > 0 && localStorage.getItem('disable_tabs') !== 'true' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f1f5f9',
            borderBottom: '1px solid #e2e8f0',
            padding: '0 8px',
            position: 'sticky',
            top: '50px',
            zIndex: 90,
            height: '32px',
            width: '100%',
            boxSizing: 'border-box',
          }}>
            {/* Left Scroll Button */}
            <button
              onClick={() => handleScrollTabs('left')}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.7rem',
                color: '#64748b',
                padding: '0 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
              title="Scroll Tabs Left"
            >
              ◀
            </button>

            {/* Scrollable Tabs Wrapper */}
            <div
              ref={tabsContainerRef}
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '2px',
                flexGrow: 1,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                height: '100%',
              }}
            >
              <style dangerouslySetInnerHTML={{__html: `
                div::-webkit-scrollbar {
                  display: none;
                }
              `}} />
            {(() => {
              const getTabColor = (path: string, isActive: boolean) => {
                const p = path.toLowerCase();
                if (p.includes('catalogue') || p.includes('products') || p.includes('variants') || p.includes('categories') || p.includes('groups') || p.includes('brands') || p.includes('hsn')) {
                  return isActive 
                    ? { bg: 'linear-gradient(to bottom, #fdf2f8, #fce7f3)', text: '#be185d', borderTop: '3px solid #db2777' }
                    : { bg: '#fbcfe8', text: '#9d174d', borderTop: '3px solid transparent' };
                }
                if (p.includes('inventory') || p.includes('items') || p.includes('locations')) {
                  return isActive 
                    ? { bg: 'linear-gradient(to bottom, #faf5ff, #f3e8ff)', text: '#6d28d9', borderTop: '3px solid #7c3aed' }
                    : { bg: '#e9d5ff', text: '#5b21b6', borderTop: '3px solid transparent' };
                }
                if (p.includes('crm') || p.includes('leads')) {
                  return isActive 
                    ? { bg: 'linear-gradient(to bottom, #f0fdf4, #dcfce7)', text: '#15803d', borderTop: '3px solid #16a34a' }
                    : { bg: '#bbf7d0', text: '#166534', borderTop: '3px solid transparent' };
                }
                if (p.includes('sales')) {
                  return isActive 
                    ? { bg: 'linear-gradient(to bottom, #fff1f2, #ffe4e6)', text: '#be123c', borderTop: '3px solid #e11d48' }
                    : { bg: '#fecdd3', text: '#9f1239', borderTop: '3px solid transparent' };
                }
                if (p.includes('contact')) {
                  return isActive 
                    ? { bg: 'linear-gradient(to bottom, #fff7ed, #ffedd5)', text: '#c2410c', borderTop: '3px solid #ea580c' }
                    : { bg: '#fed7aa', text: '#9a3412', borderTop: '3px solid transparent' };
                }
                if (p.includes('location')) {
                  return isActive 
                    ? { bg: 'linear-gradient(to bottom, #f0fdfa, #ccfbf1)', text: '#0f766e', borderTop: '3px solid #0d9488' }
                    : { bg: '#99f6e4', text: '#115e59', borderTop: '3px solid transparent' };
                }
                return isActive 
                  ? { bg: 'linear-gradient(to bottom, #eff6ff, #dbeafe)', text: '#1d4ed8', borderTop: '3px solid #2563eb' }
                  : { bg: '#bfdbfe', text: '#1e40af', borderTop: '3px solid transparent' };
              };



              return tabs.map((tab: any, idx: number) => {
                const isActive = tab.path === activeTabPath;
                const theme = getTabColor(tab.path, isActive);
                return (
                  <div
                    key={`${tab.path}-${idx}`}
                    onClick={() => onSelectTab(tab.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0 12px',
                      height: '28px',
                      borderTop: theme.borderTop,
                      borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '6px 6px 0 0',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 500,
                      color: theme.text,
                      background: theme.bg,
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                      marginBottom: '-1px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.filter = 'brightness(0.95)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.filter = 'none';
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getTabIcon(tab.path)}
                    </span>
                    <span>{tab.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onCloseTab(tab.path);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      onMouseUp={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      style={{
                        border: 'none',
                        background: 'none',
                        color: theme.text,
                        opacity: 0.7,
                        fontSize: '11px',
                        cursor: 'pointer',
                        width: '20px',
                        height: '20px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        flexShrink: 0,
                        padding: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              });
            })()}
            </div>

            {/* Right Scroll Button */}
            <button
              onClick={() => handleScrollTabs('right')}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.7rem',
                color: '#64748b',
                padding: '0 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
              title="Scroll Tabs Right"
            >
              ▶
            </button>

            {/* Tab Search Toggle Button */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%' }}>
              <button
                onClick={() => setTabSearchOpen(!tabSearchOpen)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: '#64748b',
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                }}
                title="Search Tabs"
              >
                ▼
              </button>
              
              {tabSearchOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  zIndex: 200,
                  width: '320px',
                  padding: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
                onMouseLeave={() => setTabSearchOpen(false)}
                >
                  <input
                    type="text"
                    placeholder="Search tabs..."
                    value={tabSearchQuery}
                    onChange={(e) => setTabSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                    autoFocus
                  />
                  <div style={{
                    maxHeight: '240px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px',
                  }}>
                    {tabs
                      .filter((tab: any) => tab.title.toLowerCase().includes(tabSearchQuery.toLowerCase()))
                      .map((tab: any, idx: number) => {
                        return (
                          <div
                            key={`${tab.path}-${idx}`}
                            onClick={() => {
                              onSelectTab(tab.path);
                              setTabSearchOpen(false);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              backgroundColor: tab.path === activeTabPath ? '#f1f5f9' : 'transparent',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (tab.path !== activeTabPath) e.currentTarget.style.backgroundColor = '#f8fafc';
                            }}
                            onMouseLeave={(e) => {
                              if (tab.path !== activeTabPath) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                              <span style={{ display: 'inline-flex', flexShrink: 0 }}>
                                {getTabIcon(tab.path)}
                              </span>
                              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {tab.title}
                                </span>
                                <span style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {tab.path}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onCloseTab(tab.path);
                              }}
                              style={{
                                border: 'none',
                                background: 'none',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '10px',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '50%',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fee2e2';
                                e.currentTarget.style.color = '#ef4444';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#94a3b8';
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Horizontal Module Sub-Navigation Bar */}
        {!isDashboard && extendedNavItems.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            margin: '8px 1.25rem 0 1.25rem',
            padding: '0 8px',
            height: '38px',
            boxSizing: 'border-box',
            zIndex: 89,
            position: 'relative',
          }}>
            {/* Left Scroll button */}
            <button
              onClick={() => handleScrollSubnav('left')}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: '#64748b',
                padding: '0 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
              title="Scroll Left"
            >
              ◀
            </button>

            {/* Scrollable container */}
            <div 
              ref={scrollContainerRef}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.2rem',
                flexGrow: 1,
                overflowX: 'auto',
                scrollbarWidth: 'none',
                height: '100%',
              }}
            >
              <style dangerouslySetInnerHTML={{__html: `
                div::-webkit-scrollbar {
                  display: none;
                }
              `}} />

              {extendedNavItems.map((item: any) => {
                const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
                return (
                  <div
                    key={item.id}
                    onClick={() => onNavigate(item.path)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      height: '100%',
                      borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? '#1e293b' : '#64748b',
                      padding: '0 2px',
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.color = '#1e293b';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.color = '#64748b';
                    }}
                  >
                    {item.icon && (
                      <span style={{ display: 'inline-flex', opacity: isActive ? 0.9 : 0.6, transform: 'scale(0.85)' }}>
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Right Scroll button */}
            <button
              onClick={() => handleScrollSubnav('right')}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                color: '#64748b',
                padding: '0 6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
              title="Scroll Right"
            >
              ▶
            </button>
          </div>
        )}

        {/* Content body wrapper */}
        <main style={{
          padding: isDashboard ? '0' : '0.75rem 1.25rem',
          flex: 1,
          boxSizing: 'border-box',
          width: '100%',
          position: 'relative',
        }}>
          {isDashboard ? (
            <AppsDashboard navItems={mainNavItems} onNavigate={onNavigate} />
          ) : (
            <div style={{ width: '100%', height: '100%' }}>
              {tabs.map((tab: any, idx: number) => (
                <div
                  key={`${tab.path}-${idx}`}
                  style={{
                    display: tab.path === activeTabPath ? 'block' : 'none',
                    width: '100%',
                    height: '100%',
                  }}
                >
                  <TabContentWrapper tab={tab} isActive={tab.path === activeTabPath} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        activePath={currentPath}
        onNavigate={onNavigate}
      />
    </div>
  );
};
