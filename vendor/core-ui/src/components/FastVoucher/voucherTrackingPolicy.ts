import { VoucherBatchMode, VoucherSerialMode, VoucherTrackingPolicy } from './FastVoucherEntryLayout.types';

export const DEFAULT_VOUCHER_TRACKING_POLICY_MAP: Record<string, VoucherTrackingPolicy> = {
  PURCHASE_INVOICE: { batchMode: 'create', serialMode: 'create' },
  PURCHASE_BILL: { batchMode: 'create', serialMode: 'create' },
  GRN: { batchMode: 'create', serialMode: 'create' },
  SALES_INVOICE: { batchMode: 'select', serialMode: 'select' },
  POS_INVOICE: { batchMode: 'select', serialMode: 'select' },
  POS: { batchMode: 'select', serialMode: 'select' },
  DELIVERY_CHALLAN: { batchMode: 'select', serialMode: 'select' },
  SALES_CHALLAN: { batchMode: 'select', serialMode: 'select' },
  PURCHASE_ORDER: { batchMode: 'none', serialMode: 'none' },
  SALES_ORDER: { batchMode: 'none', serialMode: 'none' },
  QUOTATION: { batchMode: 'none', serialMode: 'none' },
  SALES_QUOTATION: { batchMode: 'none', serialMode: 'none' },
  ENQUIRY: { batchMode: 'none', serialMode: 'none' },
  RFQ: { batchMode: 'none', serialMode: 'none' },
};

export const NON_STOCK_PLANNING_VOUCHER_TYPES = new Set([
  'PURCHASE_ORDER',
  'SALES_ORDER',
  'QUOTATION',
  'SALES_QUOTATION',
  'ENQUIRY',
  'RFQ',
]);

/**
 * Resolves config-driven batch and serial entry modes for a voucher document type,
 * honoring explicit prop/override configuration while enforcing non-stock policies
 * on planning documents (PO, SO, Quotation, RFQ).
 */
export function resolveVoucherTrackingModes(
  voucherType?: string,
  batchModeOverride?: VoucherBatchMode,
  serialModeOverride?: VoucherSerialMode,
  policyMap?: Record<string, VoucherTrackingPolicy>
): VoucherTrackingPolicy {
  const normType = String(voucherType || '')
    .trim()
    .toUpperCase()
    .replace(/[-\s]+/g, '_');
  if (NON_STOCK_PLANNING_VOUCHER_TYPES.has(normType)) {
    return { batchMode: 'none', serialMode: 'none' };
  }
  const merged = policyMap
    ? { ...DEFAULT_VOUCHER_TRACKING_POLICY_MAP, ...policyMap }
    : DEFAULT_VOUCHER_TRACKING_POLICY_MAP;
  const fallback: VoucherTrackingPolicy = merged[normType] || {
    batchMode: 'none',
    serialMode: 'none',
  };
  return {
    batchMode: batchModeOverride ?? fallback.batchMode,
    serialMode: serialModeOverride ?? fallback.serialMode,
  };
}
