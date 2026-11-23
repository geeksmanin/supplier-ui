import React from 'react';
import { Search, X } from 'lucide-react';
import { 
  VoucherPartyConfig, 
  VoucherPartyOption, 
  VoucherCatalogConfig, 
  VoucherBatchMode, 
  VoucherPricingConfig 
} from './FastVoucherEntryLayout.types';
import { FastVoucherCatalogSearchDropdown } from './FastVoucherCatalogSearchDropdown';
import { VoucherQuickRowStepper } from './VoucherQuickRowStepper';

export interface FastVoucherActionRowProps {
  partyLayout?: 'side-by-side' | 'header';
  renderPartySelect?: (props: any) => React.ReactNode;
  partyConfig?: VoucherPartyConfig;
  selectedParty: VoucherPartyOption | null;
  onPartySelect?: (party: VoucherPartyOption | null) => void;
  isPartyDropdownOpen: boolean;
  setIsPartyDropdownOpen: (open: boolean) => void;
  partyInputRef: React.RefObject<HTMLInputElement | null>;
  partySearchQuery: string;
  setPartySearchQuery: (query: string) => void;
  partyLoading: boolean;
  partyOptions: VoucherPartyOption[];
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
  catalogConfig?: VoucherCatalogConfig;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchResults: any[];
  selectedResultIndex: number;
  setSelectedResultIndex: (idx: number | ((prev: number) => number)) => void;
  handleSelectProduct: (product: any) => void;
  liveStockMap: Record<string, number>;
  isStepperOpen: boolean;
  activeStepperItem: any;
  batchMode: VoucherBatchMode;
  pricingConfig: VoucherPricingConfig;
  onOpenStockDrilldown?: (item: any) => void;
  memoizedStepperBatches: any[];
  handleCommitStepperItem: (item: any) => void;
  setIsStepperOpen: (open: boolean) => void;
  setActiveStepperItem: (item: any) => void;
  setEditingRowIndex: (idx: number | null) => void;
  editingRowIndex: number | null;
  onNavigateToCreateProduct?: (query?: string) => void;
}

export const FastVoucherActionRow: React.FC<FastVoucherActionRowProps> = ({
  partyLayout = 'side-by-side',
  renderPartySelect,
  partyConfig,
  selectedParty,
  onPartySelect,
  isPartyDropdownOpen,
  setIsPartyDropdownOpen,
  partyInputRef,
  partySearchQuery,
  setPartySearchQuery,
  partyLoading,
  partyOptions,
  searchInputRef,
  searchContainerRef,
  catalogConfig,
  searchQuery,
  setSearchQuery,
  isSearchFocused,
  setIsSearchFocused,
  isSearchOpen,
  setIsSearchOpen,
  searchResults,
  selectedResultIndex,
  setSelectedResultIndex,
  handleSelectProduct,
  liveStockMap,
  isStepperOpen,
  activeStepperItem,
  batchMode,
  pricingConfig,
  onOpenStockDrilldown,
  memoizedStepperBatches,
  handleCommitStepperItem,
  setIsStepperOpen,
  setActiveStepperItem,
  setEditingRowIndex,
  editingRowIndex,
  onNavigateToCreateProduct,
}) => {
  return (
    <div
      style={{
        padding: '0.65rem 1rem',
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start',
      }}
    >
      {/* Left: Supplier / Party Selector (F2) */}
      {partyLayout !== 'header' && (
        <div style={{ width: '36%', minWidth: '280px', maxWidth: '420px', position: 'relative' }}>
          {renderPartySelect ? (
            renderPartySelect({ selectedParty, onPartySelect })
          ) : partyConfig?.renderPartySelect ? (
            partyConfig.renderPartySelect({ selectedParty, onPartySelect })
          ) : (
            <>
              <div
                onClick={() => {
                  setIsPartyDropdownOpen(true);
                  partyInputRef.current?.focus();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: isPartyDropdownOpen ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  minHeight: '38px',
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b', marginRight: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {partyConfig?.label || 'Supplier'}:
                  </span>
                  <strong style={{ color: selectedParty ? '#0f172a' : '#94a3b8' }}>
                    {selectedParty ? selectedParty.label : partyConfig?.placeholder || `Select ${partyConfig?.label || 'party'}...`}
                  </strong>
                  {selectedParty?.gstin && (
                    <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                      ({selectedParty.gstin})
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #dbeafe',
                  }}
                >
                  F2
                </span>
              </div>

              {/* Party Dropdown Popover */}
              {isPartyDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '100%',
                    minWidth: '320px',
                    marginTop: '4px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    zIndex: 60,
                    padding: '0.5rem',
                  }}
                >
                  <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                    <Search size={14} style={{ position: 'absolute', left: '8px', top: '9px', color: '#94a3b8' }} />
                    <input
                      ref={partyInputRef}
                      type="text"
                      className="bare-input"
                      data-bare-input="true"
                      placeholder={`Search ${partyConfig?.label || 'party'} by name, GSTIN...`}
                      value={partySearchQuery}
                      onChange={(e) => setPartySearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsPartyDropdownOpen(false);
                        } else if (e.key === 'Enter' && partyOptions.length > 0) {
                          onPartySelect?.(partyOptions[0]);
                          setIsPartyDropdownOpen(false);
                          searchInputRef.current?.focus();
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px 6px 28px',
                        fontSize: '0.8rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                      }}
                      autoFocus
                    />
                  </div>

                  <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {partyLoading ? (
                      <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                        Loading options...
                      </div>
                    ) : partyOptions.length > 0 ? (
                      partyOptions.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            onPartySelect?.(opt);
                            setIsPartyDropdownOpen(false);
                            setTimeout(() => searchInputRef.current?.focus(), 50);
                          }}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            backgroundColor: selectedParty?.value === opt.value ? '#eff6ff' : 'transparent',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = selectedParty?.value === opt.value ? '#eff6ff' : 'transparent')
                          }
                        >
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{opt.label}</div>
                          {opt.gstin && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                              GSTIN: {opt.gstin} {opt.state ? `• ${opt.state}` : ''}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                        No {partyConfig?.label ? partyConfig.label.toLowerCase() : 'options'} found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Right: Product Search Bar (F4) */}
      <div ref={searchContainerRef} style={{ flex: 1, position: 'relative' }}>
        <div
          className="bounding-box fast-voucher-search-box"
          data-bounding-box="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            border: (isSearchFocused || isSearchOpen) ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
            borderRadius: '8px',
            padding: '6px 10px',
            backgroundColor: '#ffffff',
            boxShadow: (isSearchFocused || isSearchOpen)
              ? '0 0 0 3px rgba(37, 99, 235, 0.15), 0 2px 8px rgba(37, 99, 235, 0.1)'
              : 'none',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            minHeight: '38px',
          }}
        >
          <Search
            size={16}
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
              'Scan barcode or search purchasable items [F4]...'
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
              if (e.key === 'F3' || (e.altKey && e.key.toLowerCase() === 'n')) {
                e.preventDefault();
                onNavigateToCreateProduct?.(searchQuery);
                return;
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                setIsSearchOpen(false);
                return;
              }
              if (e.key === 'Enter' && isSearchOpen && searchResults.length === 0) {
                e.preventDefault();
                onNavigateToCreateProduct?.(searchQuery);
                return;
              }
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!isSearchOpen) {
                  setIsSearchOpen(true);
                } else if (searchResults.length > 0) {
                  setSelectedResultIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : prev));
                }
                return;
              }
              if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (isSearchOpen && searchResults.length > 0) {
                  setSelectedResultIndex((prev) => (prev > 0 ? prev - 1 : 0));
                }
                return;
              }
              if (e.key === 'Enter') {
                e.preventDefault();
                if (searchResults[selectedResultIndex]) {
                  handleSelectProduct(searchResults[selectedResultIndex]);
                }
              }
            }}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              boxShadow: 'none',
              backgroundColor: 'transparent',
              fontSize: '0.85rem',
              fontWeight: 600,
              color: '#1e293b',
            }}
            autoFocus
          />

          {/* Clear search (X) button */}
          {searchQuery.trim().length > 0 && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
                searchInputRef.current?.focus();
              }}
              title="Clear search"
              style={{
                background: 'none',
                border: 'none',
                padding: '2px 4px',
                marginRight: '6px',
                cursor: 'pointer',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={15} />
            </button>
          )}

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

        {/* Autocomplete Results Dropdown */}
        {isSearchOpen && (
          <FastVoucherCatalogSearchDropdown
            searchResults={searchResults}
            selectedResultIndex={selectedResultIndex}
            setSelectedResultIndex={setSelectedResultIndex}
            handleSelectProduct={handleSelectProduct}
            catalogConfig={catalogConfig}
            liveStockMap={liveStockMap}
            onClose={() => setIsSearchOpen(false)}
            searchQuery={searchQuery}
            onNavigateToCreateProduct={onNavigateToCreateProduct}
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
    </div>
  );
};
