import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@geeksman/core-ui';
import { Search, Plus } from 'lucide-react';

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
  attributes?: Record<number, number>;
  attrTexts?: string[];
}

interface Product {
  id: number;
  name: string;
  description?: string;
  brand_name: string;
  category: string;
  is_active: boolean;
  variants?: Variant[];
  media_paths?: string[];
}

interface MobileProps {
  products: Product[];
  searchVal: string;
  setSearchVal: (val: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

export function ProductListMobile({ products, searchVal, setSearchVal, loading }: MobileProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resolveMediaUrl = (url?: string) => {
    if (!url) return '/assets/pharmaceutical-placeholder-premium.png';
    const base = window.location.origin.includes('3000') || window.location.origin.includes('3002') 
      ? 'http://localhost:8082' 
      : '';
    const idx = url.indexOf('/api/v1/media/');
    if (idx !== -1 && base) {
      return `${base}${url.substring(idx).replace('/api/v1', '')}`;
    }
    return url;
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Product Catalogue</h2>
        <Button onClick={() => navigate(`/products/new?${searchParams.toString()}`)} variant="primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>+ Add</Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '10px', padding: '0.5rem', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
        <Search size={16} color="#64748b" style={{ marginRight: '6px' }} />
        <input type="text" placeholder="Search..." value={searchVal} onChange={e => setSearchVal(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.85rem' }} />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>No products found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {products.map(p => (
            <div key={p.id} style={{ display: 'flex', gap: '10px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px' }}>
              <img src={resolveMediaUrl(p.media_paths?.[0] || p.variants?.[0]?.media_paths?.[0])} alt={p.name} style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#f8fafc' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 700 }}>{p.name}</h4>
                  <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{p.category || 'No Category'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{p.variants?.length || 0} variant(s)</span>
                  <Button onClick={() => navigate(`/products/${p.id}/edit?${searchParams.toString()}`)} variant="secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Edit</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
