import React, { useMemo } from 'react';
import { 
  X, 
  Search, 
  Trash2, 
  ShoppingBag, 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Minus, 
  CheckCircle,
  Edit2
} from 'lucide-react';
import { FastVoucherCardProps } from './FastVoucherCard.types';
import { useFastVoucherOrchestrator } from './useFastVoucherOrchestrator';
import { FastVoucherCatalogSearchDropdown } from './FastVoucherCatalogSearchDropdown';
import { VoucherQuickRowStepper } from './VoucherQuickRowStepper';
import { computeVoucherSummary } from './voucherTaxEngine';
import { DraftBanner } from '../../hooks/useFormDraft';

export const FastVoucherCardMobile: React.FC<FastVoucherCardProps> = (props) => {
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
    draftHook,
    isPartyDropdownOpen,
    setIsPartyDropdownOpen,
    partySearchQuery,
    setPartySearchQuery,
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

  const handleDismiss = onClose || onCancel;

  return (
    <div
      className={`fast-voucher-card-mobile ${className}`}
      role="region"
      aria-label={documentTitle}
      style={{
        width: '100%',
        boxSizing: 'border-box',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        margin: '6px 0',
        fontFamily: 'Inter, system-ui, sans-serif',
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

      {/* Mobile Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid #F1F5F9',
          backgroundColor: '#FAFCFD',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          {handleDismiss && (
            <button
              type="button"
              onClick={handleDismiss}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#64748B',
                padding: 4,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <ArrowLeft size={16} />
            </button>
          )}

          {icon && (
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                backgroundColor: `${accentColor}18`,
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
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {documentTitle}
            </div>
          </div>
        </div>

        {handleDismiss && (
          <button
            type="button"
            onClick={handleDismiss}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#94A3B8',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Optional Mode Switcher for Mobile */}
      {modeOptions && modeOptions.length > 0 && (
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
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
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '9px 12px',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${accentColor}` : '2px solid transparent',
                  backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                  color: isActive ? accentColor : '#64748B',
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                }}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Body Inputs */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Party Input */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 3 }}>
            {partyConfig.label} *
          </label>
          {renderPartySelect ? (
            renderPartySelect({ selectedParty, onPartySelect })
          ) : (
            <div style={{ position: 'relative' }}>
              <input
                ref={partyInputRef}
                type="text"
                placeholder={partyConfig.placeholder || `Select ${partyConfig.label}...`}
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
                  padding: '8px 10px',
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
                  }}
                >
                  <X size={14} />
                </button>
              )}

              {/* Party dropdown */}
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
                    boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
                    zIndex: 50,
                    maxHeight: 180,
                    overflowY: 'auto',
                  }}
                >
                  {partyOptions.map((opt) => (
                    <div
                      key={opt.value}
                      onClick={() => {
                        onPartySelect?.(opt);
                        setIsPartyDropdownOpen(false);
                      }}
                      style={{
                        padding: '9px 12px',
                        cursor: 'pointer',
                        fontSize: 13,
                        borderBottom: '1px solid #F1F5F9',
                      }}
                    >
                      <div style={{ fontWeight: 700, color: '#0F172A' }}>{opt.label}</div>
                      {opt.gstin && <div style={{ fontSize: 11, color: '#64748B' }}>GSTIN: {opt.gstin}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Date Row */}
        <div>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 3 }}>
            Voucher Date
          </label>
          <input
            type="date"
            value={voucherDate}
            onChange={(e) => onVoucherDateChange?.(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '7px 10px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              fontSize: 13,
              fontWeight: 600,
              color: '#1E293B',
              outline: 'none',
            }}
          />
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: (isSearchFocused || isSearchOpen) ? `2px solid ${accentColor}` : '1.5px solid #CBD5E1',
              borderRadius: 8,
              padding: '6px 10px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Search size={14} style={{ color: '#94A3B8', marginRight: 6 }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={catalogConfig?.placeholder || 'Add item by name, SKU...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                setIsSearchFocused(true);
                if (searchResults.length > 0) setIsSearchOpen(true);
              }}
              onBlur={() => setIsSearchFocused(false)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: 13,
                fontWeight: 600,
                color: '#1E293B',
              }}
            />
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
              }}
              isEditMode={editingRowIndex !== null}
            />
          </div>
        </div>

        {/* Line Items List */}
        <div ref={tableRef} style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 260, overflowY: 'auto' }}>
          {items.length === 0 ? (
            <div
              style={{
                padding: '24px 12px',
                textAlign: 'center',
                color: '#94A3B8',
                backgroundColor: '#F8FAFC',
                borderRadius: 8,
                border: '1px dashed #CBD5E1',
              }}
            >
              <ShoppingBag size={24} style={{ margin: '0 auto 6px', opacity: 0.4 }} />
              <div style={{ fontSize: 12.5, fontWeight: 700, color: '#64748B' }}>No items added</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Search catalogue above to add</div>
            </div>
          ) : (
            items.map((it, idx) => (
              <div
                key={it.id || `${it.variant_id}-${idx}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 8,
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  gap: 8,
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {it.product_name}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748B', display: 'flex', gap: 6, marginTop: 1 }}>
                    <span>₹{Number(it.unit_price || 0).toLocaleString()}</span>
                    <span>• Tax: {it.tax_percent || 0}%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Stepper buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 6, border: '1px solid #CBD5E1' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const newQty = Math.max(1, Number(it.quantity || 1) - 1);
                        const rate = Number(it.unit_price || 0);
                        const taxRate = Number(it.tax_percent || 0);
                        const baseAmt = newQty * rate;
                        const taxAmt = (baseAmt * taxRate) / 100;
                        onUpdateItem(idx, {
                          ...it,
                          quantity: newQty,
                          tax_amount: taxAmt,
                          line_total: baseAmt + taxAmt,
                        });
                      }}
                      style={{ padding: '3px 6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                    >
                      <Minus size={11} />
                    </button>
                    <span style={{ fontSize: 12, fontWeight: 700, minWidth: 20, textAlign: 'center', color: '#0F172A' }}>
                      {it.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newQty = Number(it.quantity || 1) + 1;
                        const rate = Number(it.unit_price || 0);
                        const taxRate = Number(it.tax_percent || 0);
                        const baseAmt = newQty * rate;
                        const taxAmt = (baseAmt * taxRate) / 100;
                        onUpdateItem(idx, {
                          ...it,
                          quantity: newQty,
                          tax_amount: taxAmt,
                          line_total: baseAmt + taxAmt,
                        });
                      }}
                      style={{ padding: '3px 6px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                    >
                      <Plus size={11} />
                    </button>
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', minWidth: 50, textAlign: 'right' }}>
                    ₹{Number(it.line_total || 0).toLocaleString()}
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveItem(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', padding: 2 }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile Summary */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            backgroundColor: '#F1F5F9',
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          <span style={{ color: '#64748B', fontWeight: 600 }}>{items.length} Items</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
            Total: <strong style={{ color: accentColor }}>₹{Number(computedSummary.grand_total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || items.length === 0 || !selectedParty}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 14px',
            borderRadius: 8,
            border: 'none',
            backgroundColor: (items.length === 0 || !selectedParty) ? '#94A3B8' : accentColor,
            color: '#FFFFFF',
            fontSize: 13.5,
            fontWeight: 700,
            cursor: (items.length === 0 || !selectedParty || isSaving) ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckCircle size={15} />
              <span>{saveButtonLabel || 'Save Document'}</span>
            </>
          )}
        </button>
      </div>

      {/* Product Variant Matrix Modal */}
      {renderVariantMatrixModal()}
    </div>
  );
};

