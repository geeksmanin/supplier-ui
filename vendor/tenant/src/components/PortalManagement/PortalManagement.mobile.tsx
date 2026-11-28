import React from 'react';
import {
  ConfirmModal,
  MobileBottomBanner,
  MobileFAB,
  MobileSearchBar,
  Portals3DIcon,
  Select,
} from '@geeksman/core-ui';
import type { PortalLandingMode } from '../../types/portal';
import type { PortalManagementViewProps } from './PortalManagement.types';
import './PortalManagement.css';

const LANDING_MODE_OPTIONS = [
  { value: 'DASHBOARD', label: 'Portal Dashboard' },
  { value: 'AGENT', label: 'Direct Agent UI' },
  { value: 'CUSTOM_ROUTE', label: 'Custom Route Path' },
];

export const PortalManagementMobile: React.FC<PortalManagementViewProps> = ({
  portals,
  selectedPortal,
  formData,
  registerForm,
  saving,
  searchQuery,
  isPlatformAdmin,
  isRegisterModalOpen,
  isResetConfirmOpen,
  mobileEditorOpen,
  onSearchChange,
  onSelectPortal,
  onCloseMobileEditor,
  onFieldChange,
  onRegisterFieldChange,
  onSettingChange,
  onSaveAndCloseDrawer,
  onOpenResetConfirm,
  onCloseResetConfirm,
  onConfirmReset,
  onOpenRegisterModal,
  onCloseRegisterModal,
  onRegisterSubmit,
}) => {
  const agentOptions = (selectedPortal?.available_agents || []).map((a) => ({
    value: a.id,
    label: `${a.name} (${a.route})`,
  }));

  return (
    <div className="ptl-mobile-wrap">
      <MobileSearchBar
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search portals..."
      />

      {portals.map((portal, index) => (
        <button
          key={portal.portal_code}
          type="button"
          className={`ptl-mobile-row ${index % 2 === 1 ? 'is-zebra' : ''}`}
          onClick={() => onSelectPortal(portal.portal_code, true)}
        >
          <span className="ptl-serial-badge">{index + 1}</span>
          <Portals3DIcon size={28} />
          <div className="ptl-mobile-body">
            <div className="ptl-portal-row-title">{portal.display_name}</div>
            <div className="ptl-portal-row-meta">
              {portal.landing_mode} · {portal.default_route}
            </div>
          </div>
          <span className={`ptl-badge ${portal.is_enabled ? 'ptl-badge-active' : 'ptl-badge-disabled'}`}>
            {portal.is_enabled ? 'Active' : 'Off'}
          </span>
        </button>
      ))}

      {isPlatformAdmin && (
        <MobileFAB label="Register" onClick={onOpenRegisterModal} />
      )}

      <MobileBottomBanner
        isOpen={mobileEditorOpen && Boolean(selectedPortal)}
        onClose={onCloseMobileEditor}
        title={selectedPortal?.display_name || 'Portal Settings'}
      >
        <div className="ptl-mobile-drawer">
          <div className="ptl-toggle-row">
            <span className="ptl-toggle-title">Enable Portal</span>
            <input
              type="checkbox"
              checked={formData.is_enabled}
              onChange={(e) => onFieldChange('is_enabled', e.target.checked)}
            />
          </div>

          <div className="ptl-field">
            <label className="ptl-label">Landing Mode</label>
            <Select
              value={formData.landing_mode}
              onChange={(val) => onFieldChange('landing_mode', (val as PortalLandingMode) || 'DASHBOARD')}
              options={LANDING_MODE_OPTIONS}
            />
          </div>

          {formData.landing_mode === 'AGENT' && (
            <div className="ptl-field">
              <label className="ptl-label">Default Agent UI</label>
              <Select
                value={formData.default_agent_id}
                onChange={(agentId) => {
                  const id = String(agentId || '');
                  onFieldChange('default_agent_id', id);
                  const found = selectedPortal?.available_agents?.find((a) => a.id === id);
                  if (found?.route) onFieldChange('default_route', found.route);
                }}
                options={agentOptions}
              />
            </div>
          )}

          <div className="ptl-field">
            <label className="ptl-label">Default Landing Route</label>
            <input
              className="ptl-input"
              value={formData.default_route}
              onChange={(e) => onFieldChange('default_route', e.target.value)}
            />
          </div>

          <div className="ptl-field">
            <label className="ptl-label">Portal App Name</label>
            <input
              className="ptl-input"
              value={formData.app_name}
              onChange={(e) => onFieldChange('app_name', e.target.value)}
            />
          </div>

          {Object.entries(formData.settings)
            .filter(([, val]) => typeof val === 'boolean')
            .map(([key, val]) => (
              <label key={key} className="ptl-checkbox-item">
                <input
                  type="checkbox"
                  checked={Boolean(val)}
                  onChange={(e) => onSettingChange(key, e.target.checked)}
                />
                <span>{key.replace(/_/g, ' ')}</span>
              </label>
            ))}

          <div className="ptl-footer-actions">
            <button type="button" className="ptl-btn ptl-btn-danger-outline" onClick={onOpenResetConfirm}>
              Reset
            </button>
            <button
              type="button"
              className="ptl-btn ptl-btn-primary"
              disabled={saving}
              onClick={onSaveAndCloseDrawer}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </MobileBottomBanner>

      <MobileBottomBanner
        isOpen={isRegisterModalOpen}
        onClose={onCloseRegisterModal}
        title="Register New Portal"
      >
        <div className="ptl-mobile-drawer">
          <div className="ptl-field">
            <label className="ptl-label">Portal Code</label>
            <input
              className="ptl-input"
              value={registerForm.portal_code}
              onChange={(e) => onRegisterFieldChange('portal_code', e.target.value)}
              placeholder="pos_portal"
            />
          </div>
          <div className="ptl-field">
            <label className="ptl-label">Display Name</label>
            <input
              className="ptl-input"
              value={registerForm.display_name}
              onChange={(e) => onRegisterFieldChange('display_name', e.target.value)}
              placeholder="POS Portal"
            />
          </div>
          <div className="ptl-field">
            <label className="ptl-label">Default Route</label>
            <input
              className="ptl-input"
              value={registerForm.default_route}
              onChange={(e) => onRegisterFieldChange('default_route', e.target.value)}
              placeholder="/home"
            />
          </div>
          <button
            type="button"
            className="ptl-btn ptl-btn-primary"
            disabled={saving || !registerForm.portal_code.trim() || !registerForm.display_name.trim()}
            onClick={onRegisterSubmit}
          >
            {saving ? 'Saving...' : 'Register Portal'}
          </button>
        </div>
      </MobileBottomBanner>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Portal Settings"
        message={`Restore ${selectedPortal?.display_name || 'this portal'} back to canonical defaults?`}
        confirmText="Reset"
        variant="danger"
        onConfirm={onConfirmReset}
        onCancel={onCloseResetConfirm}
      />
    </div>
  );
};
