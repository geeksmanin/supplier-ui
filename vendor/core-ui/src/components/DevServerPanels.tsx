import React from 'react';
import { DevServerModalState } from './DevServerModalContent';

export const DevServerPanels: React.FC<{
  defaultProductionUrl: string;
  state: DevServerModalState;
}> = ({ defaultProductionUrl, state }) => {
  const {
    activeTab,
    currentUrl,
    selectedPreset,
    setSelectedPreset,
    customInput,
    setCustomInput,
    isCapacitor,
    errorMsg,
    statusMsg,
    diagnosticsText,
    setIsClearConfirmOpen,
    isErudaActive,
    isErudaLoading,
    effectiveStagingUrl,
    toggleEruda,
    copyDiagnostics,
  } = state;

  return (
    <div className="dev-srv-body">
      {errorMsg && (
        <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--color-danger-bg, #FEF2F2)', color: 'var(--color-danger, #B91C1C)', fontSize: '12px' }}>
          {errorMsg}
        </div>
      )}
      {statusMsg && (
        <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'var(--color-success-bg, #F0FDF4)', color: 'var(--color-success, #166534)', fontSize: '12px' }}>
          {statusMsg}
        </div>
      )}

      {activeTab === 'server' && (
        <>
          <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'var(--color-bg-secondary, #F8FAFC)', fontSize: '12px', wordBreak: 'break-all' }}>
            <strong>Active Target: </strong>{currentUrl || defaultProductionUrl}
          </div>

          <label className={`dev-srv-card ${selectedPreset === 'prod' ? 'prod' : ''}`}>
            <input type="radio" name="server_preset" checked={selectedPreset === 'prod'} onChange={() => setSelectedPreset('prod')} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>🟢 Production Cloud</div>
              <div style={{ fontSize: '11px', opacity: 0.75, wordBreak: 'break-all' }}>{defaultProductionUrl}</div>
            </div>
          </label>

          <label className={`dev-srv-card ${selectedPreset === 'staging' ? 'staging' : ''}`}>
            <input type="radio" name="server_preset" checked={selectedPreset === 'staging'} onChange={() => setSelectedPreset('staging')} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>🟡 Staging Environment</div>
              <div style={{ fontSize: '11px', opacity: 0.75, wordBreak: 'break-all' }}>{effectiveStagingUrl}</div>
            </div>
          </label>

          <label className={`dev-srv-card ${selectedPreset === 'emulator' ? 'emulator' : ''}`}>
            <input type="radio" name="server_preset" checked={selectedPreset === 'emulator'} onChange={() => setSelectedPreset('emulator')} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>💻 Android Emulator Loopback</div>
              <div style={{ fontSize: '11px', opacity: 0.75 }}>http://10.0.2.2:5173</div>
            </div>
          </label>

          <label className={`dev-srv-card ${selectedPreset === 'custom' ? 'custom' : ''}`} style={{ flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input type="radio" name="server_preset" checked={selectedPreset === 'custom'} onChange={() => setSelectedPreset('custom')} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>📱 Local LAN Dev Server (Wi-Fi)</span>
            </div>
            {selectedPreset === 'custom' && (
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="http://192.168.1.XX:5173"
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--color-border, #CBD5E1)', fontSize: '13px', fontFamily: 'monospace' }}
              />
            )}
          </label>
        </>
      )}

      {activeTab === 'console' && (
        <div style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--color-border, #E2E8F0)', fontSize: '12px' }}>
          <div style={{ fontWeight: 700, marginBottom: '6px' }}>⚡ In-App Mobile DevTools (Eruda)</div>
          <p style={{ margin: '0 0 10px', opacity: 0.75 }}>Inspect console logs, DOM, network requests, and storage on mobile.</p>
          <button type="button" onClick={toggleEruda} disabled={isErudaLoading} className="dev-srv-btn-save" style={{ width: '100%' }}>
            {isErudaActive ? '🛑 Hide In-App DevTools' : '🚀 Launch In-App DevTools'}
          </button>
        </div>
      )}

      {activeTab === 'diagnostics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
          <div style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--color-border, #E2E8F0)' }}>
            <div><strong>Platform:</strong> {isCapacitor ? 'Capacitor Android Shell' : 'Web Browser'}</div>
            <div><strong>Backend API:</strong> {localStorage.getItem('portal_backend_url') || '(Production Cloud API)'}</div>
            <div><strong>Stored Keys:</strong> {localStorage.length}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={copyDiagnostics} className="dev-srv-btn-cancel" style={{ flex: 1 }}>📋 Copy Diagnostics</button>
            <button type="button" onClick={() => setIsClearConfirmOpen(true)} className="dev-srv-btn-cancel" style={{ flex: 1, color: 'var(--color-danger, #DC2626)' }}>
              🧹 Clear Storage & Reload
            </button>
          </div>
          {diagnosticsText && (
            <textarea readOnly value={diagnosticsText} rows={5} style={{ width: '100%', fontSize: '11px', fontFamily: 'monospace', padding: '8px', borderRadius: '8px', border: '1px solid var(--color-border, #E2E8F0)' }} />
          )}
        </div>
      )}
    </div>
  );
};
