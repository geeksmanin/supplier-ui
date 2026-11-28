import React from 'react';
import { MobileBottomBanner, Select } from '@geeksman/core-ui';
import type { PortalLandingMode } from '../../types/portal';
import type { RegisterPortalModalProps } from './RegisterPortalModal';
import './PortalManagement.css';

const LANDING_MODE_OPTIONS = [
  { value: 'DASHBOARD', label: 'Portal Dashboard' },
  { value: 'AGENT', label: 'Direct Conversational Agent UI' },
  { value: 'CUSTOM_ROUTE', label: 'Custom Route Path' },
];

export const RegisterPortalModalMobile: React.FC<RegisterPortalModalProps> = ({
  isOpen,
  saving,
  form,
  onFieldChange,
  onClose,
  onSubmit,
}) => (
  <MobileBottomBanner isOpen={isOpen} onClose={onClose} title="Register New Portal">
    <div className="ptl-mobile-drawer">
      <div className="ptl-field">
        <label className="ptl-label">Portal Code *</label>
        <input
          className="ptl-input"
          value={form.portal_code}
          onChange={(e) => onFieldChange('portal_code', e.target.value)}
          placeholder="pos_portal"
        />
      </div>
      <div className="ptl-field">
        <label className="ptl-label">Display Name *</label>
        <input
          className="ptl-input"
          value={form.display_name}
          onChange={(e) => onFieldChange('display_name', e.target.value)}
          placeholder="POS Portal"
        />
      </div>
      <div className="ptl-field">
        <label className="ptl-label">Landing Mode</label>
        <Select
          value={form.landing_mode}
          onChange={(val) => onFieldChange('landing_mode', (val as PortalLandingMode) || 'DASHBOARD')}
          options={LANDING_MODE_OPTIONS}
        />
      </div>
      <div className="ptl-field">
        <label className="ptl-label">Default Route *</label>
        <input
          className="ptl-input"
          value={form.default_route}
          onChange={(e) => onFieldChange('default_route', e.target.value)}
          placeholder="/home"
        />
      </div>
      <label className="ptl-checkbox-item">
        <input
          type="checkbox"
          checked={form.propagate_all_tenants}
          onChange={(e) => onFieldChange('propagate_all_tenants', e.target.checked)}
        />
        <span>Seed for all active tenants</span>
      </label>
      <button
        type="button"
        className="ptl-btn ptl-btn-primary"
        disabled={saving || !form.portal_code.trim() || !form.display_name.trim()}
        onClick={onSubmit}
      >
        {saving ? 'Saving...' : 'Register Portal'}
      </button>
    </div>
  </MobileBottomBanner>
);
