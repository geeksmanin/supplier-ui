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
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
      }}
    >
      <style>{`
        .fvl-postings-table { width: 100%; border-collapse: collapse; text-align: left; }
        .fvl-postings-table th { background-color: #f8fafc; border-bottom: 1.5px solid #e2e8f0; color: #475569; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 11px 14px; }
        .fvl-postings-table td { border-bottom: 1px solid #f1f5f9; padding: 11px 14px; font-size: 12.5px; color: #1e293b; }
        .fvl-postings-table tr:hover td { background-color: #fafbfc; }
        .fvl-tab-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; font-size: 12px; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; border: 1px solid transparent; background: transparent; color: #64748b; }
        .fvl-tab-btn.active { background-color: #ffffff; color: #2563eb; border-color: #cbd5e1; font-weight: 700; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .fvl-tab-btn:hover:not(.active) { background-color: #f1f5f9; color: #1e293b; }
      `}</style>

      {/* Header with Title & Filter Tabs */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          padding: '14px 18px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={16} color="#4f46e5" />
          <h3
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#1e293b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            Voucher Entries & Ledgers (Double-Entry Breakdown)
          </h3>
        </div>

        {/* Tab Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: '#e2e8f0',
            padding: '3px',
            borderRadius: '9px',
          }}
        >
          {tabs.map((tab) => {
            const isActive = currentTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabClick(tab.key)}
                className={`fvl-tab-btn ${isActive ? 'active' : ''}`}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    fontSize: '10.5px',
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    backgroundColor: isActive ? '#eff6ff' : '#f1f5f9',
                    color: isActive ? '#2563eb' : '#64748b',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Postings Table */}
      <div style={{ overflowX: 'auto' }}>
        <table className="fvl-postings-table">
          <thead>
            <tr>
              <th style={{ width: '160px' }}>Voucher # / Ref</th>
              <th style={{ width: '110px' }}>Date</th>
              <th style={{ width: '140px' }}>Ledger Target</th>
              <th>Account / Location</th>
              <th>Item / Subledger</th>
              <th style={{ width: '100px', textAlign: 'center' }}>Entry</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Amount / Qty</th>
            </tr>
          </thead>
          <tbody>
            {filteredPostings.map((p, idx) => {
              const entryType = (p.entry_type || p.entryType || '').toUpperCase();
              const isDebit = entryType === 'DEBIT';
              const target = p.ledger_target || p.ledgerTarget || '—';
              const account = p.account_name || p.accountName || p.account_title || p.account_code || p.accountCode || p.account_id || p.accountId || '—';
              const subledger = p.subledger_name || p.subledger_id || p.subledgerId || '—';
              const vNumber = p.voucher_number || p.voucherNumber || p.voucher_id || p.voucherId || '—';
              const txDate = p.transaction_date || p.transactionDate || p.createdAt;

              return (
                <tr key={p.id || `post-${idx}`}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                    {vNumber}
                  </td>
                  <td style={{ color: '#64748b' }}>{formatDate(txDate)}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {target}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: '#1e293b' }}>{account}</td>
                  <td style={{ color: '#475569' }}>{subledger}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: isDebit ? '#eff6ff' : '#ecfdf5',
                        color: isDebit ? '#1d4ed8' : '#047857',
                        border: isDebit ? '1px solid #bfdbfe' : '1px solid #a7f3d0',
                      }}
                    >
                      {isDebit ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                      <span>{entryType || '—'}</span>
                    </span>
                  </td>
                  <td
                    style={{
                      textAlign: 'right',
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      color: isDebit ? '#1d4ed8' : '#047857',
                      fontSize: '13px',
                    }}
                  >
                    {p.quantity !== undefined && p.quantity !== null && Number(p.quantity) > 0 ? (
                      <span>{p.quantity} {p.uom || 'units'}</span>
                    ) : (
                      <span>{formatCurr(p.amount || 0)}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredPostings.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: '28px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontStyle: 'italic',
                  }}
                >
                  {isDraft 
                    ? 'No postings created yet. Double-entry ledger postings will be dispatched upon voucher confirmation.' 
                    : `No postings found under the "${currentTab}" filter.`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Double-Entry Verification Footer */}
      {filteredPostings.length > 0 && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderTop: '1.5px solid #e2e8f0',
            padding: '12px 18px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '12.5px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>
              <span style={{ color: '#64748b' }}>Total Debits: </span>
              <strong style={{ color: '#1d4ed8', fontFamily: 'monospace' }}>{formatCurr(totalDebits)}</strong>
            </span>
            <span>
              <span style={{ color: '#64748b' }}>Total Credits: </span>
              <strong style={{ color: '#047857', fontFamily: 'monospace' }}>{formatCurr(totalCredits)}</strong>
            </span>
          </div>

          <div>
            {isBalanced ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  border: '1px solid #a7f3d0',
                }}
              >
                <ShieldCheck size={14} />
                <span>Double-Entry Balanced</span>
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  backgroundColor: '#fffbeb',
                  color: '#b45309',
                  border: '1px solid #fde68a',
                }}
              >
                <AlertCircle size={14} />
                <span>Variance: {formatCurr(Math.abs(totalDebits - totalCredits))}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
