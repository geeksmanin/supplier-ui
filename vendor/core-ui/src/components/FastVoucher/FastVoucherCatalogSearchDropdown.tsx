import React from 'react';
import { VoucherCatalogConfig } from './FastVoucherEntryLayout.types';

interface FastVoucherCatalogSearchDropdownProps {
  searchResults: any[];
  selectedResultIndex: number;
  setSelectedResultIndex: (idx: number) => void;
  handleSelectProduct: (product: any) => void;
  catalogConfig?: VoucherCatalogConfig;
  liveStockMap: Record<string, number>;
}

export const FastVoucherCatalogSearchDropdown: React.FC<FastVoucherCatalogSearchDropdownProps> = ({
  searchResults,
  selectedResultIndex,
  setSelectedResultIndex,
  handleSelectProduct,
  catalogConfig,
  liveStockMap,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: '100%',
        left: '1.25rem',
        right: '1.25rem',
        marginTop: '4px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.14)',
        zIndex: 45,
        maxHeight: '320px',
        overflowY: 'auto',
        padding: '6px',
      }}
    >
      {searchResults.map((res, idx) => {
        const isProduct = res._itemType === 'product';
        const pName = isProduct ? res.name : (res.product?.name || res.product_name || res.name || 'Product');
        const sku = res.sku_code || res.sku || '';
        const price =
          res.sale_price ?? res.salePrice ?? res.price ?? res.selling_price ?? res.unit_cost ?? res.mrp ?? 0;
        const isSelected = idx === selectedResultIndex;
        const variantCount = Array.isArray(res.variants) ? res.variants.length : 0;

        return (
          <div
            key={`${res._itemType || 'item'}-${res.id || idx}`}
            data-testid={`search-result-${idx}`}
            className="fast-voucher-search-result-row"
            onClick={() => handleSelectProduct(res)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 14px',
              margin: '4px 2px',
              borderRadius: '8px',
              cursor: 'pointer',
              backgroundColor: isSelected ? (isProduct ? '#eef2ff' : '#eff6ff') : '#ffffff',
              border: isSelected ? (isProduct ? '2px solid #4f46e5' : '2px solid #2563eb') : '1px solid #e2e8f0',
              boxShadow: isSelected
                ? '0 0 0 2px rgba(37, 99, 235, 0.25), 0 4px 14px rgba(37, 99, 235, 0.18)'
                : '0 1px 2px rgba(0, 0, 0, 0.02)',
              transform: isSelected ? 'scale(1.002)' : 'none',
              transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
            onMouseEnter={() => setSelectedResultIndex(idx)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  backgroundColor: isSelected ? (isProduct ? '#4f46e5' : '#2563eb') : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isSelected ? '#ffffff' : '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
              >
                {idx + 1}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.875rem',
                      color: isSelected ? (isProduct ? '#3730a3' : '#1e40af') : '#1e293b',
                    }}
                  >
                    {pName}
                  </span>
                  {isProduct ? (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: '9999px',
                        backgroundColor: '#e0e7ff',
                        color: '#4338ca',
                        border: '1px solid #c7d2fe',
                      }}
                    >
                      🏷️ Main Product {variantCount > 0 ? `(${variantCount} variants)` : ''}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        padding: '2px 5px',
                        borderRadius: '9999px',
                        backgroundColor: '#f1f5f9',
                        color: '#64748b',
                      }}
                    >
                      📦 Variant
                    </span>
                  )}
                  {catalogConfig?.showStock && !isProduct && (() => {
                    const vId = String(res.id || res.variant_id || '');
                    const hasStock = liveStockMap[vId] !== undefined;
                    const stockQty = hasStock ? liveStockMap[vId] : Number(res.available_quantity ?? res.stock ?? 0);
                    return (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '9999px',
                          backgroundColor: stockQty > 0 ? '#dcfce7' : (hasStock ? '#fee2e2' : '#f1f5f9'),
                          color: stockQty > 0 ? '#166534' : (hasStock ? '#991b1b' : '#64748b'),
                          border: stockQty > 0 ? '1px solid #bbf7d0' : (hasStock ? '1px solid #fecaca' : '1px solid #e2e8f0'),
                          transition: 'all 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                        }}
                      >
                        {hasStock ? (stockQty > 0 ? `🟢 Stock: ${stockQty}` : `🔴 Out of Stock`) : `⏳ Stock: ...`}
                      </span>
                    );
                  })()}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                  {isProduct ? (
                    <span>
                      {res.brand_name ? `${res.brand_name} • ` : ''}
                      {res.category_name ? `${res.category_name} • ` : ''}
                      Select variants matrix (Brand, Model, Qty) ↳
                    </span>
                  ) : (
                    <span>
                      SKU: {sku || '-'} {res.tax_percent ? `• Tax: ${res.tax_percent}%` : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              {isProduct ? (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '5px 9px',
                    borderRadius: '6px',
                    boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)',
                  }}
                >
                  <span>Matrix Multi-Select ↳</span>
                </div>
              ) : (
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#2563eb' }}>
                  ₹{Number(price).toFixed(2)}
                </div>
              )}
              {isSelected && (
                <div
                  style={{
                    fontSize: '0.68rem',
                    color: isProduct ? '#4338ca' : '#1d4ed8',
                    fontWeight: 700,
                    marginTop: '2px',
                  }}
                >
                  Press Enter ↵
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

