import React from 'react';
import { Barcode, Plus, X } from 'lucide-react';
import { Select } from '../Select';
import { VoucherSerialMode } from './FastVoucherEntryLayout.types';

export interface VoucherQuickRowStepperSerialSectionProps {
  serialMode: VoucherSerialMode;
  qty: number;
  serialNumbers: string[];
  serialInputText: string;
  setSerialInputText: (val: string) => void;
  availableSerials: string[];
  serialError?: string;
  handleAddSerialTags: (raw: string) => void;
  handleRemoveSerialTag: (serial: string) => void;
  handleToggleSelectSerial: (serial: string) => void;
}

export const VoucherQuickRowStepperSerialSection: React.FC<VoucherQuickRowStepperSerialSectionProps> = ({
  serialMode,
  qty,
  serialNumbers,
  serialInputText,
  setSerialInputText,
  availableSerials,
  serialError,
  handleAddSerialTags,
  handleRemoveSerialTag,
  handleToggleSelectSerial,
}) => {
  const targetCount = Math.max(0, Math.round(Number(qty) || 0));
  const countMatches = serialNumbers.length === targetCount;
  const countExceeds = serialNumbers.length > targetCount;
  const atLimit = targetCount > 0 && serialNumbers.length >= targetCount;

  return (
    <div
      style={{
        gridColumn: '1 / -1',
        marginTop: '0.25rem',
        padding: '0.65rem 0.75rem',
        borderRadius: '8px',
        backgroundColor: '#f8fafc',
        border: countExceeds ? '1px solid #fca5a5' : '1px solid #cbd5e1',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>
          <Barcode size={13} color="#2563eb" />
          {serialMode === 'create' ? 'Serial Numbers (Scan / Enter)' : 'Select Serial Numbers'}
        </label>
        <span
          data-testid="stepper-serial-count-badge"
          style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '1px 7px',
            borderRadius: '9999px',
            backgroundColor: countExceeds ? '#fee2e2' : (countMatches ? '#dcfce7' : '#fef3c7'),
            color: countExceeds ? '#991b1b' : (countMatches ? '#166534' : '#92400e'),
          }}
        >
          {serialMode === 'create' ? 'Captured' : 'Selected'}: {serialNumbers.length} / {targetCount}
        </span>
      </div>

      {serialMode === 'create' ? (
        <div style={{ display: 'flex', gap: '6px', marginBottom: (serialNumbers.length > 0 || serialError) ? '6px' : 0 }}>
          <input
            type="text"
            data-testid="stepper-serial-create-input"
            disabled={atLimit}
            placeholder={
              atLimit
                ? `Serial limit reached (${targetCount} / ${targetCount}) — increase Qty to add more`
                : 'Scan barcode or enter serial numbers (comma / space separated) and press Enter'
            }
            value={serialInputText}
            onChange={(e) => setSerialInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleAddSerialTags(serialInputText);
              } else if (e.key === 'Escape') {
                e.stopPropagation();
              }
            }}
            style={{
              flex: 1,
              padding: '6px 10px',
              fontSize: '0.8rem',
              fontWeight: 600,
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              backgroundColor: atLimit ? '#f1f5f9' : '#ffffff',
              color: atLimit ? '#94a3b8' : '#0f172a',
            }}
          />
          <button
            type="button"
            data-testid="stepper-serial-add-btn"
            disabled={atLimit}
            onClick={() => handleAddSerialTags(serialInputText)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              fontSize: '0.75rem',
              fontWeight: 700,
              borderRadius: '6px',
              border: 'none',
              backgroundColor: atLimit ? '#94a3b8' : '#2563eb',
              color: '#ffffff',
              cursor: atLimit ? 'not-allowed' : 'pointer',
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: (serialNumbers.length > 0 || serialError) ? '6px' : 0 }}>
          <Select
            value=""
            disabled={atLimit}
            onChange={(val) => {
              const chosen = String(val);
              if (chosen) handleToggleSelectSerial(chosen);
            }}
            options={availableSerials
              .filter((sn) => !serialNumbers.includes(sn))
              .map((sn) => ({ value: sn, label: sn }))}
            placeholder={
              atLimit
                ? `All ${targetCount} serial(s) selected`
                : availableSerials.length === 0
                  ? 'No AVAILABLE serials found for selected batch/location'
                  : `Select from ${availableSerials.length} available serial(s)...`
            }
            style={{ fontSize: '0.8rem' }}
          />
        </div>
      )}

      {serialError && (
        <div
          data-testid="stepper-serial-error"
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            color: '#991b1b',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            padding: '4px 8px',
            marginBottom: serialNumbers.length > 0 ? '6px' : 0,
          }}
        >
          {serialError}
        </div>
      )}

      {serialNumbers.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {serialNumbers.map((sn) => (
            <span
              key={sn}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'monospace',
                padding: '2px 7px',
                borderRadius: '6px',
                backgroundColor: '#e0e7ff',
                color: '#1e3a8a',
                border: '1px solid #c7d2fe',
              }}
            >
              {sn}
              <button
                type="button"
                onClick={() => handleRemoveSerialTag(sn)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4338ca', padding: 0, display: 'flex' }}
                title="Remove serial"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
