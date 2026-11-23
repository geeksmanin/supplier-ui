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
      <div className="p-6 max-w-7xl mx-auto space-y-4 animate-pulse">
        <div className="h-16 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-slate-200 rounded-xl" />
          <div className="h-32 bg-slate-200 rounded-xl" />
          <div className="h-32 bg-slate-200 rounded-xl" />
        </div>
        <div className="h-48 bg-slate-200 rounded-xl" />
        <div className="h-64 bg-slate-200 rounded-xl" />
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
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-5">
      {renderCustomTop?.()}

      {/* 1. Header Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              title="Go Back"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 m-0">
                {title} #{documentNumber}
              </h1>
              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase border ${
                isCancelled ? 'bg-red-50 text-red-700 border-red-200' :
                isDraft ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {status}
              </span>
              {settlementStatus && (
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                  settlementStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  settlementStatus === 'PARTIALLY_PAID' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {settlementStatus.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 m-0 mt-0.5">
              Created on {formatDate(dates?.createdAt || dates?.documentDate)} • View Mode
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Pencil size={14} /> Edit Voucher
            </button>
          )}

          {isDraft && onApprove && (
            <button
              type="button"
              onClick={onApprove}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 size={14} /> Approve
            </button>
          )}

          {!isDraft && !isCancelled && balanceDue > 0 && onRecordPayment && (
            <button
              type="button"
              onClick={onRecordPayment}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CreditCard size={14} /> Record Payment
            </button>
          )}

          {!isCancelled && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <XCircle size={14} /> Cancel
            </button>
          )}

          {renderExtraActions?.()}
        </div>
      </div>

      {/* 2. Details Grid (Party, Dates/Reference, Financials) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Party Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Building2 size={16} className="text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider m-0">
              {party?.role ? party.role.toUpperCase() : 'PARTY'} Information
            </h3>
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="text-sm font-bold text-slate-900">{party?.name || '—'}</div>
            {party?.id && <div className="text-slate-500 font-mono">ID: {party.id}</div>}
            {party?.gstin && <div className="text-slate-600">GSTIN: {party.gstin}</div>}
            {reference?.purchaseOrderNumber && (
              <div className="text-slate-600 flex items-center gap-1 mt-1">
                <FileText size={13} className="text-slate-400" />
                <span>PO Ref: <strong className="font-mono text-slate-800">{reference.purchaseOrderNumber}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Dates & Reference Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Calendar size={16} className="text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider m-0">
              Dates & References
            </h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase block">
                {reference?.vendorBillNumber ? 'Vendor Bill #' : 'Ref Number'}
              </span>
              <span className="font-mono font-semibold text-slate-800">
                {reference?.vendorBillNumber || reference?.referenceNumber || '—'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase block">Document Date</span>
              <span className="font-semibold text-slate-800">{formatDate(dates?.invoiceDate || dates?.documentDate)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase block">Due Date</span>
              <span className="font-semibold text-slate-800">{formatDate(dates?.dueDate)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium uppercase block">Branch / Location</span>
              <span className="font-semibold text-slate-800">{reference?.branchCode || reference?.warehouseName || 'HQ'}</span>
            </div>
          </div>
        </div>

        {/* Commercial Totals Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100">
            <Receipt size={16} className="text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider m-0">
              Commercial Totals
            </h3>
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurr(summary.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Tax Total:</span>
              <span className="font-semibold">{formatCurr(summary.taxAmount)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-sm pt-1 border-t border-slate-100">
              <span>Grand Total:</span>
              <span className="text-slate-900">{formatCurr(summary.grandTotal)}</span>
            </div>
            <div className="flex justify-between text-xs pt-1">
              <span className="text-emerald-700">Paid: {formatCurr(amountPaid)}</span>
              <span className={balanceDue > 0 ? 'text-amber-700 font-semibold' : 'text-slate-500'}>
                Balance Due: {formatCurr(balanceDue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Line Items Table (with Current Stock column) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Boxes size={16} className="text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider m-0">
              Voucher Line Items ({items.length})
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3 font-semibold w-12 text-center">#</th>
                <th className="py-2.5 px-3 font-semibold">Item & Description</th>
                <th className="py-2.5 px-3 font-semibold">SKU / Code</th>
                <th className="py-2.5 px-3 font-semibold">Batch No.</th>
                <th className="py-2.5 px-3 font-semibold text-center">Current Stock</th>
                <th className="py-2.5 px-3 font-semibold text-right">Invoiced Qty</th>
                <th className="py-2.5 px-3 font-semibold text-right">Unit Rate</th>
                <th className="py-2.5 px-3 font-semibold text-right">Tax</th>
                <th className="py-2.5 px-3 font-semibold text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((line, idx) => (
                <tr key={line.id || `line-${idx}`} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-semibold text-slate-800">{line.itemName || 'Item'}</div>
                    {line.hsnCode && (
                      <div className="text-[10px] text-slate-400">HSN: {line.hsnCode}</div>
                    )}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{line.sku || line.itemCode || '—'}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{line.batchNumber || '—'}</td>
                  {/* Current Stock Value in List */}
                  <td className="py-2.5 px-3 text-center">
                    {line.currentStock !== undefined ? (
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                        line.currentStock > 0 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <Package size={11} />
                        <span>{line.currentStock} {line.uom || 'units'}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                    {line.quantity} {line.uom || ''}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-700">{formatCurr(line.unitPrice)}</td>
                  <td className="py-2.5 px-3 text-right text-slate-600">{formatCurr(line.taxAmount || 0)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900">{formatCurr(line.lineTotal)}</td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">
                    No line items found for this voucher.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Voucher Entries Section (Unified Multi-Ledger Breakdown) */}
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
