import React, { useState, useEffect } from 'react';
import { useMediaQuery, apiClient } from '@geeksman/core-ui';
import { OrdersDesktop } from './Orders.desktop';
import { OrdersMobile } from './Orders.mobile';

export interface OrderLine {
  id: string;
  product_name_snapshot: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Order {
  id: string;
  order_number: string;
  order_date: string;
  total_amount: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'CONFIRMED' | 'PARTIALLY_FULFILLED' | 'FULFILLED' | 'CANCELLED' | 'CLOSED';
}

export interface TimelineEvent {
  id: string;
  actor_name: string;
  action: string;
  created_at: string;
  remark?: string;
}

export interface OrdersProps {
  orders: Order[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (val: string) => void;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  orderLines: OrderLine[];
  timeline: TimelineEvent[];
  loadingDetail: boolean;
  fetchOrderDetail: (order: Order) => Promise<void>;
  // Draft order cart additions
  draftCart: any[];
  resolvedDraftLines: any[];
  loadingDraft: boolean;
  showDraftDetail: boolean;
  setShowDraftDetail: (val: boolean) => void;
  updateDraftQty: (productId: string, qty: number) => void;
  removeDraftItem: (productId: string) => void;
  submitDraftOrder: (remarks?: string) => Promise<void>;
  fetchOrders: () => Promise<void>;
}

export const Orders: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Draft cart states
  const [draftCart, setDraftCart] = useState<any[]>([]);
  const [resolvedDraftLines, setResolvedDraftLines] = useState<any[]>([]);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [showDraftDetail, setShowDraftDetail] = useState(false);

  const loadDraftCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('customer_order_cart') || '[]');
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
            const product = productsList.find((p: any) => String(p.id) === String(item.product_id || item.id));
            const name = product ? product.name : `Product (${item.product_id || item.id})`;
            const variants = product ? product.variants : [];
            const variant = variants.find((v: any) => String(v.id) === String(item.variant_id || item.id)) || variants?.[0];
            return {
              id: item.id,
              product_id: item.product_id || item.id,
              variant_id: variant?.id || '',
              quantity: item.quantity,
              price: item.price,
              product_name: name,
              sku: variant?.sku_code || '1 Pc',
              media_paths: product?.media_paths || variant?.media_paths || []
            };
          } catch {
            return {
              id: item.id,
              product_id: item.product_id || item.id,
              variant_id: item.variant_id || '',
              quantity: item.quantity,
              price: item.price,
              product_name: `Product (${item.product_id || item.id})`,
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
    localStorage.setItem('customer_order_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('customer-cart-update'));
  };

  const removeDraftItem = (productId: string) => {
    const updated = draftCart.filter(item => String(item.id) !== String(productId));
    setDraftCart(updated);
    localStorage.setItem('customer_order_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('customer-cart-update'));
  };

  const submitDraftOrder = async (remarks?: string) => {
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
          remarks: remarks || 'Placed via Customer Portal'
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
      setShowDraftDetail(false);
      window.dispatchEvent(new Event('customer-cart-update'));
      fetchOrders();
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDraftCart();
    
    // Refresh cart when update event is triggered
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

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/sales/customer/orders');
      setOrders(res.data?.data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch orders from customer account.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setShowDraftDetail(false);
    setLoadingDetail(true);
    try {
      const [detailRes, timelineRes] = await Promise.all([
        apiClient.get(`/sales/customer/orders/${order.id}`),
        apiClient.get(`/sales/customer/orders/${order.id}/timeline`).catch(() => ({ data: { data: [] } }))
      ]);
      setOrderLines(detailRes.data?.data?.lines || []);
      setTimeline(timelineRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load order details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      const searchStr = window.location.hash.includes('?') 
        ? window.location.hash.substring(window.location.hash.indexOf('?')) 
        : window.location.search;
      const params = new URLSearchParams(searchStr);
      const orderId = params.get('orderId') || params.get('id');
      if (orderId) {
        const matched = orders.find(o => String(o.id) === String(orderId));
        if (matched) {
          fetchOrderDetail(matched);
        }
      }
    }
  }, [orders]);

  const props: OrdersProps = {
    orders,
    loading,
    error,
    search,
    setSearch,
    selectedOrder,
    setSelectedOrder,
    orderLines,
    timeline,
    loadingDetail,
    fetchOrderDetail,
    draftCart,
    resolvedDraftLines,
    loadingDraft,
    showDraftDetail,
    setShowDraftDetail,
    updateDraftQty,
    removeDraftItem,
    submitDraftOrder,
    fetchOrders
  };

  return isDesktop ? <OrdersDesktop {...props} /> : <OrdersMobile {...props} />;
};
