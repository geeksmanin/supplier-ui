import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/client';
import { useToast } from './Toast/Toast';
import { Button } from './Button';
import { Input } from './Input';
import { X, ExternalLink, Check, AlertCircle, Loader2, Sparkles } from 'lucide-react';

export interface QuickMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  endpoint: string;
  initialName?: string;
  masterTabUrl?: string;
  extraPayload?: Record<string, any>;
  onValidateCode?: (code: string) => Promise<boolean>;
  onSuccess: (newItem: { id: string; name: string; code: string }) => void;
}

export const QuickMasterModal: React.FC<QuickMasterModalProps> = ({
  isOpen,
  onClose,
  title,
  endpoint,
  initialName = '',
  masterTabUrl,
  extraPayload = {},
  onValidateCode,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialName);
  const [autoGenerateCode, setAutoGenerateCode] = useState(true);
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const [validatingCode, setValidatingCode] = useState(false);
  const [codeExists, setCodeExists] = useState(false);
  const [hasValidatedCode, setHasValidatedCode] = useState(false);

  // Generate uppercase code suggestion from Name
  const generateCodeFromName = (val: string) => {
    return val
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .substring(0, 50);
  };

  // Reset and populate on open
  useEffect(() => {
    if (isOpen) {
      const initial = initialName || '';
      setName(initial);
      setAutoGenerateCode(true);
      setCode('');
      setDescription('');
      setCodeExists(false);
      setValidatingCode(false);
      setHasValidatedCode(false);

      // Focus name input
      setTimeout(() => {
        nameInputRef.current?.focus();
        nameInputRef.current?.select();
      }, 50);
    }
  }, [isOpen, initialName]);

  // Debounced code validation if manual code is entered and onValidateCode is supplied
  useEffect(() => {
    const trimmedCode = code.trim();
    if (!isOpen || autoGenerateCode || !trimmedCode || !onValidateCode) {
      setCodeExists(false);
      setValidatingCode(false);
      setHasValidatedCode(false);
      return;
    }

    const timer = setTimeout(async () => {
      setValidatingCode(true);
      try {
        const exists = await onValidateCode(trimmedCode);
        setCodeExists(Boolean(exists));
        setHasValidatedCode(true);
      } catch (err) {
        setCodeExists(false);
      } finally {
        setValidatingCode(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [code, autoGenerateCode, onValidateCode, isOpen]);

  // Handle Save
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      showToast('Name is required', 'error');
      return;
    }
    if (!autoGenerateCode && !code.trim()) {
      showToast('Code is required when auto-generation is disabled', 'error');
      return;
    }
    if (!autoGenerateCode && codeExists) {
      showToast('Code already exists. Please choose a unique code.', 'error');
      return;
    }

    setSaving(true);
    try {
      const finalCode = autoGenerateCode ? '' : code.trim();
      const payload = {
        name: name.trim(),
        code: finalCode,
        auto_generate_code: autoGenerateCode,
        description: description.trim(),
        status: 'ACTIVE',
        sort_order: 1,
        ...extraPayload,
      };

      const res = await apiClient.post(endpoint, payload);
      const created = res.data?.data || {};
      const newId = created.id || created.ID || created.code || payload.name;
      const newName = created.name || payload.name;

      showToast(`${title} created successfully`, 'success');
      onSuccess({
        id: String(newId),
        name: String(newName),
        code: String(created.code || finalCode),
      });
      onClose();
    } catch (err: any) {
      showToast(
        err.response?.data?.message || err.message || `Failed to create ${title}`,
        'error'
      );
    } finally {
      setSaving(false);
    }
  };

  // Keyboard accessibility: Escape to cancel, Enter to save
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '1rem',
        animation: 'quick-master-fade-in 0.15s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          width: '100%',
          maxWidth: '460px',
          overflow: 'hidden',
          animation: 'quick-master-scale-up 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.15rem 1.35rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                {title}
              </h3>
              <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.72rem', color: '#64748b' }}>
                Quick master creation
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {masterTabUrl && (
              <a
                href={masterTabUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.72rem',
                  color: '#2563eb',
                  textDecoration: 'none',
                  fontWeight: 600,
                  padding: '0.3rem 0.55rem',
                  borderRadius: '6px',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #dbeafe',
                }}
                title="Open full master management in a new tab"
              >
                <span>Masters</span>
                <ExternalLink size={11} />
              </a>
            )}
            <button
              onClick={onClose}
              type="button"
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: '#94a3af',
                padding: '0.35rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#334155';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#94a3af';
              }}
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave}>
          <div style={{ padding: '1.35rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* 1. Name Field (Primary, auto-focused) */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.35rem',
                }}
              >
                Name <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Information Technology"
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #e2e8f0',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0f172a',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            {/* 2. Description Field (Optional) */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#334155',
                  marginBottom: '0.35rem',
                }}
              >
                Description <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description or purpose..."
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  border: '1.5px solid #e2e8f0',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: '#0f172a',
                  resize: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
              />
            </div>

            {/* 3. Code Field (with Auto-generate code checkbox, placed last) */}
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.35rem',
                }}
              >
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                  Code {!autoGenerateCode && <span style={{ color: '#ef4444' }}>*</span>}
                </label>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  {!autoGenerateCode && validatingCode && (
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                      }}
                    >
                      <Loader2 size={11} className="spin" /> Checking...
                    </span>
                  )}
                  {!autoGenerateCode && hasValidatedCode && !validatingCode && (
                    codeExists ? (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#ef4444',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        <AlertCircle size={11} /> Code in use
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          color: '#16a34a',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        <Check size={11} /> Available
                      </span>
                    )
                  )}

                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.72rem',
                      color: '#475569',
                      cursor: 'pointer',
                      userSelect: 'none',
                      fontWeight: 500,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={autoGenerateCode}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAutoGenerateCode(checked);
                        if (checked) {
                          setCode('');
                        } else if (!code.trim()) {
                          setCode(generateCodeFromName(name));
                        }
                      }}
                      style={{ cursor: 'pointer', accentColor: '#2563eb' }}
                    />
                    <span>Auto-generate code</span>
                  </label>
                </div>
              </div>

              <input
                type="text"
                disabled={autoGenerateCode}
                value={autoGenerateCode ? '' : code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={autoGenerateCode ? 'Auto-generated by system on save' : 'e.g. IT_TECH'}
                style={{
                  width: '100%',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  border: !autoGenerateCode && codeExists
                    ? '1.5px solid #ef4444'
                    : '1.5px solid #e2e8f0',
                  outline: 'none',
                  boxSizing: 'border-box',
                  color: autoGenerateCode ? '#94a3b8' : '#0f172a',
                  backgroundColor: autoGenerateCode ? '#f8fafc' : '#ffffff',
                  fontFamily: 'monospace',
                  cursor: autoGenerateCode ? 'not-allowed' : 'text',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = !autoGenerateCode && codeExists ? '#ef4444' : '#2563eb')}
                onBlur={(e) => (e.target.style.borderColor = !autoGenerateCode && codeExists ? '#ef4444' : '#e2e8f0')}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '0.85rem 1.35rem',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: '#94a3b8' }}>
              <kbd style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>Esc</kbd>
              <span>Cancel</span>
              <span style={{ margin: '0 0.2rem' }}>•</span>
              <kbd style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '0.1rem 0.35rem', fontSize: '0.65rem' }}>↵ Enter</kbd>
              <span>Save</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={saving}
                style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={saving || !name.trim() || !code.trim() || codeExists}
                style={{ fontSize: '0.82rem', padding: '0.4rem 1rem', fontWeight: 600 }}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
