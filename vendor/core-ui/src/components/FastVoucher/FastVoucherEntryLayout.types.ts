import React from 'react';

export type VoucherBatchMode = 'select' | 'create' | 'none';

export type VoucherPricingMode = 
  | 'auto_from_party' 
  | 'auto_from_catalog' 
  | 'last_purchase_price' 
  | 'manual';

export interface VoucherPackagingOption {
  name: string;
  size: number;
  is_default?: boolean;
}

export interface VoucherPartyOption {
  value: string;
  label: string;
  gstin?: string;
  phone?: string;
  email?: string;
  state?: string;
  state_code?: string;
  meta?: any;
}

export interface VoucherPartyConfig {
  label: string;
  placeholder?: string;
  searchEndpoint?: string;
  searchParams?: Record<string, any>;
  options?: VoucherPartyOption[];
  defaultParty?: {
    id: string;
    name: string;
    gstin?: string;
    state?: string;
    state_code?: string;
  };
  allowQuickCreate?: boolean;
  onQuickCreate?: () => void;
}

export interface VoucherCatalogConfig {
  searchEndpoint?: string;
  searchParams?: Record<string, any>;
  validateStock?: boolean;
  warehouseId?: string;
  placeholder?: string;
}

export interface VoucherPricingConfig {
  mode: VoucherPricingMode;
  allowRateOverride?: boolean;
  taxInclusive?: boolean;
  autoFocusRateOnTab?: boolean;
}

export interface VoucherLineItem {
  id?: string | number;
  variant_id: string;
  product_id?: string;
  sku_code: string;
  product_name: string;
  image_url?: string;
  quantity: number;
  packaging_name: string;
  packaging_size: number;
  packagings?: VoucherPackagingOption[];
  batch_code?: string;
  expiry_date?: string;
  mrp?: number;
  unit_price: number;
  tax_percent: number;
  tax_amount: number;
  discount_percent: number;
  discount_amount: number;
  line_total: number;
  remarks?: string;
  metadata?: Record<string, any>;
}

export interface VoucherSummary {
  subtotal: number;
  discount_total: number;
  shipping_charges: number;
  tax_breakup: {
    cgst: number;
    sgst: number;
    igst: number;
  };
  tax_total: number;
  round_off: number;
  grand_total: number;
}

export interface FastVoucherEntryLayoutProps {
  voucherType: string;
  documentTitle: string;
  voucherNumber?: string;
  voucherDate: string;
  onVoucherDateChange?: (date: string) => void;
  status?: string;

  // Company / Statutory Context
  companyGstin?: string;
  companyStateCode?: string;

  // Configurations
  partyConfig: VoucherPartyConfig;
  catalogConfig?: VoucherCatalogConfig;
  batchMode?: VoucherBatchMode;
  pricingConfig?: VoucherPricingConfig;

  // Selected State
  selectedParty?: VoucherPartyOption | null;
  onPartySelect?: (party: VoucherPartyOption | null) => void;

  items: VoucherLineItem[];
  onAddItem: (item: VoucherLineItem) => void;
  onUpdateItem: (index: number, item: VoucherLineItem) => void;
  onRemoveItem: (index: number) => void;

  // Summary & Totals
  summary: VoucherSummary;
  onUpdateSummaryField?: (field: 'shipping_charges' | 'discount_total', value: number) => void;
  documentDiscountAmount?: number;
  documentDiscountPercent?: number;
  onDocumentDiscountChange?: (amount: number, percent: number) => void;
  shippingCharges?: number;
  onShippingChargesChange?: (charges: number) => void;
  isRoundOffEnabled?: boolean;
  onRoundOffToggle?: (enabled: boolean) => void;

  // Actions
  onSave: () => void | Promise<void>;
  onCancel?: () => void;
  isSaving?: boolean;
  saveButtonLabel?: string;

  // Bill Parking (F6 / F7)
  enableBillParking?: boolean;
  onParkBill?: () => void;
  onRecallBill?: (bill: any) => void;
  onClearForm?: () => void;
  parkedBillsCount?: number;

  // Draft Auto-Save & Banner (IndexedDB)
  draftKey?: string;
  isEdit?: boolean;
  moreDetails?: any;
  onRestoreDraft?: (draft: any) => void;

  // Secondary Details (F3 Drawer)
  moreDetailsBadgeCount?: number;
  renderMoreDetailsDrawer?: (isOpen: boolean, onClose: () => void) => React.ReactNode;

  // Slot Override for Right Pane (defaults to built-in live preview)
  renderRightPane?: () => React.ReactNode;
}
