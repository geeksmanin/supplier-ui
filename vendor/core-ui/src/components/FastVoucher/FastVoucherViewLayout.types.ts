import React from 'react';

export type VoucherLedgerFilterTab = 'ALL' | 'STOCK' | 'PARTY' | 'TAX' | 'BRANCH';

export interface VoucherViewParty {
  id?: string;
  name: string;
  gstin?: string;
  phone?: string;
  email?: string;
  address?: string;
  role?: 'supplier' | 'customer' | 'transferee' | 'party';
  meta?: Record<string, any>;
}

export interface VoucherViewDates {
  documentDate?: string;
  invoiceDate?: string;
  dueDate?: string;
  postingDate?: string;
  createdAt?: string;
}

export interface VoucherViewReference {
  referenceNumber?: string;
  vendorBillNumber?: string;
  purchaseOrderNumber?: string;
  salesOrderNumber?: string;
  branchCode?: string;
  warehouseName?: string;
  currencyCode?: string;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface VoucherViewSummary {
  subtotal: number;
  discountAmount?: number;
  taxAmount: number;
  shippingCharges?: number;
  roundOff?: number;
  grandTotal: number;
  paidAmount?: number;
  balanceDue?: number;
}

export interface VoucherViewLineItem {
  id?: string | number;
  itemName: string;
  itemCode?: string;
  sku?: string;
  hsnCode?: string;
  quantity: number;
  currentStock?: number;
  uom?: string;
  unitPrice: number;
  discountAmount?: number;
  taxAmount?: number;
  lineTotal: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface VoucherViewPosting {
  id?: string | number;
  voucher_id?: number;
  voucher_number?: string;
  reference?: string;
  transaction_date?: string;
  ledger_target?: string;
  account_code?: string;
  account_name?: string;
  entry_type?: 'DEBIT' | 'CREDIT' | string;
  amount: number;
  narration?: string;
  // Interoperability camelCase aliases
  voucherId?: number;
  voucherNumber?: string;
  transactionDate?: string;
  ledgerTarget?: string;
  accountCode?: string;
  accountName?: string;
  entryType?: 'DEBIT' | 'CREDIT' | string;
}

export interface FastVoucherViewLayoutProps {
  voucherType: string;
  documentTitle?: string;
  documentNumber: string;
  status: string;
  settlementStatus?: string;
  party?: VoucherViewParty;
  dates?: VoucherViewDates;
  reference?: VoucherViewReference;
  summary: VoucherViewSummary;
  items?: VoucherViewLineItem[];
  postings?: VoucherViewPosting[];
  loading?: boolean;

  // Ledger Filter Controls
  activeLedgerTab?: VoucherLedgerFilterTab;
  onLedgerTabChange?: (tab: VoucherLedgerFilterTab) => void;

  // Actions
  onBack?: () => void;
  onEdit?: () => void;
  onApprove?: () => void | Promise<void>;
  onCancel?: () => void | Promise<void>;
  onRecordPayment?: () => void;

  // Extensibility Slots
  renderExtraActions?: () => React.ReactNode;
  renderCustomTop?: () => React.ReactNode;
  renderCustomBottom?: () => React.ReactNode;
}
