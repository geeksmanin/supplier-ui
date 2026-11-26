import React from 'react';
import { ConfirmModal } from './ConfirmModal';
import { DevServerPanels } from './DevServerPanels';
import { useDevServerModal } from './useDevServerModal';

export type DevServerModalState = ReturnType<typeof useDevServerModal>;

interface DevServerModalContentProps {
  appName: string;
  defaultProductionUrl: string;
  onClose: () => void;
  state: DevServerModalState;
}

export const DevServerModalContent: React.FC<DevServerModalContentProps> = ({
  appName,
  defaultProductionUrl,
  onClose,
  state,
}) => {
  const { activeTab, setActiveTab, isCapacitor, isSaving, isClearConfirmOpen, setIsClearConfirmOpen, confirmClearCacheAndReset, handleSave, handleReset } = state;

  return (
    <>
      <style>{`
        .dev-srv-header { padding: 16px 20px; background: linear-gradient(135deg, var(--color-text-primary, #0F172A) 0%, #1E293B 100%); color: #FFFFFF; display: flex; align-items: center; justify-content: space-between; }
        .dev-srv-tabs { display: flex; background-color: var(--color-bg-secondary, #F1F5F9); padding: 4px; border-bottom: 1px solid var(--color-border, #E2E8F0); }
        .dev-srv-tab { flex: 1; padding: 7px 10px; border: none; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; background: transparent; color: var(--color-text-secondary, #64748B); }
        .dev-srv-tab.active { background: var(--color-bg-primary, #FFFFFF); color: var(--color-text-primary, #0F172A); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
        .dev-srv-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; flex: 1; }
        .dev-srv-card { padding: 10px 12px; border-radius: 10px; border: 1px solid var(--color-border, #E2E8F0); background: var(--color-bg-primary, #FFFFFF); cursor: pointer; display: flex; align-items: flex-start; gap: 10px; }
        .dev-srv-card.prod { border: 2px solid #008069; background: #F0FDF4; }
        .dev-srv-card.staging { border: 2px solid #D97706; background: #FFFBEB; }
        .dev-srv-card.emulator { border: 2px solid #2563EB; background: #EFF6FF; }
        .dev-srv-card.custom { border: 2px solid #7C3AED; background: #FAF5FF; flex-direction: column; }
        .dev-srv-footer { padding: 12px 20px; background: var(--color-bg-secondary, #F8FAFC); border-top: 1px solid var(--color-border, #E2E8F0); display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .dev-srv-btn-save { background: #008069; border: none; color: #FFFFFF; border-radius: 8px; padding: 7px 16px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .dev-srv-btn-cancel { background: var(--color-bg-primary, #FFFFFF); border: 1px solid var(--color-border, #CBD5E1); color: var(--color-text-secondary, #475569); border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; }
      `}</style>

      <div className="dev-srv-header">
        <div className="flex items-center gap-2">
          <span>🛠️</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>{appName} Developer Tools</h3>
            <p style={{ margin: '2px 0 0', fontSize: '11px', opacity: 0.75 }}>{isCapacitor ? '📱 Native Android Shell' : '🌐 Web Browser Client'}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} disabled={isSaving} aria-label="Close" style={{ background: 'transparent', border: 'none', color: 'inherit', fontSize: '18px', cursor: 'pointer' }}>✕</button>
      </div>

      <div className="dev-srv-tabs">
        <button type="button" onClick={() => setActiveTab('server')} className={`dev-srv-tab ${activeTab === 'server' ? 'active' : ''}`}>🌐 Server Env</button>
        <button type="button" onClick={() => setActiveTab('console')} className={`dev-srv-tab ${activeTab === 'console' ? 'active' : ''}`}>⚡ Dev Console</button>
        <button type="button" onClick={() => setActiveTab('diagnostics')} className={`dev-srv-tab ${activeTab === 'diagnostics' ? 'active' : ''}`}>📋 Diagnostics</button>
      </div>

      <DevServerPanels defaultProductionUrl={defaultProductionUrl} state={state} />

      <div className="dev-srv-footer">
        <button type="button" onClick={handleReset} disabled={isSaving} style={{ background: 'transparent', border: 'none', color: 'var(--color-danger, #EF4444)', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Reset Default</button>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={onClose} disabled={isSaving} className="dev-srv-btn-cancel">Cancel</button>
          {activeTab === 'server' && (
            <button type="button" onClick={handleSave} disabled={isSaving} className="dev-srv-btn-save">{isSaving ? 'Connecting...' : 'Save & Reload'}</button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isClearConfirmOpen}
        title="Clear Local Storage & Reload"
        message="Clear all local storage, session storage, and reload the application?"
        confirmText="Clear & Reload"
        cancelText="Cancel"
        variant="danger"
        onConfirm={confirmClearCacheAndReset}
        onCancel={() => setIsClearConfirmOpen(false)}
      />
    </>
  );
};
