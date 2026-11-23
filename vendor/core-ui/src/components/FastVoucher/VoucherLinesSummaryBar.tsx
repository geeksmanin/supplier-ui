import React from 'react';
import { Layers } from 'lucide-react';

export interface VoucherLinesSummaryBarProps {
  itemCount: number;
  totalQuantity: number;
}

export const VoucherLinesSummaryBar: React.FC<VoucherLinesSummaryBarProps> = ({
  itemCount,
  totalQuantity,
}) => {
  return (
    <div
      style={{
        padding: '0.65rem 1.15rem',
        backgroundColor: '#f1f5f9',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.78rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', fontWeight: 700 }}>
        <Layers size={13} color="#2563eb" />
        <span>Total Lines:</span>
        <span
          style={{
            backgroundColor: '#ffffff',
            padding: '1px 6px',
            borderRadius: '4px',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
            fontWeight: 800,
          }}
        >
          {itemCount}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#334155', fontWeight: 700 }}>
        <span>Total Qty:</span>
        <span
          style={{
            backgroundColor: '#eff6ff',
            padding: '1px 6px',
            borderRadius: '4px',
            border: '1px solid #bfdbfe',
            color: '#2563eb',
            fontWeight: 800,
          }}
        >
          {totalQuantity}
        </span>
        <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
          {totalQuantity === 1 ? 'Unit' : 'Units'}
        </span>
      </div>
    </div>
  );
};
