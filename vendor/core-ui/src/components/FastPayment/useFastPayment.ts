import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  FastPaymentBankAccount,
  FastPaymentProps,
  FastPaymentSplitLine,
  FastPaymentValue,
  PaymentDirection,
  PaymentMode,
  SplitRowMode,
} from './FastPayment.types';

let splitLineSeq = 0;
function nextSplitLineId(): string {
  splitLineSeq += 1;
  return `fp-split-${Date.now()}-${splitLineSeq}`;
}

function round2(n: number): number {
  return Math.round((Number.isFinite(n) ? n : 0) * 100) / 100;
}

export function formatBankAccountOptionLabel(acc: FastPaymentBankAccount): string {
  const num = acc.account_number ? `••${acc.account_number.slice(-4)}` : '';
  const code = acc.upi_id ? ` • ${acc.upi_id}` : acc.ifsc_code ? ` (${acc.ifsc_code})` : '';
  const star = acc.is_primary ? ' ★ Primary' : '';
  return `${acc.bank_name}${num ? ` ${num}` : ''}${code}${star}`.trim();
}

export const ALL_PAYMENT_MODES: PaymentMode[] = [
  'CREDIT',
  'CASH',
  'BANK',
  'UPI',
  'CARD',
  'CHEQUE',
  'SPLIT',
];

export const MODE_LABELS: Record<PaymentMode, string> = {
  CREDIT: 'On Account',
  CASH: 'Cash',
  BANK: 'Bank',
  UPI: 'UPI',
  CARD: 'Card',
  CHEQUE: 'Cheque',
  SPLIT: 'Split',
};

export interface UseFastPaymentReturn {
  direction: PaymentDirection;
  setDirection: (dir: PaymentDirection) => void;
  modes: PaymentMode[];
  mode: PaymentMode;
  selectMode: (mode: PaymentMode) => void;
  paidAmountStr: string;
  setPaidAmountStr: (val: string) => void;
  effectivePaidAmount: number;
  remainingBalance: number;
  tenderedAmountStr: string;
  setTenderedAmountStr: (val: string) => void;
  changeAmount: number;
  branchBankId: string;
  setBranchBankId: (id: string) => void;
  partyBankId: string;
  setPartyBankId: (id: string) => void;
  reference: string;
  setReference: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  splitLines: FastPaymentSplitLine[];
  addSplitLine: () => void;
  removeSplitLine: (id: string) => void;
  updateSplitLine: (id: string, patch: Partial<FastPaymentSplitLine>) => void;
  applyFullDue: () => void;
  applyHalfDue: () => void;
  applyExactTender: () => void;
  addTenderDelta: (delta: number) => void;
  needsBranchBank: boolean;
  needsPartyBank: boolean;
  validationError: string | null;
  branchSelectOptions: { value: string; label: string }[];
  partySelectOptions: { value: string; label: string }[];
  splitModeOptions: { value: string; label: string }[];
  submit: () => Promise<void>;
  currentValue: FastPaymentValue;
}

export function useFastPayment(props: FastPaymentProps): UseFastPaymentReturn {
  const {
    direction: propDirection = 'INFLOW',
    allowedModes,
    allowCredit = true,
    totalDue,
    defaultMode,
    value: controlledValue,
    branchBankAccounts = [],
    partyBankAccounts = [],
    showChangeCalculator = false,
    allowPartial = true,
    onChange,
    onSubmit,
  } = props;

  const modes = useMemo<PaymentMode[]>(() => {
    const base = allowedModes && allowedModes.length > 0 ? allowedModes : ALL_PAYMENT_MODES;
    return allowCredit ? base : base.filter((m) => m !== 'CREDIT');
  }, [allowedModes, allowCredit]);

  const initialMode: PaymentMode =
    controlledValue?.payment_mode ||
    defaultMode ||
    (modes.includes('CASH') ? 'CASH' : modes[0] || 'CREDIT');

  const [direction, setDirectionState] = useState<PaymentDirection>(
    controlledValue?.direction || propDirection
  );
  const [mode, setModeState] = useState<PaymentMode>(initialMode);
  const [paidAmountStr, setPaidAmountStr] = useState<string>(() => {
    if (controlledValue?.paid_amount !== undefined) return String(controlledValue.paid_amount);
    if (initialMode === 'CREDIT') return '0';
    return totalDue > 0 ? String(round2(totalDue)) : '0';
  });
  const [tenderedAmountStr, setTenderedAmountStr] = useState<string>(() =>
    controlledValue?.tendered_amount !== undefined ? String(controlledValue.tendered_amount) : ''
  );
  const [branchBankId, setBranchBankId] = useState<string>(
    controlledValue?.branch_bank_account_id || ''
  );
  const [partyBankId, setPartyBankId] = useState<string>(
    controlledValue?.party_bank_account_id || ''
  );
  const [reference, setReference] = useState<string>(controlledValue?.reference || '');
  const [notes, setNotes] = useState<string>(controlledValue?.notes || '');
  const [splitLines, setSplitLines] = useState<FastPaymentSplitLine[]>(() =>
    controlledValue?.split_lines && controlledValue.split_lines.length > 0
      ? controlledValue.split_lines
      : [
          { id: nextSplitLineId(), mode: 'CASH', amount: round2(totalDue) },
          { id: nextSplitLineId(), mode: 'UPI', amount: 0 },
        ]
  );

  // Track if user has explicitly edited paid amount so prop totalDue updates can keep sync on non-credit defaults
  const prevDueRef = useRef(totalDue);
  useEffect(() => {
    if (prevDueRef.current !== totalDue) {
      const prevWasFull = Math.abs((parseFloat(paidAmountStr) || 0) - prevDueRef.current) < 0.01;
      if (mode !== 'CREDIT' && mode !== 'SPLIT' && (prevWasFull || !allowPartial)) {
        setPaidAmountStr(String(round2(Math.max(0, totalDue))));
      }
      prevDueRef.current = totalDue;
    }
  }, [totalDue, mode, paidAmountStr, allowPartial]);

  useEffect(() => {
    setDirectionState(propDirection);
  }, [propDirection]);

  // Auto-select primary branch bank when loaded
  useEffect(() => {
    if (branchBankAccounts.length === 0) return;
    const stillValid = branchBankAccounts.some((b) => b.id === branchBankId);
    if (!branchBankId || !stillValid) {
      const prim = branchBankAccounts.find((b) => b.is_primary) || branchBankAccounts[0];
      if (prim?.id) setBranchBankId(prim.id);
    }
  }, [branchBankAccounts, branchBankId]);

  // Auto-select primary party bank in OUTFLOW mode when loaded
  useEffect(() => {
    if (direction !== 'OUTFLOW' || partyBankAccounts.length === 0) return;
    const stillValid = partyBankAccounts.some((b) => b.id === partyBankId);
    if (!partyBankId || !stillValid) {
      const prim = partyBankAccounts.find((b) => b.is_primary) || partyBankAccounts[0];
      if (prim?.id) setPartyBankId(prim.id);
    }
  }, [direction, partyBankAccounts, partyBankId]);

  const splitTotal = useMemo(
    () => round2(splitLines.reduce((sum, l) => sum + (Number(l.amount) || 0), 0)),
    [splitLines]
  );

  const effectivePaidAmount = useMemo(() => {
    if (mode === 'CREDIT') return 0;
    if (mode === 'SPLIT') return splitTotal;
    const n = parseFloat(paidAmountStr);
    return Number.isFinite(n) && n > 0 ? round2(n) : 0;
  }, [mode, splitTotal, paidAmountStr]);

  const remainingBalance = useMemo(
    () => Math.max(0, round2(totalDue - effectivePaidAmount)),
    [totalDue, effectivePaidAmount]
  );

  const parsedTendered = useMemo(() => {
    const n = parseFloat(tenderedAmountStr);
    return Number.isFinite(n) && n > 0 ? round2(n) : 0;
  }, [tenderedAmountStr]);

  const changeAmount = useMemo(() => {
    if (!showChangeCalculator || mode !== 'CASH') return 0;
    if (parsedTendered <= effectivePaidAmount) return 0;
    return round2(parsedTendered - effectivePaidAmount);
  }, [showChangeCalculator, mode, parsedTendered, effectivePaidAmount]);

  const needsBranchBank = useMemo(() => {
    if (mode === 'BANK' || mode === 'UPI' || mode === 'CARD' || mode === 'CHEQUE') {
      return direction === 'INFLOW' || direction === 'OUTFLOW';
    }
    if (mode === 'SPLIT') {
      return splitLines.some((l) => l.mode !== 'CASH');
    }
    return false;
  }, [mode, direction, splitLines]);

  const needsPartyBank = useMemo(() => {
    if (direction !== 'OUTFLOW') return false;
    if (mode === 'BANK' || mode === 'UPI' || mode === 'CARD' || mode === 'CHEQUE') return true;
    if (mode === 'SPLIT') return splitLines.some((l) => l.mode !== 'CASH');
    return false;
  }, [direction, mode, splitLines]);

  const validationError = useMemo(() => {
    if (totalDue > 0 && effectivePaidAmount > totalDue + 0.01) {
      return `Paid amount cannot exceed due balance (${round2(totalDue)})`;
    }
    if (!allowPartial && mode !== 'CREDIT' && totalDue > 0 && effectivePaidAmount + 0.01 < totalDue) {
      return `Full settlement required (${round2(totalDue)})`;
    }
    if (mode === 'SPLIT' && splitLines.length === 0) {
      return 'Add at least one split payment row';
    }
    return null;
  }, [totalDue, effectivePaidAmount, allowPartial, mode, splitLines.length]);

  const currentValue = useMemo<FastPaymentValue>(
    () => ({
      direction,
      payment_mode: mode,
      paid_amount: effectivePaidAmount,
      ...(showChangeCalculator && mode === 'CASH' && parsedTendered > 0
        ? { tendered_amount: parsedTendered, change_amount: changeAmount }
        : {}),
      ...(needsBranchBank && branchBankId ? { branch_bank_account_id: branchBankId } : {}),
      ...(needsPartyBank && partyBankId ? { party_bank_account_id: partyBankId } : {}),
      ...(reference.trim() ? { reference: reference.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(mode === 'SPLIT'
        ? {
            split_lines: splitLines
              .filter((l) => (Number(l.amount) || 0) > 0)
              .map((l) => ({
                ...l,
                branch_bank_account_id:
                  l.mode !== 'CASH' ? l.branch_bank_account_id || branchBankId || undefined : undefined,
                party_bank_account_id:
                  direction === 'OUTFLOW' && l.mode !== 'CASH'
                    ? l.party_bank_account_id || partyBankId || undefined
                    : undefined,
              })),
          }
        : {}),
    }),
    [
      direction,
      mode,
      effectivePaidAmount,
      showChangeCalculator,
      parsedTendered,
      changeAmount,
      needsBranchBank,
      branchBankId,
      needsPartyBank,
      partyBankId,
      reference,
      notes,
      splitLines,
    ]
  );

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const lastEmittedRef = useRef<string>('');
  useEffect(() => {
    const serialized = JSON.stringify(currentValue);
    if (serialized !== lastEmittedRef.current) {
      lastEmittedRef.current = serialized;
      onChangeRef.current?.(currentValue);
    }
  }, [currentValue]);

  const selectMode = useCallback(
    (nextMode: PaymentMode) => {
      setModeState(nextMode);
      if (nextMode === 'CREDIT') {
        setPaidAmountStr('0');
      } else if (nextMode === 'SPLIT') {
        const half = round2(totalDue / 2);
        const rem = round2(Math.max(0, totalDue - half));
        setSplitLines([
          { id: nextSplitLineId(), mode: 'CASH', amount: half },
          {
            id: nextSplitLineId(),
            mode: 'UPI',
            amount: rem,
            branch_bank_account_id: branchBankId || undefined,
          },
        ]);
      } else if ((parseFloat(paidAmountStr) || 0) <= 0 && totalDue > 0) {
        setPaidAmountStr(String(round2(totalDue)));
      }
    },
    [totalDue, paidAmountStr, branchBankId]
  );

  const setDirection = useCallback((dir: PaymentDirection) => {
    setDirectionState(dir);
  }, []);

  const addSplitLine = useCallback(() => {
    const rem = Math.max(0, round2(totalDue - splitTotal));
    setSplitLines((prev) => [
      ...prev,
      {
        id: nextSplitLineId(),
        mode: 'BANK',
        amount: rem,
        branch_bank_account_id: branchBankId || undefined,
      },
    ]);
  }, [totalDue, splitTotal, branchBankId]);

  const removeSplitLine = useCallback((id: string) => {
    setSplitLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }, []);

  const updateSplitLine = useCallback((id: string, patch: Partial<FastPaymentSplitLine>) => {
    setSplitLines((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const applyFullDue = useCallback(() => {
    setPaidAmountStr(String(round2(Math.max(0, totalDue))));
  }, [totalDue]);

  const applyHalfDue = useCallback(() => {
    setPaidAmountStr(String(round2(Math.max(0, totalDue / 2))));
  }, [totalDue]);

  const applyExactTender = useCallback(() => {
    setTenderedAmountStr(String(round2(effectivePaidAmount)));
  }, [effectivePaidAmount]);

  const addTenderDelta = useCallback(
    (delta: number) => {
      const base = parseFloat(tenderedAmountStr) || 0;
      setTenderedAmountStr(String(round2(base + delta)));
    },
    [tenderedAmountStr]
  );

  const branchSelectOptions = useMemo(
    () =>
      branchBankAccounts.map((b) => ({
        value: b.id,
        label: formatBankAccountOptionLabel(b),
      })),
    [branchBankAccounts]
  );

  const partySelectOptions = useMemo(
    () =>
      partyBankAccounts.map((b) => ({
        value: b.id,
        label: formatBankAccountOptionLabel(b),
      })),
    [partyBankAccounts]
  );

  const splitModeOptions: { value: SplitRowMode; label: string }[] = useMemo(
    () => [
      { value: 'CASH', label: 'Cash' },
      { value: 'BANK', label: 'Bank Transfer' },
      { value: 'UPI', label: 'UPI' },
      { value: 'CARD', label: 'Card' },
      { value: 'CHEQUE', label: 'Cheque' },
    ],
    []
  );

  const submit = useCallback(async () => {
    if (validationError || !onSubmit) return;
    await onSubmit(currentValue);
  }, [validationError, onSubmit, currentValue]);

  return {
    direction,
    setDirection,
    modes,
    mode,
    selectMode,
    paidAmountStr,
    setPaidAmountStr,
    effectivePaidAmount,
    remainingBalance,
    tenderedAmountStr,
    setTenderedAmountStr,
    changeAmount,
    branchBankId,
    setBranchBankId,
    partyBankId,
    setPartyBankId,
    reference,
    setReference,
    notes,
    setNotes,
    splitLines,
    addSplitLine,
    removeSplitLine,
    updateSplitLine,
    applyFullDue,
    applyHalfDue,
    applyExactTender,
    addTenderDelta,
    needsBranchBank,
    needsPartyBank,
    validationError,
    branchSelectOptions,
    partySelectOptions,
    splitModeOptions,
    submit,
    currentValue,
  };
}
