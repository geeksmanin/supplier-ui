import React, { useState, useEffect } from 'react';
import { useMediaQuery, apiClient } from '@geeksman/core-ui';
import { QuotationsDesktop } from './Quotations.desktop';
import { QuotationsMobile } from './Quotations.mobile';

export interface QuotationLine {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_name?: string; // Resolved client-side
}

export interface Quotation {
  id: string;
  quotation_number: string;
  quotation_date: string;
  valid_until: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  remarks: string;
  total_amount: number;
}

export interface QuotationsProps {
  quotations: Quotation[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (val: string) => void;
  selectedQuotation: Quotation | null;
  setSelectedQuotation: (quotation: Quotation | null) => void;
  quotationLines: QuotationLine[];
  loadingDetail: boolean;
  fetchQuotationDetail: (quotation: Quotation) => Promise<void>;
}

export const Quotations: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [quotationLines, setQuotationLines] = useState<QuotationLine[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/sales/customer/quotations');
      setQuotations(res.data?.data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch quotations from customer account.');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotationDetail = async (quotation: Quotation) => {
    setSelectedQuotation(quotation);
    setLoadingDetail(true);
    try {
      const detailRes = await apiClient.get(`/sales/customer/quotations/${quotation.id}`);
      const rawLines = detailRes.data?.data?.lines || [];
      
      // Resolve variant names
      const resolvedLines = await Promise.all(
        rawLines.map(async (line: any) => {
          if (line.variant_id) {
            try {
              const vRes = await apiClient.get(`/catalogue/customer/variants/${line.variant_id}`);
              return {
                ...line,
                product_name: vRes.data?.data?.name || `Variant (${line.variant_id})`
              };
            } catch {
              return { ...line, product_name: `Variant (${line.variant_id})` };
            }
          }
          return { ...line, product_name: `Product (${line.product_id})` };
        })
      );
      
      setQuotationLines(resolvedLines);
    } catch (err) {
      console.error("Failed to load quotation details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const props: QuotationsProps = {
    quotations,
    loading,
    error,
    search,
    setSearch,
    selectedQuotation,
    setSelectedQuotation,
    quotationLines,
    loadingDetail,
    fetchQuotationDetail
  };

  return isDesktop ? <QuotationsDesktop {...props} /> : <QuotationsMobile {...props} />;
};
