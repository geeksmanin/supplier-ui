import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FastVoucherEntryLayoutProps, 
  VoucherLineItem, 
  VoucherPartyOption 
} from './FastVoucherEntryLayout.types';
import { useVoucherKeyboard } from './useVoucherKeyboard';
import { VoucherQuickRowStepper } from './VoucherQuickRowStepper';
import { VoucherLiveInvoicePreview } from './VoucherLiveInvoicePreview';
import { VoucherParkedBillsModal } from './VoucherParkedBillsModal';
import { useVoucherParking, ParkedBill } from './useVoucherParking';
import { useFormDraft, DraftBanner } from '../../hooks/useFormDraft';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  Calendar, 
  Layers, 
  Save, 
  RotateCcw, 
  ChevronRight, 
  X, 
  Tag, 
  Clock, 
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const FastVoucherEntryLayout: React.FC<FastVoucherEntryLayoutProps> = ({
  voucherType,
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
  items,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
  summary,
  onUpdateSummaryField,
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
  enableBillParking = true,
  onParkBill: externalParkBill,
  onRecallBill: externalRecallBill,
  onClearForm,
  parkedBillsCount: externalParkedBillsCount,
  draftKey,
  isEdit = false,
  moreDetails,
  onRestoreDraft,
  moreDetailsBadgeCount = 0,
  renderMoreDetailsDrawer,
  renderRightPane,
}) => {
  // Navigation & focus refs
  const partyInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const discountInputRef = useRef<HTMLInputElement>(null);
  const freightInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Stepper & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);

  const [activeStepperItem, setActiveStepperItem] = useState<Partial<VoucherLineItem> | null>(null);
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  // Drawer and selection states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);

  // Party dropdown state
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [partyOptions, setPartyOptions] = useState<VoucherPartyOption[]>(partyConfig.options || []);
  const [partyLoading, setPartyLoading] = useState(false);

  // 1. Built-in Bill Parking Hook (F6 / F7)
  const parking = useVoucherParking({
    voucherType,
    onRestoreBill: (bill: ParkedBill) => {
      if (externalRecallBill) {
        externalRecallBill(bill);
      } else if (onRestoreDraft) {
        onRestoreDraft(bill);
      } else {
        if (bill.party && onPartySelect) onPartySelect(bill.party);
      }
    },
  });

  const [isParkedModalOpen, setIsParkedModalOpen] = useState(false);
  const activeParkedCount = externalParkedBillsCount !== undefined ? externalParkedBillsCount : parking.parkedCount;

  // 2. Draft Auto-Save & Recovery Hook
  const draftHook = useFormDraft({
    formKey: draftKey || `${voucherType}-fast-draft`,
    formData: {
      selectedParty,
      voucherDate,
      items,
      summary,
      moreDetails,
      documentDiscountAmount,
      documentDiscountPercent,
      shippingCharges,
      isRoundOffEnabled,
    },
    isEdit: Boolean(isEdit || !draftKey),
    enabled: Boolean(draftKey && !isEdit),
    onRestore: (restored) => {
      onRestoreDraft?.(restored);
    },
  });

  const handleParkBill = useCallback(async () => {
    if (externalParkBill) {
      externalParkBill();
      return;
    }
    const bill = await parking.parkCurrentBill({
      party: selectedParty || null,
      voucherDate,
      items,
      summary,
      moreDetails,
    });
    if (bill) {
      if (onClearForm) {
        onClearForm();
      }
      if (draftKey && draftHook.handleClearDraft) {
        draftHook.handleClearDraft();
      }
    }
  }, [externalParkBill, onClearForm, parking, selectedParty, voucherDate, items, summary, moreDetails, draftKey, draftHook]);

  // 3. Hook up Global Keyboard Orchestrator
  useVoucherKeyboard({
    partyInputRef,
    searchInputRef,
    discountInputRef,
    freightInputRef,
    tableRef,
    isStepperOpen,
    isDrawerOpen,
    isModalOpen: isPartyDropdownOpen || isParkedModalOpen,
    itemsCount: items.length,
    focusedRowIndex,
    setFocusedRowIndex,
    onFocusParty: () => {
      partyInputRef.current?.focus();
      setIsPartyDropdownOpen(true);
    },
    onFocusSearch: () => {
      searchInputRef.current?.focus();
      setIsSearchOpen(true);
    },
    onFocusDiscount: () => {
      discountInputRef.current?.focus();
      discountInputRef.current?.select();
    },
    onFocusFreight: () => {
      freightInputRef.current?.focus();
      freightInputRef.current?.select();
    },
    onToggleDrawer: () => setIsDrawerOpen((prev) => !prev),
    onParkBill: enableBillParking ? handleParkBill : undefined,
    onRecallBillModal: enableBillParking ? () => setIsParkedModalOpen(true) : undefined,
    onSubmit: onSave,
    onEditRow: (idx) => {
      const itemToEdit = items[idx];
      if (itemToEdit) {
        setEditingRowIndex(idx);
        setActiveStepperItem(itemToEdit);
        setIsStepperOpen(true);
      }
    },
    onDeleteRow: (idx) => onRemoveItem(idx),
    onCloseStepper: () => {
      setIsStepperOpen(false);
      setActiveStepperItem(null);
      setEditingRowIndex(null);
    },
    onCloseDrawer: () => setIsDrawerOpen(false),
  });

  // 2. Fetch or filter party options
  useEffect(() => {
    if (partyConfig.options) {
      if (!partySearchQuery) {
        setPartyOptions(partyConfig.options);
      } else {
        const q = partySearchQuery.toLowerCase();
        setPartyOptions(
          partyConfig.options.filter(
            (o) =>
              o.label.toLowerCase().includes(q) ||
              (o.gstin && o.gstin.toLowerCase().includes(q)) ||
              (o.phone && o.phone.includes(q))
          )
        );
      }
      return;
    }

    if (partyConfig.searchEndpoint && isPartyDropdownOpen) {
      let isCancelled = false;
      const fetchParties = async () => {
        setPartyLoading(true);
        try {
          const res = await apiClient.get(partyConfig.searchEndpoint!, {
            params: {
              search: partySearchQuery,
              ...(partyConfig.searchParams || {}),
              limit: 50,
            },
          });
          const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
          if (!isCancelled) {
            setPartyOptions(
              list.map((it: any) => ({
                value: String(it.id || it.uuid),
                label: it.name || it.display_name || it.company_name || 'Party',
                gstin: it.tax_number || it.gstin,
                phone: it.phone,
                email: it.email,
                state: it.state || it.billing_address?.state,
                state_code: it.state_code,
                meta: it,
              }))
            );
          }
        } catch (err) {
          console.error('Failed to fetch parties', err);
        } finally {
          if (!isCancelled) setPartyLoading(false);
        }
      };

      const timer = setTimeout(fetchParties, 200);
      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    }
  }, [partySearchQuery, isPartyDropdownOpen, partyConfig]);

  // 3. Debounced Product Catalog Search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    let isCancelled = false;
    const fetchProducts = async () => {
      setSearchLoading(true);
      try {
        const endpoint = catalogConfig?.searchEndpoint || '/catalogue/variants';
        const res = await apiClient.get(endpoint, {
          params: {
            search: searchQuery,
            ...(catalogConfig?.searchParams || {}),
            limit: 30,
          },
        });

        const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        if (!isCancelled) {
          setSearchResults(list);
          setIsSearchOpen(list.length > 0);
          setSelectedResultIndex(0);
        }
      } catch (err) {
        console.error('Failed to search products', err);
      } finally {
        if (!isCancelled) setSearchLoading(false);
      }
    };

    const timer = setTimeout(fetchProducts, 180);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, catalogConfig]);

  // 4. Handle Product Selection from Search Bar
  const handleSelectProduct = (rawProduct: any) => {
    const pName = rawProduct.product?.name || rawProduct.product_name || rawProduct.name || 'Product';
    const sku = rawProduct.sku_code || rawProduct.sku || '';
    const price = Number(
      rawProduct.sale_price ?? rawProduct.salePrice ?? rawProduct.price ?? rawProduct.selling_price ?? rawProduct.unit_cost ?? rawProduct.mrp ?? 0
    );
    const taxRate = Number(rawProduct.tax_percent ?? rawProduct.tax_rate ?? rawProduct.gst_rate ?? 0);

    const packagings = rawProduct.packagings || [
      { name: rawProduct.packaging_name || 'Unit', size: Number(rawProduct.packaging_size || 1), is_default: true },
    ];

    const draftLine: Partial<VoucherLineItem> = {
      variant_id: String(rawProduct.id),
      product_id: rawProduct.product_id ? String(rawProduct.product_id) : undefined,
      sku_code: sku,
      product_name: pName,
      image_url: rawProduct.image_url || rawProduct.image_path,
      quantity: 1,
      packaging_name: packagings[0]?.name || 'Unit',
      packaging_size: packagings[0]?.size || 1,
      packagings,
      unit_price: price,
      tax_percent: taxRate,
      discount_percent: 0,
      mrp: Number(rawProduct.mrp || price),
    };

    setEditingRowIndex(null);
    setActiveStepperItem(draftLine);
    setIsStepperOpen(true);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  // 5. Handle Stepper Commit (Add or Edit row)
  const handleCommitStepperItem = (committedItem: VoucherLineItem) => {
    if (editingRowIndex !== null) {
      onUpdateItem(editingRowIndex, committedItem);
    } else {
      onAddItem(committedItem);
    }

    setIsStepperOpen(false);
    setActiveStepperItem(null);
    setEditingRowIndex(null);

    // Automatically return cursor focus to Product Search for next item
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
        fontFamily: 'Inter, system-ui, sans-serif',
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

      {/* ────────────────── TOP STICKY CONTEXT BAR ────────────────── */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 1.25rem',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          zIndex: 30,
        }}
      >
        {/* Left: Document Title & Party Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
          {onCancel && (
            <button
              onClick={onCancel}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                color: '#64748b',
              }}
              title="Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                {documentTitle}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '9999px',
                  backgroundColor: '#fef3c7',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                }}
              >
                {status}
              </span>
            </div>
            {voucherNumber && (
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                Doc #: {voucherNumber}
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0', margin: '0 0.25rem' }} />

          {/* Party Selector (F2) */}
          <div style={{ position: 'relative', width: '320px' }}>
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
                border: isPartyDropdownOpen ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
            >
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                <span style={{ color: '#64748b', marginRight: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                  {partyConfig.label}:
                </span>
                <strong style={{ color: selectedParty ? '#0f172a' : '#94a3b8' }}>
                  {selectedParty ? selectedParty.label : partyConfig.placeholder || `Select ${partyConfig.label}...`}
                </strong>
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
                  width: '380px',
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
                    placeholder={`Search ${partyConfig.label} by name, GSTIN...`}
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
                      No {partyConfig.label.toLowerCase()} found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Date, More Details (F3), and Park Bill (F6) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Date Picker */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#475569' }}>
            <Calendar size={14} style={{ color: '#64748b' }} />
            <input
              type="date"
              value={voucherDate}
              onChange={(e) => onVoucherDateChange?.(e.target.value)}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '4px 6px',
                fontSize: '0.75rem',
                outline: 'none',
                fontWeight: 600,
              }}
            />
          </div>

          {/* More Details (F3) */}
          <button
            onClick={() => setIsDrawerOpen((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: isDrawerOpen ? '#eff6ff' : '#ffffff',
              color: isDrawerOpen ? '#2563eb' : '#475569',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <span>More Info</span>
            {moreDetailsBadgeCount > 0 && (
              <span
                style={{
                  fontSize: '0.65rem',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  padding: '1px 5px',
                }}
              >
                {moreDetailsBadgeCount}
              </span>
            )}
            <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>[F3]</span>
          </button>

          {/* Park Bill (F6) & Recall (F7) */}
          {enableBillParking && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={handleParkBill}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
                title="Park current bill into IndexedDB (F6)"
              >
                <Clock size={13} style={{ color: '#d97706' }} />
                <span>Park</span>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>[F6]</span>
              </button>

              <button
                type="button"
                onClick={() => setIsParkedModalOpen(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  border: activeParkedCount > 0 ? '1px solid #fde68a' : '1px solid #cbd5e1',
                  backgroundColor: activeParkedCount > 0 ? '#fef3c7' : '#ffffff',
                  color: activeParkedCount > 0 ? '#b45309' : '#475569',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
                title="Recall held/parked bills (F7)"
              >
                <span>Held ({activeParkedCount})</span>
                <span style={{ fontSize: '0.65rem', color: activeParkedCount > 0 ? '#b45309' : '#94a3b8' }}>[F7]</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ────────────────── MAIN BODY: SPLIT VIEW ────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Column (68% width): Central Product Search & Tabular Items Table */}
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
              style={{
                display: 'flex',
                alignItems: 'center',
                border: isSearchOpen ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                borderRadius: '10px',
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                boxShadow: isSearchOpen ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none',
              }}
            >
              <Search size={18} style={{ color: isSearchOpen ? '#2563eb' : '#94a3b8', marginRight: '8px' }} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={
                  catalogConfig?.placeholder ||
                  '⚡ Type Product Name, SKU code, or scan Barcode (Press Ctrl+K or F4)...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsSearchOpen(true);
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
                  backgroundColor: '#f1f5f9',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  whiteSpace: 'nowrap',
                }}
              >
                Ctrl+K
              </span>
            </div>

            {/* Search Autocomplete Results Dropdown */}
            {isSearchOpen && searchResults.length > 0 && (
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
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
                  zIndex: 45,
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}
              >
                {searchResults.map((res, idx) => {
                  const pName = res.product?.name || res.product_name || res.name || 'Product';
                  const sku = res.sku_code || res.sku || '';
                  const price =
                    res.sale_price ?? res.salePrice ?? res.price ?? res.selling_price ?? res.unit_cost ?? res.mrp ?? 0;
                  const isSelected = idx === selectedResultIndex;

                  return (
                    <div
                      key={res.id || idx}
                      onClick={() => handleSelectProduct(res)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                        borderLeft: isSelected ? '3px solid #2563eb' : '3px solid transparent',
                      }}
                      onMouseEnter={() => setSelectedResultIndex(idx)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            backgroundColor: '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1e293b' }}>{pName}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                            SKU: {sku || '-'} {res.tax_percent ? `• Tax: ${res.tax_percent}%` : ''}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.875rem', color: '#2563eb' }}>
                          ₹{Number(price).toFixed(2)}
                        </div>
                        {isSelected && (
                          <div style={{ fontSize: '0.65rem', color: '#2563eb', fontWeight: 700 }}>Press Enter ↵</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Row Stepper Popover */}
            <div style={{ position: 'relative' }}>
              <VoucherQuickRowStepper
                isOpen={isStepperOpen}
                item={activeStepperItem}
                batchMode={batchMode}
                allowRateOverride={pricingConfig.allowRateOverride}
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
          <div ref={tableRef} style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem' }}>
            {items.length === 0 ? (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  padding: '3rem 1rem',
                }}
              >
                <ShoppingBag size={48} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#64748b' }}>No items added yet</div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                  Press <strong style={{ color: '#2563eb' }}>Ctrl+K</strong> to search products or scan a barcode
                </div>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem', marginTop: '0.5rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #cbd5e1', color: '#475569', textAlign: 'left' }}>
                    <th style={{ padding: '8px 6px', width: '40px', textAlign: 'center' }}>#</th>
                    <th style={{ padding: '8px 10px' }}>Item Description</th>
                    <th style={{ padding: '8px 8px', width: '90px' }}>SKU</th>
                    {batchMode !== 'none' && <th style={{ padding: '8px 8px', width: '110px' }}>Batch / Exp</th>}
                    <th style={{ padding: '8px 8px', width: '90px' }}>Unit</th>
                    <th style={{ padding: '8px 8px', width: '70px', textAlign: 'right' }}>Qty</th>
                    <th style={{ padding: '8px 8px', width: '90px', textAlign: 'right' }}>Rate (₹)</th>
                    <th style={{ padding: '8px 8px', width: '65px', textAlign: 'right' }}>Disc %</th>
                    <th style={{ padding: '8px 8px', width: '65px', textAlign: 'right' }}>Tax %</th>
                    <th style={{ padding: '8px 10px', width: '110px', textAlign: 'right' }}>Total (₹)</th>
                    <th style={{ padding: '8px 6px', width: '60px', textAlign: 'center' }}>Act</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, idx) => {
                    const isFocused = focusedRowIndex === idx;

                    return (
                      <tr
                        key={row.id || idx}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: isFocused ? '#eff6ff' : idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                          outline: isFocused ? '2px solid #3b82f6' : 'none',
                          cursor: 'pointer',
                        }}
                        onClick={() => setFocusedRowIndex(idx)}
                        onDoubleClick={() => {
                          setEditingRowIndex(idx);
                          setActiveStepperItem(row);
                          setIsStepperOpen(true);
                        }}
                      >
                        <td style={{ padding: '8px 6px', textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{row.product_name}</div>
                          {row.remarks && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>
                              {row.remarks}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '8px 8px', fontFamily: 'monospace', fontSize: '0.75rem', color: '#64748b' }}>
                          {row.sku_code || '-'}
                        </td>
                        {batchMode !== 'none' && (
                          <td style={{ padding: '8px 8px' }}>
                            <span style={{ fontWeight: 600, color: '#334155' }}>{row.batch_code || '-'}</span>
                            {row.expiry_date && (
                              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Exp: {row.expiry_date}</div>
                            )}
                          </td>
                        )}
                        <td style={{ padding: '8px 8px', color: '#475569' }}>
                          {row.packaging_name || 'Unit'}
                          {row.packaging_size > 1 ? ` (${row.packaging_size}s)` : ''}
                        </td>
                        <td style={{ padding: '8px 8px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          {row.quantity}
                        </td>
                        <td style={{ padding: '8px 8px', textAlign: 'right', color: '#334155' }}>
                          ₹{Number(row.unit_price).toFixed(2)}
                        </td>
                        <td style={{ padding: '8px 8px', textAlign: 'right', color: row.discount_percent ? '#dc2626' : '#94a3b8' }}>
                          {row.discount_percent ? `${row.discount_percent}%` : '-'}
                        </td>
                        <td style={{ padding: '8px 8px', textAlign: 'right', color: '#059669', fontSize: '0.75rem' }}>
                          {row.tax_percent ? `${row.tax_percent}%` : '-'}
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#2563eb' }}>
                          ₹{Number(row.line_total).toFixed(2)}
                        </td>
                        <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingRowIndex(idx);
                                setActiveStepperItem(row);
                                setIsStepperOpen(true);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '3px',
                                color: '#64748b',
                              }}
                              title="Edit line (E)"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveItem(idx);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '3px',
                                color: '#ef4444',
                              }}
                              title="Delete line (Del)"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Hotkey Cheatsheet Strip */}
          <div
            style={{
              padding: '0.5rem 1.25rem',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: '#64748b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span>
                <strong style={{ color: '#2563eb' }}>[F2]</strong> Party
              </span>
              <span>
                <strong style={{ color: '#2563eb' }}>[Ctrl+K]</strong> Search
              </span>
              <span>
                <strong style={{ color: '#2563eb' }}>[↓]</strong> Table Nav
              </span>
              <span>
                <strong style={{ color: '#2563eb' }}>[E]</strong> Edit Row
              </span>
              <span>
                <strong style={{ color: '#2563eb' }}>[Del]</strong> Delete
              </span>
              <span>
                <strong style={{ color: '#2563eb' }}>[F3]</strong> More Info
              </span>
              <span>
                <strong style={{ color: '#2563eb' }}>[F6]</strong> Park
              </span>
            </div>
            <div>
              <strong style={{ color: '#059669' }}>[F10]</strong> Save / Submit
            </div>
          </div>
        </div>

        {/* Right Column (32% width): Real-Time Live Document / Invoice Preview */}
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

      {/* ────────────────── F3 SECONDARY DETAILS DRAWER ────────────────── */}
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

      {/* ────────────────── PARKED BILLS RECALL MODAL (F7) ────────────────── */}
      <VoucherParkedBillsModal
        isOpen={isParkedModalOpen}
        onClose={() => setIsParkedModalOpen(false)}
        parkedBills={parking.parkedBills}
        onRecallBill={(id) => parking.recallBill(id)}
        onDeleteBill={(id) => parking.deleteBill(id)}
        voucherTitle={documentTitle}
      />
    </div>
  );
};
