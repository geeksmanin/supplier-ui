import React from 'react';
import {
  Search,
  Check,
  Heart,
  ChevronRight,
  X,
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

interface CatalogDesktopProps {
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
        borderRadius: '16px',
        border: isSelected ? '2px solid #2563eb' : (isHovered ? '1px solid #cbd5e1' : '1px solid #e2e8f0'),
        boxShadow: isHovered
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        overflow: 'visible',
        position: 'relative',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <button
        onClick={(e) => toggleWishlist(product.id, e)}
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          zIndex: 10,
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: isWishlisted ? '#ef4444' : '#64748b',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}
      >
        <Heart size={16} fill={isWishlisted ? '#ef4444' : 'none'} />
      </button>

      <div style={{ height: '160px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', position: 'relative', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}>
        <img
          src={productImg}
          alt={product.name}
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
        />
        {product.product_type === 'subscription' && (
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            backgroundColor: '#eff6ff',
            color: '#1e40af',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            padding: '3px 8px',
            fontSize: '0.65rem',
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
            top: '12px',
            right: '12px',
            width: '20px',
            height: '20px',
            borderRadius: '4px',
            border: '2px solid #cbd5e1',
            borderColor: isSelected ? '#2563eb' : '#cbd5e1',
            backgroundColor: isSelected ? '#2563eb' : '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {isSelected && <Check size={12} strokeWidth={4} color="#fff" />}
        </div>
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#fbbf24', fontWeight: 700 }}>
          <span>★ ★ ★ ★ ☆</span>
          <span style={{ color: '#64748b', marginLeft: '2px' }}>(4.2)</span>
        </div>

        <h3 style={{
          margin: 0,
          fontSize: '0.85rem',
          fontWeight: 800,
          color: '#1e293b',
          lineHeight: '1.4',
          minHeight: '2.4rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.name}
        </h3>

        {product.variants && product.variants.length > 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.2rem', position: 'relative' }} ref={dropdownRef}>
            <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>Variant Option</span>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#334155',
                backgroundColor: '#f8fafc',
                cursor: 'pointer',
                userSelect: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {currentVariant?.sku_code || 'Select Variant'} (₹{price})
              </span>
              <ChevronDown size={14} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease', color: '#64748b', flexShrink: 0 }} />
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
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e2e8f0',
                  zIndex: 100,
                  maxHeight: '180px',
                  overflowY: 'auto',
                  padding: '4px 0'
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
                        padding: '0.5rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: isVarSelected ? 700 : 500,
                        color: isVarSelected ? '#1e40af' : '#334155',
                        backgroundColor: isVarSelected ? '#eff6ff' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isVarSelected) e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }}
                      onMouseLeave={(e) => {
                        if (!isVarSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span>{v.sku_code || 'Option'} (₹{v.sale_price || v.price})</span>
                      {isVarSelected && <Check size={12} color="#1e40af" strokeWidth={3} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
          <span style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700 }}>
            Size: {packLabel}
          </span>
          <span style={{ backgroundColor: '#ecfdf5', color: '#065f46', padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700 }}>
            In Stock
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.4rem' }}>
          <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a' }}>₹{price.toFixed(2)}</span>
          {mrp > price && (
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
              M.R.P. ₹{mrp.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: '0.6rem 0.8rem 0.8rem 0.8rem', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: '#f8fafc', borderRadius: '0 0 16px 16px' }}>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
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
              gap: '0.2rem',
              backgroundColor: inCart ? (isCartHovered ? '#dbeafe' : '#eff6ff') : (isCartHovered ? '#1d4ed8' : '#2563eb'),
              color: inCart ? '#1d4ed8' : '#ffffff',
              border: inCart ? '1px solid #bfdbfe' : 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.15rem',
              fontSize: '0.65rem',
              fontWeight: 800,
              cursor: 'pointer',
              height: '24px',
              boxSizing: 'border-box',
              transition: 'background-color 0.2s ease'
            }}
          >
            <ShoppingCart size={11} />
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
              gap: '0.2rem',
              backgroundColor: inEnquiry ? (isEnqHovered ? '#dcfce7' : '#f0fdf4') : (isEnqHovered ? '#0f766e' : '#0d9488'),
              color: inEnquiry ? '#15803d' : '#ffffff',
              border: inEnquiry ? '1px solid #bbf7d0' : 'none',
              borderRadius: '6px',
              padding: '0.35rem 0.15rem',
              fontSize: '0.65rem',
              fontWeight: 800,
              cursor: 'pointer',
              height: '24px',
              boxSizing: 'border-box',
              transition: 'background-color 0.2s ease'
            }}
          >
            <MessageSquare size={11} />
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
            gap: '0.2rem',
            backgroundColor: isBuyHovered ? '#c2410c' : '#ea580c',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '0.35rem',
            fontSize: '0.68rem',
            fontWeight: 800,
            cursor: 'pointer',
            height: '24px',
            boxSizing: 'border-box',
            transition: 'background-color 0.2s ease'
          }}
        >
          <Zap size={11} />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
};

export const CatalogDesktop: React.FC<CatalogDesktopProps> = ({
  categories,
  filteredCategories,
  selectedCategories,
  setSelectedCategories,
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
  enquiryCart,
  toggleEnquiryCart
}) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #f3f3f3', borderTop: '3px solid #1a56db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return <div style={{ color: '#ef4444', textAlign: 'center', padding: '3rem', fontWeight: 700 }}>{error}</div>;
  }

  return (
    <div style={{ padding: '2rem', fontFamily: '"Outfit", "Inter", sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
      {/* Category Strip Section */}
      {categories.length > 0 && (
        <div style={{ marginBottom: '2rem', backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>BROWSE CATEGORIES</span>
            <div style={{ position: 'relative', width: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Filter categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                style={{ width: '100%', padding: '0.4rem 0.5rem 0.4rem 2rem', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <div
              onClick={() => setSelectedCategories([])}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '24px',
                border: '1.5px solid',
                fontSize: '0.825rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                borderColor: selectedCategories.length === 0 ? '#1a56db' : '#cbd5e1',
                backgroundColor: selectedCategories.length === 0 ? 'rgba(26, 86, 219, 0.05)' : '#ffffff',
                color: selectedCategories.length === 0 ? '#1a56db' : '#64748b',
              }}
            >
              All
            </div>
            {filteredCategories.map(cat => {
              const isSelected = selectedCategories.includes(String(cat.id));
              const initials = cat.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

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
                    padding: '0.5rem 1rem',
                    borderRadius: '24px',
                    border: '1.5px solid',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    borderColor: isSelected ? '#1a56db' : '#cbd5e1',
                    backgroundColor: isSelected ? 'rgba(26, 86, 219, 0.05)' : '#ffffff',
                    color: isSelected ? '#1a56db' : '#64748b',
                  }}
                >
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    fontWeight: 800,
                    backgroundColor: isSelected ? '#1a56db' : '#e2e8f0',
                    color: isSelected ? '#ffffff' : '#64748b',
                  }}>
                    {isSelected ? <Check size={12} strokeWidth={4} /> : initials}
                  </div>
                  <span>{cat.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Header */}
      {filteredProducts.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#475569' }}>Showing {filteredProducts.length} items</span>
          <div onClick={handleSelectAll} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
            <div style={{
              width: '18px',
              height: '18px',
              border: '2px solid',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderColor: selectedProductIds.length > 0 ? '#1a56db' : '#cbd5e1',
              backgroundColor: selectedProductIds.length > 0 ? '#1a56db' : '#ffffff',
            }}>
              {selectedProductIds.length > 0 && <Check size={12} strokeWidth={4} color="#fff" />}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
              {selectedProductIds.length > 0 ? `Selected (${selectedProductIds.length})` : 'Select All'}
            </span>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: '#94a3b8', fontSize: '0.95rem', fontStyle: 'italic' }}>
          No products match your filters or query.
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem', marginBottom: '2.5rem' }}>
              <button
                onClick={() => fetchProducts(page + 1, false)}
                disabled={loadingMore}
                style={{ padding: '0.75rem 2rem', borderRadius: '12px', border: '1.5px solid #cbd5e1', background: '#ffffff', color: '#475569', fontSize: '0.9rem', fontWeight: 700, cursor: loadingMore ? 'not-allowed' : 'pointer', opacity: loadingMore ? 0.7 : 1, transition: 'all 0.2s' }}
              >
                {loadingMore ? 'Loading more products...' : 'Load More Products'}
              </button>
            </div>
          )}
        </>
      )}

      {/* Floating Bulk Action Bar */}
      {selectedProductIds.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          borderRadius: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          padding: '0.75rem 1.5rem',
          zIndex: 15000,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', fontSize: '0.85rem', fontWeight: 800 }}>{selectedProductIds.length}</span>
            <span style={{ color: '#fff', fontWeight: 650, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>items selected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
            <button
              onClick={() => setSelectedProductIds([])}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 750 }}
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
              style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer' }}
            >
              Configure Quantities
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
