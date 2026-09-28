import React, { useState } from 'react';

export interface MobileTableColumn<T = any> {
  id: string;
  header: string;
  accessor?: (row: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'currency' | 'badge' | 'date';
  isPrimary?: boolean;
}

export interface MobileTableProps<T = any> {
  columns: MobileTableColumn<T>[];
  data: T[];
  keyExtractor?: (row: T, index: number) => string;
  caption?: string;
  totalRow?: Record<string, React.ReactNode>;
  defaultViewMode?: 'stacked' | 'table';
  showViewToggle?: boolean;
  onRowClick?: (row: T, index: number) => void;
  colorCoding?: boolean;
  emptyText?: string;
  maxHeight?: string;
}

interface ColumnColorTheme {
  bg: string;
  border: string;
  labelColor: string;
  valueColor: string;
}

function getColumnColorTheme(colId: string, colHeader: string, type?: string): ColumnColorTheme {
  const text = (colId + ' ' + colHeader + ' ' + (type || '')).toLowerCase();

  // Quantity / Count / Packed (Emerald Green)
  if (text.includes('qty') || text.includes('quantity') || text.includes('count') || text.includes('pcs') || text.includes('packed')) {
    return { bg: '#ecfdf5', border: '#a7f3d0', labelColor: '#047857', valueColor: '#065f46' };
  }

  // Rate / Price (Sapphire Blue)
  if (text.includes('rate') || text.includes('price') || text.includes('mrp') || type === 'currency') {
    return { bg: '#eff6ff', border: '#bfdbfe', labelColor: '#1d4ed8', valueColor: '#1e40af' };
  }

  // Amount / Total / Net (Warm Amber / Gold)
  if (text.includes('amount') || text.includes('total') || text.includes('net') || text.includes('taxable')) {
    return { bg: '#fffbeb', border: '#fde68a', labelColor: '#b45309', valueColor: '#92400e' };
  }

  // Unit / UOM / Pack (Purple)
  if (text.includes('unit') || text.includes('uom') || text.includes('pack')) {
    return { bg: '#f5f3ff', border: '#ddd6fe', labelColor: '#6d28d9', valueColor: '#5b21b6' };
  }

  // Default / Property (Slate)
  return { bg: '#f8fafc', border: '#e2e8f0', labelColor: '#64748b', valueColor: '#1e293b' };
}

export const MobileTable = <T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  caption,
  totalRow,
  defaultViewMode = 'stacked',
  showViewToggle = true,
  onRowClick,
  colorCoding = true,
  emptyText = 'No items found',
  maxHeight = '420px',
}: MobileTableProps<T>) => {
  const [viewMode, setViewMode] = useState<'stacked' | 'table'>(defaultViewMode);

  if (!columns || columns.length === 0) return null;

  const primaryCol = columns.find((c) => c.isPrimary) || columns[0];
  const otherCols = columns.filter((c) => c.id !== primaryCol.id);

  const getCellVal = (col: MobileTableColumn<T>, row: T, index: number): React.ReactNode => {
    if (col.accessor) return col.accessor(row, index);
    return row[col.id] !== undefined ? row[col.id] : '';
  };

  const borderColor = '#e2e8f0';
  const headerBg = '#f1f5f9';
  const evenRowBg = '#ffffff';
  const oddRowBg = '#f8fafc';
  const stickyShadow = '3px 0 6px -1px rgba(0, 0, 0, 0.08)';

  return (
    <div style={{
      width: '100%',
      position: 'relative',
      borderRadius: '12px',
      overflow: 'hidden',
      border: `1px solid ${borderColor}`,
      background: '#ffffff',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
    }}>
      {/* Table Header / Action Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: headerBg,
        borderBottom: `1px solid ${borderColor}`,
        fontSize: '0.78rem',
        fontWeight: 700,
        gap: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
          <span style={{ color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {caption || 'Items'}
          </span>
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '1px 6px',
            borderRadius: '10px',
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            border: '1px solid #bfdbfe',
          }}>
            {data.length}
          </span>
        </div>

        {showViewToggle && (
          <button
            type="button"
            onClick={() => setViewMode((prev) => (prev === 'stacked' ? 'table' : 'stacked'))}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              padding: '3px 8px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.68rem',
              fontWeight: 700,
              color: '#334155',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <span>{viewMode === 'stacked' ? '📊 Table View' : '🗂️ Stacked View'}</span>
          </button>
        )}
      </div>

      {data.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '0.82rem' }}>
          {emptyText}
        </div>
      ) : viewMode === 'stacked' ? (
        /* Mobile-First Stacked Columns Layout */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '10px',
          background: '#f8fafc',
          maxHeight,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}>
          {data.map((row, rIdx) => {
            const key = keyExtractor ? keyExtractor(row, rIdx) : String(rIdx);
            const primaryVal = getCellVal(primaryCol, row, rIdx);

            return (
              <div
                key={key}
                onClick={() => onRowClick && onRowClick(row, rIdx)}
                style={{
                  background: '#ffffff',
                  border: `1px solid ${borderColor}`,
                  borderRadius: '10px',
                  padding: '10px 12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  cursor: onRowClick ? 'pointer' : 'default',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {/* Header: S.No badge & Primary Title */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}>
                  <span style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#2563eb',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}>
                    {rIdx + 1}
                  </span>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    color: '#0f172a',
                    lineHeight: 1.35,
                    flex: 1,
                  }}>
                    {primaryVal}
                  </div>
                </div>

                {/* Stacks horizontal columns into a color-coded attribute grid (2 columns for Ordered & Packed Qty) */}
                {otherCols.length > 0 && (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: otherCols.length === 2 ? '1fr 1fr' : 'repeat(auto-fit, minmax(75px, 1fr))',
                    gap: '6px',
                    paddingTop: '2px',
                  }}>
                    {otherCols.map((col) => {
                      const val = getCellVal(col, row, rIdx);
                      if (val === undefined || val === null || val === '') return null;
                      const theme = colorCoding
                        ? getColumnColorTheme(col.id, col.header, col.type)
                        : { bg: '#f8fafc', border: '#e2e8f0', labelColor: '#64748b', valueColor: '#1e293b' };

                      return (
                        <div
                          key={col.id}
                          style={{
                            backgroundColor: theme.bg,
                            border: `1px solid ${theme.border}`,
                            borderRadius: '6px',
                            padding: '4px 7px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1px',
                            minWidth: 0,
                          }}
                        >
                          <span style={{
                            fontSize: '0.6rem',
                            fontWeight: 700,
                            color: theme.labelColor,
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {col.header}
                          </span>
                          <span style={{
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            color: theme.valueColor,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {totalRow && (
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              padding: '10px 12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#1e293b',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                marginBottom: '6px',
              }}>
                {totalRow[primaryCol.id] || 'Total / Summary'}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
                gap: '6px',
              }}>
                {otherCols.map((col) => {
                  const val = totalRow[col.id];
                  if (val === undefined || val === null || val === '') return null;
                  const theme = colorCoding
                    ? getColumnColorTheme(col.id, col.header, col.type)
                    : { bg: '#ffffff', border: '#cbd5e1', labelColor: '#64748b', valueColor: '#1e293b' };

                  return (
                    <div
                      key={col.id}
                      style={{
                        backgroundColor: theme.bg,
                        border: `1.5px solid ${theme.border}`,
                        borderRadius: '6px',
                        padding: '4px 7px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1px',
                      }}
                    >
                      <span style={{ fontSize: '0.6rem', fontWeight: 700, color: theme.labelColor, textTransform: 'uppercase' }}>
                        {col.header}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 900, color: theme.valueColor }}>
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Full Table with Solid Opaque Sticky Column 0 */
        <div style={{
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          maxWidth: '100%',
          maxHeight,
        }}>
          <table style={{
            width: '100%',
            minWidth: `${Math.max(280, columns.length * 90)}px`,
            borderCollapse: 'separate',
            borderSpacing: 0,
            fontSize: '0.8rem',
            lineHeight: 1.35,
          }}>
            <thead>
              <tr style={{ background: headerBg }}>
                {columns.map((col, idx) => {
                  const isSticky = idx === 0;
                  return (
                    <th
                      key={col.id}
                      style={{
                        padding: '8px 10px',
                        fontWeight: 700,
                        textAlign: col.align || 'left',
                        width: col.width || 'auto',
                        borderBottom: `1px solid ${borderColor}`,
                        borderRight: isSticky ? `1px solid ${borderColor}` : (idx < columns.length - 1 ? `1px solid ${borderColor}` : undefined),
                        whiteSpace: isSticky ? 'normal' : 'nowrap',
                        position: isSticky ? 'sticky' : undefined,
                        left: isSticky ? 0 : undefined,
                        background: headerBg,
                        zIndex: isSticky ? 3 : 1,
                        boxShadow: isSticky ? stickyShadow : undefined,
                        minWidth: isSticky ? '130px' : '70px',
                        maxWidth: isSticky ? '220px' : undefined,
                      }}
                    >
                      {col.header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.map((row, rIdx) => {
                const isOdd = rIdx % 2 === 1;
                const rowBg = isOdd ? oddRowBg : evenRowBg;
                const key = keyExtractor ? keyExtractor(row, rIdx) : String(rIdx);

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick && onRowClick(row, rIdx)}
                    style={{
                      background: rowBg,
                      cursor: onRowClick ? 'pointer' : 'default',
                    }}
                  >
                    {columns.map((col, cIdx) => {
                      const isSticky = cIdx === 0;
                      const val = getCellVal(col, row, rIdx);

                      return (
                        <td
                          key={col.id}
                          style={{
                            padding: '8px 10px',
                            textAlign: col.align || 'left',
                            borderBottom: rIdx < data.length - 1 ? `1px solid ${borderColor}` : undefined,
                            borderRight: isSticky ? `1px solid ${borderColor}` : (cIdx < columns.length - 1 ? `1px solid ${borderColor}` : undefined),
                            position: isSticky ? 'sticky' : undefined,
                            left: isSticky ? 0 : undefined,
                            background: rowBg, // Solid opaque background eliminates ghost text bleedthrough
                            zIndex: isSticky ? 2 : 1,
                            boxShadow: isSticky ? stickyShadow : undefined,
                            whiteSpace: isSticky ? 'normal' : 'nowrap',
                            wordBreak: isSticky ? 'break-word' : undefined,
                            minWidth: isSticky ? '130px' : '70px',
                            maxWidth: isSticky ? '220px' : undefined,
                          }}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
            {totalRow && (
              <tfoot>
                <tr style={{
                  background: headerBg,
                  fontWeight: 700,
                  borderTop: `2px solid ${borderColor}`,
                }}>
                  {columns.map((col, cIdx) => {
                    const isSticky = cIdx === 0;
                    const totalVal = totalRow[col.id] || '';

                    return (
                      <td
                        key={col.id}
                        style={{
                          padding: '8px 10px',
                          textAlign: col.align || 'left',
                          position: isSticky ? 'sticky' : undefined,
                          left: isSticky ? 0 : undefined,
                          background: headerBg,
                          zIndex: isSticky ? 2 : 1,
                          boxShadow: isSticky ? stickyShadow : undefined,
                          borderRight: isSticky ? `1px solid ${borderColor}` : undefined,
                          borderTop: `2px solid ${borderColor}`,
                        }}
                      >
                        {totalVal}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
};
