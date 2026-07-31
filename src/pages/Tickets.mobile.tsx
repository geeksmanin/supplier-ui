import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { ChevronLeft, Info, RefreshCw } from 'lucide-react';
import { DocumentPreviewModal, getDefaultBackendUrl } from '@geeksman/core-ui';
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

const getFileIcon = (url: string) => {
  if (!url) return 'file';
  const cleanUrl = url.split('?')[0];
  const ext = cleanUrl.split('.').pop()?.toLowerCase() || '';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'spreadsheet';
  if (ext === 'pdf') return 'pdf';
  return 'file';
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

export const TicketsMobile: React.FC<any> = (props) => {
  const {
    selectedTicket,
    setSelectedTicket,
    commentText,
    fetchTicketComments,
    formatDate,
    setUploadedImages,
    setSubject,
    setDescription,
    setSelectedReferenceType,
    setSelectedReferenceID,
    setSelectedProducts
  } = props;

  const [showModal, setShowModal] = useState(false);
  const [showInfoDrawer, setShowInfoDrawer] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [cachedTicket, setCachedTicket] = useState<any>(null);

  useEffect(() => {
    if (!showModal) {
      setSubject('');
      setDescription('');
      setSelectedReferenceType('');
      setSelectedReferenceID('');
      setSelectedProducts([]);
      setUploadedImages([]);
    }
  }, [showModal, setSubject, setDescription, setSelectedReferenceType, setSelectedReferenceID, setSelectedProducts, setUploadedImages]);

  useEffect(() => {
    if (selectedTicket) {
      setCachedTicket(selectedTicket);
    } else {
      const timer = setTimeout(() => {
        setCachedTicket(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [selectedTicket]);

  useEffect(() => {
    if (selectedTicket) {
      setDrafts((prev) => {
        if (!commentText.trim()) {
          const next = { ...prev };
          delete next[selectedTicket.id];
          return next;
        }
        return { ...prev, [selectedTicket.id]: commentText };
      });
    }
  }, [commentText, selectedTicket]);

  const handleSelectTicket = (ticket: any) => {
    setSelectedTicket(ticket);
  };

  const handleBack = () => {
    window.history.back();
  };

  const commonProps = {
    ...props,
    drafts,
    handleSelectTicket,
    setShowModal,
    setShowInfoDrawer,
    setPreviewUrl,
    setPreviewTitle,
    getAbsoluteMediaUrl,
    getFileName,
    getFileIcon,
    isImageUrl
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: cachedTicket ? '100dvh' : 'calc(100dvh - 56px)',
      backgroundColor: '#f8fafc',
      fontFamily: '"Outfit", "Inter", sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Navbar (only rendered on mobile when a ticket is open/selected) */}
      {cachedTicket && (
        <div style={{
          padding: '0.85rem 1rem',
          backgroundColor: '#17375E',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          zIndex: 100,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
            <button
              onClick={handleBack}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              <ChevronLeft size={24} />
            </button>
            <div style={{ textAlign: 'left', minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#ffffff' }}>
                {cachedTicket.subject}
              </h3>
              <span style={{ fontSize: '0.675rem', color: '#94a3b8', fontWeight: 700 }}>
                {cachedTicket.ticket_number}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={() => setShowInfoDrawer(true)}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              <Info size={20} />
            </button>
            <button 
              onClick={async () => {
                if (cachedTicket && fetchTicketComments) {
                  await fetchTicketComments(cachedTicket.id);
                }
              }}
              style={{ background: 'none', border: 'none', color: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
              title="Refresh Chat"
            >
              <RefreshCw 
                size={18} 
                style={{ 
                  animation: props.loadingComments ? 'spin 1s linear infinite' : 'none' 
                }} 
              />
            </button>
          </div>
        </div>
      )}

      {/* Main Switchable Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          width: '200%',
          height: '100%',
          transform: selectedTicket ? 'translateX(-50%)' : 'translateX(0%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <TicketList {...commonProps} />
          </div>
          <div style={{
            width: '50%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#efeae2',
            backgroundImage: 'radial-gradient(rgba(0, 0, 0, 0.03) 1px, transparent 0)',
            backgroundSize: '16px 16px'
          }}>
            {cachedTicket && (
              <CommentThread {...commonProps} />
            )}
          </div>
        </div>
      </div>

      {/* Slide Up Modal: Create New Ticket */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.3)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              zIndex: 20000
            }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                backgroundColor: '#fff',
                borderTopLeftRadius: '1.5rem',
                borderTopRightRadius: '1.5rem',
                boxSizing: 'border-box',
                maxHeight: '85%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <TicketForm {...commonProps} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Drawer (Ticket details on mobile) */}
      <AnimatePresence>
        {showInfoDrawer && selectedTicket && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInfoDrawer(false)}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                zIndex: 30000
              }}
            />
            {/* Drawer Body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '80%',
                maxWidth: '300px',
                backgroundColor: '#ffffff',
                boxShadow: '-4px 0 12px rgba(0,0,0,0.1)',
                zIndex: 30001,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <TicketDetail {...commonProps} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <DocumentPreviewModal
        isOpen={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        url={previewUrl}
        title={previewTitle}
      />
    </div>
  );
};
