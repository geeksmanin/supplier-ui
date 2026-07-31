import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid,
  Heart,
  ClipboardList,
  ShoppingCart,
  Activity,
  FileText,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Search,
  Wifi,
  X,
  Ticket,
  Bell,
  Home,
  Award
} from 'lucide-react';
import BottomNav from './BottomNav/BottomNav';
import { useMediaQuery, AboutApp, apiClient, useToast } from '@geeksman/core-ui';
import { getAppConfig } from '../config';
import {
  NotificationProvider,
  NotificationDrawer,
  NotificationToastContainer,
  useNotification,
} from '@geeksman/notification';

// ─── inner component that reads from NotificationContext ─────────────────────
const CustomerLayoutInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { showToast } = useToast();

  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userName, setUserName] = useState('MR. YUVARAJAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearchSubmit = async () => {
    if (currentPath === '/catalog') {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
      window.dispatchEvent(new CustomEvent('customer-catalog-search', { detail: searchQuery }));
      return;
    }

    if (!searchQuery.trim()) {
      navigate('/catalog?search=');
      window.dispatchEvent(new CustomEvent('customer-catalog-search', { detail: '' }));
      return;
    }

    try {
      const activeCustId = localStorage.getItem('active_customer_id');
      const res = await apiClient.get('/catalogue/products', {
        params: {
          search: searchQuery,
          limit: 1,
          customer_id: activeCustId || undefined
        }
      });
      const products = res.data?.data || res.data || [];
      if (products.length > 0) {
        navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
        window.dispatchEvent(new CustomEvent('customer-catalog-search', { detail: searchQuery }));
      } else {
        showToast('No products found matching your search.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error searching catalogue.', 'error');
    }
  };

  // Badge counts
  const [wishlistCount, setWishlistCount] = useState(0);
  const [enquiryCount, setEnquiryCount] = useState(0);
  const [enquiryTotal, setEnquiryTotal] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hideBottomNav, setHideBottomNav] = useState(() => {
    const hash = window.location.hash;
    return hash.startsWith('#/tickets') && (hash.includes('id=') || hash.includes('ticketId='));
  });
  const [appVersion, setAppVersion] = useState('v1.0.2');
  const [cacheId, setCacheId] = useState('erp-customer-v1.0.2');

  // Close notification drawer on page transition (route change)
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    fetch('/sw.js')
      .then(res => res.text())
      .then(text => {
        const match = text.match(/const CACHE_NAME = ['"]([^'"]+)['"]/);
        if (match && match[1]) {
          const cid = match[1];
          setCacheId(cid);
          const verMatch = cid.match(/v\d+\.\d+\.\d+/);
          if (verMatch) {
            setAppVersion(verMatch[0]);
          } else {
            setAppVersion(cid);
          }
        }
      })
      .catch(err => console.error("Failed to parse version from sw.js:", err));
  }, []);

  useEffect(() => {
    const handleHideNav = (e: Event) => {
      setHideBottomNav((e as CustomEvent).detail);
    };
    const handleOpenProfile = () => {
      setShowProfileModal(true);
    };
    const handleOpenNotifications = () => {
      setDrawerOpen(true);
    };
    window.addEventListener('customer-hide-bottom-nav', handleHideNav);
    window.addEventListener('customer-open-profile', handleOpenProfile);
    window.addEventListener('customer-open-notifications', handleOpenNotifications);
    return () => {
      window.removeEventListener('customer-hide-bottom-nav', handleHideNav);
      window.removeEventListener('customer-open-profile', handleOpenProfile);
      window.removeEventListener('customer-open-notifications', handleOpenNotifications);
    };
  }, []);

  const handleNotificationNavigate = (link: string) => {
    setDrawerOpen(false);
    let path = link;
    if (link.startsWith('http://') || link.startsWith('https://')) {
      try {
        const url = new URL(link);
        path = url.pathname + url.search + url.hash;
      } catch (e) {
        console.error(e);
      }
    }
    if (path.startsWith('/#')) {
      path = path.substring(2);
    } else if (path.startsWith('#')) {
      path = path.substring(1);
    }

    if (!path.startsWith('/')) {
      path = '/' + path;
    }

    if (path.includes('/tickets/')) {
      const parts = path.split('/tickets/');
      const id = parts[parts.length - 1];
      path = '/tickets?ticketId=' + id;
    } else if (path.includes('/orders/')) {
      const parts = path.split('/orders/');
      const id = parts[parts.length - 1];
      path = '/orders?orderId=' + id;
    } else if (path.includes('/enquiries/')) {
      const parts = path.split('/enquiries/');
      const id = parts[parts.length - 1];
      path = '/enquiries?enquiryId=' + id;
    }

    window.location.href = window.location.origin + '/#' + path;
  };

  // Notification context
  const { unreadCount, markAllAsRead, unsubscribePush } = useNotification();


  // Play synthesized notification sound
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;

      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now); // A5
      osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.25);

      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1200, now + 0.08); // D6
      gain2.gain.setValueAtTime(0.1, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.3);
    } catch (e) {
      console.error('Failed to play synthesized notification sound:', e);
    }
  };

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const notif = (e as CustomEvent).detail;
      if (notif?.type === 'silent_sync') {
        return;
      }
      playNotificationSound();
    };
    window.addEventListener('notification_received', handleNotification);
    return () => {
      window.removeEventListener('notification_received', handleNotification);
    };
  }, []);

  const updateCounts = () => {
    try {
      const wishlist = JSON.parse(localStorage.getItem('customer_wishlist') || '[]');
      setWishlistCount(wishlist.length);

      const enquiryCart = JSON.parse(localStorage.getItem('customer_enquiry_cart') || '[]');
      setEnquiryCount(enquiryCart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0));
      setEnquiryTotal(enquiryCart.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.price || 0)), 0));

      const orderCart = JSON.parse(localStorage.getItem('customer_order_cart') || '[]');
      setOrderCount(orderCart.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0));
      setOrderTotal(orderCart.reduce((sum: number, item: any) => sum + ((item.quantity || 0) * (item.price || 0)), 0));
    } catch (e) {
      console.error('Failed to parse storage counts:', e);
    }
  };

  useEffect(() => {
    updateCounts();
    window.addEventListener('customer-cart-update', updateCounts);
    return () => window.removeEventListener('customer-cart-update', updateCounts);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.user_alias) {
          setUserName(payload.user_alias);
        } else if (payload.username) {
          setUserName(payload.username);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const confirmLogout = async () => {
    try {
      await unsubscribePush();
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const navLinks = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/catalog', label: 'Catalogue', icon: Grid },
    { path: '/wishlist', label: 'Wishlist', icon: Heart },
    { path: '/enquiry-cart', label: 'Enquiry Cart', icon: ClipboardList },
    { path: '/enquiries', label: 'Enquiries List', icon: FileText },
    { path: '/order-cart', label: 'Order Cart', icon: ShoppingCart },
    { path: '/orders', label: 'Orders List', icon: Activity },
    { path: '/subscriptions', label: 'Subscriptions', icon: Award },
    { path: '/invoices', label: 'Billing & Invoices', icon: FileText },
    { path: '/tickets', label: 'Support Tickets', icon: Ticket },
  ];

  return (
    <div
      className="app-container"
      style={{
        ...styles.appContainer,
        paddingBottom: currentPath.startsWith('/tickets') ? '0' : undefined
      }}
    >
      {(currentPath.startsWith('/tickets') || currentPath === '/order-cart' || currentPath === '/enquiry-cart') && (
        <style>{`
          @media (max-width: 1024px) {
            main {
              height: ${currentPath.startsWith('/tickets') ? '100dvh' : 'calc(100dvh - 76px)'} !important;
              overflow: hidden !important;
            }
          }
        `}</style>
      )}
      {/* Top Header */}
      {isDesktop && (
        <header style={styles.header}>
          {/* Branding/Logo */}
          <div onClick={() => navigate('/home')} style={styles.logoSection}>
            <img src={localStorage.getItem('branding_logo') || "/geeksman_logo.png"} alt="Logo" style={styles.logoImg} />
            <div style={styles.logoTextContainer}>
              <span style={styles.logoTitle}>{localStorage.getItem('branding_name')?.toUpperCase() || "GEEKSMAN"}</span>
            </div>
          </div>

          {/* Global Search Bar */}
          {isDesktop && (
            <div style={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search catalog for products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (currentPath === '/catalog') {
                    window.dispatchEvent(new CustomEvent('customer-catalog-search', { detail: e.target.value }));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit();
                  }
                }}
                style={styles.searchInput}
              />
              {searchQuery && (
                <X
                  size={18}
                  onClick={() => {
                    setSearchQuery('');
                    navigate('/catalog?search=');
                    window.dispatchEvent(new CustomEvent('customer-catalog-search', { detail: '' }));
                  }}
                  style={styles.clearSearchIcon}
                />
              )}
              <button
                onClick={handleSearchSubmit}
                style={styles.searchButton}
              >
                <Search size={18} strokeWidth={3} />
              </button>
            </div>
          )}

          {/* Header Right Actions */}
          <div style={styles.headerRight}>
            {isDesktop && (
              <div style={styles.statusBadge}>
                <Wifi size={14} color="#10b981" />
                <span>OPTIMAL 10+ Mbps</span>
              </div>
            )}

            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: 'rgba(26, 86, 219, 0.08)' }}
              whileTap={{ scale: 0.98 }}
              style={{
                ...styles.profileSection,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onClick={() => setShowProfileModal(true)}
            >
              <div style={styles.avatar}>
                <User size={18} />
              </div>
              {isDesktop && (
                <div style={styles.profileText}>
                  <span style={styles.greeting}>Hi,</span>
                  <span style={styles.name}>{userName}</span>
                </div>
              )}
            </motion.div>

            {/* Icon Badges */}
            {isDesktop && (
              <div style={styles.badgeRow}>
                {/* Notification Bell */}
                <div
                  id="desktop-notification-bell"
                  onClick={() => setDrawerOpen(true)}
                  style={styles.notificationBellButton}
                  title="Notifications"
                >
                  <motion.div
                    animate={unreadCount > 0 ? { rotate: [0, -10, 10, -8, 8, 0] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
                  >
                    <Bell size={20} color={unreadCount > 0 ? '#f43f5e' : '#64748b'} />
                  </motion.div>
                  {unreadCount > 0 && (
                    <span style={{ ...styles.badge, backgroundColor: '#f43f5e', top: '-5px', right: '-5px' }}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>

                {/* Wishlist */}
                <div onClick={() => navigate('/wishlist')} style={styles.badgeButton} title="Wishlist">
                  <Heart size={20} color="#ef4444" fill={wishlistCount > 0 ? "#ef4444" : "none"} />
                  {wishlistCount > 0 && <span style={{ ...styles.badge, backgroundColor: '#ef4444' }}>{wishlistCount}</span>}
                </div>

                {/* Enquiry Cart */}
                <div onClick={() => navigate('/enquiry-cart')} style={styles.enquiryCartButton} title="Enquiry Cart">
                  <ClipboardList size={20} color="#10b981" />
                  {enquiryCount > 0 && <span style={{ ...styles.badge, backgroundColor: '#10b981' }}>{enquiryCount}</span>}
                  <span style={styles.cartTotalText}>₹{enquiryTotal.toFixed(0)}</span>
                </div>

                {/* Shopping Cart (Order Cart) */}
                <div onClick={() => navigate('/order-cart')} style={styles.orderCartButton} title="Order Cart">
                  <ShoppingCart size={20} color="#1a56db" />
                  {orderCount > 0 && <span style={{ ...styles.badge, backgroundColor: '#1a56db' }}>{orderCount}</span>}
                  <span style={styles.cartTotalText}>₹{orderTotal.toFixed(0)}</span>
                </div>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Mobile Top Header */}
      {!isDesktop && currentPath !== '/home' && currentPath !== '/login' && !hideBottomNav && (
        <div style={styles.mobileHeader}>
          <button
            onClick={() => navigate('/home')}
            style={styles.mobileHomeBtn}
            title="Go to Home"
          >
            <Home size={20} />
          </button>
          <span style={styles.mobileHeaderTitle}>
            {(() => {
              if (currentPath === '/catalog') return 'Catalogue';
              if (currentPath === '/wishlist') return 'My Wishlist';
              if (currentPath === '/enquiry-cart') return 'Enquiry Cart';
              if (currentPath === '/orders') return 'My Orders';
              if (currentPath === '/order-cart') return 'Order Cart';
              if (currentPath === '/tickets') return 'Support Center';
              if (currentPath === '/invoices') return 'My Invoices';
              if (currentPath === '/enquiries') return 'My Enquiries';
              if (currentPath === '/quotations') return 'My Quotations';
              if (currentPath === '/subscriptions' || currentPath === '/licenses') return 'Subscriptions';
              return 'GEEKSMAN';
            })()}
          </span>
          <button
            onClick={() => {
              setDrawerOpen(true);
              markAllAsRead().catch((err) => console.error(err));
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem',
              position: 'relative',
              width: '40px',
              height: '40px'
            }}
            title="Notifications"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.625rem',
                fontWeight: 900,
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #0b2240',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main Body */}
      <div style={{ ...styles.body, marginTop: isDesktop ? '74px' : '0' }}>
        {/* Collapsing Left Sidebar */}
        {isDesktop && (
          <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 76 : 240 }}
            style={styles.sidebar}
          >
            {/* Collapse Arrow Button */}
            <button onClick={() => setIsCollapsed(!isCollapsed)} style={styles.toggleBtn}>
              {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>

            <nav style={styles.nav}>
              {navLinks.filter(link => link.path !== '/home').map((link) => {
                const isActive = currentPath === link.path;
                const LinkIcon = link.icon;

                const activeColor =
                  link.path === '/kit' ? '#f59e0b' :
                    link.path === '/wishlist' ? '#ef4444' : '#1a56db';
                const activeBg =
                  link.path === '/kit' ? 'rgba(245, 158, 11, 0.08)' :
                    link.path === '/wishlist' ? 'rgba(239, 68, 68, 0.08)' :
                      'rgba(26, 86, 219, 0.08)';

                return (
                  <div
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    style={{
                      ...styles.navItem,
                      backgroundColor: isActive ? activeBg : 'transparent',
                      color: isActive ? activeColor : '#1f2937',
                      fontWeight: isActive ? 700 : 500,
                    }}
                  >
                    <div style={styles.navIconContainer}>
                      <LinkIcon
                        size={20}
                        color={link.path === '/wishlist' ? '#ef4444' : (isActive ? activeColor : '#64748b')}
                        fill={isActive && (link.path === '/wishlist' || link.path === '/kit') ? activeColor : 'none'}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>
                    {!isCollapsed && <span style={styles.navLabel}>{link.label}</span>}
                  </div>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div style={styles.sidebarFooter}>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                <div style={styles.logoutIconContainer}>
                  <LogOut size={20} style={{ transform: 'rotate(180deg)' }} />
                </div>
                {!isCollapsed && <span style={styles.logoutLabel}>Logout</span>}
              </button>

              {/* Branding */}
              {!isCollapsed && (
                <div style={styles.branding}>
                  <span style={styles.poweredBy}>Powered by</span>
                  <div style={styles.geeksmanBrand}>
                    <span style={styles.brandText}>GEEKSMAN</span>
                    <span style={styles.versionBadge}>{appVersion}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}

        {/* Content View */}
        <main style={{
          ...styles.mainContent,
          marginLeft: !isDesktop ? '0' : (isCollapsed ? '76px' : '240px'),
          paddingTop: (!isDesktop && currentPath !== '/home' && currentPath !== '/login' && !hideBottomNav) ? '3.5rem' : '0',
          paddingBottom: (!isDesktop && !hideBottomNav && !currentPath.startsWith('/tickets') && currentPath !== '/order-cart' && currentPath !== '/enquiry-cart') ? '80px' : '0'
        }}>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navbar */}
      {!hideBottomNav && currentPath !== '/home' && !currentPath.startsWith('/tickets') && (
        <BottomNav
          currentPath={currentPath}
          showProfileModal={showProfileModal}
          setShowProfileModal={(val) => {
            if (val) setDrawerOpen(false);
            setShowProfileModal(val);
          }}
          navigate={(path) => {
            setDrawerOpen(false);
            navigate(path);
          }}
          wishlistCount={wishlistCount}
          enquiryCount={enquiryCount}
          orderCount={orderCount}
          notificationCount={unreadCount}
          onNotificationClick={() => setDrawerOpen(true)}
        />
      )}

      {/* Notification Drawer (desktop flyout / mobile full-screen) */}
      <NotificationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onNavigate={handleNotificationNavigate}
      />

      {/* In-app toast notifications */}
      <NotificationToastContainer onNavigate={handleNotificationNavigate} />

      {/* Profile Modal Overlay */}
      <AnimatePresence>
        {showProfileModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileModal(false)}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ position: 'relative', background: '#fff', width: '100%', maxWidth: '360px', borderRadius: '24px', padding: '2rem', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.15)' }}
            >
              <button
                onClick={() => setShowProfileModal(false)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.25rem' }}
              >
                <X size={20} />
              </button>

              <div style={{ width: '64px', height: '64px', background: 'rgba(26, 86, 219, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#1a56db' }}>
                <User size={32} />
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem', textTransform: 'uppercase' }}>{userName}</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem' }}>Customer Portal Session</p>

              {/* About App Info Section */}
              <AboutApp
                version={appVersion}
                cacheId={cacheId}
                style={{ marginBottom: '1.5rem' }}
              />

              <button
                onClick={() => {
                  setShowProfileModal(false);
                  handleLogout();
                }}
                style={{ width: '100%', padding: '0.85rem', borderRadius: '14px', border: 'none', background: '#ef4444', fontWeight: 800, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLogoutModal(false)}
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              style={{
                position: 'relative',
                background: '#fff',
                width: '100%',
                maxWidth: '400px',
                borderRadius: '24px',
                padding: '2.5rem 2rem 2rem',
                textAlign: 'center',
                boxShadow: '0 20px 50px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(15, 23, 42, 0.05)',
                overflow: 'hidden'
              }}
            >
              {/* Top accent line */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '6px', background: 'linear-gradient(90deg, #ef4444, #f43f5e)' }} />

              <button
                onClick={() => setShowLogoutModal(false)}
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                <X size={18} />
              </button>

              <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #fef2f2, #ffe4e6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#ef4444', boxShadow: '0 8px 16px rgba(239, 68, 68, 0.1)' }}>
                <LogOut size={28} />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', fontFamily: '"Outfit", sans-serif' }}>Sure to Logout?</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.5, marginBottom: '2rem', padding: '0 0.5rem' }}>
                Are you sure you want to end your session? Any unsaved changes will be lost.
              </p>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    background: '#fff',
                    fontWeight: 700,
                    color: '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.95rem'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  style={{
                    flex: 1,
                    padding: '0.85rem',
                    borderRadius: '14px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    fontWeight: 700,
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)'; e.currentTarget.style.transform = 'none'; }}
                >
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── outer component: resolves auth credentials and mounts provider ──────────
export const CustomerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = getAppConfig();

  const [userId, setUserId] = useState('');
  const [tenantCode, setTenantCode] = useState(config.defaultTenant ?? 'platform');
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const raw = localStorage.getItem('token');
    if (raw) {
      setToken(raw);
      try {
        const payload = JSON.parse(atob(raw.split('.')[1]));
        // Prefer explicit user_id claim, fall back to sub or username
        const uid = payload.user_id || payload.sub || payload.username || '';
        setUserId(String(uid));
        if (payload.tenant_code) {
          setTenantCode(payload.tenant_code);
        }
      } catch (e) {
        console.error('Failed to decode JWT for NotificationProvider:', e);
      }
    }
  }, []);

  const getNotificationBaseUrl = () => {
    if (typeof window !== 'undefined' && (window as any).runtimeConfig) {
      const rtConfig = (window as any).runtimeConfig;
      if (rtConfig.notificationApiBaseUrl) {
        return `${rtConfig.notificationApiBaseUrl.replace(/\/$/, '')}/api/v1`;
      }
      if (rtConfig.apiBaseUrl) {
        return rtConfig.apiBaseUrl;
      }
    }
    return config.notificationApiBaseUrl
      ? `${config.notificationApiBaseUrl.replace(/\/$/, '')}/api/v1`
      : config.apiBaseUrl;
  };

  const baseUrl = getNotificationBaseUrl();

  // Don't mount provider until we have a userId (avoids empty SSE connections)
  if (!userId) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontSize: '1rem', color: '#64748b', fontWeight: 600 }}>Loading workspace...</div>;
  }

  return (
    <NotificationProvider
      baseUrl={baseUrl}
      userId={userId}
      tenantCode={tenantCode}
      token={token}
    >
      <CustomerLayoutInner>{children}</CustomerLayoutInner>
    </NotificationProvider>
  );
};

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '"Outfit", "Inter", sans-serif',
  },
  header: {
    height: '74px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    boxSizing: 'border-box',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  logoImg: {
    height: '40px',
  },
  logoTextContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  logoTitle: {
    fontSize: '18px',
    fontWeight: 800,
    color: '#1a56db',
    letterSpacing: '-0.02em',
    lineHeight: 1,
  },
  logoSubtitle: {
    color: '#10b981',
    fontSize: '15px',
    fontWeight: 800,
    letterSpacing: '0.05em',
  },
  searchContainer: {
    display: 'flex',
    height: '42px',
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e2e8f0',
    width: '100%',
    maxWidth: '450px',
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '0 3rem 0 1rem',
    fontSize: '0.9rem',
    backgroundColor: 'transparent',
    fontWeight: 600,
    color: '#1e293b',
  },
  clearSearchIcon: {
    position: 'absolute',
    right: '60px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#94a3b8',
  },
  searchButton: {
    backgroundColor: '#1a56db',
    border: 'none',
    width: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    cursor: 'pointer',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.25rem',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.6rem',
    borderRadius: '8px',
    backgroundColor: '#ecfdf5',
    color: '#10b981',
    fontSize: '0.75rem',
    fontWeight: 700,
    border: '1px solid #a7f3d0',
  },
  profileSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.4rem 0.6rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(26, 86, 219, 0.05)',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '6px',
    backgroundColor: '#1a56db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
  },
  profileText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: '0.7rem',
    color: '#64748b',
  },
  name: {
    fontSize: '0.8rem',
    fontWeight: 800,
    color: '#1e293b',
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  notificationBellButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    cursor: 'pointer',
    width: '38px',
    height: '38px',
  },
  badgeButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    padding: '0.5rem',
    borderRadius: '8px',
    border: '1px solid rgba(148, 163, 184, 0.1)',
    cursor: 'pointer',
    width: '38px',
    height: '38px',
  },
  enquiryCartButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0fdf4',
    padding: '0.5rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #dcfce7',
    cursor: 'pointer',
    height: '38px',
    gap: '0.5rem',
  },
  orderCartButton: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    padding: '0.5rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #dbeafe',
    cursor: 'pointer',
    height: '38px',
    gap: '0.5rem',
  },
  cartTotalText: {
    fontSize: '0.85rem',
    fontWeight: 800,
    color: '#111827',
  },
  badge: {
    position: 'absolute',
    top: '-6px',
    right: '-6px',
    backgroundColor: '#1a56db',
    color: '#ffffff',
    fontSize: '0.65rem',
    fontWeight: 900,
    minWidth: '16px',
    height: '16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #ffffff',
  },
  body: {
    display: 'flex',
    flex: 1,
    marginTop: '74px',
  },
  sidebar: {
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: '74px',
    bottom: 0,
    left: 0,
    zIndex: 90,
    overflow: 'visible',
  },
  toggleBtn: {
    position: 'absolute',
    right: '-12px',
    top: '20px',
    width: '24px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    zIndex: 101,
    color: '#1a56db',
  },
  nav: {
    padding: '1rem 0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    gap: '0.75rem',
    transition: 'all 0.2s',
  },
  navIconContainer: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  navLabel: {
    fontSize: '0.85rem',
    whiteSpace: 'nowrap',
  },
  sidebarFooter: {
    marginTop: 'auto',
    padding: '1rem 0.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  logoutBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 0.75rem',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
    border: '1px solid #fee2e2',
    fontWeight: 700,
    gap: '0.75rem',
  },
  logoutIconContainer: {
    width: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoutLabel: {
    fontSize: '0.85rem',
  },
  branding: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.2rem',
    paddingTop: '0.5rem',
    borderTop: '1px solid #e2e8f0',
  },
  poweredBy: {
    fontSize: '0.65rem',
    color: '#64748b',
    fontWeight: 700,
  },
  geeksmanBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },
  brandText: {
    fontSize: '0.75rem',
    color: '#1e293b',
    fontWeight: 800,
    letterSpacing: '0.02em',
  },
  versionBadge: {
    fontSize: '0.55rem',
    color: '#64748b',
    fontWeight: 800,
    backgroundColor: '#f1f5f9',
    padding: '0.15rem 0.4rem',
    borderRadius: '0.4rem',
    border: '1px solid #e2e8f0',
  },
  mainContent: {
    flex: 1,
    minWidth: 0,
    transition: 'margin-left 0.2s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  mobileHeader: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '3.5rem',
    backgroundColor: '#0b2240',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1rem',
    zIndex: 1000,
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    boxSizing: 'border-box',
    fontFamily: '"Outfit", sans-serif',
  },
  mobileHomeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  mobileHeaderTitle: {
    fontSize: '1.1rem',
    fontWeight: 800,
    letterSpacing: '0.01em',
    textAlign: 'center',
    flex: 1,
  },
};
