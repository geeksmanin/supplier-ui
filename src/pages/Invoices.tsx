import React, { useState, useEffect } from 'react';
import { useMediaQuery, apiClient } from '@geeksman/core-ui';
import { InvoicesDesktop } from './Invoices.desktop';
import { InvoicesMobile } from './Invoices.mobile';

export interface InvoiceLine {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  status: 'DRAFT' | 'UNPAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
}

export interface InvoicesProps {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  search: string;
  setSearch: (val: string) => void;
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;
  invoiceLines: InvoiceLine[];
  loadingDetail: boolean;
  fetchInvoiceDetail: (invoice: Invoice) => Promise<void>;
  triggerDownload: (invoice: Invoice) => void;
  refreshInvoices: () => Promise<void>;
}

export const Invoices: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/sales/customer/invoices');
      setInvoices(res.data?.data || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch invoices from billing account.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceDetail = async (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setLoadingDetail(true);
    try {
      const res = await apiClient.get(`/sales/customer/invoices/${invoice.id}`);
      setInvoiceLines(res.data?.data?.lines || []);
    } catch (err) {
      console.error("Failed to load invoice details:", err);
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const triggerDownload = (invoice: Invoice) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body { font-family: sans-serif; padding: 2rem; color: #333; }
            .header { border-bottom: 2px solid #333; padding-bottom: 1rem; margin-bottom: 2rem; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 2rem; }
            .table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
            .th, .td { border: 1px solid #ccc; padding: 0.75rem; text-align: left; }
            .total { font-weight: bold; font-size: 1.2rem; text-align: right; margin-top: 2rem; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>GEEKSMAN ENTERPRISE</h1>
            <p>Official Sales Invoice</p>
          </div>
          <div class="meta">
            <div>
              <strong>Invoice No:</strong> ${invoice.invoice_number}<br/>
              <strong>Date:</strong> ${formatDate(invoice.invoice_date)}<br/>
              <strong>Due Date:</strong> ${formatDate(invoice.due_date)}
            </div>
            <div>
              <strong>Status:</strong> ${invoice.status}
            </div>
          </div>
          <h2>Billing Amount Due: $${Number(invoice.total_amount).toFixed(2)}</h2>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const props: InvoicesProps = {
    invoices,
    loading,
    error,
    search,
    setSearch,
    selectedInvoice,
    setSelectedInvoice,
    invoiceLines,
    loadingDetail,
    fetchInvoiceDetail,
    triggerDownload,
    refreshInvoices: fetchInvoices
  };

  return isDesktop ? <InvoicesDesktop {...props} /> : <InvoicesMobile {...props} />;
};
