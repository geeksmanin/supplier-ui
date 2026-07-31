import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Grid,
  Heart,
  ClipboardList,
  ShoppingCart,
  Activity,
  Ticket,
  FileText,
  User,
  Search,
  Bell,
  ChevronRight,
  Plus,
  X,
  FileCheck,
  AlertCircle,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  Eye,
  RefreshCw,
  LayoutDashboard,
  Home as HomeIcon,
  Award
} from 'lucide-react';
import { useMediaQuery, apiClient, useToast } from '@geeksman/core-ui';
import { useNotification } from '@geeksman/notification';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const { showToast } = useToast();
  const { notifications } = useNotification();
  const brandingLogo = localStorage.getItem('branding_logo') || '/logo.png';
  const brandingName = localStorage.getItem('branding_name') || 'GEEKSMAN OS';

  const [userName, setUserName] = useState('MR. YUVARAJAN');
  const [greeting, setGreeting] = useState('Welcome');
  const [currentDateStr, setCurrentDateStr] = useState('');

  // Data States
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // FAB / Bottom Sheet
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  // Auto redirect desktop users
  useEffect(() => {
    if (isDesktop) {
      navigate('/catalog');
    }
  }, [isDesktop, navigate]);

  // Set greeting and date
  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good Morning');
    else if (hours < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    setCurrentDateStr(new Date().toLocaleDateString('en-US', options));

    // Parse token immediately
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

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch wishlist count
      const wishRes = await apiClient.get('/sales/customer/wishlist');
      if (wishRes.data?.data) {
        setWishlistCount(wishRes.data.data.length);
      }

      // Fetch cart items count
      const cartRes = await apiClient.get('/sales/customer/carts');
      if (cartRes.data?.data) {
        setCartItemsCount(cartRes.data.data.items?.length || 0);
      }

      // Fetch api data concurrently
      const [ticketsRes, ordersRes, invoicesRes, productsRes] = await Promise.allSettled([
        apiClient.get('/ticketing/customer/tickets'),
        apiClient.get('/sales/customer/salesorders'),
        apiClient.get('/sales/customer/salesinvoices'),
        apiClient.get('/catalogue/customer/products', { params: { limit: 5 } })
      ]);

      if (ticketsRes.status === 'fulfilled') {
        setTickets(ticketsRes.value.data?.data || []);
      }
      if (ordersRes.status === 'fulfilled') {
        setOrders(ordersRes.value.data?.data || []);
      }
      if (invoicesRes.status === 'fulfilled') {
        setInvoices(invoicesRes.value.data?.data || []);
      }
      if (productsRes.status === 'fulfilled') {
        setProducts(productsRes.value.data?.data || []);
      }

      // Extract username from token
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
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter actions / search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Direct search query to catalog
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Helper counts
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS');
  const pendingOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'COMPLETED');

  // Quick Action List
  const quickActions = [
    {
      label: 'Catalog',
      subtitle: 'Browse all products',
      icon: Grid,
      path: '/catalog',
      bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    },
    {
      label: 'Wishlist',
      subtitle: 'View saved items',
      icon: Heart,
      path: '/wishlist',
      bg: 'linear-gradient(135deg, #f87171 0%, #dc2626 100%)'
    },
    {
      label: 'Enquiry',
      subtitle: 'Price quotes',
      icon: ClipboardList,
      path: '/enquiry-cart',
      bg: 'linear-gradient(135deg, #34d399 0%, #059669 100%)'
    },
    {
      label: 'Enquiries List',
      subtitle: 'Track submitted enquiries',
      icon: FileCheck,
      path: '/enquiries',
      bg: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
    },
    {
      label: 'Cart',
      subtitle: 'Checkout order',
      icon: ShoppingCart,
      path: '/order-cart',
      bg: 'linear-gradient(135deg, #818cf8 0%, #4f46e5 100%)'
    },
    {
      label: 'Orders',
      subtitle: 'Track purchase history',
      icon: Activity,
      path: '/orders',
      bg: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)'
    },
    {
      label: 'Tickets',
      subtitle: 'Raise customer support',
      icon: Ticket,
      path: '/tickets',
      bg: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)'
    },
    {
      label: 'Invoices',
      subtitle: 'Bills and payments',
      icon: FileText,
      path: '/invoices',
      bg: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)'
    },
    {
      label: 'Subscriptions',
      subtitle: 'Manage active licenses',
      icon: Award,
      path: '/subscriptions',
      bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    }
  ];

  return (
    <div style={{
      backgroundColor: '#F5F7FA',
      fontFamily: '"Outfit", "Inter", sans-serif',
      minHeight: '100vh',
      paddingBottom: '80px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      color: '#111827'
    }}>
      {/* 1. Premium Gradient Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #0D1B2A 100%)',
        color: '#ffffff',
        padding: '2.25rem 1.25rem 3.5rem 1.25rem',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        boxShadow: '0 8px 30px rgba(30, 58, 138, 0.15)',
        position: 'relative'
      }}>
        {/* Top Header Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img 
              src={brandingLogo} 
              alt="Logo" 
              style={{ 
                width: '22px', 
                height: '22px', 
                filter: brandingLogo === '/logo.png' ? 'brightness(0) invert(1)' : 'none' 
              }} 
            />
            <span style={{
              fontSize: '1rem',
              fontWeight: 900,
              letterSpacing: '0.05em',
              fontFamily: '"Outfit", "Inter", sans-serif',
              background: 'linear-gradient(to right, #ffffff, #93c5fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {brandingName.toUpperCase()}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {(() => {
              const unreadNotificationsCount = (notifications || []).filter((n: any) => !n.is_read).length;
              return (
                <div
                  onClick={() => {
                    const navEvent = new CustomEvent('customer-open-notifications');
                    window.dispatchEvent(navEvent);
                  }}
                  style={{ position: 'relative', cursor: 'pointer', padding: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }}
                >
                  <Bell size={18} />
                  {unreadNotificationsCount > 0 && (
                    <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', backgroundColor: '#EF4444', borderRadius: '50%' }} />
                  )}
                </div>
              );
            })()}
            <div
              onClick={() => {
                const navEvent = new CustomEvent('customer-open-profile');
                window.dispatchEvent(navEvent);
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 850,
                fontSize: '0.85rem',
                border: '1.5px solid rgba(255,255,255,0.3)',
                cursor: 'pointer'
              }}
            >
              {userName.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.7, fontWeight: 500 }}>{greeting},</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.6, fontWeight: 700, letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              {currentDateStr}
            </span>
          </div>
          <span style={{ fontSize: '1.75rem', fontWeight: 800, textTransform: 'capitalize', letterSpacing: '-0.02em' }}>{userName}</span>
          <span style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: 500 }}>Customer Portal Dashboard</span>
        </div>
      </div>

      {/* 2. Sticky Search Bar Container */}
      <div style={{
        padding: '0 1.25rem',
        marginTop: '-1.5rem',
        zIndex: 50,
        position: 'sticky',
        top: '10px'
      }}>
        <form onSubmit={handleSearchSubmit} style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #E5E7EB',
          padding: '0 1rem',
          height: '48px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)'
        }}>
          <Search size={18} color="#6B7280" style={{ marginRight: '0.65rem' }} />
          <input
            type="text"
            placeholder="Search products, orders, invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '0.85rem',
              fontWeight: 500,
              backgroundColor: 'transparent',
              color: '#111827'
            }}
          />
        </form>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* 5. Quick Actions / Portal Services (App launcher style grid of icons) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.5rem 1rem',
          marginTop: '0.25rem',
          justifyItems: 'center',
          boxSizing: 'border-box'
        }}>
          {quickActions.map((item, index) => {
            const Icon = item.icon;
            const unreadTicketCount = (notifications || []).filter(n => !n.is_read && n.type === 'chat_reply').length;
            return (
              <motion.div
                key={index}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  navigate(item.path);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '90px'
                }}
              >
                {/* Rounded Square Icon container */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: item.bg,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.08)',
                  flexShrink: 0,
                  position: 'relative'
                }}>
                  <Icon size={24} strokeWidth={2} />
                  {item.label === 'Tickets' && unreadTicketCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #ffffff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {unreadTicketCount}
                    </span>
                  )}
                </div>
                <span style={{
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  color: '#334155',
                  lineHeight: 1.2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 9. Floating Action Button (FAB) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowBottomSheet(true)}
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#1E3A8A',
          color: '#ffffff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 20px rgba(30, 58, 138, 0.35)',
          zIndex: 900,
          cursor: 'pointer'
        }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </motion.button>

      {/* FAB Bottom Sheet Menu */}
      <AnimatePresence>
        {showBottomSheet && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 30000, display: 'flex', alignItems: 'flex-end' }}>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBottomSheet(false)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(3px)'
              }}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              style={{
                position: 'relative',
                width: '100%',
                backgroundColor: '#ffffff',
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                padding: '1.5rem',
                boxSizing: 'border-box',
                boxShadow: '0 -10px 30px rgba(0,0,0,0.1)',
                zIndex: 1010
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '1rem', fontWeight: 800, color: '#111827' }}>Quick Actions</span>
                <button
                  onClick={() => setShowBottomSheet(false)}
                  style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Action Buttons list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setShowBottomSheet(false);
                    navigate('/enquiry-cart');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '14px',
                    color: '#111827',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <ClipboardList size={18} color="#10B981" />
                  Create New Enquiry
                </button>

                <button
                  onClick={() => {
                    setShowBottomSheet(false);
                    navigate('/tickets?action=create');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '14px',
                    color: '#111827',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <Ticket size={18} color="#8B5CF6" />
                  Raise Support Ticket
                </button>

                <button
                  onClick={() => {
                    setShowBottomSheet(false);
                    navigate('/catalog');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    padding: '0.85rem 1rem',
                    backgroundColor: '#F9FAFB',
                    border: '1px solid #E5E7EB',
                    borderRadius: '14px',
                    color: '#111827',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <ShoppingCart size={18} color="#2563EB" />
                  Place Quick Order
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
