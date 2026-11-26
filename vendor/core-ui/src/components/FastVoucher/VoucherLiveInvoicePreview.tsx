import React, { useMemo, useRef, useEffect } from 'react';
import { 
  VoucherLineItem, 
  VoucherSummary, 
  VoucherPartyOption 
} from './FastVoucherEntryLayout.types';
import { computeVoucherSummary } from './voucherTaxEngine';
import { VoucherPartyDetailsCard } from './VoucherPartyDetailsCard';
import { VoucherLinesSummaryBar } from './VoucherLinesSummaryBar';
import { VoucherFinancialAdjustments } from './VoucherFinancialAdjustments';
import { VoucherTotalsSummary } from './VoucherTotalsSummary';
import { Save } from 'lucide-react';

export interface VoucherLiveInvoicePreviewProps {
  documentTitle: string;
  voucherNumber?: string;
  voucherDate: string;
  dueDate?: string;
  status?: string;
  party?: VoucherPartyOption | null;
  companyGstin?: string;
  companyStateCode?: string;
  items: VoucherLineItem[];
  summary?: VoucherSummary;
  onSummaryChange?: (summary: VoucherSummary) => void;
  documentDiscountAmount?: number;
  documentDiscountPercent?: number;
  onDocumentDiscountChange?: (amount: number, percent: number) => void;
  shippingCharges?: number;
  onShippingChargesChange?: (charges: number) => void;
  otherCharges?: number;
  onOtherChargesChange?: (charges: number) => void;
  isRoundOffEnabled?: boolean;
  onRoundOffToggle?: (enabled: boolean) => void;
  taxInclusive?: boolean;
  discountInputRef?: React.RefObject<HTMLInputElement | null>;
  freightInputRef?: React.RefObject<HTMLInputElement | null>;
  otherChargesInputRef?: React.RefObject<HTMLInputElement | null>;
  onSave?: () => void | Promise<void>;
  isSaving?: boolean;
  saveButtonLabel?: string;
  onCancel?: () => void;
}

export const VoucherLiveInvoicePreview: React.FC<VoucherLiveInvoicePreviewProps> = ({
  documentTitle,
  voucherNumber = 'DRAFT',
  voucherDate,
  dueDate,
  status = 'DRAFT',
  party,
  companyGstin = '',
  companyStateCode = '',
  items,
  summary: externalSummary,
  onSummaryChange,
  documentDiscountAmount = 0,
  documentDiscountPercent = 0,
  onDocumentDiscountChange,
  shippingCharges = 0,
  onShippingChargesChange,
  otherCharges = 0,
  onOtherChargesChange,
  isRoundOffEnabled = true,
  onRoundOffToggle,
  taxInclusive,
  discountInputRef,
  freightInputRef,
  otherChargesInputRef,
  onSave,
  isSaving = false,
  saveButtonLabel = 'Save Document (F10)',
  onCancel,
}) => {
  // Memoize live slip calculations
  const computed = useMemo(() => {
    return computeVoucherSummary({
      items,
      party,
      companyGstin,
      companyStateCode,
      documentDiscountAmount,
      documentDiscountPercent,
      shippingCharges,
      otherCharges,
      isRoundOffEnabled,
      taxInclusive: taxInclusive ?? true,
    });
  }, [items, party, companyGstin, companyStateCode, documentDiscountAmount, documentDiscountPercent, shippingCharges, otherCharges, isRoundOffEnabled, taxInclusive]);

  // Use external summary if provided by parent, otherwise computed
  const activeSummary = externalSummary || computed;

  // Keep parent in sync only when externalSummary is not provided and values meaningfully change
  const lastEmittedRef = useRef<string>('');
  useEffect(() => {
    if (!onSummaryChange || externalSummary) return;
    const key = `${activeSummary.grand_total}_${activeSummary.subtotal}_${activeSummary.tax_total}_${activeSummary.discount_total}_${activeSummary.other_charges || 0}`;
    if (key !== lastEmittedRef.current) {
      lastEmittedRef.current = key;
      onSummaryChange(activeSummary);
    }
  }, [activeSummary, onSummaryChange, externalSummary]);

  // Aggregate total quantities for the summary bar
  const totalQuantity = useMemo(() => {
    return items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
  }, [items]);

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
          padding: '0.85rem 1.15rem',
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
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px' }}>
              Inv Date: <strong>{voucherDate || new Date().toISOString().split('T')[0]}</strong>
            </div>
            {dueDate && (
              <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '1px' }}>
                Due: {dueDate}
              </div>
            )}
          </div>
        </div>

        {/* ── Complete Party / Supplier / Customer Card ── */}
        <VoucherPartyDetailsCard
          party={party}
          isInterState={computed.isInterState}
        />
      </div>

      {/* ── Document Lines Summary (Zero Duplicate Line Items) ── */}
      <VoucherLinesSummaryBar
        itemCount={items.length}
        totalQuantity={totalQuantity}
      />

      {/* ── Financial Adjustments & Totals Summary ── */}
      <div style={{ flex: 1, padding: '0.85rem 1.15rem', overflowY: 'auto' }}>
        <VoucherFinancialAdjustments
          documentDiscountAmount={documentDiscountAmount}
          documentDiscountPercent={documentDiscountPercent}
          onDocumentDiscountChange={onDocumentDiscountChange}
          shippingCharges={shippingCharges}
          onShippingChargesChange={onShippingChargesChange}
          otherCharges={otherCharges}
          onOtherChargesChange={onOtherChargesChange}
          isRoundOffEnabled={isRoundOffEnabled}
          onRoundOffToggle={onRoundOffToggle}
          discountInputRef={discountInputRef}
          freightInputRef={freightInputRef}
          otherChargesInputRef={otherChargesInputRef}
        />

        <VoucherTotalsSummary
          activeSummary={activeSummary}
          computed={computed}
        />
      </div>

      {/* ── Sticky Slip Actions ── */}
      <div
        style={{
          padding: '1rem 1.15rem',
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
