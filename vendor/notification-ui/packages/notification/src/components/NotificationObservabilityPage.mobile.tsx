import React, { useState, useEffect, useCallback } from 'react';
import { Button, useToast, Select, apiClient } from '@geeksman/core-ui';
import {
  NotificationAdminStats,
  AdminDeviceItem,
  NotificationFeedItem,
  TestDispatchResult,
  UserDirectoryEntry,
  notifAdminGet,
  notifAdminPost,
} from './NotificationObservabilityPage.desktop';

export const NotificationObservabilityPageMobile: React.FC = () => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'devices' | 'feed' | 'test'>('devices');
  const [stats, setStats] = useState<NotificationAdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  // User Directory cache for human-friendly names
  const [userDirectory, setUserDirectory] = useState<Record<string, UserDirectoryEntry>>({});

  // Fetch complete User Directory across staff & contacts
  const fetchUserDirectory = useCallback(async () => {
    try {
      const dir: Record<string, UserDirectoryEntry> = {};

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
      console.warn('Failed to load user directory in mobile', err);
    }
  }, []);

  // Search & Filter Drawer
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [userTypeFilter, setUserTypeFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Devices & Pagination
  const [devices, setDevices] = useState<AdminDeviceItem[]>([]);
  const [devicesLoading, setDevicesLoading] = useState<boolean>(false);
  const [devicePage, setDevicePage] = useState<number>(1);
  const [deviceTotal, setDeviceTotal] = useState<number>(0);

  // Feed & Pagination
  const [feed, setFeed] = useState<NotificationFeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState<boolean>(false);
  const [feedPage, setFeedPage] = useState<number>(1);
  const [feedTotal, setFeedTotal] = useState<number>(0);

  // Test Dispatch
  const [targetUserId, setTargetUserId] = useState<string>('');
  const [testTitle, setTestTitle] = useState<string>('Mobile Alert');
  const [testBody, setTestBody] = useState<string>('Testing push notification delivery from mobile console.');
  const [testType, setTestType] = useState<string>('mention');
  const [testLink, setTestLink] = useState<string>('/dashboard');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['sse', 'webpush', 'fcm']);
  const [dispatching, setDispatching] = useState<boolean>(false);
  const [lastDispatchResult, setLastDispatchResult] = useState<TestDispatchResult | null>(null);

  // Fetch Stats
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
      console.warn('Failed to load stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch Devices
  const fetchDevices = useCallback(async (pageToLoad: number, append: boolean = false) => {
    setDevicesLoading(true);
    try {
      const params: Record<string, any> = {
        page: pageToLoad,
        limit: 15,
      };
      if (userTypeFilter !== 'all') params.user_type = userTypeFilter;
      if (platformFilter !== 'all') params.platform = platformFilter;

      const resp = await notifAdminGet('/admin/devices', params);
      const items = resp.data?.data || [];
      const newItems = Array.isArray(items) ? items : [];

      setDevices((prev) => (append ? [...prev, ...newItems] : newItems));
      const pagination = resp.data?.pagination_data || resp.data?.pagination;
      const headerTotal = resp.headers?.['x-total-count'] ? parseInt(resp.headers['x-total-count'], 10) : undefined;
      const total = pagination?.total_results ?? headerTotal ?? resp.data?.total ?? resp.data?.total_results ?? (append ? devices.length + newItems.length : newItems.length);
      setDeviceTotal(total);
    } catch (err: any) {
      console.warn('Failed to load devices:', err);
      if (!append) setDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  }, [userTypeFilter, platformFilter, devices.length]);

  // Fetch Feed
  const fetchFeed = useCallback(async (pageToLoad: number, append: boolean = false) => {
    setFeedLoading(true);
    try {
      const resp = await notifAdminGet('/admin/feed', {
        page: pageToLoad,
        limit: 15,
      });
      const items = resp.data?.data || [];
      const newItems = Array.isArray(items) ? items : [];

      setFeed((prev) => (append ? [...prev, ...newItems] : newItems));
      const pagination = resp.data?.pagination_data || resp.data?.pagination;
      const headerTotal = resp.headers?.['x-total-count'] ? parseInt(resp.headers['x-total-count'], 10) : undefined;
      const total = pagination?.total_results ?? headerTotal ?? resp.data?.total ?? resp.data?.total_results ?? (append ? feed.length + newItems.length : newItems.length);
      setFeedTotal(total);
    } catch (err: any) {
      console.warn('Failed to load feed:', err);
      if (!append) setFeed([]);
    } finally {
      setFeedLoading(false);
    }
  }, [feed.length]);

  useEffect(() => {
    fetchStats();
    fetchUserDirectory();
  }, [fetchStats, fetchUserDirectory]);

  useEffect(() => {
    if (activeTab === 'devices') {
      setDevicePage(1);
      fetchDevices(1, false);
    } else if (activeTab === 'feed') {
      setFeedPage(1);
      fetchFeed(1, false);
    }
  }, [activeTab, userTypeFilter, platformFilter, fetchDevices, fetchFeed]);

  // Handle Load More
  const handleLoadMoreDevices = () => {
    const nextPage = devicePage + 1;
    setDevicePage(nextPage);
    fetchDevices(nextPage, true);
  };

  const handleLoadMoreFeed = () => {
    const nextPage = feedPage + 1;
    setFeedPage(nextPage);
    fetchFeed(nextPage, true);
  };

  // Handle Dispatch Test
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
        recipient_id: targetUserId.trim(),
        title: testTitle.trim(),
        body: testBody.trim(),
        type: testType,
        link: testLink.trim() || undefined,
        route: testLink.trim() || undefined,
        channels: selectedChannels.length > 0 ? selectedChannels : undefined,
      };
      const resp = await notifAdminPost('/admin/test-dispatch', payload);
      const result: TestDispatchResult = resp.data?.data || resp.data;
      setLastDispatchResult(result);
      showToast('Dispatched successfully!', 'success');
      fetchStats();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to dispatch';
      showToast(msg, 'error');
    } finally {
      setDispatching(false);
    }
  };

  // Filtered devices client-side search
  const filteredDevices = devices.filter((d) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    const u = userDirectory[d.user_id];
    return (
      d.user_id.toLowerCase().includes(q) ||
      (d.user_name && d.user_name.toLowerCase().includes(q)) ||
      (d.user_email && d.user_email.toLowerCase().includes(q)) ||
      (u?.name && u.name.toLowerCase().includes(q)) ||
      (u?.email && u.email.toLowerCase().includes(q)) ||
      (d.device_model && d.device_model.toLowerCase().includes(q)) ||
      (d.app_version && d.app_version.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', paddingBottom: '100px', boxSizing: 'border-box' }}>
      {/* Top Header */}
      <div style={{ padding: '16px 16px 8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.25rem' }}>🔔</span>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
              Live Devices Hub
            </h1>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>SSE, FCM Android & Web Push Observability</span>
        </div>

        <button
          type="button"
          onClick={() => {
            fetchStats();
            fetchUserDirectory();
            if (activeTab === 'devices') fetchDevices(1, false);
            if (activeTab === 'feed') fetchFeed(1, false);
          }}
          disabled={statsLoading || devicesLoading || feedLoading}
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '7px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            color: '#334155',
            cursor: 'pointer',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M23 4v6h-6" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          Sync
        </button>
      </div>

      {/* Horizontal KPI Metric Cards */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          padding: '8px 16px 14px 16px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {/* SSE Stream Card */}
        <div
          style={{
            flexShrink: 0,
            width: '135px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '10px 12px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            borderTop: '3px solid #10b981',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>SSE LIVE</span>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0' }}>
            {stats?.active_sse_connections ?? 0}
          </div>
          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
            S:{stats?.sse_staff_connections ?? 0} | C:{stats?.sse_customer_connections ?? 0}
          </span>
        </div>

        {/* FCM Card */}
        <div
          style={{
            flexShrink: 0,
            width: '135px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '10px 12px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            borderTop: '3px solid #3b82f6',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>FCM NATIVE</span>
            <span style={{ fontSize: '0.8rem' }}>📱</span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0' }}>
            {stats?.active_fcm_devices ?? 0}
          </div>
          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
            S:{stats?.fcm_staff_devices ?? 0} | C:{stats?.fcm_customer_devices ?? 0}
          </span>
        </div>

        {/* WebPush Card */}
        <div
          style={{
            flexShrink: 0,
            width: '135px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '10px 12px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            borderTop: '3px solid #8b5cf6',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b' }}>WEB PUSH</span>
            <span style={{ fontSize: '0.8rem' }}>🌐</span>
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 2px 0' }}>
            {stats?.active_web_push ?? 0}
          </div>
          <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
            S:{stats?.web_push_staff ?? 0} | C:{stats?.web_push_customer ?? 0}
          </span>
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div style={{ padding: '0 16px', marginBottom: '12px' }}>
        <div
          style={{
            display: 'flex',
            backgroundColor: '#e2e8f0',
            borderRadius: '10px',
            padding: '3px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('devices')}
            style={{
              flex: 1,
              padding: '7px 0',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'devices' ? '#ffffff' : 'transparent',
              color: activeTab === 'devices' ? '#2563eb' : '#64748b',
              boxShadow: activeTab === 'devices' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Devices ({deviceTotal})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feed')}
            style={{
              flex: 1,
              padding: '7px 0',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'feed' ? '#ffffff' : 'transparent',
              color: activeTab === 'feed' ? '#2563eb' : '#64748b',
              boxShadow: activeTab === 'feed' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Audit Logs
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('test')}
            style={{
              flex: 1,
              padding: '7px 0',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: activeTab === 'test' ? '#ffffff' : 'transparent',
              color: activeTab === 'test' ? '#2563eb' : '#64748b',
              boxShadow: activeTab === 'test' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Test Console
          </button>
        </div>
      </div>

      {/* Tab 1: Devices */}
      {activeTab === 'devices' && (
        <div style={{ padding: '0 16px' }}>
          {/* Single Top Search Bar & Filter Drawer Icon */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search user, device, version..."
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 34px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2.5"
                style={{ position: 'absolute', left: '11px', top: '12px' }}
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

            {/* Filter Drawer Trigger Icon */}
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                backgroundColor: userTypeFilter !== 'all' || platformFilter !== 'all' ? '#eff6ff' : '#ffffff',
                color: userTypeFilter !== 'all' || platformFilter !== 'all' ? '#2563eb' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
            </button>
          </div>

          {/* Device Cards List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredDevices.map((d) => {
              const uInfo = userDirectory[d.user_id];
              const displayName = uInfo?.name || d.user_name || d.user_id;
              const displayEmail = uInfo?.email || d.user_email;
              const displayRole = uInfo?.role || d.user_type || 'staff';
              const isCustomer = d.user_type === 'customer' || uInfo?.type === 'customer';
              const isSSE = Boolean(d.has_live_sse || d.sse_connected || (d.sse_connections_count && d.sse_connections_count > 0));
              const sseCount = d.sse_connections_count && d.sse_connections_count > 0 ? d.sse_connections_count : 1;
              const hasFCM = Boolean(d.has_fcm || (d.device_token && (d.platform === 'android' || d.platform === 'ios')));
              const regDateStr = d.registered_at || d.created_at;
              let formattedDate = '';
              if (regDateStr && !isNaN(new Date(regDateStr).getTime())) {
                formattedDate = new Date(regDateStr).toLocaleDateString();
              }

              return (
                <div
                  key={d.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '1rem 1.15rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                          {displayName}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: isCustomer ? '#f3e8ff' : '#e0e7ff',
                            color: isCustomer ? '#6b21a8' : '#3730a3',
                          }}
                        >
                          {displayRole}
                        </span>
                      </div>
                      {displayEmail && (
                        <span style={{ fontSize: '0.74rem', color: '#475569', display: 'block', marginTop: '1px' }}>
                          {displayEmail}
                        </span>
                      )}
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontFamily: 'monospace', display: 'block', marginTop: '1px' }}>
                        ID: {d.user_id}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                        {d.device_model || (d.platform === 'web' ? 'Web Browser' : 'Android Client')}
                        {d.app_version ? ` • v${d.app_version}` : ''}
                        {formattedDate ? ` • ${formattedDate}` : ''}
                      </span>
                    </div>

                    {/* Test action */}
                    <button
                      type="button"
                      onClick={() => {
                        setTargetUserId(d.user_id);
                        setActiveTab('test');
                      }}
                      style={{
                        background: '#eff6ff',
                        border: '1px solid #bfdbfe',
                        color: '#1d4ed8',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Send Test
                    </button>
                  </div>

                  {/* Channel Indicators */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '5px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        backgroundColor: isSSE ? '#ecfdf5' : '#f8fafc',
                        color: isSSE ? '#047857' : '#94a3b8',
                        border: isSSE ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: isSSE ? '#10b981' : '#cbd5e1',
                          boxShadow: isSSE ? '0 0 6px rgba(16, 185, 129, 0.7)' : 'none',
                        }}
                      />
                      {isSSE ? `Live SSE (${sseCount} ${sseCount === 1 ? 'stream' : 'streams'})` : 'SSE Offline'}
                    </span>

                    {hasFCM && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 7px',
                          borderRadius: '5px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: '#eff6ff',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                        }}
                      >
                        FCM Native
                      </span>
                    )}

                    {d.has_web_push && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 7px',
                          borderRadius: '5px',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          backgroundColor: '#faf5ff',
                          color: '#7e22ce',
                          border: '1px solid #e9d5ff',
                        }}
                      >
                        Web Push
                      </span>
                    )}
                  </div>

                  {d.device_token && (
                    <div style={{ marginTop: '8px' }}>
                      <code
                        title="Click to copy full token"
                        onClick={() => {
                          navigator.clipboard.writeText(d.device_token);
                          showToast('Full FCM Device Token copied to clipboard!', 'success');
                        }}
                        style={{
                          fontSize: '0.72rem',
                          backgroundColor: '#f1f5f9',
                          padding: '3px 8px',
                          borderRadius: '5px',
                          color: '#2563eb',
                          fontFamily: 'monospace',
                          cursor: 'pointer',
                          display: 'inline-block',
                          border: '1px solid #cbd5e1',
                        }}
                      >
                        {d.device_token.length > 20
                          ? `${d.device_token.slice(0, 10)}...${d.device_token.slice(-8)}`
                          : d.device_token} 📋
                      </code>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredDevices.length === 0 && !devicesLoading && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                No registered devices found.
              </div>
            )}
          </div>

          {/* Load More Footer */}
          {devices.length < deviceTotal && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                Showing {devices.length} of {deviceTotal} devices
              </span>
              <Button
                variant="secondary"
                onClick={handleLoadMoreDevices}
                disabled={devicesLoading}
                style={{ width: '100%', padding: '8px' }}
              >
                {devicesLoading ? 'Loading...' : 'Load More Devices'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Feed */}
      {activeTab === 'feed' && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {feed.map((item) => {
              const uInfo = userDirectory[item.user_id];
              return (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '1rem 1.15rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#2563eb' }}>
                      {uInfo?.name || item.user_id || 'All Users / Broadcast'}
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4 }}>
                    {item.body}
                  </div>
                </div>
              );
            })}

            {feed.length === 0 && !feedLoading && (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                No notifications logged yet.
              </div>
            )}
          </div>

          {feed.length < feedTotal && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Button
                variant="secondary"
                onClick={handleLoadMoreFeed}
                disabled={feedLoading}
                style={{ width: '100%', padding: '8px' }}
              >
                {feedLoading ? 'Loading...' : 'Load More Logs'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Test Console */}
      {activeTab === 'test' && (
        <div style={{ padding: '0 16px' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '1.25rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 12px 0' }}>
              Dispatch Test Message
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Select Target Device / User *
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Select
                    value={targetUserId}
                    onChange={(val) => setTargetUserId(val)}
                    options={[
                      { value: '', label: '-- Choose Recipient / Device --' },
                      ...devices.map((d) => {
                        const u = userDirectory[d.user_id];
                        const name = u?.name || d.user_name || d.user_id;
                        const sseLive = d.has_live_sse || d.sse_connected;
                        const sseLabel = sseLive ? ` • 🟢 Live (${d.sse_connections_count || 1})` : '';
                        return {
                          value: d.user_id,
                          label: `${d.user_type === 'customer' ? '👤' : '🏢'} ${name} — [${d.platform?.toUpperCase() || 'WEB'}]${sseLabel}`,
                        };
                      }),
                      ...Object.values(userDirectory)
                        .filter((u) => !devices.some((d) => d.user_id === u.id))
                        .map((u) => ({
                          value: u.id,
                          label: `${u.type === 'customer' ? '👤' : '🏢'} ${u.name} — [Directory User]`,
                        })),
                    ]}
                  />
                  <input
                    type="text"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    placeholder="Or enter user UUID directly..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box',
                    }}
                  />
                  {targetUserId && userDirectory[targetUserId] && (
                    <div
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        color: '#166534',
                      }}
                    >
                      Selected: <strong>{userDirectory[targetUserId].name}</strong> ({userDirectory[targetUserId].role})
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Title *
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Body *
                </label>
                <textarea
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Type
                </label>
                <Select
                  value={testType}
                  onChange={(val) => setTestType(val)}
                  options={[
                    { value: 'mention', label: 'Mention' },
                    { value: 'alert', label: 'Alert' },
                    { value: 'system', label: 'System' },
                  ]}
                />
              </div>

              {/* Channel Selector */}
              <div style={{ marginTop: '4px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Delivery Channels
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {([
                    { key: 'sse', label: '⚡ SSE', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
                    { key: 'webpush', label: '🔔 Web Push', color: '#7e22ce', bg: '#faf5ff', border: '#e9d5ff' },
                    { key: 'fcm', label: '📱 FCM', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
                  ] as const).map(({ key, label, color, bg, border }) => {
                    const active = selectedChannels.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() =>
                          setSelectedChannels((prev) =>
                            prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
                          )
                        }
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '5px 12px',
                          borderRadius: '7px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          border: `1.5px solid ${active ? border : '#e2e8f0'}`,
                          backgroundColor: active ? bg : '#f8fafc',
                          color: active ? color : '#94a3b8',
                          outline: 'none',
                        }}
                      >
                        {active && <span style={{ fontSize: '0.6rem' }}>✓</span>}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleDispatchTest}
                disabled={dispatching || selectedChannels.length === 0}
                style={{ width: '100%', marginTop: '6px', padding: '10px' }}
              >
                {dispatching ? 'Sending...' : `🚀 Send via ${selectedChannels.length === 0 ? '—' : selectedChannels.map((c) => c.toUpperCase()).join(' + ')}`}
              </Button>

              {lastDispatchResult && (
                <div style={{ marginTop: '8px', backgroundColor: '#f1f5f9', borderRadius: '8px', padding: '10px', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {(lastDispatchResult.channel_results || []).map((cr) => {
                    const channelLabel: Record<string, string> = {
                      sqlite: '💾 Stored',
                      sse: '⚡ SSE',
                      fcm: '📱 FCM',
                      webpush: '🔔 Web Push',
                    };
                    return (
                      <div key={cr.channel} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#334155' }}>{channelLabel[cr.channel] || cr.channel}</span>
                        <span style={{ padding: '2px 8px', borderRadius: '5px', fontWeight: 700, fontSize: '0.7rem', backgroundColor: cr.success ? '#dcfce7' : '#fee2e2', color: cr.success ? '#166534' : '#991b1b' }}>
                          {cr.success ? 'Sent' : 'Failed'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-Up Bottom Sheet Filter Drawer */}
      {isFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.45)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'flex-end',
          }}
          onClick={() => setIsFilterOpen(false)}
        >
          <div
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              borderRadius: '24px 24px 0 0',
              padding: '1.5rem',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Filter Channels
              </h3>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', color: '#64748b', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Portal User Type
                </label>
                <Select
                  value={userTypeFilter}
                  onChange={(val) => setUserTypeFilter(val)}
                  options={[
                    { value: 'all', label: 'All Portals (Staff & Customer)' },
                    { value: 'staff', label: 'Staff Portal Only' },
                    { value: 'customer', label: 'Customer Portal Only' },
                  ]}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Platform Channel
                </label>
                <Select
                  value={platformFilter}
                  onChange={(val) => setPlatformFilter(val)}
                  options={[
                    { value: 'all', label: 'All Platforms' },
                    { value: 'android', label: 'Android (FCM Native)' },
                    { value: 'web', label: 'Web Browser' },
                  ]}
                />
              </div>
            </div>

            <Button
              variant="primary"
              style={{ width: '100%', padding: '10px' }}
              onClick={() => setIsFilterOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) for Quick Test */}
      {activeTab !== 'test' && (
        <button
          type="button"
          onClick={() => setActiveTab('test')}
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.45)',
            cursor: 'pointer',
            zIndex: 900,
          }}
          title="Dispatch Test Notification"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      )}
    </div>
  );
};
