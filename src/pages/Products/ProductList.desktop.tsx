import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@geeksman/core-ui';
import { Search, Plus, Tag, Layers } from 'lucide-react';

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

interface DesktopProps {
  products: Product[];
  searchVal: string;
  setSearchVal: (val: string) => void;
  loading: boolean;
  onRefresh: () => void;
}

export function ProductListDesktop({ products, searchVal, setSearchVal, loading }: DesktopProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resolveMediaUrl = (url?: string) => {
    if (!url) return '/assets/pharmaceutical-placeholder-premium.png';
    const base = apiClientDefaultsBaseURL();
    const idx = url.indexOf('/api/v1/media/');
    if (idx !== -1 && base) {
      return `${base}${url.substring(idx).replace('/api/v1', '')}`;
    }
    return url;
  };

  const apiClientDefaultsBaseURL = () => {
    try {
      // Safely grab the baseUrl from local or global settings
      return window.location.origin.includes('3000') || window.location.origin.includes('3002') 
        ? 'http://localhost:8082' 
        : '';
    } catch {
      return '';
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Search Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>My Product Catalogue</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.25rem', margin: 0 }}>
            Manage your products and variations. (Desktop view)
          </p>
        </div>
        <Button onClick={() => navigate(`/products/new?${searchParams.toString()}`)} variant="primary">
          <Plus size={16} style={{ marginRight: '6px' }} />
          Add Product
        </Button>
      </div>

      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <Search size={18} color="#64748b" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', fontSize: '0.9rem', color: '#1f2937' }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : products.length === 0 ? (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '4rem 2rem', textAlign: 'center', color: '#64748b' }}>
          <Layers size={48} style={{ marginBottom: '1rem', color: '#94a3b8' }} />
          <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>No products found</p>
          <Button onClick={() => navigate(`/products/new?${searchParams.toString()}`)} variant="secondary">Add First Product</Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {products.map((product) => {
            const defaultImage = resolveMediaUrl(product.media_paths?.[0] || product.variants?.[0]?.media_paths?.[0]);
            return (
              <div key={product.id} id={`row-${product.id}`} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
                <div style={{ height: '180px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
                  <img src={defaultImage} alt={product.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '20px' }}>
                      {product.category || 'Uncategorized'}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.72rem', fontWeight: 700, color: product.is_active ? '#10b981' : '#f43f5e' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0' }}>{product.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 1.25rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.4rem' }}>{product.description || 'No description.'}</p>
                  <div style={{ marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>{product.variants?.length || 0} variant(s)</span>
                    <Button onClick={() => navigate(`/products/${product.id}/edit?${searchParams.toString()}`)} variant="secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>Edit</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
