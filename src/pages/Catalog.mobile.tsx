import React from 'react';
import {
  Search,
  Check,
  Heart,
  X,
  SlidersHorizontal,
  ChevronDown,
  ShoppingCart,
  MessageSquare,
  Zap
} from 'lucide-react';

interface Variant {
  id: string;
  sku_code: string;
  price: number;
  sale_price: number;
  mrp: number;
  attributes?: Array<{ attribute_name: string; value: string }>;
  media_paths?: string[];
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
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CatalogMobileProps {
  products: Product[];
  categories: Category[];
  filteredCategories: Category[];
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  search: string;
  setSearch: (s: string) => void;
  categorySearch: string;
  setCategorySearch: (s: string) => void;
  loading: boolean;
  error: string | null;
  filteredProducts: Product[];
  selectedProductIds: string[];
  toggleSelectProduct: (id: string, e: any) => void;
  wishlist: string[];
  toggleWishlist: (id: string, e: any) => void;
  orderCart: any[];
  handleDirectOrder: (p: any, e: any) => void;
  handleUpdateCartQty: (variantId: string, productId: string, qty: number, price: number, e?: any) => void;
  cardSelectedVariants: Record<string, string>;
  setCardSelectedVariants: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleSelectAll: () => void;
  page: number;
  hasMore: boolean;
  loadingMore: boolean;
  fetchProducts: (page: number, append: boolean) => void;
  bulkSelectedProducts: Product[];
  setQuantities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  quantities: Record<string, number>;
  setShowBulkModal: (b: boolean) => void;
  setSelectedProductIds: (ids: string[]) => void;
  resolveImageUrl: (url?: string) => string;
  navigate: (path: string) => void;
  showMobileCategoryModal: boolean;
  setShowMobileCategoryModal: (b: boolean) => void;
  enquiryCart: any[];
  toggleEnquiryCart: (product: any, e: any, variantId?: string) => void;
}

interface ProductCardProps {
  product: Product;
  cardSelectedVariants: Record<string, string>;
  setCardSelectedVariants: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  selectedProductIds: string[];
  toggleSelectProduct: (productId: string, e?: any) => void;
  wishlist: string[];
  toggleWishlist: (productId: string, e?: any) => void;
  orderCart: any[];
  handleDirectOrder: (prod: any, e?: any) => void;
  handleUpdateCartQty: (variantId: string, productId: string, qty: number, price: number, e?: any) => void;
  resolveImageUrl: (url?: string) => string;
  navigate: (path: string) => void;
  enquiryCart: any[];
  toggleEnquiryCart: (product: any, e: any, variantId?: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cardSelectedVariants,
  setCardSelectedVariants,
  selectedProductIds,
  toggleSelectProduct,
  wishlist,
  toggleWishlist,
  orderCart,
  handleDirectOrder,
  handleUpdateCartQty,
  resolveImageUrl,
  navigate,
  enquiryCart,
  toggleEnquiryCart
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isCartHovered, setIsCartHovered] = React.useState(false);
  const [isEnqHovered, setIsEnqHovered] = React.useState(false);
  const [isBuyHovered, setIsBuyHovered] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedVariantId = cardSelectedVariants[product.id] || product.variants?.[0]?.id;
  const currentVariant = product.variants?.find(v => String(v.id) === String(selectedVariantId)) || product.variants?.[0];

  const price = currentVariant?.sale_price || currentVariant?.price || 0;
  const mrp = currentVariant?.mrp || 0;

  const isSelected = selectedProductIds.includes(String(product.id));
  const isWishlisted = wishlist.includes(String(product.id));
  const productImg = resolveImageUrl(product.media_paths?.[0] || currentVariant?.media_paths?.[0]);

  const packLabel = (currentVariant as any)?.weight
    ? `${(currentVariant as any).weight}g`
    : currentVariant?.sku_code || 'Standard';

  const inCart = orderCart.some(item => String(item.variant_id) === String(currentVariant?.id));
  const inEnquiry = enquiryCart.some(item => String(item.variant_id) === String(currentVariant?.id));

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: isSelected ? '1.5px solid #2563eb' : (isHovered ? '1px solid #cbd5e1' : '1px solid #e2e8f0'),
        boxShadow: isHovered
          ? '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)'
          : '0 2px 4px rgba(0, 0, 0, 0.02)',
        overflow: 'visible',
        position: 'relative',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <button
        onClick={(e) => toggleWishlist(product.id, e)}
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          zIndex: 10,
          width: '26px',
          height: '26px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isWishlisted ? '#ef4444' : '#64748b',
        }}
      >
        <Heart size={11} fill={isWishlisted ? '#ef4444' : 'none'} />
      </button>

      <div style={{ height: '110px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', position: 'relative', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
        <img
          src={productImg}
          alt={product.name}
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
        />
        {product.product_type === 'subscription' && (
          <div style={{
            position: 'absolute',
            bottom: '6px',
            left: '6px',
            backgroundColor: '#eff6ff',
            color: '#1e40af',
            border: '1px solid #bfdbfe',
            borderRadius: '4px',
            padding: '2px 5px',
            fontSize: '0.55rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            Subscription
          </div>
        )}

        <div
          onClick={(e) => toggleSelectProduct(product.id, e)}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '16px',
            height: '16px',
            borderRadius: '4px',
            border: '1.5px solid #cbd5e1',
            borderColor: isSelected ? '#2563eb' : '#cbd5e1',
            backgroundColor: isSelected ? '#2563eb' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isSelected && <Check size={10} strokeWidth={4} color="#fff" />}
        </div>
      </div>

      <div style={{ padding: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700 }}>
          <span>★ ★ ★ ★ ☆</span>
          <span style={{ color: '#64748b', marginLeft: '2px' }}>(4.2)</span>
        </div>

        <h3 style={{
          margin: 0,
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#1e293b',
          lineHeight: '1.3',
          minHeight: '2rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.name}
        </h3>

        {product.variants && product.variants.length > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', position: 'relative' }} ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.3rem 0.45rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#334155',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {currentVariant?.sku_code || 'Option'} (₹{price})
              </span>
              <ChevronDown size={12} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: '#64748b', flexShrink: 0 }} />
            </div>
            {isDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: '#ffffff',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: '1px solid #e2e8f0',
                  zIndex: 100,
                  maxHeight: '140px',
                  overflowY: 'auto',
                  padding: '2px 0'
                }}
              >
                {product.variants.map((v) => {
                  const isVarSelected = String(v.id) === String(selectedVariantId);
                  return (
                    <div
                      key={v.id}
                      onClick={() => {
                        setCardSelectedVariants(prev => ({ ...prev, [product.id]: v.id }));
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.4rem 0.55rem',
                        fontSize: '0.68rem',
                        fontWeight: isVarSelected ? 700 : 500,
                        color: isVarSelected ? '#1e40af' : '#334155',
                        backgroundColor: isVarSelected ? '#eff6ff' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {v.sku_code || 'Option'} (₹{v.sale_price || v.price})
                      </span>
                      {isVarSelected && <Check size={10} color="#1e40af" strokeWidth={3} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700 }}>
            Size: {packLabel}
          </span>
          <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '1px 5px', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 700 }}>
            In Stock
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', marginTop: '0.15rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0f172a' }}>₹{price.toFixed(2)}</span>
          {mrp > price && (
            <span style={{ fontSize: '0.65rem', color: '#94a3b8', textDecoration: 'line-through' }}>
              ₹{mrp.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '0.35rem 0.5rem 0.5rem 0.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.25rem', backgroundColor: '#f8fafc', borderRadius: '0 0 12px 12px' }}>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (inCart) {
                navigate('/order-cart');
              } else if (currentVariant) {
                handleDirectOrder(product, e);
              }
            }}
            onMouseEnter={() => setIsCartHovered(true)}
            onMouseLeave={() => setIsCartHovered(false)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.15rem',
              backgroundColor: inCart ? (isCartHovered ? '#dbeafe' : '#eff6ff') : (isCartHovered ? '#1d4ed8' : '#2563eb'),
              color: inCart ? '#1d4ed8' : '#ffffff',
              border: inCart ? '1px solid #bfdbfe' : 'none',
              borderRadius: '5px',
              padding: '0.3rem 0.1rem',
              fontSize: '0.6rem',
              fontWeight: 800,
              cursor: 'pointer',
              height: '22px',
              boxSizing: 'border-box',
              transition: 'background-color 0.2s ease'
            }}
          >
            <ShoppingCart size={9} />
            <span>{inCart ? 'Cart' : 'Add'}</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (inEnquiry) {
                navigate('/enquiry-cart');
              } else if (currentVariant) {
                toggleEnquiryCart(product, e, currentVariant.id);
              }
            }}
            onMouseEnter={() => setIsEnqHovered(true)}
            onMouseLeave={() => setIsEnqHovered(false)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.15rem',
              backgroundColor: inEnquiry ? (isEnqHovered ? '#dcfce7' : '#f0fdf4') : (isEnqHovered ? '#0f766e' : '#0d9488'),
              color: inEnquiry ? '#15803d' : '#ffffff',
              border: inEnquiry ? '1px solid #bbf7d0' : 'none',
              borderRadius: '5px',
              padding: '0.3rem 0.1rem',
              fontSize: '0.6rem',
              fontWeight: 800,
              cursor: 'pointer',
              height: '22px',
              boxSizing: 'border-box',
              transition: 'background-color 0.2s ease'
            }}
          >
            <MessageSquare size={9} />
            <span>{inEnquiry ? 'Enq' : 'Enquiry'}</span>
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (currentVariant) {
              const inOrderCart = orderCart.some(item => String(item.variant_id) === String(currentVariant.id));
              if (!inOrderCart) {
                const currentCart = JSON.parse(localStorage.getItem('customer_order_cart') || '[]');
                let newCart = [...currentCart];
                newCart.push({
                  id: String(currentVariant.id),
                  product_id: String(product.id),
                  variant_id: String(currentVariant.id),
                  quantity: 1,
                  price: price
                });
                localStorage.setItem('customer_order_cart', JSON.stringify(newCart));
                handleUpdateCartQty(currentVariant.id, product.id, 1, price, e);
              }
              setTimeout(() => {
                navigate('/order-cart');
              }, 100);
            }
          }}
          onMouseEnter={() => setIsBuyHovered(true)}
          onMouseLeave={() => setIsBuyHovered(false)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.15rem',
            backgroundColor: isBuyHovered ? '#c2410c' : '#ea580c',
            color: '#ffffff',
            border: 'none',
            borderRadius: '5px',
            padding: '0.3rem',
            fontSize: '0.62rem',
            fontWeight: 800,
            cursor: 'pointer',
            height: '22px',
            boxSizing: 'border-box',
            transition: 'background-color 0.2s ease'
          }}
        >
          <Zap size={9} />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
};

export const CatalogMobile: React.FC<CatalogMobileProps> = ({
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
}) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #f3f3f3', borderTop: '3px solid #1a56db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return <div style={{ color: '#ef4444', textAlign: 'center', padding: '2rem', fontSize: '0.9rem', fontWeight: 700 }}>{error}</div>;
  }

  return (
    <div style={{ padding: '1rem', paddingTop: '4.5rem', fontFamily: '"Outfit", "Inter", sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>

      {/* Floating Search Bar (Mobile only) */}
      <div style={{
        position: 'fixed',
        top: '3.5rem',
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: '#f8fafc',
        padding: '0.75rem 1rem 0.5rem 1rem',
        borderBottom: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #cbd5e1',
            borderRadius: '24px',
            backgroundColor: '#ffffff',
            padding: '0.25rem 0.75rem 0.25rem 0.5rem',
            height: '2.5rem',
            boxSizing: 'border-box'
          }}>
            <Search size={18} style={{ color: '#94a3b8', marginLeft: '4px' }} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                padding: '0 0.5rem',
                fontSize: '0.9rem',
                color: '#334155',
                outline: 'none',
                background: 'transparent'
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button
            onClick={() => setShowMobileCategoryModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              border: '1px solid #cbd5e1',
              backgroundColor: selectedCategories.length > 0 ? 'rgba(26, 86, 219, 0.08)' : '#ffffff',
              borderColor: selectedCategories.length > 0 ? '#1a56db' : '#cbd5e1',
              color: selectedCategories.length > 0 ? '#1a56db' : '#64748b',
              cursor: 'pointer',
              flexShrink: 0,
              outline: 'none',
              boxSizing: 'border-box'
            }}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Category Strip section */}
      {categories.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0' }} className="category-strip-container">
          <div
            onClick={() => setSelectedCategories([])}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              border: '1.5px solid',
              fontSize: '0.78rem',
              fontWeight: 700,
              borderColor: selectedCategories.length === 0 ? '#1a56db' : '#cbd5e1',
              backgroundColor: selectedCategories.length === 0 ? 'rgba(26, 86, 219, 0.05)' : '#ffffff',
              color: selectedCategories.length === 0 ? '#1a56db' : '#64748b',
            }}
          >
            All
          </div>
          {filteredCategories.map(cat => {
            const isSelected = selectedCategories.includes(String(cat.id));
            return (
              <div
                key={cat.id}
                onClick={() => {
                  setSelectedCategories(prev =>
                    prev.includes(String(cat.id))
                      ? prev.filter(id => id !== String(cat.id))
                      : [...prev, String(cat.id)]
                  );
                }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  border: '1.5px solid',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  borderColor: isSelected ? '#1a56db' : '#cbd5e1',
                  backgroundColor: isSelected ? 'rgba(26, 86, 219, 0.05)' : '#ffffff',
                  color: isSelected ? '#1a56db' : '#64748b',
                }}
              >
                <span>{cat.name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Results Header */}
      {filteredProducts.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', marginTop: '0.5rem' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b' }}>{filteredProducts.length} items</span>
          <div onClick={handleSelectAll} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <div style={{
              width: '15px',
              height: '15px',
              border: '1.5px solid',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: selectedProductIds.length > 0 ? '#1a56db' : '#cbd5e1',
              backgroundColor: selectedProductIds.length > 0 ? '#1a56db' : '#ffffff',
            }}>
              {selectedProductIds.length > 0 && <Check size={10} strokeWidth={4} color="#fff" />}
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 750, color: '#1e293b' }}>
              {selectedProductIds.length > 0 ? `Selected (${selectedProductIds.length})` : 'Select All'}
            </span>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
          No products match filters.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cardSelectedVariants={cardSelectedVariants}
                setCardSelectedVariants={setCardSelectedVariants}
                selectedProductIds={selectedProductIds}
                toggleSelectProduct={toggleSelectProduct}
                wishlist={wishlist}
                toggleWishlist={toggleWishlist}
                orderCart={orderCart}
                handleDirectOrder={handleDirectOrder}
                handleUpdateCartQty={handleUpdateCartQty}
                resolveImageUrl={resolveImageUrl}
                navigate={navigate}
                enquiryCart={enquiryCart}
                toggleEnquiryCart={toggleEnquiryCart}
              />
            ))}
          </div>

          {hasMore && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => fetchProducts(page + 1, false)}
                disabled={loadingMore}
                style={{ padding: '0.5rem 1.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '0.78rem', fontWeight: 700 }}
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedProductIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '76px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.4rem 0.85rem',
          zIndex: 15000,
          width: 'calc(100% - 2.5rem)',
          maxWidth: '400px',
          boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.7rem', fontWeight: 800 }}>{selectedProductIds.length}</span>
            <span style={{ color: '#fff', fontWeight: 650, fontSize: '0.7rem', whiteSpace: 'nowrap' }}>selected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: 'auto' }}>
            <button
              onClick={() => setSelectedProductIds([])}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 750 }}
            >
              Deselect
            </button>
            <button
              onClick={() => {
                const initialQties = { ...quantities };
                bulkSelectedProducts.forEach(p => {
                  (p.variants || []).forEach(v => {
                    initialQties[v.id] = 1;
                  });
                });
                setQuantities(initialQties);
                setShowBulkModal(true);
              }}
              style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.35rem 0.75rem', borderRadius: '14px', fontSize: '0.7rem', fontWeight: 800 }}
            >
              Configure
            </button>
          </div>
        </div>
      )}

      {/* Mobile Category Modal Overlay */}
      {showMobileCategoryModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 20000,
          display: 'flex',
          alignItems: 'flex-end',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            width: '100%',
            maxHeight: '75vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '1.5rem',
            animation: 'slideUp 0.25s ease-out'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 900, color: '#1e293b' }}>Filter Categories</span>
              <button
                onClick={() => setShowMobileCategoryModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 0.5rem 0.5rem 2.2rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1rem' }}>
              {/* All Products option */}
              <div
                onClick={() => {
                  setSelectedCategories([]);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: selectedCategories.length === 0 ? 'rgba(26, 86, 219, 0.05)' : 'transparent',
                  color: selectedCategories.length === 0 ? '#1a56db' : '#334155',
                  fontWeight: selectedCategories.length === 0 ? 700 : 500,
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '18px',
                  height: '18px',
                  border: '1.5px solid',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderColor: selectedCategories.length === 0 ? '#1a56db' : '#cbd5e1',
                  backgroundColor: selectedCategories.length === 0 ? '#1a56db' : '#ffffff',
                  marginRight: '0.75rem',
                  flexShrink: 0
                }}>
                  {selectedCategories.length === 0 && <Check size={12} strokeWidth={4} color="#fff" />}
                </div>
                <span>All Products</span>
              </div>

              {/* Individual Category options */}
              {filteredCategories.map(cat => {
                const isSelected = selectedCategories.includes(String(cat.id));
                return (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategories(prev =>
                        prev.includes(String(cat.id))
                          ? prev.filter(id => id !== String(cat.id))
                          : [...prev, String(cat.id)]
                      );
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      borderRadius: '12px',
                      backgroundColor: isSelected ? 'rgba(26, 86, 219, 0.05)' : 'transparent',
                      color: isSelected ? '#1a56db' : '#334155',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      border: '1.5px solid',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderColor: isSelected ? '#1a56db' : '#cbd5e1',
                      backgroundColor: isSelected ? '#1a56db' : '#ffffff',
                      marginRight: '0.75rem',
                      flexShrink: 0
                    }}>
                      {isSelected && <Check size={12} strokeWidth={4} color="#fff" />}
                    </div>
                    <span>{cat.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
