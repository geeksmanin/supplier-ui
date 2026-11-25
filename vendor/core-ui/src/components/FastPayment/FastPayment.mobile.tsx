import React from 'react';
import { Building2, Plus, Trash2, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Select } from '../Select';
import { FastPaymentProps, SplitRowMode } from './FastPayment.types';
import { MODE_LABELS, UseFastPaymentReturn } from './useFastPayment';

export interface FastPaymentMobileViewProps {
  props: FastPaymentProps;
  state: UseFastPaymentReturn;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--bg-surface, #ffffff)',
  border: '1px solid var(--border-color, #e2e8f0)',
  borderRadius: '12px',
  padding: '0.9rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
  width: '100%',
  boxSizing: 'border-box',
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.6rem 0.75rem',
  border: '1px solid var(--border-color, #cbd5e1)',
  borderRadius: '8px',
  fontSize: '0.95rem',
  backgroundColor: 'var(--bg-surface, #ffffff)',
  boxSizing: 'border-box',
};

export const FastPaymentMobile: React.FC<FastPaymentMobileViewProps> = ({ props, state }) => {
  const currency = props.currencySymbol || '₹';
  const isOutflow = state.direction === 'OUTFLOW';
  const partyLabel =
    props.partyType === 'SUPPLIER' || isOutflow
      ? `${props.partyName || 'Supplier'} Bank Account`
      : `${props.partyName || 'Customer'} Bank Account`;
  const branchLabel = isOutflow ? 'Paid From (Branch Bank)' : 'Deposited Into (Branch Bank)';
  const submitDisabled =
    Boolean(props.loading) ||
    Boolean(props.disabled) ||
    Boolean(state.validationError) ||
    (props.variant === 'modal' && state.mode !== 'CREDIT' && state.effectivePaidAmount <= 0);

  return (
    <div style={cardStyle} data-testid="fast-payment-mobile">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {props.title || (isOutflow ? 'Pay Outbound' : 'Collect Payment')}
          </span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.45rem', borderRadius: '999px', border: '1px solid var(--border-color, #cbd5e1)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            {isOutflow ? <ArrowUpRight size={11} /> : <ArrowDownLeft size={11} />}
            {isOutflow ? 'OUT' : 'IN'}
          </span>
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
          Due {currency}{props.totalDue.toFixed(2)}
        </span>
      </div>

      {props.allowDirectionToggle && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={() => state.setDirection('INFLOW')}
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: !isOutflow ? 'var(--color-primary, #2563eb)' : 'transparent',
              color: !isOutflow ? '#ffffff' : 'var(--text-primary, #334155)',
              fontWeight: 600,
              fontSize: '0.82rem',
            }}
          >
            Receive (Inflow)
          </button>
          <button
            type="button"
            onClick={() => state.setDirection('OUTFLOW')}
            style={{
              padding: '0.45rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: isOutflow ? 'var(--color-primary, #2563eb)' : 'transparent',
              color: isOutflow ? '#ffffff' : 'var(--text-primary, #334155)',
              fontWeight: 600,
              fontSize: '0.82rem',
            }}
          >
            Pay (Outflow)
          </button>
        </div>
      )}

      {/* Horizontally scrollable mode strip for mobile ergonomics (keeps row density clean) */}
      <div style={{ display: 'flex', overflowX: 'auto', gap: '0.4rem', paddingBottom: '0.15rem' }}>
        {state.modes.map((m) => {
          const active = state.mode === m;
          return (
            <button
              key={m}
              type="button"
              disabled={props.disabled}
              onClick={() => state.selectMode(m)}
              style={{
                flexShrink: 0,
                padding: '0.45rem 0.85rem',
                borderRadius: '999px',
                border: active ? '1.5px solid var(--color-primary, #2563eb)' : '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: active ? 'var(--color-primary-soft, #eff6ff)' : 'transparent',
                color: active ? 'var(--color-primary, #1d4ed8)' : 'var(--text-primary, #334155)',
                fontWeight: active ? 700 : 500,
                fontSize: '0.82rem',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600 }}>Amount ({currency})</label>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary, #64748b)' }}>
                    Bal: {currency}{state.remainingBalance.toFixed(2)}
                  </span>
                </div>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  disabled={props.disabled}
                  value={state.paidAmountStr}
                  onChange={(e) => state.setPaidAmountStr(e.target.value)}
                  style={fieldStyle}
                />
              </div>

              {props.showChangeCalculator && state.mode === 'CASH' && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    Tendered ({currency})
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    disabled={props.disabled}
                    value={state.tenderedAmountStr}
                    onChange={(e) => state.setTenderedAmountStr(e.target.value)}
                    placeholder="Cash received"
                    style={fieldStyle}
                  />
                  {state.changeAmount > 0 && (
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-success, #059669)', marginTop: '0.25rem' }}>
                      Return Change: {currency}{state.changeAmount.toFixed(2)}
                    </div>
                  )}
                </div>
              )}

              {state.needsPartyBank && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    <Building2 size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {partyLabel}
                  </label>
                  <Select
                    value={state.partyBankId}
                    onChange={(val) => state.setPartyBankId(String(val))}
                    options={state.partySelectOptions}
                    placeholder={state.partySelectOptions.length === 0 ? 'No party banks saved' : 'Select party bank'}
                    disabled={props.disabled}
                  />
                </div>
              )}

              {state.needsBranchBank && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
                    <Building2 size={12} style={{ display: 'inline', marginRight: '0.25rem' }} />
                    {branchLabel}
                  </label>
                  <Select
                    value={state.branchBankId}
                    onChange={(val) => state.setBranchBankId(String(val))}
                    options={state.branchSelectOptions}
                    placeholder={state.branchSelectOptions.length === 0 ? 'Default Branch Account' : 'Select branch bank'}
                    disabled={props.disabled}
                  />
                </div>
              )}

              <input
                type="text"
                disabled={props.disabled}
                value={state.reference}
                onChange={(e) => state.setReference(e.target.value)}
                placeholder="Reference / UTR / Cheque No"
                style={fieldStyle}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {state.splitLines.map((line) => (
                <div key={line.id} style={{ padding: '0.6rem', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <Select
                        value={line.mode}
                        onChange={(val) => state.updateSplitLine(line.id, { mode: val as SplitRowMode })}
                        options={state.splitModeOptions}
                        disabled={props.disabled}
                      />
                    </div>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0"
                      value={line.amount || ''}
                      onChange={(e) => state.updateSplitLine(line.id, { amount: parseFloat(e.target.value) || 0 })}
                      placeholder="Amount"
                      style={{ ...fieldStyle, flex: 1 }}
                    />
                    <button type="button" onClick={() => state.removeSplitLine(line.id)} style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-color, #cbd5e1)', background: 'transparent' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {line.mode !== 'CASH' && (
                    <Select
                      value={line.branch_bank_account_id || ''}
                      onChange={(val) => state.updateSplitLine(line.id, { branch_bank_account_id: String(val) })}
                      options={state.branchSelectOptions}
                      placeholder={branchLabel}
                      disabled={props.disabled}
                    />
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={state.addSplitLine}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.5rem', borderRadius: '8px', border: '1px dashed var(--border-color, #cbd5e1)', background: 'transparent', fontWeight: 600, fontSize: '0.82rem' }}
              >
                <Plus size={14} /> Add Split Leg
              </button>
            </div>
          )}
        </>
      )}

      {(state.validationError || props.error) && (
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-danger, #dc2626)' }}>
          {props.error || state.validationError}
        </div>
      )}

      {(props.onSubmit || props.onCancel) && (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {props.onCancel && (
            <button type="button" onClick={props.onCancel} style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border-color, #cbd5e1)', background: 'transparent', fontWeight: 600 }}>
              Cancel
            </button>
          )}
          {props.onSubmit && (
            <button
              type="button"
              disabled={submitDisabled}
              onClick={state.submit}
              style={{ flex: 2, padding: '0.6rem', borderRadius: '8px', border: 'none', background: submitDisabled ? 'var(--border-color, #94a3b8)' : 'var(--color-primary, #2563eb)', color: '#ffffff', fontWeight: 700 }}
            >
              {props.loading ? 'Saving...' : props.submitLabel || 'Record Payment'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
