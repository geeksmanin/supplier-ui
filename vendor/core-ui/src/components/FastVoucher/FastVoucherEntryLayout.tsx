import React, { useRef, useEffect } from 'react';
import { FastVoucherEntryLayoutProps } from './FastVoucherEntryLayout.types';
import { VoucherLiveInvoicePreview } from './VoucherLiveInvoicePreview';
import { VoucherParkedBillsModal } from './VoucherParkedBillsModal';
import { DraftBanner } from '../../hooks/useFormDraft';
import { useFastVoucherOrchestrator } from './useFastVoucherOrchestrator';
import { FastVoucherHeaderRibbon } from './FastVoucherHeaderRibbon';
import { FastVoucherActionRow } from './FastVoucherActionRow';
import { FastVoucherTableSection } from './FastVoucherTableSection';
import { FastVoucherMoreDetailsDrawer } from './FastVoucherMoreDetailsDrawer';
import { FastVoucherCard } from './FastVoucherCard';

export const FastVoucherEntryLayout: React.FC<FastVoucherEntryLayoutProps> = (props) => {
  if (props.layoutMode === 'card') {
    return <FastVoucherCard {...props} />;
  }

  const {
    documentTitle,
    hideDocumentTitle = false,
    partyLayout = 'side-by-side',
    voucherNumber,
    onVoucherNumberChange,
    voucherNumberLabel,
    voucherNumberPlaceholder,
    voucherDate,
    onVoucherDateChange,
    dueDate,
    onDueDateChange,
    entryDate,
    autoConfirm,
    onAutoConfirmChange,
    notes,
    onNotesChange,
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
    otherCharges = 0,
    onOtherChargesChange,
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
    handleDiscard,
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
    handleNavigateToCreateProduct,
    resolvedBatchMode,
    resolvedSerialMode,
  } = useFastVoucherOrchestrator(props);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Click-outside listener to dismiss search dropdown
  useEffect(() => {
    if (!isSearchOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isSearchOpen, setIsSearchOpen]);

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
        hideDocumentTitle={hideDocumentTitle}
        status={status}
        voucherNumber={voucherNumber}
        onVoucherNumberChange={onVoucherNumberChange}
        voucherNumberLabel={voucherNumberLabel}
        voucherNumberPlaceholder={voucherNumberPlaceholder}
        onCancel={onCancel}
        partyLayout={partyLayout}
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
        dueDate={dueDate}
        onDueDateChange={onDueDateChange}
        entryDate={entryDate}
        autoConfirm={autoConfirm}
        onAutoConfirmChange={onAutoConfirmChange}
        autoConfirmLabel={props.autoConfirmLabel || (props.voucherType === 'SALES_INVOICE' ? 'Deduct Stock' : 'Inward Stock')}
        notes={notes}
        onNotesChange={onNotesChange}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        moreDetailsBadgeCount={moreDetailsBadgeCount}
        enableBillParking={enableBillParking}
        handleParkBill={handleParkBill}
        setIsParkedModalOpen={setIsParkedModalOpen}
        activeParkedCount={activeParkedCount}
        headerExtraActions={headerExtraActions}
        onDiscard={handleDiscard}
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
          {/* Action Row: Supplier Selection & Product Search Side by Side */}
          <FastVoucherActionRow
            partyLayout={partyLayout}
            renderPartySelect={renderPartySelect}
            partyConfig={partyConfig}
            selectedParty={selectedParty}
            onPartySelect={onPartySelect}
            isPartyDropdownOpen={isPartyDropdownOpen}
            setIsPartyDropdownOpen={setIsPartyDropdownOpen}
            partyInputRef={partyInputRef}
            partySearchQuery={partySearchQuery}
            setPartySearchQuery={setPartySearchQuery}
            partyLoading={partyLoading}
            partyOptions={partyOptions}
            searchInputRef={searchInputRef}
            searchContainerRef={searchContainerRef}
            catalogConfig={catalogConfig}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearchFocused={isSearchFocused}
            setIsSearchFocused={setIsSearchFocused}
            isSearchOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
            searchResults={searchResults}
            selectedResultIndex={selectedResultIndex}
            setSelectedResultIndex={setSelectedResultIndex}
            handleSelectProduct={handleSelectProduct}
            liveStockMap={liveStockMap}
            isStepperOpen={isStepperOpen}
            activeStepperItem={activeStepperItem}
            batchMode={resolvedBatchMode}
            serialMode={resolvedSerialMode}
            pricingConfig={pricingConfig}
            onOpenStockDrilldown={onOpenStockDrilldown}
            memoizedStepperBatches={memoizedStepperBatches}
            handleCommitStepperItem={handleCommitStepperItem}
            setIsStepperOpen={setIsStepperOpen}
            setActiveStepperItem={setActiveStepperItem}
            setEditingRowIndex={setEditingRowIndex}
            editingRowIndex={editingRowIndex}
            onNavigateToCreateProduct={handleNavigateToCreateProduct}
          />

          {/* Dense Tabular Items Table */}
          <FastVoucherTableSection
            items={items}
            batchMode={resolvedBatchMode}
            serialMode={resolvedSerialMode}
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
              dueDate={dueDate}
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
              otherCharges={otherCharges}
              onOtherChargesChange={onOtherChargesChange}
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
      <FastVoucherMoreDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        renderMoreDetailsDrawer={renderMoreDetailsDrawer}
      />

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
