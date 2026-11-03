import React from 'react';
import {
  VoucherLineItem,
  VoucherBatchMode,
} from './FastVoucherEntryLayout.types';
import { Check, X } from 'lucide-react';
import { useVoucherQuickRowStepper } from './useVoucherQuickRowStepper';
import { VoucherQuickRowStepperInputs } from './VoucherQuickRowStepperInputs';

interface VoucherQuickRowStepperProps {
  isOpen: boolean;
  item: Partial<VoucherLineItem> | null;
  batchMode?: VoucherBatchMode;
  allowRateOverride?: boolean;
  stockBatches?: Array<{ batch_code: string; expiry_date?: string; mrp?: number; available_quantity?: number }>;
  onCommit: (item: VoucherLineItem) => void;
  onCancel: () => void;
  isEditMode?: boolean;
  onOpenStockDrilldown?: (item: Partial<VoucherLineItem> & { available_quantity?: number }) => void;
}

export const VoucherQuickRowStepper: React.FC<VoucherQuickRowStepperProps> = ({
  isOpen,
  item,
  batchMode = 'none',
  allowRateOverride = true,
  stockBatches = [],
  onCommit,
  onCancel,
  isEditMode = false,
  onOpenStockDrilldown,
}) => {
  const {
    qty,
    setQty,
    packagingName,
    batchCode,
    setBatchCode,
    expiryDate,
    setExpiryDate,
    unitPrice,
    setUnitPrice,
    discountPercent,
    setDiscountPercent,
    liveStock,
    effectiveBatches,
    calculations,
    qtyInputRef,
    packagingSelectRef,
    batchInputRef,
    expiryInputRef,
    rateInputRef,
    discountInputRef,
    handlePackagingChange,
    handleBatchSelect,
    handleCommit,
  } = useVoucherQuickRowStepper({
    isOpen,
    item,
    batchMode,
    stockBatches,
    onCommit,
  });

  if (!isOpen || !item) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCancel();
    }
  };

  return (
    <div
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: '6px',
        backgroundColor: 'var(--color-bg-primary, #ffffff)',
        border: '1px solid var(--color-primary, #3b82f6)',
        borderRadius: '12px',
        boxShadow: '0 12px 30px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)',
        zIndex: 50,
        padding: '1rem 1.25rem',
        animation: 'fadeInSlide 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
    >
      {/* Header with Product Name & Sku */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-primary-light, #eff6ff)',
              color: 'var(--color-primary, #2563eb)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.75rem',
            }}
          >
            {isEditMode ? 'EDIT' : 'ADD'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '0.925rem', color: 'var(--color-text-primary, #1e293b)' }}>
                {item.product_name}
              </span>
              {(() => {
                const stockVal = liveStock !== null ? liveStock : (item.metadata?.available_quantity !== undefined ? Number(item.metadata.available_quantity) : null);
                if (stockVal === null) return null;
                const inStock = stockVal > 0;
                return (
                  <button
                    type="button"
                    data-testid="stepper-stock-breakdown-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onOpenStockDrilldown?.({
                        ...item,
                        available_quantity: stockVal,
                      });
                    }}
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      backgroundColor: inStock ? '#dcfce7' : '#fee2e2',
                      color: inStock ? '#166534' : '#991b1b',
                      border: inStock ? '1px solid #bbf7d0' : '1px solid #fecaca',
                      whiteSpace: 'nowrap',
                      cursor: onOpenStockDrilldown ? 'pointer' : 'default',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    title={onOpenStockDrilldown ? 'Click to view 5-location warehouse stock breakdown' : undefined}
                  >
                    <span>{inStock ? `🟢 Stock: ${stockVal} ${packagingName || 'Units'} In Stock` : '🔴 Out of Stock'}</span>
                    {onOpenStockDrilldown && <span style={{ opacity: 0.65, fontSize: '0.65rem' }}>↗</span>}
                  </button>
                );
              })()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
              SKU: {item.sku_code || '-'} {item.tax_percent ? `• GST: ${item.tax_percent}%` : ''}
            </div>
          </div>
        </div>

        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#94a3b8',
            padding: '4px',
            borderRadius: '4px',
          }}
          title="Cancel (Esc)"
        >
          <X size={16} />
        </button>
      </div>

      {/* Stepper Inputs Row */}
      <VoucherQuickRowStepperInputs
        item={item}
        batchMode={batchMode}
        allowRateOverride={allowRateOverride}
        qty={qty}
        setQty={setQty}
        packagingName={packagingName}
        handlePackagingChange={handlePackagingChange}
        batchCode={batchCode}
        setBatchCode={setBatchCode}
        handleBatchSelect={handleBatchSelect}
        effectiveBatches={effectiveBatches}
        expiryDate={expiryDate}
        setExpiryDate={setExpiryDate}
        unitPrice={unitPrice}
        setUnitPrice={setUnitPrice}
        discountPercent={discountPercent}
        setDiscountPercent={setDiscountPercent}
        qtyInputRef={qtyInputRef}
        packagingSelectRef={packagingSelectRef}
        batchInputRef={batchInputRef}
        expiryInputRef={expiryInputRef}
        rateInputRef={rateInputRef}
        discountInputRef={discountInputRef}
        handleCommit={handleCommit}
      />

      {/* Footer Breakdown & Commit Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '1rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.8rem', color: '#475569' }}>
          <div>
            Base: <strong style={{ color: '#0f172a' }}>₹{calculations.baseAmount.toFixed(2)}</strong>
          </div>
          {calculations.discAmount > 0 && (
            <div>
              Disc: <strong style={{ color: '#dc2626' }}>-₹{calculations.discAmount.toFixed(2)}</strong>
            </div>
          )}
          {calculations.taxAmount > 0 && (
            <div>
              GST ({item.tax_percent}%): <strong style={{ color: '#059669' }}>+₹{calculations.taxAmount.toFixed(2)}</strong>
            </div>
          )}
          <div>
            Line Total: <strong style={{ color: '#2563eb', fontSize: '0.95rem' }}>₹{calculations.lineTotal.toFixed(2)}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#475569',
              cursor: 'pointer',
            }}
          >
            Cancel (Esc)
          </button>
          <button
            type="button"
            data-testid="stepper-commit-btn"
            onClick={handleCommit}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
            }}
          >
            <Check size={14} />
            {isEditMode ? 'Update Line (Enter)' : 'Add Line (Enter)'}
          </button>
        </div>
      </div>
    </div>
  );
};
