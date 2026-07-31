import React from 'react';
import { X } from 'lucide-react';
import { Select, ImageUpload, apiClient } from '@geeksman/core-ui';
import { Ticket, ReferenceItem } from '../../pages/Tickets';

export interface TicketFormMobileProps {
  selectedReferenceType: 'order' | 'invoice' | 'enquiry' | 'general' | '';
  setSelectedReferenceType: (val: 'order' | 'invoice' | 'enquiry' | 'general' | '') => void;
  selectedReferenceID: string;
  setSelectedReferenceID: (val: string) => void;
  subscriptions: any[];
  selectedSubscriptionID: string;
  setSelectedSubscriptionID: (val: string) => void;
  references: ReferenceItem[];
  loadingLines: boolean;
  orderLines: any[];
  selectedProducts: string[];
  setSelectedProducts: (val: string[]) => void;
  subject: string;
  setSubject: (val: string) => void;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  setPriority: (val: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  description: string;
  setDescription: (val: string) => void;
  uploadedImages: string[];
  setUploadedImages: (val: string[]) => void;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setShowModal: (val: boolean) => void;
}

export const TicketFormMobile: React.FC<TicketFormMobileProps> = ({
  selectedReferenceType,
  setSelectedReferenceType,
  selectedReferenceID,
  setSelectedReferenceID,
  subscriptions,
  selectedSubscriptionID,
  setSelectedSubscriptionID,
  references,
  loadingLines,
  orderLines,
  selectedProducts,
  setSelectedProducts,
  subject,
  setSubject,
  priority,
  setPriority,
  description,
  setDescription,
  uploadedImages,
  setUploadedImages,
  submitting,
  handleSubmit,
  setShowModal
}) => {
  const handleProductToggle = (lineId: string) => {
    if (selectedProducts.includes(lineId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== lineId));
    } else {
      setSelectedProducts([...selectedProducts, lineId]);
    }
  };

  const handleImageUploads = async (files: File[]) => {
    try {
      const next = [...uploadedImages];
      for (const file of files) {
        if (next.length >= 5) {
          break;
        }
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'tickets');

        const res = await apiClient.post('/media/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uploadUrl = res.data?.url || res.data?.uploadId || res.data?.upload_id;
        if (uploadUrl) {
          next.push(String(uploadUrl));
        }
      }
      setUploadedImages(next);
    } catch (err) {
      console.error('Failed to upload pasted/dropped image:', err);
    }
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    const filesToUpload: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          filesToUpload.push(file);
        }
      }
    }
    
    if (filesToUpload.length > 0) {
      e.preventDefault();
      await handleImageUploads(filesToUpload);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files) return;
    
    const filesToUpload: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.indexOf('image') !== -1) {
        filesToUpload.push(file);
      }
    }
    
    if (filesToUpload.length > 0) {
      await handleImageUploads(filesToUpload);
    }
  };

  const handleMobileSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e);
    setShowModal(false);
  };

  return (
    <div style={{
      width: '100%',
      backgroundColor: '#fff',
      borderTopLeftRadius: '1.5rem',
      borderTopRightRadius: '1.5rem',
      padding: '1.5rem',
      boxSizing: 'border-box',
      maxHeight: '85%',
      overflowY: 'auto',
      textAlign: 'left'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
        borderBottom: '1px solid #f1f5f9',
        paddingBottom: '0.5rem'
      }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: '#111827' }}>Raise a Ticket</h2>
        <button 
          onClick={() => setShowModal(false)}
          style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleMobileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {/* Reference Type */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b7280' }}>Reference Type *</label>
          <Select
            value={selectedReferenceType}
            onChange={(val: string) => {
              setSelectedReferenceType(val as any);
              setSelectedReferenceID('');
            }}
            options={[
              { value: 'general', label: 'General (No Document)' },
              { value: 'order', label: 'Sales Order' },
              { value: 'invoice', label: 'Sales Invoice' },
              { value: 'enquiry', label: 'Sales Enquiry' },
              { value: 'subscription', label: 'Subscription Plan' }
            ]}
            placeholder="Choose Type"
          />
        </div>

        {/* Specific reference item */}
        {selectedReferenceType && selectedReferenceType !== 'general' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b7280' }}>
              Select {selectedReferenceType === 'order' ? 'Sales Order' : selectedReferenceType === 'invoice' ? 'Sales Invoice' : selectedReferenceType === 'enquiry' ? 'Sales Enquiry' : 'Subscription Plan'} *
            </label>
            <Select
              value={selectedReferenceID}
              onChange={(val: string) => setSelectedReferenceID(val as string)}
              options={references
                .filter((ref: any) => ref.type === selectedReferenceType)
                .map((ref: any) => ({
                  value: ref.id,
                  label: ref.number
                }))}
              placeholder={`Choose ${selectedReferenceType === 'order' ? 'Order' : selectedReferenceType === 'invoice' ? 'Invoice' : 'enquiry' === selectedReferenceType ? 'Enquiry' : 'Subscription'}`}
            />
          </div>
        )}

        {/* Affected products */}
        {(() => {
          const selectedRef = references.find((r: any) => r.id === selectedReferenceID);
          if (selectedRef && selectedRef.type === 'order') {
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b7280' }}>Affected Products</label>
                {loadingLines ? (
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Loading products...</div>
                ) : orderLines.length === 0 ? (
                  <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>No products found.</div>
                ) : (
                  <div style={{
                    maxHeight: '100px',
                    overflowY: 'auto',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.65rem',
                    padding: '0.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    backgroundColor: '#f9fafb'
                  }}>
                    {orderLines.map(line => (
                      <label key={line.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(line.id)}
                          onChange={() => handleProductToggle(line.id)}
                        />
                        <span>{line.product_name_snapshot}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })()}

        {/* Subject */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b7280' }}>Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Brief summary..."
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.65rem',
              padding: '0.55rem',
              color: '#111827',
              fontSize: '0.85rem',
              outline: 'none'
            }}
            required
          />
        </div>

        {/* Priority */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b7280' }}>Priority</label>
          <Select
            value={priority}
            onChange={(val: string) => setPriority(val as any)}
            options={[
              { value: 'LOW', label: 'Low' },
              { value: 'MEDIUM', label: 'Medium' },
              { value: 'HIGH', label: 'High' }
            ]}
          />
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b7280' }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onPaste={handlePaste}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            placeholder="Details of the problem... (paste images to attach them)"
            rows={3}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.65rem',
              padding: '0.55rem',
              color: '#111827',
              fontSize: '0.85rem',
              outline: 'none',
              resize: 'none'
            }}
          />
        </div>

        {/* Attachments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <ImageUpload
            folder="tickets"
            label="Attachments"
            value={uploadedImages}
            onChange={(urls: string[]) => setUploadedImages(urls)}
            multiple
            maxFiles={5}
          />
        </div>

        <button 
          type="submit" 
          disabled={submitting}
          style={{
            backgroundColor: '#0b2240',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.65rem',
            padding: '0.65rem',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            marginTop: '0.25rem'
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Support Request'}
        </button>
      </form>
    </div>
  );
};
