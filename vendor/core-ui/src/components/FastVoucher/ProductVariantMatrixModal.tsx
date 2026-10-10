import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { VoucherLineItem } from './FastVoucherEntryLayout.types';

export interface ProductVariantMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onAddVariants: (items: VoucherLineItem[]) => void;
}

interface VariantRowState {
  id: string;
  name: string;
  sku_code: string;
  attributes: Array<{ name: string; value: string }>;
  mrp: number;
  unit_price: number;
  sale_price: number;
  quantity: number;
  selected: boolean;
  packagings?: any[];
  rawVariant: any;
}

export const ProductVariantMatrixModal: React.FC<ProductVariantMatrixModalProps> = ({
  isOpen,
  onClose,
  product,
  onAddVariants,
}) => {
  const rawVariants: any[] = useMemo(() => {
    return Array.isArray(product?.variants) ? product.variants : [];
  }, [product]);

  // Transform raw variants into matrix row states
  const [rows, setRows] = useState<VariantRowState[]>(() => {
    return rawVariants.map((v: any) => {
      const attrsList: Array<{ name: string; value: string }> = [];
      if (Array.isArray(v.attributes)) {
        v.attributes.forEach((a: any) => {
          attrsList.push({
            name: a.attribute_name || a.name || 'Attr',
            value: a.value || a.attribute_value || String(a.attribute_value_id || ''),
          });
        });
      } else if (v.attributes && typeof v.attributes === 'object') {
        Object.entries(v.attributes).forEach(([k, val]) => {
          attrsList.push({ name: k, value: String(val) });
        });
      }

      const price = Number(
        v.sale_price ?? v.salePrice ?? v.price ?? v.selling_price ?? v.unit_cost ?? v.mrp ?? product?.sale_price ?? product?.price ?? 0
      );

      return {
        id: String(v.id),
        name: v.name || (product?.name ? `${product.name} - ${v.sku_code || 'Variant'}` : v.sku_code || 'Variant'),
        sku_code: v.sku_code || v.sku || '',
        attributes: attrsList,
        mrp: Number(v.mrp || price),
        unit_price: price,
        sale_price: price,
        quantity: 0,
        selected: false,
        packagings: v.packagings || product?.packagings,
        rawVariant: v,
      };
    });
  });

  // Re-sync rows if product changes
  useEffect(() => {
    setRows(
      rawVariants.map((v: any) => {
        const attrsList: Array<{ name: string; value: string }> = [];
        if (Array.isArray(v.attributes)) {
          v.attributes.forEach((a: any) => {
            attrsList.push({
              name: a.attribute_name || a.name || 'Attr',
              value: a.value || a.attribute_value || String(a.attribute_value_id || ''),
            });
          });
        } else if (v.attributes && typeof v.attributes === 'object') {
          Object.entries(v.attributes).forEach(([k, val]) => {
            attrsList.push({ name: k, value: String(val) });
          });
        }

        const price = Number(
          v.sale_price ?? v.salePrice ?? v.price ?? v.selling_price ?? v.unit_cost ?? v.mrp ?? product.sale_price ?? product.price ?? 0
        );

        return {
          id: String(v.id),
          name: v.name || `${product.name} - ${v.sku_code || 'Variant'}`,
          sku_code: v.sku_code || v.sku || '',
          attributes: attrsList,
          mrp: Number(v.mrp || price),
          unit_price: price,
          sale_price: price,
          quantity: 0,
          selected: false,
          packagings: v.packagings || product.packagings,
          rawVariant: v,
        };
      })
    );
  }, [product, rawVariants]);

interface AttributeOptionItem {
  value: string;
  count: number;
  isAvailable: boolean;
}

interface AttributeFilterMultiSelectProps {
  name: string;
  options: AttributeOptionItem[];
  selectedValues: string[];
  onChange: (newSelected: string[]) => void;
}

const AttributeFilterMultiSelect: React.FC<AttributeFilterMultiSelectProps> = ({
  name,
  options,
  selectedValues,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const availableOptions = useMemo(() => {
    return options.filter((o) => o.isAvailable);
  }, [options]);

  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase().trim();
    return options.filter((o) => o.value.toLowerCase().includes(q));
  }, [options, search]);

  const isFiltered = selectedValues.length > 0;

  // Toggle single option
  const handleToggleOption = (val: string, isAvailable: boolean) => {
    if (!isAvailable) return;
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  // Select all currently available options
  const handleSelectAllAvailable = () => {
    const allAvailableVals = availableOptions.map((o) => o.value);
    onChange(allAvailableVals);
  };

  // Clear selections
  const handleClear = () => {
    onChange([]);
  };

  // Trigger label
  const triggerLabel = useMemo(() => {
    if (selectedValues.length === 0) {
      return `All ${name}s (${availableOptions.length})`;
    }
    if (selectedValues.length === 1) {
      return selectedValues[0];
    }
    return `${selectedValues.length} Selected`;
  }, [name, selectedValues, availableOptions.length]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          fontSize: '0.76rem',
          fontWeight: isFiltered ? 700 : 500,
          borderRadius: '6px',
          border: isFiltered ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
          backgroundColor: isFiltered ? '#eff6ff' : '#ffffff',
          color: isFiltered ? '#1e40af' : '#334155',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: isFiltered ? '0 1px 3px rgba(37,99,235,0.12)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {triggerLabel}
        </span>
        {isFiltered && selectedValues.length > 1 && (
          <span
            style={{
              backgroundColor: '#2563eb',
              color: '#ffffff',
              fontSize: '0.66rem',
              fontWeight: 800,
              padding: '1px 5px',
              borderRadius: '999px',
              lineHeight: 1,
            }}
          >
            {selectedValues.length}
          </span>
        )}
        <span style={{ fontSize: '0.62rem', color: isFiltered ? '#2563eb' : '#94a3b8', marginLeft: '2px' }}>
          {isOpen ? '▲' : '▼'}
        </span>
        {isFiltered && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            title={`Clear ${name} filter`}
            style={{
              marginLeft: '4px',
              padding: '0 3px',
              borderRadius: '4px',
              color: '#dc2626',
              fontSize: '0.72rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ✕
          </span>
        )}
      </button>

      {/* Floating Dropdown Popover */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 100,
            minWidth: '220px',
            maxWidth: '300px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          {/* Header with Title & Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '4px', borderBottom: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {name} ({availableOptions.length} available)
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleSelectAllAvailable}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Quick Search inside options if > 5 options */}
          {options.length > 5 && (
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${name}...`}
              style={{
                width: '100%',
                padding: '4px 8px',
                fontSize: '0.75rem',
                border: '1px solid #e2e8f0',
                borderRadius: '5px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              autoFocus
            />
          )}

          {/* Scrollable Options List with Checkboxes */}
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '8px', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center' }}>
                No options match
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                const disabled = !opt.isAvailable;

                return (
                  <label
                    key={opt.value}
                    onClick={(e) => {
                      if (disabled) e.preventDefault();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 6px',
                      borderRadius: '5px',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      opacity: disabled ? 0.45 : 1,
                      userSelect: 'none',
                      transition: 'background-color 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!disabled && !isSelected) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!disabled && !isSelected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={disabled}
                      onChange={() => handleToggleOption(opt.value, opt.isAvailable)}
                      style={{
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        accentColor: '#2563eb',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: isSelected ? 600 : 400,
                        color: disabled ? '#94a3b8' : isSelected ? '#1e40af' : '#1e293b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {opt.value}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        color: disabled ? '#cbd5e1' : isSelected ? '#3b82f6' : '#94a3b8',
                        flexShrink: 0,
                      }}
                    >
                      ({opt.count})
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

  // Attribute Filters discovery: all distinct attributes and values in the product
  const attributeFilters = useMemo(() => {
    const map = new Map<string, Set<string>>();
    rows.forEach((r) => {
      r.attributes.forEach((a) => {
        if (!map.has(a.name)) {
          map.set(a.name, new Set());
        }
        map.get(a.name)!.add(a.value);
      });
    });

    const result: Array<{ name: string; allValues: string[] }> = [];
    map.forEach((vals, name) => {
      result.push({ name, allValues: Array.from(vals) });
    });
    return result;
  }, [rows]);

  // Multi-select active filters: attributeName -> string[] of selected values
  const [activeAttrFilters, setActiveAttrFilters] = useState<Record<string, string[]>>({});
  const [searchFilter, setSearchFilter] = useState('');
  const [quickFillQty, setQuickFillQty] = useState<number>(10);

  // Reset modal-specific filters when opened or product changes
  useEffect(() => {
    if (isOpen) {
      setActiveAttrFilters({});
      setSearchFilter('');
      setDragStartIndex(null);
      setDragCurrentIndex(null);
    }
  }, [isOpen, product?.id]);

  // Dynamic dependent/cascading options computation for each attribute facet
  const getOptionsForAttribute = useCallback(
    (targetAttrName: string, allValues: string[]): AttributeOptionItem[] => {
      // Find candidate rows satisfying all OTHER active attribute filters
      const candidateRows = rows.filter((r) => {
        // Text search check
        if (searchFilter.trim()) {
          const q = searchFilter.toLowerCase().trim();
          const inName = r.name.toLowerCase().includes(q);
          const inSku = r.sku_code.toLowerCase().includes(q);
          const inAttr = r.attributes.some((a) => a.value.toLowerCase().includes(q));
          if (!inName && !inSku && !inAttr) return false;
        }

        // Other attribute filters
        for (const [attrName, selectedVals] of Object.entries(activeAttrFilters)) {
          if (attrName !== targetAttrName && selectedVals && selectedVals.length > 0) {
            const match = r.attributes.some((a) => a.name === attrName && selectedVals.includes(a.value));
            if (!match) return false;
          }
        }
        return true;
      });

      // Count occurrences of each value of targetAttrName in candidateRows
      const countsMap = new Map<string, number>();
      candidateRows.forEach((r) => {
        r.attributes.forEach((a) => {
          if (a.name === targetAttrName) {
            countsMap.set(a.value, (countsMap.get(a.value) || 0) + 1);
          }
        });
      });

      // Map all values: available ones first (with highest count), then unavailable ones
      return allValues
        .map((val) => {
          const count = countsMap.get(val) || 0;
          return {
            value: val,
            count,
            isAvailable: count > 0,
          };
        })
        .sort((a, b) => {
          if (a.isAvailable && !b.isAvailable) return -1;
          if (!a.isAvailable && b.isAvailable) return 1;
          return b.count - a.count || a.value.localeCompare(b.value);
        });
    },
    [rows, activeAttrFilters, searchFilter]
  );

  // Auto-prune any selected values that no longer have any matching variants due to other filters
  useEffect(() => {
    setActiveAttrFilters((prev) => {
      let hasChanges = false;
      const next: Record<string, string[]> = {};

      for (const [attrName, selectedVals] of Object.entries(prev)) {
        if (!selectedVals || selectedVals.length === 0) continue;

        const candidateRows = rows.filter((r) => {
          for (const [otherName, otherVals] of Object.entries(prev)) {
            if (otherName !== attrName && otherVals && otherVals.length > 0) {
              const match = r.attributes.some((a) => a.name === otherName && otherVals.includes(a.value));
              if (!match) return false;
            }
          }
          return true;
        });

        const validValsSet = new Set<string>();
        candidateRows.forEach((r) => {
          r.attributes.forEach((a) => {
            if (a.name === attrName) validValsSet.add(a.value);
          });
        });

        const validSelected = selectedVals.filter((v) => validValsSet.has(v));
        if (validSelected.length !== selectedVals.length) {
          hasChanges = true;
        }
        if (validSelected.length > 0) {
          next[attrName] = validSelected;
        }
      }

      return hasChanges ? next : prev;
    });
  }, [rows, activeAttrFilters]);

  // Filtered rows matching multi-select attribute filters and text search
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      // Attribute filter checks
      for (const [attrName, selectedVals] of Object.entries(activeAttrFilters)) {
        if (selectedVals && selectedVals.length > 0) {
          const match = r.attributes.some((a) => a.name === attrName && selectedVals.includes(a.value));
          if (!match) return false;
        }
      }
      // Text search check
      if (searchFilter.trim()) {
        const q = searchFilter.toLowerCase().trim();
        const inName = r.name.toLowerCase().includes(q);
        const inSku = r.sku_code.toLowerCase().includes(q);
        const inAttr = r.attributes.some((a) => a.value.toLowerCase().includes(q));
        if (!inName && !inSku && !inAttr) return false;
      }
      return true;
    });
  }, [rows, activeAttrFilters, searchFilter]);

  // Excel Drag State
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [dragCurrentIndex, setDragCurrentIndex] = useState<number | null>(null);
  const [dragValue, setDragValue] = useState<number>(1);
  const isDragging = dragStartIndex !== null;

  // Window mouseup listener to commit Excel drag fill
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseUp = () => {
      if (dragStartIndex !== null && dragCurrentIndex !== null) {
        const minIdx = Math.min(dragStartIndex, dragCurrentIndex);
        const maxIdx = Math.max(dragStartIndex, dragCurrentIndex);

        // Targeted row IDs from filteredRows
        const targetIds = new Set<string>();
        for (let i = minIdx; i <= maxIdx; i++) {
          if (filteredRows[i]) {
            targetIds.add(filteredRows[i].id);
          }
        }

        setRows((prev) =>
          prev.map((r) => {
            if (targetIds.has(r.id)) {
              return {
                ...r,
                quantity: dragValue,
                selected: dragValue > 0,
              };
            }
            return r;
          })
        );
      }
      setDragStartIndex(null);
      setDragCurrentIndex(null);
    };

    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartIndex, dragCurrentIndex, dragValue, filteredRows]);

  // Handlers
  const handleToggleRow = (id: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextSelected = !r.selected;
          return {
            ...r,
            selected: nextSelected,
            quantity: nextSelected && r.quantity === 0 ? 1 : r.quantity,
          };
        }
        return r;
      })
    );
  };

  const handleSelectAllFiltered = (selected: boolean) => {
    const filteredIds = new Set(filteredRows.map((r) => r.id));
    setRows((prev) =>
      prev.map((r) => {
        if (filteredIds.has(r.id)) {
          return {
            ...r,
            selected,
            quantity: selected && r.quantity === 0 ? 1 : selected ? r.quantity : 0,
          };
        }
        return r;
      })
    );
  };

  const handleQuantityChange = (id: string, qty: number) => {
    const cleanQty = isNaN(qty) || qty < 0 ? 0 : qty;
    setRows((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            quantity: cleanQty,
            selected: cleanQty > 0,
          };
        }
        return r;
      })
    );
  };

  const handleRateChange = (id: string, rate: number) => {
    const cleanRate = isNaN(rate) || rate < 0 ? 0 : rate;
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, unit_price: cleanRate } : r))
    );
  };

  const handleApplyQuickFill = () => {
    if (quickFillQty <= 0) return;
    const targetIds = new Set(filteredRows.filter((r) => r.selected).map((r) => r.id));
    // If none explicitly selected, apply to all filtered
    const effectiveIds = targetIds.size > 0 ? targetIds : new Set(filteredRows.map((r) => r.id));

    setRows((prev) =>
      prev.map((r) => {
        if (effectiveIds.has(r.id)) {
          return {
            ...r,
            quantity: quickFillQty,
            selected: true,
          };
        }
        return r;
      })
    );
  };

  const handleDoubleFillDown = (startIndex: number, val: number) => {
    const fillVal = val > 0 ? val : 1;
    const targetIds = new Set(filteredRows.slice(startIndex).map((r) => r.id));
    setRows((prev) =>
      prev.map((r) => {
        if (targetIds.has(r.id)) {
          return {
            ...r,
            quantity: fillVal,
            selected: true,
          };
        }
        return r;
      })
    );
  };

  // Summary Metrics
  const selectedRows = useMemo(() => rows.filter((r) => r.selected && r.quantity > 0), [rows]);
  const totalSelectedUnits = useMemo(() => {
    return selectedRows.reduce((sum, r) => sum + Number(r.quantity || 0), 0);
  }, [selectedRows]);
  const totalEstimatedAmount = useMemo(() => {
    return selectedRows.reduce((sum, r) => sum + Number(r.quantity || 0) * Number(r.unit_price || 0), 0);
  }, [selectedRows]);

  const handleAddAndClose = () => {
    if (selectedRows.length === 0) return;

    const itemsToAdd: VoucherLineItem[] = selectedRows.map((r) => {
      const packagings = r.packagings || [
        { name: 'Unit', size: 1, is_default: true },
      ];
      const taxRate = Number(
        r.rawVariant?.tax_percent ?? r.rawVariant?.tax_rate ?? product.tax_percent ?? product.tax_rate ?? product.gst_rate ?? 0
      );
      const subtotal = r.quantity * r.unit_price;
      const taxAmt = (subtotal * taxRate) / 100;
      const lineTotal = subtotal + taxAmt;

      return {
        variant_id: r.id,
        product_id: String(product.id || ''),
        sku_code: r.sku_code,
        product_name: r.name,
        quantity: r.quantity,
        packaging_name: packagings[0]?.name || 'Unit',
        packaging_size: packagings[0]?.size || 1,
        packagings,
        unit_price: r.unit_price,
        tax_percent: taxRate,
        tax_amount: taxAmt,
        discount_percent: 0,
        discount_amount: 0,
        line_total: lineTotal,
        mrp: r.mrp,
      };
    });

    onAddVariants(itemsToAdd);
    onClose();
  };

  // Drag range check helper
  const isRowInDragRange = (idx: number) => {
    if (dragStartIndex === null || dragCurrentIndex === null) return false;
    const min = Math.min(dragStartIndex, dragCurrentIndex);
    const max = Math.max(dragStartIndex, dragCurrentIndex);
    return idx >= min && idx <= max;
  };

  const isAllFilteredSelected = filteredRows.length > 0 && filteredRows.every((r) => r.selected);

  if (!isOpen || !product) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.15s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1060px',
          height: '88vh',
          maxHeight: '840px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* ── 1. MODAL HEADER ── */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(to right, #f8fafc, #ffffff)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  fontSize: '0.9rem',
                }}
              >
                🏷️
              </span>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                {product.name}
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                {rows.length} Variants
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px', display: 'flex', gap: '12px' }}>
              {product.brand_name && <span>Brand: <strong style={{ color: '#334155' }}>{product.brand_name}</strong></span>}
              {product.category_name && <span>Category: <strong style={{ color: '#334155' }}>{product.category_name}</strong></span>}
              {product.sku_code && <span>Base SKU: <code style={{ color: '#2563eb' }}>{product.sku_code}</code></span>}
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              color: '#64748b',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Close dialog (Esc)"
          >
            ✕
          </button>
        </div>

        {/* ── 2. FILTER & QUICK-FILL ACTION BAR ── */}
        <div
          style={{
            padding: '0.75rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#fafbfc',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          {/* Top row: Fast Search + Quick Fill Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Filter Search Input */}
            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                placeholder="Filter variants by name, SKU, attribute..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  paddingLeft: '28px',
                  fontSize: '0.8rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  boxSizing: 'border-box',
                }}
              />
              <span style={{ position: 'absolute', left: '8px', top: '7px', fontSize: '0.75rem', color: '#94a3b8' }}>🔍</span>
            </div>

            {/* Quick Fill Box */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                ⚡ Fill Qty:
              </span>
              <input
                type="number"
                min="1"
                value={quickFillQty}
                onChange={(e) => setQuickFillQty(parseInt(e.target.value) || 0)}
                style={{
                  width: '64px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={handleApplyQuickFill}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(37,99,235,0.2)',
                }}
              >
                Apply to {selectedRows.length > 0 ? `Selected (${selectedRows.length})` : 'All'}
              </button>
              <div style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '6px', fontStyle: 'italic' }}>
                (or drag the blue corner handle ■ down like Excel)
              </div>
            </div>
          </div>

          {/* Bottom row: Attribute Filter Dropdowns with Dependent Multi-Select */}
          {attributeFilters.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap', paddingTop: '4px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                Filter Attributes:
              </span>
              {attributeFilters.map((af) => {
                const selectedVals = activeAttrFilters[af.name] || [];
                const options = getOptionsForAttribute(af.name, af.allValues);

                return (
                  <div key={af.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                      {af.name}:
                    </span>
                    <AttributeFilterMultiSelect
                      name={af.name}
                      options={options}
                      selectedValues={selectedVals}
                      onChange={(newSelected) => {
                        setActiveAttrFilters((prev) => {
                          const next = { ...prev };
                          if (newSelected.length === 0) {
                            delete next[af.name];
                          } else {
                            next[af.name] = newSelected;
                          }
                          return next;
                        });
                      }}
                    />
                  </div>
                );
              })}

              {Object.keys(activeAttrFilters).length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveAttrFilters({})}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #fecaca',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginLeft: 'auto',
                  }}
                  title="Clear all active attribute filters"
                >
                  <span>✕ Clear All Filters</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── 3. EXCEL-LIKE VARIANT MATRIX TABLE ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 1.5rem', backgroundColor: '#ffffff' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.8rem',
              userSelect: isDragging ? 'none' : 'auto',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569', textAlign: 'left', position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 10 }}>
                <th style={{ padding: '8px 6px', width: '36px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={(e) => handleSelectAllFiltered(e.target.checked)}
                    style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                  />
                </th>
                <th style={{ padding: '8px 6px', width: '32px', textAlign: 'center', color: '#94a3b8' }}>#</th>
                <th style={{ padding: '8px 10px' }}>Variant Name</th>
                <th style={{ padding: '8px 8px', width: '130px' }}>SKU Code</th>
                <th style={{ padding: '8px 8px', width: '220px' }}>Attributes</th>
                <th style={{ padding: '8px 8px', width: '100px', textAlign: 'right' }}>Unit Rate (₹)</th>
                <th style={{ padding: '8px 10px', width: '110px', textAlign: 'right' }}>Quantity</th>
                <th style={{ padding: '8px 10px', width: '110px', textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No variants match the current search or filters.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => {
                  const inDrag = isRowInDragRange(idx);
                  const lineTotal = Number(row.quantity || 0) * Number(row.unit_price || 0);

                  return (
                    <tr
                      key={row.id}
                      onMouseEnter={() => {
                        if (isDragging) {
                          setDragCurrentIndex(idx);
                        }
                      }}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: inDrag
                          ? '#eff6ff'
                          : row.selected
                          ? '#f0fdf4'
                          : idx % 2 === 0
                          ? '#ffffff'
                          : '#fafbfc',
                        outline: inDrag ? '1.5px dashed #2563eb' : 'none',
                        transition: 'background-color 0.1s ease',
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => handleToggleRow(row.id)}
                          style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                        />
                      </td>

                      {/* S.No */}
                      <td style={{ padding: '8px 6px', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600 }}>
                        {idx + 1}
                      </td>

                      {/* Variant Name */}
                      <td style={{ padding: '8px 10px' }}>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>
                          {row.name}
                        </div>
                      </td>

                      {/* SKU */}
                      <td style={{ padding: '8px 8px' }}>
                        <code style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', padding: '2px 5px', borderRadius: '4px', color: '#475569' }}>
                          {row.sku_code || '—'}
                        </code>
                      </td>

                      {/* Attributes Pills */}
                      <td style={{ padding: '8px 8px' }}>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {row.attributes.length > 0 ? (
                            row.attributes.map((a, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: '0.68rem',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: '#f3e8ff',
                                  color: '#7e22ce',
                                  border: '1px solid #e9d5ff',
                                  fontWeight: 600,
                                }}
                              >
                                {a.name}: {a.value}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#cbd5e1', fontSize: '0.7rem' }}>Default</span>
                          )}
                        </div>
                      </td>

                      {/* Rate Input */}
                      <td style={{ padding: '8px 8px', textAlign: 'right' }}>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.unit_price}
                          onChange={(e) => handleRateChange(row.id, parseFloat(e.target.value) || 0)}
                          style={{
                            width: '80px',
                            padding: '4px 6px',
                            textAlign: 'right',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            borderRadius: '5px',
                            border: '1px solid #cbd5e1',
                            outline: 'none',
                          }}
                        />
                      </td>

                      {/* Quantity Cell with Excel Drag Handle */}
                      <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                        <div
                          style={{
                            position: 'relative',
                            display: 'inline-block',
                            width: '85px',
                          }}
                        >
                          <input
                            type="number"
                            min="0"
                            value={inDrag ? dragValue : row.quantity || ''}
                            placeholder="0"
                            onChange={(e) => handleQuantityChange(row.id, parseInt(e.target.value) || 0)}
                            style={{
                              width: '100%',
                              padding: '5px 8px',
                              textAlign: 'right',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              color: row.quantity > 0 ? '#15803d' : '#64748b',
                              borderRadius: '6px',
                              border: inDrag
                                ? '2px solid #2563eb'
                                : row.selected
                                ? '1.5px solid #16a34a'
                                : '1px solid #cbd5e1',
                              backgroundColor: inDrag ? '#eff6ff' : '#ffffff',
                              outline: 'none',
                              boxSizing: 'border-box',
                            }}
                          />

                          {/* Excel Drag Handle: Small square at bottom-right corner */}
                          <div
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const currentVal = row.quantity > 0 ? row.quantity : 1;
                              setDragStartIndex(idx);
                              setDragCurrentIndex(idx);
                              setDragValue(currentVal);
                            }}
                            onDoubleClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDoubleFillDown(idx, row.quantity);
                            }}
                            title="Drag down to copy quantity across rows (Double-click to fill to end)"
                            style={{
                              position: 'absolute',
                              right: '-2px',
                              bottom: '-2px',
                              width: '8px',
                              height: '8px',
                              backgroundColor: '#2563eb',
                              border: '1px solid #ffffff',
                              cursor: 'crosshair',
                              borderRadius: '1px',
                              zIndex: 5,
                              boxShadow: '0 0 2px rgba(0,0,0,0.3)',
                            }}
                          />
                        </div>
                      </td>

                      {/* Line Total */}
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#1e293b' }}>
                        ₹{lineTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── 4. STICKY MODAL FOOTER ── */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 -4px 12px rgba(0,0,0,0.03)',
          }}
        >
          {/* Summary Metric Counters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Selected Variants</span>
              <strong style={{ fontSize: '1rem', color: '#0f172a' }}>
                {selectedRows.length} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>/ {rows.length}</span>
              </strong>
            </div>

            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.25rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Total Quantity</span>
              <strong style={{ fontSize: '1rem', color: '#15803d' }}>
                {totalSelectedUnits} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>units</span>
              </strong>
            </div>

            <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '1.25rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Estimated Value</span>
              <strong style={{ fontSize: '1.05rem', color: '#2563eb' }}>
                ₹{totalEstimatedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={selectedRows.length === 0}
              onClick={handleAddAndClose}
              style={{
                padding: '8px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: selectedRows.length > 0 ? '#2563eb' : '#94a3b8',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: selectedRows.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: selectedRows.length > 0 ? '0 2px 8px rgba(37,99,235,0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Add {selectedRows.length > 0 ? `${selectedRows.length} Variants` : 'Items'} to Order ↵
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
