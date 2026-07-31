import React, { useState, useEffect } from 'react';
import { getDefaultBackendUrl, getWorkspaceFromUrl } from '../api/client';

// Global keyboard shortcut listener registered at module load time
let lastEPressedTime = 0;
let lastShiftEPressedTime = 0;
let lastShiftENPressedTime = 0;

const handleGlobalKeyDown = (e: KeyboardEvent) => {
  const key = (e.key || '').toLowerCase();
  const now = Date.now();

  // Ignore shortcut if typing in input fields
  const activeEl = document.activeElement;
  if (activeEl && (
    activeEl.tagName === 'INPUT' ||
    activeEl.tagName === 'TEXTAREA' ||
    activeEl.getAttribute('contenteditable') === 'true'
  )) {
    return;
  }

  // 1. Ctrl + Shift + E + N
  if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
    if (key === 'e') {
      lastEPressedTime = now;
    } else if (key === 'n') {
      if (now - lastEPressedTime < 1500) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('toggle-portal-config'));
        lastEPressedTime = 0;
      }
    }
  }

  // 2. Shift + E + N + V (Shift is active at start, N and V can follow within 1500ms window)
  if (key === 'e' && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
    lastShiftEPressedTime = now;
  } else if (key === 'n' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (now - lastShiftEPressedTime < 1500) {
      lastShiftENPressedTime = now;
    }
  } else if (key === 'v' && !e.ctrlKey && !e.metaKey && !e.altKey) {
    if (now - lastShiftENPressedTime < 1500) {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('toggle-portal-config'));
      lastShiftEPressedTime = 0;
      lastShiftENPressedTime = 0;
    }
  }
};

if (typeof window !== 'undefined') {
  const win = window as any;
  if (!win.__portalConfigListenerRegistered) {
    win.addEventListener('keydown', handleGlobalKeyDown);
    win.__portalConfigListenerRegistered = true;
  }
}

export const PortalConfigModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tenantCode, setTenantCode] = useState('platform');
  const [backendUrl, setBackendUrl] = useState(getDefaultBackendUrl());
  const [overrideBackendUrl, setOverrideBackendUrl] = useState(false);

  // Load initial values from localStorage
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const savedTenant = localStorage.getItem('portal_tenant_code') || getWorkspaceFromUrl();
      const savedUrl = localStorage.getItem('portal_backend_url') || getDefaultBackendUrl();
      const savedOverride = localStorage.getItem('portal_override_backend_url') === 'true';
      setTenantCode(savedTenant);
      setBackendUrl(savedUrl);
      setOverrideBackendUrl(savedOverride);
    }
  }, [isOpen]);

  // Listen to the global keydown event trigger
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => !prev);
    };
    window.addEventListener('toggle-portal-config', handleToggle);
    return () => {
      window.removeEventListener('toggle-portal-config', handleToggle);
    };
  }, []);

  const handleSave = () => {
    localStorage.setItem('portal_tenant_code', tenantCode);
    localStorage.setItem('portal_backend_url', backendUrl);
    localStorage.setItem('portal_override_backend_url', overrideBackendUrl ? 'true' : 'false');
    setIsOpen(false);
    // Reload the page to apply API client changes
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 999999,
          transition: 'all 0.25s ease',
        }}
        onClick={() => setIsOpen(false)}
      />
      {/* Dialog container */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: '460px',
          backgroundColor: 'var(--bg-primary, #ffffff)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid var(--border-color, #e2e8f0)',
          padding: '2rem',
          zIndex: 1000000,
          fontFamily: 'Inter, system-ui, sans-serif',
          animation: 'scaleInConfigModal 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <style>{`
          @keyframes scaleInConfigModal {
            from { transform: translate(-50%, -45%) scale(0.95); opacity: 0; }
            to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary, #1f2937)',
            }}
          >
            Portal Configuration
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '0.875rem',
              color: 'var(--text-secondary, #4b5563)',
              lineHeight: 1.4,
            }}
          >
            Set environment variables for the current session. Saving will reload the portal to apply changes.
          </p>
        </div>

        {/* Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                textAlign: 'left'
              }}
            >
              Tenant Code
            </label>
            <input
              type="text"
              value={tenantCode}
              onChange={(e) => setTenantCode(e.target.value)}
              placeholder="e.g. platform"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                backgroundColor: '#ffffff',
                color: '#111827',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <input
              type="checkbox"
              id="overrideBackendUrl"
              checked={overrideBackendUrl}
              onChange={(e) => setOverrideBackendUrl(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            <label
              htmlFor="overrideBackendUrl"
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              Enable Custom URL Override
            </label>
          </div>
          {overrideBackendUrl && (
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#374151',
                  textAlign: 'left'
                }}
              >
                Backend Base URL
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                placeholder="e.g. https://api.example.com/api/v1"
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  fontSize: '0.9rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '0.625rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.875rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: '#1a56db',
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e429f'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1a56db'}
          >
            Save & Reload
          </button>
        </div>
      </div>
    </>
  );
};
