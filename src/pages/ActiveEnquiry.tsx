import React, { useState, useEffect } from 'react';
import { useMediaQuery, apiClient } from '@geeksman/core-ui';
import { useNavigate } from 'react-router-dom';
import { ActiveEnquiryDesktop } from './ActiveEnquiry.desktop';
import { ActiveEnquiryMobile } from './ActiveEnquiry.mobile';

export interface ActiveEnquiryProps {
  draftCart: any[];
  resolvedDraftLines: any[];
  loadingDraft: boolean;
  updateDraftQty: (productId: string, qty: number) => void;
  removeDraftItem: (productId: string) => void;
  submitDraftEnquiry: (remarks?: string) => Promise<void>;
}

export const ActiveEnquiry: React.FC = () => {
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
      const resolved = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const pRes = await apiClient.get('/catalogue/customer/products', { params: { limit: 100 } });
            const productsList = pRes.data?.data || [];
            const product = productsList.find((p: any) => String(p.id) === String(item.id));
            const name = product ? product.name : `Product (${item.id})`;
            const variants = product ? product.variants : [];
            return {
              id: item.id,
              product_id: item.id,
              variant_id: variants?.[0]?.id || '',
              quantity: item.quantity,
              price: item.price,
              product_name: name,
              sku: variants?.[0]?.sku_code || '1 Pc',
              media_paths: product?.media_paths || variants?.[0]?.media_paths || []
            };
          } catch {
            return {
              id: item.id,
              product_id: item.id,
              variant_id: '',
              quantity: item.quantity,
              price: item.price,
              product_name: `Product (${item.id})`,
              sku: '1 Pc',
              media_paths: []
            };
          }
        })
      );
      setResolvedDraftLines(resolved);
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

  useEffect(() => {
    loadDraftCart();
    const handleCartUpdate = () => {
      loadDraftCart();
    };
    window.addEventListener('customer-cart-update', handleCartUpdate);
    return () => window.removeEventListener('customer-cart-update', handleCartUpdate);
  }, []);

  useEffect(() => {
    if (draftCart.length > 0) {
      fetchDraftLines(draftCart);
    } else {
      setResolvedDraftLines([]);
    }
  }, [draftCart]);

  const props: ActiveEnquiryProps = {
    draftCart,
    resolvedDraftLines,
    loadingDraft,
    updateDraftQty,
    removeDraftItem,
    submitDraftEnquiry
  };

  return isDesktop ? <ActiveEnquiryDesktop {...props} /> : <ActiveEnquiryMobile {...props} />;
};
