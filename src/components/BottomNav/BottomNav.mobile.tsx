import React from 'react';
import { Grid, Activity, Ticket, User, Home, Bell, ClipboardList, ShoppingCart, Award } from 'lucide-react';
import { BottomNavProps } from './BottomNav.types';

const BottomNavMobile: React.FC<BottomNavProps> = ({
  currentPath,
  showProfileModal,
  setShowProfileModal,
  navigate,
  wishlistCount,
  enquiryCount,
  orderCount,
  notificationCount = 0,
  onNotificationClick,
}) => {
  const links = [
    { path: '/home', label: 'Home', icon: Home, activeColor: '#1E3A8A', activeBg: 'rgba(30, 58, 138, 0.08)' },
    { path: '/catalog', label: 'Catalog', icon: Grid, activeColor: '#1E3A8A', activeBg: 'rgba(30, 58, 138, 0.08)' },
    { path: '/enquiry-cart', label: 'Enquiry', icon: ClipboardList, activeColor: '#1E3A8A', activeBg: 'rgba(30, 58, 138, 0.08)', badgeCount: enquiryCount, badgeColor: '#10b981' },
    { path: '/order-cart', label: 'Cart', icon: ShoppingCart, activeColor: '#1E3A8A', activeBg: 'rgba(30, 58, 138, 0.08)', badgeCount: orderCount, badgeColor: '#f43f5e' },
    { path: '/orders', label: 'Orders', icon: Activity, activeColor: '#1E3A8A', activeBg: 'rgba(30, 58, 138, 0.08)' },
    { path: '/subscriptions', label: 'Licenses', icon: Award, activeColor: '#1E3A8A', activeBg: 'rgba(30, 58, 138, 0.08)' },
    { path: '/tickets', label: 'Tickets', icon: Ticket, activeColor: '#1E3A8A', activeBg: 'rgba(30, 58, 138, 0.08)' },
    { path: '#profile', label: 'Profile', icon: User, activeColor: '#1E3A8A', activeBg: 'rgba(30, 58, 138, 0.08)', isProfile: true }
  ];

  return (
    <div className="mobile-bottom-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      backgroundColor: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 10000,
      boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.03)',
      boxSizing: 'border-box',
      paddingLeft: '8px',
      paddingRight: '8px'
    }}>
      {links.map((link) => {
        const isActive = link.isProfile ? showProfileModal : (currentPath === link.path && !showProfileModal);
        const LinkIcon = link.icon;
        return (
          <div 
            key={link.label} 
            onClick={() => {
              if (link.isProfile) {
                setShowProfileModal(true);
              } else {
                setShowProfileModal(false);
                navigate(link.path);
              }
            }}
            className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            style={{ 
              position: 'relative', 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              height: '100%',
              minWidth: 0 // allow flex item to shrink below content size for ellipsis to work
            }}
          >
            <div style={{ 
              position: 'relative', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '4px 10px',
              borderRadius: '16px',
              backgroundColor: isActive ? link.activeBg : 'transparent',
              color: isActive ? link.activeColor : '#6b7280',
              transition: 'all 0.2s ease',
              marginBottom: '2px',
              transform: isActive ? 'scale(1.04)' : 'scale(1)'
            }}>
              <LinkIcon 
                size={18} 
                strokeWidth={isActive ? 2.5 : 2} 
                fill={isActive && (link.label === 'Home' || link.label === 'Profile') ? 'currentColor' : 'none'} 
              />
              {link.badgeCount !== undefined && link.badgeCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  backgroundColor: link.badgeColor,
                  color: '#fff',
                  fontSize: '0.55rem',
                  fontWeight: 900,
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 1,
                }}>
                  {link.badgeCount > 99 ? '99+' : link.badgeCount}
                </span>
              )}
            </div>
            <span style={{ 
              fontSize: '0.58rem', 
              fontWeight: isActive ? 800 : 600,
              color: isActive ? link.activeColor : '#6b7280',
              transition: 'color 0.2s ease',
              letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              padding: '0 2px'
            }}>{link.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default BottomNavMobile;
