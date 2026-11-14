import { useState, useEffect, useMemo } from 'react';
import { VoucherLineItem } from './FastVoucherEntryLayout.types';

export interface VariantSelectionItem {
  id: string;
  name: string;
  sku_code: string;
  attributes: Array<{ name: string; value: string }>;
  mrp: number;
  unit_price: number;
  quantity: number;
  packagings?: any[];
  rawVariant: any;
}

export interface UseMobileVariantPickerProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onAddVariants: (items: VoucherLineItem[]) => void;
}

export function useMobileVariantPicker({
  isOpen,
  onClose,
  product,
  onAddVariants,
}: UseMobileVariantPickerProps) {
  const [search, setSearch] = useState('');

  const rawVariants: any[] = useMemo(() => {
    return Array.isArray(product?.variants) ? product.variants : [];
  }, [product]);

  const [items, setItems] = useState<VariantSelectionItem[]>([]);

  useEffect(() => {
    if (!isOpen || !product) {
      setItems([]);
      setSearch('');
      return;
    }

    const initial = rawVariants.map((v: any) => {
      const attrsList: Array<{ name: string; value: string }> = [];
      if (Array.isArray(v.attributes)) {
        v.attributes.forEach((a: any) => {
          attrsList.push({
            name: a.attribute_name || a.name || 'Attr',
            value: a.value || a.attribute_value || String(a.attribute_value_id || ''),
          });
        });
      } else if (v.attributes && typeof v.attributes === 'object') {
        Object.entries(v.attributes).forEach(([k, val]) => {
          attrsList.push({ name: k, value: String(val) });
        });
      }

      const price = Number(
        v.sale_price ?? v.salePrice ?? v.price ?? v.selling_price ?? v.unit_cost ?? v.mrp ?? product?.sale_price ?? product?.price ?? 0
      );

      return {
        id: String(v.id),
        name: v.name || (product?.name ? `${product.name} - ${v.sku_code || 'Variant'}` : v.sku_code || 'Variant'),
        sku_code: v.sku_code || v.sku || '',
        attributes: attrsList,
        mrp: Number(v.mrp || price),
        unit_price: price,
        quantity: 0,
        packagings: v.packagings || product?.packagings,
        rawVariant: v,
      };
    });

    setItems(initial);
  }, [isOpen, product, rawVariants]);

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const newQty = Math.max(0, it.quantity + delta);
        return { ...it, quantity: newQty };
      })
    );
  };

  const setDirectQuantity = (id: string, val: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        return { ...it, quantity: Math.max(0, isNaN(val) ? 0 : val) };
      })
    );
  };

  const setDirectPrice = (id: string, price: number) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        return { ...it, unit_price: Math.max(0, isNaN(price) ? 0 : price) };
      })
    );
  };

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.sku_code.toLowerCase().includes(q) ||
        it.attributes.some((a) => a.value.toLowerCase().includes(q))
    );
  }, [items, search]);

  const selectedCount = useMemo(() => {
    return items.filter((it) => it.quantity > 0).length;
  }, [items]);

  const totalQuantity = useMemo(() => {
    return items.reduce((sum, it) => sum + it.quantity, 0);
  }, [items]);

  const totalAmount = useMemo(() => {
    return items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);
  }, [items]);

  const handleConfirm = () => {
    const selected = items.filter((it) => it.quantity > 0);
    if (selected.length === 0) return;

    const lineItems: VoucherLineItem[] = selected.map((it) => {
      const v = it.rawVariant;
      const taxRate = Number(v.tax_percent ?? v.tax_rate ?? product?.tax_percent ?? product?.tax_rate ?? 0);
      const subtotal = it.quantity * it.unit_price;
      const taxAmount = (subtotal * taxRate) / 100;

      return {
        variant_id: it.id,
        product_id: String(product?.id || ''),
        sku_code: it.sku_code,
        product_name: it.name,
        quantity: it.quantity,
        packaging_name: it.packagings?.[0]?.name || 'Unit',
        packaging_size: Number(it.packagings?.[0]?.size || 1),
        packagings: it.packagings,
        mrp: it.mrp,
        unit_price: it.unit_price,
        tax_percent: taxRate,
        tax_amount: taxAmount,
        discount_percent: 0,
        discount_amount: 0,
        line_total: subtotal + taxAmount,
        metadata: {
          variant: v,
          attributes: it.attributes,
        },
      };
    });

    onAddVariants(lineItems);
    onClose();
  };

  return {
    search,
    setSearch,
    rawVariants,
    items,
    filteredItems,
    selectedCount,
    totalQuantity,
    totalAmount,
    updateQuantity,
    setDirectQuantity,
    setDirectPrice,
    handleConfirm,
  };
}
