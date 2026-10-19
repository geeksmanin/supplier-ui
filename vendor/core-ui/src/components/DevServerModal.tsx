import React, { useState, useEffect } from 'react';

export interface DevServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProductionUrl?: string;
  defaultStagingUrl?: string;
  appName?: string;
}

export const DevServerModal: React.FC<DevServerModalProps> = ({
  isOpen,
  onClose,
  defaultProductionUrl = (typeof window !== 'undefined' ? window.location.origin : 'https://business.samwad.geeksman.co.in'),
  defaultStagingUrl,
  appName = (typeof document !== 'undefined' && document.title ? document.title.split('|')[0].trim() : 'App'),
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<'prod' | 'staging' | 'emulator' | 'custom'>('custom');
  const [customInput, setCustomInput] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.port) {
      return `http://192.168.1.15:${window.location.port}`;
    }
    return 'http://192.168.1.15:3004';
  });
  const [isCapacitor, setIsCapacitor] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const effectiveStagingUrl = defaultStagingUrl || defaultProductionUrl.replace('business.', 'staging.');

  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg('');
    const cap = (window as any).Capacitor;
    const isNative = Boolean(cap?.isNativePlatform && cap.isNativePlatform());
    setIsCapacitor(isNative);

    // Try reading active URL from Capacitor DevServerPlugin or localStorage
    if (cap?.Plugins?.DevServer?.getServerUrl) {
      cap.Plugins.DevServer.getServerUrl()
        .then((res: { url?: string; defaultUrl?: string }) => {
          const active = res.url || defaultProductionUrl;
          setCurrentUrl(active);
          initSelection(active);
        })
        .catch(() => {
          fallbackRead();
        });
    } else {
      fallbackRead();
    }
  }, [isOpen, defaultProductionUrl, effectiveStagingUrl]);

  const fallbackRead = () => {
    const saved = localStorage.getItem('geeksman_server_url') ||
                  localStorage.getItem('portal_backend_url') ||
                  defaultProductionUrl;
    setCurrentUrl(saved);
    initSelection(saved);
  };

  const initSelection = (url: string) => {
    if (url === defaultProductionUrl) {
      setSelectedPreset('prod');
    } else if (url === effectiveStagingUrl) {
      setSelectedPreset('staging');
    } else if (url.includes('10.0.2.2')) {
      setSelectedPreset('emulator');
    } else {
      setSelectedPreset('custom');
      setCustomInput(url);
    }
  };

  if (!isOpen) return null;

  const handleSave = async () => {
    let target = '';
    if (selectedPreset === 'prod') target = defaultProductionUrl;
    else if (selectedPreset === 'staging') target = effectiveStagingUrl;
    else if (selectedPreset === 'emulator') target = 'http://10.0.2.2:5173';
    else {
      target = customInput.trim();
      if (!target.startsWith('http://') && !target.startsWith('https://')) {
        target = `http://${target}`;
      }
    }

    try {
      new URL(target);
    } catch (e) {
      setErrorMsg('Please enter a valid URL (e.g., http://192.168.1.50:5173)');
      return;
    }

    setIsSaving(true);
    setErrorMsg('');

    try {
      // 1. Save in localStorage for web state
      localStorage.setItem('geeksman_server_url', target);
      localStorage.setItem('portal_backend_url', target);

      // 2. Call Native Capacitor Plugin if available
      const cap = (window as any).Capacitor;
      if (isCapacitor && cap?.Plugins?.DevServer?.setServerUrl) {
        await cap.Plugins.DevServer.setServerUrl({ url: target });
        setIsSaving(false);
        onClose();
        return;
      }

      // 3. Reload environment for browser client
      setTimeout(() => {
        window.location.href = target;
      }, 300);
    } catch (err: any) {
      console.error('Failed to set dev server URL:', err);
      setErrorMsg(err.message || 'Failed to switch server. Check connection.');
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    localStorage.removeItem('geeksman_server_url');
    localStorage.removeItem('portal_backend_url');

    try {
      const cap = (window as any).Capacitor;
      if (isCapacitor && cap?.Plugins?.DevServer?.resetServerUrl) {
        await cap.Plugins.DevServer.resetServerUrl();
        setIsSaving(false);
        onClose();
        return;
      }
      setTimeout(() => {
        window.location.href = defaultProductionUrl;
      }, 300);
    } catch (e) {
      window.location.href = defaultProductionUrl;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          width: '100%',
          maxWidth: '440px',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #E2E8F0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🛠️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, letterSpacing: '-0.2px' }}>
                {appName} Server Environment
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94A3B8' }}>
                {isCapacitor ? 'Native Android Shell' : 'Web Browser Client'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94A3B8',
              fontSize: '20px',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              padding: '4px 8px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Current URL badge */}
          <div
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              fontSize: '12px',
            }}
          >
            <span style={{ color: '#64748B', fontWeight: 600 }}>Active Target: </span>
            <span style={{ color: '#0284C7', fontWeight: 600, wordBreak: 'break-all' }}>
              {currentUrl || defaultProductionUrl}
            </span>
          </div>

          {errorMsg && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                fontSize: '12px',
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* Preset Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 1. Production */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: selectedPreset === 'prod' ? '2px solid #008069' : '1px solid #E2E8F0',
                backgroundColor: selectedPreset === 'prod' ? '#F0FDF4' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="server_preset"
                checked={selectedPreset === 'prod'}
                onChange={() => setSelectedPreset('prod')}
                style={{ marginTop: '3px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#166534' }}>
                  🟢 Production Cloud
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', wordBreak: 'break-all' }}>
                  {defaultProductionUrl}
                </div>
              </div>
            </label>

            {/* 2. Staging */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: selectedPreset === 'staging' ? '2px solid #D97706' : '1px solid #E2E8F0',
                backgroundColor: selectedPreset === 'staging' ? '#FFFBEB' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="server_preset"
                checked={selectedPreset === 'staging'}
                onChange={() => setSelectedPreset('staging')}
                style={{ marginTop: '3px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#92400E' }}>
                  🟡 Staging Environment
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', wordBreak: 'break-all' }}>
                  {effectiveStagingUrl}
                </div>
              </div>
            </label>

            {/* 3. Android Emulator */}
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: selectedPreset === 'emulator' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                backgroundColor: selectedPreset === 'emulator' ? '#EFF6FF' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="server_preset"
                checked={selectedPreset === 'emulator'}
                onChange={() => setSelectedPreset('emulator')}
                style={{ marginTop: '3px' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E40AF' }}>
                  💻 Android Emulator Loopback
                </div>
                <div style={{ fontSize: '11px', color: '#64748B' }}>
                  http://10.0.2.2:5173
                </div>
              </div>
            </label>

            {/* 4. Custom Local LAN */}
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: '10px',
                border: selectedPreset === 'custom' ? '2px solid #7C3AED' : '1px solid #E2E8F0',
                backgroundColor: selectedPreset === 'custom' ? '#FAF5FF' : '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="radio"
                  name="server_preset"
                  checked={selectedPreset === 'custom'}
                  onChange={() => setSelectedPreset('custom')}
                />
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#5B21B6' }}>
                  📱 Local LAN Dev Server (Wi-Fi)
                </div>
              </div>

              {selectedPreset === 'custom' && (
                <div style={{ marginLeft: '24px' }}>
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="http://192.168.1.XX:5173"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box',
                    }}
                  />
                  <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
                    Run <code>npm run dev -- --host</code> on your computer to bind Vite to LAN.
                  </div>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <button
            onClick={handleReset}
            disabled={isSaving}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#EF4444',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              padding: '6px 8px',
            }}
          >
            Reset Default
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              disabled={isSaving}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#475569',
                borderRadius: '8px',
                padding: '8px 14px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                backgroundColor: '#008069',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.7 : 1,
                boxShadow: '0 2px 4px rgba(0, 128, 105, 0.25)',
              }}
            >
              {isSaving ? 'Connecting...' : 'Save & Reload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
