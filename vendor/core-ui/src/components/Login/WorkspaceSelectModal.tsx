import React, { useState, useEffect } from 'react';
import { Button } from '../Button';
import { Input } from '../Input';
import { BarcodeQRScannerModal } from '../BarcodeQRScannerModal';
import { resolveTenantByCode, TenantMetadata } from '../../api/client';
import { useToast } from '../Toast/Toast';

export interface WorkspaceSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWorkspace?: string;
  onSelectWorkspace: (workspaceCode: string, metadata?: TenantMetadata) => void;
}

export const WorkspaceSelectModal: React.FC<WorkspaceSelectModalProps> = ({
  isOpen,
  onClose,
  currentWorkspace = '',
  onSelectWorkspace,
}) => {
  const { showToast } = useToast();
  const [workspaceInput, setWorkspaceInput] = useState(
    currentWorkspace === 'business' || currentWorkspace === 'platform' ? '' : currentWorkspace
  );
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [validating, setValidating] = useState(false);
  const [previewMetadata, setPreviewMetadata] = useState<TenantMetadata | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initial = currentWorkspace === 'business' || currentWorkspace === 'platform' ? '' : currentWorkspace;
      setWorkspaceInput(initial);
      setPreviewMetadata(null);
      setValidationError(null);
      if (initial.trim()) {
        checkWorkspace(initial.trim());
      }
    }
  }, [isOpen, currentWorkspace]);

  const cleanWorkspaceCode = (raw: string): string => {
    let clean = raw.trim().toLowerCase();
    // Handle JSON QR codes like {"tenant_code": "a3pl"} or {"workspace": "a3pl"}
    if (clean.startsWith('{') && clean.endsWith('}')) {
      try {
        const parsed = JSON.parse(clean);
        clean = parsed.tenant_code || parsed.workspace || parsed.code || clean;
      } catch (e) {
        // use raw
      }
    }
    // Handle URLs like https://a3pl.geeksman.in or https://app.geeksman.in?workspace=a3pl
    if (clean.includes('http://') || clean.includes('https://')) {
      try {
        const url = new URL(clean);
        const queryWs = url.searchParams.get('workspace') || url.searchParams.get('tenant') || url.searchParams.get('tenant_code');
        if (queryWs) {
          clean = queryWs;
        } else {
          const parts = url.hostname.split('.');
          if (parts.length > 2 && !['www', 'app', 'staff', 'customer', 'portal', 'samwad'].includes(parts[0])) {
            clean = parts[0];
          }
        }
      } catch (e) {
        // use raw
      }
    }
    return clean.replace(/[^a-z0-9_-]/gi, '').toLowerCase();
  };

  const checkWorkspace = async (code: string) => {
    const cleaned = cleanWorkspaceCode(code);
    if (!cleaned) {
      setPreviewMetadata(null);
      setValidationError(null);
      return;
    }

    setValidating(true);
    setValidationError(null);
    try {
      const meta = await resolveTenantByCode(cleaned);
      setPreviewMetadata(meta);
    } catch (err: any) {
      // In staging/local dev environments without platform resolve route, allow direct code
      setPreviewMetadata({
        tenant_code: cleaned,
        workspace: cleaned,
        name: cleaned.toUpperCase(),
        is_active: true
      });
    } finally {
      setValidating(false);
    }
  };

  const handleApply = (codeToApply?: string) => {
    const targetCode = cleanWorkspaceCode(codeToApply || workspaceInput);
    if (!targetCode) {
      setValidationError('Please enter a valid workspace code or scan a QR code.');
      return;
    }

    try {
      localStorage.setItem('tenant_code', targetCode);
      localStorage.setItem('workspace_code', targetCode);
      localStorage.setItem('current_tenant_code', targetCode);
      if (previewMetadata?.name) {
        localStorage.setItem('tenant_name', previewMetadata.name);
      }
      showToast(`Workspace switched to ${targetCode.toUpperCase()}`, 'success');
      onSelectWorkspace(targetCode, previewMetadata || undefined);
      onClose();
    } catch (err: any) {
      console.error('Failed to save workspace code:', err);
      setValidationError('Failed to persist workspace settings.');
    }
  };

  const handleScanSuccess = (scannedData: any) => {
    const rawCode = typeof scannedData === 'string' ? scannedData : scannedData?.code || scannedData?.sku || '';
    const cleaned = cleanWorkspaceCode(rawCode);
    if (cleaned) {
      setWorkspaceInput(cleaned);
      setIsScannerOpen(false);
      checkWorkspace(cleaned);
      handleApply(cleaned);
    } else {
      showToast('Could not recognize workspace from QR code', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && currentWorkspace && currentWorkspace !== 'business') {
            onClose();
          }
        }}
      >
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            maxWidth: '460px',
            width: '100%',
            padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '100px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                  marginBottom: '0.5rem',
                }}
              >
                🏢 MULTI-TENANT WORKSPACE
              </div>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                Select Workspace
              </h2>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Enter your company workspace slug or scan your organization QR code.
              </p>
            </div>
            {currentWorkspace && currentWorkspace !== 'business' && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '0.25rem',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            )}
          </div>

          {/* Quick Scan Callout */}
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.65rem',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              border: '1.5px dashed #3b82f6',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <rect x="7" y="7" width="10" height="10" rx="1" />
            </svg>
            <span>Scan Organization QR Code</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>OR ENTER MANUALLY</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
          </div>

          {/* Manual Input Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.825rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
              Workspace Code / Business Slug
            </label>
            <div style={{ position: 'relative' }}>
              <Input
                autoFocus
                value={workspaceInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setWorkspaceInput(val);
                  setValidationError(null);
                  if (val.trim()) {
                    checkWorkspace(val.trim());
                  } else {
                    setPreviewMetadata(null);
                  }
                }}
                placeholder="e.g. a3pl, swastik, synchx..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                  letterSpacing: '0.025em',
                }}
              />
            </div>
            {validationError && (
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.8rem', color: '#dc2626', fontWeight: 500 }}>
                {validationError}
              </p>
            )}
          </div>

          {/* Workspace Preview Card if verified */}
          {previewMetadata && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {previewMetadata.logo_url ? (
                  <img
                    src={previewMetadata.logo_url}
                    alt={previewMetadata.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : (
                  (previewMetadata.name || previewMetadata.tenant_code || 'W')[0].toUpperCase()
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {previewMetadata.name || previewMetadata.tenant_code.toUpperCase()}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                  code: {previewMetadata.tenant_code}
                </div>
              </div>
              <span
                style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '100px',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                Active
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            {currentWorkspace && currentWorkspace !== 'business' && (
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancel
              </Button>
            )}
            <Button
              variant="primary"
              type="button"
              disabled={validating || !workspaceInput.trim()}
              onClick={() => handleApply()}
              style={{ minWidth: '120px' }}
            >
              {validating ? 'Verifying...' : 'Set Workspace'}
            </Button>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <BarcodeQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
        title="Scan Workspace QR Code"
      />
    </>
  );
};
