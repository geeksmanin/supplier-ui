import React, { useMemo, useState } from 'react';
import { Select } from '@geeksman/core-ui';
import { Search, ShieldAlert, Award, Calendar, Key, AlertTriangle, CheckCircle, XCircle, Copy, Check } from 'lucide-react';
import { SubscriptionsProps } from './Subscriptions';

export const SubscriptionsDesktop: React.FC<SubscriptionsProps> = ({
  subscriptions,
  loading,
  filterStatus,
  setFilterStatus,
  searchQuery,
  setSearchQuery,
}) => {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const getStatusTheme = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          bg: '#f0fdf4',
          color: '#16a34a',
          border: '1px solid #bbf7d0',
          barColor: '#22c55e',
          dotColor: '#4ade80'
        };
      case 'EXPIRING':
        return {
          bg: '#fffbeb',
          color: '#d97706',
          border: '1px solid #fde68a',
          barColor: '#f59e0b',
          dotColor: '#fbbf24'
        };
      case 'EXPIRED':
        return {
          bg: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          barColor: '#ef4444',
          dotColor: '#f87171'
        };
      default:
        return {
          bg: '#f8fafc',
          color: '#64748b',
          border: '1px solid #e2e8f0',
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
    <div style={{ padding: '2rem', fontFamily: '"Outfit", "Inter", sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>My Subscriptions Directory</h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem', fontWeight: 600 }}>
            Monitor active product licenses, subscription credentials, and expiration key statuses.
          </p>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Licenses', count: stats.total, icon: Award, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.08)' },
          { label: 'Active Licenses', count: stats.active, icon: CheckCircle, color: '#16a34a', bg: 'rgba(22, 163, 74, 0.08)' },
          { label: 'Expiring Soon', count: stats.expiring, icon: AlertTriangle, color: '#ca8a04', bg: 'rgba(202, 138, 4, 0.08)' },
          { label: 'Expired Licenses', count: stats.expired, icon: XCircle, color: '#dc2626', bg: 'rgba(220, 38, 38, 0.08)' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} style={{
              backgroundColor: '#ffffff',
              padding: '1.5rem',
              borderRadius: '16px',
              border: '1px solid #f1f5f9',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>{item.label}</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a' }}>{item.count}</span>
              </div>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: item.bg,
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters Bar */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        backgroundColor: '#ffffff',
        padding: '1rem',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search subscriptions by product name or license key..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.65rem 0.65rem 2.5rem',
              borderRadius: '10px',
              border: '1.5px solid #cbd5e1',
              fontSize: '0.88rem',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ width: '220px' }}>
          <Select
            options={statusOptions}
            value={filterStatus}
            onChange={(val) => setFilterStatus(Array.isArray(val) ? val[0] : val)}
            placeholder="Filter Status"
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid #f3f3f3', borderTop: '3px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : subscriptions.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '5rem 2rem',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          color: '#64748b'
        }}>
          <ShieldAlert size={48} style={{ margin: '0 auto 1rem', color: '#94a3b8' }} />
          <h3 style={{ margin: 0, fontWeight: 900, color: '#0f172a' }}>No Subscriptions Found</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>No subscriptions match the selected filter criteria.</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #f1f5f9',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.01), 0 4px 6px -2px rgba(0,0,0,0.01)'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Subscription Product</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>License Credentials</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Status</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Validity</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Start Date</th>
                  <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Expires On</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const theme = getStatusTheme(sub.status);
                  const remainingDaysPercent = getValidityProgress(sub.start_date, sub.end_date);
                  const isCopied = copiedKeyId === String(sub.id);

                  return (
                    <tr 
                      id={sub.id ? `row-${sub.id}` : undefined}
                      key={sub.id} 
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }}
                    >
                      {/* Product details */}
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(37, 99, 235, 0.05)',
                            color: '#2563eb'
                          }}>
                            <Award size={18} />
                          </div>
                          <span style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>{sub.subscription_name}</span>
                        </div>
                      </td>

                      {/* License number with copy feature */}
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          backgroundColor: '#f8fafc',
                          padding: '0.4rem 0.65rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569', fontFamily: 'monospace', fontSize: '0.82rem', fontWeight: 800 }}>
                            <Key size={13} style={{ color: '#94a3b8' }} />
                            <span>{sub.license_number}</span>
                          </div>
                          <button
                            onClick={(e) => handleCopyKey(sub.license_number, String(sub.id), e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px',
                              borderRadius: '4px',
                              color: isCopied ? '#16a34a' : '#64748b',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            {isCopied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
                          </button>
                        </div>
                      </td>

                      {/* Pulse Status indicator Tag */}
                      <td style={{ padding: '1.25rem 1rem' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '8px',
                          backgroundColor: theme.bg,
                          color: theme.color,
                          fontSize: '0.7rem',
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
                      </td>

                      {/* Validity remaining percentage & progress bar */}
                      <td style={{ padding: '1.25rem 1rem', width: '160px' }}>
                        {sub.status !== 'EXPIRED' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 850, color: '#64748b' }}>{remainingDaysPercent}% remaining</span>
                            <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${remainingDaysPercent}%`,
                                height: '100%',
                                backgroundColor: theme.barColor,
                                borderRadius: '9999px'
                              }} />
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626' }}>Expired</span>
                        )}
                      </td>

                      {/* Start Date */}
                      <td style={{ padding: '1.25rem 1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} style={{ color: '#94a3b8' }} />
                          <span>{new Date(sub.start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>

                      {/* Expires On */}
                      <td style={{ padding: '1.25rem 1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Calendar size={14} style={{ color: '#94a3b8' }} />
                          <span>{new Date(sub.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
