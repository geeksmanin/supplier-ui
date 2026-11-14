import React from 'react';
import { FastVoucherEntryLayoutProps } from './FastVoucherEntryLayout.types';
import { VoucherQuickRowStepper } from './VoucherQuickRowStepper';
import { VoucherLiveInvoicePreview } from './VoucherLiveInvoicePreview';
import { VoucherParkedBillsModal } from './VoucherParkedBillsModal';
import { DraftBanner } from '../../hooks/useFormDraft';
import { Search, X } from 'lucide-react';
import { useFastVoucherOrchestrator } from './useFastVoucherOrchestrator';
import { FastVoucherHeaderRibbon } from './FastVoucherHeaderRibbon';
import { FastVoucherCatalogSearchDropdown } from './FastVoucherCatalogSearchDropdown';
import { FastVoucherTableSection } from './FastVoucherTableSection';
import { FastVoucherCard } from './FastVoucherCard';

export const FastVoucherEntryLayout: React.FC<FastVoucherEntryLayoutProps> = (props) => {
  if (props.layoutMode === 'card') {
    return <FastVoucherCard {...props} />;
  }

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
    summary,
    onSummaryChange,
    documentDiscountAmount = 0,
    documentDiscountPercent = 0,
    onDocumentDiscountChange,
    shippingCharges = 0,
    onShippingChargesChange,
    isRoundOffEnabled = true,
    onRoundOffToggle,
    onSave,
    onCancel,
    isSaving = false,
    saveButtonLabel = 'Save Document (F10)',
    headerExtraActions,
    onOpenStockDrilldown,
    enableBillParking = true,
    moreDetailsBadgeCount = 0,
    renderMoreDetailsDrawer,
    renderRightPane,
  } = props;

  const {
    partyInputRef,
    searchInputRef,
    discountInputRef,
    freightInputRef,
    tableRef,
    isSearchFocused,
    setIsSearchFocused,
    activeStepperItem,
    setActiveStepperItem,
    isStepperOpen,
    setIsStepperOpen,
    editingRowIndex,
    setEditingRowIndex,
    isDrawerOpen,
    setIsDrawerOpen,
    focusedRowIndex,
    setFocusedRowIndex,
    parking,
    isParkedModalOpen,
    setIsParkedModalOpen,
    activeParkedCount,
    draftHook,
    handleParkBill,
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
        position: 'relative',
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

      {/* Top Sticky Header Ribbon */}
      <FastVoucherHeaderRibbon
        documentTitle={documentTitle}
        status={status}
        voucherNumber={voucherNumber}
        onCancel={onCancel}
        partyConfig={partyConfig}
        selectedParty={selectedParty}
        onPartySelect={onPartySelect}
        renderPartySelect={renderPartySelect}
        partyOptions={partyOptions}
        isPartyDropdownOpen={isPartyDropdownOpen}
        setIsPartyDropdownOpen={setIsPartyDropdownOpen}
        partySearchQuery={partySearchQuery}
        setPartySearchQuery={setPartySearchQuery}
        partyLoading={partyLoading}
        partyInputRef={partyInputRef}
        searchInputRef={searchInputRef}
        voucherDate={voucherDate}
        onVoucherDateChange={onVoucherDateChange}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        moreDetailsBadgeCount={moreDetailsBadgeCount}
        enableBillParking={enableBillParking}
        handleParkBill={handleParkBill}
        setIsParkedModalOpen={setIsParkedModalOpen}
        activeParkedCount={activeParkedCount}
        headerExtraActions={headerExtraActions}
      />

      {/* Main Body: Split View */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Column: Product Search & Items Table */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRight: '1px solid #e2e8f0',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Central Product Search Bar */}
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #e2e8f0', position: 'relative' }}>
            <div
              className="bounding-box fast-voucher-search-box"
              data-bounding-box="true"
              style={{
                display: 'flex',
                alignItems: 'center',
                border: (isSearchFocused || isSearchOpen) ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                boxShadow: (isSearchFocused || isSearchOpen)
                  ? '0 0 0 3px rgba(37, 99, 235, 0.15), 0 2px 8px rgba(37, 99, 235, 0.1)'
                  : 'none',
                transition: 'border-color 0.2s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            >
              <Search
                size={18}
                style={{
                  color: (isSearchFocused || isSearchOpen) ? '#2563eb' : '#94a3b8',
                  marginRight: '8px',
                  flexShrink: 0,
                }}
              />
              <input
                ref={searchInputRef}
                type="text"
                className="fast-voucher-search-input bare-input"
                data-bare-input="true"
                placeholder={
                  catalogConfig?.placeholder ||
                  '⚡ Type Product Name, SKU code, or scan Barcode (Press F4)...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setIsSearchFocused(true);
                  if (searchResults.length > 0) setIsSearchOpen(true);
                }}
                onBlur={() => {
                  setIsSearchFocused(false);
                }}
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
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#1e293b',
                }}
                autoFocus
              />
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: (isSearchFocused || isSearchOpen) ? '#eff6ff' : '#f1f5f9',
                  color: (isSearchFocused || isSearchOpen) ? '#2563eb' : '#64748b',
                  border: (isSearchFocused || isSearchOpen) ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                F4
              </span>
            </div>

            {/* Search Autocomplete Results Dropdown */}
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

            {/* Quick Row Stepper Popover */}
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

          {/* Dense Tabular Items Table */}
          <FastVoucherTableSection
            items={items}
            batchMode={batchMode}
            tableRef={tableRef}
            focusedRowIndex={focusedRowIndex}
            setFocusedRowIndex={setFocusedRowIndex}
            onEditRow={(idx, row) => {
              setEditingRowIndex(idx);
              setActiveStepperItem(row);
              setIsStepperOpen(true);
            }}
            onRemoveItem={onRemoveItem}
          />
        </div>

        {/* Right Column: Live Document Preview */}
        <div
          style={{
            width: '32%',
            minWidth: '340px',
            maxWidth: '440px',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderLeft: '1px solid #e2e8f0',
          }}
        >
          {renderRightPane ? (
            renderRightPane()
          ) : (
            <VoucherLiveInvoicePreview
              documentTitle={documentTitle}
              voucherNumber={voucherNumber}
              voucherDate={voucherDate}
              status={status}
              party={selectedParty}
              companyGstin={companyGstin}
              companyStateCode={companyStateCode}
              items={items}
              summary={summary}
              onSummaryChange={onSummaryChange}
              documentDiscountAmount={documentDiscountAmount}
              documentDiscountPercent={documentDiscountPercent}
              onDocumentDiscountChange={onDocumentDiscountChange}
              shippingCharges={shippingCharges}
              onShippingChargesChange={onShippingChargesChange}
              isRoundOffEnabled={isRoundOffEnabled}
              onRoundOffToggle={onRoundOffToggle}
              discountInputRef={discountInputRef}
              freightInputRef={freightInputRef}
              onSave={onSave}
              isSaving={isSaving}
              saveButtonLabel={saveButtonLabel}
              onCancel={onCancel}
            />
          )}
        </div>
      </div>

      {/* F3 Secondary Details Drawer */}
      {isDrawerOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '420px',
            backgroundColor: '#ffffff',
            borderLeft: '1px solid #cbd5e1',
            boxShadow: '-8px 0 25px rgba(0, 0, 0, 0.15)',
            zIndex: 70,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              Additional Document Details
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
            {renderMoreDetailsDrawer ? (
              renderMoreDetailsDrawer(isDrawerOpen, () => setIsDrawerOpen(false))
            ) : (
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
                No additional fields configured for this voucher.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parked Bills Recall Modal (F7) */}
      <VoucherParkedBillsModal
        isOpen={isParkedModalOpen}
        onClose={() => setIsParkedModalOpen(false)}
        parkedBills={parking.parkedBills}
        onRecallBill={(id) => parking.recallBill(id)}
        onDeleteBill={(id) => parking.deleteBill(id)}
        voucherTitle={documentTitle}
      />

      {/* Product Variant Matrix Modal */}
      {renderVariantMatrixModal()}
    </div>
  );
};
