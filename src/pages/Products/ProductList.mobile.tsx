import React, { useState, useEffect } from 'react';
import { apiClient, Button, useToast, Select, ImageUpload } from '@geeksman/core-ui';
import { Search, Plus, Trash2, Tag, Layers } from 'lucide-react';

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

const EMPTY_VARIANT: Variant = {
  name: '',
  sku_code: '',
  price: 0,
  min_order_qty: 1,
  packings: [],
  media_paths: [],
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.8rem',
  border: '1.5px solid #e2e8f0',
  borderRadius: '8px',
  fontSize: '0.95rem',
  boxSizing: 'border-box',
};

export function ProductListMobile({ products, searchVal, setSearchVal, loading, onRefresh }: MobileProps) {
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

  const [isDirty, setIsDirty] = useState(false);

  // ─── Fetch Metadata ────────────────────────────────────────────────────────
  useEffect(() => {
    apiClient.get('/catalogue/attributes', { params: { limit: 100 } })
      .then(res => { if (res.data?.data) setAttributesList(res.data.data); });

    apiClient.get('/catalogue/brands', { params: { limit: 100 } })
      .then(res => setBrandsList((res.data?.data || []).map((b: any) => ({ value: b.name, label: b.name }))));

    apiClient.get('/catalogue/categories', { params: { limit: 100 } })
      .then(res => setCategoriesList((res.data?.data || []).map((c: any) => ({ value: c.name, label: c.name }))));
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
    try {
      const res: any = await apiClient.get(`/rfq/vendor-products/${product.id}`);
      const d = res.data?.data || product;
      setName(d.name || '');
      setDescription(d.description || '');
      setBrandName(d.brand_name || '');
      setCategory(d.category || '');
      setIsActive(d.is_active ?? true);
      setImagePaths(d.media_paths || []);
      
      const hasAttr = d.variants?.some((v: any) => v.attributes && Object.keys(v.attributes).length > 0);
      setHasVariants(hasAttr);
      if (hasAttr && d.variants) {
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
      setGeneratedVariants(d.variants?.map((v: any) => ({
        id: v.id,
        name: v.name || '',
        sku_code: v.sku_code || '',
        price: v.price || 0,
        min_order_qty: v.min_order_qty || 1,
        packings: v.packings || [],
        media_paths: v.media_paths || [],
      })) || [{ ...EMPTY_VARIANT }]);
    } catch {
      showToast('Error loading details', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { showToast('Name is required', 'error'); return; }

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
      } else {
        await apiClient.post('/rfq/vendor-products', payload);
      }
      showToast('Success', 'success');
      setIsOpen(false);
      onRefresh();
    } catch {
      showToast('Error saving product', 'error');
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
  };

  const resolveMediaUrl = (url?: string) => {
    if (!url) return '/assets/pharmaceutical-placeholder-premium.png';
    const idx = url.indexOf('/api/v1/media/');
    if (idx !== -1 && apiClient.defaults.baseURL) {
      return `${apiClient.defaults.baseURL.replace(/\/+$/, '')}${url.substring(idx).replace('/api/v1', '')}`;
    }
    return url;
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Product Catalogue</h2>
        <Button onClick={openCreate} variant="primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>+ Add</Button>
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
                  <Button onClick={() => openEdit(p)} variant="secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Edit</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Creation Overlay */}
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#ffffff', zIndex: 1001, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <button onClick={() => setIsOpen(false)} style={{ border: 'none', background: 'transparent', fontSize: '1.5rem' }}>&times;</button>
          </div>

          <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input placeholder="Product name..." style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
            <textarea placeholder="Description..." style={{ ...inputStyle, minHeight: '60px' }} value={description} onChange={e => setDescription(e.target.value)} />
            <Select value={brandName} onChange={val => setBrandName(String(val))} options={brandsList} placeholder="Brand" />
            <Select value={category} onChange={val => setCategory(String(val))} options={categoriesList} placeholder="Category" />
            
            <ImageUpload folder="products" value={imagePaths} onChange={paths => setImagePaths(paths)} multiple maxFiles={3} />

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={hasVariants} onChange={e => setHasVariants(e.target.checked)} />
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Has Variants</span>
            </label>

            {hasVariants && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Active attributes:</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {attributesList.map(attr => {
                    const active = activeAttributeIds.includes(String(attr.id));
                    return (
                      <button
                        key={attr.id}
                        type="button"
                        onClick={() => setActiveAttributeIds(prev => active ? prev.filter(id => id !== String(attr.id)) : [...prev, String(attr.id)])}
                        style={{
                          padding: '0.3rem 0.6rem', borderRadius: '15px', fontSize: '0.75rem',
                          border: active ? '1px solid #4f46e5' : '1px solid #cbd5e1',
                          backgroundColor: active ? '#eff6ff' : '#ffffff'
                        }}
                      >
                        {attr.name}
                      </button>
                    );
                  })}
                </div>

                {activeAttributeIds.map(attrId => {
                  const attrObj = attributesList.find(a => String(a.id) === attrId);
                  if (!attrObj) return null;
                  const selectedVals = bulkSelectedValues[attrId] || [];
                  return (
                    <div key={attrId} style={{ backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{attrObj.name} values:</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
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
                              }}
                              style={{
                                padding: '0.2rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem',
                                border: valActive ? '1px solid #10b981' : '1px solid #cbd5e1',
                                backgroundColor: valActive ? '#ecfdf5' : '#ffffff'
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

            {generatedVariants.map((v, idx) => (
              <div key={idx} style={{ padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f9f9f9', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5' }}>{v.name || `Variant #${idx + 1}`}</span>
                <input placeholder="SKU Code" style={{ ...inputStyle, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} value={v.sku_code} onChange={e => handleVariantFieldChange(idx, 'sku_code', e.target.value)} />
                <input type="number" placeholder="Price" style={{ ...inputStyle, padding: '0.4rem 0.6rem', fontSize: '0.8rem' }} value={v.price || ''} onChange={e => handleVariantFieldChange(idx, 'price', Number(e.target.value))} />
                <ImageUpload folder="variants" value={v.media_paths || []} onChange={paths => handleVariantFieldChange(idx, 'media_paths', paths)} maxFiles={1} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px', padding: '1rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', position: 'sticky', bottom: 0 }}>
            <Button variant="secondary" onClick={() => setIsOpen(false)} style={{ flex: 1 }}>Cancel</Button>
            <Button variant="primary" onClick={handleSave as any} style={{ flex: 1 }}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}
