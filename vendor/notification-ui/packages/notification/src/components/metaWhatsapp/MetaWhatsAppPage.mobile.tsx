import React, { useState, useEffect } from 'react';
import { apiClient, useToast } from '@geeksman/core-ui';
import {
  META_BLUE,
  WHATSAPP_GREEN,
  WhatsAppAccount,
  WhatsAppContact,
  WhatsAppLog,
} from './types';
import { metaWaGet, metaWaPost, metaWaPut } from './api';


const FilterIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const PlusIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const MetaWhatsAppMobile: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'accounts' | 'contacts' | 'logs'>('accounts');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);

  const [testPayload, setTestPayload] = useState({
    account_id: '',
    recipient_phone: '',
    message_type: 'TEMPLATE' as 'TEMPLATE' | 'SESSION_TEXT' | 'SESSION_MEDIA',
    template_name: 'hello_world',
    template_params: '',
    text_content: '',
    media_url: '',
  });

  const [formData, setFormData] = useState({
    connection_name: '',
    phone_number: '',
    phone_number_id: '',
    waba_id: '',
    access_token: '',
    webhook_verify_token: `wh_v_${Math.random().toString(36).substring(2, 8)}`,
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await metaWaPost('/meta-whatsapp/accounts', formData);
      showToast('Meta WhatsApp Business connected successfully', 'success');
      setIsModalOpen(false);
      setFormData({
        connection_name: '',
        phone_number: '',
        phone_number_id: '',
        waba_id: '',
        access_token: '',
        webhook_verify_token: `wh_v_${Math.random().toString(36).substring(2, 8)}`,
      });
      fetchData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save WhatsApp account', 'error');
    }
  };

  const fetchData = async () => {
    try {
      if (activeTab === 'accounts') {
        const res = await metaWaGet('/meta-whatsapp/accounts');
        setAccounts(res.data?.data || []);
      } else if (activeTab === 'contacts') {
        const res = await metaWaGet('/meta-whatsapp/contacts?limit=100');
        setContacts(res.data?.data || []);
      } else {
        const res = await metaWaGet('/meta-whatsapp/logs?limit=100');
        setLogs(res.data?.data || []);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to fetch WhatsApp data', 'error');
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
      showToast(`WhatsApp message sent! (WAMID: ${res.data?.data?.wamid || 'OK'})`, 'success');
      setIsTestModalOpen(false);
      if (activeTab === 'logs') fetchData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to send test message', 'error');
    } finally {
      setSendLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(
    (acc) =>
      acc.connection_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.phone_number?.includes(searchQuery)
  );

  return (
    <div style={{ width: '100%', padding: '0.85rem 1rem 6rem', fontFamily: 'Outfit, Inter, sans-serif' }}>
      {/* Search & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder="Search WhatsApp numbers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.65rem 0.85rem 0.65rem 2.25rem',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              fontSize: '0.9rem',
              backgroundColor: '#ffffff',
            }}
          />
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>
            🔍
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsTestModalOpen(true)}
          style={{
            backgroundColor: WHATSAPP_GREEN,
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '0.65rem 0.85rem',
            fontSize: '0.8rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          🚀 Test
        </button>

        <button
          type="button"
          onClick={() => setIsFilterDrawerOpen(true)}
          style={{
            background: 'none',
            border: 'none',
            color: META_BLUE,
            cursor: 'pointer',
            padding: '0.4rem',
          }}
        >
          <FilterIcon size={22} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          style={{
            flex: 1,
            padding: '0.55rem',
            borderRadius: '10px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: activeTab === 'accounts' ? 800 : 600,
            backgroundColor: activeTab === 'accounts' ? META_BLUE : '#f1f5f9',
            color: activeTab === 'accounts' ? '#ffffff' : '#64748b',
          }}
        >
          Accounts ({filteredAccounts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contacts')}
          style={{
            flex: 1,
            padding: '0.55rem',
            borderRadius: '10px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: activeTab === 'contacts' ? 800 : 600,
            backgroundColor: activeTab === 'contacts' ? META_BLUE : '#f1f5f9',
            color: activeTab === 'contacts' ? '#ffffff' : '#64748b',
          }}
        >
          24h Session ({contacts.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          style={{
            flex: 1,
            padding: '0.55rem',
            borderRadius: '10px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: activeTab === 'logs' ? 800 : 600,
            backgroundColor: activeTab === 'logs' ? META_BLUE : '#f1f5f9',
            color: activeTab === 'logs' ? '#ffffff' : '#64748b',
          }}
        >
          Logs ({logs.length})
        </button>
      </div>

      {/* Contacts View */}
      {activeTab === 'contacts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {contacts.map((ct) => {
            const lastInbound = ct.last_inbound_at ? new Date(ct.last_inbound_at).getTime() : 0;
            const isIn24hWindow = lastInbound > 0 && Date.now() - lastInbound <= 24 * 60 * 60 * 1000;

            return (
              <div
                key={ct.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  padding: '1rem 1.15rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                    {ct.phone_number}
                  </h4>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: ct.status === 'NOT_ON_WHATSAPP' ? '#fee2e2' : '#dcfce7',
                      color: ct.status === 'NOT_ON_WHATSAPP' ? '#b91c1c' : '#15803d',
                    }}
                  >
                    {ct.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '0.4rem' }}>
                  {ct.contact_name || 'Unnamed Contact'}
                </div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                  {isIn24hWindow ? (
                    <span style={{ color: '#16a34a' }}>🟢 24h Session Active</span>
                  ) : (
                    <span style={{ color: '#64748b' }}>🔴 Out of Window</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cards List */}
      {activeTab === 'accounts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredAccounts.slice(0, displayCount).map((acc) => (
            <div
              key={acc.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '1rem 1.15rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#0f172a' }}>
                  {acc.connection_name}
                </h4>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                  {acc.status}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', color: WHATSAPP_GREEN, fontWeight: 700 }}>
                {acc.phone_number}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Test Message */}
      {isTestModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: '24px 24px 0 0', padding: '1.5rem', animation: 'slideUp 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>🚀 Test Send WhatsApp</h3>
              <button type="button" onClick={() => setIsTestModalOpen(false)} style={{ background: 'none', border: 'none', fontWeight: 800, fontSize: '1.1rem' }}>✕</button>
            </div>

            <form onSubmit={handleSendTestMessage} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Recipient Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+14155552671"
                  value={testPayload.recipient_phone}
                  onChange={(e) => setTestPayload({ ...testPayload, recipient_phone: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Dispatch Type</label>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '4px' }}>
                  {(['TEMPLATE', 'SESSION_TEXT', 'SESSION_MEDIA'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTestPayload({ ...testPayload, message_type: t })}
                      style={{
                        flex: 1,
                        padding: '0.45rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        backgroundColor: testPayload.message_type === t ? META_BLUE : '#f8fafc',
                        color: testPayload.message_type === t ? '#ffffff' : '#475569',
                      }}
                    >
                      {t === 'TEMPLATE' ? 'Template' : t === 'SESSION_TEXT' ? 'Text' : 'Media'}
                    </button>
                  ))}
                </div>
              </div>

              {testPayload.message_type === 'TEMPLATE' && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Template Name</label>
                  <input
                    type="text"
                    required
                    placeholder="hello_world"
                    value={testPayload.template_name}
                    onChange={(e) => setTestPayload({ ...testPayload, template_name: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>
              )}

              {testPayload.message_type === 'SESSION_TEXT' && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Text Message</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Hello from ERP..."
                    value={testPayload.text_content}
                    onChange={(e) => setTestPayload({ ...testPayload, text_content: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>
              )}

              {testPayload.message_type === 'SESSION_MEDIA' && (
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700 }}>Media PDF/Image URL</label>
                  <input
                    type="text"
                    required
                    placeholder="https://example.com/invoice.pdf"
                    value={testPayload.media_url}
                    onChange={(e) => setTestPayload({ ...testPayload, media_url: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={sendLoading}
                style={{ width: '100%', marginTop: '1rem', backgroundColor: WHATSAPP_GREEN, color: '#ffffff', border: 'none', borderRadius: '10px', padding: '0.75rem', fontWeight: 800 }}
              >
                {sendLoading ? 'Sending...' : 'Send Message Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FAB */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '84px',
          right: '20px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: META_BLUE,
          border: 'none',
          boxShadow: '0 8px 20px -4px rgba(24, 119, 242, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
        }}
      >
        <PlusIcon size={26} />
      </button>
    </div>
  );
};

export default MetaWhatsAppMobile;
