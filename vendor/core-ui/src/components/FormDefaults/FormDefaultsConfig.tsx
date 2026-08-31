import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../api/client';
import { Button } from '../Button';
import { Select } from '../Select';
import { useToast } from '../Toast/Toast';
import { useFormKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { saveStoredFormDefaults, getStoredFormDefaults } from '../../utils/defaultsStore';
import { Sliders, RefreshCw, Save, CheckCircle2 } from 'lucide-react';

export interface FormDefaultFieldDefinition {
  fieldKey: string;
  label: string;
  placeholder?: string;
  description?: string;
  picklistEndpoint?: string;
  optionsLoader?: () => Promise<{ value: string; label: string }[]>;
  options?: { value: string; label: string }[];
  onCreateOption?: () => void;
  createOptionText?: string;
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
      const res = await apiClient.get(`/form-configurations/${formKey}`);
      const serverConfig = res.data?.data?.config || {};
      setFormValues(serverConfig);
      await saveStoredFormDefaults(formKey, serverConfig);
      setIsDirty(false);
    } catch (err) {
      console.error(`Failed to load form configurations for ${formKey}:`, err);
      showToast('Failed to load form configurations', 'error');
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
          overflow: 'hidden',
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
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                {title}
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
                {description}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              variant="secondary"
              onClick={loadAllData}
              disabled={loading || saving}
              style={{ fontSize: '0.825rem', padding: '0.4rem 0.75rem' }}
              title="Refresh form defaults and picklists"
            >
              <RefreshCw size={14} style={{ marginRight: '0.35rem' }} />
              Refresh
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={loading || saving || !isDirty}
              style={{ fontSize: '0.825rem', padding: '0.4rem 0.9rem', fontWeight: 600 }}
            >
              {saving ? 'Saving...' : 'Save Defaults (Ctrl+S)'}
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.75rem' }}>
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
                          <CheckCircle2 size={12} /> Configured
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
                      onCreateOption={field.onCreateOption}
                      createOptionText={field.createOptionText}
                      options={[
                        { value: '', label: `— None (No Default ${field.label}) —` },
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
    </div>
  );
};
