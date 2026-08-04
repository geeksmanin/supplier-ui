import React from 'react';

// ─── DraftBanner Component ────────────────────────────────────────────────────

export interface DraftBannerProps {
  /** Time string to display, e.g. "3:42 PM" */
  draftTime?: string | null;
  /** Called when user clicks "Restore Draft" (optional — if omitted, no Restore button is shown) */
  onRestore?: () => void;
  /** Called when user clicks "Dismiss" */
  onDiscard: () => void;
  // Legacy compat — same as onDiscard
  onKeep?: () => void;
}

export const DraftBanner: React.FC<DraftBannerProps> = ({
  draftTime,
  onRestore,
  onDiscard,
}) => {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        backgroundColor: '#fffbeb',
        border: '1px solid #fcd34d',
        borderRadius: '10px',
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        color: '#92400e',
        gap: '0.5rem',
        flexWrap: 'wrap',
        animation: 'draftBannerIn 0.25s ease',
      }}
    >
      <style>{`
        @keyframes draftBannerIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
        <span>📋</span>
        <span>
          Unsaved draft detected
          {draftTime ? ` (last saved at ${draftTime})` : ''}
          . Restore it?
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        <button
          type="button"
          onClick={onDiscard}
          style={{
            border: '1px solid #fcd34d',
            backgroundColor: '#ffffff',
            color: '#78350f',
            borderRadius: '6px',
            padding: '0.25rem 0.75rem',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Dismiss
        </button>
        {onRestore && (
          <button
            type="button"
            onClick={onRestore}
            style={{
              border: 'none',
              backgroundColor: '#d97706',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '0.25rem 0.75rem',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Restore Draft
          </button>
        )}
      </div>
    </div>
  );
};
