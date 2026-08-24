import React, { useState } from 'react';
import type { AppTab } from '../../types/MobileTabTypes';

export interface MobileTabSwitcher3DProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: AppTab[];
  activePath: string;
  onSelectTab: (path: string) => void;
  onCloseTab: (path: string, e: React.MouseEvent) => void;
  onCloseAllTabs: () => void;
  onNewTab: () => void;
}

const CloseIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const PlusIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CheckIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TrashIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const DefaultHomeIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

// ── Miniature Visual Live Preview Component for Each Tab ──
const TabContentPreview: React.FC<{ tab: AppTab }> = ({ tab }) => {
  const p = tab.path.toLowerCase();
  const label = tab.label.toLowerCase();

  // 1. Home Dashboard Preview
  if (p === '/home' || p === '/' || label.includes('home') || label.includes('dashboard')) {
    return (
      <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '9px', color: '#1e293b', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e0f2fe', padding: '4px 6px', borderRadius: '4px' }}>
          <span style={{ fontWeight: 800, color: '#0369a1' }}>👋 Geeksman OS</span>
          <span style={{ fontSize: '7.5px', color: '#0284c7', fontWeight: 700 }}>LIVE</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          <div style={{ backgroundColor: '#ffffff', padding: '4px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: '7.5px' }}>Orders</div>
            <div style={{ fontWeight: 900, color: '#2563eb', fontSize: '11px' }}>12 Active</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '4px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: '7.5px' }}>Tickets</div>
            <div style={{ fontWeight: 900, color: '#dc2626', fontSize: '11px' }}>5 Open</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '4px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: '7.5px' }}>Revenue</div>
            <div style={{ fontWeight: 900, color: '#16a34a', fontSize: '10px' }}>₹4.2L</div>
          </div>
          <div style={{ backgroundColor: '#ffffff', padding: '4px 6px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <div style={{ color: '#64748b', fontSize: '7.5px' }}>Stock Items</div>
            <div style={{ fontWeight: 900, color: '#9333ea', fontSize: '10px' }}>890 SKUs</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '4px', marginTop: 'auto' }}>
          <span style={{ flex: 1, backgroundColor: '#eff6ff', color: '#1d4ed8', textAlign: 'center', padding: '2px', borderRadius: '3px', fontWeight: 700, fontSize: '7.5px' }}>📦 WMS</span>
          <span style={{ flex: 1, backgroundColor: '#fdf4ff', color: '#a21caf', textAlign: 'center', padding: '2px', borderRadius: '3px', fontWeight: 700, fontSize: '7.5px' }}>💼 Sales</span>
          <span style={{ flex: 1, backgroundColor: '#f0fdf4', color: '#15803d', textAlign: 'center', padding: '2px', borderRadius: '3px', fontWeight: 700, fontSize: '7.5px' }}>💬 Support</span>
        </div>
      </div>
    );
  }

  // 2. New Ticket / Creation Form Preview
  if (p.includes('/new') || label.includes('new ') || label.includes('create ')) {
    return (
      <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '8.5px', color: '#334155', overflow: 'hidden' }}>
        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '9.5px', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
          📝 {tab.label}
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 5px', color: '#64748b' }}>
          Subject: Issue with delivery...
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 5px', color: '#334155' }}>
            Priority: High
          </div>
          <div style={{ flex: 1, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 5px', color: '#334155' }}>
            Dept: Support
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 5px', height: '24px', color: '#94a3b8' }}>
          Detailed description...
        </div>
        <div style={{ marginTop: 'auto', backgroundColor: '#2563eb', color: '#ffffff', textAlign: 'center', padding: '3px', borderRadius: '4px', fontWeight: 800, fontSize: '8px' }}>
          Submit Record
        </div>
      </div>
    );
  }

  // 3. Support Tickets List Preview
  if (p.includes('ticket') || label.includes('ticket')) {
    return (
      <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '8.5px', color: '#1e293b', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '2px 5px', gap: '4px' }}>
          <span style={{ fontSize: '8px' }}>🔍</span>
          <span style={{ color: '#94a3b8', fontSize: '8px' }}>Filter tickets...</span>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#0f172a' }}>TCK-1049</span>
            <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '7px', fontWeight: 800, padding: '1px 4px', borderRadius: '3px' }}>HIGH</span>
          </div>
          <span style={{ color: '#64748b', fontSize: '7.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Order Delivery Delay</span>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#0f172a' }}>TCK-1048</span>
            <span style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '7px', fontWeight: 800, padding: '1px 4px', borderRadius: '3px' }}>OPEN</span>
          </div>
          <span style={{ color: '#64748b', fontSize: '7.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>GST Invoice correction</span>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#0f172a' }}>TCK-1045</span>
            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '7px', fontWeight: 800, padding: '1px 4px', borderRadius: '3px' }}>RESOLVED</span>
          </div>
          <span style={{ color: '#64748b', fontSize: '7.5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Damaged goods refund</span>
        </div>
      </div>
    );
  }

  // 4. Customers / CRM Preview
  if (p.includes('organisation') || p.includes('customer') || p.includes('lead') || p.includes('enquir') || label.includes('customer') || label.includes('crm')) {
    return (
      <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '8.5px', color: '#1e293b', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '9px' }}>🏢 CRM Directory</span>
          <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '7px', fontWeight: 800, padding: '1px 4px', borderRadius: '3px' }}>128 Orgs</span>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#1e293b' }}>Acme Global Corp</span>
            <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '7px' }}>● Active</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '7.5px' }}>GST: 27AAAC... • Mumbai</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#1e293b' }}>Medix Health Care</span>
            <span style={{ color: '#2563eb', fontWeight: 800, fontSize: '7px' }}>● Verified</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '7.5px' }}>POC: Dr. Verma • Pune</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#1e293b' }}>Apex Logistics</span>
            <span style={{ color: '#d97706', fontWeight: 800, fontSize: '7px' }}>● Lead</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '7.5px' }}>Enquiry pending quote</div>
        </div>
      </div>
    );
  }

  // 5. ChatHub / Support Inbox / TeamSync Preview
  if (p.includes('support') || p.includes('chat') || label.includes('chat') || label.includes('inbox')) {
    return (
      <div style={{ flex: 1, backgroundColor: '#efeae2', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '8.5px', color: '#1e293b', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#17375e', color: '#ffffff', padding: '3px 6px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: '8px' }}>💬 TeamSync Room</span>
          <span style={{ fontSize: '7px', color: '#38bdf8' }}>Online</span>
        </div>
        <div style={{ alignSelf: 'flex-start', backgroundColor: '#ffffff', borderRadius: '6px', padding: '3px 6px', maxWidth: '85%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <span style={{ color: '#1e293b', fontSize: '7.5px' }}>Can you check PO #4029 dispatch?</span>
        </div>
        <div style={{ alignSelf: 'flex-end', backgroundColor: '#dcf8c6', borderRadius: '6px', padding: '3px 6px', maxWidth: '85%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <span style={{ color: '#1a3d1a', fontSize: '7.5px' }}>Yes, GRN approved & stock inwarded! ✓✓</span>
        </div>
        <div style={{ alignSelf: 'flex-start', backgroundColor: '#ffffff', borderRadius: '6px', padding: '3px 6px', maxWidth: '85%', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <span style={{ color: '#1e293b', fontSize: '7.5px' }}>Thanks! Shared invoice copy 👍</span>
        </div>
        <div style={{ marginTop: 'auto', backgroundColor: '#ffffff', borderRadius: '4px', padding: '2px 5px', color: '#94a3b8', fontSize: '7.5px', border: '1px solid #cbd5e1' }}>
          Type a message...
        </div>
      </div>
    );
  }

  // 6. WMS / Gate Entry / GRN / Inventory Items
  if (p.includes('inventory') || p.includes('gateentry') || p.includes('grn') || p.includes('batch') || label.includes('gate') || label.includes('grn') || label.includes('item') || label.includes('wms')) {
    return (
      <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '8.5px', color: '#1e293b', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '9px' }}>📦 Warehouse Master</span>
          <span style={{ backgroundColor: '#fef3c7', color: '#b45309', fontSize: '7px', fontWeight: 800, padding: '1px 4px', borderRadius: '3px' }}>Hub #1</span>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#1e293b' }}>Paracetamol 500mg</span>
            <span style={{ color: '#16a34a', fontWeight: 800, fontSize: '7.5px' }}>1,200 pcs</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '7.5px' }}>SKU-8021 • Batch B-992</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#1e293b' }}>Amoxicillin 250mg</span>
            <span style={{ color: '#2563eb', fontWeight: 800, fontSize: '7.5px' }}>480 pcs</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '7.5px' }}>SKU-4412 • QC Passed</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#1e293b' }}>Saline 500ml IV</span>
            <span style={{ color: '#9333ea', fontWeight: 800, fontSize: '7.5px' }}>320 pcs</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '7.5px' }}>SKU-9901 • Expiry 2028</div>
        </div>
      </div>
    );
  }

  // 7. Sales / Orders / Invoices Preview
  if (p.includes('sales') || p.includes('invoice') || p.includes('quotation') || label.includes('sales') || label.includes('order') || label.includes('invoice')) {
    return (
      <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '8.5px', color: '#1e293b', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
          <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '9px' }}>📑 Sales & Billing</span>
          <span style={{ backgroundColor: '#dcfce7', color: '#15803d', fontSize: '7px', fontWeight: 800, padding: '1px 4px', borderRadius: '3px' }}>Confirmed</span>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#1e293b' }}>SO-2026-0812</span>
            <span style={{ color: '#16a34a', fontWeight: 900, fontSize: '8px' }}>₹1,24,500</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '7.5px' }}>Acme Corp • Dispatch Ready</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#1e293b' }}>SO-2026-0811</span>
            <span style={{ color: '#2563eb', fontWeight: 900, fontSize: '8px' }}>₹48,200</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '7.5px' }}>Medix Health • Shipped</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, color: '#1e293b' }}>INV-2026-0441</span>
            <span style={{ color: '#9333ea', fontWeight: 900, fontSize: '8px' }}>₹96,000</span>
          </div>
          <div style={{ color: '#64748b', fontSize: '7.5px' }}>Payment Received (NEFT)</div>
        </div>
      </div>
    );
  }

  // 8. Generic Clean Layout Fallback
  return (
    <div style={{ flex: 1, backgroundColor: '#f8fafc', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '8.5px', color: '#1e293b', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' }}>
        <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '9px' }}>{tab.label}</span>
        <span style={{ backgroundColor: '#e2e8f0', color: '#475569', fontSize: '7px', fontWeight: 700, padding: '1px 4px', borderRadius: '3px' }}>Active</span>
      </div>
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px' }}>
        <div style={{ fontWeight: 700, color: '#334155' }}>Record #101 • Summary</div>
        <div style={{ color: '#64748b', fontSize: '7.5px' }}>Synced with central database</div>
      </div>
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px 6px' }}>
        <div style={{ fontWeight: 700, color: '#334155' }}>Record #102 • Details</div>
        <div style={{ color: '#64748b', fontSize: '7.5px' }}>Last updated just now</div>
      </div>
      <div style={{ marginTop: 'auto', color: '#94a3b8', fontSize: '7px', fontFamily: 'monospace' }}>
        {tab.path}
      </div>
    </div>
  );
};

export const MobileTabSwitcher3D: React.FC<MobileTabSwitcher3DProps> = ({
  isOpen,
  onClose,
  tabs,
  activePath,
  onSelectTab,
  onCloseTab,
  onCloseAllTabs,
  onNewTab,
}) => {
  const [swipedPath, setSwipedPath] = useState<string | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent, tab: AppTab) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartX;

    // If swiped left or right by > 80px, dismiss tab (if closable)
    if (Math.abs(diff) > 80 && tab.closable !== false && tab.path !== '/home') {
      setSwipedPath(tab.path);
      setTimeout(() => {
        onCloseTab(tab.path, e as any);
        setSwipedPath(null);
      }, 200);
    }
    setTouchStartX(null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2000,
        backgroundColor: '#090d16',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease',
        fontFamily: '"Outfit", "Inter", sans-serif',
      }}
    >
      {/* ── Top Header Toolbar ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '1.05rem',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
            }}
          >
            Open Tabs
          </span>
          <span
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.25)',
              color: '#60a5fa',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '9999px',
              border: '1px solid rgba(96, 165, 250, 0.4)',
            }}
          >
            {tabs.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {tabs.length > 1 && (
            <button
              type="button"
              onClick={onCloseAllTabs}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                borderRadius: '8px',
                padding: '0.35rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
              }}
            >
              <TrashIcon size={13} />
              Close All
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#2563eb',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              padding: '0.4rem 0.95rem',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
            }}
          >
            Done
          </button>
        </div>
      </div>

      {/* ── 3D Card Grid Viewport (2-Column Safari Grid) ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '1.25rem 1rem 6rem',
          perspective: '1000px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.85rem',
          alignContent: 'start',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activePath === tab.path;
          const isBeingDismissed = swipedPath === tab.path;
          const TabIcon = tab.icon || DefaultHomeIcon;
          const isHome = tab.path === '/home' || tab.path === '/';

          return (
            <div
              key={tab.path}
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, tab)}
              onClick={() => {
                onSelectTab(tab.path);
                onClose();
              }}
              style={{
                height: '215px',
                borderRadius: '16px',
                backgroundColor: '#1e293b',
                border: isActive
                  ? '2.5px solid #3b82f6'
                  : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: isActive
                  ? '0 12px 24px -6px rgba(59, 130, 246, 0.5), 0 0 0 1px #3b82f6 inset'
                  : '0 8px 16px -4px rgba(0, 0, 0, 0.5)',
                transform: `rotateX(4deg) ${
                  isBeingDismissed ? 'translateX(100vw)' : 'translateX(0)'
                }`,
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                opacity: isBeingDismissed ? 0 : 1,
              }}
            >
              {/* Card Top Title Bar (Glassy Bar with Favicon & Close Button) */}
              <div
                style={{
                  height: '34px',
                  backgroundColor: isActive ? '#1d4ed8' : '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 0.55rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <TabIcon size={14} color={isActive ? '#ffffff' : '#94a3b8'} />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#ffffff',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab.label}
                  </span>
                </div>

                {!isHome && tab.closable !== false && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseTab(tab.path, e);
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      cursor: 'pointer',
                      marginLeft: '0.25rem',
                      padding: 0,
                    }}
                    title="Close tab"
                  >
                    <CloseIcon size={11} />
                  </button>
                )}
              </div>

              {/* Miniature Interactive Content Preview Body */}
              <TabContentPreview tab={tab} />

              {/* Card Bottom Status / URL Footnote */}
              <div
                style={{
                  height: '22px',
                  backgroundColor: '#0b1120',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  padding: '0 0.55rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontSize: '0.62rem',
                    color: '#64748b',
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.path}
                </span>

                {isActive && (
                  <span
                    style={{
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      color: '#60a5fa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.15rem',
                      flexShrink: 0,
                    }}
                  >
                    <CheckIcon size={10} /> Active
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Floating Bottom Action Bar (+ New Tab) ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '0.85rem 1.25rem calc(0.85rem + env(safe-area-inset-bottom, 0px))',
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => {
            onNewTab();
            onClose();
          }}
          style={{
            backgroundColor: '#2563eb',
            border: 'none',
            borderRadius: '9999px',
            color: '#ffffff',
            padding: '0.65rem 1.75rem',
            fontSize: '0.9rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.5)',
            cursor: 'pointer',
          }}
        >
          <PlusIcon size={18} />
          New Tab (Home)
        </button>
      </div>
    </div>
  );
};
