import React from 'react';
import { ArrowLeft, Search, Calendar, Clock } from 'lucide-react';
import { VoucherPartyConfig, VoucherPartyOption } from './FastVoucherEntryLayout.types';

interface FastVoucherHeaderRibbonProps {
  documentTitle: string;
  status: string;
  voucherNumber?: string;
  onCancel?: () => void;
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
  partyInputRef: React.RefObject<HTMLInputElement>;
  searchInputRef: React.RefObject<HTMLInputElement>;
  voucherDate: string;
  onVoucherDateChange?: (date: string) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (fn: (prev: boolean) => boolean) => void;
  moreDetailsBadgeCount: number;
  enableBillParking: boolean;
  handleParkBill: () => void;
  setIsParkedModalOpen: (open: boolean) => void;
  activeParkedCount: number;
  headerExtraActions?: React.ReactNode;
}

export const FastVoucherHeaderRibbon: React.FC<FastVoucherHeaderRibbonProps> = ({
  documentTitle,
  status,
  voucherNumber,
  onCancel,
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
  isDrawerOpen,
  setIsDrawerOpen,
  moreDetailsBadgeCount,
  enableBillParking,
  handleParkBill,
  setIsParkedModalOpen,
  activeParkedCount,
  headerExtraActions,
}) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1.25rem',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        zIndex: 30,
      }}
    >
      {/* Left: Document Title & Party Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        {onCancel && (
          <button
            onClick={onCancel}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
              color: '#64748b',
            }}
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
        )}

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
              {documentTitle}
            </span>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '9999px',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                border: '1px solid #fde68a',
              }}
            >
              {status}
            </span>
          </div>
          {voucherNumber && (
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
              Doc #: {voucherNumber}
            </div>
          )}
        </div>

        {/* Vertical Divider */}
        <div style={{ width: '1px', height: '28px', backgroundColor: '#e2e8f0', margin: '0 0.25rem' }} />

        {/* Party Selector (F2) */}
        <div style={{ position: 'relative', width: '320px' }}>
          {renderPartySelect ? (
            renderPartySelect({ selectedParty, onPartySelect })
          ) : partyConfig.renderPartySelect ? (
            partyConfig.renderPartySelect({ selectedParty, onPartySelect })
          ) : (
            <>
              <div
                onClick={() => {
                  setIsPartyDropdownOpen(true);
                  partyInputRef.current?.focus();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: isPartyDropdownOpen ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                  <span style={{ color: '#64748b', marginRight: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    {partyConfig.label}:
                  </span>
                  <strong style={{ color: selectedParty ? '#0f172a' : '#94a3b8' }}>
                    {selectedParty ? selectedParty.label : partyConfig.placeholder || `Select ${partyConfig.label}...`}
                  </strong>
                  {selectedParty?.gstin && (
                    <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                      ({selectedParty.gstin})
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    padding: '2px 5px',
                    borderRadius: '4px',
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #dbeafe',
                  }}
                >
                  F2
                </span>
              </div>

              {/* Party Dropdown Popover */}
              {isPartyDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    width: '380px',
                    marginTop: '4px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                    zIndex: 60,
                    padding: '0.5rem',
                  }}
                >
                  <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                    <Search size={14} style={{ position: 'absolute', left: '8px', top: '9px', color: '#94a3b8' }} />
                    <input
                      ref={partyInputRef}
                      type="text"
                      className="bare-input"
                      data-bare-input="true"
                      placeholder={`Search ${partyConfig.label} by name, GSTIN...`}
                      value={partySearchQuery}
                      onChange={(e) => setPartySearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsPartyDropdownOpen(false);
                        } else if (e.key === 'Enter' && partyOptions.length > 0) {
                          onPartySelect?.(partyOptions[0]);
                          setIsPartyDropdownOpen(false);
                          searchInputRef.current?.focus();
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '6px 8px 6px 28px',
                        fontSize: '0.8rem',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                      }}
                      autoFocus
                    />
                  </div>

                  <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {partyLoading ? (
                      <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                        Loading options...
                      </div>
                    ) : partyOptions.length > 0 ? (
                      partyOptions.map((opt) => (
                        <div
                          key={opt.value}
                          onClick={() => {
                            onPartySelect?.(opt);
                            setIsPartyDropdownOpen(false);
                            setTimeout(() => searchInputRef.current?.focus(), 50);
                          }}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            backgroundColor: selectedParty?.value === opt.value ? '#eff6ff' : 'transparent',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = selectedParty?.value === opt.value ? '#eff6ff' : 'transparent')
                          }
                        >
                          <div style={{ fontWeight: 700, color: '#1e293b' }}>{opt.label}</div>
                          {opt.gstin && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                              GSTIN: {opt.gstin} {opt.state ? `• ${opt.state}` : ''}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                        No {partyConfig.label.toLowerCase()} found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Right: Date, More Details (F3), and Park Bill (F6) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        {/* Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#475569' }}>
          <Calendar size={14} style={{ color: '#64748b' }} />
          <input
            type="date"
            value={voucherDate}
            onChange={(e) => onVoucherDateChange?.(e.target.value)}
            style={{
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '4px 6px',
              fontSize: '0.75rem',
              outline: 'none',
              fontWeight: 600,
            }}
          />
        </div>

        {/* More Details (F3) */}
        <button
          onClick={() => setIsDrawerOpen((prev) => !prev)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: isDrawerOpen ? '#eff6ff' : '#ffffff',
            color: isDrawerOpen ? '#2563eb' : '#475569',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
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
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
              title="Park current bill into IndexedDB (F6)"
            >
              <Clock size={13} style={{ color: '#d97706' }} />
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
                padding: '5px 8px',
                borderRadius: '6px',
                border: activeParkedCount > 0 ? '1px solid #fde68a' : '1px solid #cbd5e1',
                backgroundColor: activeParkedCount > 0 ? '#fef3c7' : '#ffffff',
                color: activeParkedCount > 0 ? '#b45309' : '#475569',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Recall held/parked bills (F7)"
            >
              <span>Held ({activeParkedCount})</span>
              <span style={{ fontSize: '0.65rem', color: activeParkedCount > 0 ? '#b45309' : '#94a3b8' }}>[F7]</span>
            </button>
          </div>
        )}

        {/* Header Extra Actions (e.g., Switch to Classic Form) */}
        {headerExtraActions && (
          <div style={{ display: 'inline-flex', alignItems: 'center' }}>
            {headerExtraActions}
          </div>
        )}
      </div>
    </header>
  );
};

