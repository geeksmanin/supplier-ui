import React from 'react';
import { Search } from 'lucide-react';
import { VoucherPartyConfig, VoucherPartyOption } from './FastVoucherEntryLayout.types';

export interface FastVoucherHeaderPartySelectProps {
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
}

export const FastVoucherHeaderPartySelect: React.FC<FastVoucherHeaderPartySelectProps> = ({
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
}) => {
  if (renderPartySelect) {
    return <>{renderPartySelect({ selectedParty, onPartySelect })}</>;
  }
  if (partyConfig?.renderPartySelect) {
    return <>{partyConfig.renderPartySelect({ selectedParty, onPartySelect })}</>;
  }

  return (
    <div style={{ position: 'relative', width: '320px', flexShrink: 0 }}>
      <div
        onClick={() => {
          setIsPartyDropdownOpen(true);
          partyInputRef.current?.focus();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 10px',
          borderRadius: '8px',
          border: isPartyDropdownOpen ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
          backgroundColor: '#ffffff',
          cursor: 'pointer',
        }}
      >
        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
          <span style={{ color: '#64748b', marginRight: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
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
    </div>
  );
};
