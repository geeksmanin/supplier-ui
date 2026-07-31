import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Package,
  Search,
  Calendar,
  Clock,
  ShoppingBag,
  CreditCard,
  RefreshCw
} from 'lucide-react';
import { OrdersProps, Order } from './Orders';

export const OrdersMobile: React.FC<OrdersProps> = ({
  orders,
  loading,
  error,
  search,
  setSearch,
  selectedOrder,
  setSelectedOrder,
  draftCart,
  resolvedDraftLines,
  loadingDraft,
  showDraftDetail,
  setShowDraftDetail,
  updateDraftQty,
  removeDraftItem,
  submitDraftOrder,
  orderLines,
  timeline,
  loadingDetail,
  fetchOrderDetail,
  fetchOrders
}) => {
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const getStatusColor = (status: Order['status']) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('fulfill') || s.includes('approve') || s.includes('confirm') || s.includes('closed')) return '#10b981';
    if (s.includes('pending') || s.includes('draft') || s.includes('partial')) return '#f59e0b';
    if (s.includes('cancel')) return '#ef4444';
    return '#38bdf8';
  };

  const getStatusProgress = (status: Order['status']) => {
    switch (status) {
      case 'DRAFT': return 20;
      case 'PENDING_APPROVAL': return 40;
      case 'APPROVED': return 60;
      case 'CONFIRMED': return 80;
      case 'FULFILLED': return 100;
      case 'CLOSED': return 100;
      default: return 0;
    }
  };

  const ORDER_STATUS_STEPS = [
    { label: 'Draft' },
    { label: 'Pending' },
    { label: 'Approved' },
    { label: 'Confirm' },
    { label: 'Fulfill' }
  ];

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredOrders = orders.filter(order => {
    const query = search.trim().toLowerCase();
    if (!query) return true;

    const orderNo = order.order_number.toLowerCase();
    const status = order.status.toLowerCase();
    const formattedDate = formatDate(order.order_date).toLowerCase();
    const amountStr = order.total_amount.toString();
    const formattedAmount = `₹${order.total_amount.toFixed(2)}`;

    const orderStr = `order ${orderNo}`;
    const orderHashStr = `order #${orderNo}`;
    const hashStr = `#${orderNo}`;

    return orderNo.includes(query) ||
           status.includes(query) ||
           formattedDate.includes(query) ||
           amountStr.includes(query) ||
           formattedAmount.includes(query) ||
           orderStr.includes(query) ||
           orderHashStr.includes(query) ||
           hashStr.includes(query);
  });

  const resolveImageUrl = (path?: string) => {
    if (!path) return "/assets/pharmaceutical-placeholder-premium.png";
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    return `/api/v1/media/default-tenant/product-images/${path}`;
  };

  return (
    <div style={{ padding: '1rem', paddingTop: '0.5rem', paddingBottom: '100px', backgroundColor: '#f9fafb', fontFamily: '"Outfit", "Inter", sans-serif', minHeight: '100vh', boxSizing: 'border-box' }}>
      {(selectedOrder || showDraftDetail) && (
        <style>{`
          main {
            overflow: hidden !important;
          }
        `}</style>
      )}
      {/* Floating/Fixed Search Bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#f9fafb',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #e5e7eb',
        margin: '0 -1rem 1rem -1rem',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={18} />
            <input
              type="text"
              placeholder="Search by Order ID or Status..."
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
            onClick={fetchOrders}
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

      {/* Draft Order Cart Item */}
      {draftCart.length > 0 && (
        <div
          onClick={() => {
            setSelectedOrder(null);
            setShowDraftDetail(true);
          }}
          style={{
            background: '#fff',
            borderRadius: '1.25rem',
            padding: '1rem',
            cursor: 'pointer',
            border: '2px solid #1a56db',
            marginBottom: '1rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827' }}>Active Order Cart</div>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 900,
              color: '#1a56db',
              background: 'rgba(26, 86, 219, 0.15)',
              padding: '0.2rem 0.5rem',
              borderRadius: '0.75rem'
            }}>
              DRAFT
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            {draftCart.length} items in cart
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
          <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
            <Clock size={40} color="var(--primary, #1a56db)" />
          </div>
          <span style={{ color: '#6b7280', fontWeight: 500 }}>Loading orders...</span>
        </div>
      ) : filteredOrders.length === 0 && draftCart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#fff', borderRadius: '1.5rem', border: '1px solid #e5e7eb' }}>
          <Package size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#6b7280', fontSize: '1.1rem', margin: 0 }}>No orders found</h3>
        </div>
      ) : (() => {
        const currentYear = new Date().getFullYear();
        const monthNames = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];

        const sorted = [...filteredOrders].sort((a, b) => {
          const dateA = a.order_date ? new Date(a.order_date).getTime() : 0;
          const dateB = b.order_date ? new Date(b.order_date).getTime() : 0;
          return dateB - dateA;
        });

        const groups: { label: string; items: typeof filteredOrders }[] = [];
        sorted.forEach(order => {
          const date = order.order_date ? new Date(order.order_date) : new Date();
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
          existing.items.push(order);
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
                      {group.items.map((order) => (
                        <motion.div
                          key={order.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fetchOrderDetail(order)}
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
                                <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Order {order.order_number}</div>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                  <div style={{
                                    fontSize: '0.6rem',
                                    fontWeight: 950,
                                    color: getStatusColor(order.status),
                                    background: `${getStatusColor(order.status)}15`,
                                    padding: '0.15rem 0.4rem',
                                    borderRadius: '0.5rem'
                                  }}>
                                    {order.status}
                                  </div>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div style={{ margin: '0.75rem 0', padding: '0 0.25rem' }}>
                                {order.status === 'CANCELLED' ? (
                                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <div style={{ flex: 1, height: '2px', background: '#e2e8f0' }} />
                                    <div style={{
                                      width: '12px',
                                      height: '12px',
                                      borderRadius: '50%',
                                      background: '#ef4444',
                                      border: '2px solid #ef4444',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      zIndex: 2
                                    }}>
                                      <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#fff' }} />
                                    </div>
                                    <div style={{ flex: 1, height: '2px', background: '#e2e8f0' }} />
                                  </div>
                                ) : (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
                                    {ORDER_STATUS_STEPS.map((_, idx) => {
                                      const progress = getStatusProgress(order.status);
                                      const totalSteps = ORDER_STATUS_STEPS.length - 1;
                                      const stepProgress = (idx / totalSteps) * 100;
                                      const isPast = progress >= stepProgress;

                                      return (
                                        <React.Fragment key={idx}>
                                          <div style={{
                                            width: '12px',
                                            height: '12px',
                                            borderRadius: '50%',
                                            border: `2px solid ${isPast ? 'var(--primary, #1a56db)' : '#e2e8f0'}`,
                                            background: isPast ? 'var(--primary, #1a56db)' : '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            zIndex: 2,
                                            position: 'relative'
                                          }}>
                                            {isPast && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#fff' }} />}
                                          </div>
                                          {idx < totalSteps && (
                                            <div style={{
                                              flex: 1,
                                              height: '2px',
                                              background: progress > stepProgress ? 'var(--primary, #1a56db)' : '#e2e8f0',
                                              zIndex: 1
                                            }} />
                                          )}
                                        </React.Fragment>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <Calendar size={12} />
                                  {formatDate(order.order_date)}
                                </span>
                                <span style={{ fontWeight: 700, color: '#111827', marginLeft: 'auto' }}>
                                  ₹{Number(order.total_amount).toFixed(2)}
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
        {(selectedOrder || showDraftDetail) && (
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
            onClick={() => {
              setSelectedOrder(null);
              setShowDraftDetail(false);
            }}
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
                        onClick={() => {
                          setSelectedOrder(null);
                          setShowDraftDetail(false);
                        }}
                        style={{ background: '#f1f5f9', border: 'none', width: '36px', height: '36px', borderRadius: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <ChevronLeft size={20} color="#6b7280" />
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#1e293b' }}>
                          {showDraftDetail ? 'Active Order Cart' : `Order #${selectedOrder?.order_number}`}
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8' }}>
                          {showDraftDetail ? 'Review and configure quantities' : formatDate(selectedOrder?.order_date || '')}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {!showDraftDetail && selectedOrder && (
                        <button
                          onClick={() => {
                            setSelectedOrder(null);
                            window.location.hash = `#/tickets?ref_type=order&ref_id=${selectedOrder.id}`;
                          }}
                          style={{
                            background: 'rgba(26, 86, 219, 0.05)',
                            border: 'none',
                            color: 'var(--primary, #1a56db)',
                            cursor: 'pointer',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '0.65rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontWeight: 800,
                            fontSize: '0.75rem',
                          }}
                        >
                          Support
                        </button>
                      )}
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 950,
                        color: '#1a56db',
                        background: 'rgba(26, 86, 219, 0.15)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '0.75rem'
                      }}>
                        {showDraftDetail ? 'DRAFT' : selectedOrder?.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
                {showDraftDetail ? (
                  loadingDraft ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
                      <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                        <Clock size={32} color="#1a56db" />
                      </div>
                      <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600 }}>Loading draft details...</span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1e293b' }}>Order Items ({resolvedDraftLines.length})</h3>
                        {resolvedDraftLines.map((line, idx) => {
                          const variantImg = resolveImageUrl(line.media_paths?.[0]);
                          return (
                            <div
                              key={line.id || idx}
                              style={{ background: '#fff', padding: '1rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                            >
                              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <img
                                  src={variantImg}
                                  alt={line.sku}
                                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', flexShrink: 0 }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', lineHeight: 1.3, marginBottom: '0.25rem' }}>{line.product_name}</div>
                                  <div style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>SKU: {line.sku}</div>
                                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary, #1a56db)', marginBottom: '0.5rem' }}>₹{line.price.toFixed(2)}</div>

                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                    {/* Quantity Selector */}
                                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                                      <button
                                        onClick={() => updateDraftQty(line.id, line.quantity - 1)}
                                        style={{ border: 'none', background: 'transparent', width: '30px', height: '30px', cursor: 'pointer', color: '#64748b' }}
                                      >
                                        -
                                      </button>
                                      <input
                                        type="number"
                                        value={line.quantity}
                                        onChange={(e) => updateDraftQty(line.id, parseInt(e.target.value) || 1)}
                                        style={{ width: '35px', height: '30px', border: 'none', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700 }}
                                      />
                                      <button
                                        onClick={() => updateDraftQty(line.id, line.quantity + 1)}
                                        style={{ border: 'none', background: 'transparent', width: '30px', height: '30px', cursor: 'pointer', color: '#64748b' }}
                                      >
                                        +
                                      </button>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                      onClick={() => removeDraftItem(line.id)}
                                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Summary Card */}
                      <div style={{ background: '#fff', padding: '1rem 1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#6b7280' }}>Net Order Value</span>
                        <span style={{ fontSize: '1.3rem', fontWeight: 950, color: 'var(--primary, #1a56db)' }}>
                          ₹{resolvedDraftLines.reduce((sum, line) => sum + (line.quantity * line.price), 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Submit Button */}
                      <div style={{ display: 'flex', justifyContent: 'stretch', marginTop: '1rem' }}>
                        <button
                          onClick={() => submitDraftOrder()}
                          style={{
                            backgroundColor: '#1a56db',
                            color: '#fff',
                            border: 'none',
                            padding: '0.85rem 2rem',
                            borderRadius: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            width: '100%',
                            boxShadow: '0 4px 12px rgba(26, 86, 219, 0.2)',
                            fontSize: '1rem'
                          }}
                        >
                          Place Order
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {/* Status Tracking */}
                    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 0.5rem' }}>
                        {selectedOrder.status !== 'CANCELLED' && (
                          <div style={{ position: 'absolute', top: '10px', left: 'calc(0.5rem + 10px)', right: 'calc(0.5rem + 10px)', height: '2px', background: '#f1f5f9', zIndex: 1 }} />
                        )}

                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          left: 'calc(0.5rem + 10px)',
                          width: selectedOrder.status === 'CANCELLED' ? 0 : `calc((100% - 1rem - 20px) * ${getStatusProgress(selectedOrder.status) / 100})`,
                          height: '2px', background: 'var(--primary, #1a56db)', zIndex: 1,
                          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                        }} />

                        {selectedOrder.status === 'CANCELLED' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 2, width: '100%' }}>
                            <div style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '10px',
                              background: '#ef4444',
                              border: '3px solid #fff',
                              boxShadow: '0 0 0 1px #ef4444',
                            }} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#ef4444', textTransform: 'uppercase' }}>Order Cancelled</span>
                          </div>
                        ) : (
                          ORDER_STATUS_STEPS.map((step, idx) => {
                            const progress = getStatusProgress(selectedOrder.status);
                            const stepProgress = (idx / (ORDER_STATUS_STEPS.length - 1)) * 100;
                            const isCompleted = progress >= stepProgress;

                            return (
                              <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 2 }}>
                                <div style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '10px',
                                  background: isCompleted ? 'var(--primary, #1a56db)' : '#fff',
                                  border: isCompleted ? '4px solid #fff' : '2px solid #e2e8f0',
                                  boxShadow: isCompleted ? '0 0 0 1px var(--primary, #1a56db)' : 'none',
                                  transition: 'all 0.3s ease'
                                }} />
                                <span style={{
                                  fontSize: '0.6rem',
                                  fontWeight: isCompleted ? 900 : 700,
                                  color: isCompleted ? '#111827' : '#94a3b8'
                                }}>{step.label}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1e293b' }}>Items ({orderLines.length})</h3>
                      {orderLines.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          style={{ background: '#fff', padding: '1rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                        >
                          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '11px', background: '#f1f5f9', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 900, flexShrink: 0, marginTop: '0.2rem' }}>
                              {idx + 1}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', lineHeight: 1.3, marginBottom: '0.25rem' }}>{item.product_name_snapshot}</div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                  Qty: <strong style={{ color: 'var(--primary, #1a56db)' }}>{item.quantity}</strong> &times; ₹{Number(item.unit_price).toFixed(2)}
                                </span>
                                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827' }}>
                                  ₹{Number(item.line_total).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total Summary */}
                    <div style={{ background: '#fff', padding: '1rem 1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#6b7280' }}>Net Payable Amount</span>
                      <span style={{ fontSize: '1.3rem', fontWeight: 950, color: 'var(--primary, #1a56db)' }}>
                        ₹{Number(selectedOrder.total_amount).toFixed(2)}
                      </span>
                    </div>

                    {/* Timeline */}
                    {timeline.length > 0 && (
                      <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6b7280', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Log & Remarks</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1.25rem', borderLeft: '2px solid #e5e7eb' }}>
                          {timeline.map((event, idx) => (
                            <div key={event.id || idx} style={{ position: 'relative' }}>
                              <div style={{
                                position: 'absolute',
                                left: '-1.6rem',
                                top: '0.2,rem',
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary, #1a56db)',
                                border: '2px solid #fff'
                              }} />
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#111827' }}>{event.action}</span>
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(event.created_at)}</span>
                              </div>
                              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>By {event.actor_name}</p>
                              {event.remark && (
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', color: '#374151', fontStyle: 'italic', background: '#f9fafb', padding: '0.4rem 0.6rem', borderRadius: '0.4rem' }}>
                                  "{event.remark}"
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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
