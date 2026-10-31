import { useState, useCallback, useRef } from 'react';
import { apiClient } from '../api/client';
import { normalizeSearchToken } from '../components/SearchableEntitySelect';

export interface ProductVariantItem {
  id: string | number;
  variant_id: string | number;
  variant_name: string;
  name?: string;
  title?: string;
  sku_code: string;
  barcode?: string;
  unit_name?: string;
  available_quantity?: number;
  on_hand_quantity?: number;
  image_path?: string;
  sale_price?: number;
  mrp?: number;
  status?: string;
}

export interface UseProductSearchOptions {
  limit?: number;
  endpoint?: string;
}

export interface UseProductSearchReturn {
  searching: boolean;
  searchProducts: (query: string) => Promise<ProductVariantItem[]>;
  lookupBarcode: (barcode: string) => Promise<ProductVariantItem | null>;
}

export function useProductSearch(options: UseProductSearchOptions = {}): UseProductSearchReturn {
  const { limit = 20, endpoint = '/catalogue/variants' } = options;
  const [searching, setSearching] = useState(false);
  const cacheRef = useRef<Map<string, ProductVariantItem[]>>(new Map());

  const searchProducts = useCallback(async (query: string): Promise<ProductVariantItem[]> => {
    const cleanQuery = query.trim();
    if (cacheRef.current.has(cleanQuery)) {
      return cacheRef.current.get(cleanQuery)!;
    }

    setSearching(true);
    try {
      const res = await apiClient.get(endpoint, {
        params: { search: cleanQuery, limit },
      }).catch(() => apiClient.get('/api/v1/catalogue/variants', {
        params: { search: cleanQuery, limit },
      })).catch(() => ({ data: { data: [] } }));

      const raw = res?.data?.data || res?.data || [];
      const list: any[] = Array.isArray(raw) ? raw : [];

      const formatted: ProductVariantItem[] = list.map((item: any) => {
        const vId = item.id || item.variant_id;
        const vName = item.variant_name || item.name || item.title || `Item #${vId}`;
        const sku = item.sku_code || item.sku || 'N/A';
        const barcode = item.barcode || '';
        const unit = item.unit_name || item.uom || 'units';
        const avail = Number(item.available_quantity ?? item.current_stock ?? item.stock ?? 0);
        const onHand = Number(item.on_hand_quantity ?? item.available_quantity ?? avail);

        return {
          id: String(vId),
          variant_id: String(vId),
          variant_name: vName,
          name: vName,
          title: vName,
          sku_code: sku,
          barcode,
          unit_name: unit,
          available_quantity: avail,
          on_hand_quantity: onHand,
          image_path: item.image_path || item.image || item.thumbnail || '',
          sale_price: item.sale_price !== undefined ? Number(item.sale_price) : undefined,
          mrp: item.mrp !== undefined ? Number(item.mrp) : undefined,
          status: avail > 10 ? 'IN_STOCK' : avail > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK',
        };
      });

      // Client-side symmetric fuzzy ranking
      if (cleanQuery) {
        const qNorm = normalizeSearchToken(cleanQuery);
        formatted.sort((a, b) => {
          const aSkuNorm = normalizeSearchToken(a.sku_code);
          const bSkuNorm = normalizeSearchToken(b.sku_code);
          if (aSkuNorm === qNorm && bSkuNorm !== qNorm) return -1;
          if (bSkuNorm === qNorm && aSkuNorm !== qNorm) return 1;
          return 0;
        });
      }

      cacheRef.current.set(cleanQuery, formatted);
      return formatted;
    } catch {
      return [];
    } finally {
      setSearching(false);
    }
  }, [endpoint, limit]);

  const lookupBarcode = useCallback(async (code: string): Promise<ProductVariantItem | null> => {
    let cleanCode = code.trim();
    if (cleanCode.startsWith('{') && cleanCode.endsWith('}')) {
      try {
        const parsed = JSON.parse(cleanCode);
        cleanCode = parsed.sku || parsed.sku_code || parsed.variant_id || parsed.barcode || cleanCode;
      } catch {
        // fallback to raw
      }
    }
    if (!cleanCode) return null;

    const results = await searchProducts(cleanCode);
    if (results.length > 0) {
      const qNorm = normalizeSearchToken(cleanCode);
      const exact = results.find(
        (r) =>
          normalizeSearchToken(r.sku_code) === qNorm ||
          normalizeSearchToken(r.barcode || '') === qNorm ||
          String(r.variant_id) === cleanCode
      );
      return exact || results[0];
    }
    return null;
  }, [searchProducts]);

  return { searching, searchProducts, lookupBarcode };
}
