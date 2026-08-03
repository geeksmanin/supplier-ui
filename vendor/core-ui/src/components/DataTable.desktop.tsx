import React, { useRef, useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Loader } from './Loader';
import { apiClient } from '../api/client';
import { isDesktopEnvironment } from '../utils/downloader';

interface DebouncedFilterInputProps {
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
}

const DebouncedFilterInput: React.FC<DebouncedFilterInputProps> = ({ value, placeholder, onChange }) => {
  const [localVal, setLocalVal] = useState(value || '');
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setLocalVal(value || '');
  }, [value]);

  useEffect(() => {
    if (localVal === (value || '')) return;
    const handler = setTimeout(() => {
      onChangeRef.current(localVal);
    }, 500);
    return () => clearTimeout(handler);
  }, [localVal, value]);

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      style={{
        width: '100%',
        padding: '6px 10px 6px 24px',
        fontSize: '0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        outline: 'none',
        backgroundColor: '#ffffff',
        boxSizing: 'border-box',
        color: '#374151',
        fontWeight: 'normal',
        transition: 'border-color 0.15s ease'
      }}
    />
  );
};

export interface Column<T = any> {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  textTransformNone?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (val: any, row: T, idx: number) => React.ReactNode;
  filterType?: 'text' | 'select' | 'none';
  filterOptions?: (string | { label: string; value: string })[];
  filterPlaceholder?: string;
  filterRender?: (columnFilters: Record<string, string>, setColumnFilters: (filters: Record<string, string>) => void) => React.ReactNode;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  searchVal?: string;
  setSearchVal?: (val: string) => void;
  hideSearch?: boolean;
  searchPlaceholder?: string;
  searchShortcutLabel?: string;
  pageSize: number;
  setPageSize: (size: number) => void;
  pageSizeOptions?: number[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalItems: number;
  onRefresh?: () => void;
  actionButton?: React.ReactNode;
  filterDropdowns?: React.ReactNode;
  loading?: boolean;

  // Lifting states for backend-powered filtering
  columnFilters?: Record<string, string>;
  setColumnFilters?: (filters: Record<string, string>) => void;
  sortConfig?: { key: string; direction: 'asc' | 'desc' } | null;
  setSortConfig?: (sort: { key: string; direction: 'asc' | 'desc' } | null) => void;
  onRowClick?: (row: T) => void;
  onResetAll?: () => void;
  hideSerialNumberColumn?: boolean;
  hideAutoActionColumn?: boolean;
  hideFilterRow?: boolean;
  onExportAll?: () => Promise<any[]>;
}

export const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  searchVal = '',
  setSearchVal = () => {},
  hideSearch = false,
  searchPlaceholder = "Search...",
  searchShortcutLabel,
  pageSize,
  setPageSize,
  pageSizeOptions = [10, 20, 50, 100],
  currentPage,
  setCurrentPage,
  totalItems,
  onRefresh,
  actionButton,
  filterDropdowns,
  loading = false,
  columnFilters: propColumnFilters,
  setColumnFilters: propSetColumnFilters,
  sortConfig: propSortConfig,
  setSortConfig: propSetSortConfig,
  onRowClick,
  onResetAll,
  hideSerialNumberColumn = false,
  hideAutoActionColumn = false,
  hideFilterRow = false,
  onExportAll,
}) => {
  const localSearchInputRef = useRef<HTMLInputElement>(null);
  const [detectedShortcut, setDetectedShortcut] = useState('⌘/');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (exportDropdownOpen && exportDropdownRef.current && !exportDropdownRef.current.contains(e.target as Node)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [exportDropdownOpen]);

  const [openSelectCol, setOpenSelectCol] = useState<string | null>(null);

  const [exportingAll, setExportingAll] = useState(false);

  const exportDataList = async (exportData: any[]) => {
    try {
      const exportCols = columns.filter(col => col.key !== 'action' && col.key !== 'actions' && col.key !== 'index');
      const headers = exportCols.map(col => col.label);
      const rows = exportData.map((row, rowIdx) => {
        const rowData: Record<string, any> = {};
        exportCols.forEach(col => {
          let val = (row as any)[col.key];
          if (col.render) {
            const rendered = col.render(val, row, rowIdx);
            if (typeof rendered === 'string' || typeof rendered === 'number') {
              val = rendered;
            } else if (React.isValidElement(rendered)) {
              const extractText = (el: any): string => {
                if (!el) return '';
                if (typeof el === 'string' || typeof el === 'number') return String(el);
                if (Array.isArray(el)) return el.map(extractText).join(' ');
                if (el.props && el.props.children) {
                  return extractText(el.props.children);
                }
                return '';
              };
              val = extractText(rendered);
            }
          }
          rowData[col.label] = val === undefined || val === null ? '' : val;
        });
        return rowData;
      });

      const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Exported Data');
      
      const b64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });
      const rand = Math.floor(1000 + Math.random() * 9000);
      const filename = `DataTable_Export_${new Date().toISOString().slice(0, 10)}_${rand}.xlsx`;

      if (!isDesktopEnvironment()) {
        XLSX.writeFile(workbook, filename);
        return;
      }

      apiClient.post('/runtime/save-file', {
        filename: filename,
        content: b64,
        is_base64: true
      })
        .then((res) => {
          if (res.data?.cancelled) {
            return;
          }
          const path = res.data?.data?.path || res.data?.path || '';
          alert(`File exported successfully:\n${path}`);
        })
        .catch((err) => {
          alert('Error during backend save: ' + (err.message || err));
          console.warn('Native save failed, falling back to browser write:', err);
          XLSX.writeFile(workbook, filename);
        });
    } catch (err: any) {
      alert('Failed to export: ' + (err.message || err));
    }
  };

  const handleClientExport = () => {
    exportDataList(data);
  };

  const handleExportAll = async () => {
    if (!onExportAll) return;
    setExportingAll(true);
    try {
      const allData = await onExportAll();
      await exportDataList(allData);
    } catch (err: any) {
      alert('Failed to fetch all data for export: ' + (err.message || err));
    } finally {
      setExportingAll(false);
    }
  };
  const [selectQuery, setSelectQuery] = useState('');

  const [localSearchVal, setLocalSearchVal] = useState(searchVal || '');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const setSearchValRef = useRef(setSearchVal);
  const setCurrentPageRef = useRef(setCurrentPage);
  const searchValRef = useRef(searchVal || '');
  const prevSearchValRef = useRef(searchVal);

  useEffect(() => {
    setSearchValRef.current = setSearchVal;
  }, [setSearchVal]);

  useEffect(() => {
    setCurrentPageRef.current = setCurrentPage;
  }, [setCurrentPage]);

  // Keep local search input in sync if cleared or changed from outside
  useEffect(() => {
    if (searchVal !== prevSearchValRef.current) {
      setLocalSearchVal(searchVal || '');
      searchValRef.current = searchVal || '';
      prevSearchValRef.current = searchVal;
    }
  }, [searchVal]);

  const commitSearch = (val: string) => {
    if (val === (searchValRef.current || '')) return;
    searchValRef.current = val;
    setSearchValRef.current(val);
    setCurrentPageRef.current(1);
  };

  // Debounce effect to update parent search state after user stops typing
  useEffect(() => {
    if (localSearchVal === (searchVal || '')) return;
    const handler = setTimeout(() => {
      commitSearch(localSearchVal);
    }, 500);
    return () => clearTimeout(handler);
  }, [localSearchVal, searchVal]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }
      if (!target.closest('.select-dropdown-container')) {
        setOpenSelectCol(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect OS for shortcut label
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent || '';
      const platform = (window.navigator as any).platform || '';
      const userAgentDataPlatform = (window.navigator as any).userAgentData?.platform || '';
      const isMac = /Mac|iPod|iPhone|iPad/i.test(ua) ||
        /Mac|iPod|iPhone|iPad/i.test(platform) ||
        /Mac/i.test(userAgentDataPlatform);
      setDetectedShortcut(isMac ? '⌘/' : 'Ctrl+/');
    }
  }, []);

  // Focus input on shortcut keydown (e.g. Cmd+/ or Ctrl+/)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        localSearchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const processedColumns = React.useMemo(() => {
    let result = [...columns];
    const hasSNo = columns.some(col => {
      const k = col.key.toLowerCase().replace(/[\s_\.]/g, '');
      const l = (col.label || '').toLowerCase().replace(/[\s_\.]/g, '');
      return k === 'sno' || k === 'index' || l === 'sno' || l === 'index';
    });
    if (!hasSNo && !hideSerialNumberColumn) {
      result.unshift({
        key: 's_no',
        label: 'S. No',
        width: '60px',
        sortable: false,
        textTransformNone: false,
        filterType: 'none' as const,
        filterPlaceholder: '',
        filterOptions: [],
        render: (_val: any, _row: any, idx: number) => {
          const currentPageNum = Number(currentPage) || 1;
          const pageSizeNum = Number(pageSize) || 25;
          return (currentPageNum - 1) * pageSizeNum + idx + 1;
        }
      });
    }
    const hasFiltersOrSorts = result.some(col => (col.filterType && col.filterType !== 'none') || col.sortable);
    const hasAction = result.some(col => col.key === 'action' || col.key === 'actions');
    if (hasFiltersOrSorts && !hasAction && !hideAutoActionColumn) {
      result.push({
        key: 'action',
        label: 'Actions',
        align: 'center' as const,
        width: '100px',
        sortable: false,
        textTransformNone: false,
        filterType: 'none' as const,
        filterPlaceholder: '',
        filterOptions: [],
        render: () => null // Default rendering returns null, but custom columns list can override it.
      });
    }
    return result;
  }, [columns, currentPage, pageSize, hideAutoActionColumn, hideSerialNumberColumn]);

  // Lift or declare state for filters
  const [internalColumnFilters, setInternalColumnFilters] = useState<Record<string, string>>({});
  const columnFilters = propColumnFilters !== undefined ? propColumnFilters : internalColumnFilters;
  const setColumnFilters = propSetColumnFilters !== undefined ? propSetColumnFilters : setInternalColumnFilters;



  // Lift or declare state for sorting
  const [internalSortConfig, setInternalSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'created_at', direction: 'desc' });
  const sortConfig = propSortConfig !== undefined ? propSortConfig : internalSortConfig;
  const setSortConfig = propSetSortConfig !== undefined ? propSetSortConfig : setInternalSortConfig;

  // Local column filtering
  const filteredData = React.useMemo(() => {
    // If backend-powered filters are enabled, we do not filter locally
    if (propSetColumnFilters) return data;

    return data.filter(row => {
      for (const col of columns) {
        if (!col.filterType || col.filterType === 'none') continue;
        const filterVal = columnFilters[col.key];
        if (filterVal === undefined || filterVal === '') continue;

        let rawVal = row[col.key];
        // handle nested structure or custom formatting
        if (rawVal && typeof rawVal === 'object' && rawVal.name) {
          rawVal = rawVal.name;
        }
        const rowVal = String(rawVal !== undefined && rawVal !== null ? rawVal : '').toLowerCase();
        const searchStr = filterVal.toLowerCase();

        if (col.filterType === 'text') {
          if (!rowVal.includes(searchStr)) {
            return false;
          }
        } else if (col.filterType === 'select') {
          if (rowVal !== searchStr) {
            return false;
          }
        }
      }
      return true;
    });
  }, [data, columns, columnFilters, propSetColumnFilters]);

  // Local sorting
  const sortedData = React.useMemo(() => {
    // If backend-powered sorting is enabled, we do not sort locally
    if (propSetSortConfig) return filteredData;

    if (!sortConfig) return filteredData;

    return [...filteredData].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      // Handle date fields sorting
      if (sortConfig.key === 'created_at' || sortConfig.key === 'expiry' || sortConfig.key === 'updated_at') {
        const aTime = aVal ? new Date(aVal).getTime() : 0;
        const bTime = bVal ? new Date(bVal).getTime() : 0;
        return sortConfig.direction === 'asc' ? aTime - bTime : bTime - aTime;
      }

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      const aStr = String(aVal).toLowerCase();
      const bStr = String(bVal).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, propSetSortConfig]);

  const handleSort = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      setSortConfig({ key, direction: 'asc' });
    } else if (sortConfig.direction === 'asc') {
      setSortConfig({ key, direction: 'desc' });
    } else {
      setSortConfig(null);
    }
  };

  const handleResetAll = () => {
    if (onResetAll) {
      onResetAll();
    } else {
      setColumnFilters({});
      setLocalSearchVal('');
      searchValRef.current = '';
      setSearchVal('');
      setSortConfig(null);
      setCurrentPage(1);
    }
  };

  const isServerPaged = totalItems !== undefined && totalItems > data.length && !propSetColumnFilters && Object.keys(columnFilters).length === 0 && !sortConfig;
  const activeTotalItems = (propSetColumnFilters || isServerPaged) ? totalItems : sortedData.length;
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = (propSetColumnFilters || isServerPaged) ? (startIdx + data.length) : Math.min(startIdx + pageSize, sortedData.length);

  const displayData = React.useMemo(() => {
    if (propSetColumnFilters || isServerPaged) {
      return sortedData; // already filtered and paginated by backend
    }
    return sortedData.slice(startIdx, endIdx);
  }, [sortedData, startIdx, endIdx, data.length, pageSize, totalItems, columnFilters, sortConfig, propSetColumnFilters, isServerPaged]);

  // Reset highlight index when displayed data changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [displayData]);

  // Handle j/k navigation, / search focus, Enter to select row, and Esc to blur
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        (activeEl as HTMLElement).isContentEditable
      );

      // Focus search input on '/' when not in input
      if (e.key === '/' && !isInputFocused) {
        e.preventDefault();
        localSearchInputRef.current?.focus();
        localSearchInputRef.current?.select();
        return;
      }

      // Escape key to blur search input
      if (e.key === 'Escape' && activeEl === localSearchInputRef.current) {
        localSearchInputRef.current?.blur();
        return;
      }

      if (isInputFocused) return;

      if (e.key === 'j' || e.key === 'ArrowDown') {
        if (displayData.length > 0) {
          e.preventDefault();
          setHighlightedIndex(prev => {
            const next = prev + 1;
            return next >= displayData.length ? displayData.length - 1 : next;
          });
        }
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        if (displayData.length > 0) {
          e.preventDefault();
          setHighlightedIndex(prev => {
            const next = prev - 1;
            return next < 0 ? 0 : next;
          });
        }
      } else if (e.key === 'Enter') {
        if (highlightedIndex >= 0 && highlightedIndex < displayData.length) {
          if (onRowClick) {
            e.preventDefault();
            onRowClick(displayData[highlightedIndex]);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayData, highlightedIndex, onRowClick]);

  const activeShortcutLabel = searchShortcutLabel !== undefined ? searchShortcutLabel : detectedShortcut;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minHeight: 0 }}>
      {/* Search and Action Row */}
      {!hideSearch && (
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', width: '100%' }}>
        <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
          <svg
            style={{ position: 'absolute', left: '12px', width: '14px', height: '14px', color: '#9ca3af', pointerEvents: 'none' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={localSearchInputRef}
            type="text"
            placeholder={searchPlaceholder}
            value={localSearchVal}
            onChange={(e) => {
              setLocalSearchVal(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                commitSearch(localSearchVal);
              }
            }}
            style={{
              padding: '0.5rem 5.5rem 0.5rem 2.25rem', // increase right padding to accommodate both shortcut and reset button
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.85rem',
              width: '100%',
              outline: 'none',
              backgroundColor: '#ffffff',
              boxSizing: 'border-box'
            }}
          />
          {/* Reset Filters / Clear Search button */}
          {(localSearchVal || searchVal || Object.values(columnFilters).some(v => v !== '') || sortConfig) && (
            <button
              onClick={handleResetAll}
              style={{
                position: 'absolute',
                right: activeShortcutLabel ? '56px' : '12px',
                fontSize: '0.75rem',
                color: '#ef4444',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '2px'
              }}
              title="Reset all filters and search"
            >
              Clear
            </button>
          )}
          {activeShortcutLabel && (
            <span style={{
              position: 'absolute',
              right: '12px',
              fontSize: '0.7rem',
              color: '#9ca3af',
              fontWeight: 600,
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              padding: '0.1rem 0.3rem',
              backgroundColor: '#f9fafb'
            }}>
              {activeShortcutLabel}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {filterDropdowns}
          <button
            onClick={() => onRefresh ? onRefresh() : window.location.reload()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #bfdbfe',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#eff6ff',
              cursor: 'pointer',
              fontSize: '1rem',
              color: '#2563eb'
            }}
            title="Refresh"
            disabled={loading}
          >
            ↻
          </button>
          {actionButton}
        </div>
      </div>
      )}

      {/* Items count metadata */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem', fontWeight: 500 }}>
        <span>Showing {activeTotalItems === 0 ? 0 : startIdx + 1}-{endIdx} of {activeTotalItems} Items</span>
        <span style={{ cursor: 'pointer' }}>Showing {processedColumns.length} of {processedColumns.length} columns ▾</span>
      </div>

      {/* Table Container */}
      <div style={{ overflow: 'auto', flex: 1, minHeight: 0, maxHeight: '600px', border: '1px solid #e5e7eb', borderRadius: '14px' }}>
        <table className="erp-table erp-table-sticky-header" style={{ margin: 0, border: 'none' }}>
          <thead>
            <tr>
              {processedColumns.map((col) => {
                const isAction = col.key === 'action';
                return (
                  <th
                    key={col.key}
                    className={isAction ? 'sticky-action-header' : undefined}
                    style={{
                      width: col.width,
                      textTransform: col.textTransformNone ? 'none' : 'capitalize',
                      textAlign: col.align || 'left',
                      userSelect: 'none'
                    }}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.key)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          cursor: 'pointer',
                          userSelect: 'none',
                          background: 'transparent',
                          border: 'none',
                          padding: 0,
                          color: 'inherit',
                          font: 'inherit'
                        }}
                      >
                        {col.label}
                        <span style={{ fontSize: '0.7rem', color: sortConfig?.key === col.key ? '#2563eb' : '#94a3b8', lineHeight: 1 }}>
                          {sortConfig?.key === col.key
                            ? sortConfig.direction === 'asc' ? '▲' : '▼'
                            : '⇅'}
                        </span>
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                );
              })}
            </tr>
            {/* Inline Column Filters & Sorting Row */}
            {!hideFilterRow && processedColumns.some(col => (col.filterType && col.filterType !== 'none') || col.sortable) && (
              <tr style={{ backgroundColor: '#f1f5f9' }}>
                {processedColumns.map((col) => {
                  const isAction = col.key === 'action';
                  const isSortActive = sortConfig?.key === col.key;
                  return (
                    <th
                      key={`filter-${col.key}`}
                      className={isAction ? 'sticky-action-header' : undefined}
                      style={{
                        padding: '6px 12px',
                        width: col.width,
                        textAlign: col.align || 'left',
                        verticalAlign: 'middle',
                        backgroundColor: '#f1f5f9',
                        position: 'sticky',
                        top: '48px',
                        zIndex: 9
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', width: '100%', justifyContent: col.align === 'center' ? 'center' : 'flex-start' }}>
                        {(col.key === 'index' || col.key === 'sno' || col.key === 's_no') && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#4b5563', fontWeight: 600, fontSize: '0.7rem' }}>
                            <svg style={{ width: '12px', height: '12px', color: '#4b5563' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            <span>Filters</span>
                          </div>
                        )}
                        {col.filterRender ? col.filterRender(columnFilters, setColumnFilters) : (col.filterType === 'text' && (
                          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1 }}>
                            <DebouncedFilterInput
                              value={columnFilters[col.key] || ''}
                              placeholder={col.filterPlaceholder || `Search ${col.label}...`}
                              onChange={(val) => {
                                setColumnFilters({
                                  ...columnFilters,
                                  [col.key]: val
                                });
                              }}
                            />
                            <svg
                              style={{ position: 'absolute', left: '8px', width: '10px', height: '10px', color: '#9ca3af', pointerEvents: 'none' }}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        ))
                        }

                        {col.filterType === 'select' && (
                          <div className="select-dropdown-container" style={{ position: 'relative', flex: 1 }}>
                            <button
                              onClick={() => {
                                if (openSelectCol === col.key) {
                                  setOpenSelectCol(null);
                                } else {
                                  setOpenSelectCol(col.key);
                                  setSelectQuery('');
                                }
                              }}
                              style={{
                                width: '100%',
                                padding: '6px 20px 6px 8px',
                                fontSize: '0.75rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                outline: 'none',
                                backgroundColor: '#ffffff',
                                color: '#374151',
                                fontWeight: 'normal',
                                boxSizing: 'border-box',
                                cursor: 'pointer',
                                textAlign: 'left',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                minHeight: '28px'
                              }}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {(() => {
                                  const filterVal = columnFilters[col.key];
                                  if (!filterVal) return `All ${col.label}`;
                                  const found = col.filterOptions?.find(opt => {
                                    if (!opt) return false;
                                    const val = typeof opt === 'string' ? opt : opt.value;
                                    return String(val).toLowerCase() === String(filterVal).toLowerCase();
                                  });
                                  if (!found) return filterVal;
                                  return typeof found === 'string' ? found : found.label;
                                })()}
                              </span>
                              <span style={{ fontSize: '0.55rem', color: '#6b7280' }}>▼</span>
                            </button>

                            {openSelectCol === col.key && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  right: 0,
                                  marginTop: '4px',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '6px',
                                  boxShadow: 'var(--shadow-md)',
                                  zIndex: 100,
                                  padding: '4px',
                                  minWidth: '160px'
                                }}
                              >
                                <div style={{ position: 'relative', marginBottom: '4px' }}>
                                  <input
                                    type="text"
                                    placeholder="Search..."
                                    value={selectQuery}
                                    onChange={(e) => setSelectQuery(e.target.value)}
                                    style={{
                                      width: '100%',
                                      padding: '4px 6px 4px 18px',
                                      fontSize: '0.7rem',
                                      border: '1px solid #d1d5db',
                                      borderRadius: '4px',
                                      outline: 'none',
                                      boxSizing: 'border-box'
                                    }}
                                    autoFocus
                                  />
                                  <svg
                                    style={{ position: 'absolute', left: '6px', top: '7px', width: '8px', height: '8px', color: '#9ca3af' }}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={3}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                  </svg>
                                </div>

                                <div style={{ maxHeight: '140px', overflowY: 'auto' }}>
                                  {(!selectQuery || `all ${col.label}`.toLowerCase().includes(selectQuery.toLowerCase())) && (
                                    <div
                                      onClick={() => {
                                        setColumnFilters({ ...columnFilters, [col.key]: '' });
                                        setOpenSelectCol(null);
                                      }}
                                      style={{
                                        padding: '4px 8px',
                                        cursor: 'pointer',
                                        fontSize: '0.75rem',
                                        backgroundColor: !columnFilters[col.key] ? '#eff6ff' : 'transparent',
                                        color: !columnFilters[col.key] ? '#2563eb' : '#374151',
                                        fontWeight: !columnFilters[col.key] ? 'bold' : 'normal',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      All {col.label}
                                    </div>
                                  )}
                                  {col.filterOptions
                                    ?.filter(opt => {
                                      if (!opt) return false;
                                      const val = typeof opt === 'string' ? opt : (opt as any).value;
                                      if (val === '' || val === null || val === undefined) return false;
                                      const lbl = typeof opt === 'string'
                                        ? opt
                                        : (typeof opt === 'object' && 'label' in opt ? (opt as any).label : String(opt));
                                      return lbl.toLowerCase().includes(selectQuery.toLowerCase());
                                    })
                                    .map((opt) => {
                                      const val = typeof opt === 'string' ? opt : opt.value;
                                      const lbl = typeof opt === 'string' ? opt : opt.label;
                                      const isSelected = String(columnFilters[col.key] || '').toLowerCase() === String(val).toLowerCase();
                                      return (
                                        <div
                                          key={val}
                                          onClick={() => {
                                            setColumnFilters({ ...columnFilters, [col.key]: val });
                                            setOpenSelectCol(null);
                                          }}
                                          style={{
                                            padding: '4px 8px',
                                            cursor: 'pointer',
                                            fontSize: '0.75rem',
                                            backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                                            color: isSelected ? '#2563eb' : '#374151',
                                            fontWeight: isSelected ? 'bold' : 'normal',
                                            borderRadius: '4px'
                                          }}
                                        >
                                          {lbl}
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {col.sortable && (
                          <button
                            onClick={() => handleSort(col.key)}
                            style={{
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              background: '#ffffff',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              color: isSortActive ? '#2563eb' : '#4b5563',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.35rem',
                              width: (!col.filterType || col.filterType === 'none') ? '100%' : 'auto',
                              height: '28px',
                              transition: 'all 0.15s ease',
                              boxSizing: 'border-box'
                            }}
                            title={`Sort by ${col.label}`}
                          >
                            {(!col.filterType || col.filterType === 'none') && <span style={{ color: '#6b7280', fontSize: '0.7rem', fontWeight: 600 }}>Sort</span>}
                            <span>{isSortActive ? (sortConfig.direction === 'asc' ? '↑' : '↓') : '↕'}</span>
                          </button>
                        )}

                        {(col.key === 'action' || col.key === 'actions') && (
                          <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', alignItems: 'center' }}>
                            <button
                              onClick={handleResetAll}
                              style={{
                                padding: '4px 8px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: '#ffffff',
                                backgroundColor: '#ef4444',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 'auto',
                                minHeight: '24px',
                                boxSizing: 'border-box',
                                transition: 'all 0.15s ease',
                                margin: '0',
                                boxShadow: '0 1px 2px rgba(239, 68, 68, 0.2)'
                              }}
                              title="Reset all filters and search"
                            >
                              Reset
                            </button>
                            <div ref={exportDropdownRef} style={{ position: 'relative', display: 'inline-flex' }}>
                              <button
                                onClick={() => {
                                  if (onExportAll) {
                                    setExportDropdownOpen(!exportDropdownOpen);
                                  } else {
                                    handleClientExport();
                                  }
                                }}
                                disabled={exportingAll}
                                style={{
                                  padding: '4px 8px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  color: '#ffffff',
                                  backgroundColor: '#10b981',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 'auto',
                                  minHeight: '24px',
                                  boxSizing: 'border-box',
                                  transition: 'all 0.15s ease',
                                  margin: '0',
                                  boxShadow: '0 1px 2px rgba(16, 185, 129, 0.2)'
                                }}
                                title={onExportAll ? "Export Options" : "Export to Excel"}
                              >
                                {exportingAll ? 'Exporting...' : 'Export'}
                              </button>
                              
                              {exportDropdownOpen && onExportAll && (
                                <div style={{
                                  position: 'absolute',
                                  top: '100%',
                                  right: 0,
                                  marginTop: '4px',
                                  backgroundColor: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                  zIndex: 50,
                                  minWidth: '120px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  padding: '4px 0'
                                }}>
                                  <button
                                    onClick={() => {
                                      setExportDropdownOpen(false);
                                      handleClientExport();
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '0.75rem',
                                      color: '#374151',
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      width: '100%',
                                      transition: 'background-color 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    Current Page
                                  </button>
                                  <button
                                    onClick={() => {
                                      setExportDropdownOpen(false);
                                      handleExportAll();
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      fontSize: '0.75rem',
                                      color: '#374151',
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      width: '100%',
                                      transition: 'background-color 0.15s ease'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    All Pages
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={`skeleton-row-${rowIndex}`}>
                  {processedColumns.map((col, colIndex) => {
                    const widthPercent = colIndex === 0 ? '40%' : colIndex === processedColumns.length - 1 ? '50%' : '75%';
                    const shimmerStyles = `
                      @keyframes antigravity-shimmer {
                        0% { background-position: -200% 0; }
                        100% { background-position: 200% 0; }
                      }
                      .antigravity-skeleton-bar {
                        background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
                        background-size: 200% 100%;
                        animation: antigravity-shimmer 1.5s infinite linear;
                        border-radius: 6px;
                      }
                    `;
                    return (
                      <td key={`skeleton-cell-${colIndex}`} style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                        <style dangerouslySetInnerHTML={{ __html: shimmerStyles }} />
                        <div className="antigravity-skeleton-bar" style={{ width: widthPercent, height: '14px' }} />
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : displayData.length === 0 ? (
              <tr>
                <td colSpan={processedColumns.length} style={{ textAlign: 'center', padding: '3.5rem 1.5rem', backgroundColor: '#ffffff' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
                    <img
                      src="/no-result.png"
                      alt="No Matches Found"
                      style={{ width: '120px', height: '120px', objectFit: 'contain' }}
                    />
                    <span style={{ fontSize: '0.95rem', fontWeight: 650, color: '#1e293b' }}>
                      No Matches Found in the Data Universe
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              <>
                {displayData.map((row: any, rIdx) => (
                  <tr
                    key={row.id || rIdx}
                    id={row.id ? `row-${row.id}` : undefined}
                    onClick={() => onRowClick && onRowClick(row)}
                    tabIndex={onRowClick ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onRowClick(row);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        const nextRow = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextRow) nextRow.focus();
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prevRow = e.currentTarget.previousElementSibling as HTMLElement;
                        if (prevRow) prevRow.focus();
                      }
                    }}
                    style={{
                      cursor: onRowClick ? 'pointer' : 'default',
                      outline: 'none',
                      backgroundColor: rIdx === highlightedIndex ? '#f1f5f9' : undefined,
                      boxShadow: rIdx === highlightedIndex ? 'inset 4px 0 0 0 #2563eb' : undefined
                    }}
                  >
                    {processedColumns.map((col) => {
                      const value = row[col.key];
                      return (
                        <td
                          key={col.key}
                          className={col.key === 'action' ? 'sticky-action-col' : undefined}
                          style={{ textAlign: col.align || 'left' }}
                        >
                          {col.render ? col.render(value, row, rIdx) : (value !== undefined && value !== null ? String(value) : '-')}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {Array.from({ length: Math.max(0, 5 - displayData.length) }).map((_, idx) => (
                  <tr key={`empty-${idx}`} style={{ height: '40px', cursor: 'default' }}>
                    {processedColumns.map((col) => (
                      <td
                        key={col.key}
                        className={col.key === 'action' ? 'sticky-action-col' : undefined}
                        style={{ textAlign: col.align || 'left' }}
                      >
                        &nbsp;
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#4b5563', position: 'relative' }}>
          <span>Rows per page:</span>
          <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{
                padding: '0.35rem 1.75rem 0.35rem 0.65rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                outline: 'none',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                minWidth: '60px',
                textAlign: 'left',
                justifyContent: 'space-between',
                transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                boxShadow: dropdownOpen ? '0 0 0 3px rgba(59, 130, 246, 0.1)' : 'none',
                borderColor: dropdownOpen ? '#3b82f6' : '#e5e7eb'
              }}
            >
              <span>{pageSize}</span>
              <span style={{ fontSize: '0.65rem', color: '#6b7280' }}>▼</span>
            </button>
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  zIndex: 1000,
                  minWidth: '60px',
                  overflow: 'hidden'
                }}
              >
                {pageSizeOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setPageSize(option);
                      setDropdownOpen(false);
                    }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      color: pageSize === option ? '#2563eb' : '#374151',
                      backgroundColor: pageSize === option ? '#eff6ff' : '#ffffff',
                      transition: 'background-color 0.15s ease',
                      fontWeight: pageSize === option ? 600 : 400
                    }}
                    onMouseEnter={(e) => {
                      if (pageSize !== option) {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (pageSize !== option) {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                      }
                    }}
                  >
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: '#4b5563' }}>
          <span>Page {currentPage} of {Math.max(1, Math.ceil(activeTotalItems / pageSize))} ({activeTotalItems === 0 ? 0 : startIdx + 1}-{endIdx} of {activeTotalItems} Items)</span>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              style={{
                padding: '0.35rem 0.6rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: currentPage === 1 ? '#f9fafb' : '#ffffff',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                color: currentPage === 1 ? '#d1d5db' : '#4b5563',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                height: '32px',
                transition: 'all 0.15s ease'
              }}
            >
              ‹
            </button>

            {(() => {
              const totalPages = Math.max(1, Math.ceil(activeTotalItems / pageSize));
              const pages: (number | string)[] = [];
              const maxVisible = 5;
              if (totalPages <= maxVisible) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                if (currentPage <= 3) {
                  pages.push(1, 2, 3, '...', totalPages);
                } else if (currentPage >= totalPages - 2) {
                  pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
                } else {
                  pages.push(1, '...', currentPage, '...', totalPages);
                }
              }

              return pages.map((page, idx) => {
                if (page === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '32px',
                        height: '32px',
                        fontSize: '0.85rem',
                        color: '#9ca3af'
                      }}
                    >
                      ...
                    </span>
                  );
                }

                const isCurrent = currentPage === page;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page as number)}
                    style={{
                      padding: '0.35rem 0.6rem',
                      border: isCurrent ? '1px solid #2563eb' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      background: isCurrent ? '#2563eb' : '#ffffff',
                      color: isCurrent ? '#ffffff' : '#4b5563',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: isCurrent ? '600' : '400',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '32px',
                      height: '32px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {page}
                  </button>
                );
              });
            })()}

            <button
              disabled={currentPage >= Math.ceil(activeTotalItems / pageSize)}
              onClick={() => setCurrentPage(currentPage + 1)}
              style={{
                padding: '0.35rem 0.6rem',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: currentPage >= Math.ceil(activeTotalItems / pageSize) ? '#f9fafb' : '#ffffff',
                cursor: currentPage >= Math.ceil(activeTotalItems / pageSize) ? 'not-allowed' : 'pointer',
                color: currentPage >= Math.ceil(activeTotalItems / pageSize) ? '#d1d5db' : '#4b5563',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                height: '32px',
                transition: 'all 0.15s ease'
              }}
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
