import React, { useState, useMemo } from 'react';
import { Button, Input, DataTable, Column, Loader } from '@geeksman/core-ui';
import { Building2, Search, Plus, RefreshCw, Edit, Trash2, CheckCircle2, XCircle, ChevronRight, ChevronDown, Network, Table, Calendar, GitFork, Minus, ZoomIn, ZoomOut } from 'lucide-react';

import { Branch } from './BranchesList.types';
export type { Branch };

export interface BranchesListDesktopProps {
  branches: Branch[];
  loading: boolean;
  onRefresh: () => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onCreate: (parentBranchId?: string) => void;
  onEdit: (id: string) => void;
}

interface TreeNode {
  branch: Branch;
  children: TreeNode[];
}

export const BranchesListDesktop: React.FC<BranchesListDesktopProps> = ({
  branches,
  loading,
  onRefresh,
  onDelete,
  onCreate,
  onEdit,
}) => {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'tree' | 'chart'>('table');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [zoom, setZoom] = useState(1);

  const branchMap = useMemo(() => {
    const map: Record<string, Branch> = {};
    branches.forEach(b => {
      map[b.id] = b;
    });
    return map;
  }, [branches]);

  const filtered = useMemo(() => {
    return branches.filter(b => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      const parentBranch = b.parent_branch_id ? branchMap[b.parent_branch_id] : null;
      return (
        b.name?.toLowerCase().includes(q) ||
        b.code?.toLowerCase().includes(q) ||
        (b.gstin && b.gstin.toLowerCase().includes(q)) ||
        (parentBranch?.name && parentBranch.name.toLowerCase().includes(q)) ||
        (parentBranch?.code && parentBranch.code.toLowerCase().includes(q)) ||
        (b.is_head_office && ('head office'.includes(q) || 'root'.includes(q) || 'hq'.includes(q)))
      );
    });
  }, [branches, search, branchMap]);

  // Build hierarchical tree structure
  const treeRoots = useMemo(() => {
    const nodeMap: Record<string, TreeNode> = {};
    branches.forEach(b => {
      nodeMap[b.id] = { branch: b, children: [] };
    });

    const roots: TreeNode[] = [];
    branches.forEach(b => {
      const node = nodeMap[b.id];
      if (b.parent_branch_id && nodeMap[b.parent_branch_id]) {
        nodeMap[b.parent_branch_id].children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [branches]);

  const toggleExpand = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !(prev[id] ?? true) }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    branches.forEach(b => {
      all[b.id] = true;
    });
    setExpandedNodes(all);
  };

  const collapseAll = () => {
    const all: Record<string, boolean> = {};
    branches.forEach(b => {
      all[b.id] = false;
    });
    setExpandedNodes(all);
  };

  const getHolidaysCount = (holidayCalendarRaw?: string) => {
    try {
      return holidayCalendarRaw ? JSON.parse(holidayCalendarRaw).length : 0;
    } catch {
      return 0;
    }
  };

  // DataTable columns definition for standard DataList / Table View
  const columns: Column<Branch>[] = [
    {
      key: 'code',
      label: 'Code',
      sortable: true,
      width: '100px',
      render: (_, b) => (
        <span style={{
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          padding: '0.2rem 0.55rem',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.025em',
          fontFamily: 'monospace'
        }}>
          {b.code}
        </span>
      )
    },
    {
      key: 'name',
      label: 'Branch Name',
      sortable: true,
      width: '240px',
      render: (_, b) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: '#0f172a' }}>
          <Building2 size={16} color={b.is_head_office ? '#d97706' : '#2563eb'} />
          <span>{b.name}</span>
        </div>
      )
    },
    {
      key: 'hierarchy',
      label: 'Hierarchy & Parent',
      width: '240px',
      render: (_, b) => {
        const parentBranch = b.parent_branch_id ? branchMap[b.parent_branch_id] : null;
        if (b.is_head_office) {
          return (
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#fef3c7',
              color: '#92400e',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              ★ Head Office (Root)
            </span>
          );
        }
        if (parentBranch) {
          return (
            <span style={{ fontSize: '0.8rem', color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <GitFork size={13} color="#64748b" /> Sub of <strong>{parentBranch.name}</strong> ({parentBranch.code})
            </span>
          );
        }
        return <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Primary Branch</span>;
      }
    },
    {
      key: 'holidays',
      label: 'Holidays',
      width: '140px',
      render: (_, b) => {
        const count = getHolidaysCount(b.holiday_calendar);
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.775rem',
            color: count > 0 ? '#1e40af' : '#64748b',
            backgroundColor: count > 0 ? '#dbeafe' : '#f1f5f9',
            padding: '0.2rem 0.5rem',
            borderRadius: '6px',
            fontWeight: 500
          }}>
            <Calendar size={13} /> {count} Holiday{count === 1 ? '' : 's'}
          </span>
        );
      }
    },
    {
      key: 'gstin',
      label: 'GSTIN',
      width: '160px',
      render: (_, b) => (
        <span style={{ color: '#475569', fontFamily: 'monospace', fontSize: '0.825rem' }}>
          {b.gstin || '-'}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (_, b) => (
        b.is_active ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontSize: '0.775rem', fontWeight: 600 }}>
            <CheckCircle2 size={13} /> Active
          </span>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8', fontSize: '0.775rem', fontWeight: 500 }}>
            <XCircle size={13} /> Inactive
          </span>
        )
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '110px',
      align: 'center',
      render: (_, b) => (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onEdit(b.id)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.35rem',
              cursor: 'pointer',
              color: '#475569',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Edit Branch"
          >
            <Edit size={16} />
          </button>
          {!b.is_head_office ? (
            <button
              type="button"
              onClick={(e) => onDelete(b.id, e)}
              style={{
                background: 'none',
                border: 'none',
                padding: '0.35rem',
                cursor: 'pointer',
                color: '#ef4444',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Delete Branch"
            >
              <Trash2 size={16} />
            </button>
          ) : (
            <span style={{ width: '28px', display: 'inline-block' }} />
          )}
        </div>
      )
    }
  ];

  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const b = node.branch;
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedNodes[b.id] ?? true;
    const parentBranch = b.parent_branch_id ? branchMap[b.parent_branch_id] : null;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchesSelf = (
        b.name?.toLowerCase().includes(q) ||
        b.code?.toLowerCase().includes(q) ||
        (b.gstin && b.gstin.toLowerCase().includes(q)) ||
        (parentBranch?.name && parentBranch.name.toLowerCase().includes(q)) ||
        (parentBranch?.code && parentBranch.code.toLowerCase().includes(q)) ||
        (b.is_head_office && ('head office'.includes(q) || 'root'.includes(q) || 'hq'.includes(q)))
      );
      const matchesChild = node.children.some(c => {
        const cb = c.branch;
        const cParent = cb.parent_branch_id ? branchMap[cb.parent_branch_id] : null;
        return (
          cb.name?.toLowerCase().includes(q) ||
          cb.code?.toLowerCase().includes(q) ||
          (cb.gstin && cb.gstin.toLowerCase().includes(q)) ||
          (cParent?.name && cParent.name.toLowerCase().includes(q)) ||
          (cParent?.code && cParent.code.toLowerCase().includes(q))
        );
      });
      if (!matchesSelf && !matchesChild) return null;
    }

    const holidaysCount = getHolidaysCount(b.holiday_calendar);

    return (
      <React.Fragment key={b.id}>
        <tr
          id={`row-${b.id}`}
          onClick={() => onEdit(b.id)}
          style={{
            borderBottom: '1px solid #f1f5f9',
            cursor: 'pointer',
            backgroundColor: depth === 0 ? '#ffffff' : depth === 1 ? '#f8fafc' : '#f1f5f9',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = depth === 0 ? '#ffffff' : depth === 1 ? '#f8fafc' : '#f1f5f9')}
        >
          {/* Tree Node Branch Name with Indentation */}
          <td style={{ padding: '0.875rem 1.25rem', paddingLeft: `${1.25 + depth * 2.25}rem`, fontWeight: 600, color: '#0f172a' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {depth > 0 && (
                <span style={{ color: '#cbd5e1', fontWeight: 400, fontFamily: 'monospace' }}>
                  └──
                </span>
              )}
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => toggleExpand(b.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.2rem',
                    color: '#64748b'
                  }}
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              ) : (
                <span style={{ width: '16px', display: 'inline-block' }} />
              )}
              <Building2 size={16} color={b.is_head_office ? '#d97706' : '#2563eb'} />
              <span>{b.name}</span>
            </div>
          </td>

          {/* Branch Code */}
          <td style={{ padding: '0.875rem 1.25rem' }}>
            <span style={{
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              fontFamily: 'monospace'
            }}>
              {b.code}
            </span>
          </td>

          {/* Hierarchy Level */}
          <td style={{ padding: '0.875rem 1.25rem' }}>
            {b.is_head_office ? (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#fef3c7',
                color: '#92400e',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                ★ Head Office (Root)
              </span>
            ) : parentBranch ? (
              <span style={{ fontSize: '0.8rem', color: '#475569' }}>
                ↳ Sub of <strong>{parentBranch.name}</strong> ({parentBranch.code})
              </span>
            ) : (
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Primary Branch</span>
            )}
          </td>

          {/* Holiday Calendar */}
          <td style={{ padding: '0.875rem 1.25rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.775rem',
              color: holidaysCount > 0 ? '#1e40af' : '#64748b',
              backgroundColor: holidaysCount > 0 ? '#dbeafe' : '#f1f5f9',
              padding: '0.2rem 0.5rem',
              borderRadius: '6px',
              fontWeight: 500
            }}>
              <Calendar size={13} /> {holidaysCount} Holiday{holidaysCount === 1 ? '' : 's'}
            </span>
          </td>

          {/* GSTIN */}
          <td style={{ padding: '0.875rem 1.25rem', color: '#475569', fontFamily: 'monospace', fontSize: '0.825rem' }}>
            {b.gstin || '-'}
          </td>

          {/* Status */}
          <td style={{ padding: '0.875rem 1.25rem' }}>
            {b.is_active ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#16a34a', fontSize: '0.775rem', fontWeight: 600 }}>
                <CheckCircle2 size={13} /> Active
              </span>
            ) : (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#94a3b8', fontSize: '0.775rem', fontWeight: 500 }}>
                <XCircle size={13} /> Inactive
              </span>
            )}
          </td>

          {/* Actions */}
          <td style={{ padding: '0.875rem 1.25rem', textAlign: 'center', width: '110px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onEdit(b.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0.35rem',
                  cursor: 'pointer',
                  color: '#475569',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Edit Branch"
              >
                <Edit size={16} />
              </button>
              {!b.is_head_office ? (
                <button
                  type="button"
                  onClick={(e) => onDelete(b.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.35rem',
                    cursor: 'pointer',
                    color: '#ef4444',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Delete Branch"
                >
                  <Trash2 size={16} />
                </button>
              ) : (
                <span style={{ width: '28px', display: 'inline-block' }} />
              )}
            </div>
          </td>
        </tr>

        {/* Render child tree nodes recursively if expanded */}
        {hasChildren && isExpanded && (
          node.children.map(child => renderTreeNode(child, depth + 1))
        )}
      </React.Fragment>
    );
  };

  const renderChartNode = (node: TreeNode, parentSiblingCount = 0, siblingIndex = 0) => {
    const b = node.branch;
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[b.id] ?? true;
    const parentBranch = b.parent_branch_id ? branchMap[b.parent_branch_id] : null;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesSelf = b.name?.toLowerCase().includes(q) || b.code?.toLowerCase().includes(q) || b.gstin?.toLowerCase().includes(q);
      const matchesDescendant = (n: TreeNode): boolean => {
        return n.children.some(c => {
          const m = c.branch.name?.toLowerCase().includes(q) || c.branch.code?.toLowerCase().includes(q);
          return m || matchesDescendant(c);
        });
      };
      if (!matchesSelf && !matchesDescendant(node)) return null;
    }

    const holidaysCount = getHolidaysCount(b.holiday_calendar);

    return (
      <div
        key={`chart-${b.id}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          margin: '0 16px',
        }}
      >
        {/* Horizontal connector line across siblings */}
        {parentSiblingCount > 1 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: siblingIndex === 0 ? '50%' : 0,
              right: siblingIndex === parentSiblingCount - 1 ? '50%' : 0,
              height: '2px',
              backgroundColor: '#cbd5e1',
            }}
          />
        )}
        {/* Vertical drop line down to this card */}
        {parentSiblingCount > 0 && (
          <div style={{ width: '2px', height: '20px', backgroundColor: '#cbd5e1' }} />
        )}

        {/* Node Card */}
        <div
          id={`chart-node-${b.id}`}
          style={{
            border: b.is_head_office ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1rem',
            backgroundColor: '#ffffff',
            boxShadow: b.is_head_office ? '0 4px 12px rgba(245,158,11,0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
            width: '210px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
            transition: 'all 0.2s ease',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#3b82f6';
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(59,130,246,0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = b.is_head_office ? '#fde68a' : '#e2e8f0';
            e.currentTarget.style.boxShadow = b.is_head_office ? '0 4px 12px rgba(245,158,11,0.1)' : '0 2px 8px rgba(0,0,0,0.04)';
          }}
        >
          {/* Active status indicator dot */}
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: b.is_active ? '#22c55e' : '#ef4444',
            }}
            title={b.is_active ? 'Active Branch' : 'Inactive Branch'}
          />

          {/* Branch 3D/Styled Icon */}
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: b.is_head_office ? '#fef3c7' : '#eff6ff',
              border: `1px solid ${b.is_head_office ? '#fde68a' : '#bfdbfe'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '8px',
            }}
          >
            <Building2 size={22} color={b.is_head_office ? '#d97706' : '#2563eb'} />
          </div>

          {/* Branch Name */}
          <div
            onClick={() => onEdit(b.id)}
            style={{
              fontWeight: 700,
              color: '#0f172a',
              fontSize: '0.875rem',
              textAlign: 'center',
              wordBreak: 'break-word',
              minHeight: '1.25rem',
              cursor: 'pointer',
              lineHeight: 1.3,
            }}
            title="Click to edit branch"
          >
            {b.name}
          </div>

          {/* Branch Code */}
          <div
            style={{
              fontSize: '0.72rem',
              color: '#2563eb',
              backgroundColor: '#eff6ff',
              padding: '2px 8px',
              borderRadius: '4px',
              marginTop: '5px',
              fontWeight: 700,
              fontFamily: 'monospace',
            }}
          >
            {b.code}
          </div>

          {/* Hierarchy Level Badge */}
          <div style={{ marginTop: '6px' }}>
            {b.is_head_office ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                }}
              >
                ★ Head Office
              </span>
            ) : parentBranch ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                }}
              >
                Sub of {parentBranch.code}
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#f8fafc',
                  color: '#64748b',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.68rem',
                  fontWeight: 500,
                }}
              >
                Primary Branch
              </span>
            )}
          </div>

          {/* Holidays count info */}
          {holidaysCount > 0 && (
            <div
              style={{
                fontSize: '0.68rem',
                color: '#64748b',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Calendar size={11} /> {holidaysCount} Holidays
            </div>
          )}

          {/* Card Action Buttons (just like locations) */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              marginTop: '10px',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '8px',
              width: '100%',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={() => onCreate(b.id)}
              title="Add Sub-Branch"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#4f46e5',
                padding: '2px 6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eef2ff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              + Child
            </button>
            <button
              type="button"
              onClick={() => onEdit(b.id)}
              title="Edit Branch"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#475569',
                padding: '2px 6px',
                fontSize: '0.72rem',
                fontWeight: 600,
                borderRadius: '4px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              Edit
            </button>
            {!b.is_head_office && (
              <button
                type="button"
                onClick={(e) => onDelete(b.id, e)}
                title="Delete Branch"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#ef4444',
                  padding: '2px 6px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Delete
              </button>
            )}
          </div>

          {/* + / - Button to go deeper or collapse */}
          {hasChildren && (
            <button
              type="button"
              onClick={(e) => toggleExpand(b.id, e)}
              title={isExpanded ? 'Collapse sub-branches (-)' : `Go deeper: Expand ${node.children.length} sub-branches (+)`}
              style={{
                position: 'absolute',
                bottom: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: isExpanded ? '#2563eb' : '#3b82f6',
                border: '2px solid #ffffff',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(37,99,235,0.3)',
                zIndex: 3,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(1.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
              }}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}

          {/* Collapsed counter badge */}
          {hasChildren && !isExpanded && (
            <div
              onClick={(e) => toggleExpand(b.id, e)}
              title="Click to go deeper (+)"
              style={{
                position: 'absolute',
                bottom: '-34px',
                left: '50%',
                transform: 'translateX(-50%)',
                whiteSpace: 'nowrap',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#2563eb',
                backgroundColor: '#eff6ff',
                padding: '2px 8px',
                borderRadius: '9999px',
                border: '1px solid #bfdbfe',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                zIndex: 3,
              }}
            >
              +{node.children.length} {node.children.length > 1 ? 'branches' : 'branch'}
            </div>
          )}
        </div>

        {/* Vertical connector line leading to children when expanded */}
        {hasChildren && isExpanded && (
          <div style={{ width: '2px', height: '24px', backgroundColor: '#cbd5e1' }} />
        )}

        {/* Children row */}
        {hasChildren && isExpanded && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'center',
              width: '100%',
              gap: 0,
            }}
          >
            {node.children.map((child, idx) =>
              renderChartNode(child, node.children.length, idx)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '1.5rem 2rem',
      boxSizing: 'border-box',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Integrated Toolbar with View Switcher */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, maxWidth: '400px' }}>
          <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', pointerEvents: 'none', zIndex: 1 }} />
          <Input
            placeholder="Search branches by code, name, parent, GSTIN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            containerStyle={{ marginBottom: 0, width: '100%' }}
            style={{ width: '100%', paddingLeft: '2.25rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* View Mode Toggle Switch */}
          <div style={{
            display: 'inline-flex',
            backgroundColor: '#e2e8f0',
            padding: '3px',
            borderRadius: '8px',
            gap: '2px'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: viewMode === 'table' ? '#ffffff' : 'transparent',
                color: viewMode === 'table' ? '#2563eb' : '#64748b',
                boxShadow: viewMode === 'table' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <Table size={15} /> Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tree')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: viewMode === 'tree' ? '#ffffff' : 'transparent',
                color: viewMode === 'tree' ? '#2563eb' : '#64748b',
                boxShadow: viewMode === 'tree' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <Network size={15} /> Tree View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('chart')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: viewMode === 'chart' ? '#ffffff' : 'transparent',
                color: viewMode === 'chart' ? '#2563eb' : '#64748b',
                boxShadow: viewMode === 'chart' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
              }}
            >
              <GitFork size={15} /> Chart View
            </button>
          </div>

          {/* Expand/Collapse All + Zoom Controls when in Tree or Chart View */}
          {(viewMode === 'chart' || viewMode === 'tree') && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={expandAll}
                title="Expand all branches to deepest level (+)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <Plus size={13} /> Expand All
              </button>
              <button
                type="button"
                onClick={collapseAll}
                title="Collapse all branches (-)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#1e293b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              >
                <Minus size={13} /> Collapse All
              </button>
              {viewMode === 'chart' && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', marginLeft: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
                    title="Zoom In"
                    style={{
                      padding: '0.35rem 0.5rem',
                      borderRadius: '6px 0 0 6px',
                      border: '1px solid #cbd5e1',
                      borderRight: 'none',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    title="Reset Zoom"
                    style={{
                      padding: '0.35rem 0.5rem',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      cursor: 'pointer',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                    }}
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}
                    title="Zoom Out"
                    style={{
                      padding: '0.35rem 0.5rem',
                      borderRadius: '0 6px 6px 0',
                      border: '1px solid #cbd5e1',
                      borderLeft: 'none',
                      backgroundColor: '#ffffff',
                      color: '#475569',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <ZoomOut size={13} />
                  </button>
                </div>
              )}
            </div>
          )}

          <Button
            variant="secondary"
            onClick={onRefresh}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </Button>

          <Button
            variant="primary"
            onClick={() => onCreate()}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={16} />
            + Create Branch
          </Button>
        </div>
      </div>

      {/* Render DataList DataTable, Hierarchical Tree View, or Chart View */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          hideSearch={true}
          hideFilterRow={true}
          onRowClick={(row) => onEdit(row.id)}
        />
      ) : viewMode === 'tree' ? (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                <th style={{ padding: '0.875rem 1.25rem' }}>Branch Hierarchy</th>
                <th style={{ padding: '0.875rem 1.25rem' }}>Code</th>
                <th style={{ padding: '0.875rem 1.25rem' }}>Hierarchy Level</th>
                <th style={{ padding: '0.875rem 1.25rem' }}>Holidays</th>
                <th style={{ padding: '0.875rem 1.25rem' }}>GSTIN</th>
                <th style={{ padding: '0.875rem 1.25rem' }}>Status</th>
                <th style={{ padding: '0.875rem 1.25rem', textAlign: 'center', width: '110px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                    <Loader message="Loading branch hierarchy..." size="sm" variant="spinner" />
                  </td>
                </tr>
              ) : treeRoots.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                    <Building2 size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
                    <p style={{ margin: '0 0 0.5rem', color: '#1e293b', fontWeight: 600, fontSize: '1rem' }}>No branches found</p>
                  </td>
                </tr>
              ) : (
                treeRoots.map(rootNode => renderTreeNode(rootNode, 0))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem 1.5rem',
          overflowX: 'auto',
          overflowY: 'auto',
          minHeight: '520px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <Loader message="Loading branch chart..." size="sm" variant="spinner" />
            </div>
          ) : treeRoots.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <Building2 size={40} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ margin: '0 0 0.5rem', color: '#1e293b', fontWeight: 600, fontSize: '1rem' }}>No branches found</p>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: '36px',
                minWidth: 'fit-content',
                padding: '1.5rem',
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease',
              }}
            >
              {treeRoots.map(rootNode => renderChartNode(rootNode, 0, 0))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
