import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useMediaQuery, apiClient, useToast, getWorkspaceFromUrl } from '@geeksman/core-ui';
import { useNotification } from '@geeksman/notification';
import { TicketsDesktop } from './Tickets.desktop';
import { TicketsMobile } from './Tickets.mobile';

export interface Ticket {
  id: string;
  ticket_number: string;
  subject: string;
  description: string;
  created_at: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  subscription_id?: string;
  subscription_name?: string;
  created_by?: {
    id: string;
    name: string;
  };
  metadata?: {
    products?: Array<{ product_id: string; product_name: string; sku: string }>;
  };
  images?: Array<{ url: string }>;
}

export interface ReferenceItem {
  id: string;
  number: string;
  type: 'order' | 'invoice' | 'enquiry' | 'subscription';
  name?: string;
}

export interface TicketsProps {
  tickets: Ticket[];
  references: ReferenceItem[];
  loading: boolean;
  error: string | null;
  subject: string;
  setSubject: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  setPriority: (val: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  selectedReferenceType: 'order' | 'invoice' | 'enquiry' | 'general' | 'subscription' | '';
  setSelectedReferenceType: (val: 'order' | 'invoice' | 'enquiry' | 'general' | 'subscription' | '') => void;
  selectedReferenceID: string;
  setSelectedReferenceID: (val: string) => void;
  orderLines: any[];
  loadingLines: boolean;
  selectedProducts: string[];
  setSelectedProducts: (val: string[]) => void;
  uploadedImages: string[];
  setUploadedImages: (val: string[]) => void;
  uploadedCommentImages: string[];
  setUploadedCommentImages: (val: string[]) => void;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
  comments: any[];
  loadingComments: boolean;
  commentText: string;
  setCommentText: (val: string) => void;
  submitComment: (e: React.FormEvent) => Promise<void>;
  replyingTo: any;
  setReplyingTo: (val: any) => void;
  getStatusStyle: (status: Ticket['status']) => any;
  getPriorityStyle: (priority: Ticket['priority']) => any;
  formatDate: (dateStr: string) => string;
  refreshComments: (ticketId: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  dateRangeFilter: string;
  setDateRangeFilter: (val: string) => void;
  customStartDate: string;
  setCustomStartDate: (val: string) => void;
  customEndDate: string;
  setCustomEndDate: (val: string) => void;
  showCreatePanel: boolean;
  setShowCreatePanel: (val: boolean) => void;
  refreshTickets: () => void;
}

export const Tickets: React.FC = () => {
  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const location = useLocation();
  const { showToast } = useToast();
  const { notifications, markAsRead } = useNotification();

  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.user_id || payload.userId || '';
      } catch (e) {
        console.error(e);
      }
    }
    return '';
  });
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('LOW');
  const [selectedReferenceType, setSelectedReferenceType] = useState<'order' | 'invoice' | 'enquiry' | 'general' | 'subscription' | ''>('general');
  const [selectedReferenceID, setSelectedReferenceID] = useState('');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [selectedSubscriptionID, setSelectedSubscriptionID] = useState('');
  const [orderLines, setOrderLines] = useState<any[]>([]);
  const [loadingLines, setLoadingLines] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadedCommentImages, setUploadedCommentImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM'>('ALL');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const hasParsedParams = useRef(false);

  // Selection & Comment states
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const handleSetSelectedTicket = (ticket: Ticket | null) => {
    setSelectedTicket(ticket);
    const hash = window.location.hash;
    const [path, query] = hash.split('?');
    const params = new URLSearchParams(query || '');
    if (ticket) {
      if (params.get('ticketId') !== ticket.id) {
        params.set('ticketId', ticket.id);
        window.location.hash = `${path}?${params.toString()}`;
      }
    } else {
      if (params.has('ticketId')) {
        params.delete('ticketId');
        const newQuery = params.toString();
        window.location.hash = newQuery ? `${path}?${newQuery}` : path;
      }
    }
  };

  useEffect(() => {
    if (tickets.length === 0) return;
    const searchStr = window.location.hash.includes('?') 
      ? window.location.hash.substring(window.location.hash.indexOf('?')) 
      : '';
    const params = new URLSearchParams(searchStr);
    const ticketId = params.get('ticketId') || params.get('id');
    if (ticketId) {
      const matchedTicket = tickets.find((t: any) => String(t.id) === String(ticketId));
      if (matchedTicket) {
        if (!selectedTicket || 
            selectedTicket.id !== matchedTicket.id || 
            selectedTicket.status !== matchedTicket.status ||
            selectedTicket.priority !== matchedTicket.priority) {
          setSelectedTicket(matchedTicket);
        }
      }
    } else {
      setSelectedTicket(null);
    }
  }, [location, tickets, selectedTicket]);
  useEffect(() => {
    if (selectedTicket) {
      const unreadNotifs = notifications.filter(n => !n.is_read && n.link?.includes(selectedTicket.id));
      if (unreadNotifs.length > 0) {
        unreadNotifs.forEach(n => {
          markAsRead(n.id);
        });
        fetchTicketComments(selectedTicket.id, true);
      }
    }
  }, [selectedTicket, notifications]);

  useEffect(() => {
    if (!showCreatePanel) {
      setSubject('');
      setDescription('');
      setSelectedReferenceType('general');
      setSelectedReferenceID('');
      setSelectedProducts([]);
      setUploadedImages([]);
    }
  }, [showCreatePanel]);

  const activeTicketIdRef = useRef<string | null>(null);
  const latestRequestedTicketIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeTicketIdRef.current = selectedTicket?.id || null;
    (window as any).activeTicketId = selectedTicket?.id || null;
    return () => {
      activeTicketIdRef.current = null;
      (window as any).activeTicketId = null;
    };
  }, [selectedTicket]);

  const fetchTicketsOnly = async () => {
    try {
      const res = await apiClient.get('/ticketing/customer/tickets');
      const fetchedTickets = (res.data?.data || []).map((t: any) => ({
        ...t,
        subject: t.title || t.subject
      }));
      setTickets(fetchedTickets);
    } catch (err) {
      console.error("Failed to refresh tickets list:", err);
    }
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const notif = (e as CustomEvent).detail;
      
      const isComment =
        notif?.entity_name === 'ticket' ||
        notif?.event_type === 'comment.created' ||
        notif?.event_type === 'ticket.comment' ||
        (notif?.link && notif.link.toLowerCase().includes('/tickets'));

      if (isComment) {
        // Refresh only the tickets list (for last snippet and unread dot) rather than re-fetching all static B2B orders/subscriptions
        fetchTicketsOnly();
        
        // If the comment was created by another user, reload comments to display it.
        // If it's self-created, we've already added it optimistically and fetched in submitComment.
        const isSelfComment = 
          notif?.actor_id === currentUserId || 
          notif?.created_by_id === currentUserId || 
          notif?.created_by?.id === currentUserId ||
          notif?.actor?.id === currentUserId;

        if (selectedTicket && !isSelfComment) {
          fetchTicketComments(selectedTicket.id, true);
        }
      }
    };

    window.addEventListener('notification_received', handler);
    return () => window.removeEventListener('notification_received', handler);
  }, [selectedTicket, currentUserId]);

  const fetchInitData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketsRes, ordersRes, invoicesRes, enquiriesRes, subsRes] = await Promise.all([
        apiClient.get('/ticketing/customer/tickets'),
        apiClient.get('/sales/customer/orders'),
        apiClient.get('/sales/customer/invoices'),
        apiClient.get('/sales/customer/enquiries'),
        apiClient.get('/sales/customer/subscriptions')
      ]);
      const fetchedTickets = (ticketsRes.data?.data || []).map((t: any) => ({
        ...t,
        subject: t.title || t.subject
      }));
      const fetchedOrders = (ordersRes.data?.data || []).map((o: any) => ({
        id: String(o.id),
        number: `${o.order_number}${o.notes ? ` - ${o.notes}` : ''}`,
        type: 'order' as const
      }));
      const fetchedInvoices = (invoicesRes.data?.data || []).map((i: any) => ({
        id: String(i.id),
        number: `${i.invoice_number}${i.notes ? ` - ${i.notes}` : ''}`,
        type: 'invoice' as const
      }));
      const fetchedEnquiries = (enquiriesRes.data?.data || []).map((e: any) => ({
        id: String(e.id),
        number: `${e.enquiry_number}${e.remarks ? ` - ${e.remarks}` : ''}`,
        type: 'enquiry' as const
      }));

      setTickets(fetchedTickets);
      const fetchedSubscriptions = (subsRes.data?.data || []).map((s: any) => ({
        id: String(s.id),
        number: `${s.subscription_name} (${s.license_number || ''})`,
        name: s.subscription_name,
        type: 'subscription' as const
      }));
      setSubscriptions(subsRes.data?.data || []);
      const combined = [...fetchedOrders, ...fetchedInvoices, ...fetchedEnquiries, ...fetchedSubscriptions];
      setReferences(combined);

      // Prepopulate from URL search params or hash search params
      if (!hasParsedParams.current) {
        hasParsedParams.current = true;
        const searchStr = window.location.hash.includes('?') 
          ? window.location.hash.substring(window.location.hash.indexOf('?')) 
          : '';
        const params = new URLSearchParams(searchStr);
        
        const ticketId = params.get('ticketId') || params.get('id');
        if (ticketId) {
          const matchedTicket = fetchedTickets.find((t: any) => String(t.id) === String(ticketId));
          if (matchedTicket) {
            setSelectedTicket(matchedTicket);
          }
        }
        
        const refType = params.get('ref_type');
        const refId = params.get('ref_id');

        if (refId) {
          const match = combined.find(r => r.id === refId && (refType ? r.type === refType : true));
          if (match) {
            setSelectedReferenceType(match.type);
            setSelectedReferenceID(refId);
            setShowCreatePanel(true);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch support details.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderLines = async (orderId: string) => {
    if (!orderId) {
      setOrderLines([]);
      return;
    }
    const ref = references.find(r => r.id === orderId);
    if (!ref || ref.type !== 'order') {
      setOrderLines([]);
      return;
    }
    setLoadingLines(true);
    try {
      const res = await apiClient.get(`/sales/customer/orders/${orderId}`);
      setOrderLines(res.data?.data?.lines || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLines(false);
    }
  };

  const flattenComments = (commentsTree: any[]): any[] => {
    const result: any[] = [];
    const recurse = (list: any[]) => {
      if (!Array.isArray(list)) return;
      for (const c of list) {
        if (!c) continue;
        result.push(c);
        if (c.replies && c.replies.length > 0) {
          recurse(c.replies);
        }
      }
    };
    recurse(commentsTree);
    return result.sort((a, b) => {
      const aTime = a && a.created_at ? new Date(a.created_at).getTime() : 0;
      const bTime = b && b.created_at ? new Date(b.created_at).getTime() : 0;
      return aTime - bTime;
    });
  };

  const fetchTicketComments = async (ticketId: string, silent: boolean = false) => {
    if (!silent) {
      setLoadingComments(true);
    }
    try {
      const res = await apiClient.get('/comments/customer/comments', {
        params: { entity_name: 'ticket', entity_id: ticketId }
      });
      if (activeTicketIdRef.current !== ticketId) return;
      setComments(flattenComments(res.data?.data || []));
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) {
        setLoadingComments(false);
      }
    }
  };

  useEffect(() => {
    fetchInitData();
  }, []);

  useEffect(() => {
    if (selectedReferenceID) {
      fetchOrderLines(selectedReferenceID);
      setSelectedProducts([]);
    } else {
      setOrderLines([]);
      setSelectedProducts([]);
    }
  }, [selectedReferenceID]);

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketComments(selectedTicket.id);
      setCommentText('');
    } else {
      setComments([]);
    }
  }, [selectedTicket]);

  useEffect(() => {
    (window as any).activeTicketId = selectedTicket?.id || null;
    if (selectedTicket) {
      window.dispatchEvent(new CustomEvent('customer-hide-bottom-nav', { detail: true }));
    } else {
      window.dispatchEvent(new CustomEvent('customer-hide-bottom-nav', { detail: false }));
    }
    return () => {
      (window as any).activeTicketId = null;
      window.dispatchEvent(new CustomEvent('customer-hide-bottom-nav', { detail: false }));
    };
  }, [selectedTicket]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    if (selectedReferenceType && selectedReferenceType !== 'general' && !selectedReferenceID) return;

    setSubmitting(true);
    const selectedRef = selectedReferenceID ? references.find(r => r.id === selectedReferenceID) : null;

    // Map selected product IDs to their snapped product details
    const selectedProductsSnapshots = orderLines
      .filter(line => selectedProducts.includes(line.id))
      .map(line => ({
        product_id: line.product_id,
        product_name: line.product_name_snapshot,
        sku: line.sku
      }));

    const tenantCode = getWorkspaceFromUrl();
    let baseURL = apiClient.defaults.baseURL || '';
    if (baseURL.startsWith('/')) {
      baseURL = `${window.location.origin}${baseURL}`;
    }
    const imagePayload = uploadedImages.map(id => ({ url: id }));

    const selectedSub = selectedReferenceType === 'subscription'
      ? references.find(r => r.id === selectedReferenceID && r.type === 'subscription')
      : null;

    try {
      await apiClient.post('/ticketing/customer/tickets', {
        title: subject,
        description: description,
        status: 'open',
        subscription_id: selectedReferenceType === 'subscription' ? selectedReferenceID : undefined,
        subscription_name: selectedSub ? selectedSub.name : 'General',
        reference_type: selectedReferenceType && selectedReferenceType !== 'subscription' && selectedReferenceType !== 'general' ? selectedReferenceType : undefined,
        reference_id: selectedReferenceType && selectedReferenceType !== 'subscription' && selectedReferenceType !== 'general' ? selectedReferenceID : undefined,
        images: imagePayload,
        metadata: {
          products: selectedProductsSnapshots
        }
      });
      
      setSubject('');
      setDescription('');
      setPriority('LOW');
      setSelectedReferenceType('general');
      setSelectedReferenceID('');
      setSelectedSubscriptionID('');
      setSelectedProducts([]);
      setUploadedImages([]);

      // Refresh list
      const res = await apiClient.get('/ticketing/customer/tickets');
      const refreshedTickets = (res.data?.data || []).map((t: any) => ({
        ...t,
        subject: t.title || t.subject
      }));
      setTickets(refreshedTickets);
      showToast("Ticket submitted successfully!", "success");
    } catch (err: any) {
      console.error("Failed to submit ticket:", err);
      const errMsg = err?.response?.data?.error?.message || err?.response?.data?.message || "Failed to submit ticket. Please try again.";
      showToast(errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const submitComment = async (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!selectedTicket || (!commentText.trim() && uploadedCommentImages.length === 0)) return;

    const tenantCode = getWorkspaceFromUrl();
    let baseURL = apiClient.defaults.baseURL || '';
    if (!baseURL.startsWith('http://') && !baseURL.startsWith('https://')) {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const fallbackOrigin = isLocal ? 'http://localhost:8082' : window.location.origin;
      if (baseURL.startsWith('/')) {
        baseURL = `${fallbackOrigin}${baseURL}`;
      } else {
        baseURL = `${fallbackOrigin}/api/v1`;
      }
    }
    const imagePayload = uploadedCommentImages.map(id => ({ url: id }));

    const getFileName = (url: string) => {
      const decoded = decodeURIComponent(url);
      const name = decoded.substring(decoded.lastIndexOf('/') + 1);
      return name.split('?')[0];
    };

    const finalContent = commentText.trim() || (uploadedCommentImages.length > 0 ? `Sent attachment: ${getFileName(imagePayload[0].url)}` : 'Sent an attachment');

    const tempId = `temp-${Date.now()}`;
    const optimisticComment = {
      id: tempId,
      entity_name: 'ticket',
      entity_id: selectedTicket.id,
      content: finalContent,
      images: imagePayload,
      parent_comment_id: replyingTo ? replyingTo.id : undefined,
      created_at: new Date().toISOString(),
      created_by: {
        id: currentUserId,
        name: 'You'
      },
      status: 'sending'
    };

    setComments(prev => [...prev, optimisticComment]);
    setCommentText('');
    setUploadedCommentImages([]);
    setReplyingTo(null);

    try {
      await apiClient.post('/comments/customer/comments', {
        entity_name: 'ticket',
        entity_id: selectedTicket.id,
        content: finalContent,
        images: imagePayload,
        parent_comment_id: optimisticComment.parent_comment_id
      });
      await fetchTicketComments(selectedTicket.id, true);
    } catch (err: any) {
      console.error("Failed to post comment:", err);
      setComments(prev => prev.map(c => c.id === tempId ? { ...c, status: 'failed' } : c));
      const errMsg = err?.response?.data?.error?.message || err?.response?.data?.message || "Failed to submit comment. Please try again.";
      showToast(errMsg, "error");
    }
  };

  const retryComment = async (tempId: string) => {
    const comment = comments.find(c => c.id === tempId);
    if (!comment || !selectedTicket) return;

    setComments(prev => prev.map(c => c.id === tempId ? { ...c, status: 'sending' } : c));

    try {
      await apiClient.post('/comments/customer/comments', {
        entity_name: 'ticket',
        entity_id: selectedTicket.id,
        content: comment.content,
        images: comment.images,
        parent_comment_id: comment.parent_comment_id
      });
      await fetchTicketComments(selectedTicket.id, true);
    } catch (err: any) {
      console.error("Failed to retry post comment:", err);
      setComments(prev => prev.map(c => c.id === tempId ? { ...c, status: 'failed' } : c));
      showToast("Retry failed. Please check connection.", "error");
    }
  };

  const getStatusStyle = (status: Ticket['status']) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case 'OPEN':
        return { color: '#1e40af', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' };
      case 'IN_PROGRESS':
        return { color: '#b45309', backgroundColor: '#fef3c7', border: '1px solid #fde68a' };
      case 'RESOLVED':
        return { color: '#15803d', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0' };
      case 'CLOSED':
      default:
        return { color: '#4b5563', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb' };
    }
  };

  const getPriorityStyle = (p: Ticket['priority']) => {
    const s = String(p).toUpperCase();
    switch (s) {
      case 'HIGH':
        return { color: '#ef4444' };
      case 'MEDIUM':
        return { color: '#f59e0b' };
      default:
        return { color: '#10b981' };
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTickets = tickets.filter(t => {
    // 1. Status Filter
    if (statusFilter && statusFilter !== 'ALL') {
      if (t.status.toUpperCase() !== statusFilter.toUpperCase()) {
        return false;
      }
    }

    // 2. Search Query Filter
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const displayTicketNumber = t.ticket_number || '';
      const subject = (t.subject || '').toLowerCase();
      const description = (t.description || '').toLowerCase();
      const ticketId = (t.id || '').toLowerCase();
      const subName = (t.subscription_name || '').toLowerCase();

      const refStr = `ref: ${subName}`;
      const refSpaceStr = `ref ${subName}`;

      const matchesSearch = 
        displayTicketNumber.toLowerCase().includes(query) ||
        ticketId.includes(query) ||
        subject.includes(query) ||
        description.includes(query) ||
        subName.includes(query) ||
        refStr.includes(query) ||
        refSpaceStr.includes(query);

      if (!matchesSearch) return false;
    }

    // 3. Date Range Filter
    if (dateRangeFilter === 'ALL') return true;

    if (t.created_at) {
      const ticketDate = new Date(t.created_at);
      const now = new Date();
      
      // Calculate start of current week
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0, 0, 0, 0);

      // Calculate start of current month
      const nowMonth = new Date();
      const startOfMonth = new Date(nowMonth.getFullYear(), nowMonth.getMonth(), 1);

      // Calculate start of current year
      const nowYear = new Date();
      const startOfYear = new Date(nowYear.getFullYear(), 0, 1);

      if (dateRangeFilter === 'THIS_WEEK') {
        return ticketDate >= startOfWeek;
      } else if (dateRangeFilter === 'THIS_MONTH') {
        return ticketDate >= startOfMonth;
      } else if (dateRangeFilter === 'THIS_YEAR') {
        return ticketDate >= startOfYear;
      } else if (dateRangeFilter === 'CUSTOM') {
        let matchesDate = true;
        if (customStartDate) {
          matchesDate = matchesDate && ticketDate >= new Date(customStartDate + 'T00:00:00');
        }
        if (customEndDate) {
          matchesDate = matchesDate && ticketDate <= new Date(customEndDate + 'T23:59:59');
        }
        return matchesDate;
      }
    }
    return true;
  });

  const props: any = {
    tickets,
    filteredTickets,
    currentUserId,
    references,
    loading,
    error,
    subject,
    setSubject,
    description,
    setDescription,
    priority,
    setPriority,
    selectedReferenceType,
    setSelectedReferenceType,
    selectedReferenceID,
    setSelectedReferenceID,
    subscriptions,
    selectedSubscriptionID,
    setSelectedSubscriptionID,
    orderLines,
    loadingLines,
    selectedProducts,
    setSelectedProducts,
    uploadedImages,
    setUploadedImages,
    uploadedCommentImages,
    setUploadedCommentImages,
    submitting,
    handleSubmit,
    selectedTicket,
    setSelectedTicket: handleSetSelectedTicket,
    comments,
    loadingComments,
    commentText,
    setCommentText,
    submitComment,
    retryComment,
    replyingTo,
    setReplyingTo,
    getStatusStyle,
    getPriorityStyle,
    formatDate,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    dateRangeFilter,
    setDateRangeFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    showCreatePanel,
    setShowCreatePanel,
    refreshTickets: fetchInitData,
    fetchTicketComments,
    notifications
  };

  return isDesktop ? <TicketsDesktop {...props} /> : <TicketsMobile {...props} />;
};
