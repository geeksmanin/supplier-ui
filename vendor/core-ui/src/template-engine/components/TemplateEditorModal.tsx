import React, { useState, useRef, useCallback, useMemo } from 'react';
import { TemplateDefinition } from '../engine/types';
import { DynamicDataModel } from '../model/DynamicDataModel';
import { DEFAULT_STARTER_HTML_TEMPLATE } from '../engine/starterTemplates';
import { paginateCollection } from '../engine/pagination';
import { interpolateTemplate } from '../engine/interpolator';
import { ExportTemplateModal } from './ExportTemplateModal';

export interface TemplateEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataModel: DynamicDataModel;
  onSave: (template: TemplateDefinition) => void;
  initialTemplate?: TemplateDefinition | null;
  irnQrUrl?: string;
  upiQrUrl?: string;
}

/**
 * Converts raw template text into HTML with {{token}} blocks wrapped in a
 * green-highlighted <mark> so the syntax is visible behind a transparent textarea.
 */
function highlightTokens(raw: string): string {
  // Escape HTML entities first so the backdrop text is safe
  const escaped = raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  // Highlight {{ ... }} tokens (including #, /, ^) with a green badge
  return escaped.replace(
    /(\{\{[^}]*\}\})/g,
    '<mark style="background:#bbf7d0;color:#14532d;border-radius:3px;padding:0 1px;font-weight:700;">$1</mark>'
  );
}

export const TemplateEditorModal: React.FC<TemplateEditorModalProps> = ({
  isOpen,
  onClose,
  dataModel,
  onSave,
  initialTemplate,
  irnQrUrl,
  upiQrUrl,
}) => {
  /* ─────────── Form State ─────────── */
  const [id, setId] = useState<string>(
    initialTemplate?.id || `tpl_custom_${Date.now().toString(36)}`
  );
  const [name, setName] = useState<string>(
    initialTemplate?.name || 'Custom Invoice Template'
  );
  const [description, setDescription] = useState<string>(
    initialTemplate?.description || 'Custom user-created invoice export template'
  );
  const [seriesInput, setSeriesInput] = useState<string>(
    initialTemplate?.series.join(', ') || '*'
  );
  const [targetFormat, setTargetFormat] = useState<'HTML' | 'PDF' | 'Image' | 'Both'>(
    (initialTemplate?.targetFormat as any) || 'HTML'
  );
  const [firstPageMaxItems, setFirstPageMaxItems] = useState<number>(
    initialTemplate?.paginationConfig?.firstPageMaxItems ?? 12
  );
  const [subsequentPageMaxItems, setSubsequentPageMaxItems] = useState<number>(
    initialTemplate?.paginationConfig?.subsequentPageMaxItems ?? 18
  );
  const [lastPageMaxItemsWithSummary, setLastPageMaxItemsWithSummary] = useState<number>(
    initialTemplate?.paginationConfig?.lastPageMaxItemsWithSummary ?? 10
  );
  const [content, setContent] = useState<string>(
    initialTemplate?.content || DEFAULT_STARTER_HTML_TEMPLATE
  );

  /* ─────────── UI State ─────────── */
  const [leftPaneOpen, setLeftPaneOpen] = useState<boolean>(true);
  const [showExportModal, setShowExportModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLPreElement>(null);

  /* ─────────── Derived ─────────── */
  const currentTemplate: TemplateDefinition = {
    id: id.trim() || 'custom_template',
    name: name.trim() || 'Untitled Template',
    description: description.trim(),
    series: seriesInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    targetFormat,
    isActive: true,
    isSystemDefault: false,
    paginationConfig: {
      firstPageMaxItems: Number(firstPageMaxItems) || 12,
      subsequentPageMaxItems: Number(subsequentPageMaxItems) || 18,
      lastPageMaxItemsWithSummary: Number(lastPageMaxItemsWithSummary) || 10,
    },
    content,
  };

  const rawItems = dataModel.getCollection('items') || [];
  const paginatedPages = useMemo(
    () => paginateCollection(rawItems, currentTemplate.paginationConfig),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rawItems, firstPageMaxItems, subsequentPageMaxItems, lastPageMaxItemsWithSummary]
  );
  const availableKeys = dataModel.listFlattenedKeys();

  /* ─────────── Handlers ─────────── */
  const handleInsertTag = (tag: string) => {
    const el = textareaRef.current;
    if (!el) {
      setContent((prev) => prev + ` {{${tag}}}`);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const insertion = `{{${tag}}}`;
    const nextContent = content.substring(0, start) + insertion + content.substring(end);
    setContent(nextContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + insertion.length, start + insertion.length);
    }, 50);
  };

  const syncScroll = useCallback(() => {
    if (backdropRef.current && textareaRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleSave = () => {
    onSave(currentTemplate);
    onClose();
  };

  if (!isOpen) return null;

  /* ─────────── Shared editor font style ─────────── */
  const EDITOR_FONT: React.CSSProperties = {
    fontFamily: "'Fira Code', 'Cascadia Code', Menlo, Monaco, Consolas, monospace",
    fontSize: '0.82rem',
    lineHeight: '1.5',
    tabSize: 2,
    whiteSpace: 'pre',
    wordWrap: 'normal',
  };

  /* ─────────── Render ─────────── */
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.80)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '0.75rem',
        boxSizing: 'border-box',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1600px',
          height: '96vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.40)',
          overflow: 'hidden',
          border: '1px solid #cbd5e1',
        }}
      >
        {/* ═══════════════ HEADER ═══════════════ */}
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#f8fafc',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Collapse toggle for left pane */}
            <button
              onClick={() => setLeftPaneOpen((v) => !v)}
              title={leftPaneOpen ? 'Collapse Settings' : 'Expand Settings'}
              style={{
                padding: '0.3rem 0.55rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: leftPaneOpen ? '#e0f2fe' : '#f1f5f9',
                color: leftPaneOpen ? '#0369a1' : '#475569',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              {leftPaneOpen ? '◀' : '▶'}
            </button>

            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900, color: '#0f172a' }}>
                🎨 Template Designer
              </h2>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.1rem' }}>
                Edit HTML on the left · Live preview on the right · Green-highlighted tokens
              </div>
            </div>

            {/* Pages badge */}
            <span
              style={{
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                borderRadius: '999px',
                padding: '2px 10px',
                fontSize: '0.74rem',
                fontWeight: 800,
              }}
            >
              {paginatedPages.length} Page{paginatedPages.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setShowExportModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#1d4ed8',
                cursor: 'pointer',
              }}
            >
              ⚡ Export (Git)
            </button>

            <button
              onClick={handleSave}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#15803d',
                border: 'none',
                padding: '0.4rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              💾 Save & Use
            </button>

            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '1.3rem',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.2rem 0.45rem',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* ═══════════════ BODY — three columns ═══════════════ */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

          {/* ── LEFT: Collapsible Settings Pane ── */}
          <div
            style={{
              width: leftPaneOpen ? '260px' : '0px',
              minWidth: leftPaneOpen ? '260px' : '0px',
              borderRight: leftPaneOpen ? '1px solid #e2e8f0' : 'none',
              backgroundColor: '#f8fafc',
              overflowY: leftPaneOpen ? 'auto' : 'hidden',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              padding: leftPaneOpen ? '1rem' : '0',
              transition: 'width 0.22s ease, min-width 0.22s ease, padding 0.22s ease',
              flexShrink: 0,
            }}
          >
            {leftPaneOpen && (
              <>
                <Section label="Template ID (Unique Code)">
                  <input
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    style={{ ...inputStyle, fontFamily: 'monospace' }}
                  />
                </Section>

                <Section label="Display Name">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                  />
                </Section>

                <Section label="Description">
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={inputStyle}
                  />
                </Section>

                <Section label="Series (comma-separated, * for all)">
                  <input
                    type="text"
                    value={seriesInput}
                    onChange={(e) => setSeriesInput(e.target.value)}
                    placeholder="e.g. B, SO-5, *"
                    style={inputStyle}
                  />
                </Section>

                <Section label="Target Format">
                  <select
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value as any)}
                    style={{ ...inputStyle, backgroundColor: '#ffffff' }}
                  >
                    <option value="HTML">HTML / Web View</option>
                    <option value="PDF">Multi-Page PDF</option>
                    <option value="Image">High-Res PNG Image</option>
                    <option value="Both">Both (Image & PDF)</option>
                  </select>
                </Section>

                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
                    📄 Page & Pagination Caps
                  </div>
                  <Section label="Page 1 Max:">
                    <input type="number" value={firstPageMaxItems} onChange={(e) => setFirstPageMaxItems(Number(e.target.value))} style={inputStyle} />
                  </Section>
                  <Section label="Next Pages:">
                    <input type="number" value={subsequentPageMaxItems} onChange={(e) => setSubsequentPageMaxItems(Number(e.target.value))} style={inputStyle} />
                  </Section>
                  <Section label="Last Page (w/ Totals):">
                    <input type="number" value={lastPageMaxItemsWithSummary} onChange={(e) => setLastPageMaxItemsWithSummary(Number(e.target.value))} style={inputStyle} />
                  </Section>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <button
                    onClick={() => setContent(DEFAULT_STARTER_HTML_TEMPLATE)}
                    style={{
                      width: '100%',
                      padding: '0.45rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      fontSize: '0.73rem',
                      fontWeight: 700,
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    📄 Reset Starter HTML
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── MIDDLE: Code Editor with Token Highlighting ── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0f172a',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            {/* Editor Top Bar */}
            <div
              style={{
                padding: '0.45rem 0.85rem',
                backgroundColor: '#1e293b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #334155',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                TEMPLATE CODE (HTML / MUSTACHE) &nbsp;|&nbsp;
                <span style={{ color: '#86efac' }}>●</span>{' '}
                <span style={{ color: '#bbf7d0', fontWeight: 700 }}>Green highlights</span> = tokens &nbsp;|&nbsp;
                Loops: <code style={{ color: '#7dd3fc' }}>{'{{#items}}...{{/items}}'}</code>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Available Tokens ({availableKeys.length})
                </span>
                <button
                  onClick={() => handleInsertTag('items}}<tr><td>{{item.Name}}</td><td>{{item.SalePrice | inr}}</td></tr>{{/items')}
                  style={editorBtnStyle}
                >
                  + Items Loop
                </button>
              </div>
            </div>

            {/* Highlighted Editor — backdrop + transparent textarea layered */}
            <div
              style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Syntax-highlighted backdrop */}
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
                  color: '#e2e8f0',
                  backgroundColor: '#0f172a',
                  pointerEvents: 'none',
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                }}
                dangerouslySetInnerHTML={{ __html: highlightTokens(content) + '\n' }}
              />

              {/* Transparent textarea on top */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onScroll={syncScroll}
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
                  caretColor: '#f8fafc',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  boxSizing: 'border-box',
                  overflow: 'auto',
                  zIndex: 2,
                }}
              />
            </div>

            {/* Click-to-insert token strip at bottom */}
            <div
              style={{
                padding: '0.4rem 0.75rem',
                backgroundColor: '#1e293b',
                borderTop: '1px solid #334155',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                overflowX: 'auto',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '0.65rem', color: '#64748b', whiteSpace: 'nowrap', marginRight: '0.25rem' }}>
                INSERT:
              </span>
              {availableKeys.map((k) => (
                <button
                  key={k.key}
                  onClick={() => handleInsertTag(k.key)}
                  title={`Type: ${k.type}\nSample: ${k.sampleValue}`}
                  style={{
                    padding: '0.18rem 0.5rem',
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: k.key.startsWith('item.') ? '#14532d' : '#1e3a5f',
                    color: k.key.startsWith('item.') ? '#bbf7d0' : '#7dd3fc',
                    fontWeight: 700,
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    fontFamily: 'monospace',
                  }}
                >
                  +{k.key}
                </button>
              ))}
              <button
                onClick={() => handleInsertTag('irn_qr_url')}
                style={{
                  padding: '0.18rem 0.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#312e81',
                  color: '#c7d2fe',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'monospace',
                }}
              >
                +irn_qr_url
              </button>
              <button
                onClick={() => handleInsertTag('upi_qr_url')}
                style={{
                  padding: '0.18rem 0.5rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#312e81',
                  color: '#c7d2fe',
                  fontWeight: 700,
                  fontSize: '0.68rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontFamily: 'monospace',
                }}
              >
                +upi_qr_url
              </button>
            </div>
          </div>

          {/* ── RIGHT: Live Preview (always visible) ── */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '2px solid #334155',
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            {/* Preview header */}
            <div
              style={{
                padding: '0.45rem 0.85rem',
                backgroundColor: '#1e293b',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #334155',
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                A4 LIVE PRINT PREVIEW &nbsp;
                <span style={{ color: '#7dd3fc', fontWeight: 700 }}>
                  {paginatedPages.length} Page{paginatedPages.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.65rem', color: '#64748b' }}>Series: {dataModel.getSeries() || '*'}</span>
              </div>
            </div>

            {/* Preview Scroll Area */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'auto',
                padding: '1.25rem',
                backgroundColor: '#64748b',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.25rem',
              }}
            >
              {paginatedPages.length === 0 ? (
                <div
                  style={{
                    padding: '2rem',
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    color: '#64748b',
                    maxWidth: '380px',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📄</div>
                  <div style={{ fontWeight: 700 }}>No items to paginate — preview will show when voucher data is loaded.</div>
                </div>
              ) : (
                paginatedPages.map((page) => {
                  const pageHtml = interpolateTemplate(content, dataModel, {
                    items: page.items,
                    itemStartIndex: page.startIndex,
                    pageIndex: page.pageIndex,
                    pageNumber: page.pageIndex + 1,
                    totalPages: paginatedPages.length,
                    isLastPage: page.isLastPage,
                    irn_qr_url: irnQrUrl || '',
                    upi_qr_url: upiQrUrl || '',
                  });

                  return (
                    <div
                      key={page.pageIndex}
                      style={{
                        width: '794px',         // ≈ A4 at 96dpi
                        minHeight: '1122px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.35)',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        boxSizing: 'border-box',
                        flexShrink: 0,
                      }}
                      dangerouslySetInnerHTML={{ __html: pageHtml }}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ═══════════════ FOOTER ═══════════════ */}
        <div
          style={{
            padding: '0.6rem 1.25rem',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: '#64748b',
            flexShrink: 0,
          }}
        >
          <div>
            💡 Click <b>Export (Git)</b> to copy TypeScript / JSON code directly into your repo and commit it.
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowExportModal(true)}
              style={{
                padding: '0.35rem 0.8rem',
                borderRadius: '6px',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontWeight: 800,
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              ⚡ Export Template Code
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '0.35rem 0.9rem',
                borderRadius: '6px',
                backgroundColor: '#15803d',
                border: 'none',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
            >
              Save Template
            </button>
          </div>
        </div>
      </div>

      {/* Export to Git modal */}
      <ExportTemplateModal
        template={currentTemplate}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};

/* ─────────── Tiny helpers ─────────── */

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.4rem 0.6rem',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '0.78rem',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  marginTop: '0.2rem',
};

const editorBtnStyle: React.CSSProperties = {
  padding: '0.22rem 0.55rem',
  borderRadius: '4px',
  backgroundColor: '#334155',
  border: 'none',
  color: '#f8fafc',
  fontSize: '0.7rem',
  fontWeight: 700,
  cursor: 'pointer',
};

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '0.72rem',
          fontWeight: 800,
          color: '#475569',
          marginBottom: '0.15rem',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}
