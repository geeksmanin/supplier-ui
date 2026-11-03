import React from 'react';
import { ShoppingBag, Edit2, Trash2 } from 'lucide-react';
import { VoucherLineItem, VoucherBatchMode } from './FastVoucherEntryLayout.types';

interface FastVoucherTableSectionProps {
  items: VoucherLineItem[];
  batchMode: VoucherBatchMode;
  tableRef: React.RefObject<HTMLDivElement>;
  focusedRowIndex: number | null;
  setFocusedRowIndex: (idx: number) => void;
  onEditRow: (idx: number, item: VoucherLineItem) => void;
  onRemoveItem: (idx: number) => void;
}

export const FastVoucherTableSection: React.FC<FastVoucherTableSectionProps> = ({
  items,
  batchMode,
  tableRef,
  focusedRowIndex,
  setFocusedRowIndex,
  onEditRow,
  onRemoveItem,
}) => {
  return (
    <>
      <style>{`
        .fast-voucher-table-wrap {
          flex: 1;
          overflow-y: auto;
          padding: 0 1.25rem;
        }
        .fast-voucher-empty {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          padding: 3rem 1rem;
        }
        .fast-voucher-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.825rem;
          margin-top: 0.5rem;
        }
        .fast-voucher-table th {
          border-bottom: 1.5px solid #cbd5e1;
          color: #475569;
          text-align: left;
        }
        .fast-voucher-table td {
          border-bottom: 1px solid #f1f5f9;
        }
        .fast-voucher-action-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 3px;
        }
        .fast-voucher-cheatsheet {
          padding: 0.5rem 1.25rem;
          background-color: #f8fafc;
          border-top: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.72rem;
          color: #64748b;
        }
      `}</style>

      {/* Dense Tabular Items Table */}
      <div ref={tableRef} className="fast-voucher-table-wrap">
        {items.length === 0 ? (
          <div className="fast-voucher-empty">
            <ShoppingBag size={48} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#64748b' }}>No items added yet</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
              Press <strong style={{ color: '#2563eb' }}>F4</strong> to search products or scan a barcode
            </div>
          </div>
        ) : (
          <table className="fast-voucher-table">
            <thead>
              <tr>
                <th style={{ padding: '8px 6px', width: '40px', textAlign: 'center' }}>#</th>
                <th style={{ padding: '8px 10px' }}>Item Description</th>
                <th style={{ padding: '8px 8px', width: '90px' }}>SKU</th>
                {batchMode !== 'none' && <th style={{ padding: '8px 8px', width: '110px' }}>Batch / Exp</th>}
                <th style={{ padding: '8px 8px', width: '90px' }}>Unit</th>
                <th style={{ padding: '8px 8px', width: '70px', textAlign: 'right' }}>Qty</th>
                <th style={{ padding: '8px 8px', width: '90px', textAlign: 'right' }}>Rate (₹)</th>
                <th style={{ padding: '8px 8px', width: '65px', textAlign: 'right' }}>Disc %</th>
                <th style={{ padding: '8px 8px', width: '65px', textAlign: 'right' }}>Tax %</th>
                <th style={{ padding: '8px 10px', width: '110px', textAlign: 'right' }}>Total (₹)</th>
                <th style={{ padding: '8px 6px', width: '60px', textAlign: 'center' }}>Act</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, idx) => {
                const isFocused = focusedRowIndex === idx;

                return (
                  <tr
                    key={row.id || idx}
                    style={{
                      backgroundColor: isFocused ? '#eff6ff' : idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                      outline: isFocused ? '2px solid #3b82f6' : 'none',
                      cursor: 'pointer',
                    }}
                    onClick={() => setFocusedRowIndex(idx)}
                    onDoubleClick={() => onEditRow(idx, row)}
                  >
                    <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{row.product_name}</div>
                      </div>
                      {row.remarks && (
                        <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
                          {row.remarks}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '8px 8px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
                      {row.sku_code || '-'}
                    </td>
                    {batchMode !== 'none' && (
                      <td style={{ padding: '8px 8px' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{row.batch_code || '-'}</span>
                        {row.expiry_date && (
                          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Exp: {row.expiry_date}</div>
                        )}
                      </td>
                    )}
                    <td style={{ padding: '8px 8px', color: '#475569' }}>
                      {row.packaging_name || 'Unit'}
                      {row.packaging_size > 1 ? ` (${row.packaging_size}s)` : ''}
                    </td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                      {row.quantity}
                    </td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', color: '#334155' }}>
                      ₹{Number(row.unit_price).toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', color: row.discount_percent ? '#dc2626' : '#94a3b8' }}>
                      {row.discount_percent ? `${row.discount_percent}%` : '-'}
                    </td>
                    <td style={{ padding: '8px 8px', textAlign: 'right', color: '#059669', fontSize: '0.75rem' }}>
                      {row.tax_percent ? `${row.tax_percent}%` : '-'}
                    </td>
                    <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#2563eb' }}>
                      ₹{Number(row.line_total).toFixed(2)}
                    </td>
                    <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditRow(idx, row);
                          }}
                          className="fast-voucher-action-btn"
                          style={{ color: '#64748b' }}
                          title="Edit line (E)"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveItem(idx);
                          }}
                          className="fast-voucher-action-btn"
                          style={{ color: '#ef4444' }}
                          title="Delete line (Del)"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Hotkey Cheatsheet Strip */}
      <div className="fast-voucher-cheatsheet">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>
            <strong style={{ color: '#2563eb' }}>[F2]</strong> Party
          </span>
          <span>
            <strong style={{ color: '#2563eb' }}>[F4]</strong> Search
          </span>
          <span>
            <strong style={{ color: '#2563eb' }}>[↓]</strong> Table Nav
          </span>
          <span>
            <strong style={{ color: '#2563eb' }}>[E]</strong> Edit Row
          </span>
          <span>
            <strong style={{ color: '#2563eb' }}>[Del]</strong> Delete
          </span>
          <span>
            <strong style={{ color: '#2563eb' }}>[F3]</strong> More Info
          </span>
          <span>
            <strong style={{ color: '#2563eb' }}>[F6]</strong> Park
          </span>
        </div>
        <div>
          <strong style={{ color: '#059669' }}>[F10]</strong> Save / Submit
        </div>
      </div>
    </>
  );
};

