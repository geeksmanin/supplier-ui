import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient, useToast } from '@geeksman/core-ui';
import {
  Search,
  Check,
  Plus,
  Minus,
  X,
  Layers,
  ChevronRight,
  Heart,
  ClipboardList,
  ShoppingCart,
  SlidersHorizontal
} from 'lucide-react';
import { CatalogDesktop } from './Catalog.desktop';
import { CatalogMobile } from './Catalog.mobile';

const resolveImageUrl = (url?: string) => {
  if (!url) return "/assets/pharmaceutical-placeholder-premium.png";
  try {
    const idx = url.indexOf('/api/v1/media/');
    if (idx !== -1 && apiClient.defaults.baseURL) {
      const mediaPath = url.substring(idx);
      const pathAfterV1 = mediaPath.replace('/api/v1', '');
      const base = apiClient.defaults.baseURL.replace(/\/+$/, '');
      return `${base}${pathAfterV1}`;
    }
  } catch (e) {
    console.error("Error resolving image URL:", e);
  }
  return url;
};

interface Variant {
  id: string;
  sku_code: string;
  price: number;
  sale_price: number;
  mrp: number;
  attributes?: Array<{ attribute_name: string; value: string }>;
  media_paths?: string[];
  packings?: Array<{ name: string; size: number; is_default: boolean; remarks?: string }>;
}

interface Product {
  id: string;
  name: string;
  description: string;
  brand_id?: number;
  category_id?: number;
  variants?: Variant[];
  media_paths?: string[];
  product_type?: string;
  packings?: Array<{ name: string; size: number; is_default: boolean; remarks?: string }>;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

export const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isWishlistPage = location.pathname === '/wishlist';
  const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth > 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileCategoryModal, setShowMobileCategoryModal] = useState(false);
  const { showToast } = useToast();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [cardSelectedVariants, setCardSelectedVariants] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const [wishlist, setWishlist] = useState<string[]>([]);
  const [enquiryCart, setEnquiryCart] = useState<Array<{ id: string; quantity: number; price: number; product_id?: string; variant_id?: string }>>([]);
  const [orderCart, setOrderCart] = useState<Array<{ id: string; quantity: number; price: number; product_id?: string; variant_id?: string }>>([]);

  const loadLocalStates = () => {
    try {
      const localWishlist = JSON.parse(localStorage.getItem('customer_wishlist') || '[]');
      setWishlist(localWishlist.map((id: any) => String(id)));
      setEnquiryCart(JSON.parse(localStorage.getItem('customer_enquiry_cart') || '[]'));
      setOrderCart(JSON.parse(localStorage.getItem('customer_order_cart') || '[]'));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await apiClient.get('/sales/customer/wishlist');
      const items = res.data?.data || [];
      const productIds = items.map((item: any) => String(item.product_id));
      setWishlist(productIds);
      localStorage.setItem('customer_wishlist', JSON.stringify(productIds));
    } catch (e) {
      console.error("Failed to fetch wishlist:", e);
    }
  };

  useEffect(() => {
    loadLocalStates();
    fetchWishlist();

    const handleSearch = (e: Event) => {
      setSearch((e as CustomEvent).detail || '');
    };

    const handleCartUpdate = () => {
      loadLocalStates();
    };

    window.addEventListener('customer-catalog-search', handleSearch);
    window.addEventListener('customer-cart-update', handleCartUpdate);

    return () => {
      window.removeEventListener('customer-catalog-search', handleSearch);
      window.removeEventListener('customer-cart-update', handleCartUpdate);
    };
  }, []);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = async (pageNum = 1, shouldOverlayLoading = true) => {
    if (pageNum === 1 && shouldOverlayLoading) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const activeCustId = localStorage.getItem('active_customer_id');
      const limit = 250;
      const params: Record<string, any> = {
        page: pageNum,
        limit,
        search: search || undefined,
        customer_id: activeCustId || undefined
      };

      const endpoint = '/catalogue/products';

      const res = await apiClient.get(endpoint, { params });
      const newProds: Product[] = res.data?.data || res.data || [];

      if (pageNum === 1) {
        setProducts(newProds);
      } else {
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const unique = newProds.filter(p => !existingIds.has(p.id));
          return [...prev, ...unique];
        });
      }
      setPage(pageNum);
      setHasMore(newProds.length === limit);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to fetch catalog items.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(1, true);
  }, [search, isWishlistPage]);

  const handleQtyChange = (variantId: string, val: number) => {
    setQuantities(prev => ({
      ...prev,
      [variantId]: Math.max(0, val)
    }));
  };

  // Filtered lists
  const filteredProducts = useMemo(() => {
    let result = products;
    if (isWishlistPage) {
      result = result.filter(product => wishlist.includes(String(product.id)));
    }
    if (selectedCategories.length > 0) {
      result = result.filter(product => product.category_id && selectedCategories.includes(String(product.category_id)));
    }
    return result;
  }, [products, isWishlistPage, wishlist, selectedCategories]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categories, categorySearch]);

  const toggleSelectProduct = (productIdRaw: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const productId = String(productIdRaw);
    setSelectedProductIds(prev => {
      const stringifiedPrev = prev.map(id => String(id));
      return stringifiedPrev.includes(productId)
        ? stringifiedPrev.filter(id => id !== productId)
        : [...stringifiedPrev, productId];
    });
  };

  const handleSelectAll = () => {
    const stringifiedSelected = selectedProductIds.map(id => String(id));
    if (stringifiedSelected.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => String(p.id)));
    }
  };

  // Badge updates
  const toggleWishlist = async (productIdRaw: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const productId = String(productIdRaw);
    let newWishlist = [...wishlist].map(id => String(id));
    if (newWishlist.includes(productId)) {
      newWishlist = newWishlist.filter(id => String(id) !== productId);
      setWishlist(newWishlist);
      localStorage.setItem('customer_wishlist', JSON.stringify(newWishlist));
      window.dispatchEvent(new Event('customer-cart-update'));
      try {
        await apiClient.delete(`/sales/customer/wishlist/${productId}`);
        showToast('Removed from Wishlist', 'success');
      } catch (err) {
        console.error(err);
        showToast('Failed to sync wishlist removal', 'error');
      }
    } else {
      newWishlist.push(productId);
      setWishlist(newWishlist);
      localStorage.setItem('customer_wishlist', JSON.stringify(newWishlist));
      window.dispatchEvent(new Event('customer-cart-update'));
      try {
        await apiClient.post('/sales/customer/wishlist', { product_id: productId });
        showToast('Added to Wishlist', 'success');
      } catch (err) {
        console.error(err);
        showToast('Failed to sync wishlist addition', 'error');
      }
    }
  };



  const handleDirectOrder = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const selectedVariantId = cardSelectedVariants[product.id] || product.variants?.[0]?.id;
    const currentVariant = product.variants?.find(v => String(v.id) === String(selectedVariantId)) || product.variants?.[0];
    if (!currentVariant) return;
    const price = currentVariant.sale_price || currentVariant.price || 0;

    let newCart = [...orderCart];
    const existingIdx = newCart.findIndex(item =>
      String(item.variant_id) === String(currentVariant.id)
    );
    if (existingIdx > -1) {
      newCart = newCart.filter((_, idx) => idx !== existingIdx);
      showToast('Removed from Shopping Cart', 'success');
    } else {
      const packings = currentVariant.packings || product.packings || [];
      let initialQty = 1;
      if (Array.isArray(packings) && packings.length > 0) {
        const defaultPkg = packings.find((p: any) => p.is_default) || packings[0];
        initialQty = defaultPkg && defaultPkg.size > 0 ? defaultPkg.size : 1;
      }

      newCart.push({
        id: String(currentVariant.id),
        product_id: String(product.id),
        variant_id: String(currentVariant.id),
        quantity: initialQty,
        price
      });
      showToast('Added to Shopping Cart!', 'success');
    }
    localStorage.setItem('customer_order_cart', JSON.stringify(newCart));
    setOrderCart(newCart);
    window.dispatchEvent(new Event('customer-cart-update'));
  };

  const handleUpdateCartQty = (variantIdRaw: string, productIdRaw: string, qty: number, price: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const variantId = String(variantIdRaw);
    const productId = String(productIdRaw);

    let newCart = [...orderCart];
    const existingIdx = newCart.findIndex(item => String(item.variant_id) === variantId);

    if (qty <= 0) {
      if (existingIdx > -1) {
        newCart.splice(existingIdx, 1);
        showToast('Removed from Shopping Cart', 'success');
      }
    } else {
      if (existingIdx > -1) {
        newCart[existingIdx].quantity = qty;
      } else {
        newCart.push({
          id: variantId,
          product_id: productId,
          variant_id: variantId,
          quantity: qty,
          price: price
        });
        showToast('Added to Shopping Cart!', 'success');
      }
    }

    localStorage.setItem('customer_order_cart', JSON.stringify(newCart));
    setOrderCart(newCart);
    window.dispatchEvent(new Event('customer-cart-update'));
  };

  const toggleEnquiryCart = (product: Product, e: React.MouseEvent, variantId?: string) => {
    e.stopPropagation();
    const targetVariantId = variantId || cardSelectedVariants[product.id] || product.variants?.[0]?.id;
    const currentVariant = product.variants?.find(v => String(v.id) === String(targetVariantId)) || product.variants?.[0];
    if (!currentVariant) return;
    const price = currentVariant.sale_price || currentVariant.price || 0;

    let newCart = [...enquiryCart];
    const existing = newCart.find(item =>
      String(item.variant_id) === String(currentVariant.id)
    );
    if (existing) {
      newCart = newCart.filter(item =>
        String(item.variant_id) !== String(currentVariant.id)
      );
      showToast('Removed from Enquiry Cart', 'success');
    } else {
      newCart.push({
        id: String(currentVariant.id),
        product_id: String(product.id),
        variant_id: String(currentVariant.id),
        quantity: 1,
        price
      });
      showToast('Added to Enquiry Cart', 'success');
    }
    setEnquiryCart(newCart);
    localStorage.setItem('customer_enquiry_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('customer-cart-update'));
  };

  const handlePlaceOrder = async (targetLines?: any[]) => {
    const linesToSubmit = targetLines || (selectedProduct ? (selectedProduct.variants || [])
      .filter(v => (quantities[v.id] || 0) > 0)
      .map(v => ({
        product_id: selectedProduct.id,
        variant_id: v.id,
        sku: v.sku_code,
        product_name_snapshot: selectedProduct.name,
        quantity: quantities[v.id],
        price: v.sale_price || v.price || 0
      })) : []);

    if (linesToSubmit.length === 0) {
      showToast('Please select quantity for at least one item', 'warning');
      return;
    }

    try {
      const currentCart = JSON.parse(localStorage.getItem('customer_order_cart') || '[]');
      let newCart = [...currentCart];

      linesToSubmit.forEach(line => {
        const existingIdx = newCart.findIndex(item => String(item.id) === String(line.variant_id));
        if (existingIdx > -1) {
          newCart[existingIdx].quantity += line.quantity;
        } else {
          newCart.push({
            id: line.variant_id,
            product_id: line.product_id,
            variant_id: line.variant_id,
            quantity: line.quantity,
            price: line.price
          });
        }
      });

      localStorage.setItem('customer_order_cart', JSON.stringify(newCart));
      setOrderCart(newCart);
      window.dispatchEvent(new Event('customer-cart-update'));
      showToast('Added to Shopping Cart!', 'success');

      setSelectedProduct(null);
      setShowBulkModal(false);
      setQuantities({});
      setSelectedProductIds([]);
    } catch (err: any) {
      console.error(err);
      showToast('Failed to add to Shopping Cart', 'error');
    }
  };

  const handlePlaceEnquiry = async (targetLines?: any[]) => {
    const linesToSubmit = targetLines || (selectedProduct ? (selectedProduct.variants || [])
      .filter(v => (quantities[v.id] || 0) > 0)
      .map(v => ({
        product_id: selectedProduct.id,
        variant_id: v.id,
        quantity: quantities[v.id],
        price: v.sale_price || v.price || 0
      })) : []);

    if (linesToSubmit.length === 0) {
      showToast('Please select quantity for at least one item', 'warning');
      return;
    }

    try {
      const currentCart = JSON.parse(localStorage.getItem('customer_enquiry_cart') || '[]');
      let newCart = [...currentCart];

      linesToSubmit.forEach(line => {
        const existingIdx = newCart.findIndex(item => String(item.id) === String(line.variant_id));
        if (existingIdx > -1) {
          newCart[existingIdx].quantity += line.quantity;
        } else {
          newCart.push({
            id: line.variant_id,
            product_id: line.product_id,
            variant_id: line.variant_id,
            quantity: line.quantity,
            price: line.price
          });
        }
      });

      localStorage.setItem('customer_enquiry_cart', JSON.stringify(newCart));
      setEnquiryCart(newCart);
      window.dispatchEvent(new Event('customer-cart-update'));
      showToast('Added to Enquiry Cart!', 'success');

      setSelectedProduct(null);
      setShowBulkModal(false);
      setQuantities({});
      setSelectedProductIds([]);
    } catch (err: any) {
      console.error(err);
      showToast('Failed to add to Enquiry Cart', 'error');
    }
  };

  const bulkSelectedProducts = useMemo(() => {
    return products.filter(p => selectedProductIds.map(id => String(id)).includes(String(p.id)));
  }, [products, selectedProductIds]);

  const handlePlaceBulkOrder = (targetLines?: any[]) => {
    const lines: any[] = [];
    if (targetLines && targetLines.length > 0) {
      handlePlaceOrder(targetLines);
      return;
    }
    bulkSelectedProducts.forEach(p => {
      (p.variants || []).forEach(v => {
        const qty = quantities[v.id] || 0;
        if (qty > 0) {
          lines.push({
            product_id: p.id,
            variant_id: v.id,
            sku: v.sku_code,
            product_name_snapshot: p.name,
            quantity: qty,
            unit_price: v.sale_price || v.price || 0,
            line_total: qty * (v.sale_price || v.price || 0),
            company_id: '1'
          });
        }
      });
    });
    handlePlaceOrder(lines);
  };

  const handlePlaceBulkEnquiry = (targetLines?: any[]) => {
    const lines: any[] = [];
    if (targetLines && targetLines.length > 0) {
      handlePlaceEnquiry(targetLines);
      return;
    }
    bulkSelectedProducts.forEach(p => {
      (p.variants || []).forEach(v => {
        const qty = quantities[v.id] || 0;
        if (qty > 0) {
          lines.push({
            product_id: p.id,
            variant_id: v.id,
            quantity: qty,
            company_id: '1'
          });
        }
      });
    });
    handlePlaceEnquiry(lines);
  };

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/catalogue/categories', { params: { limit: 100 } });
      setCategories(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSingleProductEnquirySubmit = () => {
    handlePlaceEnquiry();
  };

  const handleSingleProductOrderSubmit = () => {
    handlePlaceOrder();
  };

  const props = {
    products,
    categories,
    filteredCategories,
    selectedCategories,
    setSelectedCategories,
    search,
    setSearch,
    categorySearch,
    setCategorySearch,
    loading,
    error,
    filteredProducts,
    selectedProductIds,
    toggleSelectProduct,
    wishlist,
    toggleWishlist,
    orderCart,
    handleDirectOrder,
    handleUpdateCartQty,
    cardSelectedVariants,
    setCardSelectedVariants,
    handleSelectAll,
    page,
    hasMore,
    loadingMore,
    fetchProducts,
    bulkSelectedProducts,
    setQuantities,
    quantities,
    setShowBulkModal,
    setSelectedProductIds,
    resolveImageUrl,
    navigate,
    showMobileCategoryModal,
    setShowMobileCategoryModal,
    enquiryCart,
    toggleEnquiryCart
  };

  return (
    <>
      {isDesktop ? <CatalogDesktop {...props} /> : <CatalogMobile {...props} />}

      {/* Product Details Modal */}
      {selectedProduct && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            {/* Hero Image Banner */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '240px',
              backgroundColor: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid #e2e8f0',
              flexShrink: 0,
              padding: '1.5rem',
              boxSizing: 'border-box'
            }}>
              <img
                src={resolveImageUrl(selectedProduct.media_paths?.[0] || selectedProduct.variants?.[0]?.media_paths?.[0])}
                alt={selectedProduct.name}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.06))'
                }}
              />
              <button
                onClick={() => setSelectedProduct(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'all 0.2s',
                  zIndex: 100
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.9)';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              ...styles.modalHeader,
              borderBottom: 'none',
              paddingBottom: '0.25rem'
            }}>
              <div>
                <h2 style={styles.modalTitle}>{selectedProduct.name}</h2>
                <p style={styles.modalSubtitle}>Configure product variants</p>
              </div>
            </div>

            {/* Fixed Price Container */}
            {selectedProduct.variants && selectedProduct.variants.length > 0 && (() => {
              const prices = selectedProduct.variants.map(v => v.sale_price || v.price || 0);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              const firstVariant = selectedProduct.variants[0];
              const mrp = firstVariant.mrp || 0;
              const salePrice = firstVariant.sale_price || firstVariant.price || 0;

              return (
                <div style={{
                  padding: !isDesktop ? '0 1rem 0.75rem 1rem' : '0 1.5rem 1rem 1.5rem',
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  borderBottom: '1px solid #f1f5f9',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: !isDesktop ? '1.35rem' : '1.6rem', fontWeight: 900, color: '#1a56db' }}>
                    {minPrice === maxPrice ? `₹${minPrice.toFixed(2)}` : `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`}
                  </span>
                  {minPrice === maxPrice && mrp > salePrice && (
                    <span style={{ fontSize: !isDesktop ? '0.9rem' : '1.05rem', textDecoration: 'line-through', color: '#94a3b8' }}>
                      ₹{mrp.toFixed(2)}
                    </span>
                  )}
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ Pc</span>
                </div>
              );
            })()}

            <div style={{ ...styles.modalBody, padding: !isDesktop ? '1rem' : '1.5rem' }}>
              <p style={styles.modalDescription}>
                {selectedProduct.description || 'No description available.'}
              </p>

              <div style={styles.variantsList}>
                <h4 style={styles.sectionLabel}>Select Variants & Quantities</h4>
                {(!selectedProduct.variants || selectedProduct.variants.length === 0) ? (
                  <p style={styles.noVariants}>No variants available for this product.</p>
                ) : (
                  selectedProduct.variants.map(v => {
                    const variantImg = resolveImageUrl(v.media_paths?.[0] || selectedProduct.media_paths?.[0]);
                    return (
                      <div key={v.id} style={{
                        ...styles.variantRow,
                        padding: !isDesktop ? '0.5rem 0.75rem' : '0.75rem 1rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: !isDesktop ? '0.5rem' : '1rem', minWidth: 0, flex: 1 }}>
                          <img
                            src={variantImg}
                            alt={v.sku_code}
                            style={{
                              width: !isDesktop ? '40px' : '48px',
                              height: !isDesktop ? '40px' : '48px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              flexShrink: 0
                            }}
                          />
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{
                              ...styles.variantSku,
                              fontSize: !isDesktop ? '0.75rem' : '0.85rem'
                            }}>SKU: {v.sku_code}</div>
                            {v.attributes && v.attributes.length > 0 && (
                              <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {v.attributes.map(attr => `${attr.attribute_name}: ${attr.value}`).join(', ')}
                              </div>
                            )}
                            <div style={styles.variantPrices}>
                              <span style={{
                                ...styles.variantPrice,
                                fontSize: !isDesktop ? '0.8rem' : '0.9rem'
                              }}>₹{(v.sale_price || v.price || 0).toFixed(2)}</span>
                              {v.mrp > (v.sale_price || v.price || 0) && (
                                <span style={{
                                  ...styles.variantMrp,
                                  fontSize: !isDesktop ? '0.65rem' : '0.75rem'
                                }}>₹{v.mrp.toFixed(2)}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          ...styles.qtySelector,
                          height: !isDesktop ? '28px' : '32px'
                        }}>
                          <button
                            onClick={() => handleQtyChange(v.id, (quantities[v.id] || 0) - 1)}
                            style={{
                              ...styles.qtyBtn,
                              width: !isDesktop ? '28px' : '32px',
                              height: !isDesktop ? '28px' : '32px'
                            }}
                          >
                            <Minus size={!isDesktop ? 12 : 14} />
                          </button>
                          <input
                            type="number"
                            value={quantities[v.id] || 0}
                            onChange={(e) => handleQtyChange(v.id, parseInt(e.target.value) || 0)}
                            style={{
                              ...styles.qtyInput,
                              width: !isDesktop ? '30px' : '40px',
                              height: !isDesktop ? '28px' : '32px'
                            }}
                          />
                          <button
                            onClick={() => handleQtyChange(v.id, (quantities[v.id] || 0) + 1)}
                            style={{
                              ...styles.qtyBtn,
                              width: !isDesktop ? '28px' : '32px',
                              height: !isDesktop ? '28px' : '32px'
                            }}
                          >
                            <Plus size={!isDesktop ? 12 : 14} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                onClick={() => setSelectedProduct(null)}
                style={styles.btnSecondary}
              >
                Cancel
              </button>
              <button
                onClick={handleSingleProductEnquirySubmit}
                disabled={submitting}
                style={styles.btnEnquiry}
              >
                Add to Enquiries
              </button>
              <button
                onClick={handleSingleProductOrderSubmit}
                disabled={submitting}
                style={styles.btnOrder}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Configuration Modal */}
      {showBulkModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>Configure Selected Items</h2>
                <p style={styles.modalSubtitle}>Set quantities for {bulkSelectedProducts.length} items</p>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ ...styles.modalBody, padding: !isDesktop ? '1rem' : '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bulkSelectedProducts.map(p => (
                  <div key={p.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.5rem' }}>
                      {p.name}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {(p.variants || []).map(v => {
                        const variantImg = resolveImageUrl(v.media_paths?.[0] || p.media_paths?.[0]);
                        return (
                          <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.4rem 0.6rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                              <img src={variantImg} alt={v.sku_code} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }} />
                              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                SKU: {v.sku_code}
                              </div>
                            </div>
                            <div style={{ ...styles.qtySelector, height: '28px' }}>
                              <button
                                onClick={() => handleQtyChange(v.id, (quantities[v.id] || 0) - 1)}
                                style={{ ...styles.qtyBtn, width: '28px', height: '28px' }}
                              >
                                <Minus size={12} />
                              </button>
                              <input
                                type="number"
                                value={quantities[v.id] || 0}
                                onChange={(e) => handleQtyChange(v.id, parseInt(e.target.value) || 0)}
                                style={{ ...styles.qtyInput, width: '30px', height: '28px' }}
                              />
                              <button
                                onClick={() => handleQtyChange(v.id, (quantities[v.id] || 0) + 1)}
                                style={{ ...styles.qtyBtn, width: '28px', height: '28px' }}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              ...styles.modalFooter,
              padding: !isDesktop ? '1rem' : '1.25rem 1.5rem',
              flexDirection: isDesktop ? 'row' : 'row',
              gap: '0.5rem',
            }}>
              <button
                onClick={() => setShowBulkModal(false)}
                style={{
                  ...styles.btnSecondary,
                  flex: isDesktop ? 'none' : 1,
                  padding: isDesktop ? '0.75rem 1.5rem' : '0.6rem 0.5rem',
                  fontSize: isDesktop ? '0.9rem' : '0.75rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const lines: any[] = [];
                  bulkSelectedProducts.forEach(p => {
                    (p.variants || []).forEach(v => {
                      const qty = quantities[v.id] || 0;
                      if (qty > 0) {
                        lines.push({
                          product_id: p.id,
                          variant_id: v.id,
                          quantity: qty
                        });
                      }
                    });
                  });
                  handlePlaceBulkEnquiry(lines);
                }}
                disabled={submitting}
                style={{
                  ...styles.btnEnquiry,
                  flex: isDesktop ? 'none' : 1,
                  padding: isDesktop ? '0.75rem 1.5rem' : '0.6rem 0.5rem',
                  fontSize: isDesktop ? '0.9rem' : '0.75rem',
                  margin: 0,
                }}
              >
                {isDesktop ? 'Add Bulk to Enquiry' : 'Enquiry'}
              </button>
              <button
                onClick={() => {
                  const lines: any[] = [];
                  bulkSelectedProducts.forEach(p => {
                    (p.variants || []).forEach(v => {
                      const qty = quantities[v.id] || 0;
                      if (qty > 0) {
                        lines.push({
                          product_id: p.id,
                          variant_id: v.id,
                          quantity: qty,
                          unit_price: v.sale_price || v.price || 0
                        });
                      }
                    });
                  });
                  handlePlaceBulkOrder(lines);
                }}
                disabled={submitting}
                style={{
                  ...styles.btnOrder,
                  flex: isDesktop ? 'none' : 1,
                  padding: isDesktop ? '0.75rem 1.5rem' : '0.6rem 0.5rem',
                  fontSize: isDesktop ? '0.9rem' : '0.75rem',
                  margin: 0,
                }}
              >
                {isDesktop ? 'Add Bulk to Cart' : 'Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    fontFamily: '"Outfit", "Inter", sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh',
    boxSizing: 'border-box',
  },
  categorySection: {
    marginBottom: '2rem',
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  categoryHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  sectionLabel: {
    fontSize: '0.8rem',
    fontWeight: 900,
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  categorySearchContainer: {
    position: 'relative',
    width: '300px',
  },
  categorySearchIcon: {
    position: 'absolute',
    left: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#94a3b8',
  },
  categorySearchInput: {
    width: '100%',
    padding: '0.5rem 1rem 0.5rem 2.25rem',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '0.8rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  categoryStrip: {
    display: 'flex',
    gap: '0.75rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
  },
  categoryChip: {
    flexShrink: 0,
    padding: '0.4rem 0.85rem',
    borderRadius: '20px',
    border: '1.5px solid',
    fontSize: '0.75rem',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.65rem',
    transition: 'all 0.2s',
  },
  categoryThumbnail: {
    position: 'relative',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.65rem',
    fontWeight: 900,
  },
  resultsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    padding: '0 0.5rem',
  },
  resultsCount: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#64748b',
  },
  selectAllToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    userSelect: 'none',
  },
  selectAllBox: {
    width: '20px',
    height: '20px',
    borderRadius: '4px',
    border: '2px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  selectAllText: {
    fontSize: '0.85rem',
    fontWeight: 800,
    color: '#1e293b',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1.25rem',
    paddingBottom: '6rem',
    padding: '0.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  },
  cardImageContainer: {
    width: '100%',
    aspectRatio: '1 / 1',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    padding: '1rem',
  },
  cardImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain',
    display: 'block',
    transition: 'transform 0.3s ease',
  },
  selectCircle: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '1.5px solid rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    zIndex: 10,
    backdropFilter: 'blur(4px)',
  },
  wishlistHeart: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 10,
  },
  cardBody: {
    padding: '1rem 1rem 0.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  productName: {
    fontSize: '0.95rem',
    fontWeight: 800,
    color: '#1e293b',
    margin: 0,
    lineHeight: 1.3,
    wordBreak: 'break-word',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    minHeight: '2.6rem',
  },
  packingText: {
    fontSize: '0.75rem',
    color: '#64748b',
    wordBreak: 'break-all',
  },
  priceContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginTop: '0.25rem',
  },
  mrpText: {
    textDecoration: 'line-through',
    color: '#94a3b8',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  priceText: {
    fontSize: '1.05rem',
    fontWeight: 900,
    color: '#1a56db',
  },
  cardFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem 1rem 1rem',
    backgroundColor: '#ffffff',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: 'auto',
    gap: '0.5rem',
  },
  footerIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  footerIconPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#1a56db',
    color: '#ffffff',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
  },
  bulkActionBar: {
    position: 'fixed',
    bottom: '2rem',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    backdropFilter: 'blur(12px)',
    border: '1px solid #334155',
    borderRadius: '40px',
    padding: '0.75rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
    zIndex: 900,
  },
  bulkActionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  bulkCountBadge: {
    backgroundColor: '#1a56db',
    color: '#ffffff',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 900,
  },
  bulkActionButtons: {
    display: 'flex',
    gap: '0.75rem',
  },
  bulkCancelBtn: {
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  bulkSubmitBtn: {
    backgroundColor: '#1a56db',
    color: '#ffffff',
    border: 'none',
    borderRadius: '20px',
    padding: '0.5rem 1.25rem',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    zIndex: 20000,
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '500px',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.08)',
    animation: 'slideIn 0.25s ease-out',
  },
  modalHeader: {
    padding: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: 800,
    color: '#0f172a',
    margin: 0,
  },
  modalSubtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: '0.25rem 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  modalBody: {
    padding: '1.5rem',
    overflowY: 'auto',
    flex: 1,
  },
  modalDescription: {
    fontSize: '0.9rem',
    color: '#4b5563',
    lineHeight: 1.5,
    margin: '0 0 1.5rem',
  },
  variantsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  variantRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
  },
  variantSku: {
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  variantPrices: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  variantPrice: {
    fontSize: '0.9rem',
    fontWeight: 800,
    color: '#1a56db',
  },
  variantMrp: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    textDecoration: 'line-through',
  },
  qtySelector: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  qtyBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#64748b',
    outline: 'none',
  },
  qtyInput: {
    width: '40px',
    height: '32px',
    border: 'none',
    borderLeft: '1px solid #cbd5e1',
    borderRight: '1px solid #cbd5e1',
    textAlign: 'center',
    fontWeight: 700,
    fontSize: '0.9rem',
    outline: 'none',
    color: '#1e293b',
  },
  modalFooter: {
    padding: '1.5rem',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  },
  btnSecondary: {
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnEnquiry: {
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#10b981',
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  btnOrder: {
    padding: '0.75rem 1.5rem',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#1a56db',
    color: '#ffffff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  bulkProductSection: {
    marginBottom: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '1.5rem',
  },
  bulkProductName: {
    fontSize: '1rem',
    fontWeight: 800,
    color: '#0f172a',
    marginBottom: '1rem',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '4rem 0',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #1e293b',
    borderTop: '3px solid #1a56db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  error: {
    color: '#f87171',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '1rem',
    borderRadius: '8px',
    textAlign: 'center',
  },
  empty: {
    textAlign: 'center',
    color: '#64748b',
    padding: '4rem 0',
  },
  loadMoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '2rem 0 6rem',
  },
  loadMoreBtn: {
    padding: '0.75rem 2rem',
    backgroundColor: '#ffffff',
    border: '1.5px solid #e2e8f0',
    borderRadius: '9999px',
    color: '#1a56db',
    fontWeight: 700,
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
  },
};
