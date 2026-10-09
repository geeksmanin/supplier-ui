import React, { useState, useEffect, useRef } from 'react';
import { DynamicDataModel } from '../model/DynamicDataModel';
import { TemplateDefinition } from '../engine/types';
import { useTemplateEngine } from '../hooks/useTemplateEngine';
import { AvailableKeysInspector } from './AvailableKeysInspector';
import { ExportTemplateModal } from './ExportTemplateModal';
import { TemplateEditorModal } from './TemplateEditorModal';
import { exportPageToImageBlob, exportPagesToPdfBlob, downloadBlob } from '../engine/exportEngine';
import { interpolateTemplate } from '../engine/interpolator';

export interface VoucherDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataModel: DynamicDataModel;
  templates: TemplateDefinition[];
  defaultTemplateId?: string;
  irnQrData?: string;
  upiQrData?: string;
  title?: string;
  onWhatsAppShare?: (blob?: Blob, phone?: string) => void;
  onExportExcel?: () => void;
}

export const VoucherDetailsModal: React.FC<VoucherDetailsModalProps> = ({
  isOpen,
  onClose,
  dataModel,
  templates: initialTemplates,
  defaultTemplateId,
  irnQrData,
  upiQrData,
  title = 'Voucher Details Export & Printing',
  onWhatsAppShare,
  onExportExcel,
}) => {
  const [showKeysInspector, setShowKeysInspector] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [isExporting, setIsExporting] = useState<'image' | 'pdf' | null>(null);

  const [activeTemplates, setActiveTemplates] = useState<TemplateDefinition[]>(initialTemplates);
  const pagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveTemplates(initialTemplates);
  }, [initialTemplates]);

  const {
    series,
    availableTemplates,
    selectedTemplate,
    setSelectedTemplateId,
    paginatedPages,
    qrCodes,
    flattenedKeys,
    handlePrint,
  } = useTemplateEngine({
    dataModel,
    templates: activeTemplates,
    defaultTemplateId,
    irnQrData,
    upiQrData,
  });

  if (!isOpen) return null;

  const docNo =
    dataModel.getValue('doc.No') ||
    dataModel.getValue('doc_no') ||
    dataModel.getValue('DocNo') ||
    '';

  const cleanDocNo = docNo ? docNo.replace(/[^a-zA-Z0-9_-]/g, '_') : 'voucher';

  const handleExportImage = async () => {
    if (!pagesContainerRef.current) return;
    const pageElements = Array.from(
      pagesContainerRef.current.querySelectorAll('.printable-page')
    ) as HTMLElement[];
    if (pageElements.length === 0) return;

    setIsExporting('image');
    try {
      for (let i = 0; i < pageElements.length; i++) {
        const blob = await exportPageToImageBlob(pageElements[i], { scale: 2 });
        if (blob) {
          const fileName =
            pageElements.length > 1
              ? `${cleanDocNo}_page_${i + 1}.png`
              : `${cleanDocNo}.png`;
          downloadBlob(blob, fileName);
        }
      }
    } catch (err) {
      console.error('Failed to export image:', err);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPdf = async () => {
    if (!pagesContainerRef.current) return;
    const pageElements = Array.from(
      pagesContainerRef.current.querySelectorAll('.printable-page')
    ) as HTMLElement[];
    if (pageElements.length === 0) return;

    setIsExporting('pdf');
    try {
      const pdfBlob = await exportPagesToPdfBlob(pageElements);
      downloadBlob(pdfBlob, `${cleanDocNo}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(null);
    }
  };

  const handleSaveCustomTemplate = (newTpl: TemplateDefinition) => {
    setActiveTemplates((prev) => [newTpl, ...prev.filter((t) => t.id !== newTpl.id)]);
    setSelectedTemplateId(newTpl.id);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.25rem',
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: '#f1f5f9',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '1240px',
          height: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.38)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
        }}
      >
        {/* ================= MODAL HEADER ================= */}
        <div
          style={{
            padding: '1rem 1.75rem',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                {title}
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>
                Voucher Ref: <b>{docNo}</b> &nbsp;|&nbsp; Detected Series:{' '}
                <span
                  style={{
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                >
                  Series {series}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setShowEditorModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '0.45rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              ➕ Create Template
            </button>

            <button
              onClick={() => setShowKeysInspector(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '0.45rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              🏷️ Available Keys ({flattenedKeys.length})
            </button>

            {selectedTemplate && (
              <button
                onClick={() => setShowExportModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  color: '#1d4ed8',
                  cursor: 'pointer',
                }}
                title="Export this template definition as TypeScript/JSON to commit into Git"
              >
                ⚡ Export Template (Git)
              </button>
            )}

            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '1.4rem',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.25rem 0.5rem',
                borderRadius: '8px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ================= CONTROLS & TEMPLATE SELECTOR ================= */}
        <div
          style={{
            padding: '0.75rem 1.75rem',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          {/* Template Picker Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b' }}>Template:</span>
            {availableTemplates.map((t) => {
              const isSelected = selectedTemplate?.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  style={{
                    padding: '0.45rem 0.9rem',
                    borderRadius: '8px',
                    border: '1px solid',
                    borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                    backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                    color: isSelected ? '#1d4ed8' : '#475569',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {t.name}
                </button>
              );
            })}
          </div>

          {/* Action Buttons: PNG, PDF, Print, Excel, WhatsApp */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {onExportExcel && (
              <button
                onClick={onExportExcel}
                style={{
                  padding: '0.45rem 0.85rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  color: '#15803d',
                  cursor: 'pointer',
                }}
              >
                📊 Excel
              </button>
            )}

            {onWhatsAppShare && (
              <button
                onClick={() => onWhatsAppShare()}
                style={{
                  padding: '0.45rem 0.85rem',
                  backgroundColor: '#22c55e',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                💬 WhatsApp
              </button>
            )}

            {/* Download Image (PNG) */}
            <button
              onClick={handleExportImage}
              disabled={isExporting !== null}
              style={{
                padding: '0.45rem 0.9rem',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.78rem',
                color: '#334155',
                cursor: isExporting !== null ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {isExporting === 'image' ? '⏳ Generating PNG...' : '🖼️ Download Image'}
            </button>

            {/* Download PDF */}
            <button
              onClick={handleExportPdf}
              disabled={isExporting !== null}
              style={{
                padding: '0.45rem 0.95rem',
                backgroundColor: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.78rem',
                color: '#1d4ed8',
                cursor: isExporting !== null ? 'wait' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              {isExporting === 'pdf' ? '⏳ Generating PDF...' : '📄 Download PDF'}
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              style={{
                padding: '0.45rem 1.1rem',
                backgroundColor: '#1d4ed8',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.78rem',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              🖨️ Print
            </button>
          </div>
        </div>

        {/* ================= PREVIEW VIEWPORT ================= */}
        <div
          ref={pagesContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            backgroundColor: '#cbd5e1',
          }}
        >
          {availableTemplates.length === 0 ? (
            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                color: '#64748b',
                maxWidth: '480px',
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️ No Active Templates</div>
              <div>
                No active templates are linked to <b>Series {series}</b>.
              </div>
            </div>
          ) : selectedTemplate?.render ? (
            paginatedPages.map((page) => {
              const RenderComponent = selectedTemplate.render!;
              return (
                <div
                  key={page.pageIndex}
                  className="printable-page"
                  style={{
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                  }}
                >
                  <RenderComponent
                    page={page}
                    model={dataModel}
                    irnQrUrl={qrCodes.irnQrUrl}
                    upiQrUrl={qrCodes.upiQrUrl}
                  />
                </div>
              );
            })
          ) : selectedTemplate?.content ? (
            paginatedPages.map((page) => {
              const pageHtml = interpolateTemplate(selectedTemplate.content!, dataModel, {
                items: page.items,
                itemStartIndex: page.startIndex,
                pageIndex: page.pageIndex,
                pageNumber: page.pageIndex + 1,
                totalPages: paginatedPages.length,
                isLastPage: page.isLastPage,
                irn_qr_url: qrCodes.irnQrUrl,
                upi_qr_url: qrCodes.upiQrUrl,
              });

              return (
                <div
                  key={page.pageIndex}
                  className="printable-page"
                  style={{
                    width: '210mm',
                    minHeight: '297mm',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    boxSizing: 'border-box',
                  }}
                  dangerouslySetInnerHTML={{ __html: pageHtml }}
                />
              );
            })
          ) : (
            <div
              style={{
                padding: '3rem',
                textAlign: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                color: '#64748b',
              }}
            >
              Template has no render component or HTML content.
            </div>
          )}
        </div>

        {/* ================= FOOTER STATUS ================= */}
        <div
          style={{
            padding: '0.75rem 1.75rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8rem',
            color: '#64748b',
          }}
        >
          <div>
            Showing <b>{paginatedPages.length}</b> A4 printable pages &nbsp;|&nbsp; Balanced Item Grid
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>
              Series: <b>{series}</b> &nbsp;|&nbsp; Template: <b>{selectedTemplate?.name}</b>
            </span>
          </div>
        </div>
      </div>

      {/* Available Keys Tag Inspector Drawer */}
      <AvailableKeysInspector
        keys={flattenedKeys}
        isOpen={showKeysInspector}
        onClose={() => setShowKeysInspector(false)}
      />

      {/* Export Template Definition to Git Modal */}
      <ExportTemplateModal
        template={selectedTemplate}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Interactive Template Creator & Editor Modal */}
      <TemplateEditorModal
        isOpen={showEditorModal}
        onClose={() => setShowEditorModal(false)}
        dataModel={dataModel}
        onSave={handleSaveCustomTemplate}
        initialTemplate={selectedTemplate}
        irnQrUrl={qrCodes.irnQrUrl}
        upiQrUrl={qrCodes.upiQrUrl}
      />
    </div>
  );
};
