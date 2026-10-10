import React, { useState, useCallback } from 'react';
import { ProductVariantMatrixModal } from './ProductVariantMatrixModal';
import { VoucherLineItem } from './FastVoucherEntryLayout.types';
import { apiClient } from '../../api/client';

export interface UseVariantMatrixModalOptions {
  onAddVariants: (items: VoucherLineItem[]) => void;
  onClose?: () => void;
}

export interface UseVariantMatrixModalReturn {
  isOpen: boolean;
  isLoading: boolean;
  activeProduct: any | null;
  openVariantMatrix: (productOrId: any) => Promise<void>;
  closeVariantMatrix: () => void;
  renderVariantMatrixModal: () => React.ReactNode;
}

/**
 * Common hook for managing the Product Variant Matrix Multi-Select Modal
 * with Excel-style drag-to-fill quantity, attribute filtering, and auto-fetching.
 *
 * Can be used across Purchase Orders, Sales Orders, POS, and any other voucher/document.
 */
export function useVariantMatrixModal({
  onAddVariants,
  onClose,
}: UseVariantMatrixModalOptions): UseVariantMatrixModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeProduct, setActiveProduct] = useState<any | null>(null);

  const closeVariantMatrix = useCallback(() => {
    setIsOpen(false);
    setActiveProduct(null);
    setIsLoading(false);
    onClose?.();
  }, [onClose]);

  const openVariantMatrix = useCallback(async (productOrId: any) => {
    if (!productOrId) return;

    // 1. If a string ID is passed
    if (typeof productOrId === 'string') {
      setIsLoading(true);
      setIsOpen(true);
      try {
        const res = await apiClient.get(`/catalogue/products/${productOrId}`);
        const prod = res.data?.data || res.data;
        setActiveProduct(prod);
      } catch (err) {
        console.error('Failed to load product for variant matrix', err);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2. If an object is passed
    const hasVariants = Array.isArray(productOrId.variants) && productOrId.variants.length > 0;
    if (hasVariants) {
      setActiveProduct(productOrId);
      setIsOpen(true);
      return;
    }

    // 3. Object passed without preloaded variants -> fetch complete product details
    const productId = productOrId.id || productOrId.product_id;
    if (productId) {
      setActiveProduct(productOrId);
      setIsOpen(true);
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/catalogue/products/${productId}`);
        const fullProd = res.data?.data || res.data || productOrId;
        setActiveProduct(fullProd);
      } catch (err) {
        console.warn('Could not fetch detailed variants for product, using shallow object:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setActiveProduct(productOrId);
      setIsOpen(true);
    }
  }, []);

  const handleAddVariants = useCallback(
    (items: VoucherLineItem[]) => {
      onAddVariants(items);
      closeVariantMatrix();
    },
    [onAddVariants, closeVariantMatrix]
  );

  const renderVariantMatrixModal = useCallback(() => {
    if (!isOpen || !activeProduct) return null;

    return (
      <ProductVariantMatrixModal
        isOpen={isOpen}
        product={activeProduct}
        onClose={closeVariantMatrix}
        onAddVariants={handleAddVariants}
      />
    );
  }, [isOpen, activeProduct, closeVariantMatrix, handleAddVariants]);

  return {
    isOpen,
    isLoading,
    activeProduct,
    openVariantMatrix,
    closeVariantMatrix,
    renderVariantMatrixModal,
  };
}
