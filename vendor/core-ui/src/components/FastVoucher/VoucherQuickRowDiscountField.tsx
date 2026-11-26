import React from 'react';
import { Percent } from 'lucide-react';

interface VoucherQuickRowDiscountFieldProps {
  discountMode: 'flat' | 'percent';
  handleDiscountModeChange: (mode: 'flat' | 'percent') => void;
  discountPercent: number;
  setDiscountPercent: (disc: number) => void;
  discountAmount: number;
  setDiscountAmount: (amt: number) => void;
  discountInputRef: React.RefObject<HTMLInputElement>;
  taxInputRef: React.RefObject<HTMLInputElement>;
  handleCommit: () => void;
}

export const VoucherQuickRowDiscountField: React.FC<VoucherQuickRowDiscountFieldProps> = ({
  discountMode,
  handleDiscountModeChange,
  discountPercent,
  setDiscountPercent,
  discountAmount,
  setDiscountAmount,
  discountInputRef,
  taxInputRef,
  handleCommit,
}) => {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', fontWeight: 700, color: '#334155' }}>
          {discountMode === 'percent' ? <Percent size={11} /> : null}
          Disc ({discountMode === 'flat' ? '₹' : '%'})
        </label>
        <div style={{ display: 'inline-flex', borderRadius: '4px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
          <button
            type="button"
            onClick={() => handleDiscountModeChange('flat')}
            aria-label="Flat rupee discount"
            style={{
              padding: '1px 5px',
              fontSize: '0.65rem',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: discountMode === 'flat' ? '#2563eb' : '#f8fafc',
              color: discountMode === 'flat' ? '#ffffff' : '#64748b',
            }}
          >
            ₹
          </button>
          <button
            type="button"
            onClick={() => handleDiscountModeChange('percent')}
            aria-label="Percentage discount"
            style={{
              padding: '1px 5px',
              fontSize: '0.65rem',
              fontWeight: 700,
              border: 'none',
              borderLeft: '1px solid #cbd5e1',
              cursor: 'pointer',
              backgroundColor: discountMode === 'percent' ? '#2563eb' : '#f8fafc',
              color: discountMode === 'percent' ? '#ffffff' : '#64748b',
            }}
          >
            %
          </button>
        </div>
      </div>
      <input
        ref={discountInputRef}
        type="number"
        min="0"
        max={discountMode === 'percent' ? '100' : undefined}
        step="any"
        placeholder="0"
        aria-label={discountMode === 'flat' ? 'Line Discount Amount (₹)' : 'Line Discount Percent (%)'}
        value={discountMode === 'flat' ? (discountAmount === 0 ? '' : discountAmount) : (discountPercent === 0 ? '' : discountPercent)}
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
          const parsed = raw === '' ? 0 : Math.max(0, Number(raw));
          if (discountMode === 'flat') {
            setDiscountAmount(parsed);
          } else {
            setDiscountPercent(Math.min(100, parsed));
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            if (taxInputRef.current) {
              taxInputRef.current.focus();
            } else {
              handleCommit();
            }
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
  );
};

