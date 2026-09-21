import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  VoucherLineItem, 
  VoucherBatchMode, 
  VoucherPackagingOption 
} from './FastVoucherEntryLayout.types';
import { Check, X, Layers, Calendar, Tag, Percent } from 'lucide-react';

interface VoucherQuickRowStepperProps {
  isOpen: boolean;
  item: Partial<VoucherLineItem> | null;
  batchMode?: VoucherBatchMode;
  allowRateOverride?: boolean;
  stockBatches?: Array<{ batch_code: string; expiry_date?: string; mrp?: number; available_quantity?: number }>;
  onCommit: (item: VoucherLineItem) => void;
  onCancel: () => void;
  isEditMode?: boolean;
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
}) => {
  const [qty, setQty] = useState<number>(1);
  const [packagingName, setPackagingName] = useState<string>('Unit');
  const [packagingSize, setPackagingSize] = useState<number>(1);
  const [batchCode, setBatchCode] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [mrp, setMrp] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const qtyInputRef = useRef<HTMLInputElement>(null);
  const packagingSelectRef = useRef<HTMLSelectElement>(null);
  const batchInputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const expiryInputRef = useRef<HTMLInputElement>(null);
  const rateInputRef = useRef<HTMLInputElement>(null);
  const discountInputRef = useRef<HTMLInputElement>(null);

  // Synchronize state when item changes or opens
  useEffect(() => {
    if (!isOpen || !item) return;

    setQty(item.quantity ?? 1);
    setPackagingName(item.packaging_name || 'Unit');
    setPackagingSize(item.packaging_size || 1);
    setBatchCode(item.batch_code || '');
    setExpiryDate(item.expiry_date || '');
    setMrp(item.mrp || 0);
    setUnitPrice(item.unit_price || 0);
    setDiscountPercent(item.discount_percent || 0);

    // Default batch if select mode and stock batches available
    if (batchMode === 'select' && stockBatches.length > 0 && !item.batch_code) {
      setBatchCode(stockBatches[0].batch_code);
      if (stockBatches[0].expiry_date) setExpiryDate(stockBatches[0].expiry_date);
      if (stockBatches[0].mrp) setMrp(stockBatches[0].mrp);
    }

    // Auto-focus quantity field and select all text
    const timer = setTimeout(() => {
      if (qtyInputRef.current) {
        qtyInputRef.current.focus();
        qtyInputRef.current.select();
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [isOpen, item, batchMode]);

  // Derived financial calculations for this line
  const calculations = useMemo(() => {
    const rawQty = Math.max(0, Number(qty) || 0);
    const rawRate = Math.max(0, Number(unitPrice) || 0);
    const rawDisc = Math.min(100, Math.max(0, Number(discountPercent) || 0));
    const taxRate = Number(item?.tax_percent || 0);

    const baseAmount = rawQty * rawRate;
    const discAmount = (baseAmount * rawDisc) / 100;
    const taxableAmount = Math.max(0, baseAmount - discAmount);
    const taxAmount = (taxableAmount * taxRate) / 100;
    const lineTotal = taxableAmount + taxAmount;

    return {
      baseAmount: Number(baseAmount.toFixed(2)),
      discAmount: Number(discAmount.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      lineTotal: Number(lineTotal.toFixed(2)),
    };
  }, [qty, unitPrice, discountPercent, item]);

  if (!isOpen || !item) return null;

  const handlePackagingChange = (opt: VoucherPackagingOption) => {
    setPackagingName(opt.name);
    setPackagingSize(opt.size);
  };

  const handleBatchSelect = (code: string) => {
    setBatchCode(code);
    const matched = stockBatches.find((b) => b.batch_code === code);
    if (matched) {
      if (matched.expiry_date) setExpiryDate(matched.expiry_date);
      if (matched.mrp) setMrp(matched.mrp);
    }
  };

  const handleCommit = () => {
    if (qty <= 0) return;

    const committedItem: VoucherLineItem = {
      id: item.id || `line-${Date.now()}`,
      variant_id: item.variant_id || '',
      product_id: item.product_id,
      sku_code: item.sku_code || '',
      product_name: item.product_name || 'Item',
      image_url: item.image_url,
      quantity: Number(qty),
      packaging_name: packagingName,
      packaging_size: Number(packagingSize),
      packagings: item.packagings,
      batch_code: batchCode.trim() || undefined,
      expiry_date: expiryDate.trim() || undefined,
      mrp: Number(mrp) || undefined,
      unit_price: Number(unitPrice),
      tax_percent: Number(item.tax_percent || 0),
      tax_amount: calculations.taxAmount,
      discount_percent: Number(discountPercent),
      discount_amount: calculations.discAmount,
      line_total: calculations.lineTotal,
      remarks: item.remarks,
      metadata: item.metadata,
    };

    onCommit(committedItem);
  };

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
        backgroundColor: '#ffffff',
        border: '1px solid #3b82f6',
        borderRadius: '12px',
        boxShadow: '0 12px 30px rgba(37, 99, 235, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08)',
        zIndex: 50,
        padding: '1rem 1.25rem',
        animation: 'fadeInSlide 0.15s ease-out',
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
              backgroundColor: '#eff6ff',
              color: '#2563eb',
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
            <div style={{ fontWeight: 700, fontSize: '0.925rem', color: '#1e293b' }}>
              {item.product_name}
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
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${batchMode !== 'none' ? (batchMode === 'create' ? 6 : 5) : 4}, minmax(0, 1fr))`,
          gap: '0.75rem',
          alignItems: 'end',
        }}
      >
        {/* 1. Quantity */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Quantity *
          </label>
          <input
            ref={qtyInputRef}
            type="number"
            min="0.01"
            step="any"
            value={qty || ''}
            onChange={(e) => setQty(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (packagingSelectRef.current) {
                  packagingSelectRef.current.focus();
                } else if (batchInputRef.current) {
                  batchInputRef.current.focus();
                } else if (rateInputRef.current) {
                  rateInputRef.current.focus();
                }
              }
            }}
            style={{
              width: '100%',
              padding: '7px 10px',
              fontSize: '0.875rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: '1.5px solid #2563eb',
              outline: 'none',
              backgroundColor: '#eff6ff',
              color: '#1e3a8a',
            }}
          />
        </div>

        {/* 2. Packaging / UOM */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            <Layers size={11} /> Unit / Pack
          </label>
          {item.packagings && item.packagings.length > 1 ? (
            <select
              ref={packagingSelectRef}
              value={packagingName}
              onChange={(e) => {
                const opt = item.packagings?.find((p) => p.name === e.target.value);
                if (opt) handlePackagingChange(opt);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (batchInputRef.current) {
                    batchInputRef.current.focus();
                  } else if (rateInputRef.current) {
                    rateInputRef.current.focus();
                  }
                }
              }}
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
              }}
            >
              {item.packagings.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} ({p.size > 1 ? `${p.size} pcs` : 'Unit'})
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              readOnly
              value={packagingName || 'Unit'}
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
                color: '#64748b',
              }}
            />
          )}
        </div>

        {/* 3. Batch (Select mode: FEFO dropdown; Create mode: text input) */}
        {batchMode === 'select' && (
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              <Tag size={11} /> Batch (FEFO)
            </label>
            <select
              ref={batchInputRef as any}
              value={batchCode}
              onChange={(e) => handleBatchSelect(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  rateInputRef.current?.focus();
                }
              }}
              style={{
                width: '100%',
                padding: '7px 10px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
              }}
            >
              {stockBatches.length > 0 ? (
                stockBatches.map((b) => (
                  <option key={b.batch_code} value={b.batch_code}>
                    {b.batch_code} {b.expiry_date ? `(Exp: ${b.expiry_date})` : ''} {b.available_quantity != null ? `• Avail: ${b.available_quantity}` : ''}
                  </option>
                ))
              ) : (
                <option value="">No stock batches</option>
              )}
            </select>
          </div>
        )}

        {batchMode === 'create' && (
          <>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                <Tag size={11} /> Batch No
              </label>
              <input
                ref={batchInputRef as any}
                type="text"
                placeholder="e.g. B2026-X"
                value={batchCode}
                onChange={(e) => setBatchCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    expiryInputRef.current?.focus();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                <Calendar size={11} /> Expiry (MM/YY)
              </label>
              <input
                ref={expiryInputRef}
                type="text"
                placeholder="12/28"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    rateInputRef.current?.focus();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>
          </>
        )}

        {/* 4. Unit Price / Rate */}
        <div>
          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Unit Rate (₹) *
          </label>
          <input
            ref={rateInputRef}
            type="number"
            step="any"
            readOnly={!allowRateOverride}
            value={unitPrice || ''}
            onChange={(e) => setUnitPrice(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                discountInputRef.current?.focus();
              }
            }}
            style={{
              width: '100%',
              padding: '7px 10px',
              fontSize: '0.875rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: allowRateOverride ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
              backgroundColor: allowRateOverride ? '#ffffff' : '#f8fafc',
            }}
          />
        </div>

        {/* 5. Discount % */}
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            <Percent size={11} /> Disc %
          </label>
          <input
            ref={discountInputRef}
            type="number"
            min="0"
            max="100"
            step="any"
            value={discountPercent || ''}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleCommit();
              }
            }}
            style={{
              width: '100%',
              padding: '7px 10px',
              fontSize: '0.875rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
            }}
          />
        </div>
      </div>

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
