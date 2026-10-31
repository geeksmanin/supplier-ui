import React, { useState, useCallback, useMemo } from 'react';
import { ScanBarcode, Package, Check, X, ArrowRightLeft } from 'lucide-react';
import { SearchableEntitySelect, normalizeSearchToken } from '../SearchableEntitySelect';
import { BarcodeQRScannerModal } from '../BarcodeQRScannerModal';
import { useProductSearch, ProductVariantItem } from '../../hooks/useProductSearch';
import { resolveMediaUrl } from '../../utils/media';
import { ProductSelectProps } from './ProductSelect.types';

export const ProductSelect: React.FC<ProductSelectProps> = ({
  value,
  selectedEntity,
  onChange,
  fetchEntities,
  placeholder = 'Search SKU, name, or scan barcode...',
  showScanner = true,
  showPreviewCard = false,
  compact = false,
  disabled = false,
  autoFocus = false,
  style,
  maxListHeight = '240px',
  initialItems,
}) => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [internalEntity, setInternalEntity] = useState<ProductVariantItem | null>(selectedEntity || null);
  const { searchProducts, lookupBarcode } = useProductSearch();

  const activeEntity = selectedEntity !== undefined ? selectedEntity : internalEntity;
  const currentValStr = value !== undefined && value !== null ? String(value) : '';

  const handleFetch = useCallback(
    async (searchTerm: string): Promise<ProductVariantItem[]> => {
      if (fetchEntities) {
        return fetchEntities(searchTerm);
      }
      if (initialItems && initialItems.length > 0 && !searchTerm.trim()) {
        return initialItems;
      }
      return searchProducts(searchTerm);
    },
    [fetchEntities, initialItems, searchProducts]
  );

  const handleSelect = (val: any, entity: any) => {
    const stringId = val ? String(val) : '';
    setInternalEntity(entity || null);
    if (onChange) {
      onChange(stringId, entity || null);
    }
  };

  const handleScanSuccess = async (decodedCode: string) => {
    setScannerOpen(false);
    if (!decodedCode) return;
    const match = await lookupBarcode(decodedCode);
    if (match) {
      handleSelect(match.variant_id, match);
    }
  };

  const rightScannerTrigger = useMemo(() => {
    if (!showScanner || disabled) return null;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setScannerOpen(true);
        }}
        title="Scan Product Barcode / QR Code"
        style={{
          minWidth: compact ? 36 : 42,
          minHeight: compact ? 36 : 40,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-primary, #008069)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 8,
          padding: 0,
        }}
      >
        <ScanBarcode size={compact ? 18 : 20} />
      </button>
    );
  }, [showScanner, disabled, compact]);

  // Rule 13 "Small Box" Preview Card
  if (showPreviewCard && activeEntity && currentValStr) {
    const avail = activeEntity.available_quantity ?? 0;
    const isAvail = avail > 0;
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 10,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          ...style,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          {activeEntity.image_path ? (
            <img
              src={resolveMediaUrl(activeEntity.image_path)}
              alt={activeEntity.variant_name}
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                objectFit: 'cover',
                border: '1px solid #E2E8F0',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                backgroundColor: '#EFF6FF',
                color: '#1D4ED8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {activeEntity.variant_name ? activeEntity.variant_name.substring(0, 2).toUpperCase() : 'SK'}
            </div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#0F172A',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {activeEntity.variant_name || activeEntity.name || activeEntity.title}
            </div>
            <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span>SKU: {activeEntity.sku_code || 'N/A'}</span>
              <span>•</span>
              <span style={{ fontWeight: 600, color: isAvail ? '#15803D' : '#B91C1C' }}>
                {avail} {activeEntity.unit_name || 'units'}
              </span>
            </div>
          </div>
        </div>

        {!disabled && (
          <button
            type="button"
            onClick={() => handleSelect('', null)}
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: '#008069',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 6,
            }}
          >
            Change
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ width: '100%', position: 'relative', ...style }}>
      <SearchableEntitySelect<ProductVariantItem>
        value={currentValStr}
        selectedEntity={activeEntity}
        onChange={handleSelect}
        fetchEntities={handleFetch}
        placeholder={placeholder}
        disabled={disabled}
        getEntityId={(e) => String(e.variant_id || e.id || '')}
        getEntityLabel={(e) => e.variant_name || e.name || e.title || ''}
        getEntitySubtext={(e) => {
          const avail = e.available_quantity ?? 0;
          const isAvail = avail > 0;
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#64748B' }}>
              <span>SKU: {e.sku_code || 'N/A'}</span>
              {e.barcode && <span>• Barcode: {e.barcode}</span>}
              <span>•</span>
              <span style={{ fontWeight: 600, color: isAvail ? '#15803D' : '#B91C1C' }}>
                {avail} {e.unit_name || 'units'}
              </span>
            </div>
          );
        }}
        maxListHeight={maxListHeight}
        rightElement={rightScannerTrigger}
      />

      {scannerOpen && (
        <BarcodeQRScannerModal
          isOpen={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onScanSuccess={handleScanSuccess}
        />
      )}
    </div>
  );
};
