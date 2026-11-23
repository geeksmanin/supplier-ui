import { useState, useEffect, useMemo, useRef } from 'react';
import { apiClient } from '../../api/client';
import { VoucherPartyConfig, VoucherPartyOption } from './FastVoucherEntryLayout.types';

export interface UseFastVoucherPartySearchProps {
  partyConfig?: VoucherPartyConfig;
  partyRole?: 'supplier' | 'customer' | 'both';
  voucherType?: string;
  enabled?: boolean;
}

export function useFastVoucherPartySearch({
  partyConfig,
  partyRole,
  voucherType,
  enabled = true,
}: UseFastVoucherPartySearchProps) {
  const [isPartyDropdownOpen, setIsPartyDropdownOpen] = useState(false);
  const [partySearchQuery, setPartySearchQuery] = useState('');
  const [asyncPartyOptions, setAsyncPartyOptions] = useState<VoucherPartyOption[]>([]);
  const [partyLoading, setPartyLoading] = useState(false);

  const onSearchRef = useRef(partyConfig?.onSearch);
  onSearchRef.current = partyConfig?.onSearch;

  const searchParamsStr = JSON.stringify(partyConfig?.searchParams || {});

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
    if (!enabled) return;

    let isCancelled = false;
    const timer = setTimeout(async () => {
      const activeOnSearch = onSearchRef.current;
      if (activeOnSearch) {
        setPartyLoading(true);
        try {
          const res = await activeOnSearch(partySearchQuery);
          if (!isCancelled && Array.isArray(res)) {
            setAsyncPartyOptions(res);
          }
        } catch (err) {
          console.error('Failed onSearch parties', err);
        } finally {
          if (!isCancelled) setPartyLoading(false);
        }
        return;
      }

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
            list.map((it: any) => {
              const billingAddr = it.billing_address || it.addresses?.find((a: any) => a.address_type === 'billing' || a.is_default) || it.addresses?.[0] || null;
              const shippingAddr = it.shipping_address || it.addresses?.find((a: any) => a.address_type === 'shipping') || it.addresses?.[0] || null;
              const gstinVal = it.tax_number || it.gstin || it.tax_id || '';
              const panVal = it.pan || it.pan_number || (gstinVal.length === 15 ? gstinVal.substring(2, 12) : '');
              const contactPerson = it.contact_person || it.primary_contact_name || it.contacts?.[0]?.full_name || '';

              return {
                value: String(it.id || it.uuid),
                label: it.name || it.display_name || it.trade_name || it.company_name || 'Party',
                gstin: gstinVal,
                pan: panVal,
                phone: it.phone || it.contact_number || it.primary_contact_phone || it.contacts?.[0]?.mobile_no || '',
                email: it.email || it.contacts?.[0]?.email || '',
                contact_person: contactPerson,
                state: it.state || billingAddr?.state || it.addresses?.[0]?.state || '',
                state_code: it.state_code || billingAddr?.state_code || it.addresses?.[0]?.state_code || '',
                billing_address: billingAddr,
                shipping_address: shippingAddr,
                meta: it,
              };
            })
          );
        }
      } catch (err) {
        console.error('Failed to fetch parties', err);
      } finally {
        if (!isCancelled) setPartyLoading(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, partySearchQuery, resolvedEndpoint, searchParamsStr, effectivePartyRole]);

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
