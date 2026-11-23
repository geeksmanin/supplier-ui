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
      <div className="p-4 space-y-3 animate-pulse">
        <div className="h-12 bg-slate-200 rounded-xl" />
        <div className="h-28 bg-slate-200 rounded-xl" />
        <div className="h-28 bg-slate-200 rounded-xl" />
        <div className="h-44 bg-slate-200 rounded-xl" />
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
    <div className="flex flex-col min-h-screen bg-slate-50 pb-20">
      {renderCustomTop?.()}

      {/* Top Mobile Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 -ml-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h1 className="text-sm font-bold text-slate-900 m-0">
              {title} #{documentNumber}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full uppercase border ${
                isCancelled ? 'bg-red-50 text-red-700 border-red-200' :
                isDraft ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {status}
              </span>
              {settlementStatus && (
                <span className={`px-1.5 py-0.2 text-[10px] font-semibold rounded-full border ${
                  settlementStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  settlementStatus === 'PARTIALLY_PAID' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {settlementStatus.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 text-xs font-semibold"
          >
            <Pencil size={13} />
            <span>Edit</span>
          </button>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Party & Doc Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <Building2 size={13} className="text-blue-600" />
            <span>{party?.role ? party.role.toUpperCase() : 'PARTY'} Information</span>
          </div>
          <div className="font-bold text-slate-900 text-sm">{party?.name || '—'}</div>
          {reference?.vendorBillNumber && (
            <div className="text-slate-600">
              Vendor Bill: <strong className="font-mono text-slate-800">{reference.vendorBillNumber}</strong>
            </div>
          )}
          <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-100">
            <span>Date: {formatDate(dates?.invoiceDate || dates?.documentDate)}</span>
            <span>Due: {formatDate(dates?.dueDate)}</span>
          </div>
        </div>

        {/* Commercial Totals Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium pb-1 border-b border-slate-100">
            <Receipt size={13} className="text-emerald-600" />
            <span>Financials</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>{formatCurr(summary.subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Tax Total:</span>
            <span>{formatCurr(summary.taxAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-100">
            <span>Grand Total:</span>
            <span>{formatCurr(summary.grandTotal)}</span>
          </div>
          <div className="flex justify-between text-[11px] pt-1">
            <span className="text-emerald-700">Paid: {formatCurr(amountPaid)}</span>
            <span className={balanceDue > 0 ? 'text-amber-700 font-semibold' : 'text-slate-500'}>
              Due: {formatCurr(balanceDue)}
            </span>
          </div>
        </div>

        {/* Line Items Card (with Current Stock) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center gap-1.5">
            <Boxes size={14} className="text-blue-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider m-0">
              Items ({items.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {items.map((line, idx) => (
              <div key={line.id || `line-${idx}`} className="p-3 text-xs space-y-1">
                <div className="flex justify-between items-start">
                  <div className="font-semibold text-slate-900">{line.itemName || 'Item'}</div>
                  <div className="font-bold text-slate-900">{formatCurr(line.lineTotal)}</div>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Qty: {line.quantity} {line.uom || ''}</span>
                  <span>@ {formatCurr(line.unitPrice)}</span>
                </div>
                {/* Current Stock Badge on Mobile */}
                {line.currentStock !== undefined && (
                  <div className="flex items-center gap-1 pt-0.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                      line.currentStock > 0 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      <Package size={10} />
                      <span>Stock: {line.currentStock} {line.uom || 'units'}</span>
                    </span>
                  </div>
                )}
                {line.batchNumber && (
                  <div className="text-[10px] text-slate-400 font-mono">
                    Batch: {line.batchNumber}
                  </div>
                )}
              </div>
            ))}
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

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex items-center gap-2 z-20">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Pencil size={13} /> Edit Voucher
          </button>
        )}

        {isDraft && onApprove && (
          <button
            type="button"
            onClick={onApprove}
            className="flex-1 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCircle2 size={13} /> Approve
          </button>
        )}

        {!isDraft && !isCancelled && balanceDue > 0 && onRecordPayment && (
          <button
            type="button"
            onClick={onRecordPayment}
            className="flex-1 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <CreditCard size={13} /> Pay
          </button>
        )}
      </div>

      {renderCustomBottom?.()}
    </div>
  );
};
