import React, { useState, useRef, useEffect, useMemo } from 'react';
import { DynamicDataModel } from '../model/DynamicDataModel';
import { TemplateDefinition } from '../engine/types';
import { DEFAULT_STARTER_HTML_TEMPLATE } from '../engine/starterTemplates';
import { paginateCollection } from '../engine/pagination';
import { interpolateTemplate } from '../engine/interpolator';
import { exportPageToImageBlob, exportPagesToPdfBlob, downloadBlob } from '../engine/exportEngine';
import { ExportTemplateModal } from './ExportTemplateModal';
import { AvailableKeysInspector } from './AvailableKeysInspector';

export interface TemplateEditorFetchOptions {
  liveStock?: boolean;
  forceRefresh?: boolean;
  live?: boolean;
  force?: boolean;
}

export interface TemplateEditorPageProps {
  dataModel: DynamicDataModel;
  templates: TemplateDefinition[];
  onSaveTemplate?: (template: TemplateDefinition) => void;
  onFetchVoucher?: (voucherId: number, options?: TemplateEditorFetchOptions) => Promise<void>;
  isLoadingVoucher?: boolean;
  currentVoucherId?: number | string;
  irnQrUrl?: string;
  upiQrUrl?: string;
  onBackToApp?: () => void;
  appName?: string;
}

/**
 * Converts raw template text into HTML with {{token}} blocks wrapped in a
 * vibrant green-highlighted <mark> so keywords are highlighted with a green background.
 */
function highlightTokens(raw: string): string {
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return escaped.replace(
    /(\{\{[^}]*\}\})/g,
    '<mark style="background:#bbf7d0;color:#14532d;border-radius:3px;padding:0 2px;font-weight:700;">$1</mark>'
  );
}

const EDITOR_FONT: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, monospace",
  fontSize: '0.8rem',
  lineHeight: 1.55,
  tabSize: 2,
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
  letterSpacing: 'normal',
};

export const TemplateEditorPage: React.FC<TemplateEditorPageProps> = ({
  dataModel,
  templates: initialTemplates,
  onSaveTemplate,
  onFetchVoucher,
  isLoadingVoucher = false,
  currentVoucherId = '',
  irnQrUrl,
  upiQrUrl,
  onBackToApp,
  appName = 'Ajit Pharma',
}) => {
  // State
  const [templatesList, setTemplatesList] = useState<TemplateDefinition[]>(initialTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    initialTemplates[0]?.id || ''
  );
  const [viewMode, setViewMode] = useState<'split' | 'editor' | 'preview'>('split');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [zoomLevel, setZoomLevel] = useState<number>(0.68); // Default 68% fits A4 perfectly in 50% split
  const [vouIdInput, setVouIdInput] = useState<string>(String(currentVoucherId || ''));
  const [liveStock, setLiveStock] = useState<boolean>(true);
  const [forceStockRefresh, setForceStockRefresh] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<'image' | 'pdf' | null>(null);
  const [showExportGitModal, setShowExportGitModal] = useState<boolean>(false);
  const [showKeysDrawer, setShowKeysDrawer] = useState<boolean>(false);

  useEffect(() => {
    setTemplatesList(initialTemplates);
    if (!selectedTemplateId && initialTemplates.length > 0) {
      setSelectedTemplateId(initialTemplates[0].id);
    }
  }, [initialTemplates]);

  // Selected Template
  const activeTemplate = useMemo(() => {
    return (
      templatesList.find((t) => t.id === selectedTemplateId) ||
      templatesList[0] || {
        id: 'default_template',
        name: 'Default Template',
        series: ['*'],
        targetFormat: 'HTML' as const,
        isActive: true,
        isSystemDefault: false,
        paginationConfig: {
          firstPageMaxItems: 12,
          subsequentPageMaxItems: 18,
          lastPageMaxItemsWithSummary: 10,
        },
        content: DEFAULT_STARTER_HTML_TEMPLATE,
      }
    );
  }, [templatesList, selectedTemplateId]);

  // Editable local state for the active template
  const [editableName, setEditableName] = useState(activeTemplate.name);
  const [editableSeries, setEditableSeries] = useState(activeTemplate.series.join(', '));
  const [editableContent, setEditableContent] = useState(
    activeTemplate.content || DEFAULT_STARTER_HTML_TEMPLATE
  );
  const [firstPageMax, setFirstPageMax] = useState(
    activeTemplate.paginationConfig?.firstPageMaxItems ?? 12
  );
  const [subsequentPageMax, setSubsequentPageMax] = useState(
    activeTemplate.paginationConfig?.subsequentPageMaxItems ?? 18
  );
  const [lastPageMaxWithSummary, setLastPageMaxWithSummary] = useState(
    activeTemplate.paginationConfig?.lastPageMaxItemsWithSummary ?? 10
  );

  // Check if current template content refers to stock tokens
  const referencesStock = useMemo(() => {
    return /\{\{[^}]*stock[^}]*\}\}/i.test(editableContent);
  }, [editableContent]);

  // Sync when template selection changes
  useEffect(() => {
    setEditableName(activeTemplate.name);
    setEditableSeries(activeTemplate.series.join(', '));
    setEditableContent(activeTemplate.content || DEFAULT_STARTER_HTML_TEMPLATE);
    setFirstPageMax(activeTemplate.paginationConfig?.firstPageMaxItems ?? 12);
    setSubsequentPageMax(activeTemplate.paginationConfig?.subsequentPageMaxItems ?? 18);
    setLastPageMaxWithSummary(
      activeTemplate.paginationConfig?.lastPageMaxItemsWithSummary ?? 10
    );
  }, [activeTemplate.id]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLPreElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const syncScroll = () => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleFitWidth = () => {
    if (!previewContainerRef.current) return;
    const containerWidth = previewContainerRef.current.clientWidth;
    // Standard A4 is 210mm (~794px). Subtract 48px padding so the page fits without horizontal clipping
    const calculated = (containerWidth - 48) / 794;
    const clamped = Math.max(0.4, Math.min(1.2, Number(calculated.toFixed(2))));
    setZoomLevel(clamped);
  };

  // Document metadata
  const docNo =
    dataModel.getValue('doc.No') ||
    dataModel.getValue('doc_no') ||
    dataModel.getValue('DocNo') ||
    '';
  const detectedSeries = dataModel.getSeries();
  const flattenedKeys = dataModel.listFlattenedKeys();

  // Insert token at textarea cursor
  const handleInsertToken = (tokenKey: string) => {
    const el = textareaRef.current;
    if (!el) {
      setEditableContent((prev) => prev + ` {{${tokenKey}}}`);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const insertion = `{{${tokenKey}}}`;
    const nextContent =
      editableContent.substring(0, start) + insertion + editableContent.substring(end);
    setEditableContent(nextContent);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 40);
  };

  // Compile current draft template
  const currentDraftTemplate: TemplateDefinition = useMemo(() => {
    return {
      ...activeTemplate,
      name: editableName,
      series: editableSeries
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      paginationConfig: {
        firstPageMaxItems: Number(firstPageMax) || 12,
        subsequentPageMaxItems: Number(subsequentPageMax) || 18,
        lastPageMaxItemsWithSummary: Number(lastPageMaxWithSummary) || 10,
      },
      content: editableContent,
    };
  }, [
    activeTemplate,
    editableName,
    editableSeries,
    firstPageMax,
    subsequentPageMax,
    lastPageMaxWithSummary,
    editableContent,
  ]);

  // Pagination for live preview
  const rawItems = dataModel.getCollection('items') || [];
  const paginatedPages = useMemo(() => {
    return paginateCollection(rawItems, currentDraftTemplate.paginationConfig);
  }, [rawItems, currentDraftTemplate.paginationConfig]);

  // Save current template changes
  const handleSaveCurrent = () => {
    setTemplatesList((prev) =>
      prev.map((t) => (t.id === currentDraftTemplate.id ? currentDraftTemplate : t))
    );
    if (onSaveTemplate) {
      onSaveTemplate(currentDraftTemplate);
    }
  };

  // Create brand new template
  const handleCreateNewTemplate = () => {
    const newId = `tpl_${Date.now().toString(36)}`;
    const newTpl: TemplateDefinition = {
      id: newId,
      name: 'New Custom Template',
      description: 'Custom user-designed template',
      series: [detectedSeries || '*'],
      targetFormat: 'HTML',
      isActive: true,
      isSystemDefault: false,
      paginationConfig: {
        firstPageMaxItems: 12,
        subsequentPageMaxItems: 18,
        lastPageMaxItemsWithSummary: 10,
      },
      content: DEFAULT_STARTER_HTML_TEMPLATE,
    };
    setTemplatesList((prev) => [newTpl, ...prev]);
    setSelectedTemplateId(newId);
  };

  // Export Image PNG
  const handleExportImage = async () => {
    if (!previewContainerRef.current) return;
    const pageElements = Array.from(
      previewContainerRef.current.querySelectorAll('.printable-page')
    ) as HTMLElement[];
    if (pageElements.length === 0) return;

    setIsExporting('image');
    try {
      const cleanDoc = docNo ? docNo.replace(/[^a-zA-Z0-9_-]/g, '_') : 'voucher';
      for (let i = 0; i < pageElements.length; i++) {
        const blob = await exportPageToImageBlob(pageElements[i], { scale: 2 });
        if (blob) {
          const fn =
            pageElements.length > 1
              ? `${cleanDoc}_${currentDraftTemplate.id}_page_${i + 1}.png`
              : `${cleanDoc}_${currentDraftTemplate.id}.png`;
          downloadBlob(blob, fn);
        }
      }
    } catch (err) {
      console.error('Failed to export PNG:', err);
    } finally {
      setIsExporting(null);
    }
  };

  // Export PDF
  const handleExportPdf = async () => {
    if (!previewContainerRef.current) return;
    const pageElements = Array.from(
      previewContainerRef.current.querySelectorAll('.printable-page')
    ) as HTMLElement[];
    if (pageElements.length === 0) return;

    setIsExporting('pdf');
    try {
      const cleanDoc = docNo ? docNo.replace(/[^a-zA-Z0-9_-]/g, '_') : 'voucher';
      const pdfBlob = await exportPagesToPdfBlob(pageElements);
      downloadBlob(pdfBlob, `${cleanDoc}_${currentDraftTemplate.id}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExporting(null);
    }
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* ================= 1. TOP STUDIO HEADER (Clean Light SaaS Theme) ================= */}
      <header
        style={{
          height: '56px',
          minHeight: '56px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 1rem',
          boxSizing: 'border-box',
          gap: '0.75rem',
          zIndex: 30,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Left: Branding & Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
          {onBackToApp && (
            <button
              onClick={onBackToApp}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                color: '#334155',
                padding: '0.32rem 0.6rem',
                borderRadius: '7px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
            >
              ← Back
            </button>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.01em' }}>
                🎨 {appName} Template Studio
              </span>
              <span
                style={{
                  backgroundColor: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  padding: '1px 6px',
                  borderRadius: '999px',
                }}
              >
                Series {detectedSeries}
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '1px' }}>
              Voucher: <b style={{ color: '#0f172a' }}>{docNo || 'None'}</b> &nbsp;•&nbsp;{' '}
              {paginatedPages.length} A4 Page{paginatedPages.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Center: Clean Voucher Switcher & Stock Controls */}
        {onFetchVoucher && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f8fafc',
              padding: '3px 8px',
              borderRadius: '9px',
              border: '1px solid #e2e8f0',
              gap: '6px',
            }}
          >
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
              VouID:
            </span>
            <input
              type="number"
              placeholder="e.g. 749418"
              value={vouIdInput}
              onChange={(e) => setVouIdInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && vouIdInput) {
                  onFetchVoucher(Number(vouIdInput), {
                    live: liveStock,
                    force: forceStockRefresh,
                    liveStock,
                    forceRefresh: forceStockRefresh,
                  });
                }
              }}
              style={{
                width: '74px',
                backgroundColor: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '2px 6px',
                borderRadius: '5px',
                color: '#0f172a',
                fontSize: '0.8rem',
                fontWeight: 700,
                outline: 'none',
              }}
            />
            <button
              onClick={() =>
                onFetchVoucher(Number(vouIdInput), {
                  live: liveStock,
                  force: forceStockRefresh,
                  liveStock,
                  forceRefresh: forceStockRefresh,
                })
              }
              disabled={isLoadingVoucher || !vouIdInput}
              style={{
                backgroundColor: '#2563eb',
                border: 'none',
                color: '#ffffff',
                padding: '0.28rem 0.65rem',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: isLoadingVoucher ? 'wait' : 'pointer',
              }}
            >
              {isLoadingVoucher ? '...' : 'Fetch'}
            </button>

            <div style={{ width: '1px', height: '18px', backgroundColor: '#e2e8f0', margin: '0 2px' }} />

            {/* Streamlined Live Stock Toggle */}
            <button
              onClick={() => setLiveStock(!liveStock)}
              title={liveStock ? 'Live stock active (click to disable)' : 'Live stock disabled (click to enable)'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 7px',
                borderRadius: '5px',
                border: liveStock ? '1px solid #86efac' : '1px solid #cbd5e1',
                backgroundColor: liveStock ? '#f0fdf4' : '#ffffff',
                color: liveStock ? '#166534' : '#64748b',
                fontSize: '0.72rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <span>⚡ Live Stock</span>
              {referencesStock && (
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: liveStock ? '#16a34a' : '#94a3b8',
                  }}
                  title="Template references stock"
                />
              )}
            </button>

            {vouIdInput && (
              <button
                onClick={() =>
                  onFetchVoucher(Number(vouIdInput), {
                    live: true,
                    force: true,
                    liveStock: true,
                    forceRefresh: true,
                  })
                }
                disabled={isLoadingVoucher}
                title="Force refresh live stock now"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#166534',
                  padding: '2px 7px',
                  borderRadius: '5px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: isLoadingVoucher ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                🔄 Refresh
              </button>
            )}
          </div>
        )}

        {/* Right: View Mode Toggle & Primary Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          {/* View Mode Segmented Pill */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              padding: '2px',
              border: '1px solid #e2e8f0',
            }}
          >
            <button
              onClick={() => setViewMode('editor')}
              style={{
                padding: '0.25rem 0.55rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'editor' ? '#ffffff' : 'transparent',
                color: viewMode === 'editor' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'editor' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                fontSize: '0.73rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              💻 Editor
            </button>
            <button
              onClick={() => setViewMode('split')}
              style={{
                padding: '0.25rem 0.55rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'split' ? '#ffffff' : 'transparent',
                color: viewMode === 'split' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'split' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                fontSize: '0.73rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🔀 Split
            </button>
            <button
              onClick={() => setViewMode('preview')}
              style={{
                padding: '0.25rem 0.55rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: viewMode === 'preview' ? '#ffffff' : 'transparent',
                color: viewMode === 'preview' ? '#0f172a' : '#64748b',
                boxShadow: viewMode === 'preview' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                fontSize: '0.73rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              👁️ Preview
            </button>
          </div>

          <div style={{ width: '1px', height: '18px', backgroundColor: '#e2e8f0', margin: '0 2px' }} />

          {/* Quick Export Actions */}
          <button
            onClick={handleExportImage}
            disabled={isExporting !== null}
            title="Download PNG image"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '0.32rem 0.55rem',
              borderRadius: '7px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: isExporting !== null ? 'wait' : 'pointer',
            }}
          >
            {isExporting === 'image' ? '⏳...' : '🖼️ PNG'}
          </button>

          <button
            onClick={handleExportPdf}
            disabled={isExporting !== null}
            title="Download PDF document"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '0.32rem 0.55rem',
              borderRadius: '7px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: isExporting !== null ? 'wait' : 'pointer',
            }}
          >
            {isExporting === 'pdf' ? '⏳...' : '📄 PDF'}
          </button>

          <button
            onClick={handlePrint}
            title="Print document"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '0.32rem 0.55rem',
              borderRadius: '7px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            🖨️ Print
          </button>

          <button
            onClick={() => setShowExportGitModal(true)}
            title="Export template code for Git"
            style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              color: '#1d4ed8',
              padding: '0.32rem 0.65rem',
              borderRadius: '7px',
              fontSize: '0.74rem',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            ⚡ Git
          </button>

          {/* Primary Save Action */}
          <button
            onClick={handleSaveCurrent}
            style={{
              backgroundColor: '#16a34a',
              border: 'none',
              color: '#ffffff',
              padding: '0.32rem 0.8rem',
              borderRadius: '7px',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
            }}
          >
            💾 Save
          </button>
        </div>
      </header>

      {/* ================= 2. MAIN WORKSPACE (EQUAL 50/50 SPLIT) ================= */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', width: '100%' }}>
        {/* Left Sub-Sidebar: Template Selector & Settings (Collapsible / Expandable) */}
        {isSidebarOpen ? (
          <div
            style={{
              width: '240px',
              minWidth: '240px',
              maxWidth: '240px',
              backgroundColor: '#ffffff',
              borderRight: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {/* Templates List Header */}
            <div
              style={{
                padding: '0.65rem 0.85rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8fafc',
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>
                TEMPLATES ({templatesList.length})
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <button
                  onClick={handleCreateNewTemplate}
                  style={{
                    backgroundColor: '#2563eb',
                    border: 'none',
                    color: '#ffffff',
                    padding: '2px 7px',
                    borderRadius: '5px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  + New
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  title="Contract left pane"
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    padding: '2px 6px',
                    borderRadius: '5px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ◀
                </button>
              </div>
            </div>

            {/* Templates Navigation List */}
            <div style={{ padding: '0.45rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {templatesList.map((tpl) => {
                const isSelected = tpl.id === selectedTemplateId;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTemplateId(tpl.id)}
                    style={{
                      padding: '0.55rem 0.65rem',
                      borderRadius: '8px',
                      backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                      border: isSelected ? '1.5px solid #3b82f6' : '1px solid #f1f5f9',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: isSelected ? 800 : 600,
                          color: isSelected ? '#1d4ed8' : '#1e293b',
                          lineHeight: 1.25,
                        }}
                      >
                        {tpl.name}
                      </span>
                      {tpl.isSystemDefault && (
                        <span style={{ fontSize: '0.6rem', color: '#2563eb', fontWeight: 700 }}>
                          [Def]
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <span
                        style={{
                          fontSize: '0.63rem',
                          backgroundColor: '#f1f5f9',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          color: '#64748b',
                        }}
                      >
                        {tpl.series.join(', ')}
                      </span>
                      <span style={{ fontSize: '0.63rem', color: '#94a3b8' }}>
                        {tpl.render ? 'React' : 'HTML'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Template Settings Form (Adjusted Upward) */}
            <div
              style={{
                borderTop: '1px solid #e2e8f0',
                padding: '0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                backgroundColor: '#f8fafc',
              }}
            >
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b' }}>
                ⚙️ PAGE & PAGINATION CAPS
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>
                  Template Name:
                </label>
                <input
                  type="text"
                  value={editableName}
                  onChange={(e) => setEditableName(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    padding: '0.3rem 0.45rem',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>
                  Series (comma-separated):
                </label>
                <input
                  type="text"
                  value={editableSeries}
                  onChange={(e) => setEditableSeries(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    padding: '0.3rem 0.45rem',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.63rem', color: '#64748b', fontWeight: 700 }}>
                    Page 1 Max:
                  </label>
                  <input
                    type="number"
                    value={firstPageMax}
                    onChange={(e) => setFirstPageMax(Number(e.target.value))}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      padding: '0.25rem 0.35rem',
                      borderRadius: '5px',
                      fontSize: '0.72rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.63rem', color: '#64748b', fontWeight: 700 }}>
                    Next Pages:
                  </label>
                  <input
                    type="number"
                    value={subsequentPageMax}
                    onChange={(e) => setSubsequentPageMax(Number(e.target.value))}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      padding: '0.25rem 0.35rem',
                      borderRadius: '5px',
                      fontSize: '0.72rem',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.63rem', color: '#64748b', fontWeight: 700 }}>
                  Last Page (w/ Totals):
                </label>
                <input
                  type="number"
                  value={lastPageMaxWithSummary}
                  onChange={(e) => setLastPageMaxWithSummary(Number(e.target.value))}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    padding: '0.25rem 0.35rem',
                    borderRadius: '5px',
                    fontSize: '0.72rem',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <button
                onClick={() => setEditableContent(DEFAULT_STARTER_HTML_TEMPLATE)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '0.3rem',
                  borderRadius: '5px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginTop: '0.2rem',
                }}
              >
                📄 Reset Starter HTML
              </button>
            </div>
          </div>
        ) : (
          /* Sleek Contracted Strip when left pane is collapsed */
          <div
            onClick={() => setIsSidebarOpen(true)}
            title="Expand templates & settings panel"
            style={{
              width: '38px',
              minWidth: '38px',
              maxWidth: '38px',
              backgroundColor: '#ffffff',
              borderRight: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '0.75rem',
              cursor: 'pointer',
              gap: '0.75rem',
              userSelect: 'none',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSidebarOpen(true);
              }}
              title="Expand templates & settings"
              style={{
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#2563eb',
                padding: '4px 6px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 800,
              }}
            >
              ▶
            </button>
            <span
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                fontSize: '0.7rem',
                fontWeight: 800,
                color: '#64748b',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Templates
            </span>
          </div>
        )}

        {/* Center / Left Pane: Editor (EXACT 50% WIDTH IN SPLIT VIEW) */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div
            style={{
              flex: '1 1 0',
              width: viewMode === 'split' ? '50%' : '100%',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              borderRight: viewMode === 'split' ? '1px solid #e2e8f0' : 'none',
              backgroundColor: '#ffffff',
              overflow: 'hidden',
            }}
          >
            {/* Editor Subheader & Token Insertion Bar */}
            <div
              style={{
                height: '42px',
                minHeight: '42px',
                padding: '0 0.85rem',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 800 }}>
                  TEMPLATE CODE (HTML / MUSTACHE)
                </span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.68rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#166534',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                  Green Highlights = Tokens
                </span>
                {activeTemplate.render && (
                  <span
                    style={{
                      fontSize: '0.66rem',
                      backgroundColor: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      color: '#1d4ed8',
                      fontWeight: 700,
                    }}
                  >
                    React Component
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowKeysDrawer(true)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#2563eb',
                  padding: '0.25rem 0.55rem',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                🏷️ Available Tokens ({flattenedKeys.length})
              </button>
            </div>

            {/* Syntax-Highlighted Editor — Backdrop + Transparent Textarea Layered */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: '#ffffff',
              }}
            >
              {/* Syntax-highlighted backdrop with green keyword highlights */}
              <pre
                ref={backdropRef}
                aria-hidden="true"
                style={{
                  ...EDITOR_FONT,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  margin: 0,
                  padding: '1rem',
                  color: '#1e293b',
                  backgroundColor: '#ffffff',
                  pointerEvents: 'none',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                }}
                dangerouslySetInnerHTML={{ __html: highlightTokens(editableContent) + '\n' }}
              />

              {/* Transparent textarea on top for seamless native typing & cursor editing */}
              <textarea
                ref={textareaRef}
                value={editableContent}
                onChange={(e) => setEditableContent(e.target.value)}
                onScroll={syncScroll}
                placeholder="Enter HTML template markup here..."
                spellCheck={false}
                style={{
                  ...EDITOR_FONT,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: '100%',
                  height: '100%',
                  margin: 0,
                  padding: '1rem',
                  backgroundColor: 'transparent',
                  color: 'transparent',
                  caretColor: '#0f172a',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                  overflow: 'auto',
                  zIndex: 2,
                }}
              />
            </div>

            {/* Quick Insertion Chips Bar */}
            <div
              style={{
                height: '40px',
                minHeight: '40px',
                padding: '0 0.85rem',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 800 }}>
                INSERT:
              </span>
              {[
                'doc.No',
                'party.Name',
                'item.Name',
                'item.SalePrice',
                'item.Qty',
                'item.StockBadge',
                'totals.NetAmount',
                'totals.NetAmount | inWords',
                'irn_qr_url',
              ].map((token) => (
                <button
                  key={token}
                  onClick={() => handleInsertToken(token)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: token.startsWith('item.') ? '#16a34a' : '#2563eb',
                    padding: '2px 7px',
                    borderRadius: '4px',
                    fontSize: '0.68rem',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  +{token}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Center / Right Pane: Live Multi-Page A4 Preview (EXACT 50% WIDTH IN SPLIT VIEW) */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            style={{
              flex: '1 1 0',
              width: viewMode === 'split' ? '50%' : '100%',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#f1f5f9',
              overflow: 'hidden',
            }}
          >
            {/* Preview Toolbar with Zoom / Fit-Width Controls */}
            <div
              style={{
                height: '42px',
                minHeight: '42px',
                padding: '0 0.85rem',
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.74rem', color: '#475569', fontWeight: 800 }}>
                  A4 LIVE PRINT PREVIEW
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    backgroundColor: '#f1f5f9',
                    color: '#64748b',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  {paginatedPages.length} Page{paginatedPages.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Zoom Presets Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.4, Number((z - 0.08).toFixed(2))))}
                  title="Zoom Out"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '5px',
                    padding: '2px 6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    color: '#334155',
                  }}
                >
                  -
                </button>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    minWidth: '40px',
                    textAlign: 'center',
                  }}
                >
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(1.2, Number((z + 0.08).toFixed(2))))}
                  title="Zoom In"
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '5px',
                    padding: '2px 6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    color: '#334155',
                  }}
                >
                  +
                </button>
                <button
                  onClick={handleFitWidth}
                  title="Automatically fit template to available preview width"
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '5px',
                    padding: '2px 7px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#1d4ed8',
                  }}
                >
                  ↔ Fit Width
                </button>
                <button
                  onClick={() => setZoomLevel(0.68)}
                  title="Fit 50% split view"
                  style={{
                    backgroundColor: zoomLevel === 0.68 ? '#eff6ff' : '#ffffff',
                    border: zoomLevel === 0.68 ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                    borderRadius: '5px',
                    padding: '2px 7px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: zoomLevel === 0.68 ? '#1d4ed8' : '#475569',
                  }}
                >
                  50% Split
                </button>
                <button
                  onClick={() => setZoomLevel(1.0)}
                  title="100% Full Scale"
                  style={{
                    backgroundColor: zoomLevel === 1.0 ? '#eff6ff' : '#ffffff',
                    border: zoomLevel === 1.0 ? '1px solid #93c5fd' : '1px solid #cbd5e1',
                    borderRadius: '5px',
                    padding: '2px 7px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: zoomLevel === 1.0 ? '#1d4ed8' : '#475569',
                  }}
                >
                  100%
                </button>
              </div>
            </div>

            {/* Scrollable Viewport with Scaled A4 Pages */}
            <div
              ref={previewContainerRef}
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'auto',
                padding: '1.5rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: `${Math.round(25 * zoomLevel)}px`,
                boxSizing: 'border-box',
              }}
            >
              {activeTemplate.render ? (
                paginatedPages.map((page) => {
                  const RenderComponent = activeTemplate.render!;
                  return (
                    <div
                      key={page.pageIndex}
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top center',
                        marginBottom: `${-(1 - zoomLevel) * 1120}px`,
                      }}
                    >
                      <div
                        className="printable-page"
                        style={{
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          backgroundColor: '#ffffff',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        <RenderComponent
                          page={page}
                          model={dataModel}
                          irnQrUrl={irnQrUrl}
                          upiQrUrl={upiQrUrl}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                paginatedPages.map((page) => {
                  const pageHtml = interpolateTemplate(editableContent, dataModel, {
                    items: page.items,
                    itemStartIndex: page.startIndex,
                    pageIndex: page.pageIndex,
                    pageNumber: page.pageIndex + 1,
                    totalPages: paginatedPages.length,
                    isLastPage: page.isLastPage,
                    irn_qr_url: irnQrUrl,
                    upi_qr_url: upiQrUrl,
                  });

                  return (
                    <div
                      key={page.pageIndex}
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: 'top center',
                        marginBottom: `${-(1 - zoomLevel) * 1120}px`,
                      }}
                    >
                      <div
                        key={page.pageIndex}
                        className="printable-page"
                        style={{
                          width: '210mm',
                          minHeight: '297mm',
                          backgroundColor: '#ffffff',
                          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          boxSizing: 'border-box',
                          border: '1px solid #e2e8f0',
                        }}
                        dangerouslySetInnerHTML={{ __html: pageHtml }}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Available Keys Drawer Modal */}
      <AvailableKeysInspector
        keys={flattenedKeys}
        isOpen={showKeysDrawer}
        onClose={() => setShowKeysDrawer(false)}
      />

      {/* Export Template Code for Git Modal */}
      <ExportTemplateModal
        template={currentDraftTemplate}
        isOpen={showExportGitModal}
        onClose={() => setShowExportGitModal(false)}
      />
    </div>
  );
};
