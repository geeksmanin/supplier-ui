import { VoucherLineItem, VoucherSummary, VoucherPartyOption } from './FastVoucherEntryLayout.types';

export interface TaxSlabBreakdown {
  rate: number;
  taxableAmount: number;
  taxAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export interface TaxEngineInput {
  items: VoucherLineItem[];
  party?: VoucherPartyOption | null;
  companyGstin?: string;
  companyStateCode?: string;
  documentDiscountAmount?: number;
  documentDiscountPercent?: number;
  shippingCharges?: number;
  isRoundOffEnabled?: boolean;
}

export interface TaxEngineResult extends VoucherSummary {
  isInterState: boolean;
  companyState: string;
  partyState: string;
  itemDiscountsTotal: number;
  documentDiscountTotal: number;
  taxSlabs: Record<number, TaxSlabBreakdown>;
}

/**
 * Extracts a 2-digit Indian GST state code from a GSTIN or state code string.
 */
export function extractStateCode(gstinOrCode?: string): string {
  if (!gstinOrCode) return '';
  const trimmed = gstinOrCode.trim();
  // If starts with 2 digits (e.g. 27AAAAA0000A1Z5)
  if (/^\d{2}/.test(trimmed)) {
    return trimmed.substring(0, 2);
  }
  return '';
}

/**
 * Computes live voucher financial slip totals including GST tax splits,
 * tax rate slabs, document discounts, freight, and auto round-off.
 */
export function computeVoucherSummary({
  items,
  party,
  companyGstin = '',
  companyStateCode = '',
  documentDiscountAmount = 0,
  documentDiscountPercent = 0,
  shippingCharges = 0,
  isRoundOffEnabled = true,
}: TaxEngineInput): TaxEngineResult {
  const companyState = companyStateCode || extractStateCode(companyGstin);
  const partyState = party?.state_code || extractStateCode(party?.gstin);

  // If both are present and differ, transaction is Inter-State (IGST)
  // Otherwise default to Intra-State (CGST + SGST)
  const isInterState = Boolean(companyState && partyState && companyState !== partyState);

  let subtotal = 0;
  let itemDiscountsTotal = 0;
  const taxSlabs: Record<number, TaxSlabBreakdown> = {};

  items.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const rate = Number(item.unit_price) || 0;
    const grossAmount = +(qty * rate).toFixed(2);

    let lineDiscount = 0;
    if (item.discount_amount && Number(item.discount_amount) > 0) {
      lineDiscount = Number(item.discount_amount);
    } else if (item.discount_percent && Number(item.discount_percent) > 0) {
      lineDiscount = +((grossAmount * Number(item.discount_percent)) / 100).toFixed(2);
    }

    const taxableAmount = Math.max(0, +(grossAmount - lineDiscount).toFixed(2));
    const taxRate = Number(item.tax_percent) || 0;
    const taxAmount = +((taxableAmount * taxRate) / 100).toFixed(2);

    subtotal += taxableAmount;
    itemDiscountsTotal += lineDiscount;

    // Aggregate into tax rate slabs
    if (!taxSlabs[taxRate]) {
      taxSlabs[taxRate] = {
        rate: taxRate,
        taxableAmount: 0,
        taxAmount: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
      };
    }

    taxSlabs[taxRate].taxableAmount = +(taxSlabs[taxRate].taxableAmount + taxableAmount).toFixed(2);
    taxSlabs[taxRate].taxAmount = +(taxSlabs[taxRate].taxAmount + taxAmount).toFixed(2);

    if (isInterState) {
      taxSlabs[taxRate].igst = taxSlabs[taxRate].taxAmount;
      taxSlabs[taxRate].cgst = 0;
      taxSlabs[taxRate].sgst = 0;
    } else {
      const halfTax = +(taxSlabs[taxRate].taxAmount / 2).toFixed(2);
      taxSlabs[taxRate].cgst = halfTax;
      taxSlabs[taxRate].sgst = +(taxSlabs[taxRate].taxAmount - halfTax).toFixed(2);
      taxSlabs[taxRate].igst = 0;
    }
  });

  subtotal = +subtotal.toFixed(2);
  itemDiscountsTotal = +itemDiscountsTotal.toFixed(2);

  // Document-level discount
  let documentDiscountTotal = 0;
  if (documentDiscountAmount > 0) {
    documentDiscountTotal = Number(documentDiscountAmount);
  } else if (documentDiscountPercent > 0) {
    documentDiscountTotal = +((subtotal * documentDiscountPercent) / 100).toFixed(2);
  }
  documentDiscountTotal = +documentDiscountTotal.toFixed(2);

  // Total tax from slabs
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;
  let taxTotal = 0;

  Object.values(taxSlabs).forEach((slab) => {
    cgstTotal += slab.cgst;
    sgstTotal += slab.sgst;
    igstTotal += slab.igst;
    taxTotal += slab.taxAmount;
  });

  cgstTotal = +cgstTotal.toFixed(2);
  sgstTotal = +sgstTotal.toFixed(2);
  igstTotal = +igstTotal.toFixed(2);
  taxTotal = +taxTotal.toFixed(2);

  const totalDiscount = +(itemDiscountsTotal + documentDiscountTotal).toFixed(2);
  const freight = +(Number(shippingCharges) || 0).toFixed(2);

  const unroundedTotal = +(subtotal - documentDiscountTotal + taxTotal + freight).toFixed(2);

  let grandTotal = unroundedTotal;
  let roundOff = 0;

  if (isRoundOffEnabled) {
    grandTotal = Math.round(unroundedTotal);
    roundOff = +(grandTotal - unroundedTotal).toFixed(2);
  }

  return {
    subtotal,
    discount_total: totalDiscount,
    itemDiscountsTotal,
    documentDiscountTotal,
    shipping_charges: freight,
    tax_breakup: {
      cgst: cgstTotal,
      sgst: sgstTotal,
      igst: igstTotal,
    },
    tax_total: taxTotal,
    round_off: roundOff,
    grand_total: grandTotal,
    isInterState,
    companyState,
    partyState,
    taxSlabs,
  };
}
