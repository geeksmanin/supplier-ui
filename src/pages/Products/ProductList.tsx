import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '@geeksman/core-ui';
import { ProductListDesktop } from './ProductList.desktop';
import { ProductListMobile } from './ProductList.mobile';

interface Packing {
  name: string;
  size: number;
  is_default: boolean;
  remarks?: string;
}

interface Variant {
  id?: number;
  name: string;
  sku_code: string;
  price: number;
  min_order_qty: number;
  packings: Packing[];
  media_paths?: string[];
}

interface Product {
  id: number;
  vendor_id: string;
  name: string;
  description?: string;
  brand_name: string;
  category: string;
  is_active: boolean;
  variants?: Variant[];
  media_paths?: string[];
}

export function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchVal = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '20', 10);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchProducts = () => {
    setLoading(true);
    apiClient
      .get('/rfq/vendor-products', { params: { search: searchVal, page: pageParam, limit: 250 } })
      .then((res: any) => {
        const data = res.data?.data || [];
        setProducts(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [searchVal, pageParam, limitParam]);

  const handleSearchChange = (val: string) => {
    setSearchParams(prev => {
      val ? prev.set('search', val) : prev.delete('search');
      prev.set('page', '1');
      return prev;
    });
  };

  if (isDesktop) {
    return (
      <ProductListDesktop
        products={products}
        searchVal={searchVal}
        setSearchVal={handleSearchChange}
        loading={loading}
        onRefresh={fetchProducts}
      />
    );
  }

  return (
    <ProductListMobile
      products={products}
      searchVal={searchVal}
      setSearchVal={handleSearchChange}
      loading={loading}
      onRefresh={fetchProducts}
    />
  );
}
