import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  Package,
  Search,
  Clock,
  ShoppingBag,
  ChevronLeft,
  RefreshCw
} from 'lucide-react';
import { EnquiriesProps, Enquiry } from './Enquiries';

export const EnquiriesDesktop: React.FC<EnquiriesProps> = ({
  enquiries,
  loading,
  error,
  search,
  setSearch,
  selectedEnquiry,
  setSelectedEnquiry,
  enquiryLines,
  loadingDetail,
  fetchEnquiryDetail,
  refreshEnquiries
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const getStatusColor = (status: Enquiry['status']) => {
    switch (status) {
      case 'CONVERTED':
        return '#10b981';
      case 'SUBMITTED':
        return '#f59e0b';
      case 'DRAFT':
        return '#38bdf8';
      case 'CLOSED':
        return '#6b7280';
      default:
        return '#ef4444';
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

  const filteredEnquiries = enquiries.filter(enq => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    const enqNo = enq.enquiry_number.toLowerCase();
    const status = enq.status.toLowerCase();
    const remarks = (enq.remarks || '').toLowerCase();
    const formattedDate = formatDate(enq.enquiry_date).toLowerCase();

    const enqStr = `enquiry ${enqNo}`;
    const enqHashStr = `enquiry #${enqNo}`;
    const hashStr = `#${enqNo}`;

    return enqNo.includes(query) ||
           status.includes(query) ||
           remarks.includes(query) ||
           formattedDate.includes(query) ||
           enqStr.includes(query) ||
           enqHashStr.includes(query) ||
           hashStr.includes(query);
  });

  return (
    <div style={{
      height: 'calc(100vh - 74px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      padding: '2rem',
      position: 'relative',
      zIndex: 1,
      backgroundColor: '#f9fafb',
      fontFamily: '"Outfit", "Inter", sans-serif',
      boxSizing: 'border-box'
    }}>
      <style>{`
        .enquiries-refresh-btn {
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
        .enquiries-refresh-btn:hover {
          background: #f1f5f9;
          color: #1f2937;
          border-color: #cbd5e1;
          transform: scale(1.05);
        }
        .enquiries-refresh-btn:active {
          background: #e2e8f0;
          transform: scale(0.95);
        }
      `}</style>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, marginBottom: '0.25rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#111827' }}>Product Enquiries</h1>
          <p style={{ margin: '0.1rem 0 0 0', color: '#6b7280', fontSize: '1rem' }}>View history of your submitted product enquiries</p>
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
                placeholder="Search Enquiry # or Status..."
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
              className="enquiries-refresh-btn"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (refreshEnquiries) {
                  await refreshEnquiries();
                }
              }}
              title="Refresh Enquiries"
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
            {loading && enquiries.length === 0 ? (
              <div style={{ padding: '4rem 0', textAlign: 'center', color: '#6b7280' }}>
                <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}>
                  <Clock size={32} />
                </div>
                <div>Loading enquiries...</div>
              </div>
            ) : filteredEnquiries.length === 0 ? (
              <div style={{ padding: '4rem 0', textAlign: 'center', background: '#fff', borderRadius: '1.25rem', border: '1px solid #e5e7eb' }}>
                <Package size={42} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                <div style={{ color: '#6b7280', fontWeight: 600, fontSize: '0.9rem' }}>No enquiries found</div>
              </div>
            ) : (() => {
              const currentYear = new Date().getFullYear();
              const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
              ];

              const sorted = [...filteredEnquiries].sort((a, b) => {
                const dateA = a.enquiry_date ? new Date(a.enquiry_date).getTime() : 0;
                const dateB = b.enquiry_date ? new Date(b.enquiry_date).getTime() : 0;
                return dateB - dateA;
              });

              const groups: { label: string; items: typeof filteredEnquiries }[] = [];
              sorted.forEach(enq => {
                const date = enq.enquiry_date ? new Date(enq.enquiry_date) : new Date();
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
                existing.items.push(enq);
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
                        {group.items.map(enq => (
                          <motion.div
                            key={enq.id}
                            onClick={() => {
                              setSelectedEnquiry(enq);
                              fetchEnquiryDetail(enq);
                            }}
                            whileHover={{ y: -2 }}
                            style={{
                              background: selectedEnquiry?.id === enq.id ? 'rgba(26, 86, 219, 0.04)' : '#fff',
                              borderRadius: '1rem',
                              padding: '1.25rem',
                              cursor: 'pointer',
                              border: `2px solid ${selectedEnquiry?.id === enq.id ? 'var(--primary, #1a56db)' : '#f1f5f9'}`,
                              transition: 'all 0.2s',
                              boxShadow: selectedEnquiry?.id === enq.id ? '0 10px 15px -3px rgba(26, 86, 219, 0.05)' : '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827' }}>Enquiry {enq.enquiry_number}</div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: 900, 
                                  color: getStatusColor(enq.status), 
                                  background: `${getStatusColor(enq.status)}15`, 
                                  padding: '0.2rem 0.6rem', 
                                  borderRadius: '1rem' 
                                }}>
                                  {enq.status}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                {formatDate(enq.enquiry_date)}
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
          {selectedEnquiry ? (
            <>
              {(() => {
                const estimatedTotal = enquiryLines.reduce((sum, line) => sum + (line.quantity * (line.price || 0)), 0);
                return (
                  <>
                    <div style={{ padding: '1.25rem 2.5rem', borderBottom: '1px solid #f1f5f9', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-0.02em' }}>Enquiry #{selectedEnquiry.enquiry_number}</h2>
                            <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>{formatDate(selectedEnquiry.enquiry_date)}</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        {!loadingDetail && (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Value</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#1e293b' }}>₹{estimatedTotal.toFixed(2)}</div>
                          </div>
                        )}
                        <span style={{ 
                          fontSize: '0.85rem', 
                          fontWeight: 900, 
                          color: getStatusColor(selectedEnquiry.status), 
                          background: `${getStatusColor(selectedEnquiry.status)}15`, 
                          padding: '0.4rem 1rem', 
                          borderRadius: '1.5rem' 
                        }}>
                          {selectedEnquiry.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                      {loadingDetail ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
                          <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                            <Clock size={40} color="var(--primary, #1a56db)" />
                          </div>
                          <div style={{ color: '#6b7280', fontSize: '1rem' }}>Getting Enquiry data...</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                          {selectedEnquiry.remarks && (
                            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0', fontSize: '0.95rem' }}>
                              <div style={{ color: '#6b7280', marginBottom: '0.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>Client Remarks</div>
                              <div style={{ color: '#374151', fontStyle: 'italic' }}>"{selectedEnquiry.remarks}"</div>
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
                            gridTemplateColumns: '60px 1fr 120px 120px 140px'
                          }}>
                            {/* Header Row */}
                            <div style={{ display: 'contents', fontWeight: 800, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              <div style={{ padding: '1rem', textAlign: 'center', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>#</div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Product Variant Name</div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Unit Price</div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>Quantity</div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: 'var(--primary, #1a56db)' }}>Subtotal</div>
                            </div>

                            {/* Data Rows */}
                            {enquiryLines.map((item, idx) => {
                              const isLast = idx === enquiryLines.length - 1;
                              const borderStyle = isLast ? 'none' : '1px solid #e5e7eb';
                              const itemPrice = item.price || 0;
                              const subtotal = item.quantity * itemPrice;

                              return (
                                <React.Fragment key={item.id || idx}>
                                  <div style={{ display: 'contents' }}>
                                    <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: borderStyle }}>{idx + 1}</div>
                                    <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: borderStyle }}>
                                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827', marginBottom: '0.25rem' }}>{item.product_name || `Variant ${item.variant_id}`}</div>
                                    </div>
                                    <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '0.95rem', fontWeight: 700, color: '#374151', borderBottom: borderStyle }}>
                                      ₹{itemPrice.toFixed(2)}
                                    </div>
                                    <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: borderStyle }}>
                                      <span style={{ background: 'rgba(26, 86, 219, 0.05)', color: 'var(--primary, #1a56db)', padding: '0.4rem 1.25rem', borderRadius: '0.65rem', fontWeight: 900, fontSize: '0.95rem' }}>
                                        {item.quantity}
                                      </span>
                                    </div>
                                    <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '0.95rem', fontWeight: 900, color: 'var(--primary, #1a56db)', borderBottom: borderStyle }}>
                                      ₹{subtotal.toFixed(2)}
                                    </div>
                                  </div>
                                </React.Fragment>
                              );
                            })}

                            {/* Total Row */}
                            <div style={{ display: 'contents' }}>
                              <div style={{ 
                                gridColumn: 'span 4', 
                                padding: '1.25rem 1rem', 
                                borderTop: '2px solid #e5e7eb', 
                                background: '#f8fafc',
                                textAlign: 'right',
                                fontWeight: 800,
                                fontSize: '0.95rem',
                                color: '#475569'
                              }}>
                                Total Estimated Value:
                              </div>
                              <div style={{ 
                                padding: '1.25rem 1rem', 
                                borderTop: '2px solid #e5e7eb', 
                                borderLeft: '1px solid #e5e7eb', 
                                background: '#f8fafc',
                                textAlign: 'right',
                                fontWeight: 950,
                                fontSize: '1.1rem',
                                color: 'var(--primary, #1a56db)'
                              }}>
                                ₹{estimatedTotal.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', color: '#9ca3af' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '2.5rem', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                <ShoppingBag size={48} style={{ opacity: 0.15 }} />
              </div>
              <div style={{ fontWeight: 700 }}>Select an enquiry to view details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
