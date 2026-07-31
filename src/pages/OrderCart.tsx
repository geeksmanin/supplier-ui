import React, { useState, useEffect, useRef } from 'react';
import { useMediaQuery, apiClient } from '@geeksman/core-ui';
import { useNavigate } from 'react-router-dom';
import { OrderCartDesktop } from './OrderCart.desktop';
import { OrderCartMobile } from './OrderCart.mobile';

export interface OrderCartProps {
  draftCart: any[];
  resolvedDraftLines: any[];
  loadingDraft: boolean;
  updateDraftQty: (productId: string, qty: number) => void;
  removeDraftItem: (productId: string) => void;
  submitDraftOrder: (remarks?: string, billingAddress?: string, shippingAddress?: string) => Promise<void>;
  addresses: any[];
  billingAddress: string;
  setBillingAddress: (addr: string) => void;
  shippingAddress: string;
  setShippingAddress: (addr: string) => void;
  createAddress: (addr: any) => Promise<boolean>;
  refreshCart: () => void;
}

export const OrderCart: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const navigate = useNavigate();

  const [draftCart, setDraftCart] = useState<any[]>([]);
  const [resolvedDraftLines, setResolvedDraftLines] = useState<any[]>([]);
  const [loadingDraft, setLoadingDraft] = useState(false);

  const [addresses, setAddresses] = useState<any[]>([]);
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');

  const loadDraftCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('customer_order_cart') || '[]');
      setDraftCart(cart);
    } catch (e) {
      console.error(e);
    }
  };

  const formatAddressString = (addr: any) => {
    if (!addr) return '';
    return [addr.address_line1, addr.address_line2, addr.city, addr.state, addr.postal_code, addr.country]
      .filter(Boolean)
      .join(', ');
  };

  const fetchAddresses = async () => {
    try {
      const res = await apiClient.get('/contacts/customer/addresses');
      if (res.data?.data) {
        const addrList = res.data.data;
        setAddresses(addrList);
        // Default addresses
        const defBilling = addrList.find((a: any) => a.type === 'BILLING' && a.is_default) || addrList.find((a: any) => a.type === 'BILLING');
        const defShipping = addrList.find((a: any) => a.type === 'SHIPPING' && a.is_default) || addrList.find((a: any) => a.type === 'SHIPPING');
        if (defBilling) setBillingAddress(`${defBilling.type}: ${formatAddressString(defBilling)}`);
        if (defShipping) setShippingAddress(`${defShipping.type}: ${formatAddressString(defShipping)}`);
      }
    } catch (e) {
      console.error('Failed to load addresses:', e);
    }
  };

  const createAddress = async (newAddr: any) => {
    try {
      const res = await apiClient.post('/contacts/customer/addresses', newAddr);
      if (res.data?.data) {
        await fetchAddresses();
        const formatted = `${res.data.data.type}: ${formatAddressString(res.data.data)}`;
        if (newAddr.type === 'BILLING') {
          setBillingAddress(formatted);
        } else if (newAddr.type === 'SHIPPING') {
          setShippingAddress(formatted);
        }
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
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
            product_id: item.product_id || item.id,
            variant_id: variant?.id || '',
            quantity: item.quantity,
            price: item.price,
            product_name: product.name,
            sku: variant?.sku_code || '1 Pc',
            media_paths: product?.media_paths || variant?.media_paths || [],
            packings: variant?.packings || product?.packings || []
          });
          validCartItems.push(item);
        }
      }

      setResolvedDraftLines(resolved);

      if (validCartItems.length !== cartItems.length) {
        setDraftCart(validCartItems);
        localStorage.setItem('customer_order_cart', JSON.stringify(validCartItems));
        window.dispatchEvent(new Event('customer-cart-update'));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDraft(false);
    }
  };

  const updateDraftQty = (productId: string, qty: number) => {
    const resolvedLine = resolvedDraftLines.find(l => String(l.id) === String(productId));
    let step = 1;
    if (resolvedLine?.packings && resolvedLine.packings.length > 0) {
      const defaultPkg = resolvedLine.packings.find((p: any) => p.is_default) || resolvedLine.packings[0];
      step = defaultPkg && defaultPkg.size > 0 ? defaultPkg.size : 1;
    }

    const updated = draftCart.map(item => {
      if (String(item.id) === String(productId)) {
        const currentQty = item.quantity || step;
        let newQty = qty;
        if (qty > currentQty) {
          newQty = currentQty + step;
        } else if (qty < currentQty) {
          newQty = currentQty - step;
        } else {
          newQty = Math.round(qty / step) * step;
        }
        return { ...item, quantity: Math.max(step, newQty) };
      }
      return item;
    });

    setResolvedDraftLines(prev => prev.map(line => {
      if (String(line.id) === String(productId)) {
        const updatedItem = updated.find(item => String(item.id) === String(productId));
        return { ...line, quantity: updatedItem ? updatedItem.quantity : line.quantity };
      }
      return line;
    }));

    setDraftCart(updated);
    localStorage.setItem('customer_order_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('customer-cart-update'));
  };

  const removeDraftItem = (productId: string) => {
    const updated = draftCart.filter(item => String(item.id) !== String(productId));
    setDraftCart(updated);
    localStorage.setItem('customer_order_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('customer-cart-update'));
  };

  const submitDraftOrder = async (remarks?: string, billingAddress?: string, shippingAddress?: string) => {
    if (resolvedDraftLines.length === 0) return;
    try {
      const subtotal = resolvedDraftLines.reduce((sum, line) => sum + (line.quantity * line.price), 0);
      const payload = {
        order: {
          order_number: `SO-${Math.floor(Date.now() / 1000)}`,
          company_id: '1',
          currency_code: 'INR',
          exchange_rate: 1.0,
          status: 'DRAFT',
          subtotal: subtotal,
          total_amount: subtotal,
          notes: remarks || 'Placed via Customer Portal',
          billing_address_snapshot_json: billingAddress ? { address: billingAddress } : undefined,
          shipping_address_snapshot_json: shippingAddress ? { address: shippingAddress } : undefined
        },
        lines: resolvedDraftLines.map(line => ({
          product_id: line.product_id ? String(line.product_id) : '',
          variant_id: line.variant_id ? String(line.variant_id) : '',
          sku: line.sku,
          product_name_snapshot: line.product_name,
          quantity: line.quantity,
          unit_price: line.price,
          line_total: line.quantity * line.price,
          company_id: '1'
        }))
      };

      await apiClient.post('/sales/customer/orders', payload);
      localStorage.setItem('customer_order_cart', '[]');
      setDraftCart([]);
      setResolvedDraftLines([]);
      window.dispatchEvent(new Event('customer-cart-update'));
      navigate('/orders');
    } catch (err: any) {
      console.error(err);
    }
  };

  const resolvedKeysRef = useRef<string>('');

  useEffect(() => {
    loadDraftCart();
    fetchAddresses();
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

  const props: OrderCartProps = {
    draftCart,
    resolvedDraftLines,
    loadingDraft,
    updateDraftQty,
    removeDraftItem,
    submitDraftOrder,
    addresses,
    billingAddress,
    setBillingAddress,
    shippingAddress,
    setShippingAddress,
    createAddress,
    refreshCart: loadDraftCart
  };

  return isDesktop ? <OrderCartDesktop {...props} /> : <OrderCartMobile {...props} />;
};
