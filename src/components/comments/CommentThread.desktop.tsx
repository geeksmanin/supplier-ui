import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, RefreshCw, Clock, CheckCheck, CornerUpLeft, Paperclip, Send, Info, X } from 'lucide-react';
import { Ticket } from '../../pages/Tickets';
import { apiClient } from '@geeksman/core-ui';

export interface CommentThreadDesktopProps {
  selectedTicket: Ticket;
  comments: any[];
  currentUserId: string;
  loadingComments: boolean;
  fetchTicketComments: (ticketId: string, silent?: boolean) => Promise<void>;
  commentText: string;
  setCommentText: (val: string) => void;
  submitComment: (e?: React.FormEvent) => Promise<void>;
  retryComment: (tempId: string) => Promise<void>;
  replyingTo: any;
  setReplyingTo: (val: any) => void;
  uploadedCommentImages: string[];
  setUploadedCommentImages: (val: string[]) => void;
  setPreviewUrl: (url: string | null) => void;
  setPreviewTitle: (title: string) => void;
  getAbsoluteMediaUrl: (url: string) => string;
  getFileName: (url: string) => string;
  isImageUrl: (url: string) => boolean;
  onInfoClick?: () => void;
  onCloseClick?: () => void;
}

const getPastelColor = (str: string) => {
  const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const pastelColors = [
    { bg: '#e0f2fe', text: '#17375E' }, // light blue
    { bg: '#e6fffa', text: '#17375E' }, // mint
    { bg: '#f3e8ff', text: '#17375E' }, // lavender
    { bg: '#ffedd5', text: '#17375E' }  // peach
  ];
  return pastelColors[hash % pastelColors.length];
};

export const CommentThreadDesktop: React.FC<CommentThreadDesktopProps> = ({
  selectedTicket,
  comments,
  currentUserId,
  loadingComments,
  fetchTicketComments,
  commentText,
  setCommentText,
  submitComment,
  retryComment,
  replyingTo,
  setReplyingTo,
  uploadedCommentImages,
  setUploadedCommentImages,
  setPreviewUrl,
  setPreviewTitle,
  getAbsoluteMediaUrl,
  getFileName,
  isImageUrl,
  onInfoClick,
  onCloseClick
}) => {
  const [commentUploading, setCommentUploading] = useState(false);
  const commentFileInputRef = useRef<HTMLInputElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [commentText]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (commentText.trim() || uploadedCommentImages.length > 0) {
        submitComment();
      }
    }
  };

  const [unreadCommentsCount, setUnreadCommentsCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = () => {
    if (commentsContainerRef.current) {
      commentsContainerRef.current.scrollTop = commentsContainerRef.current.scrollHeight;
      setUnreadCommentsCount(0);
      setIsAtBottom(true);
    }
  };

  const handleScroll = () => {
    if (commentsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = commentsContainerRef.current;
      const atBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsAtBottom(atBottom);
      if (atBottom) {
        setUnreadCommentsCount(0);
      }
    }
  };

  useEffect(() => {
    if (!comments || comments.length === 0) return;
    const lastComment = comments[comments.length - 1];
    const senderId = lastComment.created_by?.id || lastComment.created_by_id || '';
    const isSelf = senderId && currentUserId && senderId === currentUserId;

    if (isSelf || isAtBottom) {
      setTimeout(scrollToBottom, 50);
    } else {
      setUnreadCommentsCount((prev) => prev + 1);
    }
  }, [comments]);

  useEffect(() => {
    setUnreadCommentsCount(0);
    setIsAtBottom(true);
    setTimeout(scrollToBottom, 100);
  }, [selectedTicket]);

  const handleCommentFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setCommentUploading(true);
    const uploaded = [...uploadedCommentImages];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'comments');

        const res = await apiClient.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uploadUrl = res.data?.url || res.data?.uploadId || res.data?.upload_id;
        if (uploadUrl) {
          uploaded.push(String(uploadUrl));
        }
      }
      setUploadedCommentImages(uploaded);
    } catch (err) {
      console.error("Failed to upload files:", err);
    } finally {
      setCommentUploading(false);
      if (commentFileInputRef.current) {
        commentFileInputRef.current.value = '';
      }
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const filesToUpload: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          // Ensure file has an extension, if none exists rename it to include .png
          const name = file.name || 'image.png';
          const hasExt = name.match(/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i);
          const finalName = hasExt ? name : `${name}.png`;
          const renamedFile = new File([file], finalName, { type: file.type || 'image/png' });
          filesToUpload.push(renamedFile);
        }
      }
    }

    if (filesToUpload.length === 0) return;

    e.preventDefault();
    setCommentUploading(true);
    const uploaded = [...uploadedCommentImages];

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'comments');

        const res = await apiClient.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uploadUrl = res.data?.url || res.data?.uploadId || res.data?.upload_id;
        if (uploadUrl) {
          uploaded.push(String(uploadUrl));
        }
      }
      setUploadedCommentImages(uploaded);
    } catch (err) {
      console.error("Failed to upload pasted files:", err);
    } finally {
      setCommentUploading(false);
    }
  };


  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      minHeight: 0,
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(8px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            backgroundColor: 'rgba(26, 86, 219, 0.12)',
            color: '#1a56db',
            padding: '0.35rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MessageSquare size={16} />
          </div>
          <span style={{ 
            fontSize: '0.95rem', 
            fontWeight: 900, 
            color: '#0f172a',
            fontFamily: '"Outfit", "Inter", sans-serif',
            letterSpacing: '0.025em'
          }}>Conversation History</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={onInfoClick}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color: '#1a56db',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Ticket Details"
          >
            <Info size={16} />
          </button>
          <button
            type="button"
            onClick={() => fetchTicketComments(selectedTicket.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              color: '#1a56db',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '50%',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            title="Refresh Chat"
          >
            <RefreshCw 
              size={16} 
              style={{
                animation: loadingComments ? 'spin 1s linear infinite' : 'none'
              }}
            />
          </button>
          {onCloseClick && (
            <button
              type="button"
              onClick={onCloseClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '50%',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }}
              title="Close Chat"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0 }}>
        <div 
          ref={commentsContainerRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            backgroundColor: '#F8FAFC',
          }}
        >
          {loadingComments ? (
            <div style={{ textAlign: 'center', padding: '1rem', color: '#6b7280' }}>Syncing chat...</div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#9ca3af', fontSize: '0.85rem' }}>
              No messages yet. Send a message below to start chatting with our support staff.
            </div>
          ) : (
            comments.map((comment: any) => {
              const senderId = comment.created_by?.id || comment.created_by_id || '';
              const isSelf = senderId && currentUserId && senderId === currentUserId;
              const name = comment.created_by?.name || (isSelf ? 'You' : 'Staff Representative');
              const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
              return (
                <div 
                  key={comment.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isSelf ? 'flex-end' : 'flex-start',
                    gap: '0.25rem',
                    width: '100%',
                    marginBottom: '0.5rem'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '0.65rem',
                    width: '100%',
                    flexDirection: isSelf ? 'row-reverse' : 'row'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: getPastelColor(name).bg,
                      color: getPastelColor(name).text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      boxShadow: 'none',
                      border: '1.5px solid rgba(23, 55, 94, 0.08)',
                    }}
                    title={name}>
                      {initials}
                    </div>

                    <div style={{
                      maxWidth: '75%',
                      padding: '0.75rem 1rem',
                      borderRadius: isSelf ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      backgroundColor: isSelf ? 'rgba(23, 55, 94, 0.06)' : '#ffffff',
                      border: isSelf ? '1px solid rgba(23, 55, 94, 0.15)' : '1px solid #E5E7EB',
                      color: isSelf ? '#17375E' : '#1F2937',
                      fontSize: '0.85rem',
                      boxShadow: 'none',
                      wordBreak: 'break-word',
                      textAlign: 'left'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '0.35rem',
                        fontSize: '0.75rem',
                      }}>
                        <span style={{
                          fontWeight: 800,
                          color: isSelf ? '#17375E' : '#4b5563',
                        }}>
                          {name}
                        </span>
                        <span style={{
                          fontSize: '0.65rem',
                          color: isSelf ? '#17375E' : '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isSelf && (
                            comment.status === 'sending' ? (
                              <Clock size={11} style={{ opacity: 0.6 }} />
                            ) : comment.status === 'failed' ? (
                              <span 
                                style={{ color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }} 
                                title="Failed to send. Click to retry." 
                                onClick={() => retryComment(comment.id)}
                              >
                                ⚠️ <span style={{ textDecoration: 'underline', fontSize: '0.6rem' }}>Retry</span>
                              </span>
                            ) : (
                              <CheckCheck size={12} style={{ color: '#17375E' }} />
                            )
                          )}
                        </span>
                      </div>
                      {comment.parent_comment_id && (
                        <div style={{
                          fontSize: '0.75rem',
                          background: isSelf ? 'rgba(23, 55, 94, 0.05)' : 'rgba(0,0,0,0.04)',
                          borderLeft: '3px solid #17375E',
                          padding: '6px 8px',
                          marginBottom: '6px',
                          borderRadius: '4px',
                          color: isSelf ? '#17375E' : '#4B5563',
                          textAlign: 'left'
                        }}>
                          <strong style={{ display: 'block', color: '#17375E', fontSize: '0.7rem', marginBottom: '2px' }}>
                            {comments.find(p => p.id === comment.parent_comment_id)?.created_by?.name || 'User'}
                          </strong>
                          <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {comments.find(p => p.id === comment.parent_comment_id)?.content || 'Attached File/Message'}
                          </span>
                        </div>
                      )}
                      {comment.content}
                      {comment.images && comment.images.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                          {comment.images.map((img: any, idx: number) => (
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                setPreviewUrl(getAbsoluteMediaUrl(img.url));
                                setPreviewTitle(getFileName(img.url) || 'Attachment');
                              }}
                              key={idx}
                              style={{ cursor: 'pointer', textDecoration: 'none' }}
                            >
                              {!isImageUrl(img.url) ? (
                                <div style={{
                                  width: '80px',
                                  height: '80px',
                                  borderRadius: '6px',
                                  border: '1px solid #cbd5e1',
                                  backgroundColor: '#f3f4f6',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.65rem',
                                  fontWeight: 'bold',
                                  color: '#4b5563',
                                  padding: '4px',
                                  textAlign: 'center',
                                  wordBreak: 'break-all',
                                  boxSizing: 'border-box'
                                }}>
                                  <span style={{ fontSize: '1.25rem', marginBottom: '2px' }}>📄</span>
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', whiteSpace: 'nowrap' }}>
                                    {getFileName(img.url).substring(0, 10) || 'File'}
                                  </span>
                                </div>
                              ) : (
                                <img
                                  src={getAbsoluteMediaUrl(img.url)}
                                  alt={`Attachment ${idx + 1}`}
                                  style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'cover',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0'
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setReplyingTo(comment)}
                      style={{
                        background: '#f3f4f6',
                        border: 'none',
                        color: '#4b5563',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        alignSelf: 'center',
                        flexShrink: 0
                      }}
                      title="Reply"
                    >
                      <CornerUpLeft size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
        {unreadCommentsCount > 0 && (
          <div 
            onClick={scrollToBottom}
            style={{
              position: 'absolute',
              bottom: '1rem',
              right: '2rem',
              backgroundColor: '#10b981',
              color: '#fff',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              zIndex: 10
            }}
          >
            <span>{unreadCommentsCount} new message{unreadCommentsCount > 1 ? 's' : ''}</span>
            <span>👇</span>
          </div>
        )}
      </div>

      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(226, 232, 240, 0.5)',
        padding: '1.25rem 2rem',
        flexShrink: 0
      }}>
        {replyingTo && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0.85rem',
            backgroundColor: 'rgba(26, 86, 219, 0.12)',
            borderLeft: '4px solid #1a56db',
            borderRadius: '8px',
            fontSize: '0.78rem',
            color: '#1e40af',
            marginBottom: '0.75rem',
            backdropFilter: 'blur(5px)',
            border: '1px solid rgba(26, 86, 219, 0.2)'
          }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '1rem' }}>
              Replying to <strong>{replyingTo.created_by?.name || 'Staff Representative'}</strong>: <span style={{ opacity: 0.85 }}>{replyingTo.content || 'File/Attachment'}</span>
            </div>
            <button 
              type="button"
              onClick={() => setReplyingTo(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#1d4ed8',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.75rem'
              }}
            >
              Cancel
            </button>
          </div>
        )}
        
        {uploadedCommentImages.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {uploadedCommentImages.map((url, i) => (
              <div key={`${url}-${i}`} style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 28px 6px 12px',
                background: 'rgba(26, 86, 219, 0.1)',
                color: '#1e40af',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                border: '1px solid rgba(26, 86, 219, 0.25)',
                backdropFilter: 'blur(5px)'
              }}>
                <span
                  onClick={() => {
                    setPreviewUrl(getAbsoluteMediaUrl(url));
                    setPreviewTitle(getFileName(url) || 'Attachment');
                  }}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Click to preview"
                >
                  📄 {getFileName(url).substring(0, 15) || 'Attachment'}
                </span>
                <button
                  type="button"
                  onClick={() => setUploadedCommentImages(uploadedCommentImages.filter((_, idx) => idx !== i))}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    border: 'none',
                    background: 'none',
                    color: '#1d4ed8',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    padding: 0,
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); submitComment(e); }} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="file"
            ref={commentFileInputRef}
            style={{ display: 'none' }}
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            onChange={handleCommentFilesUpload}
          />
          <button
            type="button"
            onClick={() => commentFileInputRef.current?.click()}
            disabled={commentUploading}
            style={{
              background: 'none',
              border: '1px solid rgba(229, 231, 235, 0.5)',
              color: '#4b5563',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem',
              borderRadius: '1rem',
              transition: 'all 0.2s ease',
              backgroundColor: 'rgba(243, 244, 246, 0.8)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(229, 231, 235, 0.9)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(243, 244, 246, 0.8)')}
            title="Attach document or image"
          >
            {commentUploading ? (
              <div style={{
                width: '18px',
                height: '18px',
                border: '2px solid rgba(75, 85, 99, 0.3)',
                borderTopColor: '#4b5563',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <Paperclip size={20} />
            )}
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type your message..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            style={{
              flex: 1,
              padding: '0.65rem 1.25rem',
              borderRadius: '1rem',
              border: '1px solid rgba(203, 213, 225, 0.6)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(5px)',
              outline: 'none',
              fontSize: '0.875rem',
              boxSizing: 'border-box',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
              transition: 'height 0.1s ease',
              resize: 'none',
              maxHeight: '160px',
              fontFamily: 'inherit',
              overflowY: 'auto'
            }}
          />
          <button
            type="submit"
            disabled={commentUploading || (!commentText.trim() && uploadedCommentImages.length === 0)}
            style={{
              backgroundColor: '#17375E',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '1rem',
              cursor: (commentUploading || (!commentText.trim() && uploadedCommentImages.length === 0)) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 800,
              fontSize: '0.85rem',
              boxShadow: '0 4px 12px rgba(23, 55, 94, 0.15)',
              opacity: (commentUploading || (!commentText.trim() && uploadedCommentImages.length === 0)) ? 0.5 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={14} /> Send
          </button>
        </form>
      </div>
    </div>
  );
};
