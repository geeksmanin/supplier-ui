import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';
import type { VoucherViewPosting, VoucherLedgerFilterTab } from './FastVoucherViewLayout.types';

export interface FastVoucherViewPostingsSectionProps {
  postings?: VoucherViewPosting[];
  activeTab?: VoucherLedgerFilterTab;
  onTabChange?: (tab: VoucherLedgerFilterTab) => void;
  isDraft?: boolean;
}

export const FastVoucherViewPostingsSection: React.FC<FastVoucherViewPostingsSectionProps> = ({
  postings = [],
  activeTab: controlledTab,
  onTabChange,
  isDraft = false,
}) => {
  const [internalTab, setInternalTab] = useState<VoucherLedgerFilterTab>('ALL');
  const currentTab = controlledTab || internalTab;

  const handleTabClick = (tab: VoucherLedgerFilterTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalTab(tab);
    }
  };

  const ledgerCounts = useMemo<Record<VoucherLedgerFilterTab, number>>(() => {
    const counts: Record<VoucherLedgerFilterTab, number> = {
      ALL: postings.length,
      STOCK: 0,
      PARTY: 0,
      TAX: 0,
      BRANCH: 0,
    };
    for (const p of postings) {
      const target = (p.ledger_target || p.ledgerTarget || '').toUpperCase();
      if (target === 'LOCATION_BIN' || target === 'SUPPLIER' || target === 'PO_INCOMING' || target === 'STOCK') {
        counts.STOCK++;
      } else if (target === 'PARTY_LEDGER' || target === 'PAYABLE' || target === 'RECEIVABLE') {
        counts.PARTY++;
      } else if (target === 'TAX_LEDGER' || target === 'INPUT_TAX' || target === 'OUTPUT_TAX' || target === 'TAX') {
        counts.TAX++;
      } else if (target === 'BRANCH_LEDGER' || target === 'EXPENSE' || target === 'INCOME' || target === 'ROUND_OFF') {
        counts.BRANCH++;
      }
    }
    return counts;
  }, [postings]);

  const filteredPostings = useMemo(() => {
    if (currentTab === 'ALL') return postings;
    return postings.filter((p) => {
      const target = (p.ledger_target || p.ledgerTarget || '').toUpperCase();
      if (currentTab === 'STOCK') {
        return target === 'LOCATION_BIN' || target === 'SUPPLIER' || target === 'PO_INCOMING' || target === 'STOCK';
      }
      if (currentTab === 'PARTY') {
        return target === 'PARTY_LEDGER' || target === 'PAYABLE' || target === 'RECEIVABLE';
      }
      if (currentTab === 'TAX') {
        return target === 'TAX_LEDGER' || target === 'INPUT_TAX' || target === 'OUTPUT_TAX' || target === 'TAX';
      }
      if (currentTab === 'BRANCH') {
        return target === 'BRANCH_LEDGER' || target === 'EXPENSE' || target === 'INCOME' || target === 'ROUND_OFF';
      }
      return true;
    });
  }, [postings, currentTab]);

  const totalDebits = useMemo(() => {
    return filteredPostings
      .filter((p) => (p.entry_type || p.entryType || '').toUpperCase() === 'DEBIT')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [filteredPostings]);

  const totalCredits = useMemo(() => {
    return filteredPostings
      .filter((p) => (p.entry_type || p.entryType || '').toUpperCase() === 'CREDIT')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [filteredPostings]);

  const isBalanced = useMemo(() => {
    return Math.abs(totalDebits - totalCredits) < 0.01;
  }, [totalDebits, totalCredits]);

  const tabs: { key: VoucherLedgerFilterTab; label: string; count: number }[] = [
    { key: 'ALL', label: 'All Postings', count: ledgerCounts.ALL },
    { key: 'STOCK', label: 'Stocks Ledger', count: ledgerCounts.STOCK },
    { key: 'PARTY', label: 'Party Ledger', count: ledgerCounts.PARTY },
    { key: 'TAX', label: 'Tax Ledger', count: ledgerCounts.TAX },
    { key: 'BRANCH', label: 'Branch Ledger', count: ledgerCounts.BRANCH },
  ];

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
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider m-0">
            Voucher Entries & Ledgers (Double-Entry Breakdown)
          </h3>
        </div>

        {/* Ledger Tabs */}
        <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-lg">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => handleTabClick(t.key)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                currentTab === t.key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      </div>

      {/* Postings Table */}
      {filteredPostings.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Voucher # / Ref</th>
                <th className="py-2.5 px-3 font-semibold">Date</th>
                <th className="py-2.5 px-3 font-semibold">Ledger Target</th>
                <th className="py-2.5 px-3 font-semibold">Account / Location</th>
                <th className="py-2.5 px-3 font-semibold">Item / Subledger</th>
                <th className="py-2.5 px-3 font-semibold text-center">Entry</th>
                <th className="py-2.5 px-3 font-semibold text-right">Amount / Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPostings.map((p, idx) => {
                const entryType = (p.entry_type || p.entryType || 'DEBIT').toUpperCase();
                const isCredit = entryType === 'CREDIT';
                const target = (p.ledger_target || p.ledgerTarget || '').toUpperCase();
                const isStock = ['LOCATION_BIN', 'SUPPLIER', 'PO_INCOMING', 'STOCK'].includes(target);
                const vNum = p.voucher_number || p.voucherNumber || p.reference || '—';
                const accCode = p.account_code || p.accountCode || '—';
                const accName = p.account_name || p.accountName || '—';
                const txDate = p.transaction_date || p.transactionDate;

                return (
                  <tr key={p.id || `post-${idx}`} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-mono text-slate-700 font-medium">
                      {vNum}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{formatDate(txDate)}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {p.ledger_target || p.ledgerTarget}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-800 font-medium">{accCode}</td>
                    <td className="py-2.5 px-3 text-slate-700">{accName}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                        isCredit
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {isCredit ? <ArrowDownLeft size={11} /> : <ArrowUpRight size={11} />}
                        <span>{entryType}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {isStock ? `${p.amount} Units` : formatCurr(p.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-slate-400">
          {isDraft
            ? 'Voucher postings across Stocks, Party, Tax, and Branch ledgers will generate automatically upon approving this voucher.'
            : 'No postings found for this ledger filter.'}
        </div>
      )}

      {/* Double-Entry Verification Footer */}
      <div className="bg-slate-50/80 px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="text-slate-600">
            Total Debits: <strong className="text-blue-700 font-bold">{formatCurr(totalDebits)}</strong>
          </span>
          <span className="text-slate-600">
            Total Credits: <strong className="text-emerald-700 font-bold">{formatCurr(totalCredits)}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isBalanced ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck size={14} /> Double-Entry Balanced
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              <AlertCircle size={14} /> Difference: {formatCurr(Math.abs(totalDebits - totalCredits))}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
