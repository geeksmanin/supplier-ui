import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient, Button, useToast, Select, ImageUpload } from '@geeksman/core-ui';
import { ChevronLeft, Tag, Layers, Plus } from 'lucide-react';

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
  fontSize: '0.9rem',
  color: '#1f2937',
  backgroundColor: '#ffffff',
  outline: 'none',
  transition: 'border-color 0.15s',
  boxSizing: 'border-box',
};

const FieldLabel: React.FC<{ label: string; required?: boolean }> = ({ label, required }) => (
  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '0.35rem', textAlign: 'left' }}>
    {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
  </label>
);

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const isEdit = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imagePaths, setImagePaths] = useState<string[]>([]);

  // Variants & Attributes states
  const [hasVariants, setHasVariants] = useState(false);
  const [attributesList, setAttributesList] = useState<any[]>([]);
  const [activeAttributeIds, setActiveAttributeIds] = useState<string[]>([]);
  const [bulkSelectedValues, setBulkSelectedValues] = useState<Record<string, string[]>>({});
  const [generatedVariants, setGeneratedVariants] = useState<Variant[]>([]);

  // Metadata dropdowns
  const [brandsList, setBrandsList] = useState<Array<{ value: string; label: string }>>([]);
  const [categoriesList, setCategoriesList] = useState<Array<{ value: string; label: string }>>([]);

  // Fetch metadata
  useEffect(() => {
    apiClient.get('/catalogue/attributes', { params: { limit: 100 } })
      .then(res => { if (res.data?.data) setAttributesList(res.data.data); });

    apiClient.get('/catalogue/brands', { params: { limit: 100 } })
      .then(res => setBrandsList((res.data?.data || []).map((b: any) => ({ value: b.name, label: b.name }))));

    apiClient.get('/catalogue/categories', { params: { limit: 100 } })
      .then(res => setCategoriesList((res.data?.data || []).map((c: any) => ({ value: c.name, label: c.name }))));
  }, []);

  // Fetch product if editing
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient
      .get(`/rfq/vendor-products/${id}`)
      .then((res: any) => {
        const d = res.data?.data;
        if (!d) return;
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

        if (d.variants && d.variants.length > 0) {
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
          setGeneratedVariants([{ ...EMPTY_VARIANT }]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Variant generator combinations builder
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

  const handleVariantFieldChange = (idx: number, key: keyof Variant, value: any) => {
    setGeneratedVariants(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [key]: value };
      return copy;
    });
    setIsDirty(true);
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
      if (isEdit) {
        await apiClient.put(`/rfq/vendor-products/${id}`, payload);
        showToast('Product updated successfully', 'success');
      } else {
        await apiClient.post('/rfq/vendor-products', payload);
        showToast('Product created successfully', 'success');
      }
      setIsDirty(false);
      navigate(`/products?${searchParams.toString()}`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (isDirty && !window.confirm('Discard unsaved changes?')) return;
    navigate(`/products?${searchParams.toString()}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ border: '3px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '50%', width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem 2rem', fontFamily: '"Outfit", "Inter", sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', textAlign: 'left' }}>
      {/* Sticky Action Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#ffffff',
        margin: '-1.5rem -2rem 1.5rem -2rem', padding: '1rem 2rem',
        borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={handleBack} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            <ChevronLeft size={16} /> Back
          </button>
          <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0' }} />
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {isEdit ? 'Edit Product' : 'Create New Product'}
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={handleBack}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>

      <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Basic Details Section */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            Basic Information
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '480px' }}>
            <FieldLabel label="Product Name" required />
            <input style={inputStyle} value={name} onChange={e => { setName(e.target.value); setIsDirty(true); }} placeholder="e.g. Paracetamol 500mg" required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxWidth: '480px' }}>
            <FieldLabel label="Description" />
            <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} value={description} onChange={e => { setDescription(e.target.value); setIsDirty(true); }} placeholder="Provide product description..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '480px' }}>
            <div>
              <FieldLabel label="Brand" />
              <Select value={brandName} onChange={val => { setBrandName(String(val)); setIsDirty(true); }} options={brandsList} placeholder="Select Brand" />
            </div>
            <div>
              <FieldLabel label="Category" />
              <Select value={category} onChange={val => { setCategory(String(val)); setIsDirty(true); }} options={categoriesList} placeholder="Select Category" />
            </div>
          </div>

          <div style={{ maxWidth: '480px' }}>
            <FieldLabel label="Product Images" />
            <ImageUpload folder="products" value={imagePaths} onChange={paths => { setImagePaths(paths); setIsDirty(true); }} multiple maxFiles={5} />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', width: 'fit-content' }}>
            <input type="checkbox" checked={isActive} onChange={e => { setIsActive(e.target.checked); setIsDirty(true); }} style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>Active Listing (Visible to buyers)</span>
          </label>
        </div>

        {/* Variant Config Section */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
            Variants Configuration
          </h3>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
            <input type="checkbox" checked={hasVariants} onChange={e => { setHasVariants(e.target.checked); setIsDirty(true); }} style={{ width: '16px', height: '16px', accentColor: '#3b82f6' }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#4f46e5' }}>This product has variants (multiple sizes, configurations, etc.)</span>
          </label>

          {hasVariants ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                        color: active ? '#4f46e5' : '#475569',
                        transition: 'all 0.15s'
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
                  <div key={attrId} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '0.6rem' }}>{attrObj.name} Values:</span>
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
                              padding: '0.25rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer',
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

              {generatedVariants.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Generated SKUs ({generatedVariants.length})</h4>
                  {generatedVariants.map((v, idx) => (
                    <div key={idx} style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#4f46e5' }}>{v.name || `Variant #${idx + 1}`}</span>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                          <FieldLabel label="SKU Code" required />
                          <input style={{ ...inputStyle, padding: '0.5rem' }} value={v.sku_code} onChange={e => handleVariantFieldChange(idx, 'sku_code', e.target.value)} required />
                        </div>
                        <div>
                          <FieldLabel label="Unit Price (₹)" required />
                          <input type="number" min={0} step="0.01" style={{ ...inputStyle, padding: '0.5rem' }} value={v.price} onChange={e => handleVariantFieldChange(idx, 'price', Number(e.target.value))} required />
                        </div>
                        <div>
                          <FieldLabel label="Min Order Qty" required />
                          <input type="number" min={1} style={{ ...inputStyle, padding: '0.5rem' }} value={v.min_order_qty} onChange={e => handleVariantFieldChange(idx, 'min_order_qty', Number(e.target.value))} required />
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
          ) : (
            // Single SKU / No variants configuration fields
            generatedVariants.map((v, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '480px' }}>
                <div>
                  <FieldLabel label="SKU Code" required />
                  <input style={inputStyle} value={v.sku_code} onChange={e => handleVariantFieldChange(idx, 'sku_code', e.target.value)} required />
                </div>
                <div>
                  <FieldLabel label="Unit Price (₹)" required />
                  <input type="number" min={0} step="0.01" style={inputStyle} value={v.price} onChange={e => handleVariantFieldChange(idx, 'price', Number(e.target.value))} required />
                </div>
                <div>
                  <FieldLabel label="Min Order Qty" required />
                  <input type="number" min={1} style={inputStyle} value={v.min_order_qty} onChange={e => handleVariantFieldChange(idx, 'min_order_qty', Number(e.target.value))} required />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
