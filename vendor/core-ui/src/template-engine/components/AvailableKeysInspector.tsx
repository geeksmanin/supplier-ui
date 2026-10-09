import React, { useState, useMemo } from 'react';
import { AvailableKey, KeyDataType } from '../model/types';

export interface AvailableKeysInspectorProps {
  keys: AvailableKey[];
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const AvailableKeysInspector: React.FC<AvailableKeysInspectorProps> = ({
  keys,
  isOpen,
  onClose,
  title = 'Available Template Placeholders & Data Keys',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ITEMS' | 'DOCUMENT' | 'TOTALS'>('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      // Tab filter
      if (activeTab === 'ITEMS' && !k.isCollectionItem && k.type !== 'array') return false;
      if (activeTab === 'DOCUMENT' && (k.isCollectionItem || k.category?.toLowerCase().includes('total'))) return false;
      if (activeTab === 'TOTALS' && !k.category?.toLowerCase().includes('total') && !k.key.includes('total') && !k.key.includes('amount')) return false;

      // Search filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        k.key.toLowerCase().includes(term) ||
        k.label.toLowerCase().includes(term) ||
        (k.category && k.category.toLowerCase().includes(term))
      );
    });
  }, [keys, searchTerm, activeTab]);

  const handleCopy = (keyText: string) => {
    const token = `{{ ${keyText} }}`;
    navigator.clipboard.writeText(token);
    setCopiedKey(keyText);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  if (!isOpen) return null;

  const getTypeBadgeColor = (type: KeyDataType) => {
    switch (type) {
      case 'number':
        return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
      case 'string':
        return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
      case 'date':
        return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
      case 'array':
        return { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' };
      case 'boolean':
        return { bg: '#ecfeff', text: '#0891b2', border: '#a5f3fc' };
      default:
        return { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '840px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              {title}
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
              Click any token to copy <code>{'{{ key }}'}</code> for template layout design
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '8px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Toolbar & Filter Tabs */}
        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search placeholder keys (e.g. item.SalePrice, customer, doc.no)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(['ALL', 'ITEMS', 'DOCUMENT', 'TOTALS'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '0.5rem 0.85rem',
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: activeTab === tab ? '#2563eb' : '#e2e8f0',
                  backgroundColor: activeTab === tab ? '#eff6ff' : '#ffffff',
                  color: activeTab === tab ? '#2563eb' : '#64748b',
                  fontWeight: activeTab === tab ? 700 : 500,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                }}
              >
                {tab === 'ITEMS' ? 'Array Line Items (item.*)' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Keys List Table */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 1.5rem 1rem 1.5rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginTop: '0.5rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Token Key</th>
                <th style={{ padding: '0.75rem 0.5rem', width: '100px' }}>Data Type</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Description / Label</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Live Sample Value</th>
                <th style={{ padding: '0.75rem 0.5rem', width: '90px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No keys found matching your search.
                  </td>
                </tr>
              ) : (
                filteredKeys.map((item) => {
                  const colors = getTypeBadgeColor(item.type);
                  const isCopied = copiedKey === item.key;

                  return (
                    <tr
                      key={item.key}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        backgroundColor: isCopied ? '#f0fdf4' : 'transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                      onClick={() => handleCopy(item.key)}
                    >
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <code style={{
                          backgroundColor: '#f1f5f9',
                          color: '#0f172a',
                          padding: '0.2rem 0.4rem',
                          borderRadius: '4px',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          border: '1px solid #e2e8f0',
                        }}>
                          {`{{ ${item.key} }}`}
                        </code>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                          padding: '0.15rem 0.5rem',
                          borderRadius: '999px',
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                        }}>
                          {item.type}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#475569', fontWeight: 600 }}>
                        {item.label}
                        {item.category && (
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>
                            {item.category}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#0f172a', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.sampleValue !== undefined && item.sampleValue !== null
                          ? String(item.sampleValue)
                          : <span style={{ color: '#cbd5e1', fontStyle: 'italic' }}>null</span>}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(item.key);
                          }}
                          style={{
                            padding: '0.35rem 0.65rem',
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: isCopied ? '#86efac' : '#cbd5e1',
                            backgroundColor: isCopied ? '#dcfce7' : '#ffffff',
                            color: isCopied ? '#166534' : '#334155',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {isCopied ? '✓ Copied' : 'Copy'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.75rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: '#64748b',
        }}>
          <div>
            Showing <b>{filteredKeys.length}</b> of <b>{keys.length}</b> available keys
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '6px',
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
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
