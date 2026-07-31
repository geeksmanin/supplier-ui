import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  ShoppingBag,
  Trash2,
  MessageSquare,
  Grid
} from 'lucide-react';
import { ActiveEnquiryProps } from './ActiveEnquiry';

export const ActiveEnquiryMobile: React.FC<ActiveEnquiryProps> = ({
  draftCart,
  resolvedDraftLines,
  loadingDraft,
  updateDraftQty,
  removeDraftItem,
  submitDraftEnquiry
}) => {
  const navigate = useNavigate();
  const [remarks, setRemarks] = useState('');

  const totalItems = resolvedDraftLines.reduce((acc, l) => acc + l.quantity, 0);
  const subtotal = resolvedDraftLines.reduce((sum, line) => sum + (line.quantity * (line.price || 0)), 0);

  return (
    <div style={{ padding: '1rem', paddingBottom: '100px', backgroundColor: '#f9fafb', fontFamily: '"Outfit", "Inter", sans-serif', minHeight: '100vh', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>Active Enquiry</h1>
          <p style={{ margin: '0.1rem 0 0 0', color: '#6b7280', fontSize: '0.85rem' }}>Review items and submit your enquiry</p>
        </div>
        {draftCart.length > 0 && (
          <button 
            onClick={() => {
              localStorage.setItem('customer_enquiry_cart', '[]');
              window.dispatchEvent(new Event('customer-cart-update'));
            }} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff', border: '1px solid #ef4444', borderRadius: '0.5rem', color: '#ef4444', padding: '0.4rem 0.75rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.05)' }}
          >
            <Trash2 size={12} />
            Empty
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loadingDraft ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem' }}>
            <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
              <Clock size={32} color="#10b981" />
            </div>
            <span style={{ color: '#6b7280', fontSize: '0.85rem', fontWeight: 600 }}>Loading draft details...</span>
          </div>
        ) : resolvedDraftLines.length === 0 ? (
          <div style={{ padding: '4rem 1.5rem', textAlign: 'center', background: '#fff', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
            <ShoppingBag size={48} style={{ opacity: 0.15, color: '#64748b' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <h3 style={{ margin: 0, color: '#1f2937', fontWeight: 800, fontSize: '1.1rem' }}>Your Enquiry Cart is Empty</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>Browse catalog and add products to enquire.</p>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* List of Cart Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {resolvedDraftLines.map((line, idx) => {
                const variantImg = line.media_paths?.[0] || "/assets/pharmaceutical-placeholder-premium.png";
                return (
                  <div 
                    key={line.id || idx} 
                    style={{ background: '#fff', padding: '1rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', alignItems: 'center' }}
                  >
                    <img 
                      src={variantImg} 
                      alt={line.sku} 
                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0', flexShrink: 0 }} 
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', lineHeight: 1.3, marginBottom: '0.15rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{line.product_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>SKU: {line.sku}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10b981', marginBottom: '0.5rem' }}>₹{(line.price || 0).toFixed(2)}</div>
                      
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
                            value={line.quantity}
                            onChange={(e) => updateDraftQty(line.id, parseInt(e.target.value) || 1)}
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
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Remarks Section */}
            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                <MessageSquare size={12} /> Enquiry Remarks
              </label>
              <textarea
                placeholder="Add any specific instructions..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', background: '#f8fafc', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            {/* Summary & Sticky Footer Section */}
            <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6b7280' }}>Net Enquiry Value</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 950, color: '#10b981' }}>
                  ₹{subtotal.toFixed(2)}
                </span>
              </div>
              
              <button 
                onClick={() => submitDraftEnquiry(remarks)}
                style={{
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                  padding: '0.85rem 2rem',
                  borderRadius: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                  fontSize: '0.95rem'
                }}
              >
                Submit Enquiry
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
