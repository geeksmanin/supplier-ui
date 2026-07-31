import React, { useState, useEffect } from 'react';
import { apiClient, Button, useToast, Select, ImageUpload } from '@geeksman/core-ui';
import { Search, Plus, Trash2, Tag, Layers, ChevronDown, Check, X, ShieldAlert } from 'lucide-react';

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

const EMPTY_VARIANT: Variant = {
  name: '',
  sku_code: '',
  price: 0,
  min_order_qty: 1,
  packings: [],
  media_paths: [],
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

export function ProductListDesktop({ products, searchVal, setSearchVal, loading, onRefresh }: DesktopProps) {
  const { showToast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imagePaths, setImagePaths] = useState<string[]>([]);

  // Variants and Attributes mapping states
  const [hasVariants, setHasVariants] = useState(false);
  const [attributesList, setAttributesList] = useState<any[]>([]);
  const [activeAttributeIds, setActiveAttributeIds] = useState<string[]>([]);
  const [bulkSelectedValues, setBulkSelectedValues] = useState<Record<string, string[]>>({});
  const [generatedVariants, setGeneratedVariants] = useState<Variant[]>([]);

  // Metadata dropdowns options
  const [brandsList, setBrandsList] = useState<Array<{ value: string; label: string }>>([]);
  const [categoriesList, setCategoriesList] = useState<Array<{ value: string; label: string }>>([]);
  const [groupsList, setGroupsList] = useState<Array<{ value: string; label: string }>>([]);

  const [isDirty, setIsDirty] = useState(false);

  // ─── Fetch Metadata ────────────────────────────────────────────────────────
  useEffect(() => {
    // Attributes
    apiClient.get('/catalogue/attributes', { params: { limit: 100 } })
      .then(res => { if (res.data?.data) setAttributesList(res.data.data); })
      .catch(err => console.error(err));

    // Brands
    apiClient.get('/catalogue/brands', { params: { limit: 100 } })
      .then(res => {
        const list = res.data?.data || [];
        setBrandsList(list.map((b: any) => ({ value: b.name, label: b.name })));
      })
      .catch(err => console.error(err));

    // Categories
    apiClient.get('/catalogue/categories', { params: { limit: 100 } })
      .then(res => {
        const list = res.data?.data || [];
        setCategoriesList(list.map((c: any) => ({ value: c.name, label: c.name })));
      })
      .catch(err => console.error(err));

    // Groups
    apiClient.get('/catalogue/groups', { params: { limit: 100 } })
      .then(res => {
        const list = res.data?.data || [];
        setGroupsList(list.map((g: any) => ({ value: g.name, label: g.name })));
      })
      .catch(err => console.error(err));
  }, []);

  // Combinations generator
  useEffect(() => {
    if (!hasVariants) {
      setGeneratedVariants([{ ...EMPTY_VARIANT }]);
      return;
    }

    const selectedAttrIds = Object.keys(bulkSelectedValues).filter(id =>
      activeAttributeIds.includes(id) && bulkSelectedValues[id] && bulkSelectedValues[id].length > 0
    );

    if (selectedAttrIds.length === 0) {
      setGeneratedVariants([]);
      return;
    }

    const combine = (index: number, current: Array<{ attrId: number; valId: number; attrName: string; valText: string }>) => {
      if (index === selectedAttrIds.length) {
        const attrTexts = current.map(c => `${c.attrName}: ${c.valText}`);
        const variantName = `${name || 'Product'} (${current.map(c => c.valText).join(' / ')})`;
        const attrMap: Record<number, number> = {};
        current.forEach(c => { attrMap[c.attrId] = c.valId; });

        const skuSuffix = current.map(c => c.valText.substring(0, 3).toUpperCase().replace(/\s+/g, '')).join('-');
        const defaultSku = `${name ? name.substring(0, 3).toUpperCase() : 'SKU'}-${skuSuffix}`;

        return [{
          name: variantName,
          sku_code: defaultSku,
          price: 0,
          min_order_qty: 1,
          packings: [],
          media_paths: [],
          attributes: attrMap,
          attrTexts
        }];
      }

      const attrId = selectedAttrIds[index];
      const attrObj = attributesList.find(a => String(a.id) === attrId);
      const attrName = attrObj ? attrObj.name : 'Attr';
      const valIds = bulkSelectedValues[attrId];

      let results: any[] = [];
      valIds.forEach(vId => {
        const valObj = attrObj ? attrObj.values?.find((v: any) => String(v.id) === vId) : null;
        const valText = valObj ? valObj.value : 'Val';
        results = results.concat(combine(index + 1, [...current, { attrId: Number(attrId), valId: Number(vId), attrName, valText }]));
      });

      return results;
    };

    setGeneratedVariants(combine(0, []));
  }, [bulkSelectedValues, name, hasVariants, attributesList, activeAttributeIds]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setBrandName('');
    setCategory('');
    setIsActive(true);
    setImagePaths([]);
    setHasVariants(false);
    setActiveAttributeIds([]);
    setBulkSelectedValues({});
    setGeneratedVariants([{ ...EMPTY_VARIANT }]);
    setIsDirty(false);
    setIsOpen(true);
  };

  const openEdit = async (product: Product) => {
    setEditingProduct(product);
    setIsOpen(true);
    setLoadingState(true);
    try {
      const res: any = await apiClient.get(`/rfq/vendor-products/${product.id}`);
      const d = res.data?.data || product;
      setName(d.name || '');
      setDescription(d.description || '');
      setBrandName(d.brand_name || '');
      setCategory(d.category || '');
      setIsActive(d.is_active ?? true);
      setImagePaths(d.media_paths || []);
      
      if (d.variants && d.variants.length > 0) {
        // Detect if variant attributes exist
        const hasAttr = d.variants.some((v: any) => v.attributes && Object.keys(v.attributes).length > 0);
        setHasVariants(hasAttr);
        if (hasAttr) {
          const newBulkSelectedValues: Record<string, string[]> = {};
          const newActiveAttrIds = new Set<string>();
          d.variants.forEach((v: any) => {
            if (v.attributes) {
              Object.entries(v.attributes).forEach(([attrId, valId]) => {
                newActiveAttrIds.add(String(attrId));
                if (!newBulkSelectedValues[attrId]) newBulkSelectedValues[attrId] = [];
                if (!newBulkSelectedValues[attrId].includes(String(valId))) {
                  newBulkSelectedValues[attrId].push(String(valId));
                }
              });
            }
          });
          setActiveAttributeIds(Array.from(newActiveAttrIds));
          setBulkSelectedValues(newBulkSelectedValues);
        }
        setGeneratedVariants(d.variants.map((v: any) => ({
          id: v.id,
          name: v.name || '',
          sku_code: v.sku_code || '',
          price: v.price || 0,
          min_order_qty: v.min_order_qty || 1,
          packings: v.packings || [],
          media_paths: v.media_paths || [],
        })));
      } else {
        setHasVariants(false);
        setGeneratedVariants([{ ...EMPTY_VARIANT }]);
      }
    } catch {
      showToast('Error loading details', 'error');
    } finally {
      setLoadingState(false);
    }
  };

  const [loadingState, setLoadingState] = useState(false);

  const closeSidebar = () => {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    setIsOpen(false);
    setEditingProduct(null);
    setIsDirty(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { showToast('Product name is required', 'error'); return; }

    const payload = {
      name,
      description,
      brand_name: brandName,
      category,
      is_active: isActive,
      media_paths: imagePaths,
      variants: generatedVariants.map(v => ({
        ...(v.id ? { id: v.id } : {}),
        name: v.name,
        sku_code: v.sku_code,
        price: Number(v.price),
        min_order_qty: Number(v.min_order_qty),
        packings: v.packings || [],
        media_paths: v.media_paths || [],
      })),
    };

    setSaving(true);
    try {
      if (editingProduct) {
        await apiClient.put(`/rfq/vendor-products/${editingProduct.id}`, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await apiClient.post('/rfq/vendor-products', payload);
        showToast('Product created successfully', 'success');
      }
      setIsDirty(false);
      setIsOpen(false);
      onRefresh();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVariantFieldChange = (idx: number, key: keyof Variant, value: any) => {
    setGeneratedVariants(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
    setIsDirty(true);
  };

  const resolveMediaUrl = (url?: string) => {
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
      console.error(e);
    }
    return url;
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
        <Button onClick={openCreate} variant="primary">
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
          <Button onClick={openCreate} variant="secondary">Add First Product</Button>
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
                    <Button onClick={() => openEdit(product)} variant="secondary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem' }}>Edit</Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-In Sidebar */}
      {isOpen && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', zIndex: 999 }} onClick={closeSidebar} />
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '640px', maxWidth: '95vw', backgroundColor: '#ffffff', boxShadow: '-8px 0 40px rgba(0,0,0,0.18)', zIndex: 1000, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.26s cubic-bezier(0.22,1,0.36,1)', overflowY: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>Catalogue details configuration</span>
              </div>
              <button onClick={closeSidebar} style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#f3f4f6', border: 'none', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleSave} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <FieldLabel label="Product Name" required />
                <input style={inputStyle} value={name} required onChange={e => { setName(e.target.value); setIsDirty(true); }} placeholder="Product name..." />

                <FieldLabel label="Description" />
                <textarea style={{ ...inputStyle, minHeight: '60px' }} value={description} onChange={e => { setDescription(e.target.value); setIsDirty(true); }} placeholder="Description..." />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <FieldLabel label="Brand" />
                    <Select value={brandName} onChange={val => { setBrandName(String(val)); setIsDirty(true); }} options={brandsList} placeholder="Select Brand" />
                  </div>
                  <div>
                    <FieldLabel label="Category" />
                    <Select value={category} onChange={val => { setCategory(String(val)); setIsDirty(true); }} options={categoriesList} placeholder="Select Category" />
                  </div>
                </div>

                {/* Image Upload Component */}
                <div>
                  <FieldLabel label="Product Images" />
                  <ImageUpload folder="products" value={imagePaths} onChange={paths => { setImagePaths(paths); setIsDirty(true); }} multiple maxFiles={5} />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={isActive} onChange={e => { setIsActive(e.target.checked); setIsDirty(true); }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Listing</span>
                </label>
              </div>

              {/* Variant Toggler */}
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '1rem' }}>
                  <input type="checkbox" checked={hasVariants} onChange={e => { setHasVariants(e.target.checked); setIsDirty(true); }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4f46e5' }}>This product has variants / multiple SKUs</span>
                </label>

                {hasVariants && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <FieldLabel label="Select Active Attributes to generate variants" />
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {attributesList.map(attr => {
                        const active = activeAttributeIds.includes(String(attr.id));
                        return (
                          <button
                            key={attr.id}
                            type="button"
                            onClick={() => {
                              setActiveAttributeIds(prev => active ? prev.filter(id => id !== String(attr.id)) : [...prev, String(attr.id)]);
                              setIsDirty(true);
                            }}
                            style={{
                              padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                              border: active ? '1.5px solid #4f46e5' : '1.5px solid #cbd5e1',
                              backgroundColor: active ? '#eff6ff' : '#ffffff',
                              color: active ? '#4f46e5' : '#475569'
                            }}
                          >
                            {attr.name}
                          </button>
                        );
                      })}
                    </div>

                    {/* Value Selector per Attribute */}
                    {activeAttributeIds.map(attrId => {
                      const attrObj = attributesList.find(a => String(a.id) === attrId);
                      if (!attrObj) return null;
                      const selectedVals = bulkSelectedValues[attrId] || [];
                      return (
                        <div key={attrId} style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.5rem' }}>{attrObj.name} Values:</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {attrObj.values?.map((v: any) => {
                              const valActive = selectedVals.includes(String(v.id));
                              return (
                                <button
                                  key={v.id}
                                  type="button"
                                  onClick={() => {
                                    setBulkSelectedValues(prev => {
                                      const next = { ...prev };
                                      if (!next[attrId]) next[attrId] = [];
                                      next[attrId] = valActive ? next[attrId].filter(id => id !== String(v.id)) : [...next[attrId], String(v.id)];
                                      return next;
                                    });
                                    setIsDirty(true);
                                  }}
                                  style={{
                                    padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
                                    border: valActive ? '1px solid #10b981' : '1px solid #cbd5e1',
                                    backgroundColor: valActive ? '#ecfdf5' : '#ffffff',
                                    color: valActive ? '#059669' : '#64748b'
                                  }}
                                >
                                  {v.value}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Generated Variant Rows */}
                {generatedVariants.length > 0 && (
                  <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800 }}>Generated SKU Configuration ({generatedVariants.length})</h4>
                    {generatedVariants.map((v, idx) => (
                      <div key={idx} style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4f46e5' }}>{v.name || `Variant #${idx + 1}`}</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div>
                            <FieldLabel label="SKU Code" required />
                            <input style={{ ...inputStyle, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} value={v.sku_code} onChange={e => handleVariantFieldChange(idx, 'sku_code', e.target.value)} required />
                          </div>
                          <div>
                            <FieldLabel label="Price (₹)" required />
                            <input type="number" min={0} step="0.01" style={{ ...inputStyle, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} value={v.price} onChange={e => handleVariantFieldChange(idx, 'price', Number(e.target.value))} required />
                          </div>
                          <div>
                            <FieldLabel label="Min Order Qty" required />
                            <input type="number" min={1} style={{ ...inputStyle, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} value={v.min_order_qty} onChange={e => handleVariantFieldChange(idx, 'min_order_qty', Number(e.target.value))} required />
                          </div>
                          <div>
                            <FieldLabel label="Variant Image" />
                            <ImageUpload folder="variants" value={v.media_paths || []} onChange={paths => handleVariantFieldChange(idx, 'media_paths', paths)} maxFiles={1} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </form>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f3f4f6', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', backgroundColor: '#ffffff', flexShrink: 0 }}>
              <Button variant="secondary" onClick={closeSidebar}>Cancel</Button>
              <Button variant="primary" onClick={handleSave as any} disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
