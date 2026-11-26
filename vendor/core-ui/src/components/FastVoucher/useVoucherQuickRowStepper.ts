import { useState, useEffect, useRef, useMemo } from 'react';
import type {
  InventoryStockUpdatedDetail,
  InventoryBatchUpdatedDetail,
  InventorySerialUpdatedDetail,
} from '../../types/inventoryEvents';
import {
  VoucherLineItem,
  VoucherBatchMode,
  VoucherSerialMode,
  VoucherPackagingOption
} from './FastVoucherEntryLayout.types';

interface StepperBatchOption {
  batch_code: string;
  expiry_date?: string;
  mrp?: number;
  available_quantity?: number;
  location_id?: string;
}

interface UseVoucherQuickRowStepperProps {
  isOpen: boolean;
  item: Partial<VoucherLineItem> | null;
  batchMode?: VoucherBatchMode;
  serialMode?: VoucherSerialMode;
  stockBatches?: StepperBatchOption[];
  onCommit: (item: VoucherLineItem) => void;
}

export function useVoucherQuickRowStepper({
  isOpen,
  item,
  batchMode = 'none',
  serialMode = 'none',
  stockBatches = [],
  onCommit,
}: UseVoucherQuickRowStepperProps) {
  const [qty, setQtyState] = useState<number>(1);
  const [packagingName, setPackagingName] = useState<string>('Unit');
  const [packagingSize, setPackagingSize] = useState<number>(1);
  const [batchCode, setBatchCode] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [locationId, setLocationId] = useState<string>('');
  const [serialNumbers, setSerialNumbers] = useState<string[]>([]);
  const [serialInputText, setSerialInputText] = useState<string>('');
  const [availableSerials, setAvailableSerials] = useState<string[]>([]);
  const [serialMetaMap, setSerialMetaMap] = useState<Record<string, { location_id?: string; batch_code?: string }>>({});
  const [serialError, setSerialError] = useState<string>('');
  const [mrp, setMrp] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [discountMode, setDiscountMode] = useState<'flat' | 'percent'>('percent');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [dynamicBatches, setDynamicBatches] = useState<StepperBatchOption[]>([]);
  const [liveStock, setLiveStock] = useState<number | null>(null);

  const qtyInputRef = useRef<HTMLInputElement>(null);
  const packagingSelectRef = useRef<HTMLSelectElement>(null);
  const batchInputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const expiryInputRef = useRef<HTMLInputElement>(null);
  const rateInputRef = useRef<HTMLInputElement>(null);
  const discountInputRef = useRef<HTMLInputElement>(null);
  const taxInputRef = useRef<HTMLInputElement>(null);

  const lastRequestedBatchVariantRef = useRef<string | null>(null);
  const lastRequestedStockVariantRef = useRef<string | null>(null);

  const effectiveBatches = useMemo(() => {
    return stockBatches.length > 0 ? stockBatches : dynamicBatches;
  }, [stockBatches, dynamicBatches]);

  useEffect(() => {
    if (!isOpen || !item) {
      lastRequestedBatchVariantRef.current = null;
      lastRequestedStockVariantRef.current = null;
      return;
    }

    setQtyState(item.quantity ?? 1);
    const resolvedUnit =
      item.packaging_name ||
      item.metadata?.unit ||
      item.metadata?.base_unit ||
      'Unit';
    setPackagingName(resolvedUnit);
    setPackagingSize(item.packaging_size || 1);
    setBatchCode(item.batch_code || '');
    setExpiryDate(item.expiry_date || '');
    setLocationId(item.location_id || '');
    setSerialNumbers(Array.isArray(item.serial_numbers) ? item.serial_numbers : []);
    setSerialInputText('');
    setAvailableSerials([]);
    setSerialMetaMap({});
    setSerialError('');
    setMrp(item.mrp || 0);
    setUnitPrice(item.unit_price || 0);
    const hasFlatDiscount =
      item.discount_type === 'FIXED' ||
      (Number(item.discount_amount) > 0 && !(Number(item.discount_percent) > 0));
    if (hasFlatDiscount) {
      setDiscountMode('flat');
      setDiscountAmount(Number(item.discount_amount ?? item.discount_value ?? 0));
      setDiscountPercent(0);
    } else {
      setDiscountMode('percent');
      setDiscountPercent(
        Number(item.discount_percent ?? (item.discount_type === 'PERCENTAGE' ? item.discount_value : 0) ?? 0)
      );
      setDiscountAmount(0);
    }
    setTaxPercent(item.tax_percent ?? 0);
    setLiveStock(item.metadata?.available_quantity !== undefined ? Number(item.metadata.available_quantity) : null);

    const vIdStr = item.variant_id ? String(item.variant_id) : '';

    let stockCleanup: (() => void) | undefined;
    if (vIdStr) {
      const handleStockUpdate = (e: CustomEvent<InventoryStockUpdatedDetail>) => {
        const detail = e?.detail;
        if (detail && String(detail.variant_id) === vIdStr) {
          setLiveStock(Number(detail.passed_quantity ?? detail.available_quantity ?? 0));
        }
      };
      window.addEventListener('inventory_stock_updated', handleStockUpdate as EventListener);
      stockCleanup = () => window.removeEventListener('inventory_stock_updated', handleStockUpdate as EventListener);

      if (lastRequestedStockVariantRef.current !== vIdStr) {
        lastRequestedStockVariantRef.current = vIdStr;
        window.dispatchEvent(
          new CustomEvent('inventory_stock_request', {
            detail: { variant_id: vIdStr },
          })
        );
      }
    }

    let batchCleanup: (() => void) | undefined;
    if (batchMode === 'select' && stockBatches.length === 0 && vIdStr) {
      const handleBatchesResolved = (e: CustomEvent<InventoryBatchUpdatedDetail>) => {
        const detail = e?.detail;
        if (detail && String(detail.variant_id) === vIdStr) {
          const fetched = Array.isArray(detail.batches) ? detail.batches : [];
          setDynamicBatches(
            fetched.map((b) => ({
              batch_code: b.batch_code,
              expiry_date: b.expiry_date ?? undefined,
              mrp: b.mrp,
              available_quantity: b.available_quantity,
            }))
          );

          if (fetched.length > 0 && !item.batch_code) {
            setBatchCode(fetched[0].batch_code);
            if (fetched[0].expiry_date) setExpiryDate(fetched[0].expiry_date);
            if (fetched[0].mrp) setMrp(fetched[0].mrp);
            if (fetched[0].location_id) setLocationId(String(fetched[0].location_id));
          }
        }
      };

      window.addEventListener('inventory_batch_updated', handleBatchesResolved as EventListener);
      batchCleanup = () => window.removeEventListener('inventory_batch_updated', handleBatchesResolved as EventListener);

      if (lastRequestedBatchVariantRef.current !== vIdStr) {
        lastRequestedBatchVariantRef.current = vIdStr;
        window.dispatchEvent(
          new CustomEvent('inventory_batch_request', {
            detail: { variant_id: vIdStr },
          })
        );
      }
    } else if (stockBatches.length > 0) {
      setDynamicBatches([]);
    }

    if (batchMode === 'select' && stockBatches.length > 0 && !item.batch_code) {
      setBatchCode(stockBatches[0].batch_code);
      if (stockBatches[0].expiry_date) setExpiryDate(stockBatches[0].expiry_date);
      if (stockBatches[0].mrp) setMrp(stockBatches[0].mrp);
      if (stockBatches[0].location_id) setLocationId(String(stockBatches[0].location_id));
    }

    const timer = setTimeout(() => {
      if (qtyInputRef.current) {
        qtyInputRef.current.focus();
        qtyInputRef.current.select();
      }
    }, 50);

    return () => {
      clearTimeout(timer);
      stockCleanup?.();
      batchCleanup?.();
    };
  }, [isOpen, item?.id, item?.variant_id, batchMode, stockBatches.length]);

  // Fetch AVAILABLE serials whenever select-mode stepper opens or batch/location changes
  useEffect(() => {
    const vIdStr = item?.variant_id ? String(item.variant_id) : '';
    if (!isOpen || serialMode !== 'select' || !item?.is_serial_tracking_enabled || !vIdStr) {
      return;
    }
    const handleSerialsResolved = (e: CustomEvent<InventorySerialUpdatedDetail>) => {
      const detail = e?.detail;
      if (detail && String(detail.variant_id) === vIdStr) {
        const list = Array.isArray(detail.serials) ? detail.serials : [];
        const nextMeta: Record<string, { location_id?: string; batch_code?: string }> = {};
        const normalized = list
          .map((s) => {
            const sn = typeof s === 'string' ? s : String(s?.barcode || s?.serial_no || '');
            if (sn && typeof s === 'object' && s !== null) {
              nextMeta[sn] = {
                location_id: s.location_id ? String(s.location_id) : undefined,
                batch_code: s.batch_code ? String(s.batch_code) : undefined,
              };
            }
            return sn;
          })
          .filter(Boolean);
        setSerialMetaMap(nextMeta);
        setAvailableSerials(normalized);
      }
    };
    window.addEventListener('inventory_serial_updated', handleSerialsResolved as EventListener);
    window.dispatchEvent(
      new CustomEvent('inventory_serial_request', {
        detail: {
          variant_id: vIdStr,
          batch_code: batchCode || item.batch_code || '',
          location_id: item.location_id || '',
        },
      })
    );
    return () => window.removeEventListener('inventory_serial_updated', handleSerialsResolved as EventListener);
  }, [isOpen, item?.variant_id, item?.is_serial_tracking_enabled, item?.location_id, serialMode, batchCode]);

  const calculations = useMemo(() => {
    const rawQty = Math.max(0, Number(qty) || 0);
    const rawRate = Math.max(0, Number(unitPrice) || 0);
    const rawDiscPct = Math.min(100, Math.max(0, Number(discountPercent) || 0));
    const rawDiscAmt = Math.max(0, Number(discountAmount) || 0);
    const taxRate = Math.max(0, Number(taxPercent || 0));

    const isInclusive = Boolean(item?.tax_inclusive ?? item?.metadata?.is_price_tax_inclusive);
    const baseAmount = rawQty * rawRate;
    const discAmount =
      discountMode === 'flat'
        ? Math.min(baseAmount, rawDiscAmt)
        : (baseAmount * rawDiscPct) / 100;
    const grossAfterDisc = Math.max(0, baseAmount - discAmount);

    let taxableAmount = grossAfterDisc;
    let taxAmount = (taxableAmount * taxRate) / 100;

    if (isInclusive && taxRate > 0) {
      taxableAmount = +(grossAfterDisc / (1 + taxRate / 100)).toFixed(2);
      taxAmount = +(grossAfterDisc - taxableAmount).toFixed(2);
    }

    const lineTotal = isInclusive ? grossAfterDisc : taxableAmount + taxAmount;

    return {
      baseAmount: Number(baseAmount.toFixed(2)),
      discAmount: Number(discAmount.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      lineTotal: Number(lineTotal.toFixed(2)),
    };
  }, [qty, unitPrice, discountMode, discountPercent, discountAmount, taxPercent, item]);

  const handleDiscountModeChange = (nextMode: 'flat' | 'percent') => {
    if (nextMode === discountMode) return;
    const base = Math.max(0, Number(qty) || 0) * Math.max(0, Number(unitPrice) || 0);
    if (nextMode === 'flat') {
      const converted = base > 0 ? +((base * (Number(discountPercent) || 0)) / 100).toFixed(2) : 0;
      setDiscountAmount(converted);
      setDiscountPercent(0);
    } else {
      const convertedPct = base > 0 ? +(((Number(discountAmount) || 0) / base) * 100).toFixed(2) : 0;
      setDiscountPercent(Math.min(100, convertedPct));
      setDiscountAmount(0);
    }
    setDiscountMode(nextMode);
  };

  const handlePackagingChange = (opt: VoucherPackagingOption) => {
    setPackagingName(opt.name);
    setPackagingSize(opt.size);
  };

  const setQty = (nextQty: number) => {
    setQtyState(nextQty);
    const maxSerials = Math.max(0, Math.round(Number(nextQty) || 0));
    if (serialNumbers.length > maxSerials) {
      setSerialError(`Selected ${serialNumbers.length} serial(s) exceeds quantity (${maxSerials}). Remove extra serial(s) or increase quantity.`);
    } else {
      setSerialError('');
    }
  };

  const handleBatchSelect = (code: string) => {
    setBatchCode(code);
    const matched = effectiveBatches.find((b) => b.batch_code === code);
    if (matched) {
      setExpiryDate(matched.expiry_date || '');
      if (matched.mrp) setMrp(matched.mrp);
      if (matched.location_id) setLocationId(String(matched.location_id));
    } else {
      setExpiryDate('');
    }
  };

  const handleAddSerialTags = (rawInput: string) => {
    const tokens = rawInput
      .split(/[\s,;]+/)
      .map((t) => t.trim())
      .filter(Boolean);
    if (tokens.length === 0) return;

    const maxSerials = Math.max(0, Math.round(Number(qty) || 0));
    if (maxSerials <= 0) {
      setSerialError('Quantity must be at least 1 before adding serial numbers.');
      return;
    }

    const uniqueNew = tokens.filter((tok, i) => tokens.indexOf(tok) === i && !serialNumbers.includes(tok));
    if (uniqueNew.length === 0) {
      setSerialInputText('');
      return;
    }

    const remaining = maxSerials - serialNumbers.length;
    if (remaining <= 0) {
      setSerialError(`Cannot add more than ${maxSerials} serial number(s) for quantity ${maxSerials}.`);
      return;
    }

    const allowed = uniqueNew.slice(0, remaining);
    if (uniqueNew.length > remaining) {
      setSerialError(`Only ${maxSerials} serial number(s) allowed for quantity ${maxSerials}. Extra serial(s) were skipped.`);
    } else {
      setSerialError('');
    }
    setSerialNumbers((prev) => [...prev, ...allowed]);
    setSerialInputText('');
  };

  const handleRemoveSerialTag = (serial: string) => {
    setSerialNumbers((prev) => {
      const next = prev.filter((s) => s !== serial);
      const maxSerials = Math.max(0, Math.round(Number(qty) || 0));
      if (next.length <= maxSerials) {
        setSerialError('');
      }
      return next;
    });
  };

  const handleToggleSelectSerial = (serial: string) => {
    const maxSerials = Math.max(0, Math.round(Number(qty) || 0));
    if (serialNumbers.includes(serial)) {
      const next = serialNumbers.filter((s) => s !== serial);
      if (next.length <= maxSerials) {
        setSerialError('');
      }
      setSerialNumbers(next);
      return;
    }
    if (maxSerials <= 0 || serialNumbers.length >= maxSerials) {
      setSerialError(`Cannot select more than ${maxSerials} serial number(s) for quantity ${maxSerials}.`);
      return;
    }
    setSerialError('');
    setSerialNumbers((prev) => [...prev, serial]);
    const meta = serialMetaMap[serial];
    if (meta?.location_id) {
      setLocationId(meta.location_id);
    }
    if (meta?.batch_code && !batchCode) {
      setBatchCode(meta.batch_code);
    }
  };

  const handleCommit = () => {
    if (!item || qty <= 0) return;

    const isSerialLine = Boolean(item.is_serial_tracking_enabled) && serialMode !== 'none';
    const targetCount = Math.max(0, Math.round(Number(qty) || 0));
    if (isSerialLine && serialNumbers.length > targetCount) {
      setSerialError(`Serial count (${serialNumbers.length}) cannot exceed quantity (${targetCount}).`);
      return;
    }

    const committedItem: VoucherLineItem = {
      id: item.id || `line-${Date.now()}`,
      variant_id: item.variant_id || '',
      product_id: item.product_id,
      sku_code: item.sku_code || '',
      product_name: item.product_name || 'Item',
      image_url: item.image_url,
      quantity: Number(qty),
      packaging_name: packagingName,
      packaging_size: Number(packagingSize),
      packagings: item.packagings,
      batch_code: batchCode.trim() || undefined,
      expiry_date: expiryDate.trim() || undefined,
      location_id: locationId || item.location_id,
      serial_numbers: serialNumbers.length > 0 ? serialNumbers : undefined,
      mrp: Number(mrp) || undefined,
      unit_price: Number(unitPrice),
      tax_percent: Number(taxPercent || 0),
      tax_amount: calculations.taxAmount,
      discount_type: discountMode === 'flat' ? 'FIXED' : 'PERCENTAGE',
      discount_value: discountMode === 'flat' ? Number(calculations.discAmount) : Number(discountPercent),
      discount_percent: discountMode === 'percent' ? Number(discountPercent) : 0,
      discount_amount: calculations.discAmount,
      line_total: calculations.lineTotal,
      hsn_code: item.hsn_code,
      remarks: item.remarks,
      metadata: item.metadata,
      is_batch_tracking_enabled: item.is_batch_tracking_enabled,
      is_serial_tracking_enabled: item.is_serial_tracking_enabled,
      is_expiry_enabled: item.is_expiry_enabled,
    };

    onCommit(committedItem);
  };

  return {
    qty,
    setQty,
    packagingName,
    packagingSize,
    batchCode,
    setBatchCode,
    expiryDate,
    setExpiryDate,
    serialNumbers,
    setSerialNumbers,
    serialInputText,
    setSerialInputText,
    availableSerials,
    serialError,
    handleAddSerialTags,
    handleRemoveSerialTag,
    handleToggleSelectSerial,
    mrp,
    setMrp,
    unitPrice,
    setUnitPrice,
    discountMode,
    handleDiscountModeChange,
    discountPercent,
    setDiscountPercent,
    discountAmount,
    setDiscountAmount,
    taxPercent,
    setTaxPercent,
    liveStock,
    effectiveBatches,
    calculations,
    qtyInputRef,
    packagingSelectRef,
    batchInputRef,
    expiryInputRef,
    rateInputRef,
    discountInputRef,
    taxInputRef,
    handlePackagingChange,
    handleBatchSelect,
    handleCommit,
  };
}

