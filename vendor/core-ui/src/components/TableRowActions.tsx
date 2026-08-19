import React from 'react';
import { ViewIcon, EditIcon, DeleteIcon } from './ActionIcons';

export interface TableRowActionsProps {
  onView?: (e: React.MouseEvent) => void;
  onEdit?: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  viewTitle?: string;
  editTitle?: string;
  deleteTitle?: string;
  viewDisabled?: boolean;
  editDisabled?: boolean;
  deleteDisabled?: boolean;
  size?: 'sm' | 'md';
  customActions?: React.ReactNode;
  style?: React.CSSProperties;
}

export const TableRowActions: React.FC<TableRowActionsProps> = ({
  onView,
  onEdit,
  onDelete,
  viewTitle = 'View Details',
  editTitle = 'Edit Record',
  deleteTitle = 'Delete Record',
  viewDisabled = false,
  editDisabled = false,
  deleteDisabled = false,
  size = 'sm',
  customActions,
  style
}) => {
  const iconSize = size === 'sm' ? 14 : 16;
  const padding = size === 'sm' ? '0.3rem 0.45rem' : '0.4rem 0.6rem';

  const baseBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding,
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#475569',
    cursor: 'pointer',
    transition: 'all 0.15s ease-in-out',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        justifyContent: 'center',
        ...style
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {onView && (
        <button
          type="button"
          onClick={onView}
          disabled={viewDisabled}
          title={viewTitle}
          style={{
            ...baseBtnStyle,
            opacity: viewDisabled ? 0.4 : 1,
            cursor: viewDisabled ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!viewDisabled) {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.borderColor = '#93c5fd';
            }
          }}
          onMouseLeave={(e) => {
            if (!viewDisabled) {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }
          }}
        >
          <ViewIcon width={iconSize} height={iconSize} />
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          disabled={editDisabled}
          title={editTitle}
          style={{
            ...baseBtnStyle,
            opacity: editDisabled ? 0.4 : 1,
            cursor: editDisabled ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!editDisabled) {
              e.currentTarget.style.backgroundColor = '#f1f5f9';
              e.currentTarget.style.color = '#0284c7';
              e.currentTarget.style.borderColor = '#7dd3fc';
            }
          }}
          onMouseLeave={(e) => {
            if (!editDisabled) {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.borderColor = '#cbd5e1';
            }
          }}
        >
          <EditIcon width={iconSize} height={iconSize} />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleteDisabled}
          title={deleteTitle}
          style={{
            ...baseBtnStyle,
            color: '#dc2626',
            borderColor: '#fca5a5',
            backgroundColor: '#fef2f2',
            opacity: deleteDisabled ? 0.4 : 1,
            cursor: deleteDisabled ? 'not-allowed' : 'pointer'
          }}
          onMouseEnter={(e) => {
            if (!deleteDisabled) {
              e.currentTarget.style.backgroundColor = '#fee2e2';
              e.currentTarget.style.color = '#b91c1c';
              e.currentTarget.style.borderColor = '#f87171';
            }
          }}
          onMouseLeave={(e) => {
            if (!deleteDisabled) {
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.borderColor = '#fca5a5';
            }
          }}
        >
          <DeleteIcon width={iconSize} height={iconSize} />
        </button>
      )}

      {customActions}
    </div>
  );
};
