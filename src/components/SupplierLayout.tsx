import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Package, Menu, X, LogOut } from 'lucide-react';
import { useMediaQuery } from '@geeksman/core-ui';

export const SupplierLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userName, setUserName] = useState('Supplier User');

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        setUserName(u.display_name || u.first_name || 'Supplier User');
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: <Home size={18} />,
    },
    {
      id: 'products',
      label: 'Products Catalogue',
      path: '/products',
      icon: <Package size={18} />,
    },
  ];

  // Inline styles for high-fidelity Vanilla CSS LIGHT theme
  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
      backgroundColor: '#f8fafc', // slate-50 light background
      color: '#1e293b', // dark slate text
      overflow: 'hidden',
      fontFamily: '"Outfit", "Inter", sans-serif',
    },
    sidebar: {
      width: isDesktop ? (sidebarOpen ? '260px' : '72px') : (sidebarOpen ? '260px' : '0px'),
      position: isDesktop ? 'static' as const : 'fixed' as const,
      top: 0,
      bottom: 0,
      left: 0,
      zIndex: 100,
      backgroundColor: '#ffffff', // pure white sidebar
      borderRight: '1px solid #e2e8f0', // light grey border
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'space-between',
      overflow: 'hidden',
    },
    logoContainer: {
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1rem',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
    },
    logoWrapper: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    logoImg: {
      height: '32px',
      maxWidth: '120px',
      objectFit: 'contain' as const,
      filter: 'invert(1)', // invert logo for white background if needed
    },
    logoText: {
      fontSize: '0.75rem',
      fontWeight: 800,
      letterSpacing: '0.05em',
      color: '#2563eb', // blue accent
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      display: isDesktop ? 'none' : 'block',
    },
    nav: {
      padding: '1rem 0.75rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
    },
    navItem: (isActive: boolean) => ({
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 14px',
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontWeight: 500,
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left' as const,
      transition: 'all 0.2s ease',
      backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
      color: isActive ? '#2563eb' : '#64748b',
    }),
    sidebarFooter: {
      padding: '1rem',
      borderTop: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc',
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '1rem',
      padding: '0 4px',
    },
    avatar: {
      height: '36px',
      width: '36px',
      borderRadius: '50%',
      backgroundColor: '#e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#334155',
      fontWeight: 'bold',
      border: '1px solid #cbd5e1',
    },
    userInfo: {
      flex: 1,
      minWidth: 0,
    },
    userName: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: '#334155',
      margin: 0,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    userRole: {
      fontSize: '0.75rem',
      color: '#64748b',
      margin: 0,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    logoutBtn: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 14px',
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#ef4444',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left' as const,
      transition: 'all 0.2s ease',
    },
    mainContent: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
    header: {
      height: '64px',
      borderBottom: '1px solid #e2e8f0',
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      zIndex: 50,
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    menuBtn: {
      background: 'none',
      border: 'none',
      color: '#64748b',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      padding: '4px',
    },
    headerTitle: {
      fontSize: '1rem',
      fontWeight: 700,
      color: '#334155',
      margin: 0,
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
    },
    statusBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#f1f5f9',
      border: '1px solid #e2e8f0',
      padding: '6px 12px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
    },
    statusDot: {
      height: '8px',
      width: '8px',
      borderRadius: '50%',
      backgroundColor: '#10b981',
    },
    contentArea: {
      flex: 1,
      overflowY: 'auto' as const,
      backgroundColor: '#f8fafc',
      padding: '1.5rem',
    },
  };

  return (
    <div style={styles.container}>
      {/* Sidebar navigation */}
      <div style={styles.sidebar}>
        <div>
          <div style={styles.logoContainer}>
            <div style={styles.logoWrapper}>
              <img src="/geeksman-side-logo.png" alt="Geeksman Logo" style={styles.logoImg} />
              {(sidebarOpen || !isDesktop) && <span style={styles.logoText}>SUPPLIER</span>}
            </div>
            {!isDesktop && (
              <button onClick={() => setSidebarOpen(false)} style={styles.closeBtn}>
                <X size={20} />
              </button>
            )}
          </div>

          <nav style={styles.nav}>
            {navItems.map((item) => {
              const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    if (!isDesktop) setSidebarOpen(false);
                  }}
                  style={styles.navItem(isActive)}
                >
                  <span>{item.icon}</span>
                  {(sidebarOpen || !isDesktop) && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        <div style={styles.sidebarFooter}>
          {(sidebarOpen || !isDesktop) && (
            <div style={styles.userSection}>
              <div style={styles.avatar}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <div style={styles.userInfo}>
                <p style={styles.userName}>{userName}</p>
                <p style={styles.userRole}>Supplier Rep</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <LogOut size={18} />
            {(sidebarOpen || !isDesktop) && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main content viewport */}
      <div style={styles.mainContent}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn}>
              <Menu size={20} />
            </button>
            <h2 style={styles.headerTitle}>Supplier Management Center</h2>
          </div>

          <div style={styles.headerRight}>
            <div style={styles.statusBadge}>
              <span style={styles.statusDot}></span>
              <span style={{ color: '#64748b' }}>Supplier Portal Online</span>
            </div>
          </div>
        </header>

        <main style={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
};
