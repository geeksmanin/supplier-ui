import React from 'react';
import { Tag, Calendar } from 'lucide-react';
import { Select } from '../Select';
import { VoucherBatchMode } from './FastVoucherEntryLayout.types';

export function formatExpiryLabel(raw?: string): string {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (!trimmed) return '';
  return trimmed.includes('T') ? trimmed.slice(0, 10) : trimmed;
}

interface VoucherQuickRowStepperBatchExpirySectionProps {
  showBatch: boolean;
  showExpiry: boolean;
  batchMode: VoucherBatchMode;
  batchCode: string;
  setBatchCode: (code: string) => void;
  handleBatchSelect: (code: string) => void;
  effectiveBatches: Array<{
    batch_code: string;
    expiry_date?: string;
    mrp?: number;
    available_quantity?: number;
    location_id?: string;
  }>;
  expiryDate: string;
  setExpiryDate: (exp: string) => void;
  batchInputRef: React.RefObject<HTMLInputElement | HTMLSelectElement>;
  expiryInputRef: React.RefObject<HTMLInputElement>;
  rateInputRef: React.RefObject<HTMLInputElement>;
}

export const VoucherQuickRowStepperBatchExpirySection: React.FC<
  VoucherQuickRowStepperBatchExpirySectionProps
> = ({
  showBatch,
  showExpiry,
  batchMode,
  batchCode,
  setBatchCode,
  handleBatchSelect,
  effectiveBatches,
  expiryDate,
  setExpiryDate,
  batchInputRef,
  expiryInputRef,
  rateInputRef,
}) => {
  const formattedExp = formatExpiryLabel(expiryDate);
  const expTime = formattedExp ? new Date(formattedExp).getTime() : NaN;
  const isExpired = !Number.isNaN(expTime) && expTime < Date.now();

  return (
    <>
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
            options={effectiveBatches.map((b) => {
              const expText = formatExpiryLabel(b.expiry_date);
              return {
                value: b.batch_code,
                label: `${b.batch_code} ${expText ? `(Exp: ${expText})` : ''} ${b.available_quantity != null ? `• Avail: ${b.available_quantity}` : ''}`.trim(),
              };
            })}
            placeholder={effectiveBatches.length === 0 ? 'No batches in stock' : '-- Select Batch --'}
            style={{ fontSize: '0.8rem' }}
          />
        </div>
      )}

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

      {showExpiry && batchMode === 'create' && (
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

      {showExpiry && batchMode === 'select' && (
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            <Calendar size={11} /> Expiry Date
          </label>
          <input
            type="text"
            readOnly
            data-testid="stepper-expiry-display"
            value={formattedExp || 'No expiry set'}
            style={{
              width: '100%',
              padding: '7px 10px',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: isExpired ? '1px solid #fca5a5' : '1px solid #e2e8f0',
              backgroundColor: isExpired ? '#fef2f2' : '#f8fafc',
              color: isExpired ? '#b91c1c' : formattedExp ? '#0f172a' : '#94a3b8',
            }}
          />
        </div>
      )}
    </>
  );
};
