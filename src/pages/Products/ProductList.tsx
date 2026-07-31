import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient, Button, useToast, Select } from '@geeksman/core-ui';
import { Search, SlidersHorizontal, Plus, Minus, X, Edit, Trash2, Tag, Layers, CheckCircle } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

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

const EMPTY_VARIANT: Variant = {
  name: '',
  sku_code: '',
  price: 0,
  min_order_qty: 1,
  packings: [],
};

const EMPTY_FORM = {
  name: '',
  description: '',
  brand_name: '',
  category: '',
  is_active: true,
  variants: [{ ...EMPTY_VARIANT }] as Variant[],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const resolveImageUrl = (url?: string) => {
  if (!url) return '/assets/pharmaceutical-placeholder-premium.png';
  try {
    const idx = url.indexOf('/api/v1/media/');
    if (idx !== -1 && apiClient.defaults.baseURL) {
      const mediaPath = url.substring(idx);
      const pathAfterV1 = mediaPath.replace('/api/v1', '');
      const base = apiClient.defaults.baseURL.replace(/\/+$/, '');
      return `${base}${pathAfterV1}`;
    }
  } catch (e) {
    console.error('Error resolving image URL:', e);
  }
  return url;
};

const FieldLabel: React.FC<{ label: string; required?: boolean }> = ({ label, required }) => (
  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem' }}>
    {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
  </label>
);

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.8rem',
  border: '1.5px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '0.9rem',
  color: '#1f2937',
  backgroundColor: '#ffffff',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const searchVal = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const limitParam = parseInt(searchParams.get('limit') || '20', 10);
  const highlightedId = searchParams.get('highlightedId');

  const [products, setProducts] = useState<Product[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Sidebar panel state
  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<typeof EMPTY_FORM>({ ...EMPTY_FORM, variants: [{ ...EMPTY_VARIANT }] });
  const [isDirty, setIsDirty] = useState(false);

  // ─── Data fetching ─────────────────────────────────────────────────────────

  const fetchProducts = useCallback(() => {
    setLoading(true);
    apiClient
      .get('/rfq/vendor-products', { params: { search: searchVal, page: pageParam, limit: 250 } })
      .then((res: any) => {
        const data = res.data?.data || [];
        const total = res.data?.total ?? data.length;
        setProducts(data);
        setTotalItems(total);
      })
      .catch(() => showToast('Failed to load products', 'error'))
      .finally(() => setLoading(false));
  }, [searchVal, pageParam, limitParam]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Flash highlight on saved row
  useEffect(() => {
    if (highlightedId) {
      const el = document.getElementById(`row-${highlightedId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('row-flash-highlight');
        setTimeout(() => el.classList.remove('row-flash-highlight'), 2500);
      }
    }
  }, [products, highlightedId]);

  // Dirty-form browser guard
  useEffect(() => {
    const guard = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [isDirty]);

  // ─── Sidebar helpers ────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingProduct(null);
    setFormData({ ...EMPTY_FORM, variants: [{ ...EMPTY_VARIANT }] });
    setIsDirty(false);
    setIsOpen(true);
  };

  const openEdit = async (product: Product) => {
    setEditingProduct(product);
    try {
      const res: any = await apiClient.get(`/rfq/vendor-products/${product.id}`);
      const d = res.data?.data || product;
      setFormData({
        name: d.name || '',
        description: d.description || '',
        brand_name: d.brand_name || '',
        category: d.category || '',
        is_active: d.is_active ?? true,
        variants: (d.variants || []).length > 0
          ? d.variants.map((v: any) => ({
              id: v.id,
              name: v.name || '',
              sku_code: v.sku_code || '',
              price: v.price || 0,
              min_order_qty: v.min_order_qty || 1,
              packings: v.packings || [],
            }))
          : [{ ...EMPTY_VARIANT }],
      });
    } catch {
      setFormData({
        name: product.name, description: '', brand_name: product.brand_name,
        category: product.category, is_active: product.is_active,
        variants: product.variants || [{ ...EMPTY_VARIANT }],
      });
    }
    setIsDirty(false);
    setIsOpen(true);
  };

  const closeSidebar = () => {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    setIsOpen(false);
    setEditingProduct(null);
    setIsDirty(false);
  };

  // ─── Form state handlers ────────────────────────────────────────────────────

  const setField = (key: keyof typeof EMPTY_FORM, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const setVariantField = (idx: number, key: keyof Variant, value: any) => {
    setFormData(prev => {
      const v = [...prev.variants];
      v[idx] = { ...v[idx], [key]: value };
      return { ...prev, variants: v };
    });
    setIsDirty(true);
  };

  const addVariant = () => {
    setFormData(prev => ({ ...prev, variants: [...prev.variants, { ...EMPTY_VARIANT }] }));
    setIsDirty(true);
  };

  const removeVariant = (idx: number) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }));
    setIsDirty(true);
  };

  // ─── Save handler ───────────────────────────────────────────────────────────

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { showToast('Product name is required', 'error'); return; }
    for (const v of formData.variants) {
      if (!v.name.trim() || !v.sku_code.trim()) {
        showToast('All variants require a name and SKU code', 'error');
        return;
      }
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      brand_name: formData.brand_name,
      category: formData.category,
      is_active: formData.is_active,
      variants: formData.variants.map(v => ({
        ...(v.id ? { id: v.id } : {}),
        name: v.name,
        sku_code: v.sku_code,
        price: Number(v.price),
        min_order_qty: Number(v.min_order_qty),
        packings: v.packings,
      })),
    };

    setSaving(true);
    try {
      if (editingProduct) {
        await apiClient.put(`/rfq/vendor-products/${editingProduct.id}`, payload);
        showToast('Product updated', 'success');
        setSearchParams(prev => { prev.set('highlightedId', String(editingProduct.id)); return prev; });
      } else {
        const res: any = await apiClient.post('/rfq/vendor-products', payload);
        const newId = res.data?.data?.id;
        showToast('Product created', 'success');
        if (newId) setSearchParams(prev => { prev.set('highlightedId', String(newId)); return prev; });
      }
      setIsDirty(false);
      setIsOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ─── Styles ─────────────────────────────────────────────────────────────────

  const backdropStyle: React.CSSProperties = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 999,
  };

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed', top: 0, right: 0, bottom: 0,
    width: '640px', maxWidth: '95vw',
    backgroundColor: '#ffffff',
    boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
    zIndex: 1000,
    display: 'flex', flexDirection: 'column',
    animation: 'slideInRight 0.26s cubic-bezier(0.22,1,0.36,1)',
    overflowY: 'hidden',
  };

  // ─── JSX ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '1.5rem 2rem', fontFamily: '"Outfit", "Inter", sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', textAlign: 'left' }}>
      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .row-flash-highlight { animation: rowFlash 2s ease; }
        @keyframes rowFlash { 0%,100% { background-color: transparent; } 20%,80% { background-color: #ede9fe; } }
      `}</style>

      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>
            My Product Catalogue
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.35rem', margin: 0 }}>
            Manage and edit your products and variations.
          </p>
        </div>
        <Button onClick={openCreate} variant="primary">
          <Plus size={16} style={{ marginRight: '6px' }} />
          + Add Product
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1rem 1.25rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        <Search size={18} color="#64748b" />
        <input
          type="text"
          placeholder="Search your products..."
          value={searchVal}
          onChange={(e) =>
            setSearchParams(prev => {
              const val = e.target.value;
              val ? prev.set('search', val) : prev.delete('search');
              prev.set('page', '1');
              return prev;
            })
          }
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            fontSize: '0.9rem',
            color: '#1f2937',
            backgroundColor: 'transparent',
          }}
        />
      </div>

      {/* Normal Layout Grid (No Table!) */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{ border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : products.length === 0 ? (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <Layers size={48} style={{ marginBottom: '1rem', color: '#94a3b8' }} />
          <p style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem' }}>No products found</p>
          <p style={{ fontSize: '0.85rem', margin: '0 0 1.25rem' }}>Get started by adding a product to your catalogue.</p>
          <Button onClick={openCreate} variant="secondary">Add First Product</Button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {products.map((product) => {
            const firstVariant = product.variants?.[0];
            const defaultImage = resolveImageUrl(product.media_paths?.[0] || firstVariant?.media_paths?.[0]);
            
            return (
              <div
                key={product.id}
                id={`row-${product.id}`}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative'
                }}
                className="product-card"
              >
                {/* Image Section */}
                <div style={{
                  height: '180px',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem',
                  borderBottom: '1px solid #f1f5f9'
                }}>
                  <img
                    src={defaultImage}
                    alt={product.name}
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>

                {/* Info Section */}
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#2563eb',
                      backgroundColor: '#eff6ff',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '20px'
                    }}>
                      {product.category || 'Uncategorized'}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: product.is_active ? '#10b981' : '#f43f5e'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
                      {product.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.35rem 0', lineHeight: 1.3 }}>
                    {product.name}
                  </h3>
                  
                  {product.brand_name && (
                    <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '0.75rem' }}>
                      <Tag size={12} /> {product.brand_name}
                    </span>
                  )}

                  <p style={{
                    fontSize: '0.8rem',
                    color: '#64748b',
                    margin: '0 0 1.25rem 0',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '2.4rem'
                  }}>
                    {product.description || 'No description provided.'}
                  </p>

                  <div style={{
                    marginTop: 'auto',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '0.85rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600 }}>
                      {product.variants?.length || 0} variant{(product.variants?.length || 0) !== 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => openEdit(product)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0.45rem 0.95rem',
                        borderRadius: '8px',
                        border: '1.5px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#2563eb';
                        e.currentTarget.style.color = '#2563eb';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.color = '#0f172a';
                      }}
                    >
                      <Edit size={13} />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Backdrop + Sidebar */}
      {isOpen && (
        <>
          <div style={backdropStyle} onClick={closeSidebar} />
          <div style={sidebarStyle}>
            {/* Sidebar Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: '#ffffff', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '12px',
                  backgroundColor: '#f5f3ff', color: '#6366f1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(99,102,241,0.1)',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 0 1-8 0"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#111827' }}>
                    {editingProduct ? 'Edit Product' : 'Add Product'}
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                    {editingProduct ? `Editing: ${editingProduct.name}` : 'Register a new product for buyer visibility'}
                  </span>
                </div>
              </div>
              <button
                onClick={closeSidebar}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  backgroundColor: '#f3f4f6', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#4b5563', fontSize: '1.1rem',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              >
                &times;
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

              {/* Section: Basic Info */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#111827', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                  Product Details
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <FieldLabel label="Product Name" required />
                  <input
                    id="product-name"
                    style={inputStyle}
                    value={formData.name}
                    placeholder="e.g. Paracetamol 500mg"
                    required
                    onChange={e => setField('name', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <FieldLabel label="Description" />
                  <textarea
                    id="product-description"
                    style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
                    value={formData.description}
                    placeholder="Describe your product in detail…"
                    onChange={e => setField('description', e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <FieldLabel label="Brand Name" />
                    <input
                      id="product-brand"
                      style={inputStyle}
                      value={formData.brand_name}
                      placeholder="e.g. MediCorp"
                      onChange={e => setField('brand_name', e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <FieldLabel label="Category" />
                    <input
                      id="product-category"
                      style={inputStyle}
                      value={formData.category}
                      placeholder="e.g. Analgesics"
                      onChange={e => setField('category', e.target.value)}
                      onFocus={e => e.target.style.borderColor = '#6366f1'}
                      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>

                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    id="product-active"
                    checked={formData.is_active}
                    onChange={e => setField('is_active', e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#6366f1' }}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Active listing</span>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>(visible to buyers)</span>
                </label>
              </div>

              {/* Section: Variants */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, color: '#111827' }}>
                    Product Variants / SKUs
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>
                      ({formData.variants.length})
                    </span>
                  </h4>
                  <button
                    type="button"
                    onClick={addVariant}
                    style={{
                      padding: '0.3rem 0.75rem', borderRadius: '8px',
                      border: '1.5px dashed #6366f1', background: '#f5f3ff',
                      color: '#6366f1', fontSize: '0.8rem', fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#ede9fe'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f5f3ff'}
                  >
                    + Add Variant
                  </button>
                </div>

                {formData.variants.map((v, idx) => (
                  <div key={idx} style={{
                    border: '1.5px solid #e5e7eb',
                    borderRadius: '12px', padding: '1rem',
                    display: 'flex', flexDirection: 'column', gap: '0.8rem',
                    backgroundColor: '#fafafa',
                    position: 'relative',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{
                        fontSize: '0.78rem', fontWeight: 700, color: '#6366f1',
                        backgroundColor: '#ede9fe', padding: '0.15rem 0.55rem', borderRadius: '20px',
                      }}>
                        Variant #{idx + 1}
                      </span>
                      {formData.variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          style={{
                            padding: '0.2rem 0.6rem', borderRadius: '6px',
                            border: '1px solid #fecaca', background: '#fff5f5',
                            color: '#dc2626', fontSize: '0.75rem', fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <FieldLabel label="Variant Name" required />
                        <input
                          style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.45rem 0.7rem' }}
                          value={v.name}
                          placeholder="e.g. Box of 100"
                          required
                          onChange={e => setVariantField(idx, 'name', e.target.value)}
                          onFocus={e => e.target.style.borderColor = '#6366f1'}
                          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <FieldLabel label="SKU Code" required />
                        <input
                          style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.45rem 0.7rem', fontFamily: 'monospace' }}
                          value={v.sku_code}
                          placeholder="e.g. VND-PARA-100"
                          required
                          onChange={e => setVariantField(idx, 'sku_code', e.target.value)}
                          onFocus={e => e.target.style.borderColor = '#6366f1'}
                          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <FieldLabel label="Unit Price (₹)" required />
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.45rem 0.7rem' }}
                          value={v.price}
                          required
                          onChange={e => setVariantField(idx, 'price', Number(e.target.value))}
                          onFocus={e => e.target.style.borderColor = '#6366f1'}
                          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <FieldLabel label="Min. Order Qty" required />
                        <input
                          type="number"
                          min={1}
                          style={{ ...inputStyle, fontSize: '0.85rem', padding: '0.45rem 0.7rem' }}
                          value={v.min_order_qty}
                          required
                          onChange={e => setVariantField(idx, 'min_order_qty', Number(e.target.value))}
                          onFocus={e => e.target.style.borderColor = '#6366f1'}
                          onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Spacer so footer doesn't overlap last field */}
              <div style={{ height: '80px' }} />
            </form>

            {/* Sticky Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #f3f4f6',
              display: 'flex', gap: '0.75rem', justifyContent: 'flex-end',
              backgroundColor: '#ffffff', flexShrink: 0,
              boxShadow: '0 -2px 12px rgba(0,0,0,0.05)',
            }}>
              <Button variant="secondary" onClick={closeSidebar}>Cancel</Button>
              <Button variant="primary" onClick={handleSave as any} disabled={saving}>
                {saving ? 'Saving…' : editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
