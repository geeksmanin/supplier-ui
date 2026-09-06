import { useState, useEffect, useRef } from 'react';
import { fetchPostalCodeDetails, PostalCodeDetails, PostalCodeQueryOptions } from '../services/postalService';

export interface UsePostalCodeOptions extends PostalCodeQueryOptions {
  pincode: string;
  onAutofill?: (details: PostalCodeDetails) => void;
  debounceMs?: number;
}

export interface UsePostalCodeReturn {
  loading: boolean;
  data: PostalCodeDetails | null;
  refetch: () => Promise<PostalCodeDetails | null>;
}

/**
 * Hook to automatically look up state, city, and areas when a 6-digit PIN code is entered.
 */
export function usePostalCode({
  pincode,
  city,
  search,
  deliveryOnly,
  onAutofill,
  debounceMs = 250
}: UsePostalCodeOptions): UsePostalCodeReturn {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PostalCodeDetails | null>(null);
  const lastFetchedKeyRef = useRef<string>('');
  const onAutofillRef = useRef(onAutofill);
  onAutofillRef.current = onAutofill;

  const executeFetch = async (): Promise<PostalCodeDetails | null> => {
    const cleanPin = (pincode || '').trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setData(null);
      lastFetchedKeyRef.current = '';
      return null;
    }

    setLoading(true);
    try {
      const details = await fetchPostalCodeDetails(cleanPin, { city, search, deliveryOnly });
      if (details) {
        setData(details);
        lastFetchedKeyRef.current = `${cleanPin}:${city || ''}:${search || ''}`;
        if (onAutofillRef.current) {
          onAutofillRef.current(details);
        }
      } else {
        setData(null);
      }
      return details;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cleanPin = (pincode || '').trim().replace(/\D/g, '');
    if (cleanPin.length !== 6) {
      setData(null);
      lastFetchedKeyRef.current = '';
      return;
    }

    const currentKey = `${cleanPin}:${city || ''}:${search || ''}`;
    if (currentKey === lastFetchedKeyRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      executeFetch();
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [pincode, city, search, deliveryOnly, debounceMs]);

  return {
    loading,
    data,
    refetch: executeFetch
  };
}
