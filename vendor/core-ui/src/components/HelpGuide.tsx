import React, { useState } from 'react';

interface GuideSection {
  id: string;
  title: string;
  category: string;
  icon: string;
  content: React.ReactNode;
}

export const HelpGuide: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('getting-started');

  const sections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started & Portals',
      category: 'Overview',
      icon: '🏢',
      content: (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Portals Architecture</h3>
          <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
            Geeksman OS divides operations into two primary portals: the <strong>Staff Portal</strong> for management tasks and the <strong>Customer Portal</strong> for self-service client actions.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
              <strong style={{ color: '#10b981', display: 'block', marginBottom: '0.5rem' }}>Staff Portal (Management)</strong>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Used by staff to handle products, taxation, leads, support tickets, order approvals, and licensing.</span>
            </div>
            <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(14, 165, 233, 0.05)', border: '1px solid rgba(14, 165, 233, 0.1)' }}>
              <strong style={{ color: '#0ea5e9', display: 'block', marginBottom: '0.5rem' }}>Customer Portal (Self-Service)</strong>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Used by clients to browse catalogs, subscribe to plans, raise support tickets, and manage order logs.</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'hsn-taxes',
      title: 'HSN Codes & Taxation',
      category: 'Product Catalog',
      icon: '📊',
      content: (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Taxation and HSN Codes</h3>
          <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
            All products require HSN classification to apply tax rates properly during quotation and billing.
          </p>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
            <h4 style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>How to set up:</h4>
            <ol style={{ paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.7 }}>
              <li>Navigate to <strong>Tax Settings</strong> (`#/settings/taxes`) in the Staff Portal.</li>
              <li>Add a tax percentage slab (e.g. GST, VAT).</li>
              <li>Create HSN Codes and link them to active tax rates.</li>
            </ol>
          </div>
        </div>
      )
    },
    {
      id: 'product-setup',
      title: 'Products & Subscriptions',
      category: 'Product Catalog',
      icon: '🛍️',
      content: (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Adding Products & Subscriptions</h3>
          <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
            You can create two types of products in the unified Catalog:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <strong>Standard Product:</strong> For single physical shipments or generic services.
            </div>
            <div style={{ padding: '1rem', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <strong>Subscription Product:</strong> For recurring service tiers. Enables configuring:
              <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem', color: '#64748b', fontSize: '0.85rem' }}>
                <li>Three customizable plans (Starter, Pro, Enterprise)</li>
                <li>Distinct pricing tiers and cycle intervals</li>
                <li>Dedicated tier feature images</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'crm-leads',
      title: 'CRM Lead & Organisations',
      category: 'Sales & CRM',
      icon: '👥',
      content: (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Customer Relationship Management</h3>
          <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
            Manage leads and corporate accounts cleanly inside the pipeline view.
          </p>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
            <h4 style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Core Operations:</h4>
            <ul style={{ paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.7 }}>
              <li><strong>Organisations (`#/organisations`):</strong> Store company profiles, billing/shipping addresses, and tax IDs.</li>
              <li><strong>CRM Leads (`#/leads`):</strong> Track qualified contacts through pipelines (New &rarr; Contacted &rarr; Closed Won).</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'enquiry-order',
      title: 'Enquiry to Quotation & Orders',
      category: 'Sales & CRM',
      icon: '🛒',
      content: (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Sales Lifecycle Operations</h3>
          <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
            Customers submit enquiries that staff convert into quotations, or buy subscriptions directly:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #1a56db', background: '#f8fafc' }}>
              <strong>Enquiry Cart:</strong> Customers add catalogue items to cart and submit. Staff convert the enquiry to a <strong>Quotation</strong>.
            </div>
            <div style={{ padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #10b981', background: '#f8fafc' }}>
              <strong>Orders (`#/orders`):</strong> Place orders from the customer portal. Staff view incoming orders, approve, and provision license keys/metadata.
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ticketing',
      title: 'Support Tickets & Chat',
      category: 'Support & Help',
      icon: '💬',
      content: (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Customer Helpdesk</h3>
          <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
            Geeksman OS features a real-time messaging system to handle queries and resolve issues.
          </p>
          <div style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
            <h4 style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Support Operations:</h4>
            <ul style={{ paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.7 }}>
              <li><strong>Raise Tickets:</strong> Customers can raise tickets on orders, or staff can raise on customer behalf.</li>
              <li><strong>Real-time Chat:</strong> Interactive chat panel inside tickets for live collaboration and attachments.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'backup-sync',
      title: 'Backup Sync & Recovery',
      category: 'System Admin',
      icon: '☁️',
      content: (
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>Desktop Sync Client Control</h3>
          <p style={{ color: '#475569', lineHeight: 1.6, marginBottom: '1rem' }}>
            Manage backup synchronization across client PCs:
          </p>
          <ul style={{ paddingLeft: '1.25rem', color: '#475569', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1rem' }}>
            <li><strong>Folder Mappings:</strong> Map local folders to be synced dynamically.</li>
            <li><strong>Device Grid:</strong> View synced clients, edit fallback device configurations, and download the latest compiled <code>backup.zip</code> files.</li>
          </ul>
        </div>
      )
    }
  ];

  const filteredSections = sections.filter(
    (sec) =>
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeSection = sections.find((sec) => sec.id === selectedSection) || sections[0];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      minHeight: 'calc(100vh - 100px)',
      background: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box',
      padding: '1.5rem'
    }}>
      {/* Header Search Box */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
        borderRadius: '16px',
        color: '#fff',
        marginBottom: '1.5rem',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.15)'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>System Operations Guide</h2>
        <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Search portal functions, setup manuals, and workflow procedures</span>
        <input
          type="text"
          placeholder="🔍 Search guide..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '500px',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            border: 'none',
            outline: 'none',
            fontSize: '0.95rem',
            background: 'rgba(255, 255, 255, 0.1)',
            color: '#fff',
            backdropFilter: 'blur(8px)',
            borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s'
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1 }}>
        {/* Left Topics List */}
        <div style={{
          width: '280px',
          background: '#fff',
          borderRadius: '16px',
          padding: '1rem',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          height: 'fit-content'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', padding: '0 0.5rem', textTransform: 'uppercase' }}>Topics</span>
          {filteredSections.map((sec) => {
            const isSelected = sec.id === selectedSection;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: isSelected ? 'rgba(30, 58, 138, 0.08)' : 'transparent',
                  color: isSelected ? '#1e3a8a' : '#475569',
                  textAlign: 'left',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  width: '100%',
                  transition: 'all 0.2s'
                }}
              >
                <span style={{ fontSize: '1.2rem' }}>{sec.icon}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.85rem' }}>{sec.title}</span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{sec.category}</span>
                </div>
              </button>
            );
          })}
          {filteredSections.length === 0 && (
            <span style={{ padding: '1rem', fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>No matching topics found</span>
          )}
        </div>

        {/* Right Content Area */}
        <div style={{
          flex: 1,
          background: '#fff',
          borderRadius: '16px',
          padding: '2rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
            <span style={{ fontSize: '2rem' }}>{activeSection.icon}</span>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase' }}>{activeSection.category}</span>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{activeSection.title}</h1>
            </div>
          </div>
          {activeSection.content}
        </div>
      </div>
    </div>
  );
};
