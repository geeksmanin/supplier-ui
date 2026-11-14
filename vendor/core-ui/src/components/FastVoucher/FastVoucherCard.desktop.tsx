import React, { useMemo } from 'react';
import { 
  X, 
  Search, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  Edit2, 
  CheckCircle,
  Package
} from 'lucide-react';
import { FastVoucherCardProps } from './FastVoucherCard.types';
import { useFastVoucherOrchestrator } from './useFastVoucherOrchestrator';
import { FastVoucherCatalogSearchDropdown } from './FastVoucherCatalogSearchDropdown';
import { VoucherQuickRowStepper } from './VoucherQuickRowStepper';
import { computeVoucherSummary } from './voucherTaxEngine';
import { DraftBanner } from '../../hooks/useFormDraft';

export const FastVoucherCardDesktop: React.FC<FastVoucherCardProps> = (props) => {
  const {
    documentTitle,
    voucherNumber,
    voucherDate,
    onVoucherDateChange,
    status = 'DRAFT',
    companyGstin,
    companyStateCode,
    partyConfig,
    catalogConfig,
    batchMode = 'none',
    pricingConfig = { mode: 'auto_from_party', allowRateOverride: true },
    selectedParty,
    onPartySelect,
    renderPartySelect,
    items,
    onRemoveItem,
    onUpdateItem,
    summary: externalSummary,
    documentDiscountAmount = 0,
    documentDiscountPercent = 0,
    shippingCharges = 0,
    isRoundOffEnabled = true,
    onSave,
    onCancel,
    onClose,
    isSaving = false,
    saveButtonLabel,
    onOpenStockDrilldown,
    accentColor = '#0F766E',
    icon,
    maxWidth,
    fullWidth = false,
    fullHeight = false,
    className = '',
    style = {},
    modeOptions,
    activeMode,
    onModeChange,
  } = props;

  const {
    partyInputRef,
    searchInputRef,
    tableRef,
    isSearchFocused,
    setIsSearchFocused,
    activeStepperItem,
    setActiveStepperItem,
    isStepperOpen,
    setIsStepperOpen,
    editingRowIndex,
    setEditingRowIndex,
    focusedRowIndex,
    setFocusedRowIndex,
    draftHook,
    isPartyDropdownOpen,
    setIsPartyDropdownOpen,
    partySearchQuery,
    setPartySearchQuery,
    partyLoading,
    partyOptions,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearchOpen,
    setIsSearchOpen,
    selectedResultIndex,
    setSelectedResultIndex,
    liveStockMap,
    renderVariantMatrixModal,
    handleSelectProduct,
    handleCommitStepperItem,
    memoizedStepperBatches,
  } = useFastVoucherOrchestrator(props);

  // Compute live tax totals if external summary is not provided
  const computedSummary = useMemo(() => {
    if (externalSummary) return externalSummary;
    return computeVoucherSummary({
      items,
      party: selectedParty,
      companyGstin,
      companyStateCode,
      documentDiscountAmount,
      documentDiscountPercent,
      shippingCharges,
      isRoundOffEnabled,
      taxInclusive: pricingConfig.taxInclusive,
    });
  }, [
    externalSummary,
    items,
    selectedParty,
    companyGstin,
    companyStateCode,
    documentDiscountAmount,
    documentDiscountPercent,
    shippingCharges,
    isRoundOffEnabled,
    pricingConfig.taxInclusive,
  ]);

  const totalQty = useMemo(() => {
    return items.reduce((acc, it) => acc + Number(it.quantity || 0), 0);
  }, [items]);

  const handleDismiss = onClose || onCancel;

  const resolvedMaxWidth = fullWidth
    ? '100%'
    : (maxWidth !== undefined
      ? (typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth)
      : '100%');

  return (
    <div
      className={`fast-voucher-card-desktop ${className}`}
      role="region"
      aria-label={documentTitle}
      style={{
        width: '100%',
        maxWidth: resolvedMaxWidth,
        height: fullHeight ? '100%' : undefined,
        flex: fullHeight ? 1 : undefined,
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        border: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        overflow: 'visible',
        margin: fullWidth ? 0 : '8px 0',
        fontFamily: 'Inter, system-ui, sans-serif',
        animation: 'transactionBubbleEntrance 0.25s cubic-bezier(0.25, 0.1, 0.25, 1) both',
        ...style,
      }}
    >
      {/* IndexedDB Draft Banner */}
      {draftHook.hasDraft && (
        <DraftBanner
          draftTime={draftHook.draftTime}
          onRestore={draftHook.handleRestoreDraft}
          onDiscard={draftHook.handleDismissDraft}
        />
      )}

      {/* Card Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 18px',
          borderBottom: '1px solid #F1F5F9',
          backgroundColor: '#FAFCFD',
          borderTopLeftRadius: 14,
          borderTopRightRadius: 14,
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
          {handleDismiss && (
            <button
              type="button"
              onClick={handleDismiss}
              title="Return to feed"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
          )}

          {icon && (
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: `${accentColor}15`,
                color: accentColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{documentTitle}</span>
              {voucherNumber && (
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: '#475569',
                    backgroundColor: '#F1F5F9',
                    padding: '1px 6px',
                    borderRadius: 4,
                    border: '1px solid #E2E8F0',
                  }}
                >
                  {voucherNumber}
                </span>
              )}
              {status && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: status === 'CONFIRMED' ? '#059669' : '#D97706',
                    backgroundColor: status === 'CONFIRMED' ? '#ECFDF5' : '#FFFBEB',
                    padding: '1px 6px',
                    borderRadius: 4,
                  }}
                >
                  {status}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Optional Mode Switcher Pills */}
        {modeOptions && modeOptions.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F1F5F9',
              borderRadius: 8,
              padding: 2,
              gap: 2,
            }}
          >
            {modeOptions.map((opt) => {
              const isActive = activeMode === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onModeChange?.(opt.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 5,
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: 'none',
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    color: isActive ? accentColor : '#64748B',
                    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {handleDismiss && (
          <button
            type="button"
            onClick={handleDismiss}
            title="Cancel & Close"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 4,
              borderRadius: 6,
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Card Body */}
      <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Party Selector & Header Metadata */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {/* Party Input */}
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
              {partyConfig.label} *
            </label>
            {renderPartySelect ? (
              renderPartySelect({ selectedParty, onPartySelect })
            ) : (
              <div style={{ position: 'relative' }}>
                <input
                  ref={partyInputRef}
                  type="text"
                  placeholder={partyConfig.placeholder || `Search ${partyConfig.label}...`}
                  value={selectedParty ? selectedParty.label : partySearchQuery}
                  onChange={(e) => {
                    if (selectedParty && onPartySelect) {
                      onPartySelect(null as any);
                    }
                    setPartySearchQuery(e.target.value);
                    setIsPartyDropdownOpen(true);
                  }}
                  onFocus={() => setIsPartyDropdownOpen(true)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '7px 10px',
                    borderRadius: 8,
                    border: '1px solid #CBD5E1',
                    fontSize: 13,
                    fontWeight: selectedParty ? 700 : 500,
                    color: selectedParty ? '#0F172A' : '#1E293B',
                    backgroundColor: selectedParty ? '#F8FAFC' : '#FFFFFF',
                    outline: 'none',
                  }}
                />
                {selectedParty && onPartySelect && (
                  <button
                    type="button"
                    onClick={() => {
                      onPartySelect(null as any);
                      setPartySearchQuery('');
                      partyInputRef.current?.focus();
                    }}
                    style={{
                      position: 'absolute',
                      right: 8,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94A3B8',
                      padding: 2,
                    }}
                  >
                    <X size={14} />
                  </button>
                )}

                {/* Party Autocomplete Dropdown */}
                {isPartyDropdownOpen && !selectedParty && partyOptions.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: 4,
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                      zIndex: 50,
                      maxHeight: 200,
                      overflowY: 'auto',
                    }}
                  >
                    {partyOptions.map((opt) => (
                      <div
                        key={opt.value}
                        onClick={() => {
                          onPartySelect?.(opt);
                          setIsPartyDropdownOpen(false);
                          searchInputRef.current?.focus();
                        }}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          fontSize: 12.5,
                          borderBottom: '1px solid #F1F5F9',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{opt.label}</div>
                        {(opt.gstin || opt.state) && (
                          <div style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                            {opt.gstin && `GSTIN: ${opt.gstin}`} {opt.state && `• ${opt.state}`}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Voucher Date */}
          <div style={{ width: 140 }}>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
              Voucher Date
            </label>
            <input
              type="date"
              value={voucherDate}
              onChange={(e) => onVoucherDateChange?.(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '7px 8px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                fontSize: 12.5,
                fontWeight: 600,
                color: '#1E293B',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Central Product Search Bar */}
        <div style={{ position: 'relative' }}>
          <div
            className="fast-voucher-search-box bounding-box"
            data-bounding-box="true"
            style={{
              display: 'flex',
              alignItems: 'center',
              border: (isSearchFocused || isSearchOpen) ? `2px solid ${accentColor}` : '1.5px solid #CBD5E1',
              borderRadius: 8,
              padding: '6px 10px',
              backgroundColor: '#FFFFFF',
              boxShadow: (isSearchFocused || isSearchOpen) ? `0 0 0 3px ${accentColor}18` : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Search
              size={15}
              style={{
                color: (isSearchFocused || isSearchOpen) ? accentColor : '#94A3B8',
                marginRight: 6,
                flexShrink: 0,
              }}
            />
            <input
              ref={searchInputRef}
              type="text"
              className="fast-voucher-search-input bare-input"
              data-bare-input="true"
              placeholder={catalogConfig?.placeholder || '⚡ Type Product Name, SKU, Barcode (Press F4)...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setIsSearchFocused(true);
                if (searchResults.length > 0) setIsSearchOpen(true);
              }}
              onBlur={() => setIsSearchFocused(false)}
              onKeyDown={(e) => {
                if (!isSearchOpen || searchResults.length === 0) return;
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSelectedResultIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : 0));
                } else if (e.key === 'Enter') {
                  e.preventDefault();
                  if (searchResults[selectedResultIndex]) {
                    handleSelectProduct(searchResults[selectedResultIndex]);
                  }
                } else if (e.key === 'Escape') {
                  setIsSearchOpen(false);
                }
              }}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                backgroundColor: 'transparent',
                fontSize: 13,
                fontWeight: 600,
                color: '#1E293B',
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                padding: '1.5px 5px',
                borderRadius: 4,
                backgroundColor: '#F1F5F9',
                color: '#64748B',
                border: '1px solid #E2E8F0',
                whiteSpace: 'nowrap',
              }}
            >
              F4
            </span>
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchResults.length > 0 && (
            <FastVoucherCatalogSearchDropdown
              searchResults={searchResults}
              selectedResultIndex={selectedResultIndex}
              setSelectedResultIndex={setSelectedResultIndex}
              handleSelectProduct={handleSelectProduct}
              catalogConfig={catalogConfig}
              liveStockMap={liveStockMap}
            />
          )}

          {/* Stepper Popover */}
          <div style={{ position: 'relative' }}>
            <VoucherQuickRowStepper
              isOpen={isStepperOpen}
              item={activeStepperItem}
              batchMode={batchMode}
              allowRateOverride={pricingConfig.allowRateOverride}
              onOpenStockDrilldown={(it) => onOpenStockDrilldown?.(it as any)}
              stockBatches={memoizedStepperBatches}
              onCommit={handleCommitStepperItem}
              onCancel={() => {
                setIsStepperOpen(false);
                setActiveStepperItem(null);
                setEditingRowIndex(null);
                searchInputRef.current?.focus();
              }}
              isEditMode={editingRowIndex !== null}
            />
          </div>
        </div>

        {/* Line Items Table */}
        <div
          ref={tableRef}
          style={{
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            overflow: 'hidden',
            backgroundColor: '#FFFFFF',
            minHeight: 110,
            maxHeight: fullHeight ? 'none' : 420,
            flex: fullHeight ? 1 : undefined,
            overflowY: 'auto',
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '28px 16px',
                color: '#94A3B8',
              }}
            >
              <ShoppingBag size={32} style={{ opacity: 0.35, marginBottom: 6 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#64748B' }}>
                No items added yet
              </div>
              <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>
                Search or scan barcode above to add items to this voucher
              </div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #CBD5E1', color: '#475569' }}>
                  <th style={{ padding: '6px 8px', width: 28, textAlign: 'center' }}>#</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left' }}>Item Description</th>
                  <th style={{ padding: '6px 8px', width: 75, textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '6px 8px', width: 85, textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ padding: '6px 8px', width: 60, textAlign: 'right' }}>Tax %</th>
                  <th style={{ padding: '6px 10px', width: 95, textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ padding: '6px 8px', width: 55, textAlign: 'center' }}>Act</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr
                    key={it.id || `${it.variant_id}-${idx}`}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFCFD',
                    }}
                  >
                    <td style={{ padding: '6px 8px', textAlign: 'center', color: '#94A3B8', fontWeight: 600 }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '6px 10px' }}>
                      <div style={{ fontWeight: 700, color: '#0F172A', lineHeight: 1.25 }}>
                        {it.product_name}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748B', display: 'flex', gap: 6, marginTop: 1 }}>
                        {it.sku_code && <span>SKU: {it.sku_code}</span>}
                        {it.batch_code && it.batch_code !== 'DEFAULT' && (
                          <span>• Batch: {it.batch_code}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 700, color: '#0F172A' }}>
                      {it.quantity} <span style={{ fontSize: 10, color: '#64748B', fontWeight: 500 }}>{it.packaging_name || 'Units'}</span>
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: '#334155' }}>
                      {Number(it.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', color: '#64748B' }}>
                      {it.tax_percent || 0}%
                    </td>
                    <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 700, color: '#0F172A' }}>
                      ₹{Number(it.line_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRowIndex(idx);
                            setActiveStepperItem(it);
                            setIsStepperOpen(true);
                          }}
                          title="Edit Row"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#64748B',
                            padding: 3,
                          }}
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          title="Remove Item"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#EF4444',
                            padding: 3,
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Totals Summary Ribbon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: '#F8FAFC',
            borderRadius: 8,
            border: '1px solid #E2E8F0',
            fontSize: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748B', fontWeight: 600 }}>
            <span>{items.length} {items.length === 1 ? 'Item' : 'Items'}</span>
            <span>•</span>
            <span>{totalQty} Total Qty</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ color: '#64748B' }}>
              Subtotal: <strong style={{ color: '#334155' }}>₹{Number(computedSummary.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
            {computedSummary.tax_total > 0 && (
              <div style={{ color: '#64748B' }}>
                Tax: <strong style={{ color: '#334155' }}>₹{Number(computedSummary.tax_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </div>
            )}
            <div style={{ fontSize: 13, color: '#0F172A' }}>
              Grand Total: <strong style={{ color: accentColor, fontSize: 14 }}>₹{Number(computedSummary.grand_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
          {handleDismiss && (
            <button
              type="button"
              onClick={handleDismiss}
              disabled={isSaving}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #CBD5E1',
                backgroundColor: '#FFFFFF',
                color: '#64748B',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={onSave}
            disabled={isSaving || items.length === 0 || !selectedParty}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: (items.length === 0 || !selectedParty) ? '#94A3B8' : accentColor,
              color: '#FFFFFF',
              fontSize: 13,
              fontWeight: 700,
              cursor: (items.length === 0 || !selectedParty || isSaving) ? 'not-allowed' : 'pointer',
              boxShadow: (items.length === 0 || !selectedParty) ? 'none' : `0 2px 6px ${accentColor}40`,
            }}
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle size={14} />
                <span>{saveButtonLabel || 'Save Document (F10)'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Product Variant Matrix Modal */}
      {renderVariantMatrixModal()}
    </div>
  );
};

