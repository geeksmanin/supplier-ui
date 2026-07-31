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
  ShoppingBag,
  Download,
  RefreshCw
} from 'lucide-react';
import { InvoicesProps, Invoice } from './Invoices';

export const InvoicesMobile: React.FC<InvoicesProps> = ({
  invoices,
  loading,
  error,
  search,
  setSearch,
  selectedInvoice,
  setSelectedInvoice,
  invoiceLines,
  loadingDetail,
  fetchInvoiceDetail,
  triggerDownload,
  refreshInvoices
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID':
        return '#10b981';
      case 'UNPAID':
        return '#f59e0b';
      case 'OVERDUE':
        return '#ef4444';
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

  const filteredInvoices = invoices.filter(invoice => {
    const query = search.trim().toLowerCase();
    return invoice.invoice_number.toLowerCase().includes(query) ||
           invoice.status.toLowerCase().includes(query);
  });

  return (
    <div style={{ padding: '1rem', paddingTop: '0.5rem', paddingBottom: '100px', backgroundColor: '#f9fafb', fontFamily: '"Outfit", "Inter", sans-serif', minHeight: '100vh', boxSizing: 'border-box' }}>
      {selectedInvoice && (
        <style>{`
          main {
            overflow: hidden !important;
          }
        `}</style>
      )}

      {/* Sticky Search & Refresh Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#f9fafb',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #e5e7eb',
        margin: '0 -1rem 1.5rem -1rem',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
            <input
              type="text"
              placeholder="Search Invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.75rem',
                borderRadius: '1rem',
                border: '1px solid #e5e7eb',
                background: '#fff',
                fontSize: '0.95rem',
                outline: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            onClick={refreshInvoices}
            disabled={loading}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '1rem',
              width: '42px',
              height: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#1a56db',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              flexShrink: 0,
              transition: 'all 0.2s'
            }}
          >
            <RefreshCw 
              size={18} 
              style={{ 
                animation: loading ? 'spin 1s linear infinite' : 'none' 
              }} 
            />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
          <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
            <Clock size={40} color="var(--primary, #1a56db)" />
          </div>
          <span style={{ color: '#6b7280', fontWeight: 500 }}>Loading invoices...</span>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#fff', borderRadius: '1.5rem', border: '1px solid #e5e7eb' }}>
          <Package size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#6b7280', fontSize: '1.1rem', margin: 0 }}>No invoices found</h3>
        </div>
      ) : (() => {
        const currentYear = new Date().getFullYear();
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];

        const sorted = [...filteredInvoices].sort((a, b) => {
          const dateA = a.invoice_date ? new Date(a.invoice_date).getTime() : 0;
          const dateB = b.invoice_date ? new Date(b.invoice_date).getTime() : 0;
          return dateB - dateA;
        });

        const groups: { label: string; items: typeof filteredInvoices }[] = [];
        sorted.forEach(invoice => {
          const date = invoice.invoice_date ? new Date(invoice.invoice_date) : new Date();
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
          existing.items.push(invoice);
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
                      {group.items.map((invoice) => (
                        <motion.div
                          key={invoice.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fetchInvoiceDetail(invoice)}
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
                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Invoice {invoice.invoice_number}</div>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                  <div style={{ 
                                    fontSize: '0.6rem', 
                                    fontWeight: 950, 
                                    color: getStatusColor(invoice.status), 
                                    background: `${getStatusColor(invoice.status)}15`, 
                                    padding: '0.15rem 0.4rem', 
                                    borderRadius: '0.5rem' 
                                  }}>
                                    {invoice.status}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Calendar size={12} />
                                  Inv Date: {formatDate(invoice.invoice_date)}
                                </span>
                                <span style={{ fontWeight: 700, color: '#111827', marginLeft: 'auto' }}>
                                  ${Number(invoice.total_amount).toFixed(2)}
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
        {selectedInvoice && (
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
            onClick={() => setSelectedInvoice(null)}
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
                height: '100dvh',
                borderRadius: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                paddingBottom: '80px',
                boxSizing: 'border-box'
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
                          onClick={() => setSelectedInvoice(null)}
                          style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <ChevronLeft size={20} color="#6b7280" />
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e293b' }}>Invoice #{selectedInvoice.invoice_number}</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8' }}>Due: {formatDate(selectedInvoice.due_date)}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <button
                          onClick={() => {
                            setSelectedInvoice(null);
                            window.location.hash = `#/tickets?ref_type=invoice&ref_id=${selectedInvoice.id}`;
                          }}
                          style={{
                            background: 'rgba(26, 86, 219, 0.05)',
                            border: 'none',
                            color: 'var(--primary, #1a56db)',
                            cursor: 'pointer',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: 800
                          }}
                        >
                          Support
                        </button>
                        <button 
                          onClick={() => triggerDownload(selectedInvoice)}
                          style={{
                            background: 'rgba(26, 86, 219, 0.05)',
                            border: 'none',
                            color: 'var(--primary, #1a56db)',
                            cursor: 'pointer',
                            padding: '0.35rem 0.65rem',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: 800
                          }}
                        >
                          <Download size={14} /> PDF
                        </button>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 950, 
                          color: getStatusColor(selectedInvoice.status), 
                          background: `${getStatusColor(selectedInvoice.status)}15`, 
                          padding: '0.25rem 0.6rem', 
                          borderRadius: '0.75rem' 
                        }}>
                          {selectedInvoice.status}
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
                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1e293b' }}>Invoice Items ({invoiceLines.length})</h3>
                      {invoiceLines.map((item, idx) => (
                        <div 
                          key={item.id || idx} 
                          style={{ background: '#fff', padding: '1rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                        >
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '11px', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 900, flexShrink: 0, marginTop: '0.2rem' }}>
                              {idx + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', lineHeight: 1.3, marginBottom: '0.25rem' }}>Product: {item.product_id}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                  Qty: <strong style={{ color: 'var(--primary, #1a56db)' }}>{item.quantity}</strong> &times; ${Number(item.unit_price).toFixed(2)}
                                </span>
                                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827' }}>
                                  ${Number(item.line_total).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Summary */}
                    <div style={{ background: '#fff', padding: '1rem 1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#6b7280' }}>Total Invoiced Amount</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 950, color: 'var(--primary, #1a56db)' }}>
                        ${Number(selectedInvoice.total_amount).toFixed(2)}
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
