import { useState, useEffect, useRef, useMemo } from 'react';
import {
  VoucherLineItem,
  VoucherBatchMode,
  VoucherPackagingOption
} from './FastVoucherEntryLayout.types';

interface UseVoucherQuickRowStepperProps {
  isOpen: boolean;
  item: Partial<VoucherLineItem> | null;
  batchMode?: VoucherBatchMode;
  stockBatches?: Array<{ batch_code: string; expiry_date?: string; mrp?: number; available_quantity?: number }>;
  onCommit: (item: VoucherLineItem) => void;
}

export function useVoucherQuickRowStepper({
  isOpen,
  item,
  batchMode = 'none',
  stockBatches = [],
  onCommit,
}: UseVoucherQuickRowStepperProps) {
  const [qty, setQty] = useState<number>(1);
  const [packagingName, setPackagingName] = useState<string>('Unit');
  const [packagingSize, setPackagingSize] = useState<number>(1);
  const [batchCode, setBatchCode] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [mrp, setMrp] = useState<number>(0);
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [dynamicBatches, setDynamicBatches] = useState<Array<{ batch_code: string; expiry_date?: string; mrp?: number; available_quantity?: number }>>([]);
  const [liveStock, setLiveStock] = useState<number | null>(null);

  const qtyInputRef = useRef<HTMLInputElement>(null);
  const packagingSelectRef = useRef<HTMLSelectElement>(null);
  const batchInputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);
  const expiryInputRef = useRef<HTMLInputElement>(null);
  const rateInputRef = useRef<HTMLInputElement>(null);
  const discountInputRef = useRef<HTMLInputElement>(null);

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

    setQty(item.quantity ?? 1);
    setPackagingName(item.packaging_name || 'Unit');
    setPackagingSize(item.packaging_size || 1);
    setBatchCode(item.batch_code || '');
    setExpiryDate(item.expiry_date || '');
    setMrp(item.mrp || 0);
    setUnitPrice(item.unit_price || 0);
    setDiscountPercent(item.discount_percent || 0);
    setLiveStock(item.metadata?.available_quantity !== undefined ? Number(item.metadata.available_quantity) : null);

    const vIdStr = item.variant_id ? String(item.variant_id) : '';

    let stockCleanup: (() => void) | undefined;
    if (vIdStr) {
      const handleStockUpdate = (e: any) => {
        const detail = e?.detail;
        if (detail && String(detail.variant_id) === vIdStr) {
          setLiveStock(Number(detail.passed_quantity ?? detail.available_quantity ?? 0));
        }
      };
      window.addEventListener('inventory_stock_updated', handleStockUpdate);
      stockCleanup = () => window.removeEventListener('inventory_stock_updated', handleStockUpdate);

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
      const handleBatchesResolved = (e: any) => {
        const detail = e?.detail;
        if (detail && String(detail.variant_id) === vIdStr) {
          const fetched = Array.isArray(detail.batches) ? detail.batches : [];
          setDynamicBatches(fetched);

          if (fetched.length > 0 && !item.batch_code) {
            setBatchCode(fetched[0].batch_code);
            if (fetched[0].expiry_date) setExpiryDate(fetched[0].expiry_date);
            if (fetched[0].mrp) setMrp(fetched[0].mrp);
          }
        }
      };

      window.addEventListener('inventory_batch_updated', handleBatchesResolved);
      batchCleanup = () => window.removeEventListener('inventory_batch_updated', handleBatchesResolved);

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

  const calculations = useMemo(() => {
    const rawQty = Math.max(0, Number(qty) || 0);
    const rawRate = Math.max(0, Number(unitPrice) || 0);
    const rawDisc = Math.min(100, Math.max(0, Number(discountPercent) || 0));
    const taxRate = Number(item?.tax_percent || 0);

    const isInclusive = Boolean(item?.tax_inclusive ?? item?.metadata?.is_price_tax_inclusive);
    const baseAmount = rawQty * rawRate;
    const discAmount = (baseAmount * rawDisc) / 100;
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
  }, [qty, unitPrice, discountPercent, item]);

  const handlePackagingChange = (opt: VoucherPackagingOption) => {
    setPackagingName(opt.name);
    setPackagingSize(opt.size);
  };

  const handleBatchSelect = (code: string) => {
    setBatchCode(code);
    const matched = effectiveBatches.find((b) => b.batch_code === code);
    if (matched) {
      if (matched.expiry_date) setExpiryDate(matched.expiry_date);
      if (matched.mrp) setMrp(matched.mrp);
    }
  };

  const handleCommit = () => {
    if (!item || qty <= 0) return;

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
      mrp: Number(mrp) || undefined,
      unit_price: Number(unitPrice),
      tax_percent: Number(item.tax_percent || 0),
      tax_amount: calculations.taxAmount,
      discount_percent: Number(discountPercent),
      discount_amount: calculations.discAmount,
      line_total: calculations.lineTotal,
      remarks: item.remarks,
      metadata: item.metadata,
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
    mrp,
    setMrp,
    unitPrice,
    setUnitPrice,
    discountPercent,
    setDiscountPercent,
    liveStock,
    effectiveBatches,
    calculations,
    qtyInputRef,
    packagingSelectRef,
    batchInputRef,
    expiryInputRef,
    rateInputRef,
    discountInputRef,
    handlePackagingChange,
    handleBatchSelect,
    handleCommit,
  };
}

