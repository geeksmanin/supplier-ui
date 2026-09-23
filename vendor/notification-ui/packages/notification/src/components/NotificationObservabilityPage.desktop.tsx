import React, { useState, useEffect, useCallback } from 'react';
import { DataTable, Column, Button, useToast, apiClient, Select } from '@geeksman/core-ui';

export interface NotificationAdminStats {
  active_sse_connections: number;
  sse_staff_connections: number;
  sse_customer_connections: number;
  active_fcm_devices: number;
  fcm_staff_devices: number;
  fcm_customer_devices: number;
  active_web_push: number;
  web_push_staff: number;
  web_push_customer: number;
  total_notifications_sent: number;
  total_active_devices: number;
}

export interface AdminDeviceItem {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  tenant_code?: string;
  user_type: string;
  platform: string;
  device_token: string;
  device_model?: string;
  app_version?: string;
  is_active: boolean;
  has_live_sse: boolean;
  sse_connected: boolean;
  sse_connections_count?: number;
  has_fcm: boolean;
  has_web_push: boolean;
  last_seen_at?: string;
  registered_at?: string;
  created_at?: string;
}

export interface UserDirectoryEntry {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  type?: 'staff' | 'customer';
}

export interface NotificationFeedItem {
  id: string;
  tenant_code: string;
  user_id: string;
  title: string;
  body: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface TestDispatchResult {
  notification_id: string;
  delivered_sse: boolean;
  fcm_dispatched_count: number;
  web_push_dispatched_count: number;
  message: string;
}

export async function notifAdminGet(endpoint: string, params?: Record<string, any>) {
  let clean = endpoint.replace(/^\/api\/v1/, '');
  if (!clean.startsWith('/')) clean = '/' + clean;
  if (!clean.startsWith('/notification')) {
    clean = `/notification${clean}`;
  }

  try {
    return await apiClient.get(clean, { params });
  } catch (err: any) {
    if (err.response?.status === 404) {
      const direct = clean.replace('/notification', '');
      try {
        return await apiClient.get(direct, { params });
      } catch (err2: any) {
        if (err2.response?.status !== 404) throw err2;
      }
    }
    throw err;
  }
}

export async function notifAdminPost(endpoint: string, data?: any) {
  let clean = endpoint.replace(/^\/api\/v1/, '');
  if (!clean.startsWith('/')) clean = '/' + clean;
  if (!clean.startsWith('/notification')) {
    clean = `/notification${clean}`;
  }

  try {
    return await apiClient.post(clean, data);
  } catch (err: any) {
    if (err.response?.status === 404) {
      const direct = clean.replace('/notification', '');
      try {
        return await apiClient.post(direct, data);
      } catch (err2: any) {
        if (err2.response?.status !== 404) throw err2;
      }
    }
    throw err;
  }
}

export const NotificationObservabilityPageDesktop: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'devices' | 'feed' | 'test'>('devices');
  const [stats, setStats] = useState<NotificationAdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  // User Directory cache for human-friendly names
  const [userDirectory, setUserDirectory] = useState<Record<string, UserDirectoryEntry>>({});

  // Tab 1: Devices state
  const [devices, setDevices] = useState<AdminDeviceItem[]>([]);
  const [devicesLoading, setDevicesLoading] = useState<boolean>(false);
  const [deviceSearch, setDeviceSearch] = useState<string>('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [devicePage, setDevicePage] = useState<number>(1);
  const [deviceLimit, setDeviceLimit] = useState<number>(20);
  const [deviceTotal, setDeviceTotal] = useState<number>(0);

  // Tab 2: Feed state
  const [feed, setFeed] = useState<NotificationFeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState<boolean>(false);
  const [feedPage, setFeedPage] = useState<number>(1);
  const [feedLimit, setFeedLimit] = useState<number>(10);
  const [feedTotal, setFeedTotal] = useState<number>(0);

  // Tab 3: Test Dispatcher state
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [testTitle, setTestTitle] = useState<string>('System Broadcast Alert');
  const [testBody, setTestBody] = useState<string>('This is a real-time multi-channel notification verification test.');
  const [testType, setTestType] = useState<string>('mention');
  const [testLink, setTestLink] = useState<string>('/dashboard');
  const [dispatching, setDispatching] = useState<boolean>(false);
  const [lastDispatchResult, setLastDispatchResult] = useState<TestDispatchResult | null>(null);

  // Fetch complete User Directory across staff & contacts
  const fetchUserDirectory = useCallback(async () => {
    try {
      const dir: Record<string, UserDirectoryEntry> = {};

      // 1. Staff users from /tenant/users
      try {
        const staffRes = await apiClient.get('/tenant/users', { params: { limit: 1000 } });
        const staffList = Array.isArray(staffRes.data?.data) ? staffRes.data.data : [];
        staffList.forEach((u: any) => {
          if (u.id) {
            dir[u.id] = {
              id: u.id,
              name: u.name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email || 'Staff User',
              email: u.email,
              phone: u.phone,
              role: u.role || (u.roles && u.roles[0]?.name) || 'Staff',
              type: 'staff',
            };
          }
        });
      } catch (_) {}

      // 2. Customer contacts from /contacts/contacts
      try {
        const custRes = await apiClient.get('/contacts/contacts', { params: { limit: 1000 } });
        const custList = Array.isArray(custRes.data?.data) ? custRes.data.data : [];
        custList.forEach((c: any) => {
          if (c.id && !dir[c.id]) {
            dir[c.id] = {
              id: c.id,
              name: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.company_name || 'Customer',
              email: c.email,
              phone: c.phone,
              role: c.type || 'Customer',
              type: 'customer',
            };
          }
        });
      } catch (_) {}

      setUserDirectory(dir);
    } catch (err) {
      console.warn('Failed to load user directory', err);
    }
  }, []);

  // Load Aggregated Stats
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const resp = await notifAdminGet('/admin/stats');
      const data = resp.data?.data || resp.data;
      if (data) {
        setStats({
          active_sse_connections: data.active_sse_connections ?? data.live_sse_connections ?? 0,
          sse_staff_connections: data.sse_staff_connections ?? data.live_sse_staff_count ?? 0,
          sse_customer_connections: data.sse_customer_connections ?? data.live_sse_customer_count ?? 0,
          active_fcm_devices: data.active_fcm_devices ?? data.fcm_devices_count ?? 0,
          fcm_staff_devices: data.fcm_staff_devices ?? data.staff_devices_count ?? 0,
          fcm_customer_devices: data.fcm_customer_devices ?? data.customer_devices_count ?? 0,
          active_web_push: data.active_web_push ?? data.web_push_count ?? 0,
          web_push_staff: data.web_push_staff ?? 0,
          web_push_customer: data.web_push_customer ?? 0,
          total_notifications_sent: data.total_notifications_sent ?? data.total_notifications_count ?? 0,
          total_active_devices: data.total_active_devices ?? 0,
        });
      }
    } catch (err: any) {
      console.warn('Failed to load notification stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Load Active Devices
  const fetchDevices = useCallback(async () => {
    setDevicesLoading(true);
    try {
      const params: Record<string, any> = {
        page: devicePage,
        limit: deviceLimit,
      };
      if (userTypeFilter !== 'all') params.user_type = userTypeFilter;
      if (platformFilter !== 'all') params.platform = platformFilter;

      const resp = await notifAdminGet('/admin/devices', params);
      const items = resp.data?.data || [];
      setDevices(Array.isArray(items) ? items : []);
      const pagination = resp.data?.pagination_data || resp.data?.pagination;
      const headerTotal = resp.headers?.['x-total-count'] ? parseInt(resp.headers['x-total-count'], 10) : undefined;
      const total = pagination?.total_results ?? headerTotal ?? resp.data?.total ?? resp.data?.total_results ?? items.length;
      setDeviceTotal(total);
    } catch (err: any) {
      console.warn('Failed to load devices:', err);
      setDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  }, [devicePage, deviceLimit, userTypeFilter, platformFilter]);

  // Load Notification Feed
  const fetchFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const resp = await notifAdminGet('/admin/feed', {
        page: feedPage,
        limit: feedLimit,
      });
      const items = resp.data?.data || [];
      setFeed(Array.isArray(items) ? items : []);
      const pagination = resp.data?.pagination_data || resp.data?.pagination;
      const headerTotal = resp.headers?.['x-total-count'] ? parseInt(resp.headers['x-total-count'], 10) : undefined;
      const total = pagination?.total_results ?? headerTotal ?? resp.data?.total ?? resp.data?.total_results ?? items.length;
      setFeedTotal(total);
    } catch (err: any) {
      console.warn('Failed to load feed:', err);
      setFeed([]);
    } finally {
      setFeedLoading(false);
    }
  }, [feedPage, feedLimit]);

  useEffect(() => {
    fetchStats();
    fetchUserDirectory();
  }, [fetchStats, fetchUserDirectory]);

  useEffect(() => {
    if (activeTab === 'devices') {
      fetchDevices();
    } else if (activeTab === 'feed') {
      fetchFeed();
    }
  }, [activeTab, fetchDevices, fetchFeed]);

  // Handle Quick Test Dispatch
  const handleDispatchTest = async () => {
    if (!targetUserId.trim()) {
      showToast('Please specify a target User ID', 'warning');
      return;
    }
    if (!testTitle.trim() || !testBody.trim()) {
      showToast('Title and body are required', 'warning');
      return;
    }

    setDispatching(true);
    setLastDispatchResult(null);
    try {
      const payload = {
        user_id: targetUserId.trim(),
        title: testTitle.trim(),
        body: testBody.trim(),
        type: testType,
        link: testLink.trim() || undefined,
      };
      const resp = await notifAdminPost('/admin/test-dispatch', payload);
      const result: TestDispatchResult = resp.data?.data || resp.data;
      setLastDispatchResult(result);
      showToast('Test notification dispatched successfully!', 'success');
      // Refresh stats & feed in background
      fetchStats();
      if (activeTab === 'feed') fetchFeed();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to dispatch test notification';
      showToast(msg, 'error');
    } finally {
      setDispatching(false);
    }
  };

  // Filtered devices client-side search
  const filteredDevices = devices.filter((d) => {
    if (!deviceSearch.trim()) return true;
    const q = deviceSearch.toLowerCase();
    const u = userDirectory[d.user_id];
    return (
      d.user_id.toLowerCase().includes(q) ||
      (d.user_name && d.user_name.toLowerCase().includes(q)) ||
      (d.user_email && d.user_email.toLowerCase().includes(q)) ||
      (u?.name && u.name.toLowerCase().includes(q)) ||
      (u?.email && u.email.toLowerCase().includes(q)) ||
      (d.device_model && d.device_model.toLowerCase().includes(q)) ||
      (d.app_version && d.app_version.toLowerCase().includes(q)) ||
      (d.device_token && d.device_token.toLowerCase().includes(q))
    );
  });

  // Device Table Columns
  const deviceColumns: Column<AdminDeviceItem>[] = [
    {
      key: 'user',
      label: 'Recipient / User',
      render: (_, row) => {
        const uInfo = userDirectory[row.user_id];
        const displayName = uInfo?.name || row.user_name || row.user_id;
        const displayEmail = uInfo?.email || row.user_email;
        const displayRole = uInfo?.role || row.user_type || 'staff';
        const isCustomer = row.user_type === 'customer' || uInfo?.type === 'customer';
        const regDateStr = row.registered_at || row.created_at;
        let formattedDate = '';
        if (regDateStr && !isNaN(new Date(regDateStr).getTime())) {
          formattedDate = new Date(regDateStr).toLocaleString();
        }

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                {displayName}
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: isCustomer ? '#f3e8ff' : '#e0e7ff',
                  color: isCustomer ? '#6b21a8' : '#3730a3',
                }}
              >
                {displayRole}
              </span>
            </div>
            {displayEmail && (
              <span style={{ fontSize: '0.78rem', color: '#475569' }}>
                {displayEmail}
              </span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                ID: {row.user_id}
              </span>
            </div>
            {formattedDate && (
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                Registered: {formattedDate}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'channels',
      label: 'Active Notification Channels',
      render: (_, row) => {
        const isSSE = Boolean(row.has_live_sse || row.sse_connected || (row.sse_connections_count && row.sse_connections_count > 0));
        const sseCount = row.sse_connections_count && row.sse_connections_count > 0 ? row.sse_connections_count : 1;
        const hasFCM = Boolean(row.has_fcm || (row.device_token && (row.platform === 'android' || row.platform === 'ios')));

        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
            {/* Live SSE Badge */}
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                backgroundColor: isSSE ? '#ecfdf5' : '#f8fafc',
                color: isSSE ? '#047857' : '#94a3b8',
                border: isSSE ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: isSSE ? '#10b981' : '#cbd5e1',
                  boxShadow: isSSE ? '0 0 6px rgba(16, 185, 129, 0.7)' : 'none',
                }}
              />
              {isSSE
                ? `Live SSE (${sseCount} ${sseCount === 1 ? 'stream' : 'streams'})`
                : 'SSE Offline'}
            </span>

            {/* FCM Android / iOS Badge */}
            {hasFCM && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  border: '1px solid #bfdbfe',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                FCM Native ({row.platform})
              </span>
            )}

            {/* WebPush Badge */}
            {row.has_web_push && (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#faf5ff',
                  color: '#7e22ce',
                  border: '1px solid #e9d5ff',
                }}
              >
                🔔 Web Push (Active)
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'hardware',
      label: 'Device & Client App',
      render: (_, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 500, color: '#334155' }}>
            {row.device_model || (row.platform === 'web' ? 'Web Browser' : 'Android Device')}
          </span>
          {row.app_version && (
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>App v{row.app_version}</span>
          )}
        </div>
      ),
    },
    {
      key: 'token',
      label: 'Push Token Fingerprint',
      render: (_, row) => {
        const masked =
          row.device_token && row.device_token.length > 20
            ? `${row.device_token.slice(0, 10)}...${row.device_token.slice(-8)}`
            : row.device_token || '—';
        return (
          <code
            title={row.device_token}
            style={{
              fontSize: '0.75rem',
              backgroundColor: '#f1f5f9',
              padding: '3px 7px',
              borderRadius: '5px',
              color: '#475569',
              fontFamily: 'monospace',
            }}
          >
            {masked}
          </code>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <Button
          variant="secondary"
          style={{ padding: '0.3rem 0.75rem', fontSize: '0.78rem' }}
          onClick={() => {
            setTargetUserId(row.user_id);
            setActiveTab('test');
          }}
        >
          Send Test
        </Button>
      ),
    },
  ];

  // Feed Table Columns
  const feedColumns: Column<NotificationFeedItem>[] = [
    {
      key: 'timestamp',
      label: 'Timestamp',
      render: (_, row) => (
        <span style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
          {new Date(row.created_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'Recipient',
      render: (_, row) => {
        const uInfo = userDirectory[row.user_id];
        const name = uInfo?.name;
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontWeight: 600, color: row.user_id ? '#1e293b' : '#94a3b8', fontSize: '0.85rem' }}>
              {name || row.user_id || 'All Users / Broadcast'}
            </span>
            {name && row.user_id && (
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                ID: {row.user_id}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'type',
      label: 'Type',
      render: (_, row) => (
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            padding: '2px 7px',
            borderRadius: '5px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
          }}
        >
          {row.type}
        </span>
      ),
    },
    {
      key: 'message',
      label: 'Content',
      render: (_, row) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '420px' }}>
          <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.85rem' }}>{row.title}</span>
          <span
            style={{
              fontSize: '0.78rem',
              color: '#475569',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {row.body}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Read Status',
      render: (_, row) => (
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '5px',
            backgroundColor: row.is_read ? '#dcfce7' : '#fef9c3',
            color: row.is_read ? '#166534' : '#854d0e',
          }}
        >
          {row.is_read ? 'Read' : 'Unread'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ width: '100%', padding: '1.5rem 2rem', boxSizing: 'border-box' }}>
      {/* Top Header & Refresh */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🔔</span>
            <h1
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              Notification & Live Devices Hub
            </h1>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '12px',
                fontSize: '0.72rem',
                fontWeight: 600,
                backgroundColor: '#ecfdf5',
                color: '#059669',
                border: '1px solid #a7f3d0',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                }}
              />
              Live Monitoring Active
            </span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Real-time SSE connections, native Firebase FCM mobile devices, and WebPush subscribers across Staff and Customer portals.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => {
            fetchStats();
            if (activeTab === 'devices') fetchDevices();
            if (activeTab === 'feed') fetchFeed();
          }}
          disabled={statsLoading || devicesLoading || feedLoading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            style={{
              transform: statsLoading || devicesLoading || feedLoading ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.4s ease',
            }}
          >
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Refresh Live Data
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Card 1: SSE Live Streams */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: '#10b981',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>SSE LIVE STREAMS</span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10b981',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.7)',
              }}
            />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 4px 0' }}>
            {stats?.active_sse_connections ?? 0}
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Staff: <strong style={{ color: '#0f172a' }}>{stats?.sse_staff_connections ?? 0}</strong></span>
            <span>•</span>
            <span>Customer: <strong style={{ color: '#0f172a' }}>{stats?.sse_customer_connections ?? 0}</strong></span>
          </div>
        </div>

        {/* Card 2: FCM Native Mobile */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: '#3b82f6',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>NATIVE DEVICES (FCM)</span>
            <span style={{ fontSize: '1rem' }}>📱</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 4px 0' }}>
            {stats?.active_fcm_devices ?? 0}
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Staff: <strong style={{ color: '#0f172a' }}>{stats?.fcm_staff_devices ?? 0}</strong></span>
            <span>•</span>
            <span>Customer: <strong style={{ color: '#0f172a' }}>{stats?.fcm_customer_devices ?? 0}</strong></span>
          </div>
        </div>

        {/* Card 3: WebPush Browser Subscribers */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: '#8b5cf6',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>WEB PUSH BROWSERS</span>
            <span style={{ fontSize: '1rem' }}>🌐</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 4px 0' }}>
            {stats?.active_web_push ?? 0}
          </div>
          <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Staff: <strong style={{ color: '#0f172a' }}>{stats?.web_push_staff ?? 0}</strong></span>
            <span>•</span>
            <span>Customer: <strong style={{ color: '#0f172a' }}>{stats?.web_push_customer ?? 0}</strong></span>
          </div>
        </div>

        {/* Card 4: SQLite Notifications Sent */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.15rem 1.25rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              backgroundColor: '#f59e0b',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>AUDIT NOTIFICATIONS</span>
            <span style={{ fontSize: '1rem' }}>📦</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a', margin: '8px 0 4px 0' }}>
            {stats?.total_notifications_sent ?? 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Persisted in SQLite database with zero loss
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '1.25rem',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('devices')}
          style={{
            padding: '10px 18px',
            fontSize: '0.86rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'devices' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'devices' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Active Devices & Channels</span>
          <span
            style={{
              fontSize: '0.72rem',
              backgroundColor: activeTab === 'devices' ? '#dbeafe' : '#f1f5f9',
              color: activeTab === 'devices' ? '#1e40af' : '#475569',
              padding: '1px 7px',
              borderRadius: '10px',
            }}
          >
            {deviceTotal}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('feed')}
          style={{
            padding: '10px 18px',
            fontSize: '0.86rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'feed' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'feed' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Notification Audit Feed</span>
          <span
            style={{
              fontSize: '0.72rem',
              backgroundColor: activeTab === 'feed' ? '#dbeafe' : '#f1f5f9',
              color: activeTab === 'feed' ? '#1e40af' : '#475569',
              padding: '1px 7px',
              borderRadius: '10px',
            }}
          >
            {feedTotal}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('test')}
          style={{
            padding: '10px 18px',
            fontSize: '0.86rem',
            fontWeight: 600,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'test' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'test' ? '#2563eb' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease',
          }}
        >
          <span>Multi-Channel Test Console</span>
        </button>
      </div>

      {/* Tab 1 Content: Devices & Channels */}
      {activeTab === 'devices' && (
        <div>
          {/* Integrated Filter Toolbar directly above DataTable */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '320px' }}>
              <input
                type="text"
                value={deviceSearch}
                onChange={(e) => setDeviceSearch(e.target.value)}
                placeholder="Search by User ID, model, app version or token..."
                style={{
                  width: '100%',
                  maxWidth: '360px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                }}
              />

              <div style={{ width: '160px' }}>
                <Select
                  value={userTypeFilter}
                  onChange={(val) => {
                    setUserTypeFilter(val);
                    setDevicePage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Portals' },
                    { value: 'staff', label: 'Staff Portal' },
                    { value: 'customer', label: 'Customer Portal' },
                  ]}
                />
              </div>

              <div style={{ width: '160px' }}>
                <Select
                  value={platformFilter}
                  onChange={(val) => {
                    setPlatformFilter(val);
                    setDevicePage(1);
                  }}
                  options={[
                    { value: 'all', label: 'All Platforms' },
                    { value: 'android', label: 'Android (FCM)' },
                    { value: 'ios', label: 'iOS Native' },
                    { value: 'web', label: 'Web Browser' },
                  ]}
                />
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => setActiveTab('test')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
            >
              + Dispatch Test Notification
            </Button>
          </div>

          <DataTable
            data={filteredDevices}
            columns={deviceColumns}
            loading={devicesLoading}
            currentPage={devicePage}
            setCurrentPage={(p) => setDevicePage(p)}
            pageSize={deviceLimit}
            setPageSize={(s) => {
              setDeviceLimit(s);
              setDevicePage(1);
            }}
            totalItems={deviceTotal}
            onRefresh={fetchDevices}
            hideSearch={true}
          />
        </div>
      )}

      {/* Tab 2 Content: Audit Feed */}
      {activeTab === 'feed' && (
        <div>
          <DataTable
            data={feed}
            columns={feedColumns}
            loading={feedLoading}
            currentPage={feedPage}
            setCurrentPage={(p) => setFeedPage(p)}
            pageSize={feedLimit}
            setPageSize={(s) => {
              setFeedLimit(s);
              setFeedPage(1);
            }}
            totalItems={feedTotal}
            onRefresh={fetchFeed}
            hideSearch={true}
          />
        </div>
      )}

      {/* Tab 3 Content: Multi-Channel Test Console */}
      {activeTab === 'test' && (
        <div
          style={{
            maxWidth: '720px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '1.75rem 2rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 4px 0' }}>
              Multi-Channel Live Notification Dispatcher
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>
              Broadcasts simultaneously to live SSE web stream, Firebase Native Push (FCM), and WebPush service workers.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Recipient User ID *
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Select
                  value={targetUserId}
                  onChange={(val) => setTargetUserId(val)}
                  options={[
                    { value: '', label: '-- Select a Recipient / Active Device --' },
                    ...devices.map((d) => {
                      const u = userDirectory[d.user_id];
                      const name = u?.name || d.user_name || d.user_id;
                      const email = u?.email || d.user_email ? ` (${u?.email || d.user_email})` : '';
                      const sseLive = d.has_live_sse || d.sse_connected;
                      const sseLabel = sseLive ? ` • 🟢 Live SSE (${d.sse_connections_count || 1})` : '';
                      return {
                        value: d.user_id,
                        label: `${d.user_type === 'customer' ? '👤 [CUSTOMER]' : '🏢 [STAFF]'} ${name}${email} — [${d.platform?.toUpperCase() || 'WEB'}] ${d.device_model || ''}${sseLabel}`,
                      };
                    }),
                    // Also include all known directory users not already in active devices list
                    ...Object.values(userDirectory)
                      .filter((u) => !devices.some((d) => d.user_id === u.id))
                      .map((u) => ({
                        value: u.id,
                        label: `${u.type === 'customer' ? '👤 [CUSTOMER]' : '🏢 [STAFF]'} ${u.name}${u.email ? ` (${u.email})` : ''} — [Directory User]`,
                      })),
                  ]}
                />
                <input
                  type="text"
                  value={targetUserId}
                  onChange={(e) => setTargetUserId(e.target.value)}
                  placeholder="Or enter user UUID directly (e.g. 6a2c-4b12...)"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {targetUserId && userDirectory[targetUserId] && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      color: '#166534',
                    }}
                  >
                    <span>
                      Selected: <strong>{userDirectory[targetUserId].name}</strong>
                      {userDirectory[targetUserId].email ? ` (${userDirectory[targetUserId].email})` : ''}
                      {' • '}
                      <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{userDirectory[targetUserId].role}</span>
                    </span>
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '3px', display: 'block' }}>
                Select an active device above, or enter any user UUID registered in current tenant.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Notification Title *
              </label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder="e.g. New Sales Order Created"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Notification Body *
              </label>
              <textarea
                value={testBody}
                onChange={(e) => setTestBody(e.target.value)}
                rows={3}
                placeholder="Message content shown on Android lock-screen and browser desktop banner..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Notification Type
                </label>
                <Select
                  value={testType}
                  onChange={(val) => setTestType(val)}
                  options={[
                    { value: 'mention', label: 'Mention (@User)' },
                    { value: 'alert', label: 'Urgent Alert' },
                    { value: 'system', label: 'System Notice' },
                    { value: 'ticket', label: 'Support Ticket' },
                  ]}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Target Route / Deep Link
                </label>
                <input
                  type="text"
                  value={testLink}
                  onChange={(e) => setTestLink(e.target.value)}
                  placeholder="/#/dashboard or /#/sales"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <Button
                variant="primary"
                onClick={handleDispatchTest}
                disabled={dispatching}
                style={{ padding: '0.6rem 1.5rem', fontSize: '0.88rem' }}
              >
                {dispatching ? 'Dispatching...' : '🚀 Dispatch Multi-Channel Notification'}
              </Button>
            </div>

            {/* Test Result Display */}
            {lastDispatchResult && (
              <div
                style={{
                  marginTop: '1rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 18px',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                  Dispatch Status Receipt
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.78rem' }}>
                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: lastDispatchResult.delivered_sse ? '#ecfdf5' : '#fef2f2',
                      color: lastDispatchResult.delivered_sse ? '#065f46' : '#991b1b',
                    }}
                  >
                    SSE Live: <strong>{lastDispatchResult.delivered_sse ? 'Delivered' : 'Offline'}</strong>
                  </div>

                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: lastDispatchResult.fcm_dispatched_count > 0 ? '#eff6ff' : '#f8fafc',
                      color: lastDispatchResult.fcm_dispatched_count > 0 ? '#1e40af' : '#64748b',
                    }}
                  >
                    FCM Native: <strong>{lastDispatchResult.fcm_dispatched_count} device(s)</strong>
                  </div>

                  <div
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: lastDispatchResult.web_push_dispatched_count > 0 ? '#faf5ff' : '#f8fafc',
                      color: lastDispatchResult.web_push_dispatched_count > 0 ? '#6b21a8' : '#64748b',
                    }}
                  >
                    WebPush: <strong>{lastDispatchResult.web_push_dispatched_count} browser(s)</strong>
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#94a3b8' }}>
                  Notification ID: <code>{lastDispatchResult.notification_id}</code>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
