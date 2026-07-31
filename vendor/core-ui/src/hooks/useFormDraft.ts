import React, { useEffect, useState, useRef } from 'react';
import { saveFormDraft, getFormDraft, clearFormDraft } from '../utils/draftStore';

interface UseFormDraftOptions<T> {
  formKey: string;
  formData: T;
  isEdit: boolean;
  enabled?: boolean;
  onRestore: (draftData: T) => void;
}

export function useFormDraft<T extends Record<string, any>>({
  formKey,
  formData,
  isEdit,
  enabled = true,
  onRestore
}: UseFormDraftOptions<T>) {
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftTime, setDraftTime] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  // Check and restore draft on initial load for New Forms
  useEffect(() => {
    if (!enabled || isEdit) return;

    getFormDraft<T>(formKey).then(saved => {
      if (saved && saved.data) {
        onRestore(saved.data);
        setDraftRestored(true);
        setDraftTime(new Date(saved.updatedAt).toLocaleTimeString());
      }
    });
  }, [formKey, isEdit, enabled]);

  // Debounced Auto-Save to IndexedDB
  useEffect(() => {
    if (!enabled || isEdit) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      saveFormDraft(formKey, formData);
    }, 500);

    return () => clearTimeout(timer);
  }, [formKey, formData, isEdit, enabled]);

  const discardDraft = async () => {
    await clearFormDraft(formKey);
    setDraftRestored(false);
  };

  const clearSavedDraft = async () => {
    await clearFormDraft(formKey);
    setDraftRestored(false);
  };

  return {
    draftRestored,
    draftTime,
    discardDraft,
    clearSavedDraft
  };
}

export interface DraftBannerProps {
  draftTime?: string | null;
  onDiscard: () => void;
  onKeep?: () => void;
}

export const DraftBanner: React.FC<DraftBannerProps> = ({ draftTime, onDiscard }) => {
  return React.createElement('div', {
    style: {
      backgroundColor: '#eff6ff',
      border: '1px solid #bfdbfe',
      borderRadius: '8px',
      padding: '0.65rem 1rem',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.85rem',
      color: '#1e40af'
    }
  }, [
    React.createElement('div', {
      key: 'info',
      style: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }
    }, [
      React.createElement('span', { key: 'text' }, 'ℹ️ Draft restored from earlier session'),
      draftTime ? React.createElement('span', { key: 'time', style: { opacity: 0.75, fontWeight: 500 } }, `(${draftTime})`) : null
    ]),
    React.createElement('div', { key: 'actions', style: { display: 'flex', gap: '0.5rem' } }, [
      React.createElement('button', {
        key: 'discard',
        type: 'button',
        onClick: onDiscard,
        style: {
          border: '1px solid #93c5fd',
          backgroundColor: '#ffffff',
          color: '#1d4ed8',
          borderRadius: '6px',
          padding: '0.25rem 0.65rem',
          fontSize: '0.75rem',
          fontWeight: 700,
          cursor: 'pointer'
        }
      }, 'Discard Draft')
    ])
  ]);
};
