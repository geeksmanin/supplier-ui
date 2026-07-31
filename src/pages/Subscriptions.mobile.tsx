import React, { useMemo, useState } from 'react';
import { Search, ShieldAlert, Award, Calendar, Key, CheckCircle, AlertTriangle, XCircle, ChevronDown, Copy, Check } from 'lucide-react';
import { SubscriptionsProps } from './Subscriptions';

export const SubscriptionsMobile: React.FC<SubscriptionsProps> = ({
  subscriptions,
  loading,
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
}) => {
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: '#f0fdf4',
          color: '#16a34a',
          border: '1px solid #bbf7d0',
          glow: 'rgba(34, 197, 94, 0.05)',
          barColor: '#22c55e',
          dotColor: '#4ade80'
        };
      case 'EXPIRING':
        return {
          bg: '#fffbeb',
          color: '#d97706',
          border: '1px solid #fde68a',
          glow: 'rgba(245, 158, 11, 0.05)',
          barColor: '#f59e0b',
          dotColor: '#fbbf24'
        };
      case 'EXPIRED':
        return {
          bg: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          glow: 'rgba(239, 68, 68, 0.05)',
          barColor: '#ef4444',
          dotColor: '#f87171'
        };
      default:
        return {
          bg: '#f8fafc',
          color: '#64748b',
          border: '1px solid #e2e8f0',
          glow: 'rgba(148, 163, 184, 0.05)',
          barColor: '#94a3b8',
          dotColor: '#cbd5e1'
        };
    }
  };

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Expiring', value: 'EXPIRING' },
    { label: 'Expired', value: 'EXPIRED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  // Calculate statistics
  const stats = useMemo(() => {
    const active = subscriptions.filter(s => s.status === 'ACTIVE').length;
    const expiring = subscriptions.filter(s => s.status === 'EXPIRING').length;
    const expired = subscriptions.filter(s => s.status === 'EXPIRED').length;
    return { active, expiring, expired, total: subscriptions.length };
  }, [subscriptions]);

  const handleCopyKey = (key: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => {
      setCopiedKeyId(null);
    }, 2000);
  };

  const getValidityProgress = (startDateStr: string, endDateStr: string) => {
    try {
      const start = new Date(startDateStr).getTime();
      const end = new Date(endDateStr).getTime();
      const now = Date.now();
      if (now >= end) return 0;
      if (now <= start) return 100;
      const total = end - start;
      const elapsed = now - start;
      const remainingPercent = Math.max(0, Math.min(100, 100 - (elapsed / total) * 100));
      return Math.round(remainingPercent);
    } catch {
      return 100;
    }
  };

  return (
    <div style={{ padding: '1rem 1rem 90px 1rem', fontFamily: '"Outfit", "Inter", sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
      


      {/* Stats Widgets for Mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Total', count: stats.total, icon: Award, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.05)' },
          { label: 'Active', count: stats.active, icon: CheckCircle, color: '#16a34a', bg: 'rgba(22, 163, 74, 0.05)' },
          { label: 'Expiring', count: stats.expiring, icon: AlertTriangle, color: '#ca8a04', bg: 'rgba(202, 138, 4, 0.05)' },
          { label: 'Expired', count: stats.expired, icon: XCircle, color: '#dc2626', bg: 'rgba(220, 38, 38, 0.05)' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} style={{
              backgroundColor: '#ffffff',
              padding: '0.85rem',
              borderRadius: '16px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 850, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{item.label}</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>{item.count}</span>
              </div>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: item.bg,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={18} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }} ref={dropdownRef}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search subscriptions or key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.65rem 0.65rem 2.5rem',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.88rem',
              outline: 'none',
              backgroundColor: '#fff',
              boxSizing: 'border-box',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
              fontFamily: '"Outfit", sans-serif'
            }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ position: 'relative', width: '100%' }}>
          <div 
            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '0.65rem 1rem',
              borderRadius: '12px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: '#334155',
              backgroundColor: '#fff',
              cursor: 'pointer',
              userSelect: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
            }}
          >
            <span>{statusOptions.find(o => o.value === filterStatus)?.label || 'Filter Status'}</span>
            <ChevronDown size={16} style={{ transform: isStatusDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: '#64748b' }} />
          </div>
          {isStatusDropdownOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e2e8f0',
                zIndex: 100,
                padding: '4px 0'
              }}
            >
              {statusOptions.map((opt) => {
                const isSelected = opt.value === filterStatus;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      setFilterStatus(opt.value);
                      setIsStatusDropdownOpen(false);
                    }}
                    style={{
                      padding: '0.65rem 1rem',
                      fontSize: '0.88rem',
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? '#2563eb' : '#475569',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    {opt.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card List */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '30vh' }}>
          <div style={{ width: '28px', height: '28px', border: '3px solid #f3f3f3', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : subscriptions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          color: '#64748b'
        }}>
          <ShieldAlert size={36} style={{ margin: '0 auto 0.75rem', color: '#94a3b8' }} />
          <h3 style={{ margin: 0, fontWeight: 900, color: '#0f172a', fontSize: '1rem' }}>No Subscriptions Found</h3>
          <p style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>No subscriptions match the selected criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {subscriptions.map((sub) => {
            const theme = getStatusTheme(sub.status);
            const remainingDaysPercent = getValidityProgress(sub.start_date, sub.end_date);
            const isCopied = copiedKeyId === String(sub.id);

            return (
              <div 
                id={sub.id ? `row-${sub.id}` : undefined}
                key={sub.id} 
                style={{
                  backgroundColor: '#ffffff',
                  padding: '1.25rem',
                  borderRadius: '20px',
                  border: theme.border,
                  boxShadow: `0 10px 15px -3px ${theme.glow}, 0 4px 6px -4px ${theme.glow}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Colored Accent Strip */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: '4px',
                  backgroundColor: theme.barColor
                }} />

                {/* Card Title & Status Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingLeft: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(37, 99, 235, 0.05)',
                      color: '#2563eb'
                    }}>
                      <Award size={16} />
                    </div>
                    <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '0.925rem', letterSpacing: '-0.01em' }}>{sub.subscription_name}</span>
                  </div>
                  
                  {/* Pulse Status Indicator Tag */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '8px',
                    backgroundColor: theme.bg,
                    color: theme.color,
                    fontSize: '0.68rem',
                    fontWeight: 900,
                    border: theme.border
                  }}>
                    <span style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: theme.dotColor,
                      display: 'inline-block'
                    }} />
                    {sub.status}
                  </div>
                </div>

                {/* Monospace Copyable License Number Box */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#f8fafc',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  marginLeft: '4px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#475569', fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 800 }}>
                    <Key size={13} style={{ color: '#94a3b8' }} />
                    <span>{sub.license_number}</span>
                  </div>
                  <button
                    onClick={(e) => handleCopyKey(sub.license_number, String(sub.id), e)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      borderRadius: '6px',
                      color: isCopied ? '#16a34a' : '#64748b',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isCopied ? '#f0fdf4' : 'transparent',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {isCopied ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                  </button>
                </div>

                {/* Validity Remaining Progress Bar */}
                {sub.status !== 'EXPIRED' && (
                  <div style={{ paddingLeft: '4px', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.02em' }}>
                      <span>Validity Remaining</span>
                      <span style={{ color: theme.color }}>{remainingDaysPercent}%</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${remainingDaysPercent}%`,
                        height: '100%',
                        backgroundColor: theme.barColor,
                        borderRadius: '9999px',
                        transition: 'width 0.5s ease-out'
                      }} />
                    </div>
                  </div>
                )}

                {/* Timeline dates section */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px dashed #e2e8f0',
                  paddingTop: '0.65rem',
                  marginTop: '0.25rem',
                  fontSize: '0.78rem',
                  color: '#64748b',
                  paddingLeft: '4px'
                }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.02em', marginBottom: '2px' }}>Start Date</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#475569', fontWeight: 700 }}>
                      <Calendar size={12} style={{ color: '#94a3b8' }} />
                      <span>{new Date(sub.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.02em', marginBottom: '2px' }}>Expires On</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end', color: '#475569', fontWeight: 700 }}>
                      <Calendar size={12} style={{ color: '#94a3b8' }} />
                      <span>{new Date(sub.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
