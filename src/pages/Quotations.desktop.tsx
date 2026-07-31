import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Package,
  Search,
  Clock,
  ShoppingBag,
  Info
} from 'lucide-react';
import { QuotationsProps, Quotation } from './Quotations';

export const QuotationsDesktop: React.FC<QuotationsProps> = ({
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
    <div style={{
      height: 'calc(100vh - 64px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '2rem',
      position: 'relative',
      zIndex: 1,
      backgroundColor: '#f9fafb',
      fontFamily: '"Outfit", "Inter", sans-serif'
    }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0, marginBottom: '0.25rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#111827' }}>Quotations & Quotes</h1>
          <p style={{ margin: '0.1rem 0 0 0', color: '#6b7280', fontSize: '1rem' }}>View history of quotes provided for your enquiries</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, minHeight: 0 }}>
        {/* Master List Column */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 0 }}>
          {/* List Search & Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={16} />
              <input
                type="text"
                placeholder="Search Quote # or Status..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.85rem 0.65rem 2.5rem',
                  borderRadius: '1rem',
                  border: '1px solid #e5e7eb',
                  background: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                }}
              />
            </div>
          </div>

          {/* List Content */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loading && quotations.length === 0 ? (
              <div style={{ padding: '4rem 0', textAlign: 'center', color: '#6b7280' }}>
                <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}>
                  <Clock size={32} />
                </div>
                <div>Loading quotations...</div>
              </div>
            ) : filteredQuotations.length === 0 ? (
              <div style={{ padding: '4rem 0', textAlign: 'center', background: '#fff', borderRadius: '1.25rem', border: '1px solid #e5e7eb' }}>
                <Package size={42} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                <div style={{ color: '#6b7280', fontWeight: 600, fontSize: '0.9rem' }}>No quotations found</div>
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

              return groups.map(group => (
                <div key={group.label} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* Sticky Pill Header */}
                  <div 
                    onClick={() => toggleGroup(group.label)}
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 5,
                      background: '#f9fafb',
                      padding: '0.4rem 0',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    <span style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: 'var(--primary, #1a56db)',
                      background: 'rgba(26, 86, 219, 0.08)',
                      padding: '0.35rem 0.85rem',
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
                    <div style={{ flex: 1, height: '1px', background: '#e5e7eb', marginLeft: '0.75rem' }} />
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
                        {group.items.map(q => (
                          <motion.div
                            key={q.id}
                            onClick={() => fetchQuotationDetail(q)}
                            whileHover={{ y: -2 }}
                            style={{
                              background: selectedQuotation?.id === q.id ? 'rgba(26, 86, 219, 0.04)' : '#fff',
                              borderRadius: '1rem',
                              padding: '1.25rem',
                              cursor: 'pointer',
                              border: `2px solid ${selectedQuotation?.id === q.id ? 'var(--primary, #1a56db)' : '#f1f5f9'}`,
                              transition: 'all 0.2s',
                              boxShadow: selectedQuotation?.id === q.id ? '0 10px 15px -3px rgba(26, 86, 219, 0.05)' : '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827' }}>Quotation {q.quotation_number}</div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: 900, 
                                  color: getStatusColor(q.status), 
                                  background: `${getStatusColor(q.status)}15`, 
                                  padding: '0.2rem 0.6rem', 
                                  borderRadius: '1rem' 
                                }}>
                                  {q.status}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                {formatDate(q.quotation_date)}
                              </div>
                              <div style={{ fontWeight: 900, color: '#111827', fontSize: '1.05rem' }}>
                                ${Number(q.total_amount || 0).toFixed(2)}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            })()}
          </div>
        </div>

        {/* Detail View Column */}
        <div style={{ flex: 1, background: '#fff', borderRadius: '1.5rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          {selectedQuotation ? (
            <>
              <div style={{ padding: '1.25rem 2.5rem', borderBottom: '1px solid #f1f5f9', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-0.02em' }}>Quotation #{selectedQuotation.quotation_number}</h2>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>Valid Until: {formatDate(selectedQuotation.valid_until)}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 900, 
                    color: getStatusColor(selectedQuotation.status), 
                    background: `${getStatusColor(selectedQuotation.status)}15`, 
                    padding: '0.4rem 1rem', 
                    borderRadius: '1.5rem' 
                  }}>
                    {selectedQuotation.status}
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                {loadingDetail ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
                    <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                      <Clock size={40} color="var(--primary, #1a56db)" />
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '1rem' }}>Getting Quotation data...</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {selectedQuotation.remarks && (
                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}>
                        <div style={{ color: '#6b7280', marginBottom: '0.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>Client Remarks & Terms</div>
                        <div style={{ color: '#374151', fontStyle: 'italic' }}>"{selectedQuotation.remarks}"</div>
                      </div>
                    )}

                    {/* Itemized Manifest Table */}
                    <div style={{ 
                      background: '#fff', 
                      borderRadius: '1.5rem', 
                      border: '1px solid #e5e7eb', 
                      overflow: 'hidden', 
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', 
                      display: 'grid',
                      gridTemplateColumns: '60px 1.5fr 100px 120px 130px'
                    }}>
                      {/* Header Row */}
                      <div style={{ display: 'contents', fontWeight: 800, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <div style={{ padding: '1rem', textAlign: 'center', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>#</div>
                        <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Product Variant Name</div>
                        <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>Qty</div>
                        <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Rate</div>
                        <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: 'var(--primary, #1a56db)' }}>Net Amount</div>
                      </div>

                      {/* Data Rows */}
                      {quotationLines.map((item, idx) => {
                        const isLast = idx === quotationLines.length - 1;
                        const borderStyle = isLast ? 'none' : '1px solid #e5e7eb';

                        return (
                          <React.Fragment key={item.id || idx}>
                            <div style={{ display: 'contents' }}>
                              <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: borderStyle }}>{idx + 1}</div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: borderStyle }}>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827', marginBottom: '0.25rem' }}>{item.product_name || `Variant ${item.variant_id}`}</div>
                              </div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: borderStyle }}>
                                <span style={{ background: 'rgba(26, 86, 219, 0.05)', color: 'var(--primary, #1a56db)', padding: '0.4rem 0.85rem', borderRadius: '0.65rem', fontWeight: 900, fontSize: '0.9rem' }}>
                                  {item.quantity}
                                </span>
                              </div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: borderStyle }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>${Number(item.unit_price || 0).toFixed(2)}</div>
                              </div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', textAlign: 'right', fontSize: '1.15rem', fontWeight: 950, color: 'var(--primary, #1a56db)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: borderStyle }}>
                                ${Number(item.line_total || 0).toFixed(2)}
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Summary Card */}
                    <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '1.5rem', border: '2px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111827' }}>Total Quotation Amount</span>
                        <span style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--primary, #1a56db)' }}>
                          ${Number(selectedQuotation.total_amount || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', color: '#9ca3af' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '2.5rem', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                <ShoppingBag size={48} style={{ opacity: 0.15 }} />
              </div>
              <div style={{ fontWeight: 700 }}>Select a quotation to view details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
