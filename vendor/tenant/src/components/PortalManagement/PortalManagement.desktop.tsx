import React from 'react';
import {
  ConfirmModal,
  ImageUpload,
  Portals3DIcon,
  SearchInput,
  Select,
} from '@geeksman/core-ui';
import type { PortalLandingMode } from '../../types/portal';
import type { PortalManagementViewProps } from './PortalManagement.types';
import { RegisterPortalModal } from './RegisterPortalModal';
import './PortalManagement.css';

const LANDING_MODE_OPTIONS = [
  { value: 'DASHBOARD', label: 'Portal Dashboard' },
  { value: 'AGENT', label: 'Direct Conversational Agent UI' },
  { value: 'CUSTOM_ROUTE', label: 'Custom Route Path' },
];

const CUSTOMER_TAB_OPTIONS = [
  { value: 'chat', label: 'Agent Chat First' },
  { value: 'catalog', label: 'Catalog First' },
  { value: 'tickets', label: 'Support Tickets First' },
];

const SAMWAD_TAB_OPTIONS = [
  { value: 'chats', label: 'Chats Inbox' },
  { value: 'agents', label: 'AI & Workflow Agents' },
  { value: 'contacts', label: 'Contacts' },
];

export const PortalManagementDesktop: React.FC<PortalManagementViewProps> = ({
  portals,
  selectedPortal,
  formData,
  registerForm,
  loading,
  saving,
  searchQuery,
  isPlatformAdmin,
  isRegisterModalOpen,
  isResetConfirmOpen,
  onSearchChange,
  onSelectPortal,
  onRefresh,
  onFieldChange,
  onRegisterFieldChange,
  onSettingChange,
  onToggleVisibleAgent,
  onSave,
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

  const routeOptions = (selectedPortal?.available_routes || []).map((r) => ({
    value: r.route,
    label: `${r.label} (${r.route})`,
  }));

  const formatLabel = (key: string) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase());

  return (
    <div className="ptl-shell">
      <div className="ptl-toolbar">
        <div className="ptl-toolbar-left">
          <Portals3DIcon size={30} />
          <div className="ptl-search-wrap">
            <SearchInput
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search registered portals..."
            />
          </div>
        </div>
        <div className="ptl-toolbar-actions">
          <button type="button" className="ptl-btn ptl-btn-secondary" onClick={onRefresh} disabled={loading}>
            Refresh
          </button>
          {isPlatformAdmin && (
            <button type="button" className="ptl-btn ptl-btn-primary" onClick={onOpenRegisterModal}>
              + Register Portal
            </button>
          )}
        </div>
      </div>

      <div className="ptl-grid">
        <div className="ptl-list-panel" role="listbox" aria-label="Registered Portals">
          <div className="ptl-list-header">Registered Portals ({portals.length})</div>
          {portals.map((portal) => {
            const isSelected = selectedPortal?.portal_code === portal.portal_code;
            return (
              <button
                key={portal.portal_code}
                type="button"
                id={`row-${portal.portal_code}`}
                data-testid={`portal-row-${portal.portal_code}`}
                className={`ptl-portal-row ${isSelected ? 'is-selected' : ''}`}
                onClick={() => onSelectPortal(portal.portal_code)}
              >
                <div>
                  <div className="ptl-portal-row-title">{portal.display_name}</div>
                  <div className="ptl-portal-row-meta">
                    {portal.portal_code} · Default: {portal.default_route}
                  </div>
                </div>
                <span className={`ptl-badge ${portal.is_enabled ? 'ptl-badge-active' : 'ptl-badge-disabled'}`}>
                  {portal.is_enabled ? 'Enabled' : 'Disabled'}
                </span>
              </button>
            );
          })}
        </div>

        {selectedPortal ? (
          <div className="ptl-editor-stack">
            <div className="ptl-card">
              <div className="ptl-card-head">
                <div>
                  <h3 className="ptl-card-title">{selectedPortal.display_name}</h3>
                  <p className="ptl-card-sub">
                    {selectedPortal.description || `Configure ${selectedPortal.portal_code} portal.`}
                  </p>
                </div>
                <span className="ptl-badge ptl-badge-mode">{selectedPortal.app_repo || selectedPortal.portal_code}</span>
              </div>

              <div className="ptl-toggle-row">
                <div>
                  <div className="ptl-toggle-title">Portal Active Status</div>
                  <div className="ptl-toggle-desc">Enable or pause access to this portal for your tenant.</div>
                </div>
                <input
                  type="checkbox"
                  aria-label="Enable portal"
                  checked={formData.is_enabled}
                  onChange={(e) => onFieldChange('is_enabled', e.target.checked)}
                />
              </div>
            </div>

            <div className="ptl-card">
              <div className="ptl-card-head">
                <div>
                  <h3 className="ptl-card-title">Landing Experience & Default Agent</h3>
                  <p className="ptl-card-sub">
                    Updates sync live over SSE to connected customer and agent portal tabs without reload.
                  </p>
                </div>
              </div>

              <div className="ptl-field-grid">
                <div className="ptl-field">
                  <label className="ptl-label">Landing Mode</label>
                  <Select
                    value={formData.landing_mode}
                    onChange={(val) => {
                      const mode = (val as PortalLandingMode) || 'DASHBOARD';
                      onFieldChange('landing_mode', mode);
                      if (mode === 'DASHBOARD' && selectedPortal.available_routes?.[0]?.route) {
                        onFieldChange('default_route', selectedPortal.available_routes[0].route);
                      }
                    }}
                    options={LANDING_MODE_OPTIONS}
                    placeholder="Select landing mode"
                  />
                </div>

                {formData.landing_mode === 'AGENT' && (
                  <div className="ptl-field">
                    <label className="ptl-label">Default Support / Workflow Agent</label>
                    <Select
                      value={formData.default_agent_id}
                      onChange={(agentId) => {
                        const chosenId = String(agentId || '');
                        onFieldChange('default_agent_id', chosenId);
                        const match = selectedPortal.available_agents.find((a) => a.id === chosenId);
                        if (match?.route) {
                          onFieldChange('default_route', match.route);
                        }
                      }}
                      options={agentOptions}
                      placeholder="Select default Agent UI"
                    />
                  </div>
                )}

                {routeOptions.length > 0 && (
                  <div className="ptl-field">
                    <label className="ptl-label">Quick Landing Route Preset</label>
                    <Select
                      value={formData.default_route}
                      onChange={(route) => onFieldChange('default_route', String(route || '/'))}
                      options={routeOptions}
                      placeholder="Select preset route"
                    />
                  </div>
                )}

                <div className="ptl-field">
                  <label className="ptl-label" htmlFor="ptl-default-route-input">Default Landing Route</label>
                  <input
                    id="ptl-default-route-input"
                    className="ptl-input"
                    value={formData.default_route}
                    onChange={(e) => onFieldChange('default_route', e.target.value)}
                    placeholder="/home or /agent/ticket"
                  />
                </div>
              </div>
            </div>

            {selectedPortal.available_agents && selectedPortal.available_agents.length > 0 && (
              <div className="ptl-card">
                <div className="ptl-card-head">
                  <div>
                    <h3 className="ptl-card-title">Visible Agent Modules</h3>
                    <p className="ptl-card-sub">
                      Leave all unchecked to allow all agents, or select specific agents to show.
                    </p>
                  </div>
                </div>
                <div className="ptl-checkbox-grid">
                  {selectedPortal.available_agents.map((agent) => (
                    <label key={agent.id} className="ptl-checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.visible_agents.includes(agent.id)}
                        onChange={() => onToggleVisibleAgent(agent.id)}
                      />
                      <span>{agent.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="ptl-card">
              <div className="ptl-card-head">
                <div>
                  <h3 className="ptl-card-title">Branding & Portal Settings</h3>
                  <p className="ptl-card-sub">Customize title, logo, accent color, and feature switches.</p>
                </div>
              </div>

              <div className="ptl-field-grid">
                <div className="ptl-field">
                  <label className="ptl-label" htmlFor="ptl-app-name">Portal App Name</label>
                  <input
                    id="ptl-app-name"
                    className="ptl-input"
                    value={formData.app_name}
                    onChange={(e) => onFieldChange('app_name', e.target.value)}
                    placeholder={selectedPortal.display_name}
                  />
                </div>
                <div className="ptl-field">
                  <label className="ptl-label" htmlFor="ptl-theme-color">Theme Accent Color</label>
                  <input
                    id="ptl-theme-color"
                    className="ptl-input"
                    value={formData.theme_color}
                    onChange={(e) => onFieldChange('theme_color', e.target.value)}
                    placeholder="#008069"
                  />
                </div>
                <div className="ptl-field">
                  <ImageUpload
                    folder="portal-branding"
                    label="Portal Logo"
                    value={formData.logo_url ? [formData.logo_url] : []}
                    onChange={(urls) => onFieldChange('logo_url', urls[0] || '')}
                    maxFiles={1}
                  />
                </div>
              </div>

              {selectedPortal.portal_code === 'customer' && (
                <div className="ptl-field-grid">
                  <div className="ptl-field">
                    <label className="ptl-label">Default Agent Tab</label>
                    <Select
                      value={String(formData.settings.default_agent_tab || 'chat')}
                      onChange={(val) => onSettingChange('default_agent_tab', val)}
                      options={CUSTOMER_TAB_OPTIONS}
                    />
                  </div>
                </div>
              )}

              {selectedPortal.portal_code === 'samwad' && (
                <div className="ptl-field-grid">
                  <div className="ptl-field">
                    <label className="ptl-label">Default Workspace Tab</label>
                    <Select
                      value={String(formData.settings.default_workspace_tab || 'chats')}
                      onChange={(val) => onSettingChange('default_workspace_tab', val)}
                      options={SAMWAD_TAB_OPTIONS}
                    />
                  </div>
                </div>
              )}

              <div className="ptl-checkbox-grid">
                {Object.entries(formData.settings)
                  .filter(([, val]) => typeof val === 'boolean')
                  .map(([key, val]) => (
                    <label key={key} className="ptl-checkbox-item">
                      <input
                        type="checkbox"
                        checked={Boolean(val)}
                        onChange={(e) => onSettingChange(key, e.target.checked)}
                      />
                      <span>{formatLabel(key)}</span>
                    </label>
                  ))}
              </div>
            </div>

            <div className="ptl-footer-actions">
              <button
                type="button"
                className="ptl-btn ptl-btn-danger-outline"
                onClick={onOpenResetConfirm}
                disabled={saving}
              >
                Reset to Defaults
              </button>
              <button
                type="button"
                className="ptl-btn ptl-btn-primary"
                data-testid="save-portal-settings-btn"
                onClick={onSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Portal Settings'}
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Reset Portal Settings"
        message={`Restore ${selectedPortal?.display_name || 'this portal'} back to canonical defaults?`}
        confirmText="Reset"
        variant="danger"
        onConfirm={onConfirmReset}
        onCancel={onCloseResetConfirm}
      />

      <RegisterPortalModal
        key={isRegisterModalOpen ? 'register-open' : 'register-closed'}
        isOpen={isRegisterModalOpen}
        saving={saving}
        form={registerForm}
        onFieldChange={onRegisterFieldChange}
        onClose={onCloseRegisterModal}
        onSubmit={onRegisterSubmit}
      />
    </div>
  );
};
