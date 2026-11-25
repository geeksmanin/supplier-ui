import React from 'react';
import { ArrowLeft, Calendar, Clock, RotateCcw, Hash } from 'lucide-react';
import { VoucherPartyConfig, VoucherPartyOption } from './FastVoucherEntryLayout.types';
import { FastVoucherHeaderPartySelect } from './FastVoucherHeaderPartySelect';

interface FastVoucherHeaderRibbonProps {
  documentTitle: string;
  hideDocumentTitle?: boolean;
  status: string;
  voucherNumber?: string;
  onVoucherNumberChange?: (val: string) => void;
  voucherNumberLabel?: string;
  voucherNumberPlaceholder?: string;
  onCancel?: () => void;
  partyLayout?: 'side-by-side' | 'header';
  partyConfig: VoucherPartyConfig;
  selectedParty: VoucherPartyOption | null;
  onPartySelect?: (party: VoucherPartyOption) => void;
  renderPartySelect?: (props: any) => React.ReactNode;
  partyOptions: VoucherPartyOption[];
  isPartyDropdownOpen: boolean;
  setIsPartyDropdownOpen: (open: boolean) => void;
  partySearchQuery: string;
  setPartySearchQuery: (query: string) => void;
  partyLoading: boolean;
  partyInputRef: React.RefObject<HTMLInputElement | null>;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  voucherDate: string;
  onVoucherDateChange?: (date: string) => void;
  dueDate?: string;
  onDueDateChange?: (date: string) => void;
  entryDate?: string;
  autoConfirm?: boolean;
  onAutoConfirmChange?: (val: boolean) => void;
  autoConfirmLabel?: string;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (fn: (prev: boolean) => boolean) => void;
  moreDetailsBadgeCount: number;
  enableBillParking: boolean;
  handleParkBill: () => void;
  setIsParkedModalOpen: (open: boolean) => void;
  activeParkedCount: number;
  headerExtraActions?: React.ReactNode;
  onDiscard?: () => void;
}

export const FastVoucherHeaderRibbon: React.FC<FastVoucherHeaderRibbonProps> = ({
  documentTitle,
  hideDocumentTitle = false,
  status,
  voucherNumber,
  onVoucherNumberChange,
  voucherNumberLabel,
  voucherNumberPlaceholder,
  onCancel,
  partyLayout = 'side-by-side',
  partyConfig,
  selectedParty,
  onPartySelect,
  renderPartySelect,
  partyOptions,
  isPartyDropdownOpen,
  setIsPartyDropdownOpen,
  partySearchQuery,
  setPartySearchQuery,
  partyLoading,
  partyInputRef,
  searchInputRef,
  voucherDate,
  onVoucherDateChange,
  dueDate,
  onDueDateChange,
  entryDate,
  autoConfirm,
  onAutoConfirmChange,
  autoConfirmLabel,
  isDrawerOpen,
  setIsDrawerOpen,
  moreDetailsBadgeCount,
  enableBillParking,
  handleParkBill,
  setIsParkedModalOpen,
  activeParkedCount,
  headerExtraActions,
  onDiscard,
}) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 1rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        zIndex: 30,
        gap: '0.75rem',
        flexWrap: 'nowrap',
        overflowX: 'auto',
      }}
    >
      {/* Left: Navigation, Title/Status & Direct Voucher Details */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flex: 1, minWidth: 0, flexWrap: 'wrap' }}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '30px',
              height: '30px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              color: '#64748b',
              flexShrink: 0,
            }}
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
        )}

        {/* Status Badge */}
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: '9999px',
            backgroundColor: status === 'APPROVED' ? '#ecfdf5' : '#fef3c7',
            color: status === 'APPROVED' ? '#047857' : '#b45309',
            border: status === 'APPROVED' ? '1px solid #a7f3d0' : '1px solid #fde68a',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {status}
        </span>

        {/* Compact Document Title (rendered only when not explicitly hidden) */}
        {!hideDocumentTitle && (
          <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {documentTitle}
          </span>
        )}

        {/* Vendor Invoice / Bill Number Input (if onVoucherNumberChange is provided) */}
        {onVoucherNumberChange ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>
              <Hash size={13} style={{ color: '#64748b' }} />
              <span>{voucherNumberLabel || 'Bill No.'} *</span>
            </label>
            <input
              type="text"
              value={voucherNumber || ''}
              onChange={(e) => onVoucherNumberChange(e.target.value)}
              placeholder={voucherNumberPlaceholder || 'e.g. INV-001'}
              style={{
                width: '135px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.8rem',
                fontWeight: 600,
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            />
          </div>
        ) : voucherNumber ? (
          <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace', whiteSpace: 'nowrap', flexShrink: 0 }}>
            Doc #: {voucherNumber}
          </div>
        ) : null}

        {/* Invoice Date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>
            <Calendar size={13} style={{ color: '#64748b' }} />
            <span>Inv Date *</span>
          </label>
          <input
            type="date"
            value={voucherDate}
            onChange={(e) => onVoucherDateChange?.(e.target.value)}
            style={{
              padding: '3px 6px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.75rem',
              fontWeight: 600,
              outline: 'none',
              backgroundColor: '#ffffff',
            }}
          />
        </div>

        {/* Due Date (if onDueDateChange provided) */}
        {onDueDateChange && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.75rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
              <span>Due:</span>
            </label>
            <input
              type="date"
              value={dueDate || ''}
              onChange={(e) => onDueDateChange(e.target.value)}
              style={{
                padding: '3px 6px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '0.75rem',
                fontWeight: 600,
                outline: 'none',
                backgroundColor: '#ffffff',
              }}
            />
          </div>
        )}

        {/* System Entry Date */}
        {entryDate && (
          <div
            style={{
              fontSize: '0.72rem',
              color: '#64748b',
              backgroundColor: '#f1f5f9',
              padding: '3px 7px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            Entry: {entryDate}
          </div>
        )}

        {/* Inward Stock on Save Toggle */}
        {onAutoConfirmChange && (
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#334155',
              cursor: 'pointer',
              backgroundColor: '#f8fafc',
              padding: '3px 8px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <input
              type="checkbox"
              checked={Boolean(autoConfirm)}
              onChange={(e) => onAutoConfirmChange(e.target.checked)}
              style={{ cursor: 'pointer', width: 14, height: 14 }}
            />
            <span>{autoConfirmLabel || 'Inward Stock'}</span>
          </label>
        )}

        {/* Fallback Party Selector in header (only if partyLayout is 'header') */}
        {partyLayout === 'header' && (
          <FastVoucherHeaderPartySelect
            partyConfig={partyConfig}
            selectedParty={selectedParty}
            onPartySelect={onPartySelect}
            renderPartySelect={renderPartySelect}
            partyOptions={partyOptions}
            isPartyDropdownOpen={isPartyDropdownOpen}
            setIsPartyDropdownOpen={setIsPartyDropdownOpen}
            partySearchQuery={partySearchQuery}
            setPartySearchQuery={setPartySearchQuery}
            partyLoading={partyLoading}
            partyInputRef={partyInputRef}
            searchInputRef={searchInputRef}
          />
        )}
      </div>

      {/* Right: Discard, Bill Parking, More Info, and Custom Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        {/* Discard Voucher Entry Button */}
        {onDiscard && (
          <button
            type="button"
            onClick={onDiscard}
            title="Discard current voucher entry (Clear items & reset)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #fecaca',
              backgroundColor: '#fff1f2',
              color: '#dc2626',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <RotateCcw size={12} />
            <span>Discard</span>
          </button>
        )}

        {/* More Details (F3) */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen((prev) => !prev)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: isDrawerOpen ? '#eff6ff' : '#ffffff',
            color: isDrawerOpen ? '#2563eb' : '#475569',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <span>More Info</span>
          {moreDetailsBadgeCount > 0 && (
            <span
              style={{
                fontSize: '0.65rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                borderRadius: '9999px',
                padding: '1px 5px',
              }}
            >
              {moreDetailsBadgeCount}
            </span>
          )}
          <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>[F3]</span>
        </button>

        {/* Park Bill (F6) & Recall (F7) */}
        {enableBillParking && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={handleParkBill}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              title="Park current bill into IndexedDB (F6)"
            >
              <Clock size={12} style={{ color: '#d97706' }} />
              <span>Park</span>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>[F6]</span>
            </button>

            <button
              type="button"
              onClick={() => setIsParkedModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 7px',
                borderRadius: '6px',
                border: activeParkedCount > 0 ? '1px solid #fde68a' : '1px solid #cbd5e1',
                backgroundColor: activeParkedCount > 0 ? '#fef3c7' : '#ffffff',
                color: activeParkedCount > 0 ? '#b45309' : '#475569',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              title="Recall held/parked bills (F7)"
            >
              <span>Held ({activeParkedCount})</span>
              <span style={{ fontSize: '0.65rem', color: activeParkedCount > 0 ? '#b45309' : '#94a3b8' }}>[F7]</span>
            </button>
          </div>
        )}

        {/* Header Extra Actions */}
        {headerExtraActions && (
          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            {headerExtraActions}
          </div>
        )}
      </div>
    </header>
  );
};
