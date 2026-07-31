import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ShoppingBag,
  Trash2,
  MessageSquare,
  CheckCircle,
  Grid,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { OrderCartProps } from './OrderCart';

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, options, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', textTransform: 'none' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          borderRadius: '12px',
          border: isOpen ? '1.5px solid #1a56db' : '1.5px solid #e2e8f0',
          fontSize: '0.85rem',
          outline: 'none',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          textAlign: 'left',
          color: selectedOption ? '#1f2937' : '#94a3b8',
          fontWeight: selectedOption ? 500 : 400,
          boxShadow: isOpen ? '0 0 0 4px rgba(26, 86, 219, 0.1)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: '#64748b',
            flexShrink: 0
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '4px',
          }}
        >
          <div
            onClick={() => {
              onChange('');
              setIsOpen(false);
            }}
            style={{
              padding: '0.65rem 0.75rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#94a3b8',
              transition: 'background 0.15s ease',
              background: value === '' ? '#f1f5f9' : 'transparent',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = value === '' ? '#f1f5f9' : 'transparent')}
          >
            {placeholder}
          </div>
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                color: '#334155',
                transition: 'background 0.15s ease',
                background: value === opt.value ? '#eff6ff' : 'transparent',
                fontWeight: value === opt.value ? 600 : 400,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = value === opt.value ? '#eff6ff' : '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.background = value === opt.value ? '#eff6ff' : 'transparent')}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const OrderCartDesktop: React.FC<OrderCartProps> = ({
  draftCart,
  resolvedDraftLines,
  loadingDraft,
  updateDraftQty,
  removeDraftItem,
  submitDraftOrder,
  addresses,
  billingAddress,
  setBillingAddress,
  shippingAddress,
  setShippingAddress,
  createAddress,
  refreshCart
}) => {
  const navigate = useNavigate();
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const handleWheel = (e: React.WheelEvent) => {
    if (leftColumnRef.current && !leftColumnRef.current.contains(e.target as Node)) {
      leftColumnRef.current.scrollTop += e.deltaY;
    }
  };
  const [remarks, setRemarks] = useState('');
  
  // New address modal states
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddressType, setNewAddressType] = useState<'BILLING' | 'SHIPPING'>('BILLING');
  const [newAddressLine1, setNewAddressLine1] = useState('');
  const [newAddressLine2, setNewAddressLine2] = useState('');
  const [newAddressCity, setNewAddressCity] = useState('');
  const [newAddressState, setNewAddressState] = useState('');
  const [newAddressPostalCode, setNewAddressPostalCode] = useState('');
  const [newAddressCountry, setNewAddressCountry] = useState('India');
  const [newAddressIsDefault, setNewAddressIsDefault] = useState(true);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  const totalItems = resolvedDraftLines.reduce((acc, l) => acc + l.quantity, 0);
  const subtotal = resolvedDraftLines.reduce((sum, line) => sum + (line.quantity * (line.price || 0)), 0);

  const resolveImageUrl = (path?: string) => {
    if (!path) return "/assets/pharmaceutical-placeholder-premium.png";
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
      return path;
    }
    return `/api/v1/media/default-tenant/product-images/${path}`;
  };

  const formatAddressString = (addr: any) => {
    return [addr.address_line1, addr.address_line2, addr.city, addr.state, addr.postal_code, addr.country]
      .filter(Boolean)
      .join(', ');
  };

  const handleQuickAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressLine1 || !newAddressCity || !newAddressCountry) {
      alert('Please fill in all required fields.');
      return;
    }
    setIsSubmittingAddress(true);
    try {
      const payload = {
        type: newAddressType,
        address_line1: newAddressLine1,
        address_line2: newAddressLine2,
        city: newAddressCity,
        state: newAddressState,
        postal_code: newAddressPostalCode,
        country: newAddressCountry,
        is_default: newAddressIsDefault
      };
      const success = await createAddress(payload);
      if (success) {
        setShowAddressModal(false);
        // reset form
        setNewAddressLine1('');
        setNewAddressLine2('');
        setNewAddressCity('');
        setNewAddressState('');
        setNewAddressPostalCode('');
      } else {
        alert('Failed to save address. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating address.');
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  return (
    <div 
      onWheel={handleWheel}
      style={{
        height: 'calc(100vh - 74px)',
        overflow: 'hidden',
        padding: '2rem',
        backgroundColor: '#f9fafb',
        fontFamily: '"Outfit", "Inter", sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        boxSizing: 'border-box'
      }}
    >
      <style>{`
        .cart-refresh-btn {
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
        .cart-refresh-btn:hover {
          background: #f1f5f9;
          color: #1f2937;
          border-color: #cbd5e1;
          transform: scale(1.05);
        }
        .cart-refresh-btn:active {
          background: #e2e8f0;
          transform: scale(0.95);
        }
      `}</style>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#111827' }}>Order Cart</h1>
          <p style={{ margin: '0.1rem 0 0 0', color: '#6b7280', fontSize: '1rem' }}>Review items and place your product order</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {draftCart.length > 0 && (
            <button 
              onClick={() => {
                localStorage.setItem('customer_order_cart', '[]');
                window.dispatchEvent(new Event('customer-cart-update'));
              }} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff', border: '1px solid #ef4444', borderRadius: '0.75rem', color: '#ef4444', padding: '0.5rem 1rem', cursor: 'pointer', fontWeight: 700, boxShadow: '0 2px 4px rgba(239, 68, 68, 0.05)' }}
            >
              <Trash2 size={14} />
              Empty Cart
            </button>
          )}
          <button
            type="button"
            className="cart-refresh-btn"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (refreshCart) {
                await refreshCart();
              }
            }}
            title="Refresh Cart"
          >
            <RefreshCw 
              size={16} 
              style={{ 
                animation: loadingDraft ? 'spin 1s linear infinite' : 'none' 
              }} 
            />
          </button>
        </div>
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
                <Clock size={40} color="#1a56db" />
              </div>
              <div style={{ color: '#6b7280', fontSize: '1rem' }}>Loading cart details...</div>
            </div>
          ) : resolvedDraftLines.length === 0 ? (
            <div style={{ padding: '6rem 0', textAlign: 'center', background: '#fff', borderRadius: '1.5rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <ShoppingBag size={54} style={{ opacity: 0.15, color: '#64748b' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, color: '#1f2937', fontWeight: 800, fontSize: '1.2rem' }}>Your Order Cart is Empty</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Add some products from the catalogue to place an order.</p>
              </div>
              <button
                onClick={() => navigate('/catalog')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#1a56db',
                  color: '#fff',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(26, 86, 219, 0.15)'
                }}
              >
                <Grid size={16} /> Go to Catalogue
              </button>
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
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#1a56db' }}>₹{(line.price || 0).toFixed(2)}</p>
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
                        defaultValue={line.quantity}
                        key={line.quantity}
                        onBlur={(e) => updateDraftQty(line.id, parseInt(e.target.value) || 1)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
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

        {/* Right Column: Order Summary & Address Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '2rem' }}>
          {/* Addresses Card */}
          {resolvedDraftLines.length > 0 && (
            <aside style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.75rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: '#1f2937' }}>Delivery & Billing</h2>
              
              {/* Billing Address */}
              <div style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Billing Address</label>
                  <button 
                    onClick={() => { setNewAddressType('BILLING'); setShowAddressModal(true); }}
                    style={{ background: 'transparent', border: 'none', color: '#1a56db', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', padding: 0 }}
                  >
                    + Add New
                  </button>
                </div>
                <CustomSelect
                  value={billingAddress}
                  onChange={(val) => setBillingAddress(val)}
                  placeholder="-- Select Billing Address --"
                  options={addresses.map((a: any) => {
                    const str = formatAddressString(a);
                    const val = `${a.type}: ${str}`;
                    return { value: val, label: val };
                  })}
                />
              </div>

              {/* Shipping Address */}
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Shipping Address</label>
                  <button 
                    onClick={() => { setNewAddressType('SHIPPING'); setShowAddressModal(true); }}
                    style={{ background: 'transparent', border: 'none', color: '#1a56db', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', padding: 0 }}
                  >
                    + Add New
                  </button>
                </div>
                <CustomSelect
                  value={shippingAddress}
                  onChange={(val) => setShippingAddress(val)}
                  placeholder="-- Select Shipping Address --"
                  options={addresses.map((a: any) => {
                    const str = formatAddressString(a);
                    const val = `${a.type}: ${str}`;
                    return { value: val, label: val };
                  })}
                />
              </div>
            </aside>
          )}

          {/* Order Summary Card */}
          <aside style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.75rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: '#1f2937' }}>Order Summary</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem' }}>
                <span>Subtotal ({resolvedDraftLines.length} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1f2937' }}>Total Order Value</span>
                <span style={{ fontWeight: 850, fontSize: '1.35rem', color: '#1a56db' }}>₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
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
              onClick={() => submitDraftOrder(remarks, billingAddress, shippingAddress)}
              disabled={resolvedDraftLines.length === 0}
              style={{
                width: '100%',
                backgroundColor: '#1a56db',
                color: '#fff',
                border: 'none',
                padding: '1rem',
                borderRadius: '0.75rem',
                fontWeight: 700,
                fontSize: '1rem',
                cursor: resolvedDraftLines.length === 0 ? 'not-allowed' : 'pointer',
                boxShadow: resolvedDraftLines.length === 0 ? 'none' : '0 4px 12px rgba(26, 86, 219, 0.2)',
                opacity: resolvedDraftLines.length === 0 ? 0.6 : 1,
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

      {/* Quick Add Address Modal */}
      {showAddressModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1.5rem', padding: '2rem', width: '450px', textAlign: 'left', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.25rem', color: '#111827' }}>Quick Add Address</h3>
              <button 
                onClick={() => setShowAddressModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleQuickAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Address Type</label>
                <CustomSelect
                  value={newAddressType}
                  onChange={(val) => setNewAddressType(val as any)}
                  placeholder="-- Select Address Type --"
                  options={[
                    { value: 'BILLING', label: 'Billing Address' },
                    { value: 'SHIPPING', label: 'Shipping Address' },
                    { value: 'OFFICE', label: 'Office Address' },
                    { value: 'WAREHOUSE', label: 'Warehouse Address' }
                  ]}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Address Line 1 *</label>
                <input 
                  type="text" 
                  required 
                  value={newAddressLine1} 
                  onChange={e => setNewAddressLine1(e.target.value)}
                  placeholder="Street, Company name, c/o"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Address Line 2</label>
                <input 
                  type="text" 
                  value={newAddressLine2} 
                  onChange={e => setNewAddressLine2(e.target.value)}
                  placeholder="Apartment, suite, unit, building, floor"
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>City *</label>
                  <input 
                    type="text" 
                    required 
                    value={newAddressCity} 
                    onChange={e => setNewAddressCity(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>State</label>
                  <input 
                    type="text" 
                    value={newAddressState} 
                    onChange={e => setNewAddressState(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Postal Code</label>
                  <input 
                    type="text" 
                    value={newAddressPostalCode} 
                    onChange={e => setNewAddressPostalCode(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Country *</label>
                  <input 
                    type="text" 
                    required 
                    value={newAddressCountry} 
                    onChange={e => setNewAddressCountry(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input 
                  type="checkbox" 
                  id="is_default"
                  checked={newAddressIsDefault}
                  onChange={e => setNewAddressIsDefault(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="is_default" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>Set as default address</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddressModal(false)}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingAddress}
                  style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#1a56db', color: '#fff', fontWeight: 700, cursor: isSubmittingAddress ? 'not-allowed' : 'pointer', opacity: isSubmittingAddress ? 0.7 : 1 }}
                >
                  {isSubmittingAddress ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
