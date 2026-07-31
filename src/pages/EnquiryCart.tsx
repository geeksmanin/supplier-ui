import React, { useState, useEffect, useRef } from 'react';
import { useMediaQuery, apiClient } from '@geeksman/core-ui';
import { useNavigate } from 'react-router-dom';
import { EnquiryCartDesktop } from './EnquiryCart.desktop';
import { EnquiryCartMobile } from './EnquiryCart.mobile';

export interface EnquiryCartProps {
  draftCart: any[];
  resolvedDraftLines: any[];
  loadingDraft: boolean;
  updateDraftQty: (productId: string, qty: number) => void;
  removeDraftItem: (productId: string) => void;
  submitDraftEnquiry: (remarks?: string) => Promise<void>;
  refreshCart: () => void;
}

export const EnquiryCart: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();

  const [draftCart, setDraftCart] = useState<any[]>([]);
  const [resolvedDraftLines, setResolvedDraftLines] = useState<any[]>([]);
  const [loadingDraft, setLoadingDraft] = useState(false);

  const loadDraftCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('customer_enquiry_cart') || '[]');
      setDraftCart(cart);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDraftLines = async (cartItems: any[]) => {
    setLoadingDraft(true);
    try {
      const pRes = await apiClient.get('/catalogue/customer/products', { params: { limit: 100 } });
      const productsList = pRes.data?.data || [];
      
      const resolved: any[] = [];
      const validCartItems: any[] = [];

      for (const item of cartItems) {
        const product = productsList.find((p: any) => String(p.id) === String(item.product_id || item.id));
        if (product) {
          const variants = product.variants || [];
          const variant = variants.find((v: any) => String(v.id) === String(item.variant_id || item.id)) || variants?.[0];
          resolved.push({
            id: item.id,
            product_id: item.product_id || product.id,
            variant_id: variant?.id || '',
            quantity: item.quantity,
            price: item.price,
            product_name: product.name,
            sku: variant?.sku_code || '1 Pc',
            media_paths: product.media_paths || variant?.media_paths || []
          });
          validCartItems.push(item);
        }
      }

      setResolvedDraftLines(resolved);

      if (validCartItems.length !== cartItems.length) {
        setDraftCart(validCartItems);
        localStorage.setItem('customer_enquiry_cart', JSON.stringify(validCartItems));
        window.dispatchEvent(new Event('customer-cart-update'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDraft(false);
    }
  };

  const updateDraftQty = (productId: string, qty: number) => {
    const updated = draftCart.map(item => {
      if (String(item.id) === String(productId)) {
        return { ...item, quantity: Math.max(1, qty) };
      }
      return item;
    });
    setDraftCart(updated);
    localStorage.setItem('customer_enquiry_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('customer-cart-update'));
  };

  const removeDraftItem = (productId: string) => {
    const updated = draftCart.filter(item => String(item.id) !== String(productId));
    setDraftCart(updated);
    localStorage.setItem('customer_enquiry_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('customer-cart-update'));
  };

  const submitDraftEnquiry = async (remarks?: string) => {
    if (resolvedDraftLines.length === 0) return;
    try {
      const payload = {
        enquiry: {
          enquiry_number: `ENQ-${Math.floor(Date.now() / 1000)}`,
          company_id: '1',
          remarks: remarks || 'Placed via Customer Portal'
        },
        lines: resolvedDraftLines.map(line => ({
          product_id: line.product_id ? String(line.product_id) : '',
          variant_id: line.variant_id ? String(line.variant_id) : '',
          quantity: line.quantity,
          company_id: '1'
        }))
      };

      await apiClient.post('/sales/customer/enquiries', payload);
      localStorage.setItem('customer_enquiry_cart', '[]');
      setDraftCart([]);
      setResolvedDraftLines([]);
      window.dispatchEvent(new Event('customer-cart-update'));
      navigate('/enquiries');
    } catch (err: any) {
      console.error(err);
    }
  };

  const resolvedKeysRef = useRef<string>('');

  useEffect(() => {
    loadDraftCart();
    const handleCartUpdate = () => {
      loadDraftCart();
    };
    window.addEventListener('customer-cart-update', handleCartUpdate);
    return () => window.removeEventListener('customer-cart-update', handleCartUpdate);
  }, []);

  useEffect(() => {
    const cartKeys = draftCart.map(item => `${item.id}-${item.variant_id || ''}`).sort().join(',');
    if (draftCart.length > 0) {
      if (cartKeys !== resolvedKeysRef.current) {
        resolvedKeysRef.current = cartKeys;
        fetchDraftLines(draftCart);
      } else {
        // Sync quantities locally without loading state / fetching details again
        setResolvedDraftLines(prev => prev.map(line => {
          const match = draftCart.find(item => String(item.id) === String(line.id));
          if (match) {
            return { ...line, quantity: match.quantity };
          }
          return line;
        }));
      }
    } else {
      resolvedKeysRef.current = '';
      setResolvedDraftLines([]);
    }
  }, [draftCart]);

  const props: EnquiryCartProps = {
    draftCart,
    resolvedDraftLines,
    loadingDraft,
    updateDraftQty,
    removeDraftItem,
    submitDraftEnquiry,
    refreshCart: loadDraftCart
  };

  return isDesktop ? <EnquiryCartDesktop {...props} /> : <EnquiryCartMobile {...props} />;
};
