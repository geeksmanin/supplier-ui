import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FastVoucherEntryLayoutProps, 
  VoucherLineItem, 
} from './FastVoucherEntryLayout.types';
import { useVoucherKeyboard } from './useVoucherKeyboard';
import { useVoucherParking, ParkedBill } from './useVoucherParking';
import { useFormDraft } from '../../hooks/useFormDraft';
import { normalizeSearchToken } from '../SearchableEntitySelect';
import { useFastVoucherPartySearch } from './useFastVoucherPartySearch';
import { useFastVoucherCatalogSearch } from './useFastVoucherCatalogSearch';
import { useToast } from '../Toast/Toast';
import { saveFormDraft } from '../../utils/draftStore';
import { apiClient } from '../../api/client';

// Helper to sanitize product variant attributes so nested GORM models / objects are flattened to strings,
// preventing React child render crashes and localeCompare crashes in matrix modals.
export function sanitizeProductVariants(product: any): any {
  if (!product) return product;
  const rawVariants = Array.isArray(product.variants) ? product.variants : [];
  const sanitizedVariants = rawVariants.map((v: any) => {
    if (!v) return v;
    const rawAttrs = v.attributes;
    let sanitizedAttrs: any[] = [];
    if (Array.isArray(rawAttrs)) {
      sanitizedAttrs = rawAttrs.map((a: any) => {
        if (!a) return a;
        const name = String(
          a.attribute?.name ||
          a.Attribute?.Name ||
          a.attribute_name ||
          a.name ||
          'Attr'
        );
        let val = '';
        if (a.attribute_value && typeof a.attribute_value === 'object') {
          val = a.attribute_value.value || a.attribute_value.name || a.attribute_value.label || '';
        } else if (a.AttributeValue && typeof a.AttributeValue === 'object') {
          val = a.AttributeValue.Value || a.AttributeValue.Name || a.AttributeValue.Label || '';
        } else if (a.value !== undefined && a.value !== null) {
          val = typeof a.value === 'object' ? (a.value.value || a.value.name || '') : String(a.value);
        } else if (a.attribute_value !== undefined && a.attribute_value !== null) {
          val = String(a.attribute_value);
        } else if (a.attribute_value_id) {
          val = String(a.attribute_value_id);
        }
        return {
          ...a,
          name,
          attribute_name: name,
          value: String(val),
          attribute_value: String(val),
        };
      });
    } else if (rawAttrs && typeof rawAttrs === 'object') {
      sanitizedAttrs = Object.entries(rawAttrs).map(([k, vVal]) => {
        const vStr = typeof vVal === 'object' && vVal !== null ? ((vVal as any).value || (vVal as any).name || '') : String(vVal ?? '');
        return {
          name: String(k),
          attribute_name: String(k),
          value: String(vStr),
          attribute_value: String(vStr),
        };
      });
    }
    return {
      ...v,
      attributes: sanitizedAttrs,
    };
  });
  return {
    ...product,
    variants: sanitizedVariants,
  };
}

export type VariantMatrixRenderer = (props: {
  isOpen: boolean;
  product: any;
  onClose: () => void;
  onAddVariants: (items: VoucherLineItem[]) => void;
}) => React.ReactNode;

let globalDefaultVariantMatrixRenderer: VariantMatrixRenderer | null = null;

export function registerDefaultVariantMatrixRenderer(renderer: VariantMatrixRenderer) {
  globalDefaultVariantMatrixRenderer = renderer;
}

export function getDefaultVariantMatrixRenderer(): VariantMatrixRenderer | null {
  return globalDefaultVariantMatrixRenderer;
}

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

  const handleDiscard = useCallback(() => {
    const hasData = items.length > 0 || Boolean(selectedParty) || Boolean(props.voucherNumber);
    if (hasData) {
      const confirmDiscard = window.confirm(
        'Are you sure you want to discard this voucher entry? All unsaved inputs and items will be reset.'
      );
      if (!confirmDiscard) return;
    }
    if (props.onDiscard) {
      props.onDiscard();
    } else if (onClearForm) {
      onClearForm();
    }
    if (draftKey && draftHook.handleClearDraft) {
      draftHook.handleClearDraft();
    }
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [items.length, selectedParty, props.voucherNumber, props.onDiscard, onClearForm, draftKey, draftHook.handleClearDraft]);

  // 3. Encapsulated Party Search Hook
  const {
    isPartyDropdownOpen,
    setIsPartyDropdownOpen,
    partySearchQuery,
    setPartySearchQuery,
    asyncPartyOptions,
    partyLoading,
    resolvedLabel: resolvedPartyLabel,
    resolvedPlaceholder: resolvedPartyPlaceholder,
  } = useFastVoucherPartySearch({
    partyConfig,
    partyRole: props.partyRole,
    voucherType,
    enabled: !Boolean(props.renderPartySelect || partyConfig?.renderPartySelect),
  });

  // 4. Encapsulated Catalog Search Hook
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearchOpen,
    setIsSearchOpen,
    openSearch,
    selectedResultIndex,
    setSelectedResultIndex,
    liveStockMap,
  } = useFastVoucherCatalogSearch({ catalogConfig });

  // 5. Decoupled Variant Matrix / Product Selection Slot
  const [internalMatrixProduct, setInternalMatrixProduct] = useState<any | null>(null);
  const [isInternalMatrixOpen, setIsInternalMatrixOpen] = useState(false);

  const openVariantMatrix = useCallback((product: any) => {
    const handler = props.onSelectProductWithVariants || catalogConfig?.onSelectProductWithVariants;
    if (handler) {
      handler(sanitizeProductVariants(product));
      return;
    }
    setInternalMatrixProduct(sanitizeProductVariants(product));
    setIsInternalMatrixOpen(true);

    // Resilient variant fetching: If product variants are shallow or missing attributes, fetch full product details
    const productId = product.id || product.product_id;
    const variants = Array.isArray(product.variants) ? product.variants : [];
    const hasFullVariants = variants.length > 0 && variants.some((v: any) => v.attributes && (Array.isArray(v.attributes) ? v.attributes.length > 0 : Object.keys(v.attributes).length > 0));

    if (productId && !hasFullVariants) {
      apiClient
        .get(`/catalogue/products/${productId}`)
        .then((res) => {
          const fullProd = res.data?.data || res.data;
          if (fullProd && Array.isArray(fullProd.variants) && fullProd.variants.length > 0) {
            setInternalMatrixProduct(sanitizeProductVariants(fullProd));
          }
        })
        .catch((err) => {
          console.warn('[useFastVoucherOrchestrator] Could not fetch detailed variants for matrix:', err);
        });
    }
  }, [props.onSelectProductWithVariants, catalogConfig?.onSelectProductWithVariants]);

  const closeVariantMatrix = useCallback(() => {
    setIsInternalMatrixOpen(false);
    setInternalMatrixProduct(null);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  }, []);

  const renderVariantMatrixModal = useCallback(() => {
    const renderFn = props.renderVariantMatrix || catalogConfig?.renderVariantMatrix || globalDefaultVariantMatrixRenderer;
    if (!renderFn || !isInternalMatrixOpen || !internalMatrixProduct) return null;

    return renderFn({
      isOpen: isInternalMatrixOpen,
      product: internalMatrixProduct,
      onClose: closeVariantMatrix,
      onAddVariants: (newItems) => {
        if (onAddItems) onAddItems(newItems);
        else newItems.forEach((it) => onAddItem(it));
        closeVariantMatrix();
      },
    });
  }, [props.renderVariantMatrix, catalogConfig?.renderVariantMatrix, isInternalMatrixOpen, internalMatrixProduct, closeVariantMatrix, onAddItems, onAddItem]);

  // 6. Navigation to Product Creation (In-App)
  const { showToast } = useToast();
  let navigate: any = null;
  try {
    navigate = useNavigate();
  } catch {
    // Router context not available
  }
  let location: any = null;
  try {
    location = useLocation();
  } catch {
    // Router context not available
  }

  const handleNavigateToCreateProduct = useCallback((query?: string) => {
    if (catalogConfig?.onNavigateToCreateProduct) {
      catalogConfig.onNavigateToCreateProduct(query || searchQuery);
      return;
    }

    if (draftKey) {
      saveFormDraft(draftKey || `${voucherType}-fast-draft`, {
        selectedParty,
        voucherDate,
        items,
        summary,
        moreDetails,
        documentDiscountAmount,
        documentDiscountPercent,
        shippingCharges,
        isRoundOffEnabled,
      }).catch((err) => console.warn('Failed to save draft before product creation navigation:', err));
    }

    const currentPath = (location?.pathname || window.location.pathname) + (location?.search || window.location.search);
    const returnUrl = encodeURIComponent(currentPath);
    const params = new URLSearchParams();
    params.set('returnUrl', returnUrl);

    const q = (query !== undefined ? query : searchQuery).trim();
    if (/^\d{6,14}$/.test(q)) {
      params.set('barcode', q);
    } else if (q.length > 0) {
      params.set('name', q);
    }

    const targetUrl = `/products/new?${params.toString()}`;
    if (navigate) {
      navigate(targetUrl);
    } else {
      window.location.href = targetUrl;
    }
  }, [
    catalogConfig?.onNavigateToCreateProduct,
    draftKey,
    voucherType,
    selectedParty,
    voucherDate,
    items,
    summary,
    moreDetails,
    documentDiscountAmount,
    documentDiscountPercent,
    shippingCharges,
    isRoundOffEnabled,
    location,
    searchQuery,
    navigate,
  ]);

  // 7. Global Keyboard Orchestrator
  useVoucherKeyboard({
    partyInputRef,
    searchInputRef,
    discountInputRef,
    freightInputRef,
    tableRef,
    isStepperOpen,
    isDrawerOpen,
    isModalOpen: isPartyDropdownOpen || isParkedModalOpen || isInternalMatrixOpen,
    isSearchOpen,
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
    onCreateProduct: () => handleNavigateToCreateProduct(searchQuery),
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
  const handleSelectProduct = async (rawProduct: any) => {
    if (rawProduct._itemType === 'product' || (!rawProduct._itemType && Array.isArray(rawProduct.variants) && rawProduct.variants.length > 1)) {
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
    const hsnCode = String(rawProduct.hsn || rawProduct.hsn_code || rawProduct.product?.hsn || rawProduct.product?.hsn_code || '');
    let taxRate = Number(rawProduct.tax_percent ?? rawProduct.tax_rate ?? rawProduct.gst_rate ?? 0);

    if (taxRate === 0 && catalogConfig?.resolveTaxRate) {
      try {
        const resolved = await catalogConfig.resolveTaxRate(rawProduct);
        if (typeof resolved === 'number' && !isNaN(resolved)) {
          taxRate = resolved;
        }
      } catch (err) {
        console.warn('Failed to resolve product tax rate:', err);
      }
    }

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
      hsn_code: hsnCode || undefined,
      product_name: pName,
      image_url: rawProduct.image_url || rawProduct.product?.image_url,
      quantity: 1,
      packaging_name: packagings[0]?.name || 'Unit',
      packaging_size: packagings[0]?.size || 1,
      packagings,
      batch_code: initialBatchCode,
      expiry_date: initialExpiry,
      is_batch_tracking_enabled: Boolean(rawProduct.is_batch_tracking_enabled || rawProduct.product?.is_batch_tracking_enabled),
      is_expiry_enabled: Boolean(rawProduct.is_expiry_enabled || rawProduct.product?.is_expiry_enabled),
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

  // 10. Return Trip: Auto-detect created product and restore voucher draft
  const hasProcessedAddedProduct = useRef<string | null>(null);

  useEffect(() => {
    const searchString = location?.search || window.location.search;
    if (!searchString) return;
    const sp = new URLSearchParams(searchString);
    const addedProductId = sp.get('addedProductId');
    const autoRestore = sp.get('autoRestore');

    if (autoRestore === 'true' && draftHook.hasDraft && draftHook.handleRestoreDraft) {
      draftHook.handleRestoreDraft();
    }

    if (!addedProductId || hasProcessedAddedProduct.current === addedProductId) return;
    hasProcessedAddedProduct.current = addedProductId;

    const fetchAndInjectProduct = async () => {
      try {
        let prod: any = null;
        if (catalogConfig?.resolveProductById) {
          prod = await catalogConfig.resolveProductById(addedProductId);
        }
        if (prod) {
          const variants = Array.isArray(prod.variants) ? prod.variants : [];
          if (variants.length > 0) {
            handleSelectProduct({ ...variants[0], _itemType: 'variant', product: prod });
          } else {
            handleSelectProduct({ ...prod, _itemType: 'variant' });
          }
          showToast(`Product "${prod.name || 'New Product'}" added to voucher`, 'success');
        }
      } catch (err) {
        console.warn('Failed to auto-inject created product:', err);
      } finally {
        sp.delete('addedProductId');
        sp.delete('autoRestore');
        const cleanSearch = sp.toString();
        const cleanUrl = (location?.pathname || window.location.pathname) + (cleanSearch ? `?${cleanSearch}` : '');
        if (window.history && window.history.replaceState) {
          window.history.replaceState({}, '', cleanUrl);
        }
      }
    };

    fetchAndInjectProduct();
  }, [location?.search, draftHook.hasDraft, draftHook.handleRestoreDraft, handleSelectProduct, showToast]);

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
    handleDiscard,
    isPartyDropdownOpen,
    setIsPartyDropdownOpen,
    partySearchQuery,
    setPartySearchQuery,
    partyLoading,
    partyOptions,
    resolvedPartyLabel,
    resolvedPartyPlaceholder,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearchOpen,
    setIsSearchOpen,
    openSearch,
    selectedResultIndex,
    setSelectedResultIndex,
    liveStockMap,
    renderVariantMatrixModal,
    handleSelectProduct,
    handleCommitStepperItem,
    memoizedStepperBatches,
    handleNavigateToCreateProduct,
  };
}

