import React, { useState, useEffect, useRef } from 'react';
import { apiClient, useToast } from '@geeksman/core-ui';
import {
  META_BLUE,
  WHATSAPP_GREEN,
  WhatsAppAccount,
  WhatsAppTemplate,
  WhatsAppContact,
  WhatsAppLog,
  MetaBlueTickIcon,
} from './types';
import { metaWaGet, metaWaPost, metaWaPut } from './api';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.55rem 0.75rem',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  marginTop: '4px',
  fontSize: '0.875rem',
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#334155',
  display: 'block',
};

export const MetaWhatsAppDesktop: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'accounts' | 'templates' | 'contacts' | 'logs'>('accounts');
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search filters for datalist
  const [logSearch, setLogSearch] = useState('');
  const [contactSearch, setContactSearch] = useState('');

  // Connection Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAccountID, setSelectedAccountID] = useState<string>('');

  // Send Test Message Modal
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [sendLoading, setSendLoading] = useState<boolean>(false);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [testPayload, setTestPayload] = useState({
    account_id: '',
    recipient_phone: '',
    message_type: 'TEMPLATE' as 'TEMPLATE' | 'SESSION_TEXT' | 'SESSION_MEDIA',
    template_name: '',
    template_params: '',
    text_content: '',
    media_url: '',
    force_template: false,
  });

  const [formData, setFormData] = useState({
    connection_name: '',
    phone_number: '',
    phone_number_id: '',
    waba_id: '',
    access_token: '',
    webhook_verify_token: `wh_v_${Math.random().toString(36).substring(2, 10)}`,
    webhook_secret: '',
    is_default: true,
  });

  const baseURL = typeof window !== 'undefined' ? window.location.origin : 'https://api.geeksman.com';
  const tenantCode = 'org_default';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Ensure templates are always loaded (needed for the send modal dropdown)
  useEffect(() => {
    if (templates.length === 0) {
      metaWaGet('/meta-whatsapp/templates')
        .then((res) => setTemplates(res.data?.data || []))
        .catch(() => {});
    }
  }, []);

  // Auto-select first approved template when modal opens
  useEffect(() => {
    if (isTestModalOpen && testPayload.template_name === '') {
      const approved = templates.find((t) => t.status === 'APPROVED') || templates[0];
      if (approved) {
        setTestPayload((prev) => ({ ...prev, template_name: approved.name }));
      }
    }
  }, [isTestModalOpen, templates]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'accounts') {
        const res = await metaWaGet('/meta-whatsapp/accounts');
        setAccounts(res.data?.data || []);
      } else if (activeTab === 'templates') {
        const res = await metaWaGet('/meta-whatsapp/templates');
        setTemplates(res.data?.data || []);
      } else if (activeTab === 'contacts') {
        const res = await metaWaGet('/meta-whatsapp/contacts?limit=500');
        setContacts(res.data?.data || []);
      } else if (activeTab === 'logs') {
        const res = await metaWaGet('/meta-whatsapp/logs?limit=500');
        setLogs(res.data?.data || []);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to fetch WhatsApp data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedAccountID) {
        await metaWaPut(`/meta-whatsapp/accounts/${selectedAccountID}`, formData);
        showToast('WhatsApp Connection updated successfully', 'success');
      } else {
        await metaWaPost('/meta-whatsapp/accounts', formData);
        showToast('Meta WhatsApp Business connected successfully', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save WhatsApp account', 'error');
    }
  };

  const handleUploadPDF = async (file: File) => {
    setUploadLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const accountParam = testPayload.account_id ? `?account_id=${testPayload.account_id}` : '';
      const res = await apiClient.post(
        `/notification/meta-whatsapp/upload-media${accountParam}`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const mediaID = res.data?.data?.media_url || '';
      setTestPayload((prev) => ({ ...prev, media_url: mediaID }));
      showToast('PDF uploaded to Meta successfully! Media ID ready.', 'success');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to upload PDF', 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSendTestMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendLoading(true);
    try {
      const paramsArray = testPayload.template_params
        ? testPayload.template_params.split(',').map((s) => s.trim())
        : [];

      const body = {
        account_id: testPayload.account_id,
        recipient_phone: testPayload.recipient_phone,
        template_name: testPayload.template_name,
        template_params: paramsArray,
        text_content: testPayload.text_content,
        media_url: testPayload.media_url,
        force_template: testPayload.message_type === 'TEMPLATE',
      };

      const res = await metaWaPost('/meta-whatsapp/send', body);
      showToast(`WhatsApp message sent successfully! (WAMID: ${res.data?.data?.wamid || 'OK'})`, 'success');
      setIsTestModalOpen(false);
      if (activeTab === 'logs') fetchData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to send test WhatsApp message', 'error');
    } finally {
      setSendLoading(false);
    }
  };

  const handleSyncTemplates = async (accountID: string) => {
    try {
      await metaWaPost(`/meta-whatsapp/accounts/${accountID}/sync-templates`);
      showToast('WhatsApp templates synced successfully from Meta', 'success');
      // Refresh templates list and local cache
      const res = await metaWaGet('/meta-whatsapp/templates');
      setTemplates(res.data?.data || []);
      if (activeTab === 'templates') fetchData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to sync templates', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Webhook Callback URL copied to clipboard!', 'success');
  };

  // Filtered lists
  const filteredLogs = logs.filter((lg) => {
    const q = logSearch.toLowerCase();
    return (
      !q ||
      lg.recipient_phone?.toLowerCase().includes(q) ||
      lg.template_name?.toLowerCase().includes(q) ||
      lg.status?.toLowerCase().includes(q) ||
      lg.direction?.toLowerCase().includes(q)
    );
  });

  const filteredContacts = contacts.filter((ct) => {
    const q = contactSearch.toLowerCase();
    return (
      !q ||
      ct.phone_number?.toLowerCase().includes(q) ||
      ct.contact_name?.toLowerCase().includes(q) ||
      ct.status?.toLowerCase().includes(q)
    );
  });

  const tabBtn = (tab: typeof activeTab, label: string) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      style={{
        padding: '0.75rem 1rem',
        fontSize: '0.9rem',
        fontWeight: activeTab === tab ? 800 : 600,
        color: activeTab === tab ? META_BLUE : '#64748b',
        borderBottom: activeTab === tab ? `3px solid ${META_BLUE}` : 'none',
        background: 'none',
        borderTop: 'none',
        borderLeft: 'none',
        borderRight: 'none',
        cursor: 'pointer',
        transition: 'color 0.15s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ width: '100%', padding: '1.5rem 2rem', fontFamily: 'Outfit, Inter, sans-serif' }}>
      {/* Desktop Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MetaBlueTickIcon size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                Meta Official WhatsApp Business
              </h1>
              <span
                style={{
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                }}
              >
                OFFICIAL CLOUD API
              </span>
            </div>
            <p style={{ margin: '2px 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Send automated Template Invoices, Challans &amp; 24h Session Messages via Meta Graph API
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <a
            href="/#/integrations/whatsapp"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#16a34a',
              textDecoration: 'none',
              padding: '0.6rem 0.9rem',
              borderRadius: '10px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
            }}
          >
            <span>💬 Switch to WhatsApp (QR Connect)</span>
          </a>

          <button
            type="button"
            onClick={() => {
              if (accounts.length > 0) {
                setTestPayload((prev) => ({ ...prev, account_id: accounts[0].id }));
              }
              setIsTestModalOpen(true);
            }}
            style={{
              backgroundColor: WHATSAPP_GREEN,
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.25rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            🚀 Send Test Message
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedAccountID('');
              setFormData({
                connection_name: '',
                phone_number: '',
                phone_number_id: '',
                waba_id: '',
                access_token: '',
                webhook_verify_token: `wh_v_${Math.random().toString(36).substring(2, 10)}`,
                webhook_secret: '',
                is_default: true,
              });
              setIsModalOpen(true);
            }}
            style={{
              backgroundColor: META_BLUE,
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.25rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(24, 119, 242, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            + Connect Account
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
        {tabBtn('accounts', `📱 Connected Accounts (${accounts.length})`)}
        {tabBtn('templates', `📄 Message Templates (${templates.length})`)}
        {tabBtn('contacts', `👥 Contacts & 24h Window (${contacts.length})`)}
        {tabBtn('logs', `📊 Delivery Logs (${logs.length})`)}
      </div>

      {/* ── Contacts DataList ── */}
      {activeTab === 'contacts' && (
        <div>
          {/* Filter Toolbar */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.85rem' }}>
            <input
              type="search"
              placeholder="Search phone, name, status…"
              value={contactSearch}
              onChange={(e) => setContactSearch(e.target.value)}
              style={{ ...inputStyle, marginTop: 0, maxWidth: '340px' }}
            />
            <button
              type="button"
              onClick={fetchData}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: '#334155',
              }}
            >
              🔄 Refresh
            </button>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 'auto' }}>
              {filteredContacts.length} of {contacts.length} contacts
            </span>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Recipient Phone</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Contact Name</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Verification Status</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>24h Session Window</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Last Inbound Activity</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                      {contactSearch ? 'No contacts match your search.' : 'No contacts recorded yet. When customers reply to WhatsApp messages, their 24h session window will appear here.'}
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((ct) => {
                    const lastInbound = ct.last_inbound_at ? new Date(ct.last_inbound_at).getTime() : 0;
                    const isIn24hWindow = lastInbound > 0 && Date.now() - lastInbound <= 24 * 60 * 60 * 1000;
                    return (
                      <tr key={ct.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.85rem 1.25rem', fontWeight: 800, color: '#0f172a' }}>{ct.phone_number}</td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#334155' }}>{ct.contact_name || '—'}</td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px',
                            backgroundColor: ct.status === 'NOT_ON_WHATSAPP' ? '#fee2e2' : '#dcfce7',
                            color: ct.status === 'NOT_ON_WHATSAPP' ? '#b91c1c' : '#15803d',
                          }}>
                            {ct.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem' }}>
                          {isIn24hWindow
                            ? <span style={{ color: '#16a34a', fontWeight: 800 }}>🟢 24h Session Active (Free Text/Media)</span>
                            : <span style={{ color: '#64748b', fontWeight: 600 }}>🔴 Out of Window (Requires Template)</span>}
                        </td>
                        <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>
                          {ct.last_inbound_at ? new Date(ct.last_inbound_at).toLocaleString() : 'No inbound message yet'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Templates DataList ── */}
      {activeTab === 'templates' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '0.85rem 1.25rem' }}>Template Name</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Language</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Category</th>
                <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No templates synced. Click "Sync Templates" on your connected account to fetch Meta templates.
                  </td>
                </tr>
              ) : (
                templates.map((tpl) => (
                  <tr key={tpl.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#0f172a' }}>{tpl.name}</td>
                    <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>{tpl.language}</td>
                    <td style={{ padding: '0.85rem 1.25rem', color: '#334155' }}>{tpl.category}</td>
                    <td style={{ padding: '0.85rem 1.25rem' }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px',
                        backgroundColor: tpl.status === 'APPROVED' ? '#dcfce7' : '#fef3c7',
                        color: tpl.status === 'APPROVED' ? '#15803d' : '#92400e',
                      }}>
                        {tpl.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Logs DataList ── */}
      {activeTab === 'logs' && (
        <div>
          {/* Filter Toolbar */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.85rem' }}>
            <input
              type="search"
              placeholder="Search phone, template, status, direction…"
              value={logSearch}
              onChange={(e) => setLogSearch(e.target.value)}
              style={{ ...inputStyle, marginTop: 0, maxWidth: '380px' }}
            />
            <button
              type="button"
              onClick={fetchData}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f8fafc',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                color: '#334155',
              }}
            >
              🔄 Refresh
            </button>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', marginLeft: 'auto' }}>
              {filteredLogs.length} of {logs.length} entries
            </span>
          </div>

          <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Date/Time</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Direction</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Recipient Phone</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Type</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1.25rem' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                      {logSearch ? 'No logs match your search.' : 'No delivery logs recorded yet.'}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((lg) => (
                    <tr key={lg.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#64748b' }}>
                        {new Date(lg.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700 }}>
                        <span style={{ color: lg.direction === 'OUTBOUND' ? '#2563eb' : '#16a34a' }}>
                          {lg.direction === 'OUTBOUND' ? '↗ Outbound' : '↙ Inbound'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: 700, color: '#0f172a' }}>{lg.recipient_phone}</td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#475569' }}>
                        {lg.message_type} {lg.template_name ? `(${lg.template_name})` : ''}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px',
                          backgroundColor: ['SENT', 'DELIVERED', 'READ'].includes(lg.status) ? '#dcfce7' : '#fee2e2',
                          color: ['SENT', 'DELIVERED', 'READ'].includes(lg.status) ? '#15803d' : '#b91c1c',
                        }}>
                          {lg.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#64748b', fontSize: '0.78rem', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lg.error_details || lg.content || lg.wamid || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Accounts Cards ── */}
      {activeTab === 'accounts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {accounts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📱</div>
              <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No Meta WhatsApp Business Account Connected</h3>
              <p style={{ margin: '0 0 1.25rem', color: '#64748b', fontSize: '0.9rem' }}>
                Connect your Meta Cloud API Phone Number ID, WABA ID, and permanent Access Token to start sending messages.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                style={{ backgroundColor: META_BLUE, color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.65rem 1.5rem', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer' }}
              >
                + Connect WhatsApp Account
              </button>
            </div>
          ) : (
            accounts.map((acc) => {
              const webhookURL = `${baseURL}/api/v1/notification/meta-whatsapp/webhooks/${tenantCode}/${acc.id}`;
              return (
                <div key={acc.id} style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{acc.connection_name}</h3>
                        <MetaBlueTickIcon size={16} />
                      </div>
                      <span style={{ fontSize: '0.9rem', color: WHATSAPP_GREEN, fontWeight: 700 }}>{acc.phone_number}</span>
                    </div>
                    <span style={{ backgroundColor: acc.status === 'CONNECTED' ? '#dcfce7' : '#fee2e2', color: acc.status === 'CONNECTED' ? '#15803d' : '#b91c1c', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px' }}>
                      {acc.status}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', marginBottom: '1rem' }}>
                    <div><strong>Phone Number ID:</strong> <code>{acc.phone_number_id}</code></div>
                    <div><strong>WABA ID:</strong> <code>{acc.waba_id}</code></div>
                    <div><strong>Quality Rating:</strong> <span style={{ color: '#16a34a', fontWeight: 800 }}>{acc.quality_rating}</span></div>
                  </div>

                  <div style={{ backgroundColor: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>WEBHOOK CALLBACK URL (META CLOUD API)</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{webhookURL}</span>
                      <button type="button" onClick={() => copyToClipboard(webhookURL)} style={{ backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', padding: '2px 8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>Copy</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleSyncTemplates(acc.id)}
                      style={{ flex: 1, backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0.5rem', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      🔄 Sync Templates
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Modal: Send Test WhatsApp Message ── */}
      {isTestModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '560px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>🚀 Send Test WhatsApp Message</h2>
              <button type="button" onClick={() => setIsTestModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            <form onSubmit={handleSendTestMessage} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Account selector */}
              <div>
                <label style={labelStyle}>Select WhatsApp Connection</label>
                <select
                  value={testPayload.account_id}
                  onChange={(e) => setTestPayload({ ...testPayload, account_id: e.target.value })}
                  style={inputStyle}
                >
                  <option value="">Default Active Connection</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.connection_name} ({acc.phone_number})</option>
                  ))}
                </select>
              </div>

              {/* Recipient */}
              <div>
                <label style={labelStyle}>Recipient Phone Number (with Country Code)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +14155552671 or +919876543210"
                  value={testPayload.recipient_phone}
                  onChange={(e) => setTestPayload({ ...testPayload, recipient_phone: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Message type selector */}
              <div>
                <label style={labelStyle}>Message Dispatch Type</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
                  {(['TEMPLATE', 'SESSION_TEXT', 'SESSION_MEDIA'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTestPayload({ ...testPayload, message_type: t })}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        backgroundColor: testPayload.message_type === t ? META_BLUE : '#f8fafc',
                        color: testPayload.message_type === t ? '#ffffff' : '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      {t === 'TEMPLATE' ? '📄 Template (HSM)' : t === 'SESSION_TEXT' ? '💬 Free Text' : '📎 Media / PDF'}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── TEMPLATE fields: dropdown of synced templates ── */}
              {testPayload.message_type === 'TEMPLATE' && (
                <>
                  <div>
                    <label style={labelStyle}>Select Template</label>
                    {templates.length > 0 ? (
                      <select
                        value={testPayload.template_name}
                        onChange={(e) => setTestPayload({ ...testPayload, template_name: e.target.value })}
                        style={inputStyle}
                        required
                      >
                        <option value="">— Choose a template —</option>
                        {templates.map((tpl) => (
                          <option key={tpl.id} value={tpl.name}>
                            {tpl.name} [{tpl.language}] {tpl.status !== 'APPROVED' ? `(${tpl.status})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ marginTop: '4px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          required
                          placeholder="e.g. hello_world — sync templates first"
                          value={testPayload.template_name}
                          onChange={(e) => setTestPayload({ ...testPayload, template_name: e.target.value })}
                          style={inputStyle}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#f59e0b', whiteSpace: 'nowrap' }}>⚠ No templates synced</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label style={labelStyle}>Template Parameters (Comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Challan #1002, $500.00"
                      value={testPayload.template_params}
                      onChange={(e) => setTestPayload({ ...testPayload, template_params: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </>
              )}

              {/* SESSION_TEXT */}
              {testPayload.message_type === 'SESSION_TEXT' && (
                <div>
                  <label style={labelStyle}>Text Content</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Enter message text..."
                    value={testPayload.text_content}
                    onChange={(e) => setTestPayload({ ...testPayload, text_content: e.target.value })}
                    style={{ ...inputStyle, resize: 'vertical' }}
                  />
                </div>
              )}

              {/* SESSION_MEDIA: PDF upload + URL */}
              {testPayload.message_type === 'SESSION_MEDIA' && (
                <>
                  <div>
                    <label style={labelStyle}>Attach PDF / Image</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        marginTop: '6px',
                        padding: '1.25rem',
                        borderRadius: '10px',
                        border: '2px dashed #cbd5e1',
                        backgroundColor: '#f8fafc',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'border-color 0.15s',
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file) handleUploadPDF(file);
                      }}
                    >
                      {uploadLoading ? (
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>⏳ Uploading to Meta…</span>
                      ) : testPayload.media_url ? (
                        <div>
                          <div style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.85rem' }}>✅ Uploaded — Media ID ready</div>
                          <code style={{ fontSize: '0.72rem', color: '#475569', wordBreak: 'break-all' }}>{testPayload.media_url}</code>
                          <div style={{ marginTop: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setTestPayload((p) => ({ ...p, media_url: '' })); }}
                              style={{ fontSize: '0.75rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>📎</div>
                          <div style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Click or drag &amp; drop PDF / image</div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>PDF, JPG, PNG — max 16 MB</div>
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadPDF(file);
                      }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>— or paste Media URL / Media ID directly —</label>
                    <input
                      type="text"
                      placeholder="https://example.com/invoice.pdf  or  Meta Media ID"
                      value={testPayload.media_url}
                      onChange={(e) => setTestPayload({ ...testPayload, media_url: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Caption / Text Message</label>
                    <input
                      type="text"
                      placeholder="Please find attached your Sales Invoice"
                      value={testPayload.text_content}
                      onChange={(e) => setTestPayload({ ...testPayload, text_content: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(false)}
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendLoading || uploadLoading}
                  style={{ backgroundColor: WHATSAPP_GREEN, color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.4rem', fontWeight: 800, cursor: 'pointer', opacity: (sendLoading || uploadLoading) ? 0.7 : 1 }}
                >
                  {sendLoading ? 'Sending…' : 'Send Message Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Connect Account ── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '520px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Connect Meta WhatsApp Business</h2>
            <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={labelStyle}>Connection Name</label>
                <input type="text" required placeholder="e.g. Primary Sales & Support" value={formData.connection_name} onChange={(e) => setFormData({ ...formData, connection_name: e.target.value })} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="text" required placeholder="+14155552671" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number ID</label>
                  <input type="text" required placeholder="Meta Phone Number ID" value={formData.phone_number_id} onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })} style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>WABA ID</label>
                <input type="text" required placeholder="Meta WABA ID" value={formData.waba_id} onChange={(e) => setFormData({ ...formData, waba_id: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Access Token</label>
                <textarea required rows={3} placeholder="EAAG..." value={formData.access_token} onChange={(e) => setFormData({ ...formData, access_token: e.target.value })} style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.8rem', resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ backgroundColor: META_BLUE, color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.4rem', fontWeight: 800, cursor: 'pointer' }}>Save Connection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaWhatsAppDesktop;
