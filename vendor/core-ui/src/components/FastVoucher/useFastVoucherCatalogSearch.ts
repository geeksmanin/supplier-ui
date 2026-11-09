import { useState, useEffect, useRef } from 'react';
import { apiClient } from '../../api/client';
import { VoucherCatalogConfig } from './FastVoucherEntryLayout.types';

interface UseFastVoucherCatalogSearchProps {
  catalogConfig?: VoucherCatalogConfig;
}

export function useFastVoucherCatalogSearch({ catalogConfig }: UseFastVoucherCatalogSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);
  const [liveStockMap, setLiveStockMap] = useState<Record<string, number>>({});

  // 1. Dynamic Live Stock Ingestion via Domain Event Bus (Decoupled & Non-blocking)
  useEffect(() => {
    if (!catalogConfig?.showStock) return;

    const handleStockUpdate = (e: any) => {
      const delta = e?.detail;
      if (!delta?.variant_id) return;
      const vId = String(delta.variant_id);
      const passed = Number(delta.passed_quantity ?? delta.available_quantity ?? 0);
      setLiveStockMap((prev) => ({
        ...prev,
        [vId]: passed,
      }));
    };

    window.addEventListener('inventory_stock_updated', handleStockUpdate);
    return () => {
      window.removeEventListener('inventory_stock_updated', handleStockUpdate);
    };
  }, [catalogConfig?.showStock]);

  // 2. Request stock for displayed search results without blocking UI
  useEffect(() => {
    if (!catalogConfig?.showStock || searchResults.length === 0) return;

    searchResults.forEach((res) => {
      if (res._itemType === 'variant') {
        const vId = String(res.id || res.variant_id || '');
        if (vId) {
          window.dispatchEvent(
            new CustomEvent('inventory_stock_request', {
              detail: {
                variant_id: vId,
                warehouse_id: catalogConfig?.warehouseId,
              },
            })
          );
        }
      }
    });
  }, [searchResults, catalogConfig?.showStock, catalogConfig?.warehouseId]);

  // 3. Debounced Product Catalog & Variant Dual Search with AbortController
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      setSearchResults([]);
      setIsSearchOpen(false);
      setSearchLoading(false);
      return;
    }

    let isCancelled = false;
    const fetchProducts = async () => {
      // Abort previous in-flight request before starting a new search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setSearchLoading(true);
      try {
        const variantEndpoint = catalogConfig?.searchEndpoint || '/catalogue/variants';
        const searchPromises: Promise<any>[] = [
          apiClient.get(variantEndpoint, {
            params: {
              search: searchQuery,
              ...(catalogConfig?.searchParams || {}),
              limit: 25,
            },
            signal: controller.signal,
          }),
          apiClient.get('/catalogue/products', {
            params: {
              search: searchQuery,
              limit: 12,
            },
            signal: controller.signal,
          }),
        ];

        // Progressive Instant Search: Catalog resolves without waiting for inventory ledger
        const [variantsRes, productsRes] = await Promise.allSettled(searchPromises);

        if (controller.signal.aborted || isCancelled) {
          return;
        }

        const rawVariants =
          variantsRes.status === 'fulfilled'
            ? Array.isArray(variantsRes.value.data?.data)
              ? variantsRes.value.data.data
              : Array.isArray(variantsRes.value.data)
              ? variantsRes.value.data
              : []
            : [];

        const rawProducts =
          productsRes.status === 'fulfilled'
            ? Array.isArray(productsRes.value.data?.data)
              ? productsRes.value.data.data
              : Array.isArray(productsRes.value.data)
              ? productsRes.value.data
              : []
            : [];

        const merged: any[] = [];
        const seenVariantIds = new Set<string>();

        // 1. Add Variants first with _itemType: 'variant' (exact SKU/barcode matches)
        rawVariants.forEach((v: any) => {
          const vId = String(v.id || v.variant_id || '');
          if (vId) seenVariantIds.add(vId);
          merged.push({
            ...v,
            _itemType: 'variant',
          });
        });

        // 2. Add Parent Products with _itemType: 'product' ONLY if they have MULTIPLE variants (> 1).
        rawProducts.forEach((p: any) => {
          const variants = Array.isArray(p.variants) ? p.variants : [];
          if (variants.length > 1) {
            merged.push({
              ...p,
              _itemType: 'product',
            });
          } else if (variants.length === 1) {
            const singleV = variants[0];
            const singleVId = String(singleV.id || singleV.variant_id || '');
            if (singleVId && !seenVariantIds.has(singleVId)) {
              seenVariantIds.add(singleVId);
              merged.push({
                ...singleV,
                product: p,
                _itemType: 'variant',
              });
            }
          }
        });

        if (!isCancelled && !controller.signal.aborted) {
          setSearchResults(merged);
          setIsSearchOpen(merged.length > 0);
          setSelectedResultIndex(0);

          // Eagerly trigger stock inquiries for all returned variants immediately
          if (catalogConfig?.showStock) {
            merged.forEach((item) => {
              const vId = String(item.id || item.variant_id || '');
              if (vId) {
                window.dispatchEvent(
                  new CustomEvent('inventory_stock_request', {
                    detail: {
                      variant_id: vId,
                      warehouse_id: catalogConfig?.warehouseId,
                    },
                  })
                );
              }
            });
          }
        }
      } catch (err: any) {
        if (!controller.signal.aborted && !isCancelled) {
          console.error('Failed to search products', err);
        }
      } finally {
        if (!isCancelled && !controller.signal.aborted) {
          setSearchLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchProducts, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchQuery, catalogConfig?.searchEndpoint]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    searchLoading,
    isSearchOpen,
    setIsSearchOpen,
    selectedResultIndex,
    setSelectedResultIndex,
    liveStockMap,
  };
}

