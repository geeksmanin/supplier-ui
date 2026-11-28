import React from 'react';
import { Select } from '@geeksman/core-ui';
import type { PortalLandingMode } from '../../types/portal';
import type { RegisterPortalModalProps } from './RegisterPortalModal';
import './PortalManagement.css';

const LANDING_MODE_OPTIONS = [
  { value: 'DASHBOARD', label: 'Portal Dashboard' },
  { value: 'AGENT', label: 'Direct Conversational Agent UI' },
  { value: 'CUSTOM_ROUTE', label: 'Custom Route Path' },
];

export const RegisterPortalModalDesktop: React.FC<RegisterPortalModalProps> = ({
  isOpen,
  saving,
  form,
  onFieldChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="ptl-modal-backdrop" role="dialog" aria-modal="true" aria-label="Register Portal">
      <form
        className="ptl-modal-card"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div className="ptl-card-head">
          <div>
            <h3 className="ptl-card-title">Register New Portal</h3>
            <p className="ptl-card-sub">Register a global portal definition for tenants to configure.</p>
          </div>
        </div>
        <div className="ptl-editor-stack">
          <div className="ptl-field">
            <label className="ptl-label" htmlFor="reg-portal-code">Portal Code *</label>
            <input
              id="reg-portal-code"
              className="ptl-input"
              placeholder="e.g. pos_terminal"
              value={form.portal_code}
              onChange={(e) => onFieldChange('portal_code', e.target.value)}
              required
            />
          </div>
          <div className="ptl-field">
            <label className="ptl-label" htmlFor="reg-display-name">Display Name *</label>
            <input
              id="reg-display-name"
              className="ptl-input"
              placeholder="e.g. POS Storefront Portal"
              value={form.display_name}
              onChange={(e) => onFieldChange('display_name', e.target.value)}
              required
            />
          </div>
          <div className="ptl-field">
            <label className="ptl-label" htmlFor="reg-app-repo">UI App Repository</label>
            <input
              id="reg-app-repo"
              className="ptl-input"
              placeholder="e.g. pos-ui"
              value={form.app_repo}
              onChange={(e) => onFieldChange('app_repo', e.target.value)}
            />
          </div>
          <div className="ptl-field">
            <label className="ptl-label">Default Landing Mode</label>
            <Select
              value={form.landing_mode}
              onChange={(val) => onFieldChange('landing_mode', (val as PortalLandingMode) || 'DASHBOARD')}
              options={LANDING_MODE_OPTIONS}
              placeholder="Select landing mode"
            />
          </div>
          <div className="ptl-field">
            <label className="ptl-label" htmlFor="reg-default-route">Default Route *</label>
            <input
              id="reg-default-route"
              className="ptl-input"
              placeholder="/home"
              value={form.default_route}
              onChange={(e) => onFieldChange('default_route', e.target.value)}
              required
            />
          </div>
          <div className="ptl-field">
            <label className="ptl-label" htmlFor="reg-description">Description</label>
            <input
              id="reg-description"
              className="ptl-input"
              placeholder="Short portal purpose"
              value={form.description}
              onChange={(e) => onFieldChange('description', e.target.value)}
            />
          </div>
          <label className="ptl-checkbox-item">
            <input
              type="checkbox"
              checked={form.propagate_all_tenants}
              onChange={(e) => onFieldChange('propagate_all_tenants', e.target.checked)}
            />
            <span>Seed automatically for all active tenants</span>
          </label>
          <div className="ptl-footer-actions">
            <button type="button" className="ptl-btn ptl-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="ptl-btn ptl-btn-primary" disabled={saving}>
              {saving ? 'Registering...' : 'Register Portal'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
