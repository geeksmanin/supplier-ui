import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Package,
  Search,
  Clock,
  Truck,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Info,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { OrdersProps, Order } from './Orders';

export const OrdersDesktop: React.FC<OrdersProps> = ({
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
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const handleWheel = (e: React.WheelEvent) => {
    if (leftColumnRef.current && !leftColumnRef.current.contains(e.target as Node)) {
      leftColumnRef.current.scrollTop += e.deltaY;
    }
  };
  const [remarks, setRemarks] = useState('');
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
    { label: 'Pending Approval' },
    { label: 'Approved' },
    { label: 'Confirmed' },
    { label: 'Fulfilled' }
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

  if (showDraftDetail) {
    const subtotal = resolvedDraftLines.reduce((sum, line) => sum + (line.quantity * line.price), 0);
    return (
      <div 
        onWheel={handleWheel}
        style={{
          height: 'calc(100vh - 64px)',
          overflow: 'hidden',
          padding: '2rem',
          backgroundColor: '#f9fafb',
          fontFamily: '"Outfit", "Inter", sans-serif',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <button 
            onClick={() => setShowDraftDetail(false)} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 800, padding: 0 }}
          >
            <ChevronLeft size={20} />
            <span style={{ fontSize: '0.9rem', letterSpacing: '0.02em' }}>BACK TO PROCUREMENT HISTORY</span>
          </button>
          <button 
            onClick={() => {
              localStorage.setItem('customer_order_cart', '[]');
              window.dispatchEvent(new Event('customer-cart-update'));
              setShowDraftDetail(false);
            }} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #ef4444', borderRadius: '0.75rem', color: '#ef4444', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 4px rgba(239, 68, 68, 0.05)' }}
          >
            <Trash2 size={14} />
            Empty Cart
          </button>
        </div>

        {/* Dedicated Checkout Container */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 380px', 
          gap: '2.5rem', 
          alignItems: 'stretch', 
          maxWidth: '1300px', 
          width: '100%',
          margin: '0 auto',
          flex: 1,
          minHeight: 0
        }}>
          {/* Left Column: Cart Items */}
          <div ref={leftColumnRef} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', height: '100%', paddingRight: '0.5rem' }}>
            {loadingDraft ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', gap: '1rem', background: '#fff', borderRadius: '1.5rem', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                  <Clock size={40} color="var(--primary, #1a56db)" />
                </div>
                <div style={{ color: '#6b7280', fontSize: '1rem' }}>Loading draft details...</div>
              </div>
            ) : resolvedDraftLines.length === 0 ? (
              <div style={{ padding: '6rem 0', textAlign: 'center', background: '#fff', borderRadius: '1.5rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <ShoppingBag size={48} style={{ opacity: 0.15 }} />
                <div style={{ color: '#6b7280', fontWeight: 700 }}>No items in your order cart</div>
              </div>
            ) : (
              resolvedDraftLines.map((line) => {
                const variantImg = resolveImageUrl(line.media_paths?.[0]);
                return (
                  <div 
                    key={line.id} 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '100px 1fr 180px', 
                      gap: '1.5rem', 
                      padding: '1.5rem', 
                      background: '#fff', 
                      borderRadius: '1.5rem', 
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', 
                      border: '1px solid #f1f5f9', 
                      alignItems: 'center' 
                    }}
                  >
                    <img 
                      src={variantImg} 
                      alt={line.sku} 
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff' }} 
                    />
                    <div>
                      <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#1f2937' }}>{line.product_name}</h3>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#6b7280' }}>SKU: {line.sku}</p>
                      <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary, #1a56db)' }}>₹{line.price.toFixed(2)}</p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                        <button 
                          onClick={() => updateDraftQty(line.id, line.quantity - 1)}
                          style={{ border: 'none', background: 'transparent', width: '30px', height: '30px', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}
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
                          style={{ border: 'none', background: 'transparent', width: '30px', height: '30px', cursor: 'pointer', color: '#64748b', fontWeight: 'bold' }}
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeDraftItem(line.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: 0 }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Order Summary Card */}
          <aside style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.75rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', position: 'sticky', top: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: '#1f2937' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem' }}>
                <span>Subtotal ({resolvedDraftLines.length} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1f2937' }}>Estimated Order Value</span>
                <span style={{ fontWeight: 800, fontSize: '1.35rem', color: 'var(--primary, #1a56db)' }}>₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                <MessageSquare size={14} /> Order Remarks
              </label>
              <textarea
                placeholder="Add any specific instructions..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1.5px solid #e2e8f0', fontSize: '0.9rem', outline: 'none', background: '#f8fafc', resize: 'none', fontFamily: 'inherit' }}
              />
            </div>

            <button 
              onClick={() => submitDraftOrder(remarks)}
              disabled={resolvedDraftLines.length === 0}
              style={{
                width: '100%',
                backgroundColor: 'var(--primary, #1a56db)',
                color: '#fff',
                border: 'none',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(26, 86, 219, 0.3)',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <CheckCircle size={18} />
              Place Order
            </button>
          </aside>
        </div>
      </div>
    );
  }

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
        .orders-refresh-btn {
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
        .orders-refresh-btn:hover {
          background: #f1f5f9;
          color: #1f2937;
          border-color: #cbd5e1;
          transform: scale(1.05);
        }
        .orders-refresh-btn:active {
          background: #e2e8f0;
          transform: scale(0.95);
        }
      `}</style>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0, marginBottom: '0.25rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#111827' }}>Procurement History</h1>
          <p style={{ margin: '0.1rem 0 0 0', color: '#6b7280', fontSize: '1rem' }}>Track and manage your orders in real-time</p>
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
                placeholder="Search ID or Status..."
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
              className="orders-refresh-btn"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (fetchOrders) {
                  await fetchOrders();
                }
              }}
              title="Refresh Orders"
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
            {/* Draft Order Cart Item */}
            {draftCart.length > 0 && (
              <div 
                onClick={() => {
                  setSelectedOrder(null);
                  setShowDraftDetail(true);
                }}
                style={{
                  background: showDraftDetail ? 'rgba(26, 86, 219, 0.04)' : '#fff',
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  border: `2px solid ${showDraftDetail ? 'var(--primary, #1a56db)' : '#f1f5f9'}`,
                  transition: 'all 0.2s',
                  boxShadow: showDraftDetail ? '0 10px 15px -3px rgba(26, 86, 219, 0.05)' : '0 2px 4px rgba(0,0,0,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827' }}>Active Order Cart</div>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 900, 
                    color: 'var(--primary, #1a56db)', 
                    background: 'rgba(26, 86, 219, 0.15)', 
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '1rem' 
                  }}>
                    DRAFT
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {draftCart.length} items in cart
                </div>
              </div>
            )}

            {loading && orders.length === 0 ? (
              <div style={{ padding: '4rem 0', textAlign: 'center', color: '#6b7280' }}>
                <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}>
                  <Clock size={32} />
                </div>
                <div>Loading orders...</div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              </div>
            ) : filteredOrders.length === 0 && draftCart.length === 0 ? (
              <div style={{ padding: '4rem 0', textAlign: 'center', background: '#fff', borderRadius: '1.25rem', border: '1px solid #e5e7eb' }}>
                <Package size={42} color="#d1d5db" style={{ marginBottom: '1rem' }} />
                <div style={{ color: '#6b7280', fontWeight: 600, fontSize: '0.9rem' }}>No orders found</div>
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
                        {group.items.map(order => (
                          <motion.div
                            key={order.id}
                            onClick={() => fetchOrderDetail(order)}
                            whileHover={{ y: -2 }}
                            style={{
                              background: selectedOrder?.id === order.id ? 'rgba(26, 86, 219, 0.04)' : '#fff',
                              borderRadius: '1rem',
                              padding: '1.25rem',
                              cursor: 'pointer',
                              border: `2px solid ${selectedOrder?.id === order.id ? 'var(--primary, #1a56db)' : '#f1f5f9'}`,
                              transition: 'all 0.2s',
                              boxShadow: selectedOrder?.id === order.id ? '0 10px 15px -3px rgba(26, 86, 219, 0.05)' : '0 2px 4px rgba(0,0,0,0.02)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827' }}>Order {order.order_number}</div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <div style={{ 
                                  fontSize: '0.75rem', 
                                  fontWeight: 900, 
                                  color: getStatusColor(order.status), 
                                  background: `${getStatusColor(order.status)}15`, 
                                  padding: '0.2rem 0.6rem', 
                                  borderRadius: '1rem' 
                                }}>
                                  {order.status}
                                </div>
                              </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                                {formatDate(order.order_date)}
                              </div>
                              <div style={{ fontWeight: 900, color: '#111827', fontSize: '1.05rem' }}>
                                ₹{Number(order.total_amount).toFixed(2)}
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
          {showDraftDetail ? (
            <>
              <div style={{ padding: '1.25rem 2.5rem', borderBottom: '1px solid #f1f5f9', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-0.02em' }}>Active Order Cart</h2>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>Review and configure quantities before placing order</div>
                </div>
                <span style={{ 
                  fontSize: '0.85rem', 
                  fontWeight: 900, 
                  color: 'var(--primary, #1a56db)', 
                  background: 'rgba(26, 86, 219, 0.1)', 
                  padding: '0.4rem 1rem', 
                  borderRadius: '1.5rem' 
                }}>
                  DRAFT
                </span>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                {loadingDraft ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
                    <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                      <Clock size={40} color="#1a56db" />
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '1rem' }}>Loading draft details...</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Itemized List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {resolvedDraftLines.map((line) => {
                        const variantImg = resolveImageUrl(line.media_paths?.[0]);
                        return (
                          <div 
                            key={line.id} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between', 
                              padding: '1rem', 
                              borderRadius: '1rem', 
                              border: '1px solid #e5e7eb',
                              background: '#f9fafb'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <img 
                                src={variantImg} 
                                alt={line.sku} 
                                style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }} 
                              />
                              <div>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827' }}>{line.product_name}</div>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>SKU: {line.sku}</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary, #1a56db)', marginTop: '0.25rem' }}>₹{line.price.toFixed(2)}</div>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
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
                        );
                      })}
                    </div>

                    {/* Summary Card */}
                    <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '1.5rem', border: '2px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111827' }}>Net Order Value</span>
                        <span style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--primary, #1a56db)' }}>
                          ₹{resolvedDraftLines.reduce((sum, line) => sum + (line.quantity * line.price), 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                      <button 
                        onClick={() => submitDraftOrder()}
                        style={{
                          backgroundColor: '#1a56db',
                          color: '#fff',
                          border: 'none',
                          padding: '0.75rem 2rem',
                          borderRadius: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          boxShadow: '0 10px 15px -3px rgba(26, 86, 219, 0.3)'
                        }}
                      >
                        Place Order
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : selectedOrder ? (
            <>
              <div style={{ padding: '1.25rem 2.5rem', borderBottom: '1px solid #f1f5f9', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 950, color: '#1e293b', letterSpacing: '-0.02em' }}>Order #{selectedOrder.order_number}</h2>
                      <div style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700 }}>{formatDate(selectedOrder.order_date)}</div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button
                    onClick={() => {
                      window.location.hash = `#/tickets?ref_type=order&ref_id=${selectedOrder.id}`;
                    }}
                    style={{
                      background: 'rgba(26, 86, 219, 0.05)',
                      border: 'none',
                      color: 'var(--primary, #1a56db)',
                      cursor: 'pointer',
                      padding: '0.4rem 1rem',
                      borderRadius: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      transition: 'all 0.2s'
                    }}
                  >
                    <MessageSquare size={16} /> Raise Ticket
                  </button>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    fontWeight: 900, 
                    color: getStatusColor(selectedOrder.status), 
                    background: `${getStatusColor(selectedOrder.status)}15`, 
                    padding: '0.4rem 1rem', 
                    borderRadius: '1.5rem' 
                  }}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                {loadingDetail ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
                    <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
                      <Clock size={40} color="var(--primary, #1a56db)" />
                    </div>
                    <div style={{ color: '#6b7280', fontSize: '1rem' }}>Getting Order data...</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Logistics Timeline Progress */}
                    <div style={{ background: '#f8fafc', padding: '1.75rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}>
                      <div style={{ position: 'relative', padding: '0 0' }}>
                        {selectedOrder.status !== 'CANCELLED' && (
                          <div style={{ position: 'absolute', top: '15px', left: '50px', right: '50px', height: '4px', background: '#e2e8f0', zIndex: 1, borderRadius: '2px' }} />
                        )}

                        <div style={{
                          position: 'absolute',
                          top: '15px',
                          left: '50px',
                          width: selectedOrder.status === 'CANCELLED' ? 0 : `calc((100% - 100px) * ${getStatusProgress(selectedOrder.status) / 100})`,
                          height: '4px',
                          background: 'var(--primary, #1a56db)',
                          zIndex: 1,
                          borderRadius: '2px',
                          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                        }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
                          {selectedOrder.status === 'CANCELLED' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                              <div style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '17px',
                                background: '#ef4444',
                                border: '5px solid #fff',
                                boxShadow: '0 0 0 2px #ef4444',
                              }} />
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#ef4444' }}>Order Cancelled</span>
                            </div>
                          ) : (
                            ORDER_STATUS_STEPS.map((step, idx) => {
                              const progress = getStatusProgress(selectedOrder.status);
                              const stepProgress = (idx / (ORDER_STATUS_STEPS.length - 1)) * 100;
                              const isPast = progress >= stepProgress;

                              return (
                                <div key={step.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', width: '100px' }}>
                                  <div style={{
                                    width: '34px',
                                    height: '34px',
                                    borderRadius: '17px',
                                    background: isPast ? 'var(--primary, #1a56db)' : '#fff',
                                    border: `5px solid ${isPast ? '#fff' : '#e2e8f0'}`,
                                    boxShadow: isPast ? '0 0 0 2px var(--primary, #1a56db)' : 'none',
                                    transition: 'all 0.3s'
                                  }} />
                                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isPast ? '#111827' : '#94a3b8', textAlign: 'center' }}>{step.label}</span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

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
                        <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>Product Details</div>
                        <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', textAlign: 'center' }}>Qty</div>
                        <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', textAlign: 'right' }}>Rate</div>
                        <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', textAlign: 'right', color: 'var(--primary, #1a56db)' }}>Net Amount</div>
                      </div>

                      {/* Data Rows */}
                      {orderLines.map((item, idx) => {
                        const isLast = idx === orderLines.length - 1;
                        const borderStyle = isLast ? 'none' : '1px solid #e5e7eb';

                        return (
                          <React.Fragment key={item.id || idx}>
                            <div style={{ display: 'contents' }}>
                              <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 800, color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: borderStyle }}>{idx + 1}</div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: borderStyle }}>
                                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827', marginBottom: '0.25rem' }}>{item.product_name_snapshot}</div>
                              </div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: borderStyle }}>
                                <span style={{ background: 'rgba(26, 86, 219, 0.05)', color: 'var(--primary, #1a56db)', padding: '0.4rem 0.85rem', borderRadius: '0.65rem', fontWeight: 900, fontSize: '0.9rem' }}>
                                  {item.quantity}
                                </span>
                              </div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderBottom: borderStyle }}>
                                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e293b' }}>₹{Number(item.unit_price).toFixed(2)}</div>
                              </div>
                              <div style={{ padding: '1rem', borderLeft: '1px solid #e5e7eb', textAlign: 'right', fontSize: '1.15rem', fontWeight: 950, color: 'var(--primary, #1a56db)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', borderBottom: borderStyle }}>
                                ₹{Number(item.line_total).toFixed(2)}
                              </div>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Summary Card */}
                    <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '1.5rem', border: '2px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111827' }}>Net Payable Amount</span>
                        <span style={{ fontWeight: 900, fontSize: '2rem', color: 'var(--primary, #1a56db)' }}>
                          ₹{Number(selectedOrder.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Timeline Events */}
                    {timeline.length > 0 && (
                      <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0' }}>
                        <div style={{ color: '#6b7280', marginBottom: '1.25rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.8rem' }}>Order Log & Remarks</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid #e5e7eb' }}>
                          {timeline.map((event, idx) => (
                            <div key={event.id || idx} style={{ position: 'relative' }}>
                              <div style={{
                                position: 'absolute',
                                left: '-1.9rem',
                                top: '0.25rem',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--primary, #1a56db)',
                                border: '2px solid #fff'
                              }} />
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>{event.action}</span>
                                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{formatDate(event.created_at)}</span>
                              </div>
                              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>By {event.actor_name}</p>
                              {event.remark && (
                                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#374151', fontStyle: 'italic', background: '#fff', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb' }}>
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
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', color: '#9ca3af' }}>
              <div style={{ width: '100px', height: '100px', borderRadius: '2.5rem', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f1f5f9' }}>
                <ShoppingBag size={48} style={{ opacity: 0.15 }} />
              </div>
              <div style={{ fontWeight: 700 }}>Select an order to view details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
