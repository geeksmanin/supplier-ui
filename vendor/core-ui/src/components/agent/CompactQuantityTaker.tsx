import React from 'react';
import { Minus, Plus, Edit3 } from 'lucide-react';

export interface MultiplierOption {
  key: string;
  label?: string;
  name?: string;
  factor?: number;
  size?: number;
  isDefault?: boolean;
}

export interface CompactQuantityTakerProps {
  qtyMode: 'free_text' | 'multiplier' | 'FREE_TEXT' | 'MULTIPLIER';
  onQtyModeChange: (mode: any) => void;
  freeTextQty: string;
  onFreeTextQtyChange: (val: string) => void;
  packCount: number | string;
  onPackCountChange: (count: any) => void;
  selectedMultiplierKey: string;
  onMultiplierKeyChange: (key: string) => void;
  availableMultipliers?: MultiplierOption[];
  unitName?: string;
  totalQuantity: number;
  onStep: (delta: number) => void;
  disabled?: boolean;
}

const pillBaseStyle: React.CSSProperties = {
  padding: '4px 10px',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  transition: 'all 0.15s ease',
  border: '1px solid transparent',
};

const pillActiveStyle: React.CSSProperties = {
  ...pillBaseStyle,
  backgroundColor: '#E8F5E9',
  color: '#008069',
  borderColor: '#008069',
};

const pillInactiveStyle: React.CSSProperties = {
  ...pillBaseStyle,
  backgroundColor: '#F1F5F9',
  color: '#475569',
  borderColor: '#E2E8F0',
};

const stepperBtnStyle: React.CSSProperties = {
  width: 38,
  height: 38,
  minWidth: 38,
  borderRadius: 8,
  border: '1px solid #CBD5E1',
  backgroundColor: '#F8FAFC',
  color: '#0F172A',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  transition: 'all 0.12s ease',
};

const inputStepperBoxStyle: React.CSSProperties = {
  width: 90,
  maxWidth: 110,
  minWidth: 60,
  flex: '0 0 90px',
  height: 38,
  textAlign: 'center',
  fontSize: 16,
  fontWeight: 700,
  border: '1px solid #CBD5E1',
  borderRadius: 8,
  outline: 'none',
  backgroundColor: '#FFFFFF',
  color: '#0F172A',
  boxSizing: 'border-box',
};

export const CompactQuantityTaker: React.FC<CompactQuantityTakerProps> = ({
  qtyMode,
  onQtyModeChange,
  freeTextQty,
  onFreeTextQtyChange,
  packCount,
  onPackCountChange,
  selectedMultiplierKey,
  onMultiplierKeyChange,
  availableMultipliers = [],
  unitName = 'Units',
  totalQuantity,
  onStep,
  disabled = false,
}) => {
  const isFreeText = String(qtyMode).toLowerCase() === 'free_text';
  const numericPackCount = typeof packCount === 'number' ? packCount : parseInt(packCount, 10) || 1;

  return (
    <div
      className="compact-quantity-taker-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Row: Pill Selector + Calculated Total Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onQtyModeChange(qtyMode === 'FREE_TEXT' || qtyMode === 'MULTIPLIER' ? 'FREE_TEXT' : 'free_text')}
            style={isFreeText ? pillActiveStyle : pillInactiveStyle}
            title="Direct base unit count"
          >
            <Edit3 size={11} />
            <span>Free Text</span>
          </button>

          {availableMultipliers.map((m) => {
            const isSelected = !isFreeText && selectedMultiplierKey === m.key;
            const displayLabel = m.label || m.name || m.key;
            const factor = m.factor || m.size || 1;
            return (
              <button
                key={m.key}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onQtyModeChange(qtyMode === 'FREE_TEXT' || qtyMode === 'MULTIPLIER' ? 'MULTIPLIER' : 'multiplier');
                  onMultiplierKeyChange(m.key);
                }}
                style={isSelected ? pillActiveStyle : pillInactiveStyle}
                title={`Multiply count by ${factor}`}
              >
                <span>{displayLabel}</span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: '#008069',
            backgroundColor: '#E8F5E9',
            padding: '2px 8px',
            borderRadius: 6,
            whiteSpace: 'nowrap',
          }}
        >
          Total: {totalQuantity} {unitName}
        </div>
      </div>

      {/* Bottom Row: Stepper [-] [input] [+] and unit label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          type="button"
          onClick={() => onStep(-1)}
          disabled={disabled || (isFreeText && parseFloat(freeTextQty) <= 1) || (!isFreeText && numericPackCount <= 1)}
          style={stepperBtnStyle}
          title="Decrease count"
          aria-label="Decrease count"
        >
          <Minus size={15} />
        </button>

        <input
          type="number"
          min="1"
          step="1"
          value={isFreeText ? freeTextQty : packCount}
          onChange={(e) => {
            if (isFreeText) {
              onFreeTextQtyChange(e.target.value);
            } else {
              onPackCountChange(e.target.value);
            }
          }}
          disabled={disabled}
          style={inputStepperBoxStyle}
          className="stock-qty-input"
        />

        <button
          type="button"
          onClick={() => onStep(1)}
          disabled={disabled}
          style={stepperBtnStyle}
          title="Increase count"
          aria-label="Increase count"
        >
          <Plus size={15} />
        </button>

        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: '#64748B',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {isFreeText ? unitName : `Packs (${selectedMultiplierKey || '1×'})`}
        </span>
      </div>
    </div>
  );
};
