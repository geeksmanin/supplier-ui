import React, { useState } from 'react';
import { Tag, Truck, Wrench } from 'lucide-react';

export interface VoucherFinancialAdjustmentsProps {
  documentDiscountAmount?: number;
  documentDiscountPercent?: number;
  onDocumentDiscountChange?: (amount: number, percent: number) => void;
  shippingCharges?: number;
  onShippingChargesChange?: (charges: number) => void;
  otherCharges?: number;
  onOtherChargesChange?: (charges: number) => void;
  isRoundOffEnabled?: boolean;
  onRoundOffToggle?: (enabled: boolean) => void;
  discountInputRef?: React.RefObject<HTMLInputElement | null>;
  freightInputRef?: React.RefObject<HTMLInputElement | null>;
  otherChargesInputRef?: React.RefObject<HTMLInputElement | null>;
}

export const VoucherFinancialAdjustments: React.FC<VoucherFinancialAdjustmentsProps> = ({
  documentDiscountAmount = 0,
  documentDiscountPercent = 0,
  onDocumentDiscountChange,
  shippingCharges = 0,
  onShippingChargesChange,
  otherCharges = 0,
  onOtherChargesChange,
  isRoundOffEnabled = true,
  onRoundOffToggle,
  discountInputRef,
  freightInputRef,
  otherChargesInputRef,
}) => {
  const [discountMode, setDiscountMode] = useState<'flat' | 'percent'>(
    documentDiscountPercent > 0 ? 'percent' : 'flat'
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '0.75rem' }}>
      {/* Document Discount Control */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Tag size={13} color="#64748b" />
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
            Overall Discount
          </label>
          <kbd style={{ fontSize: '0.6rem', padding: '1px 4px', backgroundColor: '#f1f5f9', color: '#94a3b8', borderRadius: '3px' }}>
            Alt+D
          </kbd>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div
            style={{
              display: 'inline-flex',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              overflow: 'hidden',
              fontSize: '0.65rem',
              fontWeight: 700,
            }}
          >
            <button
              type="button"
              onClick={() => setDiscountMode('flat')}
              style={{
                padding: '2px 6px',
                border: 'none',
                backgroundColor: discountMode === 'flat' ? '#2563eb' : '#f8fafc',
                color: discountMode === 'flat' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
              }}
            >
              ₹
            </button>
            <button
              type="button"
              onClick={() => setDiscountMode('percent')}
              style={{
                padding: '2px 6px',
                border: 'none',
                backgroundColor: discountMode === 'percent' ? '#2563eb' : '#f8fafc',
                color: discountMode === 'percent' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
              }}
            >
              %
            </button>
          </div>

          <input
            ref={discountInputRef}
            type="number"
            min="0"
            step="any"
            value={discountMode === 'percent' ? (documentDiscountPercent || '') : (documentDiscountAmount || '')}
            placeholder="0"
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
              const val = raw === '' ? 0 : (parseFloat(raw) || 0);
              if (discountMode === 'percent') {
                onDocumentDiscountChange?.(0, val);
              } else {
                onDocumentDiscountChange?.(val, 0);
              }
            }}
            style={{
              width: '80px',
              textAlign: 'right',
              padding: '3px 6px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              fontSize: '0.75rem',
              fontWeight: 700,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Freight / Shipping Control */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Truck size={13} color="#64748b" />
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
            Freight / Shipping
          </label>
          <kbd style={{ fontSize: '0.6rem', padding: '1px 4px', backgroundColor: '#f1f5f9', color: '#94a3b8', borderRadius: '3px' }}>
            Alt+F
          </kbd>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>+₹</span>
          <input
            ref={freightInputRef}
            type="number"
            min="0"
            step="any"
            value={shippingCharges || ''}
            onChange={(e) => onShippingChargesChange?.(parseFloat(e.target.value) || 0)}
            placeholder="0"
            style={{
              width: '80px',
              textAlign: 'right',
              padding: '3px 6px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              fontSize: '0.75rem',
              fontWeight: 700,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Labour & Other Charges Control */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Wrench size={13} color="#64748b" />
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
            Labour / Other Charges
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>+₹</span>
          <input
            ref={otherChargesInputRef}
            type="number"
            min="0"
            step="any"
            value={otherCharges || ''}
            onChange={(e) => onOtherChargesChange?.(parseFloat(e.target.value) || 0)}
            placeholder="0"
            style={{
              width: '80px',
              textAlign: 'right',
              padding: '3px 6px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              fontSize: '0.75rem',
              fontWeight: 700,
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Round-off Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
          Auto Round-Off
        </label>
        <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}>
          <input
            type="checkbox"
            checked={isRoundOffEnabled}
            onChange={(e) => onRoundOffToggle?.(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
            {isRoundOffEnabled ? 'Enabled' : 'Exact'}
          </span>
        </label>
      </div>
    </div>
  );
};
