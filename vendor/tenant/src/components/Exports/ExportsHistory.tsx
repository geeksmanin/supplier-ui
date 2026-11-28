import React, { useState, useEffect } from 'react';
import { apiClient, DataTable, Button, useMediaQuery } from '@geeksman/core-ui';

interface ExportJob {
  id: string;
  entity_type: string;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  file_path?: string;
  file_size: number;
  filters?: string;
  created_at: string;
  completed_at?: string;
}

export const ExportsHistory: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/crm/exports');
      if (res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch exports history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Poll progress if any jobs are currently running (pending or processing)
  useEffect(() => {
    const hasRunningJobs = jobs.some(j => j.status === 'pending' || j.status === 'processing');
    if (!hasRunningJobs) return;

    const interval = setInterval(async () => {
      try {
        const res = await apiClient.get('/crm/exports');
        if (res.data) {
          setJobs(res.data);
        }
      } catch (err) {
        console.error('Polling exports failed:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [jobs]);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getEntityLabel = (type: string) => {
    if (type === 'leads') return 'CRM Leads';
    return type.toUpperCase();
  };

  const getStatusBadge = (status: ExportJob['status']) => {
    const styles: Record<string, React.CSSProperties> = {
      pending: { backgroundColor: '#fef3c7', color: '#d97706', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 },
      processing: { backgroundColor: '#dbeafe', color: '#2563eb', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' },
      completed: { backgroundColor: '#d1fae5', color: '#059669', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 },
      failed: { backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }
    };

    if (status === 'processing') {
      return (
        <span style={styles.processing}>
          <svg style={{ animation: 'spin 1s linear infinite' }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="16" />
          </svg>
          Processing
        </span>
      );
    }

    return <span style={styles[status] || styles.pending}>{status.toUpperCase()}</span>;
  };

  const columns = [
    { key: 'index', label: '#', width: '60px', render: (_: any, __: any, idx: number) => idx + 1 },
    { key: 'entity_type', label: 'Export Type', render: (val: string) => <span style={{ fontWeight: 600, color: '#334155' }}>{getEntityLabel(val)}</span> },
    { key: 'format', label: 'Format', render: (val: string) => <span style={{ textTransform: 'uppercase', color: '#475569', fontWeight: 500 }}>{val}</span> },
    { key: 'status', label: 'Status', render: (val: ExportJob['status']) => getStatusBadge(val) },
    { key: 'file_size', label: 'File Size', render: (val: number) => formatSize(val) },
    { key: 'created_at', label: 'Requested At', render: (val: string) => new Date(val).toLocaleString() },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center' as const,
      width: '150px',
      render: (_: any, row: ExportJob) => {
        if (row.status === 'completed' && row.file_path) {
          return (
            <Button
              variant="primary"
              onClick={() => {
                let downloadUrl = row.file_path || '';
                if (downloadUrl.startsWith('/api/v1/')) {
                  const base = apiClient.defaults.baseURL || '';
                  if (base.includes('/api/v1')) {
                    const origin = base.substring(0, base.indexOf('/api/v1'));
                    downloadUrl = origin + downloadUrl;
                  } else if (base.startsWith('http')) {
                    downloadUrl = base.replace(/\/+$/, '') + downloadUrl;
                  }
                }
                const link = document.createElement('a');
                link.href = downloadUrl;
                const fileName = downloadUrl.substring(downloadUrl.lastIndexOf('/') + 1);
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Download
            </Button>
          );
        }
        if (row.status === 'failed') {
          return (
            <span
              title={row.error_message || 'Unknown generation error'}
              style={{ color: '#ef4444', fontSize: '0.875rem', cursor: 'help', textDecoration: 'underline dotted' }}
            >
              View Error
            </span>
          );
        }
        return <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Processing...</span>;
      }
    }
  ];

  return (
    <div style={{ padding: isDesktop ? '2rem' : '1rem', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>System Exports History</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#64748b', fontSize: '0.875rem' }}>View, track progress, and download Excel/CSV data exports.</p>
        </div>
        <Button variant="secondary" onClick={fetchJobs} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
          <svg className={loading ? 'animate-spin' : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          Refresh
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={jobs}
        searchVal={searchVal}
        setSearchVal={setSearchVal}
        searchPlaceholder="Search exports..."
        pageSize={pageSize}
        setPageSize={setPageSize}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalItems={jobs.length}
        onRefresh={fetchJobs}
      />
    </div>
  );
};
