import React, { useState, useEffect } from 'react';
import { apiClient, useToast, useMediaQuery } from '@geeksman/core-ui';
import { SubscriptionsDesktop } from './Subscriptions.desktop';
import { SubscriptionsMobile } from './Subscriptions.mobile';

export interface Subscription {
  id: number;
  customer_id: string;
  product_id: string;
  product_variant_id: string;
  subscription_name: string;
  license_number: string;
  status: 'ACTIVE' | 'EXPIRING' | 'EXPIRED' | 'CANCELLED';
  start_date: string;
  end_date: string;
}

export interface SubscriptionsProps {
  subscriptions: Subscription[];
  loading: boolean;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  fetchSubscriptions: () => Promise<void>;
}

export const Subscriptions: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { showToast } = useToast();

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSubscriptions = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      
      const res = await apiClient.get('/sales/customer/subscriptions', { params });
      let data: Subscription[] = res.data?.data || [];
      
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        data = data.filter(sub => 
          sub.subscription_name.toLowerCase().includes(query) ||
          sub.license_number.toLowerCase().includes(query)
        );
      }
      
      setSubscriptions(data);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
      showToast('Failed to fetch subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [filterStatus, searchQuery]);

  const props: SubscriptionsProps = {
    subscriptions,
    loading,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    fetchSubscriptions,
  };

  return isDesktop ? <SubscriptionsDesktop {...props} /> : <SubscriptionsMobile {...props} />;
};
