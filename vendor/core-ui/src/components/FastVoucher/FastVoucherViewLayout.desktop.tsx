import React from 'react';
import { 
  ArrowLeft, 
  Pencil, 
  CheckCircle2, 
  CreditCard, 
  XCircle, 
  FileText, 
  Building2,
  Calendar,
  Receipt,
  Boxes,
  Package
} from 'lucide-react';
import type { FastVoucherViewLayoutProps } from './FastVoucherViewLayout.types';
import { FastVoucherViewPostingsSection } from './FastVoucherViewPostingsSection';

export const FastVoucherViewLayoutDesktop: React.FC<FastVoucherViewLayoutProps> = ({
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
  onCancel,
  onRecordPayment,
  renderExtraActions,
  renderCustomTop,
  renderCustomBottom,
}) => {
  if (loading) {
    return (
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ height: '72px', backgroundColor: '#e2e8f0', borderRadius: '12px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ height: '140px', backgroundColor: '#e2e8f0', borderRadius: '12px' }} />
          <div style={{ height: '140px', backgroundColor: '#e2e8f0', borderRadius: '12px' }} />
          <div style={{ height: '140px', backgroundColor: '#e2e8f0', borderRadius: '12px' }} />
        </div>
        <div style={{ height: '220px', backgroundColor: '#e2e8f0', borderRadius: '12px' }} />
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
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <style>{`
        .fvl-items-table { width: 100%; border-collapse: collapse; text-align: left; }
        .fvl-items-table th { background-color: #f8fafc; border-bottom: 1.5px solid #e2e8f0; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 11px 14px; }
        .fvl-items-table td { border-bottom: 1px solid #f1f5f9; padding: 12px 14px; font-size: 12.5px; color: #1e293b; }
        .fvl-items-table tr:hover td { background-color: #fafbfc; }
        .fvl-card { background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04); }
        .fvl-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        @media (max-width: 900px) { .fvl-grid-3 { grid-template-columns: 1fr; } }
      `}</style>

      {renderCustomTop?.()}

      {/* 1. Top Header Toolbar */}
      <div
        className="fvl-card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
              }}
              title="Go Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {title} #{documentNumber}
              </h1>
              <span
                style={{
                  padding: '3px 9px',
                  fontSize: '11px',
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
              {settlementStatus && (
                <span
                  style={{
                    padding: '3px 8px',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '9999px',
                    backgroundColor: settlementStatus === 'PAID' ? '#ecfdf5' : settlementStatus === 'PARTIALLY_PAID' ? '#eff6ff' : '#f1f5f9',
                    color: settlementStatus === 'PAID' ? '#047857' : settlementStatus === 'PARTIALLY_PAID' ? '#1d4ed8' : '#475569',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {settlementStatus.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
              Created on {formatDate(dates?.createdAt || dates?.documentDate)} • View Mode
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(37, 99, 235, 0.2)',
              }}
            >
              <Pencil size={14} /> <span>Edit Voucher</span>
            </button>
          )}

          {isDraft && onApprove && (
            <button
              type="button"
              onClick={onApprove}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <CheckCircle2 size={14} /> <span>Approve</span>
            </button>
          )}

          {!isDraft && !isCancelled && balanceDue > 0 && onRecordPayment && (
            <button
              type="button"
              onClick={onRecordPayment}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <CreditCard size={14} /> <span>Record Payment</span>
            </button>
          )}

          {!isCancelled && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <XCircle size={14} /> <span>Cancel</span>
            </button>
          )}

          {renderExtraActions?.()}
        </div>
      </div>

      {/* 2. Details 3-Card Grid */}
      <div className="fvl-grid-3">
        {/* Party Card */}
        <div
          className="fvl-card"
          style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
            <Building2 size={15} color="#2563eb" />
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              {party?.role ? party.role.toUpperCase() : 'PARTY'} Information
            </h3>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{party?.name || '—'}</div>
            {party?.id && <div style={{ color: '#64748b', fontFamily: 'monospace', fontSize: '11.5px' }}>ID: {party.id}</div>}
            {party?.gstin && <div style={{ color: '#475569', fontSize: '12px' }}>GSTIN: {party.gstin}</div>}
            {reference?.purchaseOrderNumber && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px', color: '#475569', fontSize: '12px' }}>
                <FileText size={13} color="#94a3b8" />
                <span>PO Ref: <strong style={{ fontFamily: 'monospace', color: '#1e293b' }}>{reference.purchaseOrderNumber}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Dates & Reference Card */}
        <div
          className="fvl-card"
          style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
            <Calendar size={15} color="#4f46e5" />
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Dates & References
            </h3>
          </div>
          <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12.5px' }}>
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                {reference?.vendorBillNumber ? 'Vendor Bill #' : 'Ref Number'}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1e293b' }}>
                {reference?.vendorBillNumber || reference?.referenceNumber || '—'}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                Document Date
              </span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>
                {formatDate(dates?.invoiceDate || dates?.documentDate)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                Due Date
              </span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>
                {formatDate(dates?.dueDate)}
              </span>
            </div>
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                Branch / Location
              </span>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>
                {reference?.branchCode || reference?.warehouseName || 'HQ'}
              </span>
            </div>
          </div>
        </div>

        {/* Commercial Totals Card */}
        <div
          className="fvl-card"
          style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
            <Receipt size={15} color="#059669" />
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Commercial Totals
            </h3>
          </div>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{formatCurr(summary.subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
              <span>Tax Total:</span>
              <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{formatCurr(summary.taxAmount)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontWeight: 800, fontSize: '14.5px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
              <span>Grand Total:</span>
              <span style={{ fontFamily: 'monospace' }}>{formatCurr(summary.grandTotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingTop: '4px' }}>
              <span style={{ color: '#047857', fontWeight: 600 }}>Paid: {formatCurr(amountPaid)}</span>
              <span style={{ color: balanceDue > 0 ? '#b45309' : '#64748b', fontWeight: 700 }}>
                Balance Due: {formatCurr(balanceDue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Line Items Table with Live Stock Column */}
      <div className="fvl-card" style={{ overflow: 'hidden' }}>
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '14px 18px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Boxes size={16} color="#2563eb" />
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
              Voucher Line Items ({items.length})
            </h3>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="fvl-items-table">
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center' }}>#</th>
                <th>Item & Description</th>
                <th style={{ width: '130px' }}>SKU / Code</th>
                <th style={{ width: '110px' }}>Batch No.</th>
                <th style={{ width: '140px', textAlign: 'center' }}>Current Stock</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Invoiced Qty</th>
                <th style={{ width: '110px', textAlign: 'right' }}>Unit Rate</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Tax</th>
                <th style={{ width: '120px', textAlign: 'right' }}>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((line, idx) => (
                <tr key={line.id || `line-${idx}`}>
                  <td style={{ textAlign: 'center', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 600 }}>
                    {idx + 1}
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{line.itemName || 'Item'}</div>
                    {line.hsnCode && (
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>HSN: {line.hsnCode}</div>
                    )}
                  </td>
                  <td style={{ fontFamily: 'monospace', color: '#475569', fontSize: '12px' }}>
                    {line.sku || line.itemCode || '—'}
                  </td>
                  <td style={{ fontFamily: 'monospace', color: '#475569', fontSize: '12px' }}>
                    {line.batchNumber || '—'}
                  </td>
                  {/* Current Stock Value in List */}
                  <td style={{ textAlign: 'center' }}>
                    {line.currentStock !== undefined ? (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: line.currentStock > 0 ? '#ecfdf5' : '#fee2e2',
                          color: line.currentStock > 0 ? '#047857' : '#991b1b',
                          border: line.currentStock > 0 ? '1px solid #a7f3d0' : '1px solid #fecaca',
                        }}
                      >
                        <Package size={11} />
                        <span>{line.currentStock} {line.uom || 'Unit'}</span>
                      </span>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '11.5px' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>
                    {line.quantity} {line.uom || ''}
                  </td>
                  <td style={{ textAlign: 'right', color: '#334155', fontFamily: 'monospace' }}>
                    {formatCurr(line.unitPrice)}
                  </td>
                  <td style={{ textAlign: 'right', color: '#64748b', fontFamily: 'monospace' }}>
                    {formatCurr(line.taxAmount || 0)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', fontSize: '13px' }}>
                    {formatCurr(line.lineTotal)}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>
                    No line items found for this voucher.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Voucher Postings Section (All 4 Ledgers: Stocks, Party, Tax, Branch) */}
      <FastVoucherViewPostingsSection
        postings={postings}
        activeTab={activeLedgerTab}
        onTabChange={onLedgerTabChange}
        isDraft={isDraft}
      />

      {renderCustomBottom?.()}
    </div>
  );
};
