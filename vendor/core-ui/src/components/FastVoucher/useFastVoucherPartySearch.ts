import { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../../api/client';
import { VoucherPartyConfig, VoucherPartyOption } from './FastVoucherEntryLayout.types';

export interface UseFastVoucherPartySearchProps {
  partyConfig?: VoucherPartyConfig;
  partyRole?: 'supplier' | 'customer' | 'both';
  voucherType?: string;
}

export function useFastVoucherPartySearch({ partyConfig, partyRole, voucherType }: UseFastVoucherPartySearchProps) {
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [asyncPartyOptions, setAsyncPartyOptions] = useState<VoucherPartyOption[]>([]);
  const [partyLoading, setPartyLoading] = useState(false);

  // Infer effective party role (e.g. supplier for purchase, customer for sales)
  const effectivePartyRole = useMemo(() => {
    if (partyRole) return partyRole;
    if (partyConfig?.searchParams?.organisation_type) {
      return partyConfig.searchParams.organisation_type as 'supplier' | 'customer' | 'both';
    }
    const lower = (voucherType || '').toLowerCase();
    if (lower.includes('purchase') || lower.includes('po') || lower.includes('pinv')) {
      return 'supplier';
    }
    if (lower.includes('sale') || lower.includes('so') || lower.includes('sinv')) {
      return 'customer';
    }
    return 'both';
  }, [partyRole, partyConfig?.searchParams?.organisation_type, voucherType]);

  const resolvedLabel = useMemo(() => {
    if (partyConfig?.label) return partyConfig.label;
    if (effectivePartyRole === 'supplier') return 'Supplier / Vendor';
    if (effectivePartyRole === 'customer') return 'Customer';
    return 'Party';
  }, [partyConfig?.label, effectivePartyRole]);

  const resolvedPlaceholder = useMemo(() => {
    if (partyConfig?.placeholder) return partyConfig.placeholder;
    if (effectivePartyRole === 'supplier') return 'Search supplier or vendor...';
    if (effectivePartyRole === 'customer') return 'Search customer organization...';
    return 'Search party...';
  }, [partyConfig?.placeholder, effectivePartyRole]);

  const resolvedEndpoint = partyConfig?.searchEndpoint || '/contacts/organisations';

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

    let isCancelled = false;
    const fetchParties = async () => {
      setPartyLoading(true);
      try {
        const queryParams: Record<string, any> = {
          search: partySearchQuery,
          limit: 50,
          ...(partyConfig?.searchParams || {}),
        };

        if (effectivePartyRole !== 'both' && !queryParams.organisation_type) {
          queryParams.organisation_type = effectivePartyRole;
        }

        const res = await apiClient.get(resolvedEndpoint, {
          params: queryParams,
        });

        const list = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
        if (!isCancelled) {
          setAsyncPartyOptions(
            list.map((it: any) => ({
              value: String(it.id || it.uuid),
              label: it.name || it.display_name || it.trade_name || it.company_name || 'Party',
              gstin: it.tax_number || it.gstin || it.tax_id || '',
              phone: it.phone || it.contact_number || it.primary_contact_phone || '',
              email: it.email || '',
              state: it.state || it.billing_address?.state || it.addresses?.[0]?.state || '',
              state_code: it.state_code || it.billing_address?.state_code || it.addresses?.[0]?.state_code || '',
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
  }, [partySearchQuery, resolvedEndpoint, partyConfig?.searchParams, partyConfig?.onSearch, effectivePartyRole]);

  return {
    isPartyDropdownOpen,
    setIsPartyDropdownOpen,
    partySearchQuery,
    setPartySearchQuery,
    asyncPartyOptions,
    partyLoading,
    effectivePartyRole,
    resolvedLabel,
    resolvedPlaceholder,
  };
}
