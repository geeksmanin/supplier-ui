import React, { useState, useEffect, useRef } from 'react';
import { Select } from './Select';

export interface SpreadsheetColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'async-select' | 'readonly';
  options?: Array<{ value: string; label: string }>;
  async?: {
    url: string;
    searchParam: string;
    transform: (data: any) => Array<{ value: string; label: string }>;
  };
  width?: string;
  placeholder?: string;
  render?: (value: any, row: any, rIdx: number) => React.ReactNode;
  renderOption?: (option: any, isSelected: boolean) => React.ReactNode;
}

interface SpreadsheetGridProps {
  columns: SpreadsheetColumn[];
  data: any[];
  onChange: (newData: any[]) => void;
  onAddRow?: () => void;
  onRemoveRow?: (index: number) => void;
}

export const SpreadsheetGrid: React.FC<SpreadsheetGridProps> = ({
  columns,
  data,
  onChange,
  onAddRow,
  onRemoveRow,
}) => {
  const [focusedCell, setFocusedCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; colIndex: number } | null>(null);
  const gridRef = useRef<HTMLTableElement>(null);

  // Handle cell value change
  const handleCellChange = (rowIndex: number, key: string, value: any) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [key]: value };
    onChange(newData);
  };

  // Keyboard navigation logic
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (gridRef.current && !gridRef.current.contains(activeEl) && !gridRef.current.contains(e.target as Node)) {
        return;
      }

      if (!focusedCell) return;
      const { rowIndex, colIndex } = focusedCell;
      const isEditing = editingCell && editingCell.rowIndex === rowIndex && editingCell.colIndex === colIndex;

      if (isEditing) {
        if (e.key === 'Escape') {
          setEditingCell(null);
          gridRef.current?.focus();
          e.preventDefault();
        } else if (e.key === 'Enter' || e.key === 'Tab') {
          // Commit edit and stop editing
          setEditingCell(null);
          gridRef.current?.focus();
          e.preventDefault();
        }
        return;
      }

      // Navigate mode key handlers
      let nextRow = rowIndex;
      let nextCol = colIndex;

      switch (e.key) {
        case 'ArrowUp':
          nextRow = Math.max(0, rowIndex - 1);
          e.preventDefault();
          break;
        case 'ArrowDown':
          nextRow = Math.min(data.length - 1, rowIndex + 1);
          e.preventDefault();
          break;
        case 'ArrowLeft':
          nextCol = Math.max(0, colIndex - 1);
          e.preventDefault();
          break;
        case 'ArrowRight':
          nextCol = Math.min(columns.length - 1, colIndex + 1);
          e.preventDefault();
          break;
        case 'Tab':
          if (e.shiftKey) {
            if (colIndex > 0) {
              nextCol = colIndex - 1;
            } else if (rowIndex > 0) {
              nextRow = rowIndex - 1;
              nextCol = columns.length - 1;
            }
          } else {
            if (colIndex < columns.length - 1) {
              nextCol = colIndex + 1;
            } else if (rowIndex < data.length - 1) {
              nextRow = rowIndex + 1;
              nextCol = 0;
            } else if (onAddRow) {
              onAddRow();
              nextRow = rowIndex + 1;
              nextCol = 0;
            }
          }
          e.preventDefault();
          break;
        case 'Enter':
          if (columns[colIndex]?.type !== 'readonly') {
            setEditingCell({ rowIndex, colIndex });
          }
          e.preventDefault();
          break;
        default:
          // Start editing on typing a alphanumeric key
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            if (columns[colIndex]?.type !== 'readonly') {
              setEditingCell({ rowIndex, colIndex });
            }
          }
          break;
      }

      if (nextRow !== rowIndex || nextCol !== colIndex) {
        setFocusedCell({ rowIndex: nextRow, colIndex: nextCol });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusedCell, editingCell, data, columns, onAddRow]);

  const cellStyle = (isFocused: boolean, isEditing: boolean): React.CSSProperties => ({
    padding: '4px 8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.85rem',
    height: '32px',
    position: 'relative',
    backgroundColor: isFocused ? '#eff6ff' : 'transparent',
    outline: isFocused ? '2px solid #3b82f6' : 'none',
    zIndex: isEditing ? 100 : (isFocused ? 10 : 1),
    cursor: 'cell',
  });

  return (
    <div style={{ 
      overflowX: 'auto', 
      border: '1px solid #e2e8f0', 
      borderRadius: '8px', 
      backgroundColor: '#ffffff',
      minHeight: editingCell ? '280px' : 'auto',
      transition: 'min-height 0.15s ease'
    }}>
      <table
        ref={gridRef}
        tabIndex={0}
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          outline: 'none',
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  padding: '8px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#475569',
                  textTransform: 'uppercase',
                  borderRight: '1px solid #e2e8f0',
                  width: col.width || 'auto',
                }}
              >
                {col.label}
              </th>
            ))}
            {onRemoveRow && (
              <th style={{ width: '40px', padding: '8px 12px' }}></th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rIdx) => (
            <tr key={rIdx} style={{ borderBottom: '1px solid #e2e8f0' }}>
              {columns.map((col, cIdx) => {
                const isFocused = focusedCell?.rowIndex === rIdx && focusedCell?.colIndex === cIdx;
                const isEditing = editingCell?.rowIndex === rIdx && editingCell?.colIndex === cIdx;
                const value = row[col.key] || '';

                return (
                  <td
                    key={col.key}
                    onClick={() => {
                      setFocusedCell({ rowIndex: rIdx, colIndex: cIdx });
                      if (col.type !== 'readonly') {
                        setEditingCell({ rowIndex: rIdx, colIndex: cIdx });
                      }
                    }}
                    style={cellStyle(isFocused, isEditing)}
                  >
                    {isEditing ? (
                      col.type === 'select' ? (
                        <select
                          value={value}
                          onChange={(e) => handleCellChange(rIdx, col.key, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          style={{ width: '100%', border: 'none', outline: 'none', fontSize: '0.85rem', background: 'transparent' }}
                        >
                          {col.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : col.type === 'async-select' && col.async ? (
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50, backgroundColor: '#ffffff' }}>
                          <Select
                            value={value}
                            onChange={(val) => {
                              handleCellChange(rIdx, col.key, String(val));
                              setEditingCell(null);
                            }}
                            placeholder={col.placeholder || 'Select...'}
                            options={col.options || []}
                            async={col.async}
                            defaultOpen={true}
                            renderOption={col.renderOption}
                          />
                        </div>
                      ) : (
                        <input
                          type={col.type === 'number' ? 'number' : 'text'}
                          value={value}
                          onChange={(e) => handleCellChange(rIdx, col.key, e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          autoFocus
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            outline: 'none',
                            fontSize: '0.85rem',
                            padding: 0,
                            margin: 0,
                            backgroundColor: 'transparent',
                            boxSizing: 'border-box'
                          }}
                        />
                      )
                    ) : (
                      <div style={{ padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {col.render ? (
                          col.render(value, row, rIdx)
                        ) : col.type === 'select' || col.type === 'async-select' ? (
                          col.options?.find(o => String(o.value) === String(value))?.label || value
                        ) : (
                          value
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
              {onRemoveRow && (
                <td style={{ padding: '4px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => onRemoveRow(rIdx)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                    }}
                  >
                    &times;
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {onAddRow && (
        <div style={{ padding: '8px 12px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
          <button
            type="button"
            onClick={onAddRow}
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            + Add Row
          </button>
        </div>
      )}
    </div>
  );
};
