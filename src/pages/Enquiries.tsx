import React, { useState, useEffect } from 'react';
import { useMediaQuery, apiClient } from '@geeksman/core-ui';
import { EnquiriesDesktop } from './Enquiries.desktop';
import { EnquiriesMobile } from './Enquiries.mobile';

export interface EnquiryLine {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  product_name?: string;
  price?: number;
}

export interface Enquiry {
  id: string;
  enquiry_number: string;
  enquiry_date: string;
  status: 'DRAFT' | 'SUBMITTED' | 'CONVERTED' | 'CLOSED' | 'CANCELLED';
  remarks: string;
}

export interface EnquiriesProps {
  enquiries: Enquiry[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (val: string) => void;
  selectedEnquiry: Enquiry | null;
  setSelectedEnquiry: (enquiry: Enquiry | null) => void;
  enquiryLines: EnquiryLine[];
  loadingDetail: boolean;
  fetchEnquiryDetail: (enquiry: Enquiry) => Promise<void>;
  refreshEnquiries: () => Promise<void>;
}

export const Enquiries: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [enquiryLines, setEnquiryLines] = useState<EnquiryLine[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/sales/customer/enquiries');
      setEnquiries(res.data?.data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch enquiries from customer account.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnquiryDetail = async (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setLoadingDetail(true);
    try {
      const detailRes = await apiClient.get(`/sales/customer/enquiries/${enquiry.id}`);
      const rawLines = detailRes.data?.data?.lines || [];
      
      const resolvedLines = await Promise.all(
        rawLines.map(async (line: any) => {
          if (line.variant_id) {
            try {
              const vRes = await apiClient.get(`/catalogue/customer/variants/${line.variant_id}`);
              const variant = vRes.data?.data;
              return {
                ...line,
                product_name: variant?.name || `Variant (${line.variant_id})`,
                price: variant?.sale_price || variant?.price || 0
              };
            } catch {
              return { ...line, product_name: `Variant (${line.variant_id})`, price: 0 };
            }
          }
          return { ...line, product_name: `Product (${line.product_id})`, price: 0 };
        })
      );
      
      setEnquiryLines(resolvedLines);
    } catch (err) {
      console.error("Failed to load enquiry details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  useEffect(() => {
    if (enquiries.length > 0) {
      const searchStr = window.location.hash.includes('?') 
        ? window.location.hash.substring(window.location.hash.indexOf('?')) 
        : window.location.search;
      const params = new URLSearchParams(searchStr);
      const enquiryId = params.get('enquiryId') || params.get('id');
      if (enquiryId) {
        const matched = enquiries.find(e => String(e.id) === String(enquiryId));
        if (matched) {
          fetchEnquiryDetail(matched);
        }
      }
    }
  }, [enquiries]);

  const props: EnquiriesProps = {
    enquiries,
    loading,
    error,
    search,
    setSearch,
    selectedEnquiry,
    setSelectedEnquiry,
    enquiryLines,
    loadingDetail,
    fetchEnquiryDetail,
    refreshEnquiries: fetchEnquiries
  };

  return isDesktop ? <EnquiriesDesktop {...props} /> : <EnquiriesMobile {...props} />;
};
