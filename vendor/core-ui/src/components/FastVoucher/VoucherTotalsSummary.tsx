import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { VoucherSummary } from './FastVoucherEntryLayout.types';
import { TaxEngineResult } from './voucherTaxEngine';

export interface VoucherTotalsSummaryProps {
  activeSummary: VoucherSummary;
  computed: TaxEngineResult;
}

export const VoucherTotalsSummary: React.FC<VoucherTotalsSummaryProps> = ({
  activeSummary,
  computed,
}) => {
  const [isTaxDetailsExpanded, setIsTaxDetailsExpanded] = useState(false);

  const itemDiscounts = activeSummary.itemDiscountsTotal ?? computed.itemDiscountsTotal ?? 0;
  const docDiscount = activeSummary.documentDiscountTotal ?? computed.documentDiscountTotal ?? 0;
  const grossSubtotal = itemDiscounts > 0 ? +(activeSummary.subtotal + itemDiscounts).toFixed(2) : activeSummary.subtotal;

  const slabsList = Object.values(computed.taxSlabs).filter(
    (s) => s.taxableAmount > 0 || s.taxAmount > 0
  );

  return (
    <div
      style={{
        borderTop: '1px dashed #cbd5e1',
        paddingTop: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        fontSize: '0.8rem',
      }}
    >
      {itemDiscounts > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
          <span>Gross Amount:</span>
          <strong>₹{grossSubtotal.toFixed(2)}</strong>
        </div>
      )}

      {itemDiscounts > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontSize: '0.75rem' }}>
          <span>Item Discounts:</span>
          <span>-₹{itemDiscounts.toFixed(2)}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
        <span>Subtotal (Taxable):</span>
        <strong>₹{activeSummary.subtotal.toFixed(2)}</strong>
      </div>

      {docDiscount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontSize: '0.75rem' }}>
          <span>Overall Discount:</span>
          <span>-₹{docDiscount.toFixed(2)}</span>
        </div>
      )}

      {/* Tax Slabs Collapsible Breakdown */}
      <div style={{ borderTop: '1px dotted #e2e8f0', paddingTop: '4px' }}>
        <button
          type="button"
          onClick={() => setIsTaxDetailsExpanded((prev) => !prev)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'none',
            border: 'none',
            padding: '2px 0',
            cursor: 'pointer',
            fontSize: '0.75rem',
            color: '#059669',
            fontWeight: 700,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Tax Breakdown ({computed.isInterState ? 'IGST' : 'CGST+SGST'}):</span>
            {isTaxDetailsExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </div>
          <span>+₹{activeSummary.tax_total.toFixed(2)}</span>
        </button>

        {/* Clear breakdown of CGST, SGST, IGST totals */}
        {activeSummary.tax_total > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              paddingLeft: '8px',
              marginTop: '2px',
              fontSize: '0.72rem',
              color: '#166534',
            }}
          >
            {computed.isInterState ? (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>IGST Total:</span>
                <span>+₹{activeSummary.tax_breakup.igst.toFixed(2)}</span>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>CGST Total:</span>
                  <span>+₹{activeSummary.tax_breakup.cgst.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SGST Total:</span>
                  <span>+₹{activeSummary.tax_breakup.sgst.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        )}

        {isTaxDetailsExpanded && (
          <div
            style={{
              backgroundColor: '#f0fdf4',
              borderRadius: '6px',
              padding: '6px 8px',
              marginTop: '4px',
              fontSize: '0.7rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
            }}
          >
            {slabsList.map((slab) => (
              <div key={slab.rate} style={{ display: 'flex', justifyContent: 'space-between', color: '#166534' }}>
                <span>
                  GST @ {slab.rate}% (on ₹{slab.taxableAmount.toFixed(2)}):
                </span>
                <span>
                  {computed.isInterState
                    ? `IGST: ₹${slab.igst.toFixed(2)}`
                    : `C: ₹${slab.cgst.toFixed(2)} + S: ₹${slab.sgst.toFixed(2)}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {activeSummary.shipping_charges > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
          <span>Freight / Shipping:</span>
          <strong>+₹{activeSummary.shipping_charges.toFixed(2)}</strong>
        </div>
      )}

      {Boolean(activeSummary.other_charges && activeSummary.other_charges > 0) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
          <span>Labour / Other Charges:</span>
          <strong>+₹{(activeSummary.other_charges || 0).toFixed(2)}</strong>
        </div>
      )}

      {activeSummary.round_off !== 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem' }}>
          <span>Round Off:</span>
          <span>
            {activeSummary.round_off > 0
              ? `+₹${activeSummary.round_off.toFixed(2)}`
              : `-₹${Math.abs(activeSummary.round_off).toFixed(2)}`}
          </span>
        </div>
      )}

      {/* Grand Total */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          borderTop: '2px solid #0f172a',
          paddingTop: '0.5rem',
          marginTop: '0.25rem',
        }}
      >
        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Grand Total:</span>
        <span style={{ fontWeight: 900, fontSize: '1.35rem', color: '#2563eb' }}>
          ₹{activeSummary.grand_total.toFixed(2)}
        </span>
      </div>
    </div>
  );
};
