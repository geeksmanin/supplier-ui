import React, { useState, useEffect } from 'react';
import { apiClient, useToast, DataTable, Column, useRefreshOnVisible, useMediaQuery, downloadFile } from '@geeksman/core-ui';

interface ImportJob {
  id: string;
  entity_type: string;
  filename: string;
  status: string;
  processed_rows: number;
  total_rows: number;
  errors_count: number;
  error_sheet_key: string;
  created_at: string;
}

export interface ImportHistoryPageProps {
  entityType?: string;
  title?: string;
  hideHeader?: boolean;
}

export const ImportHistoryPage: React.FC<ImportHistoryPageProps> = ({
  entityType,
  title = 'Import History Logs',
  hideHeader = false,
}) => {
  const { showToast } = useToast();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/import/history');
      if (res.data && res.data.data) {
        const allJobs = res.data.data as ImportJob[];
        const filtered = allJobs.filter(job => {
          const matchEntity = entityType ? job.entity_type?.toLowerCase() === entityType.toLowerCase() : true;
          const matchQuery = searchQuery ? (
            job.filename?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.entity_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.status?.toLowerCase().includes(searchQuery.toLowerCase())
          ) : true;
          return matchEntity && matchQuery;
        });

        const start = (currentPage - 1) * pageSize;
        const paginated = filtered.slice(start, start + pageSize);
        
        setJobs(paginated);
        setTotalItems(filtered.length);
      }
    } catch (err) {
      console.error("Failed to fetch import history:", err);
      setError('Failed to load import history logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [currentPage, pageSize, searchQuery]);

  useRefreshOnVisible(() => {
    fetchHistory();
  });

  const getStatusBadge = (status: string) => {
    const isSuccess = status === 'success';
    const isPartial = status === 'partial';
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        backgroundColor: isSuccess ? '#dcfce7' : isPartial ? '#fef3c7' : '#fee2e2',
        color: isSuccess ? '#15803d' : isPartial ? '#b45309' : '#b91c1c'
      }}>
        {status}
      </span>
    );
  };

  const columns: Column<ImportJob>[] = [
    {
      key: 'created_at',
      label: 'Date & Time',
      sortable: true,
      render: (val) => new Date(val).toLocaleString()
    },
    {
      key: 'entity_type',
      label: 'Module / Entity',
      render: (val) => <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{val}</span>
    },
    {
      key: 'filename',
      label: 'Filename',
      render: (val) => <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{val || '-'}</span>
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => getStatusBadge(val)
    },
    {
      key: 'progress',
      label: 'Progress',
      render: (_, job) => (
        <span style={{ fontWeight: 600 }}>
          {job.processed_rows} / {job.total_rows} rows
        </span>
      )
    },
    {
      key: 'action',
      label: 'Error Report',
      render: (_, job) => {
        if (!job.error_sheet_key) return '-';
        return (
          <button
            onClick={async () => {
              try {
                await downloadFile(`/import/download-error-sheet?key=${encodeURIComponent(job.error_sheet_key)}`, 'import_errors.xlsx');
              } catch (err) {
                showToast('Failed to download error report', 'error');
              }
            }}
            style={{ color: '#2563eb', textDecoration: 'underline', fontWeight: 600, background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            Download Report
          </button>
        );
      }
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', padding: isDesktop ? '0' : '1rem' }}>
      <div>
        <h1 style={{ fontSize: isDesktop ? '1.5rem' : '1.3rem', fontWeight: 700, margin: 0, color: '#111827' }}>Import Log History</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Monitor background spreadsheet imports, row counts, and download error sheets.
        </p>
      </div>

      {error && (
        <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem' }}>
          ⚠️ {error}
        </div>
      )}

      {isDesktop ? (
        <DataTable
          columns={columns}
          data={jobs}
          searchVal={searchQuery}
          setSearchVal={setSearchQuery}
          searchPlaceholder="Search imports by filename..."
          pageSize={pageSize}
          setPageSize={setPageSize}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalItems={totalItems}
          onRefresh={fetchHistory}
          loading={loading}
        />
      ) : (
        // Beautiful mobile card-based design
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Mobile search header */}
          <input
            type="text"
            placeholder="Search imports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: '0.65rem 0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '0.9rem',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />

          {loading && <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Loading logs...</div>}

          {!loading && jobs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              No import history found.
            </div>
          )}

          {!loading && jobs.map(job => (
            <div
              key={job.id}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, textTransform: 'capitalize', color: '#1f2937' }}>
                  {job.entity_type}
                </span>
                {getStatusBadge(job.status)}
              </div>

              <div style={{ fontSize: '0.85rem', color: '#4b5563', wordBreak: 'break-all' }}>
                <span style={{ fontWeight: 600 }}>File: </span>
                <span style={{ fontFamily: 'monospace' }}>{job.filename || '-'}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6b7280' }}>
                <span>{new Date(job.created_at).toLocaleString()}</span>
                <span style={{ fontWeight: 600, color: '#374151' }}>
                  Rows: {job.processed_rows} / {job.total_rows}
                </span>
              </div>

              {job.error_sheet_key && (
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={async () => {
                      try {
                        await downloadFile(`/import/download-error-sheet?key=${encodeURIComponent(job.error_sheet_key)}`, 'import_errors.xlsx');
                      } catch (err) {
                        showToast('Failed to download error report', 'error');
                      }
                    }}
                    style={{
                      color: '#2563eb',
                      textDecoration: 'none',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer'
                    }}
                  >
                    <span>Download Error Report</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Simple pagination buttons for mobile */}
          {totalItems > pageSize && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: currentPage === 1 ? '#f3f4f6' : '#ffffff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <span style={{ fontSize: '0.85rem', color: '#4b5563' }}>
                Page {currentPage} of {Math.ceil(totalItems / pageSize)}
              </span>
              <button
                disabled={currentPage * pageSize >= totalItems}
                onClick={() => setCurrentPage(prev => prev + 1)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: currentPage * pageSize >= totalItems ? '#f3f4f6' : '#ffffff',
                  cursor: currentPage * pageSize >= totalItems ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
