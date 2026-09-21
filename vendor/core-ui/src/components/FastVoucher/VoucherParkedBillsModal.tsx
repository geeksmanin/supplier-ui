import React, { useState, useEffect, useRef } from 'react';
import { ParkedBill } from './useVoucherParking';
import { Clock, Play, Trash2, X, Search, FileText, ChevronRight } from 'lucide-react';

export interface VoucherParkedBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  parkedBills: ParkedBill[];
  onRecallBill: (id: string) => void;
  onDeleteBill: (id: string) => void;
  voucherTitle?: string;
}

export const VoucherParkedBillsModal: React.FC<VoucherParkedBillsModalProps> = ({
  isOpen,
  onClose,
  parkedBills,
  onRecallBill,
  onDeleteBill,
  voucherTitle = 'Document',
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredBills = parkedBills.filter((bill) => {
    const q = searchFilter.toLowerCase();
    const partyName = bill.party?.label?.toLowerCase() || '';
    const label = bill.label?.toLowerCase() || '';
    return partyName.includes(q) || label.includes(q);
  });

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setSearchFilter('');
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedIndex >= filteredBills.length && filteredBills.length > 0) {
      setSelectedIndex(filteredBills.length - 1);
    }
  }, [filteredBills.length, selectedIndex]);

  // Keyboard navigation within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredBills.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        const highlighted = filteredBills[selectedIndex];
        if (highlighted) {
          e.preventDefault();
          onRecallBill(highlighted.id);
          onClose();
        }
      } else if (e.key === 'Delete') {
        const highlighted = filteredBills[selectedIndex];
        if (highlighted) {
          e.preventDefault();
          onDeleteBill(highlighted.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredBills, selectedIndex, onRecallBill, onDeleteBill, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Held / Parked {voucherTitle}s
              </h3>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                Recall an active cart or remove suspended bills
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '6px',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#f1f5f9',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
            }}
          >
            <Search size={16} color="#64748b" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Filter parked carts by party name... (↑/↓ to navigate, Enter to resume)"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.85rem',
                color: '#0f172a',
              }}
            />
          </div>
        </div>

        {/* List of Parked Bills */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredBills.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#94a3b8',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FileText size={36} color="#cbd5e1" />
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>No parked bills found</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Press <kbd style={{ padding: '2px 4px', backgroundColor: '#e2e8f0', borderRadius: '4px' }}>F6</kbd> during entry to park your active cart.
              </div>
            </div>
          ) : (
            filteredBills.map((bill, index) => {
              const isSelected = index === selectedIndex;
              const formattedDate = new Date(bill.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={bill.id}
                  onClick={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.12)' : '0 1px 2px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: isSelected ? '#2563eb' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                          {bill.party?.label || 'Walk-in / General'}
                        </span>
                        {bill.party?.gstin && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              padding: '1px 5px',
                              backgroundColor: '#f1f5f9',
                              color: '#475569',
                              borderRadius: '4px',
                              fontFamily: 'monospace',
                            }}
                          >
                            {bill.party.gstin}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px', fontSize: '0.75rem', color: '#64748b' }}>
                        <span>🕒 {formattedDate}</span>
                        <span>📦 {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}</span>
                        {bill.label && bill.label !== bill.party?.label && (
                          <span style={{ color: '#0284c7', fontStyle: 'italic' }}>"{bill.label}"</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Financial Total & Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#2563eb' }}>
                        ₹{bill.summary?.grand_total ? bill.summary.grand_total.toFixed(2) : '0.00'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Grand Total</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecallBill(bill.id);
                          onClose();
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Resume bill into editor (Enter)"
                      >
                        <Play size={12} fill="#ffffff" />
                        <span>Resume</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteBill(bill.id);
                        }}
                        style={{
                          padding: '6px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#ef4444',
                          cursor: 'pointer',
                        }}
                        title="Discard parked cart (Delete)"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Hotkey Cheatsheet */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            fontSize: '0.75rem',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <span><kbd style={{ backgroundColor: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>↑ / ↓</kbd> Navigate</span>
            <span><kbd style={{ backgroundColor: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>Enter</kbd> Resume</span>
            <span><kbd style={{ backgroundColor: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>Del</kbd> Discard</span>
            <span><kbd style={{ backgroundColor: '#e2e8f0', padding: '1px 5px', borderRadius: '4px' }}>Esc</kbd> Close</span>
          </div>
          <div>
            Total Parked: <strong>{filteredBills.length}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
