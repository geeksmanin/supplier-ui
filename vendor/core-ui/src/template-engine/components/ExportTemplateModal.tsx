import React, { useState } from 'react';
import { TemplateDefinition } from '../engine/types';
import { generateTemplateCode, downloadTemplateCode } from '../engine/exportEngine';

export interface ExportTemplateModalProps {
  template: TemplateDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportTemplateModal: React.FC<ExportTemplateModalProps> = ({
  template,
  isOpen,
  onClose,
}) => {
  const [format, setFormat] = useState<'json' | 'ts'>('ts');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !template) return null;

  const code = generateTemplateCode(template, format);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    downloadTemplateCode(template, format);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100000,
        padding: '1.5rem',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Export Template Code to Git
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
              Template: <b>{template.name}</b> (Series: {template.series.join(', ')})
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              fontSize: '1.4rem',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Format Selector & Action Controls */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setFormat('ts')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: format === 'ts' ? '#2563eb' : '#cbd5e1',
                backgroundColor: format === 'ts' ? '#eff6ff' : '#ffffff',
                color: format === 'ts' ? '#2563eb' : '#475569',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              TypeScript (.ts)
            </button>
            <button
              onClick={() => setFormat('json')}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                border: '1px solid',
                borderColor: format === 'json' ? '#2563eb' : '#cbd5e1',
                backgroundColor: format === 'json' ? '#eff6ff' : '#ffffff',
                color: format === 'json' ? '#2563eb' : '#475569',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              JSON (.json)
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={handleCopy}
              style={{
                padding: '0.45rem 0.9rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: copied ? '#dcfce7' : '#ffffff',
                color: copied ? '#166534' : '#334155',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              {copied ? '✓ Copied to Clipboard' : '📋 Copy Code'}
            </button>

            <button
              onClick={handleDownload}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '6px',
                backgroundColor: '#1d4ed8',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              💾 Download .{format} File
            </button>
          </div>
        </div>

        {/* Code Preview Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', backgroundColor: '#0f172a' }}>
          <pre
            style={{
              margin: 0,
              fontFamily: "'Fira Code', Menlo, Monaco, Consolas, monospace",
              fontSize: '0.82rem',
              color: '#e2e8f0',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            }}
          >
            {code}
          </pre>
        </div>

        {/* Footer Guidance */}
        <div
          style={{
            padding: '0.85rem 1.5rem',
            borderTop: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: '#64748b',
          }}
        >
          <div>
            💡 You can commit this file directly into <code>src/templates/registeredTemplates.ts</code>.
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '6px',
              backgroundColor: '#e2e8f0',
              border: 'none',
              color: '#334155',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
