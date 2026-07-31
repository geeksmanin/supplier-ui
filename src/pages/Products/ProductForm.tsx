import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { apiClient, Button, useToast, Select } from '@geeksman/core-ui';

interface VariantForm {
  id?: number;
  name: string;
  sku_code: string;
  price: number;
  min_order_qty: number;
  packings: string; // JSON string input
}

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<VariantForm[]>([
    { name: '', sku_code: '', price: 0, min_order_qty: 1, packings: '[]' }
  ]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiClient
      .get(`/rfq/vendor-products/${id}`)
      .then((res: any) => {
        const data = res.data.data;
        setName(data.name);
        setDescription(data.description || '');
        setBrandName(data.brand_name || '');
        setCategory(data.category || '');
        setIsActive(data.is_active);
        if (data.variants && data.variants.length > 0) {
          setVariants(
            data.variants.map((v: any) => ({
              id: v.id,
              name: v.name,
              sku_code: v.sku_code,
              price: v.price,
              min_order_qty: v.min_order_qty,
              packings: JSON.stringify(v.packings || []),
            }))
          );
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  // Dirty form window listener
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleBack = () => {
    if (isDirty && !window.confirm('Discard unsaved changes?')) {
      return;
    }
    navigate(`/products?${searchParams.toString()}`);
  };

  const handleAddVariant = () => {
    setVariants((prev) => [
      ...prev,
      { name: '', sku_code: '', price: 0, min_order_qty: 1, packings: '[]' }
    ]);
    setIsDirty(true);
  };

  const handleVariantChange = (index: number, field: keyof VariantForm, value: any) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    setIsDirty(true);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      showToast('Product name is required', 'error');
      return;
    }

    // Map and validate variants
    const processedVariants = [];
    for (const v of variants) {
      if (!v.name || !v.sku_code) {
        showToast('Variant name and SKU code are required', 'error');
        return;
      }
      let packingsArr = [];
      try {
        packingsArr = JSON.parse(v.packings || '[]');
      } catch (err) {
        showToast(`Invalid packings JSON for variant ${v.name}`, 'error');
        return;
      }
      processedVariants.push({
        id: v.id,
        name: v.name,
        sku_code: v.sku_code,
        price: Number(v.price),
        min_order_qty: Number(v.min_order_qty),
        packings: packingsArr,
      });
    }

    const payload = {
      vendor_id: 'vendor-uuid-111', // In real app, resolved from auth context
      name,
      description,
      brand_name: brandName,
      category,
      is_active: isActive,
      variants: processedVariants,
    };

    try {
      if (id) {
        await apiClient.put(`/rfq/vendor-products/${id}`, payload);
        showToast('Product updated successfully', 'success');
      } else {
        const res: any = await apiClient.post('/rfq/vendor-products', payload);
        const newId = res.data.data.id;
        searchParams.set('highlightedId', String(newId));
      }
      setIsDirty(false);
      navigate(`/products?${searchParams.toString()}`);
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6 sticky top-0 bg-slate-900 z-10">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            {id ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleBack} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="primary">
            Save Product
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-[800px] space-y-6">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-slate-200">Basic Information</h2>
          
          <div className="flex flex-col gap-2 max-w-[480px]">
            <label className="text-sm font-semibold text-slate-400">Product Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setIsDirty(true);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
              placeholder="e.g. Paracetamol 500mg"
              required
            />
          </div>

          <div className="flex flex-col gap-2 max-w-[480px]">
            <label className="text-sm font-semibold text-slate-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setIsDirty(true);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500 min-h-[100px]"
              placeholder="Provide product details..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[480px]">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-400">Brand Name</label>
              <input
                type="text"
                value={brandName}
                onChange={(e) => {
                  setBrandName(e.target.value);
                  setIsDirty(true);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="e.g. MediCorp"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-400">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setIsDirty(true);
                }}
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                placeholder="e.g. Analgesics"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => {
                setIsActive(e.target.checked);
                setIsDirty(true);
              }}
              className="rounded bg-slate-900 border-slate-700 text-blue-500 focus:ring-blue-500 focus:ring-offset-slate-900"
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-slate-300">
              Active Listing
            </label>
          </div>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200">Product Variants</h2>
            <Button onClick={handleAddVariant} variant="secondary">
              + Add Variant
            </Button>
          </div>

          {variants.map((v, index) => (
            <div key={index} className="border-t border-slate-700/50 pt-4 mt-4 first:border-0 first:pt-0 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-blue-400">Variant #{index + 1}</span>
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    className="text-red-400 hover:text-red-300 text-sm transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400">Variant Name *</label>
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="e.g. Box of 100"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400">SKU Code *</label>
                  <input
                    type="text"
                    value={v.sku_code}
                    onChange={(e) => handleVariantChange(index, 'sku_code', e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                    placeholder="e.g. VND-PARA-100"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={v.price}
                    onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-400">Min Order Qty *</label>
                  <input
                    type="number"
                    value={v.min_order_qty}
                    onChange={(e) => handleVariantChange(index, 'min_order_qty', Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-400">Packings configuration (JSON Format)</label>
                <textarea
                  value={v.packings}
                  onChange={(e) => handleVariantChange(index, 'packings', e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-blue-500 text-sm font-mono min-h-[60px]"
                  placeholder='e.g. [{"unit": "Box", "quantity": 100}]'
                />
              </div>
            </div>
          ))}
        </div>
      </form>
    </div>
  );
}
