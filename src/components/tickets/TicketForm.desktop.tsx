import React from 'react';
import { Select, ImageUpload, apiClient } from '@geeksman/core-ui';
import { X } from 'lucide-react';
import { Ticket, ReferenceItem } from '../../pages/Tickets';

export interface TicketFormDesktopProps {
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
  setShowCreatePanel: (val: boolean) => void;
}

export const TicketFormDesktop: React.FC<TicketFormDesktopProps> = ({
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
  setShowCreatePanel
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

  return (
    <div style={{ padding: '2rem', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#111827', margin: 0 }}>Raise a New Issue</h2>
        <button 
          onClick={() => setShowCreatePanel(false)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#1f2937';
            e.currentTarget.style.backgroundColor = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X size={20} />
        </button>
      </div>
      <form onSubmit={async (e) => {
        await handleSubmit(e);
        setShowCreatePanel(false);
      }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
        
        {/* Reference Type & Specific Item Selection Row */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedReferenceType && selectedReferenceType !== 'general' ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          {/* Reference Type Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>Reference Type *</label>
            <Select
              value={selectedReferenceType}
              onChange={(val) => {
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

          {/* Specific Reference Item Selection */}
          {selectedReferenceType && selectedReferenceType !== 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>
                Select {selectedReferenceType === 'order' ? 'Sales Order' : selectedReferenceType === 'invoice' ? 'Sales Invoice' : selectedReferenceType === 'enquiry' ? 'Sales Enquiry' : 'Subscription Plan'} *
              </label>
              <Select
                value={selectedReferenceID}
                onChange={(val) => setSelectedReferenceID(val as string)}
                options={references
                  .filter((ref: any) => ref.type === selectedReferenceType)
                  .map((ref: any) => ({
                    value: ref.id,
                    label: ref.number
                  }))}
                placeholder={`Choose ${selectedReferenceType === 'order' ? 'Order' : selectedReferenceType === 'invoice' ? 'Invoice' : selectedReferenceType === 'enquiry' ? 'Enquiry' : 'Subscription'}`}
              />
            </div>
          )}
        </div>

        {/* Dynamic Products Checklist (Orders only) */}
        {(() => {
          const selectedRef = references.find((r: any) => r.id === selectedReferenceID);
          if (selectedRef && selectedRef.type === 'order') {
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>Affected Products (Select one or more)</label>
                {loadingLines ? (
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>Loading products...</div>
                ) : orderLines.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>No products found in this order.</div>
                ) : (
                  <div style={{
                    maxHeight: '150px',
                    overflowY: 'auto',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    backgroundColor: '#f8fafc'
                  }}>
                    {orderLines.map(line => (
                      <label key={line.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', cursor: 'pointer', color: '#374151' }}>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(line.id)}
                          onChange={() => handleProductToggle(line.id)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{line.product_name_snapshot} ({line.sku})</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return null;
        })()}

        {/* Subject & Priority Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.5rem', alignItems: 'end' }}>
          {/* Subject */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Summary of the issue..."
              style={{
                backgroundColor: '#fff',
                border: '1px solid #cbd5e1',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                color: '#111827',
                fontSize: '0.85rem',
                outline: 'none',
                height: '42px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {/* Priority */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>Priority</label>
            <Select
              value={priority}
              onChange={(val) => setPriority(val as any)}
              options={[
                { value: 'LOW', label: 'Low' },
                { value: 'MEDIUM', label: 'Medium' },
                { value: 'HIGH', label: 'High' }
              ]}
            />
          </div>
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6b7280', textTransform: 'uppercase' }}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onPaste={handlePaste}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            placeholder="Details of the problem... (You can drag & drop or paste images to attach them)"
            rows={5}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #cbd5e1',
              borderRadius: '0.75rem',
              padding: '0.75rem',
              color: '#111827',
              fontSize: '0.85rem',
              outline: 'none',
              resize: 'none'
            }}
          />
        </div>

        {/* Attachments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <ImageUpload
            folder="tickets"
            label="Attachments"
            value={uploadedImages}
            onChange={(urls) => setUploadedImages(urls)}
            multiple
            maxFiles={5}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <button 
            type="submit" 
            disabled={submitting}
            style={{
              backgroundColor: '#17375E',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem 2rem',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(23, 55, 94, 0.15)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0f243e'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#17375E'}
          >
            {submitting ? 'Submitting...' : 'Raise Ticket'}
          </button>
          <button 
            type="button"
            onClick={() => setShowCreatePanel(false)}
            style={{
              backgroundColor: '#f3f4f6',
              color: '#4b5563',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem 2rem',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
