import React, { useState, useEffect, useRef } from 'react';
import { apiClient, useToast, DataTable, Column, Select } from '@geeksman/core-ui';
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

interface ParsedTemplateComponent {
  type: string;
  format?: string;
  text?: string;
}

export const extractTemplateVariables = (componentsRaw: any): {
  headerText: string;
  headerFormat: string;
  bodyText: string;
  footerText: string;
  bodyVariables: string[];
  headerVariables: string[];
} => {
  let headerText = '';
  let headerFormat = '';
  let bodyText = '';
  let footerText = '';
  let bodyVariables: string[] = [];
  let headerVariables: string[] = [];

  if (!componentsRaw) return { headerText, headerFormat, bodyText, footerText, bodyVariables, headerVariables };

  try {
    const components: ParsedTemplateComponent[] = typeof componentsRaw === 'string'
      ? JSON.parse(componentsRaw)
      : componentsRaw;

    if (Array.isArray(components)) {
      for (const comp of components) {
        if (comp.type === 'HEADER') {
          if (comp.format) {
            headerFormat = comp.format.toUpperCase();
          }
          if (comp.text) {
            headerText = comp.text;
            const matches = comp.text.match(/\{\{(\d+)\}\}/g);
            if (matches) {
              headerVariables = Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, ''))));
            }
          }
        } else if (comp.type === 'BODY' && comp.text) {
          bodyText = comp.text;
          const matches = comp.text.match(/\{\{(\d+)\}\}/g);
          if (matches) {
            bodyVariables = Array.from(new Set(matches.map((m) => m.replace(/[{}]/g, '')))).sort(
              (a, b) => Number(a) - Number(b)
            );
          }
        } else if (comp.type === 'FOOTER' && comp.text) {
          footerText = comp.text;
        }
      }
    }
  } catch (err) {
    // ignore parse errors
  }

  return { headerText, headerFormat, bodyText, footerText, bodyVariables, headerVariables };
};

const renderBodyWithHighlights = (text: string, values: Record<string, string>) => {
  if (!text) return null;
  const parts = text.split(/(\{\{\d+\}\})/g);
  return parts.map((part, idx) => {
    const match = part.match(/^\{\{(\d+)\}\}$/);
    if (match) {
      const vNum = match[1];
      const val = values[vNum];
      if (val && val.trim()) {
        return (
          <span
            key={idx}
            style={{
              backgroundColor: '#fed7aa',
              color: '#9a3412',
              fontWeight: 700,
              padding: '1px 5px',
              borderRadius: '4px',
            }}
          >
            {val}
          </span>
        );
      }
      return (
        <span
          key={idx}
          style={{
            backgroundColor: '#fef08a',
            color: '#854d0e',
            fontWeight: 700,
            padding: '1px 5px',
            borderRadius: '4px',
            border: '1px dashed #ca8a04',
          }}
        >
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
};

export const MetaWhatsAppDesktop: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'accounts' | 'templates' | 'contacts' | 'logs'>('accounts');
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Pagination states for each DataList tab
  const [accountSearch, setAccountSearch] = useState('');
  const [accountPage, setAccountPage] = useState(1);
  const [accountPageSize, setAccountPageSize] = useState(10);

  const [templateSearch, setTemplateSearch] = useState('');
  const [templatePage, setTemplatePage] = useState(1);
  const [templatePageSize, setTemplatePageSize] = useState(10);

  const [contactSearch, setContactSearch] = useState('');
  const [contactPage, setContactPage] = useState(1);
  const [contactPageSize, setContactPageSize] = useState(10);

  const [logSearch, setLogSearch] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(10);

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

  // Dynamic variable values map for templates (e.g. { '1': 'John', '2': '#1024' })
  const [templateVariableValues, setTemplateVariableValues] = useState<Record<string, string>>({});

  // Create Template modal states
  const [isCreateTemplateModalOpen, setIsCreateTemplateModalOpen] = useState<boolean>(false);
  const [createTemplateLoading, setCreateTemplateLoading] = useState<boolean>(false);
  const [newTemplate, setNewTemplate] = useState({
    account_id: '',
    name: '',
    category: 'UTILITY',
    language: 'en_US',
    header_text: '',
    body_text: '',
    footer_text: '',
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

  const selectedTemplate = React.useMemo(() => {
    return templates.find((t) => t.name === testPayload.template_name);
  }, [templates, testPayload.template_name]);

  const parsedTemplate = React.useMemo(() => {
    return extractTemplateVariables(selectedTemplate?.components);
  }, [selectedTemplate]);

  // Sync variable values when parsed template changes
  useEffect(() => {
    if (parsedTemplate.bodyVariables.length > 0) {
      setTemplateVariableValues((prev) => {
        const next: Record<string, string> = {};
        parsedTemplate.bodyVariables.forEach((v) => {
          next[v] = prev[v] || '';
        });
        return next;
      });
    } else {
      setTemplateVariableValues({});
    }
  }, [parsedTemplate.bodyVariables]);

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
      const isTemplate = testPayload.message_type === 'TEMPLATE';
      let paramsArray: string[] = [];
      if (isTemplate) {
        // Enforce required header media (IMAGE, DOCUMENT, VIDEO)
        if (parsedTemplate.headerFormat && parsedTemplate.headerFormat !== 'TEXT') {
          if (!testPayload.media_url.trim()) {
            showToast(`Template "${testPayload.template_name}" requires a header ${parsedTemplate.headerFormat}. Please attach a file or provide media_url.`, 'error');
            setSendLoading(false);
            return;
          }
        }

        // Enforce required body variables
        if (parsedTemplate.bodyVariables.length > 0) {
          const missing = parsedTemplate.bodyVariables.filter((v) => !templateVariableValues[v]?.trim());
          if (missing.length > 0) {
            showToast(`Template "${testPayload.template_name}" requires all variables. Missing: {{${missing.join('}}, {{')}}}`, 'error');
            setSendLoading(false);
            return;
          }
          paramsArray = parsedTemplate.bodyVariables.map((v) => templateVariableValues[v] || '');
        } else if (testPayload.template_params) {
          paramsArray = testPayload.template_params.split(',').map((s) => s.trim());
        }
      }

      const body = {
        account_id: testPayload.account_id,
        recipient_phone: testPayload.recipient_phone,
        template_name: isTemplate ? testPayload.template_name : '',
        template_params: paramsArray,
        text_content: testPayload.text_content,
        media_url: testPayload.media_url,
        force_template: isTemplate,
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

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.name.trim()) {
      showToast('Template name is required', 'error');
      return;
    }
    if (!newTemplate.body_text.trim()) {
      showToast('Body text is required', 'error');
      return;
    }

    setCreateTemplateLoading(true);
    try {
      const components: any[] = [];
      if (newTemplate.header_text.trim()) {
        components.push({
          type: 'HEADER',
          format: 'TEXT',
          text: newTemplate.header_text.trim(),
        });
      }
      components.push({
        type: 'BODY',
        text: newTemplate.body_text.trim(),
      });
      if (newTemplate.footer_text.trim()) {
        components.push({
          type: 'FOOTER',
          text: newTemplate.footer_text.trim(),
        });
      }

      const body = {
        account_id: newTemplate.account_id || accounts[0]?.id,
        name: newTemplate.name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_'),
        category: newTemplate.category,
        language: newTemplate.language || 'en_US',
        components,
      };

      const res = await metaWaPost('/meta-whatsapp/templates', body);
      const createdTpl = res.data?.data;
      showToast(
        `Template "${body.name}" submitted to Meta! Status: ${createdTpl?.status || 'PENDING'}. (UTILITY templates usually auto-approve in 1–5 min)`,
        'success'
      );
      setIsCreateTemplateModalOpen(false);
      fetchData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to create template on Meta', 'error');
    } finally {
      setCreateTemplateLoading(false);
    }
  };

  const handleSyncTemplates = async (accountID: string) => {
    try {
      await metaWaPost(`/meta-whatsapp/accounts/${accountID}/sync-templates`);
      showToast('WhatsApp templates synced successfully from Meta', 'success');
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

  // Filtered lists for client-side search & pagination in DataTables
  const filteredAccounts = React.useMemo(() => {
    const q = accountSearch.toLowerCase().trim();
    if (!q) return accounts;
    return accounts.filter((acc) =>
      acc.connection_name?.toLowerCase().includes(q) ||
      acc.phone_number?.toLowerCase().includes(q) ||
      acc.phone_number_id?.toLowerCase().includes(q) ||
      acc.waba_id?.toLowerCase().includes(q) ||
      acc.status?.toLowerCase().includes(q)
    );
  }, [accounts, accountSearch]);

  const filteredTemplates = React.useMemo(() => {
    const q = templateSearch.toLowerCase().trim();
    if (!q) return templates;
    return templates.filter((tpl) =>
      tpl.name?.toLowerCase().includes(q) ||
      tpl.category?.toLowerCase().includes(q) ||
      tpl.language?.toLowerCase().includes(q) ||
      tpl.status?.toLowerCase().includes(q)
    );
  }, [templates, templateSearch]);

  const filteredContacts = React.useMemo(() => {
    const q = contactSearch.toLowerCase().trim();
    if (!q) return contacts;
    return contacts.filter((ct) =>
      ct.phone_number?.toLowerCase().includes(q) ||
      ct.contact_name?.toLowerCase().includes(q) ||
      ct.status?.toLowerCase().includes(q)
    );
  }, [contacts, contactSearch]);

  const filteredLogs = React.useMemo(() => {
    const q = logSearch.toLowerCase().trim();
    if (!q) return logs;
    return logs.filter((lg) =>
      lg.recipient_phone?.toLowerCase().includes(q) ||
      lg.template_name?.toLowerCase().includes(q) ||
      lg.status?.toLowerCase().includes(q) ||
      lg.direction?.toLowerCase().includes(q) ||
      lg.message_type?.toLowerCase().includes(q)
    );
  }, [logs, logSearch]);

  // ── 1. Connected Accounts Columns ──
  const accountColumns: Column<WhatsAppAccount>[] = [
    {
      key: 'connection_name',
      label: 'Connection Name',
      sortable: true,
      render: (_, acc) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontWeight: 800, color: '#0f172a' }}>{acc.connection_name}</span>
          <MetaBlueTickIcon size={16} />
        </div>
      ),
    },
    {
      key: 'phone_number',
      label: 'Phone Number',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 800, color: WHATSAPP_GREEN }}>{val}</span>
      ),
    },
    {
      key: 'phone_number_id',
      label: 'Phone Number ID',
      render: (val) => <code style={{ fontSize: '0.8rem', color: '#475569' }}>{val}</code>,
    },
    {
      key: 'waba_id',
      label: 'WABA ID',
      render: (val) => <code style={{ fontSize: '0.8rem', color: '#475569' }}>{val}</code>,
    },
    {
      key: 'quality_rating',
      label: 'Quality',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 800, color: val === 'GREEN' ? '#16a34a' : val === 'RED' ? '#dc2626' : '#d97706' }}>
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => (
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '6px',
            backgroundColor: val === 'CONNECTED' ? '#dcfce7' : '#fee2e2',
            color: val === 'CONNECTED' ? '#15803d' : '#b91c1c',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, acc) => {
        const webhookURL = `${baseURL}/api/v1/notification/meta-whatsapp/webhooks/${tenantCode}/${acc.id}`;
        return (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => handleSyncTemplates(acc.id)}
              style={{
                backgroundColor: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔄 Sync
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(webhookURL)}
              style={{
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📋 Copy Webhook
            </button>
          </div>
        );
      },
    },
  ];

  // ── 2. Message Templates Columns ──
  const templateColumns: Column<WhatsAppTemplate>[] = [
    {
      key: 'name',
      label: 'Template Name',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 700, color: '#0f172a' }}>{val}</span>,
    },
    {
      key: 'language',
      label: 'Language',
      sortable: true,
      render: (val) => <span style={{ color: '#64748b' }}>{val}</span>,
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (val) => (
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: '#f1f5f9',
            color: '#475569',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Approval Status',
      sortable: true,
      render: (val) => (
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '6px',
            backgroundColor: val === 'APPROVED' ? '#dcfce7' : '#fef3c7',
            color: val === 'APPROVED' ? '#15803d' : '#92400e',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'components',
      label: 'Body Text Preview',
      render: (val) => {
        const parsed = extractTemplateVariables(val);
        return (
          <span
            style={{
              fontSize: '0.78rem',
              color: '#475569',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              maxWidth: '300px',
            }}
          >
            {parsed.bodyText || '—'}
          </span>
        );
      },
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => {
            setTestPayload((prev) => ({
              ...prev,
              message_type: 'TEMPLATE',
              template_name: row.name,
              account_id: row.account_id || prev.account_id,
            }));
            setIsTestModalOpen(true);
          }}
          style={{
            backgroundColor: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            padding: '3px 8px',
            fontSize: '0.72rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          🚀 Test Send
        </button>
      ),
    },
  ];

  // ── 3. Contacts Columns ──
  const contactColumns: Column<WhatsAppContact>[] = [
    {
      key: 'phone_number',
      label: 'Recipient Phone',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 800, color: '#0f172a' }}>{val}</span>,
    },
    {
      key: 'contact_name',
      label: 'Contact Name',
      sortable: true,
      render: (val) => <span style={{ color: '#334155' }}>{val || '—'}</span>,
    },
    {
      key: 'status',
      label: 'Verification Status',
      sortable: true,
      render: (val) => (
        <span
          style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '6px',
            backgroundColor: val === 'NOT_ON_WHATSAPP' ? '#fee2e2' : '#dcfce7',
            color: val === 'NOT_ON_WHATSAPP' ? '#b91c1c' : '#15803d',
          }}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'window',
      label: '24h Session Window',
      render: (_, ct) => {
        const lastInbound = ct.last_inbound_at ? new Date(ct.last_inbound_at).getTime() : 0;
        const isIn24hWindow = lastInbound > 0 && Date.now() - lastInbound <= 24 * 60 * 60 * 1000;
        return isIn24hWindow ? (
          <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '0.82rem' }}>🟢 24h Session Active (Free Text/Media)</span>
        ) : (
          <span style={{ color: '#64748b', fontWeight: 600, fontSize: '0.82rem' }}>🔴 Out of Window (Requires Template)</span>
        );
      },
    },
    {
      key: 'last_inbound_at',
      label: 'Last Inbound Activity',
      sortable: true,
      render: (val) => (
        <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
          {val ? new Date(val).toLocaleString() : 'No inbound message yet'}
        </span>
      ),
    },
  ];

  // ── 4. Delivery Logs Columns ──
  const logColumns: Column<WhatsAppLog>[] = [
    {
      key: 'created_at',
      label: 'Date/Time',
      sortable: true,
      render: (val) => (
        <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
          {new Date(val).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'direction',
      label: 'Direction',
      sortable: true,
      render: (val) => (
        <span style={{ fontWeight: 800, color: val === 'OUTBOUND' ? '#2563eb' : '#16a34a', fontSize: '0.82rem' }}>
          {val === 'OUTBOUND' ? '↗ Outbound' : '↙ Inbound'}
        </span>
      ),
    },
    {
      key: 'recipient_phone',
      label: 'Recipient Phone',
      sortable: true,
      render: (val) => <span style={{ fontWeight: 800, color: '#0f172a' }}>{val}</span>,
    },
    {
      key: 'message_type',
      label: 'Type',
      sortable: true,
      render: (val, row) => (
        <span style={{ color: '#475569', fontSize: '0.82rem' }}>
          {val} {row.template_name ? `(${row.template_name})` : ''}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val) => {
        const isSuccess = ['SENT', 'DELIVERED', 'READ'].includes(val);
        return (
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: isSuccess ? '#dcfce7' : '#fee2e2',
              color: isSuccess ? '#15803d' : '#b91c1c',
            }}
          >
            {val}
          </span>
        );
      },
    },
    {
      key: 'details',
      label: 'Details',
      render: (_, row) => (
        <span
          style={{
            color: '#64748b',
            fontSize: '0.78rem',
            maxWidth: '320px',
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={row.error_details || row.content || row.wamid || ''}
        >
          {row.error_details || row.content || row.wamid || '—'}
        </span>
      ),
    },
  ];

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

      {/* ── Tab Content: Connected Accounts (Visual Card Grid) ── */}
      {activeTab === 'accounts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {accounts.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '3.5rem 2rem', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📱</div>
              <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a', fontSize: '1.2rem', fontWeight: 800 }}>
                No Meta WhatsApp Business Account Connected
              </h3>
              <p style={{ margin: '0 auto 1.5rem', color: '#64748b', fontSize: '0.9rem', maxWidth: '480px', lineHeight: 1.5 }}>
                Connect your Meta Cloud API Phone Number ID, WABA ID, and permanent Access Token to start sending messages.
              </p>
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
                  padding: '0.7rem 1.6rem',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(24, 119, 242, 0.35)',
                }}
              >
                + Connect WhatsApp Account
              </button>
            </div>
          ) : (
            accounts.map((acc) => {
              const webhookURL = `${baseURL}/api/v1/notification/meta-whatsapp/webhooks/${tenantCode}/${acc.id}`;
              return (
                <div
                  key={acc.id}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e2e8f0',
                    padding: '1.35rem 1.5rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                            {acc.connection_name}
                          </h3>
                          <MetaBlueTickIcon size={16} />
                        </div>
                        <span style={{ fontSize: '0.9rem', color: WHATSAPP_GREEN, fontWeight: 700, display: 'block', marginTop: '2px' }}>
                          {acc.phone_number}
                        </span>
                      </div>
                      <span
                        style={{
                          backgroundColor: acc.status === 'CONNECTED' ? '#dcfce7' : '#fee2e2',
                          color: acc.status === 'CONNECTED' ? '#15803d' : '#b91c1c',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {acc.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: '#475569', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600 }}>Phone Number ID:</span>
                        <code style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>{acc.phone_number_id}</code>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600 }}>WABA ID:</span>
                        <code style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '1px 6px', borderRadius: '4px' }}>{acc.waba_id}</code>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 600 }}>Quality Rating:</span>
                        <span style={{ color: acc.quality_rating === 'RED' ? '#dc2626' : '#16a34a', fontWeight: 800 }}>
                          {acc.quality_rating || 'GREEN'}
                        </span>
                      </div>
                    </div>

                    {/* Webhook Callback URL Box */}
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.65rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
                        WEBHOOK CALLBACK URL (META CLOUD API)
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {webhookURL}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(webhookURL)}
                          style={{
                            backgroundColor: '#e2e8f0',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '2px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => handleSyncTemplates(acc.id)}
                      style={{
                        flex: 1,
                        backgroundColor: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🔄 Sync Templates
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAccountID(acc.id);
                        setFormData({
                          connection_name: acc.connection_name,
                          phone_number: acc.phone_number,
                          phone_number_id: acc.phone_number_id,
                          waba_id: acc.waba_id,
                          access_token: acc.access_token,
                          webhook_verify_token: acc.webhook_verify_token,
                          webhook_secret: acc.webhook_secret || '',
                          is_default: acc.is_default,
                        });
                        setIsModalOpen(true);
                      }}
                      style={{
                        backgroundColor: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        borderRadius: '8px',
                        padding: '0.5rem 0.85rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      ⚙️ Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTestPayload((prev) => ({
                          ...prev,
                          account_id: acc.id,
                        }));
                        setIsTestModalOpen(true);
                      }}
                      style={{
                        backgroundColor: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        borderRadius: '8px',
                        padding: '0.5rem 0.85rem',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🚀 Test
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ── Templates DataList ── */}
      {activeTab === 'templates' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <DataTable
            columns={templateColumns}
            data={filteredTemplates}
            searchVal={templateSearch}
            setSearchVal={setTemplateSearch}
            pageSize={templatePageSize}
            setPageSize={setTemplatePageSize}
            currentPage={templatePage}
            setCurrentPage={setTemplatePage}
            totalItems={filteredTemplates.length}
            loading={loading}
            onRefresh={fetchData}
            searchPlaceholder="Search templates by name, category, language…"
            actionButton={
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setNewTemplate({
                      account_id: accounts[0]?.id || '',
                      name: '',
                      category: 'UTILITY',
                      language: 'en_US',
                      header_text: '',
                      body_text: '',
                      footer_text: '',
                    });
                    setIsCreateTemplateModalOpen(true);
                  }}
                  style={{
                    backgroundColor: META_BLUE,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.55rem 1.1rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  + Create Template
                </button>
                {accounts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleSyncTemplates(accounts[0].id)}
                    style={{
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.55rem 1rem',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    🔄 Sync from Meta
                  </button>
                )}
              </div>
            }
          />
        </div>
      )}

      {/* ── Contacts DataList ── */}
      {activeTab === 'contacts' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <DataTable
            columns={contactColumns}
            data={filteredContacts}
            searchVal={contactSearch}
            setSearchVal={setContactSearch}
            pageSize={contactPageSize}
            setPageSize={setContactPageSize}
            currentPage={contactPage}
            setCurrentPage={setContactPage}
            totalItems={filteredContacts.length}
            loading={loading}
            onRefresh={fetchData}
            searchPlaceholder="Search contacts by phone, name, status…"
          />
        </div>
      )}

      {/* ── Delivery Logs DataList ── */}
      {activeTab === 'logs' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
          <DataTable
            columns={logColumns}
            data={filteredLogs}
            searchVal={logSearch}
            setSearchVal={setLogSearch}
            pageSize={logPageSize}
            setPageSize={setLogPageSize}
            currentPage={logPage}
            setCurrentPage={setLogPage}
            totalItems={filteredLogs.length}
            loading={loading}
            onRefresh={fetchData}
            searchPlaceholder="Search delivery logs by phone, template, direction, status…"
          />
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
                <div style={{ marginTop: '4px' }}>
                  <Select
                    value={testPayload.account_id}
                    onChange={(val) =>
                      setTestPayload({ ...testPayload, account_id: typeof val === 'string' ? val : '' })
                    }
                    options={[
                      { value: '', label: 'Default Active Connection' },
                      ...accounts.map((acc) => ({
                        value: acc.id,
                        label: `${acc.connection_name} (${acc.phone_number})`,
                      })),
                    ]}
                    placeholder="Select WhatsApp Connection"
                  />
                </div>
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
                    <label style={labelStyle}>Select WhatsApp Template</label>
                    <div style={{ marginTop: '4px' }}>
                      {templates.length > 0 ? (
                        <Select
                          value={testPayload.template_name}
                          onChange={(val) => {
                            const tName = typeof val === 'string' ? val : '';
                            setTestPayload((prev) => ({ ...prev, template_name: tName }));
                          }}
                          options={templates.map((tpl) => ({
                            value: tpl.name,
                            label: `${tpl.name} [${tpl.language}] ${tpl.status !== 'APPROVED' ? `(${tpl.status})` : ''}`,
                          }))}
                          placeholder="— Choose an Approved Template —"
                        />
                      ) : (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
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
                  </div>

                  {/* Header Media Required for Template */}
                  {(parsedTemplate.headerFormat === 'IMAGE' || parsedTemplate.headerFormat === 'DOCUMENT' || parsedTemplate.headerFormat === 'VIDEO') && (
                    <div style={{ backgroundColor: '#fffbeb', borderRadius: '10px', padding: '0.85rem', border: '1px solid #fde68a' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400e' }}>
                          📸 Header {parsedTemplate.headerFormat} (Required by Meta)
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 600 }}>
                          Required Attachment
                        </span>
                      </div>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '0.85rem',
                          borderRadius: '8px',
                          border: '2px dashed #f59e0b',
                          backgroundColor: '#ffffff',
                          cursor: 'pointer',
                          textAlign: 'center',
                          marginBottom: '6px',
                        }}
                      >
                        {uploadLoading ? (
                          <span style={{ color: '#b45309', fontSize: '0.82rem' }}>⏳ Uploading to Meta…</span>
                        ) : testPayload.media_url ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              ✅ Attached: {testPayload.media_url}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setTestPayload((p) => ({ ...p, media_url: '' })); }}
                              style={{ fontSize: '0.72rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}
                            >
                              ✕ Remove
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span style={{ fontSize: '0.82rem', color: '#92400e', fontWeight: 700 }}>
                              Click or drop {parsedTemplate.headerFormat.toLowerCase()} here
                            </span>
                            <div style={{ fontSize: '0.7rem', color: '#b45309' }}>JPG, PNG, PDF up to 16MB</div>
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="— or paste image/media URL directly (https://...) —"
                        value={testPayload.media_url}
                        onChange={(e) => setTestPayload({ ...testPayload, media_url: e.target.value })}
                        style={{ ...inputStyle, marginTop: 0 }}
                      />
                    </div>
                  )}

                  {/* Variables UI: Render separate input for each placeholder if variables exist */}
                  {parsedTemplate.bodyVariables.length > 0 ? (
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '2px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ ...labelStyle, color: '#1e293b' }}>
                          Template Variables ({parsedTemplate.bodyVariables.length})
                        </label>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          All placeholders will be populated dynamically
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: parsedTemplate.bodyVariables.length > 1 ? '1fr 1fr' : '1fr', gap: '0.65rem' }}>
                        {parsedTemplate.bodyVariables.map((vNum) => (
                          <div key={vNum}>
                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '2px' }}>
                              Variable {'{{' + vNum + '}}'}
                            </span>
                            <input
                              type="text"
                              required
                              placeholder={`Value for {{${vNum}}}`}
                              value={templateVariableValues[vNum] || ''}
                              onChange={(e) => setTemplateVariableValues({ ...templateVariableValues, [vNum]: e.target.value })}
                              style={inputStyle}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : selectedTemplate ? (
                    <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', fontSize: '0.8rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>✓</span>
                      <span>This template has no dynamic variable placeholders.</span>
                    </div>
                  ) : (
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
                  )}

                  {/* Live WhatsApp Chat Preview */}
                  {(parsedTemplate.bodyText || parsedTemplate.headerText) && (
                    <div>
                      <label style={{ ...labelStyle, marginBottom: '6px' }}>Live WhatsApp Chat Preview</label>
                      <div
                        style={{
                          backgroundColor: '#efeae2',
                          backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
                          backgroundSize: '16px 16px',
                          borderRadius: '12px',
                          padding: '0.9rem',
                          border: '1px solid #cbd5e1',
                        }}
                      >
                        <div
                          style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '8px 8px 8px 2px',
                            padding: '0.75rem 0.95rem',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                            maxWidth: '94%',
                            fontSize: '0.84rem',
                            color: '#111827',
                            lineHeight: 1.5,
                            wordBreak: 'break-word',
                          }}
                        >
                          {parsedTemplate.headerText && (
                            <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px', fontSize: '0.9rem' }}>
                              {parsedTemplate.headerText}
                            </div>
                          )}
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {renderBodyWithHighlights(parsedTemplate.bodyText || '', templateVariableValues)}
                          </div>
                          {parsedTemplate.footerText && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                              {parsedTemplate.footerText}
                            </div>
                          )}
                          <div style={{ textAlign: 'right', fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '3px' }}>
                            Just now <span style={{ color: META_BLUE, fontWeight: 700 }}>✓✓</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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

      {/* ── Modal: Create WhatsApp Message Template ── */}
      {isCreateTemplateModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '640px', backgroundColor: '#ffffff', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>✨ Create WhatsApp Message Template</h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Templates are registered directly on Meta Cloud API and reviewed for delivery approval.
                </p>
              </div>
              <button type="button" onClick={() => setIsCreateTemplateModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
            </div>

            {/* Explainer banner on WhatsApp Template Approval Flow */}
            <div style={{ backgroundColor: '#eff6ff', borderRadius: '10px', padding: '0.75rem 1rem', border: '1px solid #bfdbfe', marginBottom: '1rem', fontSize: '0.78rem', color: '#1e40af', lineHeight: 1.45 }}>
              <div style={{ fontWeight: 800, marginBottom: '2px' }}>ℹ️ How Meta Template Approvals Work:</div>
              <div>• <strong>UTILITY</strong>: Order status, shipping updates, receipts &amp; invoices (Automated AI review: <strong>1–5 minutes</strong>).</div>
              <div>• <strong>MARKETING</strong>: Promotional campaigns, special offers, announcements (Review takes <strong>15m–2 hours</strong>).</div>
              <div>• <strong>AUTHENTICATION</strong>: One-time login passcodes &amp; verification codes.</div>
            </div>

            <form onSubmit={handleCreateTemplate} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Account Selector if multiple */}
              {accounts.length > 1 && (
                <div>
                  <label style={labelStyle}>WhatsApp Business Account</label>
                  <div style={{ marginTop: '4px' }}>
                    <Select
                      value={newTemplate.account_id || accounts[0]?.id}
                      onChange={(val) => setNewTemplate({ ...newTemplate, account_id: typeof val === 'string' ? val : '' })}
                      options={accounts.map((acc) => ({
                        value: acc.id,
                        label: `${acc.connection_name} (${acc.phone_number})`,
                      }))}
                    />
                  </div>
                </div>
              )}

              {/* Template Name & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={labelStyle}>Template Name (Unique identifier)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. order_delivered_alert"
                    value={newTemplate.name}
                    onChange={(e) => {
                      const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_');
                      setNewTemplate({ ...newTemplate, name: clean });
                    }}
                    style={inputStyle}
                  />
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                    Lowercase letters, numbers, and underscores only
                  </span>
                </div>
                <div>
                  <label style={labelStyle}>Category</label>
                  <div style={{ marginTop: '4px' }}>
                    <Select
                      value={newTemplate.category}
                      onChange={(val) => setNewTemplate({ ...newTemplate, category: typeof val === 'string' ? val : 'UTILITY' })}
                      options={[
                        { value: 'UTILITY', label: 'UTILITY (Fast approval)' },
                        { value: 'MARKETING', label: 'MARKETING' },
                        { value: 'AUTHENTICATION', label: 'AUTHENTICATION' },
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Language */}
              <div>
                <label style={labelStyle}>Language</label>
                <div style={{ marginTop: '4px' }}>
                  <Select
                    value={newTemplate.language}
                    onChange={(val) => setNewTemplate({ ...newTemplate, language: typeof val === 'string' ? val : 'en_US' })}
                    options={[
                      { value: 'en_US', label: 'English (US) — en_US' },
                      { value: 'en_GB', label: 'English (UK) — en_GB' },
                      { value: 'hi', label: 'Hindi (India) — hi' },
                      { value: 'es', label: 'Spanish — es' },
                      { value: 'ar', label: 'Arabic — ar' },
                    ]}
                  />
                </div>
              </div>

              {/* Header Text (Optional) */}
              <div>
                <label style={labelStyle}>Header Title (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Order Delivery Status"
                  value={newTemplate.header_text}
                  onChange={(e) => setNewTemplate({ ...newTemplate, header_text: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Body Text (Required) with Variable Insert chips */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={labelStyle}>Body Message Text</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginRight: '4px', alignSelf: 'center' }}>Insert Variable:</span>
                    {['{{1}}', '{{2}}', '{{3}}', '{{4}}'].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setNewTemplate((prev) => ({ ...prev, body_text: prev.body_text + (prev.body_text ? ' ' : '') + v }))}
                        style={{
                          backgroundColor: '#f1f5f9',
                          color: '#0f172a',
                          border: '1px solid #cbd5e1',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          cursor: 'pointer',
                        }}
                      >
                        + {v}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. Hello {{1}}, your order #{{2}} has been delivered successfully! Thank you for choosing us."
                  value={newTemplate.body_text}
                  onChange={(e) => setNewTemplate({ ...newTemplate, body_text: e.target.value })}
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Footer Text (Optional) */}
              <div>
                <label style={labelStyle}>Footer Text (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Reply STOP to opt out"
                  value={newTemplate.footer_text}
                  onChange={(e) => setNewTemplate({ ...newTemplate, footer_text: e.target.value })}
                  style={inputStyle}
                />
              </div>

              {/* Live WhatsApp Bubble Preview */}
              {(newTemplate.body_text || newTemplate.header_text) && (
                <div>
                  <label style={{ ...labelStyle, marginBottom: '6px' }}>Live WhatsApp Bubble Preview</label>
                  <div
                    style={{
                      backgroundColor: '#efeae2',
                      backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
                      backgroundSize: '16px 16px',
                      borderRadius: '12px',
                      padding: '0.9rem',
                      border: '1px solid #cbd5e1',
                    }}
                  >
                    <div
                      style={{
                        backgroundColor: '#ffffff',
                        borderRadius: '8px 8px 8px 2px',
                        padding: '0.75rem 0.95rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.12)',
                        maxWidth: '92%',
                        fontSize: '0.84rem',
                        color: '#111827',
                        lineHeight: 1.5,
                        wordBreak: 'break-word',
                      }}
                    >
                      {newTemplate.header_text && (
                        <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '4px', fontSize: '0.9rem' }}>
                          {newTemplate.header_text}
                        </div>
                      )}
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {renderBodyWithHighlights(newTemplate.body_text, {})}
                      </div>
                      {newTemplate.footer_text && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
                          {newTemplate.footer_text}
                        </div>
                      )}
                      <div style={{ textAlign: 'right', fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>
                        12:00 PM <span style={{ color: META_BLUE }}>✓✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateTemplateModalOpen(false)}
                  style={{ backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '0.6rem 1.2rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTemplateLoading}
                  style={{ backgroundColor: META_BLUE, color: '#ffffff', border: 'none', borderRadius: '8px', padding: '0.6rem 1.4rem', fontWeight: 800, cursor: 'pointer', opacity: createTemplateLoading ? 0.7 : 1 }}
                >
                  {createTemplateLoading ? 'Submitting to Meta…' : '🚀 Submit Template to Meta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetaWhatsAppDesktop;
