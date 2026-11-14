import React from 'react';
import { X, Plus, Minus, Search } from 'lucide-react';
import { MobileVariantPickerSheetProps } from './MobileVariantPickerSheet.types';
import { useMobileVariantPicker } from './useMobileVariantPicker';

export const MobileVariantPickerSheetMobile: React.FC<MobileVariantPickerSheetProps> = (props) => {
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
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grab Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, paddingBottom: 4 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1' }} />
        </div>

        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 16px 12px 16px',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0F172A' }}>
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

        {/* Search input for variants if > 3 */}
        {rawVariants.length > 3 && (
          <div style={{ padding: '8px 16px', backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} style={{ position: 'absolute', left: 10, color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search variant name, size, or SKU..."
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

        {/* Vertical Stacked Variant List */}
        <div
          style={{
            padding: '12px 16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            flex: 1,
          }}
        >
          {filteredItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: '#94A3B8', fontSize: 13 }}>
              No variants match "{search}"
            </div>
          ) : (
            filteredItems.map((v) => {
              const isSelected = v.quantity > 0;
              const lineTotal = v.quantity * v.unit_price;

              return (
                <div
                  key={v.id}
                  style={{
                    borderRadius: 12,
                    border: isSelected ? '1.5px solid #0F766E' : '1px solid #E2E8F0',
                    backgroundColor: isSelected ? '#F0FDFA' : '#FFFFFF',
                    padding: '10px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: isSelected ? '0 2px 6px rgba(15, 118, 110, 0.08)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Variant Details */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{v.name}</div>
                      {v.sku_code && (
                        <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace' }}>
                          SKU: {v.sku_code}
                        </div>
                      )}
                    </div>
                    {v.attributes.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        {v.attributes.map((attr, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: 10.5,
                              fontWeight: 600,
                              backgroundColor: '#E2E8F0',
                              color: '#334155',
                              padding: '2px 6px',
                              borderRadius: 4,
                            }}
                          >
                            {attr.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quantity Stepper & Price Input Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    {/* Stepper */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: 8,
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateQuantity(v.id, -1)}
                        disabled={v.quantity <= 0}
                        style={{
                          width: 34,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'none',
                          border: 'none',
                          cursor: v.quantity <= 0 ? 'not-allowed' : 'pointer',
                          color: v.quantity <= 0 ? '#CBD5E1' : '#0F172A',
                        }}
                      >
                        <Minus size={14} />
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={v.quantity}
                        onChange={(e) => setDirectQuantity(v.id, parseInt(e.target.value, 10))}
                        style={{
                          width: 44,
                          height: 32,
                          textAlign: 'center',
                          border: 'none',
                          borderLeft: '1px solid #E2E8F0',
                          borderRight: '1px solid #E2E8F0',
                          fontSize: 13,
                          fontWeight: 700,
                          color: isSelected ? '#0F766E' : '#334155',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => updateQuantity(v.id, 1)}
                        style={{
                          width: 34,
                          height: 32,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#0F766E',
                        }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Unit Price & Subtotal */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 11, color: '#64748B' }}>Rate:</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={v.unit_price}
                          onChange={(e) => setDirectPrice(v.id, parseFloat(e.target.value))}
                          style={{
                            width: 65,
                            padding: '4px 6px',
                            fontSize: 12,
                            borderRadius: 6,
                            border: '1px solid #CBD5E1',
                            textAlign: 'right',
                            outline: 'none',
                          }}
                        />
                      </div>
                      {isSelected && (
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0F766E', minWidth: 60, textAlign: 'right' }}>
                          ₹{lineTotal.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pinned Bottom Confirmation Banner */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
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
              flex: 1,
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              backgroundColor: selectedCount === 0 ? '#94A3B8' : '#0F766E',
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 700,
              cursor: selectedCount === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: selectedCount > 0 ? '0 2px 8px rgba(15, 118, 110, 0.25)' : 'none',
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

export default MobileVariantPickerSheetMobile;
