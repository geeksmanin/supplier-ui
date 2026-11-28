import React, { useState } from 'react';
import { Input } from '@geeksman/core-ui';
import { Search, Plus, Building2, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { Branch } from './BranchesList.types';

export interface BranchesListMobileProps {
  branches: Branch[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onCreate: () => void;
  onEdit: (id: string) => void;
}

export const BranchesListMobile: React.FC<BranchesListMobileProps> = ({
  branches,
  loading,
  onCreate,
  onEdit,
}) => {
  const [search, setSearch] = useState('');

  const filtered = branches.filter(b => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.name?.toLowerCase().includes(q) ||
      b.code?.toLowerCase().includes(q) ||
      b.gstin?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '1rem',
      paddingBottom: '6rem',
      boxSizing: 'border-box',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Single Top Search Bar */}
      <div style={{ marginBottom: '1rem', position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', pointerEvents: 'none', zIndex: 1 }} />
        <Input
          placeholder="Search branches..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          containerStyle={{ marginBottom: 0, width: '100%' }}
          style={{ width: '100%', paddingLeft: '2.25rem' }}
        />
      </div>

      {/* Branch Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
          Loading branches...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          backgroundColor: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0'
        }}>
          <Building2 size={36} color="#94a3b8" style={{ margin: '0 auto 0.5rem' }} />
          <p style={{ margin: 0, color: '#1e293b', fontWeight: 600 }}>No branches found</p>
          <p style={{ margin: '0.25rem 0 0', color: '#64748b', fontSize: '0.825rem' }}>
            Tap the + button below to add a branch.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(b => (
            <div
              key={b.id}
              id={`row-${b.id}`}
              onClick={() => onEdit(b.id)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ flex: 1, minWidth: 0, paddingRight: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                  <span style={{
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {b.code}
                  </span>
                  {b.is_head_office && (
                    <span style={{
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      padding: '0.15rem 0.45rem',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 600
                    }}>
                      ★ Head Office
                    </span>
                  )}
                  {b.is_active ? (
                    <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem' }}>
                      <CheckCircle2 size={11} /> Active
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem' }}>
                      <XCircle size={11} /> Inactive
                    </span>
                  )}
                </div>

                <div style={{
                  color: '#0f172a',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {b.name}
                </div>

                {b.gstin && (
                  <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                    GSTIN: {b.gstin}
                  </div>
                )}
              </div>

              <ChevronRight size={18} color="#94a3b8" />
            </div>
          ))}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={onCreate}
        style={{
          position: 'fixed',
          bottom: '84px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 50
        }}
        aria-label="Create Branch"
      >
        <Plus size={26} />
      </button>
    </div>
  );
};
