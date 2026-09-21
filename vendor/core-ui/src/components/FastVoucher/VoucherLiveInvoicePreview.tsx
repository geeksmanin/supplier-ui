import React, { useState } from 'react';
import { 
  VoucherLineItem, 
  VoucherSummary, 
  VoucherPartyOption 
} from './FastVoucherEntryLayout.types';
import { computeVoucherSummary } from './voucherTaxEngine';
import { 
  FileText, 
  User, 
  MapPin, 
  Phone, 
  Percent, 
  Truck, 
  Save, 
  RotateCcw, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export interface VoucherLiveInvoicePreviewProps {
  documentTitle: string;
  voucherNumber?: string;
  voucherDate: string;
  status?: string;
  party?: VoucherPartyOption | null;
  companyGstin?: string;
  companyStateCode?: string;
  items: VoucherLineItem[];
  summary?: VoucherSummary;
  documentDiscountAmount?: number;
  documentDiscountPercent?: number;
  onDocumentDiscountChange?: (amount: number, percent: number) => void;
  shippingCharges?: number;
  onShippingChargesChange?: (charges: number) => void;
  isRoundOffEnabled?: boolean;
  onRoundOffToggle?: (enabled: boolean) => void;
  discountInputRef?: React.RefObject<HTMLInputElement | null>;
  freightInputRef?: React.RefObject<HTMLInputElement | null>;
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
  saveButtonLabel?: string;
  onCancel?: () => void;
}

export const VoucherLiveInvoicePreview: React.FC<VoucherLiveInvoicePreviewProps> = ({
  documentTitle,
  voucherNumber = 'DRAFT',
  voucherDate,
  status = 'DRAFT',
  party,
  companyGstin = '',
  companyStateCode = '',
  items,
  summary: externalSummary,
  documentDiscountAmount = 0,
  documentDiscountPercent = 0,
  onDocumentDiscountChange,
  shippingCharges = 0,
  onShippingChargesChange,
  isRoundOffEnabled = true,
  onRoundOffToggle,
  discountInputRef,
  freightInputRef,
  onSave,
  isSaving = false,
  saveButtonLabel = 'Save Document (F10)',
  onCancel,
}) => {
  const [isTaxDetailsExpanded, setIsTaxDetailsExpanded] = useState(false);
  const [discountMode, setDiscountMode] = useState<'flat' | 'percent'>(
    documentDiscountPercent > 0 ? 'percent' : 'flat'
  );

  // Re-compute live slip calculations
  const computed = computeVoucherSummary({
    items,
    party,
    companyGstin,
    companyStateCode,
    documentDiscountAmount,
    documentDiscountPercent,
    shippingCharges,
    isRoundOffEnabled,
  });

  const activeSummary = externalSummary || computed;
  const slabsList = Object.values(computed.taxSlabs).filter((s) => s.taxableAmount > 0 || s.taxAmount > 0);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#ffffff',
        overflowY: 'auto',
      }}
    >
      {/* ── Document Slip Header ── */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px dashed #cbd5e1',
          backgroundColor: '#f8fafc',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              {documentTitle}
            </span>
            <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
              #{voucherNumber}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '0.65rem',
                fontWeight: 700,
                color: status === 'APPROVED' ? '#059669' : '#d97706',
                backgroundColor: status === 'APPROVED' ? '#ecfdf5' : '#fef3c7',
                padding: '2px 8px',
                borderRadius: '9999px',
                textTransform: 'uppercase',
              }}
            >
              {status}
            </span>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
              {voucherDate || new Date().toISOString().split('T')[0]}
            </div>
          </div>
        </div>

        {/* Party Card */}
        <div
          style={{
            marginTop: '0.75rem',
            padding: '8px 10px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <User size={13} color="#2563eb" />
            <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
              {party ? party.label : 'Select Party (Press F2)'}
            </span>
          </div>
          {party?.gstin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontFamily: 'monospace',
                  backgroundColor: '#f1f5f9',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  color: '#334155',
                  fontWeight: 700,
                }}
              >
                GSTIN: {party.gstin}
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  color: computed.isInterState ? '#d97706' : '#059669',
                  backgroundColor: computed.isInterState ? '#fef3c7' : '#ecfdf5',
                  padding: '1px 5px',
                  borderRadius: '3px',
                }}
              >
                {computed.isInterState ? 'Inter-State (IGST)' : 'Intra-State (CGST+SGST)'}
              </span>
            </div>
          )}
          {party?.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
              <Phone size={11} />
              <span>{party.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Line Items Mini Slip ── */}
      <div style={{ flex: 1, padding: '0.85rem 1.25rem', overflowY: 'auto' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '6px',
            fontSize: '0.75rem',
            fontWeight: 800,
            color: '#475569',
          }}
        >
          <span>Line Items ({items.length})</span>
          <span>Amount (₹)</span>
        </div>

        {items.length === 0 ? (
          <div
            style={{
              padding: '1.5rem 0',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '0.75rem',
              borderBottom: '1px dashed #e2e8f0',
            }}
          >
            No items added yet. Use Product Search [Ctrl+K] to add lines.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.75rem' }}>
            {items.map((item, idx) => (
              <div
                key={item.variant_id + '_' + idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  fontSize: '0.75rem',
                  padding: '4px 0',
                }}
              >
                <div style={{ flex: 1, paddingRight: '8px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>
                    {idx + 1}. {item.product_name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '1px' }}>
                    {item.quantity} {item.packaging_name || 'Units'} × ₹{item.unit_price.toFixed(2)}
                    {item.batch_code ? ` • Batch: ${item.batch_code}` : ''}
                    {item.discount_percent > 0 ? ` • Disc: ${item.discount_percent}%` : ''}
                    {item.tax_percent > 0 ? ` • Tax: ${item.tax_percent}%` : ''}
                  </div>
                </div>
                <div style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                  ₹{item.line_total ? item.line_total.toFixed(2) : (item.quantity * item.unit_price).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Interactive Financial Adjustments ── */}
        <div style={{ padding: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Document Discount Control */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Tag size={13} color="#64748b" />
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                Overall Discount
              </label>
              <kbd style={{ fontSize: '0.6rem', padding: '1px 4px', backgroundColor: '#f1f5f9', color: '#94a3b8', borderRadius: '3px' }}>
                Alt+D
              </kbd>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  fontSize: '0.65rem',
                  fontWeight: 700,
                }}
              >
                <button
                  type="button"
                  onClick={() => setDiscountMode('flat')}
                  style={{
                    padding: '2px 6px',
                    border: 'none',
                    backgroundColor: discountMode === 'flat' ? '#2563eb' : '#f8fafc',
                    color: discountMode === 'flat' ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  ₹
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountMode('percent')}
                  style={{
                    padding: '2px 6px',
                    border: 'none',
                    backgroundColor: discountMode === 'percent' ? '#2563eb' : '#f8fafc',
                    color: discountMode === 'percent' ? '#ffffff' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  %
                </button>
              </div>

              <input
                ref={discountInputRef}
                type="number"
                min="0"
                step="any"
                value={discountMode === 'percent' ? (documentDiscountPercent || '') : (documentDiscountAmount || '')}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  if (discountMode === 'percent') {
                    onDocumentDiscountChange?.(0, val);
                  } else {
                    onDocumentDiscountChange?.(val, 0);
                  }
                }}
                placeholder="0"
                style={{
                  width: '80px',
                  textAlign: 'right',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Freight / Shipping Control */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Truck size={13} color="#64748b" />
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
                Freight / Shipping
              </label>
              <kbd style={{ fontSize: '0.6rem', padding: '1px 4px', backgroundColor: '#f1f5f9', color: '#94a3b8', borderRadius: '3px' }}>
                Alt+F
              </kbd>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>+₹</span>
              <input
                ref={freightInputRef}
                type="number"
                min="0"
                step="any"
                value={shippingCharges || ''}
                onChange={(e) => onShippingChargesChange?.(parseFloat(e.target.value) || 0)}
                placeholder="0"
                style={{
                  width: '80px',
                  textAlign: 'right',
                  padding: '3px 6px',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Round-off Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
              Auto Round-Off
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', gap: '6px' }}>
              <input
                type="checkbox"
                checked={isRoundOffEnabled}
                onChange={(e) => onRoundOffToggle?.(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {isRoundOffEnabled ? 'Enabled' : 'Exact'}
              </span>
            </label>
          </div>
        </div>

        {/* ── Financial Totals Summary ── */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
            <span>Subtotal:</span>
            <strong>₹{activeSummary.subtotal.toFixed(2)}</strong>
          </div>

          {computed.itemDiscountsTotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontSize: '0.75rem' }}>
              <span>Item Discounts:</span>
              <span>-₹{computed.itemDiscountsTotal.toFixed(2)}</span>
            </div>
          )}

          {computed.documentDiscountTotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626', fontSize: '0.75rem' }}>
              <span>Document Discount:</span>
              <span>-₹{computed.documentDiscountTotal.toFixed(2)}</span>
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
      </div>

      {/* ── Sticky Slip Actions ── */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid #e2e8f0',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || items.length === 0}
          style={{
            width: '100%',
            padding: '11px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: items.length > 0 ? '#2563eb' : '#94a3b8',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: items.length > 0 && !isSaving ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: items.length > 0 ? '0 4px 14px rgba(37, 99, 235, 0.35)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <Save size={18} />
          <span>{isSaving ? 'Saving Document...' : saveButtonLabel}</span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '7px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#64748b',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Cancel (Esc)
          </button>
        )}
      </div>
    </div>
  );
};
