import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Package,
  Search,
  Clock,
  ShoppingBag,
  Download,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { InvoicesProps, Invoice } from './Invoices';

export const InvoicesDesktop: React.FC<InvoicesProps> = ({
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
      <style>{`
        .invoices-refresh-btn {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #4b5563;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
          flex-shrink: 0;
          transition: all 0.2s ease;
          outline: none;
        }
        .invoices-refresh-btn:hover {
          background: #f1f5f9;
          color: #1f2937;
          border-color: #cbd5e1;
          transform: scale(1.05);
        }
        .invoices-refresh-btn:active {
          background: #e2e8f0;
          transform: scale(0.95);
        }
      `}</style>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0, marginBottom: '0.25rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#111827' }}>Billing & Invoices</h1>
          <p style={{ margin: '0.1rem 0 0 0', color: '#6b7280', fontSize: '1rem' }}>Check billing history, download PDFs, and pay invoices</p>
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
                placeholder="Search Invoice # or Status..."
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
            <button
              type="button"
              className="invoices-refresh-btn"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (refreshInvoices) {
                  await refreshInvoices();
                }
              }}
              title="Refresh Invoices"
            >
              <RefreshCw 
                size={16} 
                style={{ 
                  animation: loading ? 'spin 1s linear infinite' : 'none' 
                }} 
              />
            </button>
          </div>

          {/* List Content */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {loading && invoices.length === 0 ? (
              <div style={{ padding: '4rem 0', textAlign: 'center', color: '#6b7280' }}>
                <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}>
                  <Clock size={32} />
                </div>
                <div>Loading invoices...</div>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div style={{ padding: '4rem 0', textAlign: 'center', background: '#fff', borderRadius: '1.25rem', border: '1px solid #e5e7eb' }}>
                <Package size={42} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                <div style={{ color: '#6b7280', fontWeight: 600, fontSize: '0.9rem' }}>No invoices found</div>
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
                        {group.items.map(invoice => (
                          <motion.div
                            key={invoice.id}
                            onClick={() => fetchInvoiceDetail(invoice)}
                            whileHover={{ y: -2 }}
                            style={{
                              background: selectedInvoice?.id === invoice.id ? 'rgba(26, 86, 219, 0.04)' : '#fff',
                              borderRadius: '1rem',
                              padding: '1.25rem',
                              cursor: 'pointer',
                              border: `2px solid ${selectedInvoice?.id === invoice.id ? 'var(--primary, #1a56db)' : '#f1f5f9'}`,
                              transition: 'all 0.2s',
                              boxShadow: selectedInvoice?.id === invoice.id ? '0 10px 15px -3px rgba(26, 86, 219, 0.05)' : '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827' }}>Invoice {invoice.invoice_number}</div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: 900, 
                                  color: getStatusColor(invoice.status), 
                                  background: `${getStatusColor(invoice.status)}15`, 
                                  padding: '0.2rem 0.6rem', 
                                  borderRadius: '1rem' 
                                }}>
                                  {invoice.status}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                {formatDate(invoice.invoice_date)}
                              </div>
                              <div style={{ fontWeight: 900, color: '#111827', fontSize: '1.05rem' }}>
                                ${Number(invoice.total_amount).toFixed(2)}
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
          {selectedInvoice ? (
            <>
              <div style={{ padding: '1.25rem 2.5rem', borderBottom: '1px solid #f1f5f9', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-0.02em' }}>Invoice #{selectedInvoice.invoice_number}</h2>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>Due Date: {formatDate(selectedInvoice.due_date)}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => {
                      window.location.hash = `#/tickets?ref_type=invoice&ref_id=${selectedInvoice.id}`;
                    }}
                    style={{
                      background: 'rgba(26, 86, 219, 0.05)',
                      border: 'none',
                      color: 'var(--primary, #1a56db)',
                      cursor: 'pointer',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    Raise Ticket
                  </button>
                  <button 
                    onClick={() => triggerDownload(selectedInvoice)}
                    style={{
                      background: 'rgba(26, 86, 219, 0.05)',
                      border: 'none',
                      color: 'var(--primary, #1a56db)',
                      cursor: 'pointer',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Download size={16} /> PDF
                  </button>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 900, 
                    color: getStatusColor(selectedInvoice.status), 
                    background: `${getStatusColor(selectedInvoice.status)}15`, 
                    padding: '0.4rem 1rem', 
                    borderRadius: '1.5rem' 
                  }}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                {loadingDetail ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
                    <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                      <Clock size={40} color="var(--primary, #1a56db)" />
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '1rem' }}>Getting Invoice data...</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
                        <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Product Variant ID</div>
                        <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>Qty</div>
                        <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Rate</div>
                        <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: 'var(--primary, #1a56db)' }}>Net Amount</div>
                      </div>

                      {/* Data Rows */}
                      {invoiceLines.map((item, idx) => {
                        const isLast = idx === invoiceLines.length - 1;
                        const borderStyle = isLast ? 'none' : '1px solid #e5e7eb';

                        return (
                          <React.Fragment key={item.id || idx}>
                            <div style={{ display: 'contents' }}>
                              <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: borderStyle }}>{idx + 1}</div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: borderStyle }}>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827', marginBottom: '0.25rem' }}>Product: {item.product_id}</div>
                              </div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: borderStyle }}>
                                <span style={{ background: 'rgba(26, 86, 219, 0.05)', color: 'var(--primary, #1a56db)', padding: '0.4rem 0.85rem', borderRadius: '0.65rem', fontWeight: 900, fontSize: '0.9rem' }}>
                                  {item.quantity}
                                </span>
                              </div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: borderStyle }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>${Number(item.unit_price).toFixed(2)}</div>
                              </div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', textAlign: 'right', fontSize: '1.15rem', fontWeight: 950, color: 'var(--primary, #1a56db)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: borderStyle }}>
                                ${Number(item.line_total).toFixed(2)}
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Summary Card */}
                    <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '1.5rem', border: '2px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111827' }}>Total Invoiced Amount</span>
                        <span style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--primary, #1a56db)' }}>
                          ${Number(selectedInvoice.total_amount).toFixed(2)}
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
              <div style={{ fontWeight: 700 }}>Select an invoice to view details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
