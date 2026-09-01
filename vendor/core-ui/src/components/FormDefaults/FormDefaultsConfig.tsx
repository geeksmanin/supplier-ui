import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { Button } from '../Button';
import { Select } from '../Select';
import { useToast } from '../Toast/Toast';
import { useFormKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { saveStoredFormDefaults, getStoredFormDefaults } from '../../utils/defaultsStore';
import { QuickMasterModal } from '../QuickMasterModal';

const SlidersIcon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({ size = 18, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);

const RefreshIcon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({ size = 14, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
  </svg>
);

const CheckCircleIcon: React.FC<{ size?: number; className?: string; style?: React.CSSProperties }> = ({ size = 12, className, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

export interface FormDefaultFieldDefinition {
  fieldKey: string;
  label: string;
  placeholder?: string;
  description?: string;
  picklistEndpoint?: string;
  optionsLoader?: () => Promise<{ value: string; label: string }[]>;
  options?: { value: string; label: string }[];
  onCreateOption?: (searchTerm: string) => void;
  createOptionText?: string | ((searchTerm: string) => string);
  masterTabUrl?: string;
  quickMasterEndpoint?: string;
  quickMasterTitle?: string;
}

export interface FormDefaultsConfigProps {
  formKey: string;
  title?: string;
  description?: string;
  fields: FormDefaultFieldDefinition[];
  onSaveSuccess?: () => void;
}

export const FormDefaultsConfig: React.FC<FormDefaultsConfigProps> = ({
  formKey,
  title = 'Form Default Values',
  description = 'Configure default values automatically pre-selected when creating new records.',
  fields,
  onSaveSuccess,
}) => {
  const { showToast } = useToast();
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [fieldOptions, setFieldOptions] = useState<Record<string, { value: string; label: string }[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // Quick Master Modal state
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean;
    title: string;
    endpoint: string;
    initialName: string;
    masterTabUrl?: string;
    fieldKey: string;
    field: FormDefaultFieldDefinition;
  } | null>(null);

  // Fetch picklist options for a single field
  const loadOptionsForField = useCallback(async (field: FormDefaultFieldDefinition) => {
    if (field.options) {
      setFieldOptions(prev => ({ ...prev, [field.fieldKey]: field.options || [] }));
      return;
    }
    if (field.optionsLoader) {
      try {
        const opts = await field.optionsLoader();
        setFieldOptions(prev => ({ ...prev, [field.fieldKey]: opts }));
      } catch (err) {
        console.error(`Failed to load options for ${field.fieldKey}:`, err);
      }
      return;
    }
    if (field.picklistEndpoint) {
      try {
        const res = await apiClient.get(field.picklistEndpoint);
        const data = res.data?.data || [];
        const opts = (Array.isArray(data) ? data : []).map((item: any) => ({
          value: item.id || item.ID || item.code || item.name,
          label: item.name || item.label || item.display_name || item.title || item.code || item.id,
        }));
        setFieldOptions(prev => ({ ...prev, [field.fieldKey]: opts }));
      } catch (err) {
        console.error(`Failed to fetch picklist from ${field.picklistEndpoint}:`, err);
      }
    }
  }, []);

  // Load all picklist options and saved configuration
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Load options for all fields concurrently
      await Promise.all(fields.map(f => loadOptionsForField(f)));

      // 2. Check IndexedDB first for fast local config
      const cached = await getStoredFormDefaults(formKey);
      if (cached?.data) {
        setFormValues(cached.data);
      }

      // 3. Fetch canonical saved config from backend
      try {
        const res = await apiClient.get(`/form-configurations/${formKey}`);
        const serverConfig = res.data?.data?.config || {};
        if (serverConfig && Object.keys(serverConfig).length > 0) {
          setFormValues(serverConfig);
          await saveStoredFormDefaults(formKey, serverConfig);
        }
      } catch (err: any) {
        // 404 is normal for unconfigured forms
        if (err.response?.status !== 404) {
          console.warn(`Failed to load form configurations for ${formKey}:`, err);
        }
      }
      setIsDirty(false);
    } catch (err) {
      console.error(`Failed to initialize form defaults for ${formKey}:`, err);
    } finally {
      setLoading(false);
    }
  }, [formKey, fields, loadOptionsForField, showToast]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put(`/form-configurations/${formKey}`, { config: formValues });
      await saveStoredFormDefaults(formKey, formValues);

      // Notify all listening components in the application
      window.dispatchEvent(
        new CustomEvent('form_defaults_updated', {
          detail: { formKey, config: formValues },
        })
      );

      setIsDirty(false);
      showToast('Form defaults saved successfully', 'success');
      onSaveSuccess?.();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to save form defaults', 'error');
    } finally {
      setSaving(false);
    }
  };

  useFormKeyboardShortcuts({
    onSave: handleSave,
  });

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Continuous Settings Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
          overflow: 'visible',
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#eff6ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563eb',
              }}
            >
              <SlidersIcon size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                  {title}
                </h3>
                {isDirty ? (
                  <span
                    style={{
                      backgroundColor: '#fef3c7',
                      color: '#b45309',
                      border: '1px solid #fde68a',
                      borderRadius: '9999px',
                      padding: '0.15rem 0.55rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                    }}
                  >
                    <span
                      style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#d97706',
                      }}
                    />
                    Not Saved
                  </span>
                ) : (
                  <span
                    style={{
                      backgroundColor: '#ecfdf5',
                      color: '#047857',
                      border: '1px solid #a7f3d0',
                      borderRadius: '9999px',
                      padding: '0.15rem 0.55rem',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <CheckCircleIcon size={12} />
                    Saved
                  </span>
                )}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
                {description}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              variant="primary"
              onClick={loadAllData}
              disabled={loading || saving}
              style={{ fontSize: '0.825rem', padding: '0.4rem 0.75rem' }}
              title="Refresh form defaults and picklists"
            >
              <RefreshIcon size={14} style={{ marginRight: '0.35rem' }} />
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={loading || saving || !isDirty}
              style={{
                fontSize: '0.825rem',
                padding: '0.4rem 0.9rem',
                fontWeight: 600,
                backgroundColor: isDirty ? '#2563eb' : undefined,
                boxShadow: isDirty ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none',
              }}
            >
              {saving ? 'Saving...' : 'Save Defaults (Ctrl+S)'}
            </Button>
          </div>
        </div>

        {/* Unsaved Changes Banner */}
        {isDirty && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              borderBottom: '1px solid #fde68a',
              padding: '0.65rem 1.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: '#92400e',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>⚠️</span>
              <span>
                You have unsaved changes to default choices. Click <strong>Save Defaults</strong> to apply them across forms.
              </span>
            </div>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.65rem', height: '28px' }}
            >
              {saving ? 'Saving...' : 'Save Now'}
            </Button>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '1.75rem 1.75rem 12rem 1.75rem', minHeight: '480px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
              Loading default settings...
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                alignItems: 'start',
              }}
            >
              {fields.map(field => {
                const options = fieldOptions[field.fieldKey] || [];
                const currentValue = formValues[field.fieldKey] || '';

                return (
                  <div key={field.fieldKey}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                        {field.label}
                      </label>
                      {currentValue && (
                        <span style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                          <CheckCircleIcon size={12} /> Configured
                        </span>
                      )}
                    </div>

                    <Select
                      value={currentValue}
                      onChange={val => {
                        setFormValues(prev => ({ ...prev, [field.fieldKey]: val as string }));
                        setIsDirty(true);
                      }}
                      onRefresh={() => loadOptionsForField(field)}
                      onCreateOption={
                        field.onCreateOption
                          ? field.onCreateOption
                          : (field.quickMasterEndpoint || field.picklistEndpoint)
                          ? (searchTerm) => {
                              setActiveModal({
                                isOpen: true,
                                title: field.quickMasterTitle || `New ${field.label}`,
                                endpoint: (field.quickMasterEndpoint || field.picklistEndpoint)!,
                                initialName: searchTerm || '',
                                masterTabUrl: field.masterTabUrl,
                                fieldKey: field.fieldKey,
                                field,
                              });
                            }
                          : undefined
                      }
                      createOptionText={
                        field.createOptionText ||
                        ((search) => (search ? `+ Create "${search}"` : `+ Create new ${field.label.toLowerCase()}`))
                      }
                      options={[
                        { value: '', label: 'None' },
                        ...options,
                      ]}
                    />

                    {field.description && (
                      <p style={{ fontSize: '0.725rem', color: '#64748b', margin: '0.35rem 0 0 0' }}>
                        {field.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Unified Quick Master Creation Modal */}
      {activeModal && activeModal.isOpen && (
        <QuickMasterModal
          isOpen={activeModal.isOpen}
          onClose={() => setActiveModal(null)}
          title={activeModal.title}
          endpoint={activeModal.endpoint}
          initialName={activeModal.initialName}
          masterTabUrl={activeModal.masterTabUrl}
          onSuccess={async (newItem) => {
            await loadOptionsForField(activeModal.field);
            setFormValues(prev => ({
              ...prev,
              [activeModal.fieldKey]: newItem.id || newItem.name,
            }));
            setIsDirty(true);
          }}
        />
      )}
    </div>
  );
};
