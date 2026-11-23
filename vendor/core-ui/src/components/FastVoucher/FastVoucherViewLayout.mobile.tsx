import React from 'react';
import { 
  ArrowLeft, 
  Pencil, 
  CheckCircle2, 
  CreditCard, 
  Building2,
  Receipt,
  Boxes,
  Package
} from 'lucide-react';
import type { FastVoucherViewLayoutProps } from './FastVoucherViewLayout.types';
import { FastVoucherViewPostingsSection } from './FastVoucherViewPostingsSection';

export const FastVoucherViewLayoutMobile: React.FC<FastVoucherViewLayoutProps> = ({
  voucherType,
  documentTitle,
  documentNumber,
  status,
  settlementStatus,
  party,
  dates,
  reference,
  summary,
  items = [],
  postings = [],
  loading = false,
  activeLedgerTab,
  onLedgerTabChange,
  onBack,
  onEdit,
  onApprove,
  onRecordPayment,
  renderCustomTop,
  renderCustomBottom,
}) => {
  if (loading) {
    return (
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ height: '48px', backgroundColor: '#e2e8f0', borderRadius: '10px' }} />
        <div style={{ height: '110px', backgroundColor: '#e2e8f0', borderRadius: '10px' }} />
        <div style={{ height: '110px', backgroundColor: '#e2e8f0', borderRadius: '10px' }} />
        <div style={{ height: '180px', backgroundColor: '#e2e8f0', borderRadius: '10px' }} />
      </div>
    );
  }

  const isDraft = (status || '').toUpperCase() === 'DRAFT';
  const isCancelled = (status || '').toUpperCase() === 'CANCELLED';
  const title = documentTitle || voucherType.replace(/_/g, ' ');
  const balanceDue = summary.balanceDue ?? (summary.grandTotal - (summary.paidAmount || 0));
  const amountPaid = summary.paidAmount || 0;

  const formatCurr = (val: number) => {
    return `₹${(Number(val) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (val?: string) => {
    if (!val) return '—';
    try {
      return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return val;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        paddingBottom: '80px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {renderCustomTop?.()}

      {/* Top Mobile Sticky Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '12px 16px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                padding: '6px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              #{documentNumber}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              {title}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              padding: '2px 8px',
              fontSize: '10px',
              fontWeight: 800,
              borderRadius: '9999px',
              textTransform: 'uppercase',
              backgroundColor: isCancelled ? '#fee2e2' : isDraft ? '#fef3c7' : '#ecfdf5',
              color: isCancelled ? '#991b1b' : isDraft ? '#92400e' : '#047857',
              border: isCancelled ? '1px solid #fecaca' : isDraft ? '1px solid #fde68a' : '1px solid #a7f3d0',
            }}
          >
            {status}
          </span>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Pencil size={12} /> <span>Edit</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Body */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Party Summary Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '12px 14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Building2 size={14} color="#2563eb" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {party?.role ? party.role.toUpperCase() : 'PARTY'}
            </span>
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{party?.name || '—'}</div>
          {party?.gstin && <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>GSTIN: {party.gstin}</div>}
          {reference?.vendorBillNumber && (
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
              Vendor Bill: <strong style={{ fontFamily: 'monospace' }}>{reference.vendorBillNumber}</strong>
            </div>
          )}
        </div>

        {/* Commercial Totals Card */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '12px 14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Receipt size={14} color="#059669" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Financial Summary
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
            <span>Subtotal</span>
            <span style={{ fontFamily: 'monospace' }}>{formatCurr(summary.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '6px' }}>
            <span>Tax</span>
            <span style={{ fontFamily: 'monospace' }}>{formatCurr(summary.taxAmount)}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              fontWeight: 800,
              color: '#0f172a',
              paddingTop: '6px',
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <span>Grand Total</span>
            <span style={{ fontFamily: 'monospace' }}>{formatCurr(summary.grandTotal)}</span>
          </div>
          {balanceDue > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#b45309', fontWeight: 700, marginTop: '4px' }}>
              <span>Balance Due</span>
              <span>{formatCurr(balanceDue)}</span>
            </div>
          )}
        </div>

        {/* Line Items Card List */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            padding: '12px 14px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Boxes size={14} color="#2563eb" />
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Line Items ({items.length})
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {items.map((line, idx) => (
              <div
                key={line.id || `m-line-${idx}`}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: '12.5px', color: '#0f172a' }}>
                    {line.itemName || 'Item'}
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#0f172a', fontFamily: 'monospace' }}>
                    {formatCurr(line.lineTotal)}
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
                  <span>Qty: <strong style={{ color: '#1e293b' }}>{line.quantity} {line.uom || ''}</strong></span>
                  <span>•</span>
                  <span>Rate: {formatCurr(line.unitPrice)}</span>
                  {line.sku && (
                    <>
                      <span>•</span>
                      <span>SKU: {line.sku}</span>
                    </>
                  )}
                </div>

                {/* Mobile Stock Badge */}
                {line.currentStock !== undefined && (
                  <div style={{ marginTop: '4px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 7px',
                        borderRadius: '9999px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        backgroundColor: line.currentStock > 0 ? '#ecfdf5' : '#fee2e2',
                        color: line.currentStock > 0 ? '#047857' : '#991b1b',
                        border: line.currentStock > 0 ? '1px solid #a7f3d0' : '1px solid #fecaca',
                      }}
                    >
                      <Package size={10} />
                      <span>Current Stock: {line.currentStock} {line.uom || 'Unit'}</span>
                    </span>
                  </div>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                No line items.
              </div>
            )}
          </div>
        </div>

        {/* Multi-Ledger Postings */}
        <FastVoucherViewPostingsSection
          postings={postings}
          activeTab={activeLedgerTab}
          onTabChange={onLedgerTabChange}
          isDraft={isDraft}
        />
      </div>

      {renderCustomBottom?.()}

      {/* Sticky Bottom Actions Bar on Mobile */}
      {(!isDraft && balanceDue > 0 && onRecordPayment) || (isDraft && onApprove) ? (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '10px 16px',
            display: 'flex',
            gap: '8px',
            zIndex: 30,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
          }}
        >
          {isDraft && onApprove && (
            <button
              type="button"
              onClick={onApprove}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={16} /> <span>Approve Voucher</span>
            </button>
          )}
          {!isDraft && balanceDue > 0 && onRecordPayment && (
            <button
              type="button"
              onClick={onRecordPayment}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <CreditCard size={16} /> <span>Record Payment</span>
            </button>
          )}
        </div>
      ) : null}
    </div>
  );
};
