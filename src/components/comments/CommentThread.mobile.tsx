import React, { useState, useRef, useEffect } from 'react';
import { Download, Clock, CheckCheck, CornerUpLeft, Paperclip, Send } from 'lucide-react';
import { Ticket } from '../../pages/Tickets';
import { apiClient } from '@geeksman/core-ui';

export interface CommentThreadMobileProps {
  selectedTicket: Ticket;
  comments: any[];
  currentUserId: string;
  loadingComments: boolean;
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
  getFileIcon: (url: string) => string;
  formatDate: (dateStr: string) => string;
}

export const CommentThreadMobile: React.FC<CommentThreadMobileProps> = ({
  selectedTicket,
  comments,
  currentUserId,
  loadingComments,
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
  getFileIcon,
  formatDate
}) => {
  const [commentUploading, setCommentUploading] = useState(false);
  const commentFileInputRef = useRef<HTMLInputElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`; // slightly shorter max height for mobile
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [unreadCommentsCount, setUnreadCommentsCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const [localTicket, setLocalTicket] = useState(selectedTicket);
  useEffect(() => {
    if (selectedTicket) {
      setLocalTicket(selectedTicket);
    }
  }, [selectedTicket]);

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


  const getMessageDateLabel = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const groupCommentsByDate = (commentsList: any[]) => {
    const groups: { [key: string]: any[] } = {};
    commentsList.forEach(comment => {
      const label = getMessageDateLabel(comment.created_at);
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(comment);
    });
    return groups;
  };

  const groupedComments = groupCommentsByDate(comments);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0, height: '100%' }}>
      <div 
        ref={commentsContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem 1rem 1rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        {/* Chat Bot introduction bubble */}
        <div style={{
          alignSelf: 'center',
          backgroundColor: '#fef08a',
          color: '#713f12',
          fontSize: '0.725rem',
          fontWeight: 600,
          padding: '0.4rem 0.85rem',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '85%',
          boxShadow: '0 1px 1px rgba(0,0,0,0.06)',
          lineHeight: 1.3
        }}>
          🛡️ This ticket was opened on {localTicket ? formatDate(localTicket.created_at) : ''}. Status is currently {localTicket?.status?.toUpperCase() || ''}.
        </div>

        {loadingComments ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
            <div style={{ width: '20px', height: '20px', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#0b2240', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : comments.length === 0 ? (
          <div style={{
            color: '#64748b',
            fontSize: '0.75rem',
            textAlign: 'center',
            marginTop: '2rem',
            backgroundColor: '#ffffff',
            padding: '0.6rem 1rem',
            borderRadius: '12px',
            alignSelf: 'center',
            boxShadow: '0 1px 1.5px rgba(0,0,0,0.08)'
          }}>
            No chat updates yet. Start the conversation below.
          </div>
        ) : (
          Object.keys(groupedComments).map(dateGroup => (
            <React.Fragment key={dateGroup}>
              <div style={{
                alignSelf: 'center',
                backgroundColor: '#ffffff',
                color: '#64748b',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '0.25rem 0.65rem',
                borderRadius: '8px',
                boxShadow: '0 1px 1px rgba(0,0,0,0.05)',
                margin: '0.5rem 0'
              }}>
                {dateGroup}
              </div>

              {groupedComments[dateGroup].map(c => {
                const senderId = c.created_by?.id || c.created_by_id || '';
                const isSelf = senderId && currentUserId && senderId === currentUserId;
                const name = c.created_by?.name || (isSelf ? 'You' : 'Representative');
                
                return (
                  <div key={c.id} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isSelf ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    alignSelf: isSelf ? 'flex-end' : 'flex-start',
                    width: '100%',
                    marginBottom: '0.25rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '0.35rem',
                      width: '100%',
                      flexDirection: isSelf ? 'row-reverse' : 'row'
                    }}>
                      <div style={{
                        padding: '0.45rem 0.65rem 0.3rem 0.65rem',
                        borderRadius: isSelf ? '12px 12px 0px 12px' : '12px 12px 12px 0px',
                        backgroundColor: isSelf ? 'rgba(23, 55, 94, 0.06)' : '#ffffff',
                        border: isSelf ? '1px solid rgba(23, 55, 94, 0.15)' : '1px solid #E5E7EB',
                        color: isSelf ? '#17375E' : '#1F2937',
                        fontSize: '0.825rem',
                        lineHeight: 1.4,
                        minWidth: '80px',
                        maxWidth: '100%',
                        textAlign: 'left',
                        boxShadow: 'none',
                        position: 'relative'
                      }}>
                         {!isSelf && (
                           <div style={{
                             display: 'flex',
                             justifyContent: 'space-between',
                             alignItems: 'center',
                             gap: '0.75rem',
                             marginBottom: '0.2rem',
                             fontSize: '0.675rem',
                             fontWeight: 800
                           }}>
                             <span style={{ color: '#17375E' }}>{name}</span>
                           </div>
                         )}

                        {c.parent_comment_id && (
                          <div style={{
                            fontSize: '0.725rem',
                            background: isSelf ? 'rgba(23, 55, 94, 0.05)' : 'rgba(0,0,0,0.03)',
                            borderLeft: '3px solid #17375E',
                            padding: '4px 6px',
                            marginBottom: '6px',
                            borderRadius: '4px',
                            color: '#4B5563',
                            textAlign: 'left'
                          }}>
                            <strong style={{ display: 'block', color: '#17375E', fontSize: '0.65rem' }}>
                              {comments.find(p => p.id === c.parent_comment_id)?.created_by?.name || 'User'}
                            </strong>
                            <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {comments.find(p => p.id === c.parent_comment_id)?.content || 'Attachment'}
                            </span>
                          </div>
                        )}

                        <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                          {c.content}
                        </div>

                        {c.images && c.images.length > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                            {c.images.map((img: any, idx: number) => {
                              const fileIcon = getFileIcon(img.url);
                              const fName = getFileName(img.url);

                              if (fileIcon === 'image') {
                                return (
                                  <div
                                    key={idx}
                                    onClick={() => {
                                      setPreviewUrl(getAbsoluteMediaUrl(img.url));
                                      setPreviewTitle(fName);
                                    }}
                                    style={{ cursor: 'pointer', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}
                                  >
                                    <img
                                      src={getAbsoluteMediaUrl(img.url)}
                                      alt="attachment"
                                      style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }}
                                    />
                                  </div>
                                );
                              } else {
                                return (
                                  <a
                                    key={idx}
                                    href={getAbsoluteMediaUrl(img.url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.65rem',
                                      padding: '0.5rem 0.6rem',
                                      borderRadius: '6px',
                                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                      textDecoration: 'none',
                                      color: '#1e293b',
                                      border: '1px solid rgba(0, 0, 0, 0.06)',
                                      width: '100%',
                                      boxSizing: 'border-box'
                                    }}
                                  >
                                    <div style={{
                                      backgroundColor: fileIcon === 'pdf' ? '#fee2e2' : fileIcon === 'spreadsheet' ? '#dcfce7' : '#f1f5f9',
                                      color: fileIcon === 'pdf' ? '#ef4444' : fileIcon === 'spreadsheet' ? '#16a34a' : '#475569',
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.65rem',
                                      fontWeight: 900,
                                      flexShrink: 0
                                    }}>
                                      {fileIcon === 'pdf' ? 'PDF' : fileIcon === 'spreadsheet' ? 'XLS' : 'FILE'}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                      <div style={{ fontSize: '0.75rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {fName}
                                      </div>
                                      <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Download file</span>
                                    </div>
                                    <Download size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                                  </a>
                                );
                              }
                            })}
                          </div>
                        )}

                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: '2px',
                          fontSize: '0.6rem',
                          color: '#64748b',
                          marginTop: '0.25rem',
                          textAlign: 'right'
                        }}>
                          <span>
                            {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isSelf && (
                            <span style={{ color: c.status === 'sending' ? '#64748b' : (c.status === 'failed' ? '#ef4444' : '#0284c7'), display: 'flex', alignItems: 'center', cursor: c.status === 'failed' ? 'pointer' : 'default' }} onClick={() => c.status === 'failed' && retryComment(c.id)}>
                              {c.status === 'sending' ? (
                                <Clock size={11} />
                              ) : c.status === 'failed' ? (
                                <span title="Failed to send. Click to retry.">⚠️ <span style={{ textDecoration: 'underline', fontSize: '0.55rem' }}>Retry</span></span>
                              ) : (
                                <CheckCheck size={12} />
                              )}
                            </span>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setReplyingTo(c)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.8)',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: '5px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          alignSelf: 'center',
                          flexShrink: 0,
                          boxShadow: '0 1px 1px rgba(0,0,0,0.05)'
                        }}
                        title="Reply"
                      >
                        <CornerUpLeft size={10} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {unreadCommentsCount > 0 && (
        <div 
          onClick={scrollToBottom}
          style={{
            position: 'absolute',
            bottom: replyingTo ? '135px' : '95px',
            right: '1rem',
            backgroundColor: '#10b981',
            color: '#fff',
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
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

      {/* Bottom Send Message Panel */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        padding: '0.5rem 0.75rem 0.75rem 0.75rem',
        backgroundColor: '#f0f2f5',
        borderTop: '1px solid #e2e8f0',
        zIndex: 1000,
        boxSizing: 'border-box',
        flexShrink: 0
      }}>
        {replyingTo && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.4rem 0.65rem',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#0f766e',
            marginBottom: '0.15rem',
            borderLeft: '4px solid #0f766e',
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '0.5rem', textAlign: 'left' }}>
              Replying to <strong>{replyingTo.created_by?.name || 'Representative'}</strong>: <span style={{ opacity: 0.8 }}>{replyingTo.content || 'Attachment'}</span>
            </div>
            <button 
              type="button"
              onClick={() => setReplyingTo(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.7rem'
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {uploadedCommentImages.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.25rem' }}>
            {uploadedCommentImages.map((url, i) => (
              <div key={`${url}-${i}`} style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 20px 4px 8px',
                background: '#e2e8f0',
                color: '#1e293b',
                borderRadius: '12px',
                fontSize: '0.675rem',
                fontWeight: 700,
                border: '1px solid #cbd5e1'
              }}>
                <span
                  onClick={() => {
                    setPreviewUrl(getAbsoluteMediaUrl(url));
                    setPreviewTitle(getFileName(url) || 'Attachment');
                  }}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Click to preview"
                >
                  📄 {getFileName(url).substring(0, 15)}
                </span>
                <button
                  type="button"
                  onClick={() => setUploadedCommentImages(uploadedCommentImages.filter((_, idx) => idx !== i))}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    border: 'none',
                    background: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    padding: 0
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); submitComment(e); }} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="file"
            ref={commentFileInputRef}
            style={{ display: 'none' }}
            multiple
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            onChange={handleCommentFilesUpload}
          />
          {/* Paperclip upload trigger */}
          <button
            type="button"
            onClick={() => commentFileInputRef.current?.click()}
            disabled={commentUploading}
            style={{
              background: '#ffffff',
              border: 'none',
              color: '#475569',
              width: '2.3rem',
              height: '2.3rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
              boxShadow: '0 1px 1.5px rgba(0,0,0,0.1)'
            }}
          >
            {commentUploading ? (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(71, 85, 105, 0.2)',
                borderTopColor: '#475569',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <Paperclip size={18} />
            )}
          </button>

          {/* Message input field */}
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type message..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            style={{
              flex: 1,
              padding: '0.55rem 1rem',
              borderRadius: '16px',
              border: 'none',
              backgroundColor: '#ffffff',
              fontSize: '0.85rem',
              outline: 'none',
              boxSizing: 'border-box',
              boxShadow: '0 1px 1.5px rgba(0,0,0,0.08)',
              resize: 'none',
              maxHeight: '120px',
              fontFamily: 'inherit',
              overflowY: 'auto',
              transition: 'height 0.1s ease'
            }}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={commentUploading || (!commentText.trim() && uploadedCommentImages.length === 0)}
            style={{
              backgroundColor: '#17375E',
              color: '#ffffff',
              border: 'none',
              width: '2.3rem',
              height: '2.3rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: (commentUploading || (!commentText.trim() && uploadedCommentImages.length === 0)) ? 'not-allowed' : 'pointer',
              opacity: (commentUploading || (!commentText.trim() && uploadedCommentImages.length === 0)) ? 0.5 : 1,
              boxShadow: '0 1px 2px rgba(11, 34, 64, 0.2)'
            }}
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
