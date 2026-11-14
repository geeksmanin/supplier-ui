import React from 'react';
import { X, Plus, Minus, Search } from 'lucide-react';
import { MobileVariantPickerSheetProps } from './MobileVariantPickerSheet.types';
import { useMobileVariantPicker } from './useMobileVariantPicker';

export const MobileVariantPickerSheetDesktop: React.FC<MobileVariantPickerSheetProps> = (props) => {
  const { isOpen, onClose, product } = props;
  const {
    search,
    setSearch,
    rawVariants,
    filteredItems,
    selectedCount,
    totalQuantity,
    totalAmount,
    updateQuantity,
    setDirectQuantity,
    setDirectPrice,
    handleConfirm,
  } = useMobileVariantPicker(props);

  if (!isOpen || !product) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          maxWidth: 520,
          width: '90%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
              {product.name || 'Select Product Variants'}
            </h3>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              {rawVariants.length} variant{rawVariants.length === 1 ? '' : 's'} available
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Input */}
        {rawVariants.length > 3 && (
          <div style={{ padding: '8px 18px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search variants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 32px',
                  borderRadius: 8,
                  border: '1px solid #CBD5E1',
                  fontSize: 12.5,
                  backgroundColor: '#FFFFFF',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        )}

        {/* Variant List */}
        <div
          style={{
            padding: '14px 18px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            flex: 1,
          }}
        >
          {filteredItems.map((v) => {
            const isSelected = v.quantity > 0;
            const lineTotal = v.quantity * v.unit_price;

            return (
              <div
                key={v.id}
                style={{
                  borderRadius: 10,
                  border: isSelected ? '1.5px solid #0F766E' : '1px solid #E2E8F0',
                  backgroundColor: isSelected ? '#F0FDFA' : '#FFFFFF',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{v.name}</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 2 }}>
                    {v.sku_code && (
                      <span style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace' }}>
                        {v.sku_code}
                      </span>
                    )}
                    {v.attributes.map((attr, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: 10.5,
                          backgroundColor: '#E2E8F0',
                          color: '#334155',
                          padding: '1px 5px',
                          borderRadius: 4,
                        }}
                      >
                        {attr.value}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #CBD5E1',
                      borderRadius: 6,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updateQuantity(v.id, -1)}
                      disabled={v.quantity <= 0}
                      style={{
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        background: 'none',
                        cursor: v.quantity <= 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <Minus size={13} />
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={v.quantity}
                      onChange={(e) => setDirectQuantity(v.id, parseInt(e.target.value, 10))}
                      style={{
                        width: 36,
                        height: 28,
                        textAlign: 'center',
                        border: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => updateQuantity(v.id, 1)}
                      style={{
                        width: 28,
                        height: 28,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        color: '#0F766E',
                      }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 11, color: '#64748B' }}>₹</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={v.unit_price}
                      onChange={(e) => setDirectPrice(v.id, parseFloat(e.target.value))}
                      style={{
                        width: 60,
                        padding: '3px 5px',
                        fontSize: 12,
                        borderRadius: 4,
                        border: '1px solid #CBD5E1',
                        textAlign: 'right',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {isSelected && (
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0F766E', minWidth: 55, textAlign: 'right' }}>
                      ₹{lineTotal.toFixed(2)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 18px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 14px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#475569',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selectedCount === 0}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: selectedCount === 0 ? '#94A3B8' : '#0F766E',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 700,
              cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            {selectedCount === 0
              ? 'Select Variants'
              : `Add ${totalQuantity} Item${totalQuantity === 1 ? '' : 's'} • ₹${totalAmount.toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileVariantPickerSheetDesktop;
