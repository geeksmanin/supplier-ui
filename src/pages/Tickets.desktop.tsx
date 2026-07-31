import React, { useState, useEffect } from 'react';
import { DocumentPreviewModal, getDefaultBackendUrl } from '@geeksman/core-ui';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { TicketList } from '../components/tickets/TicketList';
import { TicketForm } from '../components/tickets/TicketForm';
import { TicketDetail } from '../components/tickets/TicketDetail';
import { CommentThread } from '../components/comments/CommentThread';

const isImageUrl = (url: string) => {
  if (!url) return false;
  const cleanUrl = url.toLowerCase().split('?')[0];
  return cleanUrl.endsWith('.png') || 
         cleanUrl.endsWith('.jpg') || 
         cleanUrl.endsWith('.jpeg') || 
         cleanUrl.endsWith('.gif') || 
         cleanUrl.endsWith('.webp') || 
         cleanUrl.endsWith('.svg') || 
         cleanUrl.endsWith('.bmp') ||
         url.startsWith('data:image/');
};

const getFileName = (url: string) => {
  if (!url) return '';
  const decoded = decodeURIComponent(url);
  const name = decoded.substring(decoded.lastIndexOf('/') + 1);
  return name.split('?')[0];
};

const getAbsoluteMediaUrl = (url: string) => {
  if (!url) return '';
  
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }

  const config = window.runtimeConfig as any;
  const backendBase = config?.apiBaseUrl || getDefaultBackendUrl();
  let backendHost = '';
  if (backendBase.startsWith('http://') || backendBase.startsWith('https://')) {
    backendHost = backendBase.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
  }

  if (url.startsWith('/')) {
    if (url.startsWith('/api/v1')) {
      return `${backendHost}${url}`;
    }
    return `${backendHost}/api/v1${url}`;
  }
  const tenantCode = config?.tenantCode || 'platform';
  return `${backendHost}/api/v1/media/${tenantCode}/${url}`;
};

export const TicketsDesktop: React.FC<any> = (props) => {
  const {
    error,
    showCreatePanel,
    setShowCreatePanel,
    selectedTicket,
    setSelectedTicket
  } = props;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [showDetailsDrawer, setShowDetailsDrawer] = useState<boolean>(false);

  useEffect(() => {
    setShowDetailsDrawer(false);
  }, [selectedTicket]);

  const commonProps = {
    ...props,
    setPreviewUrl,
    setPreviewTitle,
    getAbsoluteMediaUrl,
    getFileName,
    isImageUrl
  };

  return (
    <div style={{
      padding: '2rem',
      backgroundColor: '#F8FAFC',
      fontFamily: '"Outfit", "Inter", sans-serif',
      height: 'calc(100vh - 74px)',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <header style={{
        flexShrink: 0,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, color: '#1F2937' }}>Support & Assistance</h1>
          <p style={{ color: '#6B7280', fontSize: '1rem', margin: '0.25rem 0 0' }}>Raise issues, specify affected products, and chat with our team</p>
        </div>
        <button
          onClick={() => setShowCreatePanel(!showCreatePanel)}
          style={{
            backgroundColor: showCreatePanel ? '#6B7280' : '#17375E',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '0.65rem 1.25rem',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(23, 55, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <MessageSquare size={16} />
          {showCreatePanel ? 'View Tickets' : 'Raise New Issue'}
        </button>
      </header>

      {error && (
        <div style={{
          color: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.1)',
          padding: '1rem',
          borderRadius: '8px',
          textAlign: 'center',
          flexShrink: 0
        }}>{error}</div>
      )}

      {/* Main Split Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '1.5rem',
        flex: 1,
        minHeight: 0
      }}>
        {/* Left Column: Tickets List with Search & Filter */}
        <TicketList {...commonProps} />

        {/* Right Column: Toggleable Details/Comments Panel OR Raise Ticket Panel */}
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
          textAlign: 'left',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {showCreatePanel ? (
            <TicketForm {...commonProps} />
          ) : selectedTicket ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, position: 'relative' }}>
              <CommentThread 
                {...commonProps} 
                onInfoClick={() => setShowDetailsDrawer(true)} 
                onCloseClick={() => setSelectedTicket(null)}
              />
              
              {/* Drawer Backdrop to close on click outside */}
              {showDetailsDrawer && (
                <div 
                  onClick={() => setShowDetailsDrawer(false)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.25)',
                    zIndex: 99,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease-in-out'
                  }}
                />
              )}

              {/* Sliding Details Drawer Container */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  right: showDetailsDrawer ? 0 : '-420px',
                  bottom: 0,
                  width: '400px',
                  backgroundColor: '#ffffff',
                  borderLeft: '1px solid #e5e7eb',
                  boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.08)',
                  transition: 'right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: 100,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Header of Drawer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', flexShrink: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#1f2937' }}>Ticket Details</h3>
                  <button 
                    onClick={() => setShowDetailsDrawer(false)}
                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: '#94a3b8', cursor: 'pointer', lineHeight: 1 }}
                  >
                    &times;
                  </button>
                </div>
                {/* Body of Drawer */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <TicketDetail {...commonProps} />
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              opacity: 0.5,
              padding: '4rem',
              gap: '1rem'
            }}>
              <AlertCircle size={48} color="#64748b" />
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1f2937' }}>No ticket selected</div>
              <div style={{ fontSize: '0.85rem', color: '#6b7280', textAlign: 'center', maxWidth: '300px' }}>
                Select an issue from the active list to view details and communicate with support representatives.
              </div>
            </div>
          )}
        </div>
      </div>
      <DocumentPreviewModal
        isOpen={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        url={previewUrl}
        title={previewTitle}
      />
    </div>
  );
};
