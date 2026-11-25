import React from 'react';
import { Building2, Plus, Trash2, ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-react';
import { Select } from '../Select';
import { FastPaymentProps, SplitRowMode } from './FastPayment.types';
import { MODE_LABELS, UseFastPaymentReturn } from './useFastPayment';

export interface FastPaymentViewProps {
  props: FastPaymentProps;
  state: UseFastPaymentReturn;
}

const panelStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-surface, #ffffff)',
  border: '1px solid var(--border-color, #e2e8f0)',
  borderRadius: '12px',
  padding: '1.25rem 1.5rem',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--text-secondary, #475569)',
  marginBottom: '0.35rem',
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  border: '1px solid var(--border-color, #cbd5e1)',
  borderRadius: '8px',
  fontSize: '0.9rem',
  backgroundColor: 'var(--bg-surface, #ffffff)',
  color: 'var(--text-primary, #0f172a)',
  boxSizing: 'border-box',
};

export const FastPaymentDesktop: React.FC<FastPaymentViewProps> = ({ props, state }) => {
  const currency = props.currencySymbol || '₹';
  const isOutflow = state.direction === 'OUTFLOW';
  const partyLabel =
    props.partyType === 'SUPPLIER' || isOutflow
      ? `${props.partyName || 'Supplier'} Bank Account`
      : `${props.partyName || 'Customer'} Bank Account`;
  const branchLabel = isOutflow ? 'Paid From (My Branch Bank)' : 'Deposited Into (My Branch Bank)';
  const submitDisabled =
    Boolean(props.loading) ||
    Boolean(props.disabled) ||
    Boolean(state.validationError) ||
    (props.variant === 'modal' && state.mode !== 'CREDIT' && state.effectivePaidAmount <= 0);

  return (
    <div style={panelStyle} data-testid="fast-payment-desktop">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CreditCard size={18} color="var(--color-primary, #2563eb)" />
          <span style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
            {props.title || (isOutflow ? 'Payment Outbound' : 'Payment Collection')}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '0.2rem 0.55rem',
              borderRadius: '999px',
              backgroundColor: isOutflow ? 'var(--badge-outflow-bg, #fff7ed)' : 'var(--badge-inflow-bg, #ecfdf5)',
              color: isOutflow ? 'var(--badge-outflow-fg, #c2410c)' : 'var(--badge-inflow-fg, #047857)',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            {isOutflow ? <ArrowUpRight size={12} /> : <ArrowDownLeft size={12} />}
            {isOutflow ? 'OUTFLOW' : 'INFLOW'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
          {props.allowDirectionToggle && (
            <div style={{ display: 'inline-flex', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => state.setDirection('INFLOW')}
                style={{
                  padding: '0.35rem 0.7rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: !isOutflow ? 'var(--color-primary, #2563eb)' : 'transparent',
                  color: !isOutflow ? '#ffffff' : 'var(--text-secondary, #475569)',
                }}
              >
                Receive (In)
              </button>
              <button
                type="button"
                onClick={() => state.setDirection('OUTFLOW')}
                style={{
                  padding: '0.35rem 0.7rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  backgroundColor: isOutflow ? 'var(--color-primary, #2563eb)' : 'transparent',
                  color: isOutflow ? '#ffffff' : 'var(--text-secondary, #475569)',
                }}
              >
                Pay (Out)
              </button>
            </div>
          )}
          <span style={{ color: 'var(--text-secondary, #64748b)' }}>
            Due: <strong style={{ color: 'var(--text-primary, #0f172a)' }}>{currency}{props.totalDue.toFixed(2)}</strong>
          </span>
          <span style={{ color: state.remainingBalance > 0.01 ? 'var(--color-warning, #b45309)' : 'var(--color-success, #059669)', fontWeight: 600 }}>
            Balance: {currency}{state.remainingBalance.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Mode Selector Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }} role="radiogroup" aria-label="Payment Mode">
        {state.modes.map((m) => {
          const active = state.mode === m;
          return (
            <button
              key={m}
              type="button"
              disabled={props.disabled}
              data-testid={`fast-payment-mode-${m}`}
              onClick={() => state.selectMode(m)}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: active ? '1.5px solid var(--color-primary, #2563eb)' : '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: active ? 'var(--color-primary-soft, #eff6ff)' : 'var(--bg-surface, #ffffff)',
                color: active ? 'var(--color-primary, #1d4ed8)' : 'var(--text-primary, #334155)',
                fontWeight: active ? 700 : 500,
                fontSize: '0.84rem',
                cursor: props.disabled ? 'not-allowed' : 'pointer',
              }}
            >
              {MODE_LABELS[m]}
            </button>
          );
        })}
      </div>

      {state.mode !== 'CREDIT' && (
        <>
          {state.mode !== 'SPLIT' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.85rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={labelStyle}>Amount ({currency})</label>
                  {props.allowPartial !== false && props.totalDue > 0 && (
                    <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.25rem' }}>
                      <button type="button" onClick={state.applyHalfDue} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-color, #cbd5e1)', background: 'transparent', cursor: 'pointer' }}>50%</button>
                      <button type="button" onClick={state.applyFullDue} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-color, #cbd5e1)', background: 'transparent', cursor: 'pointer' }}>Full</button>
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  disabled={props.disabled}
                  data-testid="fast-payment-amount-input"
                  value={state.paidAmountStr}
                  onChange={(e) => state.setPaidAmountStr(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {props.showChangeCalculator && state.mode === 'CASH' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={labelStyle}>Tendered ({currency})</label>
                    <button type="button" onClick={state.applyExactTender} style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid var(--border-color, #cbd5e1)', background: 'transparent', cursor: 'pointer', marginBottom: '0.25rem' }}>Exact</button>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    disabled={props.disabled}
                    value={state.tenderedAmountStr}
                    onChange={(e) => state.setTenderedAmountStr(e.target.value)}
                    placeholder="Cash received"
                    style={inputStyle}
                  />
                  {state.changeAmount > 0 && (
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-success, #059669)', marginTop: '0.25rem' }}>
                      Return Change: {currency}{state.changeAmount.toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label style={labelStyle}>Reference / UTR / Cheque No</label>
                <input
                  type="text"
                  disabled={props.disabled}
                  value={state.reference}
                  onChange={(e) => state.setReference(e.target.value)}
                  placeholder="Optional reference"
                  style={inputStyle}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary, #475569)' }}>
                  Split Legs (Total: {currency}{state.effectivePaidAmount.toFixed(2)})
                </span>
                <button
                  type="button"
                  onClick={state.addSplitLine}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.7rem', borderRadius: '6px', border: '1px solid var(--border-color, #cbd5e1)', background: 'var(--bg-surface, #ffffff)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Plus size={14} /> Add Split Leg
                </button>
              </div>
              {state.splitLines.map((line) => (
                <div
                  key={line.id}
                  style={{ display: 'grid', gridTemplateColumns: '140px 140px 1fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}
                >
                  <Select
                    value={line.mode}
                    onChange={(val) => state.updateSplitLine(line.id, { mode: val as SplitRowMode })}
                    options={state.splitModeOptions}
                    disabled={props.disabled}
                  />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={line.amount || ''}
                    onChange={(e) => state.updateSplitLine(line.id, { amount: parseFloat(e.target.value) || 0 })}
                    placeholder="Amount"
                    style={inputStyle}
                    disabled={props.disabled}
                  />
                  {line.mode !== 'CASH' ? (
                    <Select
                      value={line.branch_bank_account_id || ''}
                      onChange={(val) => state.updateSplitLine(line.id, { branch_bank_account_id: String(val) })}
                      options={state.branchSelectOptions}
                      placeholder={branchLabel}
                      disabled={props.disabled}
                    />
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #64748b)' }}>Branch Cash Drawer</span>
                  )}
                  <input
                    type="text"
                    value={line.reference || ''}
                    onChange={(e) => state.updateSplitLine(line.id, { reference: e.target.value })}
                    placeholder="Ref / UTR"
                    style={inputStyle}
                    disabled={props.disabled}
                  />
                  <button
                    type="button"
                    aria-label="Remove split leg"
                    onClick={() => state.removeSplitLine(line.id)}
                    style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-color, #cbd5e1)', background: 'transparent', cursor: 'pointer', color: 'var(--color-danger, #dc2626)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Contextual Bank Account Selectors (Single Modes) */}
          {state.mode !== 'SPLIT' && (state.needsBranchBank || state.needsPartyBank) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.85rem' }}>
              {state.needsPartyBank && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={labelStyle}>
                      <Building2 size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />
                      {partyLabel}
                    </label>
                    {props.onQuickAddPartyBank && (
                      <button type="button" onClick={props.onQuickAddPartyBank} style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-primary, #2563eb)', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '0.25rem' }}>
                        + Add Bank
                      </button>
                    )}
                  </div>
                  <Select
                    value={state.partyBankId}
                    onChange={(val) => state.setPartyBankId(String(val))}
                    options={state.partySelectOptions}
                    placeholder={props.partyBanksLoading ? 'Loading bank accounts...' : state.partySelectOptions.length === 0 ? 'No party banks saved' : 'Select party bank'}
                    disabled={props.disabled || Boolean(props.partyBanksLoading)}
                  />
                </div>
              )}

              {state.needsBranchBank && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={labelStyle}>
                      <Building2 size={12} style={{ display: 'inline', marginRight: '0.3rem' }} />
                      {branchLabel}
                    </label>
                    {props.onQuickAddBranchBank && (
                      <button type="button" onClick={props.onQuickAddBranchBank} style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-primary, #2563eb)', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '0.25rem' }}>
                        + Add Bank
                      </button>
                    )}
                  </div>
                  <Select
                    value={state.branchBankId}
                    onChange={(val) => state.setBranchBankId(String(val))}
                    options={state.branchSelectOptions}
                    placeholder={props.branchBanksLoading ? 'Loading branch banks...' : state.branchSelectOptions.length === 0 ? 'Default Branch Ledger Account' : 'Select branch bank'}
                    disabled={props.disabled || Boolean(props.branchBanksLoading)}
                  />
                </div>
              )}
            </div>
          )}

          <div>
            <label style={labelStyle}>Payment Notes</label>
            <input
              type="text"
              disabled={props.disabled}
              value={state.notes}
              onChange={(e) => state.setNotes(e.target.value)}
              placeholder="Optional remarks"
              style={inputStyle}
            />
          </div>
        </>
      )}

      {(state.validationError || props.error) && (
        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-danger, #dc2626)', padding: '0.45rem 0.65rem', borderRadius: '6px', backgroundColor: 'var(--color-danger-soft, #fef2f2)' }}>
          {props.error || state.validationError}
        </div>
      )}

      {(props.onSubmit || props.onCancel) && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', paddingTop: '0.35rem', borderTop: '1px solid var(--border-color, #e2e8f0)' }}>
          {props.onCancel && (
            <button
              type="button"
              onClick={props.onCancel}
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', background: 'var(--bg-surface, #ffffff)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
            >
              Cancel
            </button>
          )}
          {props.onSubmit && (
            <button
              type="button"
              disabled={submitDisabled}
              data-testid="fast-payment-submit"
              onClick={state.submit}
              style={{
                padding: '0.5rem 1.15rem',
                borderRadius: '8px',
                border: 'none',
                background: submitDisabled ? 'var(--border-color, #94a3b8)' : 'var(--color-primary, #2563eb)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: submitDisabled ? 'not-allowed' : 'pointer',
              }}
            >
              {props.loading ? 'Saving...' : props.submitLabel || 'Record Payment'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
