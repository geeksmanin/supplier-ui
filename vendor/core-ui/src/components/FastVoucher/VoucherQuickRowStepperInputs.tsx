import React from 'react';
import { Layers, Tag, Calendar, Percent } from 'lucide-react';
import { Select } from '../Select';
import { VoucherQuickRowStepperSerialSection } from './VoucherQuickRowStepperSerialSection';
import { VoucherQuickRowDiscountField } from './VoucherQuickRowDiscountField';
import {
  VoucherLineItem,
  VoucherBatchMode,
  VoucherSerialMode,
  VoucherPackagingOption,
} from './FastVoucherEntryLayout.types';

interface VoucherQuickRowStepperInputsProps {
  item: Partial<VoucherLineItem>;
  batchMode: VoucherBatchMode;
  serialMode?: VoucherSerialMode;
  allowRateOverride: boolean;
  qty: number;
  setQty: (qty: number) => void;
  packagingName: string;
  handlePackagingChange: (opt: VoucherPackagingOption) => void;
  batchCode: string;
  setBatchCode: (code: string) => void;
  handleBatchSelect: (code: string) => void;
  effectiveBatches: Array<{ batch_code: string; expiry_date?: string; mrp?: number; available_quantity?: number }>;
  expiryDate: string;
  setExpiryDate: (exp: string) => void;
  serialNumbers: string[];
  serialInputText: string;
  setSerialInputText: (val: string) => void;
  availableSerials: string[];
  handleAddSerialTags: (raw: string) => void;
  handleRemoveSerialTag: (serial: string) => void;
  handleToggleSelectSerial: (serial: string) => void;
  unitPrice: number;
  setUnitPrice: (price: number) => void;
  discountMode: 'flat' | 'percent';
  handleDiscountModeChange: (mode: 'flat' | 'percent') => void;
  discountPercent: number;
  setDiscountPercent: (disc: number) => void;
  discountAmount: number;
  setDiscountAmount: (amt: number) => void;
  taxPercent: number;
  setTaxPercent: (tax: number) => void;
  qtyInputRef: React.RefObject<HTMLInputElement>;
  packagingSelectRef: React.RefObject<HTMLSelectElement>;
  batchInputRef: React.RefObject<HTMLInputElement | HTMLSelectElement>;
  expiryInputRef: React.RefObject<HTMLInputElement>;
  rateInputRef: React.RefObject<HTMLInputElement>;
  discountInputRef: React.RefObject<HTMLInputElement>;
  taxInputRef: React.RefObject<HTMLInputElement>;
  handleCommit: () => void;
}

export const VoucherQuickRowStepperInputs: React.FC<VoucherQuickRowStepperInputsProps> = ({
  item,
  batchMode,
  serialMode = 'none',
  allowRateOverride,
  qty,
  setQty,
  packagingName,
  handlePackagingChange,
  batchCode,
  setBatchCode,
  handleBatchSelect,
  effectiveBatches,
  expiryDate,
  setExpiryDate,
  serialNumbers,
  serialInputText,
  setSerialInputText,
  availableSerials,
  handleAddSerialTags,
  handleRemoveSerialTag,
  handleToggleSelectSerial,
  unitPrice,
  setUnitPrice,
  discountMode,
  handleDiscountModeChange,
  discountPercent,
  setDiscountPercent,
  discountAmount,
  setDiscountAmount,
  taxPercent,
  setTaxPercent,
  qtyInputRef,
  packagingSelectRef,
  batchInputRef,
  expiryInputRef,
  rateInputRef,
  discountInputRef,
  taxInputRef,
  handleCommit,
}) => {
  const showBatch = Boolean(item.is_batch_tracking_enabled) && batchMode !== 'none';
  const showExpiry = Boolean(item.is_expiry_enabled) && batchMode === 'create';
  const showSerial = Boolean(item.is_serial_tracking_enabled) && serialMode !== 'none';
  const columnCount = 5 + (showBatch ? 1 : 0) + (showExpiry ? 1 : 0);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
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
              e.stopPropagation();
              if (packagingSelectRef.current) {
                packagingSelectRef.current.focus();
              } else if (showBatch && batchInputRef.current) {
                batchInputRef.current.focus();
              } else if (showExpiry && expiryInputRef.current) {
                expiryInputRef.current.focus();
              } else if (rateInputRef.current) {
                rateInputRef.current.focus();
              }
            } else if (e.key === 'Escape') {
              e.stopPropagation();
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
          <Select
            value={packagingName}
            onChange={(val) => {
              const opt = item.packagings?.find((p) => p.name === String(val));
              if (opt) handlePackagingChange(opt);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                if (showBatch && batchInputRef.current) {
                  batchInputRef.current.focus();
                } else if (showExpiry && expiryInputRef.current) {
                  expiryInputRef.current.focus();
                } else if (rateInputRef.current) {
                  rateInputRef.current.focus();
                }
              } else if (e.key === 'Escape') {
                e.stopPropagation();
              }
            }}
            options={(item.packagings || []).map((p) => ({
              value: p.name,
              label: `${p.name} (${p.size > 1 ? `${p.size} pcs` : 'Unit'})`,
            }))}
            style={{ fontSize: '0.8rem' }}
          />
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

      {/* 3. Batch (Select mode: FEFO dropdown) */}
      {showBatch && batchMode === 'select' && (
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            <Tag size={11} /> Batch (FEFO)
          </label>
          <Select
            value={batchCode}
            onChange={(val) => handleBatchSelect(String(val))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                rateInputRef.current?.focus();
              } else if (e.key === 'Escape') {
                e.stopPropagation();
              }
            }}
            options={effectiveBatches.map((b) => ({
              value: b.batch_code,
              label: `${b.batch_code} ${b.expiry_date ? `(Exp: ${b.expiry_date})` : ''} ${b.available_quantity != null ? `• Avail: ${b.available_quantity}` : ''}`.trim(),
            }))}
            placeholder={effectiveBatches.length === 0 ? 'Loading batches...' : '-- Select Batch --'}
            style={{ fontSize: '0.8rem' }}
          />
        </div>
      )}

      {/* 3b. Batch (Create mode: text input) */}
      {showBatch && batchMode === 'create' && (
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
                e.stopPropagation();
                if (showExpiry && expiryInputRef.current) {
                  expiryInputRef.current.focus();
                } else {
                  rateInputRef.current?.focus();
                }
              } else if (e.key === 'Escape') {
                e.stopPropagation();
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
      )}

      {/* 3c. Expiry (Create mode: text input) */}
      {showExpiry && (
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
                e.stopPropagation();
                rateInputRef.current?.focus();
              } else if (e.key === 'Escape') {
                e.stopPropagation();
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
              e.stopPropagation();
              discountInputRef.current?.focus();
            } else if (e.key === 'Escape') {
              e.stopPropagation();
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

      {/* 5. Line Discount (Flat ₹ or %) */}
      <VoucherQuickRowDiscountField
        discountMode={discountMode}
        handleDiscountModeChange={handleDiscountModeChange}
        discountPercent={discountPercent}
        setDiscountPercent={setDiscountPercent}
        discountAmount={discountAmount}
        setDiscountAmount={setDiscountAmount}
        discountInputRef={discountInputRef}
        taxInputRef={taxInputRef}
        handleCommit={handleCommit}
      />

      {/* 6. GST % */}
      <div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
          <Percent size={11} /> GST %
        </label>
        <input
          ref={taxInputRef}
          type="number"
          min="0"
          max="100"
          step="any"
          placeholder="0"
          value={taxPercent === 0 ? '' : taxPercent}
          onFocus={(e) => {
            if (Number(e.target.value) === 0) {
              e.target.value = '';
            }
            e.target.select();
          }}
          onClick={(e) => {
            const target = e.target as HTMLInputElement;
            if (Number(target.value) === 0) {
              target.value = '';
            }
            target.select();
          }}
          onChange={(e) => {
            const raw = e.target.value;
            setTaxPercent(raw === '' ? 0 : Number(raw));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              handleCommit();
            } else if (e.key === 'Escape') {
              e.stopPropagation();
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

      {/* 7. Serial Number Capture / Selector */}
      {showSerial && (
        <VoucherQuickRowStepperSerialSection
          serialMode={serialMode}
          qty={qty}
          serialNumbers={serialNumbers}
          serialInputText={serialInputText}
          setSerialInputText={setSerialInputText}
          availableSerials={availableSerials}
          handleAddSerialTags={handleAddSerialTags}
          handleRemoveSerialTag={handleRemoveSerialTag}
          handleToggleSelectSerial={handleToggleSelectSerial}
        />
      )}
    </div>
  );
};

