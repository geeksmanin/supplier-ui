import { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { VoucherPartyConfig, VoucherPartyOption } from './FastVoucherEntryLayout.types';

interface UseFastVoucherPartySearchProps {
  partyConfig?: VoucherPartyConfig;
}

export function useFastVoucherPartySearch({ partyConfig }: UseFastVoucherPartySearchProps) {
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [asyncPartyOptions, setAsyncPartyOptions] = useState<VoucherPartyOption[]>([]);
  const [partyLoading, setPartyLoading] = useState(false);

  useEffect(() => {
    if (partyConfig?.onSearch) {
      let isCancelled = false;
      setPartyLoading(true);
      partyConfig
        .onSearch(partySearchQuery)
        .then((res) => {
          if (!isCancelled && Array.isArray(res)) setAsyncPartyOptions(res);
        })
        .catch((err) => {
          console.error('Failed onSearch parties', err);
        })
        .finally(() => {
          if (!isCancelled) setPartyLoading(false);
        });
      return () => {
        isCancelled = true;
      };
    }

    if (!partyConfig?.searchEndpoint) return;

    let isCancelled = false;
    const fetchParties = async () => {
      setPartyLoading(true);
      try {
        const res = await apiClient.get(partyConfig.searchEndpoint!, {
          params: {
            search: partySearchQuery,
            ...(partyConfig.searchParams || {}),
            limit: 50,
          },
        });
        const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        if (!isCancelled) {
          setAsyncPartyOptions(
            list.map((it: any) => ({
              value: String(it.id || it.uuid),
              label: it.name || it.display_name || it.company_name || 'Party',
              gstin: it.tax_number || it.gstin || it.tax_id,
              phone: it.phone || it.contact_number || it.primary_contact_phone,
              email: it.email,
              state: it.state || it.billing_address?.state,
              state_code: it.state_code,
              meta: it,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch parties', err);
      } finally {
        if (!isCancelled) setPartyLoading(false);
      }
    };

    const timer = setTimeout(fetchParties, 200);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [partySearchQuery, partyConfig?.searchEndpoint, partyConfig?.searchParams, partyConfig?.onSearch]);

  return {
    isPartyDropdownOpen,
    setIsPartyDropdownOpen,
    partySearchQuery,
    setPartySearchQuery,
    asyncPartyOptions,
    partyLoading,
  };
}

