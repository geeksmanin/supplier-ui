export type PaymentDirection = 'INFLOW' | 'OUTFLOW';

export type PaymentMode = 'CREDIT' | 'CASH' | 'BANK' | 'UPI' | 'CARD' | 'CHEQUE' | 'SPLIT';

export type SplitRowMode = Exclude<PaymentMode, 'CREDIT' | 'SPLIT'>;

export interface FastPaymentBankAccount {
  id: string;
  bank_name: string;
  account_holder_name?: string;
  account_number: string;
  ifsc_code?: string;
  branch_name?: string;
  upi_id?: string;
  is_primary?: boolean;
}

export interface FastPaymentSplitLine {
  id: string;
  mode: SplitRowMode;
  amount: number;
  branch_bank_account_id?: string;
  party_bank_account_id?: string;
  reference?: string;
}

export interface FastPaymentValue {
  direction: PaymentDirection;
  payment_mode: PaymentMode;
  paid_amount: number;
  tendered_amount?: number;
  change_amount?: number;
  branch_bank_account_id?: string;
  party_bank_account_id?: string;
  reference?: string;
  notes?: string;
  split_lines?: FastPaymentSplitLine[];
}

export interface FastPaymentProps {
  direction?: PaymentDirection;
  allowDirectionToggle?: boolean;
  allowedModes?: PaymentMode[];
  totalDue: number;
  defaultMode?: PaymentMode;
  value?: Partial<FastPaymentValue>;
  partyName?: string;
  partyType?: 'CUSTOMER' | 'SUPPLIER';
  branchBankAccounts?: FastPaymentBankAccount[];
  partyBankAccounts?: FastPaymentBankAccount[];
  branchBanksLoading?: boolean;
  partyBanksLoading?: boolean;
  onQuickAddBranchBank?: () => void;
  onQuickAddPartyBank?: () => void;
  showChangeCalculator?: boolean;
  allowPartial?: boolean;
  allowCredit?: boolean;
  variant?: 'inline' | 'card' | 'modal';
  title?: string;
  submitLabel?: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
  currencySymbol?: string;
  onChange?: (value: FastPaymentValue) => void;
  onSubmit?: (value: FastPaymentValue) => void | Promise<void>;
  onCancel?: () => void;
}
