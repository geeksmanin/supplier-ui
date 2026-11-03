import { useState, useRef, useCallback, useMemo } from 'react';
import { 
  FastVoucherEntryLayoutProps, 
  VoucherLineItem, 
} from './FastVoucherEntryLayout.types';
import { useVoucherKeyboard } from './useVoucherKeyboard';
import { useVoucherParking, ParkedBill } from './useVoucherParking';
import { useFormDraft } from '../../hooks/useFormDraft';
import { normalizeSearchToken } from '../SearchableEntitySelect';
import { useVariantMatrixModal } from './useVariantMatrixModal';
import { useFastVoucherPartySearch } from './useFastVoucherPartySearch';
import { useFastVoucherCatalogSearch } from './useFastVoucherCatalogSearch';

export function useFastVoucherOrchestrator(props: FastVoucherEntryLayoutProps) {
  const {
    voucherType,
    voucherDate,
    partyConfig,
    catalogConfig,
    batchMode = 'none',
    selectedParty,
    onPartySelect,
    items,
    onAddItem,
    onAddItems,
    onUpdateItem,
    onRemoveItem,
    summary,
    documentDiscountAmount = 0,
    documentDiscountPercent = 0,
    shippingCharges = 0,
    isRoundOffEnabled = true,
    onSave,
    enableBillParking = true,
    onParkBill: externalParkBill,
    onRecallBill: externalRecallBill,
    onClearForm,
    parkedBillsCount: externalParkedBillsCount,
    draftKey,
    isEdit = false,
    moreDetails,
    onRestoreDraft,
  } = props;

  // Navigation & focus refs
  const partyInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const discountInputRef = useRef<HTMLInputElement>(null);
  const freightInputRef = useRef<HTMLInputElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Stepper & search state
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeStepperItem, setActiveStepperItem] = useState<Partial<VoucherLineItem> | null>(null);
  const [isStepperOpen, setIsStepperOpen] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  // Drawer and selection states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);

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
        if (Array.isArray(bill.items) && onAddItems) {
          onAddItems(bill.items);
        }
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
  }, [externalParkBill, onClearForm, parking, selectedParty, voucherDate, items, summary, moreDetails, draftKey, draftHook.handleClearDraft]);

  // 3. Encapsulated Party Search Hook
  const {
    isPartyDropdownOpen,
    setIsPartyDropdownOpen,
    partySearchQuery,
    setPartySearchQuery,
    asyncPartyOptions,
    partyLoading,
  } = useFastVoucherPartySearch({ partyConfig });

  // 4. Encapsulated Catalog Search Hook
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearchOpen,
    setIsSearchOpen,
    selectedResultIndex,
    setSelectedResultIndex,
    liveStockMap,
  } = useFastVoucherCatalogSearch({ catalogConfig });

  // 5. Variant Matrix Multi-Select Hook for Parent Products
  const {
    openVariantMatrix,
    renderVariantMatrixModal,
  } = useVariantMatrixModal({
    onAddVariants: (newItems) => {
      if (onAddItems) {
        onAddItems(newItems);
      } else {
        newItems.forEach((it) => onAddItem(it));
      }
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    },
    onClose: () => {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    },
  });

  // 6. Global Keyboard Orchestrator
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

  // 7. Memoized party options
  const partyOptions = useMemo(() => {
    if (partyConfig?.options) {
      if (!partySearchQuery.trim()) return partyConfig.options;
      const q = normalizeSearchToken(partySearchQuery);
      return partyConfig.options.filter((o) => {
        const normLabel = normalizeSearchToken(o.label || '');
        const normGstin = o.gstin ? normalizeSearchToken(o.gstin) : '';
        const normPhone = o.phone ? normalizeSearchToken(o.phone) : '';
        return normLabel.includes(q) || normGstin.includes(q) || normPhone.includes(q);
      });
    }
    return asyncPartyOptions;
  }, [partyConfig?.options, partySearchQuery, asyncPartyOptions]);

  // 8. Handle Product Selection from Search Bar
  const handleSelectProduct = (rawProduct: any) => {
    if (rawProduct._itemType === 'product') {
      const variants = Array.isArray(rawProduct.variants) ? rawProduct.variants : [];
      if (variants.length === 1) {
        handleSelectProduct({ ...variants[0], _itemType: 'variant', product: rawProduct });
        return;
      }
      setIsSearchOpen(false);
      setSearchQuery('');
      openVariantMatrix(rawProduct);
      return;
    }

    const pName = rawProduct.product?.name || rawProduct.product_name || rawProduct.name || 'Product';
    const sku = rawProduct.sku_code || rawProduct.sku || '';
    const price = Number(
      rawProduct.sale_price ?? rawProduct.salePrice ?? rawProduct.price ?? rawProduct.selling_price ?? rawProduct.unit_cost ?? rawProduct.mrp ?? 0
    );
    const taxRate = Number(rawProduct.tax_percent ?? rawProduct.tax_rate ?? rawProduct.gst_rate ?? 0);

    const packagings = rawProduct.packagings || [
      { name: rawProduct.packaging_name || 'Unit', size: Number(rawProduct.packaging_size || 1), is_default: true },
    ];

    const batches = rawProduct.batches || rawProduct.stock_batches || [];
    let initialBatchCode = rawProduct.batch_code || '';
    let initialExpiry = rawProduct.expiry_date || '';

    if (batchMode === 'select' && Array.isArray(batches) && batches.length > 0) {
      const sortedBatches = [...batches].sort((a: any, b: any) => {
        if (!a.expiry_date) return 1;
        if (!b.expiry_date) return -1;
        return new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime();
      });
      initialBatchCode = sortedBatches[0].batch_code || sortedBatches[0].batch_number || '';
      initialExpiry = sortedBatches[0].expiry_date || '';
    }

    const vIdStr = String(rawProduct.id || rawProduct.variant_id || '');
    const currentStock = liveStockMap[vIdStr] !== undefined
      ? liveStockMap[vIdStr]
      : (rawProduct.available_quantity !== undefined ? Number(rawProduct.available_quantity) : undefined);

    const draftLine: Partial<VoucherLineItem> = {
      variant_id: rawProduct.id || rawProduct.variant_id,
      product_id: rawProduct.product_id || rawProduct.product?.id,
      sku_code: sku,
      product_name: pName,
      image_url: rawProduct.image_url || rawProduct.product?.image_url,
      quantity: 1,
      packaging_name: packagings[0]?.name || 'Unit',
      packaging_size: packagings[0]?.size || 1,
      packagings,
      batch_code: initialBatchCode,
      expiry_date: initialExpiry,
      metadata: {
        ...(rawProduct.metadata || {}),
        batches,
        available_quantity: currentStock,
      },
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

  const handleCommitStepperItem = (committedItem: VoucherLineItem) => {
    if (editingRowIndex !== null) {
      onUpdateItem(editingRowIndex, committedItem);
    } else {
      onAddItem(committedItem);
    }

    setIsStepperOpen(false);
    setActiveStepperItem(null);
    setEditingRowIndex(null);

    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const memoizedStepperBatches = useMemo(() => {
    const raw = activeStepperItem?.metadata?.batches;
    if (!Array.isArray(raw) || raw.length === 0) return [];
    return raw.map((b: any) => ({
      batch_code: b.batch_code || b.batch_number || `BATCH-${b.id}`,
      expiry_date: b.expiry_date,
      mrp: b.mrp,
      available_quantity: Number(b.available_quantity ?? b.quantity ?? 0),
    }));
  }, [activeStepperItem?.metadata?.batches]);

  return {
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
  };
}

