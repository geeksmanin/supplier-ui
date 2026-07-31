import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ShoppingBag,
  Trash2,
  MessageSquare,
  CheckCircle,
  Grid,
  RefreshCw
} from 'lucide-react';
import { EnquiryCartProps } from './EnquiryCart';

export const EnquiryCartDesktop: React.FC<EnquiryCartProps> = ({
  draftCart,
  resolvedDraftLines,
  loadingDraft,
  updateDraftQty,
  removeDraftItem,
  submitDraftEnquiry,
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

  const totalItems = resolvedDraftLines.reduce((acc, l) => acc + l.quantity, 0);
  const subtotal = resolvedDraftLines.reduce((sum, line) => sum + (line.quantity * (line.price || 0)), 0);

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
        .enq-cart-refresh-btn {
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
        .enq-cart-refresh-btn:hover {
          background: #f1f5f9;
          color: #1f2937;
          border-color: #cbd5e1;
          transform: scale(1.05);
        }
        .enq-cart-refresh-btn:active {
          background: #e2e8f0;
          transform: scale(0.95);
        }
      `}</style>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#111827' }}>Enquiry Cart</h1>
          <p style={{ margin: '0.1rem 0 0 0', color: '#6b7280', fontSize: '1rem' }}>Review items and submit your product enquiry</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {draftCart.length > 0 && (
            <button 
              onClick={() => {
                localStorage.setItem('customer_enquiry_cart', '[]');
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
            className="enq-cart-refresh-btn"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (refreshCart) {
                await refreshCart();
              }
            }}
            title="Refresh Enquiry Cart"
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
                <Clock size={40} color="#10b981" />
              </div>
              <div style={{ color: '#6b7280', fontSize: '1rem' }}>Loading cart details...</div>
            </div>
          ) : resolvedDraftLines.length === 0 ? (
            <div style={{ padding: '6rem 0', textAlign: 'center', background: '#fff', borderRadius: '1.5rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
              <ShoppingBag size={54} style={{ opacity: 0.15, color: '#64748b' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={{ margin: 0, color: '#1f2937', fontWeight: 800, fontSize: '1.2rem' }}>Your Enquiry Cart is Empty</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>Add some products from the catalogue to make an enquiry.</p>
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
              const variantImg = line.media_paths?.[0] || "/assets/pharmaceutical-placeholder-premium.png";
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
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid #e2e8f0' }} 
                  />
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 800, color: '#1f2937' }}>{line.product_name}</h3>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#6b7280' }}>SKU: {line.sku}</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#10b981' }}>₹{(line.price || 0).toFixed(2)}</p>
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

        {/* Right Column: Enquiry Summary Card */}
        <aside style={{ background: '#fff', borderRadius: '1.5rem', padding: '1.75rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 30px rgba(0,0,0,0.03)', position: 'sticky', top: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem', color: '#1f2937' }}>Enquiry Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.9rem' }}>
              <span>Subtotal ({resolvedDraftLines.length} items)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: '0.25rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1f2937' }}>Total Enquiry Value</span>
              <span style={{ fontWeight: 850, fontSize: '1.35rem', color: '#10b981' }}>₹{subtotal.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              <MessageSquare size={14} /> Enquiry Remarks
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
            onClick={() => submitDraftEnquiry(remarks)}
            disabled={resolvedDraftLines.length === 0}
            style={{
              width: '100%',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              padding: '1rem',
              borderRadius: '0.75rem',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: resolvedDraftLines.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: resolvedDraftLines.length === 0 ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.2)',
              opacity: resolvedDraftLines.length === 0 ? 0.6 : 1,
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <CheckCircle size={18} />
            Submit Enquiry
          </button>
        </aside>
      </div>
    </div>
  );
};
