import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Package,
  Search,
  Calendar,
  Clock,
  ShoppingBag
} from 'lucide-react';
import { QuotationsProps, Quotation } from './Quotations';

export const QuotationsMobile: React.FC<QuotationsProps> = ({
  quotations,
  loading,
  error,
  search,
  setSearch,
  selectedQuotation,
  setSelectedQuotation,
  quotationLines,
  loadingDetail,
  fetchQuotationDetail
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const getStatusColor = (status: Quotation['status']) => {
    switch (status) {
      case 'ACCEPTED':
        return '#10b981';
      case 'SENT':
        return '#38bdf8';
      case 'DRAFT':
        return '#94a3b8';
      case 'REJECTED':
        return '#ef4444';
      case 'EXPIRED':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredQuotations = quotations.filter(q => 
    q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
    q.status.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '1rem', paddingBottom: '100px', backgroundColor: '#f9fafb', fontFamily: '"Outfit", "Inter", sans-serif', minHeight: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>My Quotations</h1>
      </div>

      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
        <input
          type="text"
          placeholder="Search Quotations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            padding: '0.85rem 1rem 0.85rem 3rem',
            borderRadius: '1rem',
            border: '1px solid #e5e7eb',
            background: '#fff',
            fontSize: '0.95rem',
            outline: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
          <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
            <Clock size={40} color="var(--primary, #1a56db)" />
          </div>
          <span style={{ color: '#6b7280', fontWeight: 500 }}>Loading quotations...</span>
        </div>
      ) : filteredQuotations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#fff', borderRadius: '1.5rem', border: '1px solid #e5e7eb' }}>
          <Package size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#6b7280', fontSize: '1.1rem', margin: 0 }}>No quotations found</h3>
        </div>
      ) : (() => {
        const currentYear = new Date().getFullYear();
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];

        const sorted = [...filteredQuotations].sort((a, b) => {
          const dateA = a.quotation_date ? new Date(a.quotation_date).getTime() : 0;
          const dateB = b.quotation_date ? new Date(b.quotation_date).getTime() : 0;
          return dateB - dateA;
        });

        const groups: { label: string; items: typeof filteredQuotations }[] = [];
        sorted.forEach(q => {
          const date = q.quotation_date ? new Date(q.quotation_date) : new Date();
          const year = isNaN(date.getTime()) ? new Date().getFullYear() : date.getFullYear();
          let label = "";
          if (year === currentYear) {
            const monthIndex = isNaN(date.getTime()) ? new Date().getMonth() : date.getMonth();
            label = monthNames[monthIndex];
          } else {
            label = String(year);
          }

          let existing = groups.find(g => g.label === label);
          if (!existing) {
            existing = { label, items: [] };
            groups.push(existing);
          }
          existing.items.push(q);
        });

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {groups.map(group => (
              <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div 
                  onClick={() => toggleGroup(group.label)}
                  style={{
                    position: 'sticky',
                    top: '56px',
                    zIndex: 10,
                    background: '#f9fafb',
                    padding: '0.4rem 0',
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: 'var(--primary, #1a56db)',
                    background: 'rgba(26, 86, 219, 0.08)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '2rem',
                    border: '1px solid rgba(26, 86, 219, 0.15)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    {group.label} ({group.items.length})
                    {collapsedGroups[group.label] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                  </span>
                  <div style={{ flex: 1, height: '1px', background: '#e5e7eb', marginLeft: '0.5rem' }} />
                </div>
                <AnimatePresence initial={false}>
                  {!collapsedGroups[group.label] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden' }}
                    >
                      {group.items.map((q) => (
                        <motion.div
                          key={q.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fetchQuotationDetail(q)}
                          style={{
                            background: '#fff',
                            borderRadius: '1.25rem',
                            padding: '1rem',
                            border: '1px solid #f1f5f9',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                          }}
                        >
                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '0.85rem',
                              background: 'rgba(26, 86, 219, 0.05)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--primary, #1a56db)',
                              flexShrink: 0
                            }}>
                              <ShoppingBag size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Quote {q.quotation_number}</div>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                  <div style={{ 
                                    fontSize: '0.6rem', 
                                    fontWeight: 950, 
                                    color: getStatusColor(q.status), 
                                    background: `${getStatusColor(q.status)}15`, 
                                    padding: '0.15rem 0.4rem', 
                                    borderRadius: '0.5rem' 
                                  }}>
                                    {q.status}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Calendar size={12} />
                                  {formatDate(q.quotation_date)}
                                </span>
                                <span style={{ fontWeight: 700, color: '#111827', marginLeft: 'auto' }}>
                                  ${Number(q.total_amount || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            <ChevronRight size={18} color="#cbd5e1" />
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Mobile Details Overlay */}
      <AnimatePresence>
        {selectedQuotation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: '#f9fafb',
              zIndex: 9000
            }}
            onClick={() => setSelectedQuotation(null)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#f9fafb',
                width: '100%',
                height: '100vh',
                borderRadius: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                paddingBottom: '90px'
              }}
            >
              {/* Header */}
              <div style={{
                 padding: '1rem 1.25rem',
                 background: '#fff',
                 borderBottom: '1px solid #e5e7eb',
                 position: 'sticky',
                 top: 0,
                 zIndex: 10,
                 boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                 flexShrink: 0
               }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <button
                          onClick={() => setSelectedQuotation(null)}
                          style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <ChevronLeft size={20} color="#6b7280" />
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e293b' }}>Quote #{selectedQuotation.quotation_number}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8' }}>Valid Until: {formatDate(selectedQuotation.valid_until)}</span>
                        </div>
                      </div>
                      <div>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 955, 
                          color: getStatusColor(selectedQuotation.status), 
                          background: `${getStatusColor(selectedQuotation.status)}15`, 
                          padding: '0.25rem 0.6rem', 
                          borderRadius: '0.75rem' 
                        }}>
                          {selectedQuotation.status}
                        </span>
                      </div>
                    </div>
                  </div>
               </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                {loadingDetail ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
                    <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                      <Clock size={32} color="var(--primary, #1a56db)" />
                    </div>
                    <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600 }}>Syncing details...</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {selectedQuotation.remarks && (
                      <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6b7280', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Remarks & Terms</div>
                        <div style={{ fontSize: '0.9rem', color: '#374151', fontStyle: 'italic' }}>
                          "{selectedQuotation.remarks}"
                        </div>
                      </div>
                    )}

                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1e293b' }}>Items ({quotationLines.length})</h3>
                      {quotationLines.map((item, idx) => (
                        <div 
                          key={item.id || idx} 
                          style={{ background: '#fff', padding: '1rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                        >
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '11px', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 900, flexShrink: 0, marginTop: '0.2rem' }}>
                              {idx + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', lineHeight: 1.3, marginBottom: '0.25rem' }}>{item.product_name || `Variant ${item.variant_id}`}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                  Qty: <strong style={{ color: 'var(--primary, #1a56db)' }}>{item.quantity}</strong> &times; ${Number(item.unit_price || 0).toFixed(2)}
                                </span>
                                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827' }}>
                                  ${Number(item.line_total || 0).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Summary */}
                    <div style={{ background: '#fff', padding: '1rem 1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#6b7280' }}>Total Quote Amount</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 950, color: 'var(--primary, #1a56db)' }}>
                        ${Number(selectedQuotation.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
