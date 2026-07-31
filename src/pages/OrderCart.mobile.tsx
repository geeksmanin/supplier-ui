import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ShoppingBag,
  Trash2,
  MessageSquare,
  Grid,
  CheckCircle,
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
          padding: '0.65rem 0.85rem',
          borderRadius: '10px',
          border: isOpen ? '1.5px solid #1a56db' : '1.5px solid #e2e8f0',
          fontSize: '0.8rem',
          outline: 'none',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          textAlign: 'left',
          color: selectedOption ? '#1f2937' : '#94a3b8',
          fontWeight: selectedOption ? 500 : 400,
          boxShadow: isOpen ? '0 0 0 3px rgba(26, 86, 219, 0.1)' : 'none',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90%' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={14}
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
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 20px -5px rgba(0, 0, 0, 0.08)',
            zIndex: 1000,
            maxHeight: '180px',
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
              padding: '0.55rem 0.65rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
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
                padding: '0.55rem 0.65rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
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


export const OrderCartMobile: React.FC<OrderCartProps> = ({
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
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      backgroundColor: '#f9fafb',
      fontFamily: '"Outfit", "Inter", sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* Fixed Header Actions */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', justifyContent: 'space-between', flexShrink: 0, borderBottom: '1px solid #f1f5f9', background: '#fff' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#475569' }}>
          Cart Items ({totalItems})
        </span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {draftCart.length > 0 && (
            <button 
              onClick={() => {
                localStorage.setItem('customer_order_cart', '[]');
                window.dispatchEvent(new Event('customer-cart-update'));
              }} 
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff', border: '1px solid #ef4444', borderRadius: '0.5rem', color: '#ef4444', padding: '0.4rem 0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.05)' }}
            >
              <Trash2 size={12} />
              Empty
            </button>
          )}
          <button
            type="button"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (refreshCart) {
                await refreshCart();
              }
            }}
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#4b5563',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              flexShrink: 0
            }}
            title="Refresh Cart"
          >
            <RefreshCw 
              size={14} 
              style={{ 
                animation: loadingDraft ? 'spin 1s linear infinite' : 'none' 
              }} 
            />
          </button>
        </div>
      </div>

      {/* Scrollable Center content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxSizing: 'border-box' }}>
        {loadingDraft ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
            <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
              <Clock size={32} color="#1a56db" />
            </div>
            <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600 }}>Loading cart details...</span>
          </div>
        ) : resolvedDraftLines.length === 0 ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', background: '#fff', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <ShoppingBag size={48} style={{ opacity: 0.15, color: '#64748b' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <h3 style={{ margin: 0, color: '#1f2937', fontWeight: 800, fontSize: '1.1rem' }}>Your Order Cart is Empty</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Browse catalog and add products to order.</p>
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
                padding: '0.65rem 1.25rem',
                borderRadius: '0.65rem',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(26, 86, 219, 0.15)'
              }}
            >
              <Grid size={14} /> Go to Catalogue
            </button>
          </div>
        ) : (
          <>
            {/* List of Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {resolvedDraftLines.map((line, idx) => {
                const variantImg = resolveImageUrl(line.media_paths?.[0]);
                return (
                  <div 
                    key={line.id || idx} 
                    style={{ background: '#fff', padding: '1rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', alignItems: 'center' }}
                  >
                    <img 
                      src={variantImg} 
                      alt={line.sku} 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', flexShrink: 0, background: '#fff' }} 
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', lineHeight: 1.3, marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{line.product_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>SKU: {line.sku}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1a56db', marginBottom: '0.5rem' }}>₹{(line.price || 0).toFixed(2)}</div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* Quantity Selector */}
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                          <button 
                            onClick={() => updateDraftQty(line.id, line.quantity - 1)}
                            style={{ border: 'none', background: 'transparent', width: '28px', height: '28px', cursor: 'pointer', color: '#64748b', fontSize: '1.1rem' }}
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
                            style={{ width: '32px', height: '28px', border: 'none', borderLeft: '1px solid #cbd5e1', borderRight: '1px solid #cbd5e1', textAlign: 'center', fontWeight: 700, fontSize: '0.85rem' }}
                          />
                          <button 
                            onClick={() => updateDraftQty(line.id, line.quantity + 1)}
                            style={{ border: 'none', background: 'transparent', width: '28px', height: '28px', cursor: 'pointer', color: '#64748b', fontSize: '1.1rem' }}
                          >
                            +
                          </button>
                        </div>
                        
                        {/* Remove Button */}
                        <button 
                          onClick={() => removeDraftItem(line.id)}
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2' }}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Address Card */}
            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#1f2937' }}>Delivery & Billing</h2>
              
              {/* Billing Address */}
              <div style={{ textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Billing Address</label>
                  <button 
                    onClick={() => { setNewAddressType('BILLING'); setShowAddressModal(true); }}
                    style={{ background: 'transparent', border: 'none', color: '#1a56db', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', padding: 0 }}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Shipping Address</label>
                  <button 
                    onClick={() => { setNewAddressType('SHIPPING'); setShowAddressModal(true); }}
                    style={{ background: 'transparent', border: 'none', color: '#1a56db', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', padding: 0 }}
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
            </div>
            
            {/* Remarks Section */}
            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                <MessageSquare size={12} /> Order Remarks
              </label>
              <textarea
                placeholder="Add any specific instructions..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', background: '#f8fafc', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
          </>
        )}
      </div>

      {/* Sticky Bottom Place Order Bar */}
      {resolvedDraftLines.length > 0 && (
        <div style={{ background: '#fff', padding: '0.75rem 1rem calc(0.75rem + 64px) 1rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.4rem', flexShrink: 0, boxSizing: 'border-box', boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6b7280' }}>Total Order Value</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 950, color: '#1a56db' }}>
              ₹{subtotal.toFixed(2)}
            </span>
          </div>
          
          <button 
            onClick={() => submitDraftOrder(remarks, billingAddress, shippingAddress)}
            disabled={resolvedDraftLines.length === 0}
            style={{
              backgroundColor: '#1a56db',
              color: '#fff',
              border: 'none',
              padding: '0.55rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              cursor: resolvedDraftLines.length === 0 ? 'not-allowed' : 'pointer',
              width: '100%',
              boxShadow: resolvedDraftLines.length === 0 ? 'none' : '0 4px 12px rgba(26, 86, 219, 0.15)',
              fontSize: '0.85rem',
              opacity: resolvedDraftLines.length === 0 ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <CheckCircle size={15} />
            Place Order
          </button>
        </div>
      )}

      {/* Quick Add Address Modal */}
      {showAddressModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '1.25rem', padding: '1.5rem', width: '100%', maxWidth: '400px', textAlign: 'left', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontWeight: 900, fontSize: '1.15rem', color: '#111827' }}>Quick Add Address</h3>
              <button 
                onClick={() => setShowAddressModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleQuickAddAddress} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Address Type</label>
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
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Address Line 1 *</label>
                <input 
                  type="text" 
                  required 
                  value={newAddressLine1} 
                  onChange={e => setNewAddressLine1(e.target.value)}
                  placeholder="Street, Company name, c/o"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Address Line 2</label>
                <input 
                  type="text" 
                  value={newAddressLine2} 
                  onChange={e => setNewAddressLine2(e.target.value)}
                  placeholder="Apartment, suite, unit, building, floor"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>City *</label>
                  <input 
                    type="text" 
                    required 
                    value={newAddressCity} 
                    onChange={e => setNewAddressCity(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>State</label>
                  <input 
                    type="text" 
                    value={newAddressState} 
                    onChange={e => setNewAddressState(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Postal Code</label>
                  <input 
                    type="text" 
                    value={newAddressPostalCode} 
                    onChange={e => setNewAddressPostalCode(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Country *</label>
                  <input 
                    type="text" 
                    required 
                    value={newAddressCountry} 
                    onChange={e => setNewAddressCountry(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                <input 
                  type="checkbox" 
                  id="mobile_is_default"
                  checked={newAddressIsDefault}
                  onChange={e => setNewAddressIsDefault(e.target.checked)}
                  style={{ width: '14px', height: '14px' }}
                />
                <label htmlFor="mobile_is_default" style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>Set as default address</label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddressModal(false)}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', border: '1.5px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmittingAddress}
                  style={{ flex: 1, padding: '0.65rem', borderRadius: '6px', border: 'none', background: '#1a56db', color: '#fff', fontWeight: 700, cursor: isSubmittingAddress ? 'not-allowed' : 'pointer', opacity: isSubmittingAddress ? 0.7 : 1, fontSize: '0.85rem' }}
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

