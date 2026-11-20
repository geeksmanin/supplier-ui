import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Check,
  Crop,
  RotateCw,
  RotateCcw,
  Pen,
  ArrowRight,
  Square,
  Circle,
  Type,
  Move,
  Undo2,
  Redo2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import {
  ImageEditorModalProps,
  EditorToolMode,
  AspectRatioOption,
  StrokeWidthPreset,
  SelectedElement,
  InlineTextDraft,
} from './ImageEditorModal.types';
import {
  useImageEditor,
  COLOR_PALETTE,
  STROKE_WIDTH_MAP,
  getShapeBounds,
  getStrokeBounds,
} from './useImageEditor';

export const ImageEditorModalMobile: React.FC<ImageEditorModalProps> = ({
  isOpen,
  imageUrl,
  initialFile,
  initialMode = 'crop',
  fileNamePrefix,
  onClose,
  onApply,
}) => {
  const {
    imageLoaded,
    imageSize,
    currentImageUrl,
    commitCrop,
    mode,
    setMode,
    color,
    setColor,
    strokePreset,
    setStrokePreset,
    rotation,
    rotateClockwise,
    rotateCounterClockwise,
    aspectRatio,
    applyAspectRatio,
    cropRect,
    setCropRect,
    strokes,
    currentStroke,
    setCurrentStroke,
    finishStroke,
    shapes,
    currentShape,
    setCurrentShape,
    finishShape,
    textItems,
    addTextItem,
    updateTextItem,
    removeTextItem,
    selectedTextId,
    selectedElement,
    setSelectedElement,
    moveElement,
    commitElementMove,
    removeSelectedElement,
    hitTestElement,
    zoom,
    setZoom,
    panOffset,
    setPanOffset,
    canUndo,
    canRedo,
    undo,
    redo,
    resetToOriginal,
    generateExportResult,
    pushHistory,
  } = useImageEditor(imageUrl, initialFile, initialMode);

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isApplying, setIsApplying] = useState(false);
  const [inlineTextDraft, setInlineTextDraft] = useState<InlineTextDraft | null>(null);
  const inlineTextCommittedRef = useRef(false);
  const draggingElRef = useRef<{ el: SelectedElement; lastPx: number; lastPy: number; moved: boolean } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number; targetId?: string } | null>(null);

  const commitInlineText = useCallback((draft: InlineTextDraft | null) => {
    if (!draft || inlineTextCommittedRef.current) return;
    inlineTextCommittedRef.current = true;
    const trimmed = draft.text.trim();
    if (trimmed) {
      if (draft.id) {
        updateTextItem(draft.id, { text: trimmed });
      } else {
        addTextItem(trimmed, draft.x, draft.y);
      }
    } else if (draft.id) {
      removeTextItem(draft.id);
    }
    setInlineTextDraft(null);
  }, [addTextItem, updateTextItem, removeTextItem]);

  const handleSwitchMode = async (nextMode: EditorToolMode) => {
    if (inlineTextDraft) {
      commitInlineText(inlineTextDraft);
    }
    if (mode === 'crop' && nextMode !== 'crop') {
      await commitCrop();
    }
    if (nextMode === 'crop') {
      setSelectedElement(null);
    }
    setMode(nextMode);
  };

  // Crop Drag state
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; initialRect: typeof cropRect }>({
    clientX: 0,
    clientY: 0,
    initialRect: { x: 0, y: 0, width: 1, height: 1 },
  });

  // Multi-Touch Pinch & Pan tracking
  const touchStateRef = useRef<{
    initialDist: number;
    initialZoom: number;
    initialMidX: number;
    initialMidY: number;
    initialPan: { x: number; y: number };
    isPinching: boolean;
  }>({
    initialDist: 0,
    initialZoom: 1,
    initialMidX: 0,
    initialMidY: 0,
    initialPan: { x: 0, y: 0 },
    isPinching: false,
  });

  // Measure container
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [isOpen]);

  if (!isOpen) return null;

  // Image display dimensions
  const isSideways = rotation % 180 !== 0;
  const orientedW = isSideways ? imageSize.height : imageSize.width;
  const orientedH = isSideways ? imageSize.width : imageSize.height;

  let displayW = 0;
  let displayH = 0;
  if (containerSize.width > 0 && containerSize.height > 0 && orientedW > 0 && orientedH > 0) {
    const scale = Math.min(
      (containerSize.width - 24) / orientedW,
      (containerSize.height - 24) / orientedH
    );
    displayW = orientedW * scale;
    displayH = orientedH * scale;
  }

  // Handle Apply
  const handleApply = async () => {
    if (isApplying) return;
    if (inlineTextDraft) {
      commitInlineText(inlineTextDraft);
    }
    setIsApplying(true);
    try {
      if (mode === 'crop') {
        await commitCrop();
      }
      const result = await generateExportResult(fileNamePrefix);
      onApply(result);
    } catch (err) {
      console.error('Failed to generate mobile edited image:', err);
    } finally {
      setIsApplying(false);
    }
  };

  const getNormalizedCoords = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || !displayW || !displayH) return null;
    const offsetX = (containerSize.width - displayW * zoom) / 2 + panOffset.x;
    const offsetY = (containerSize.height - displayH * zoom) / 2 + panOffset.y;
    return {
      px: Math.max(0, Math.min(1, (clientX - rect.left - offsetX) / (displayW * zoom))),
      py: Math.max(0, Math.min(1, (clientY - rect.top - offsetY) / (displayH * zoom))),
    };
  };

  // Crop Handle Pointer / Touch
  const handleCropPointerDown = (handle: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setDragHandle(handle);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialRect: { ...cropRect },
    };
  };

  const startDraggingElement = (el: SelectedElement, e: React.PointerEvent) => {
    if (mode === 'crop') return;
    e.stopPropagation();
    const coords = getNormalizedCoords(e.clientX, e.clientY);
    if (!coords) return;

    // Detect double-tap on an existing text element to edit inline
    if (el.kind === 'text') {
      const now = Date.now();
      const prev = lastTapRef.current;
      if (prev && prev.targetId === el.id && now - prev.time < 350) {
        lastTapRef.current = null;
        const found = textItems.find((t) => t.id === el.id);
        if (found) {
          inlineTextCommittedRef.current = false;
          setInlineTextDraft({ id: found.id, x: found.x, y: found.y, text: found.text });
        }
        return;
      }
      lastTapRef.current = { time: now, x: e.clientX, y: e.clientY, targetId: el.id };
    }

    setSelectedElement(el);
    draggingElRef.current = { el, lastPx: coords.px, lastPy: coords.py, moved: false };
  };

  // Unified Single-Pointer Down (Touch & Mouse)
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (touchStateRef.current.isPinching || mode === 'crop' || inlineTextDraft) return;
    const coords = getNormalizedCoords(e.clientX, e.clientY);
    if (!coords) return;
    const { px, py } = coords;

    if (mode === 'select') {
      const hit = hitTestElement(px, py, 0.045);
      setSelectedElement(hit);
      if (hit) {
        draggingElRef.current = { el: hit, lastPx: px, lastPy: py, moved: false };
      }
      return;
    }

    if (mode === 'pencil') {
      setSelectedElement(null);
      setCurrentStroke({
        id: `stroke-${Date.now()}`,
        type: 'pencil',
        points: [{ x: px, y: py }],
        color,
        width: STROKE_WIDTH_MAP[strokePreset],
      });
    } else if (mode === 'arrow' || mode === 'rect' || mode === 'circle') {
      setSelectedElement(null);
      setCurrentShape({
        id: `shape-${Date.now()}`,
        type: mode,
        startX: px,
        startY: py,
        endX: px,
        endY: py,
        color,
        width: STROKE_WIDTH_MAP[strokePreset],
      });
    } else if (mode === 'text') {
      setSelectedElement(null);
      const now = Date.now();
      const prev = lastTapRef.current;
      if (
        prev &&
        !prev.targetId &&
        now - prev.time < 360 &&
        Math.hypot(e.clientX - prev.x, e.clientY - prev.y) < 42
      ) {
        lastTapRef.current = null;
        inlineTextCommittedRef.current = false;
        setInlineTextDraft({ x: px, y: py, text: '' });
      } else {
        lastTapRef.current = { time: now, x: e.clientX, y: e.clientY };
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (touchStateRef.current.isPinching) return;

    // Crop Drag
    if (dragHandle && displayW > 0 && displayH > 0) {
      const dx = (e.clientX - dragStartRef.current.clientX) / displayW;
      const dy = (e.clientY - dragStartRef.current.clientY) / displayH;
      const initial = dragStartRef.current.initialRect;

      let nextX = initial.x;
      let nextY = initial.y;
      let nextW = initial.width;
      let nextH = initial.height;
      const minSize = 0.1;

      if (dragHandle === 'move') {
        nextX = Math.max(0, Math.min(1 - nextW, initial.x + dx));
        nextY = Math.max(0, Math.min(1 - nextH, initial.y + dy));
      } else {
        if (dragHandle.includes('l')) {
          const maxLeft = initial.x + initial.width - minSize;
          nextX = Math.max(0, Math.min(maxLeft, initial.x + dx));
          nextW = initial.width - (nextX - initial.x);
        }
        if (dragHandle.includes('r')) {
          nextW = Math.max(minSize, Math.min(1 - initial.x, initial.width + dx));
        }
        if (dragHandle.includes('t')) {
          const maxTop = initial.y + initial.height - minSize;
          nextY = Math.max(0, Math.min(maxTop, initial.y + dy));
          nextH = initial.height - (nextY - initial.y);
        }
        if (dragHandle.includes('b')) {
          nextH = Math.max(minSize, Math.min(1 - initial.y, initial.height + dy));
        }
      }

      setCropRect({ x: nextX, y: nextY, width: nextW, height: nextH });
      return;
    }

    const coords = getNormalizedCoords(e.clientX, e.clientY);
    if (!coords) return;
    const { px, py } = coords;

    if (draggingElRef.current) {
      const dx = px - draggingElRef.current.lastPx;
      const dy = py - draggingElRef.current.lastPy;
      if (Math.abs(dx) > 0.0005 || Math.abs(dy) > 0.0005) {
        moveElement(draggingElRef.current.el, dx, dy);
        draggingElRef.current.lastPx = px;
        draggingElRef.current.lastPy = py;
        draggingElRef.current.moved = true;
      }
      return;
    }

    if (currentStroke) {
      setCurrentStroke((prev) => (prev ? { ...prev, points: [...prev.points, { x: px, y: py }] } : null));
    } else if (currentShape) {
      setCurrentShape((prev) => (prev ? { ...prev, endX: px, endY: py } : null));
    }
  };

  const handlePointerUp = () => {
    if (dragHandle) {
      setDragHandle(null);
      pushHistory({ cropRect });
    }
    if (draggingElRef.current) {
      if (draggingElRef.current.moved) {
        commitElementMove();
      }
      draggingElRef.current = null;
    }
    if (currentStroke) {
      finishStroke(currentStroke);
    }
    if (currentShape) {
      finishShape(currentShape);
    }
  };

  // Two-Finger Pinch & Pan Touch Handlers
  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      touchStateRef.current = {
        initialDist: dist,
        initialZoom: zoom,
        initialMidX: midX,
        initialMidY: midY,
        initialPan: { ...panOffset },
        isPinching: true,
      };
      setCurrentStroke(null);
      setCurrentShape(null);
      draggingElRef.current = null;
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchStateRef.current.isPinching) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const midX = (t1.clientX + t2.clientX) / 2;
      const midY = (t1.clientY + t2.clientY) / 2;

      const scaleChange = dist / (touchStateRef.current.initialDist || 1);
      const newZoom = Math.min(3, Math.max(1, touchStateRef.current.initialZoom * scaleChange));
      setZoom(newZoom);

      if (newZoom > 1) {
        const dx = midX - touchStateRef.current.initialMidX;
        const dy = midY - touchStateRef.current.initialMidY;
        setPanOffset({
          x: touchStateRef.current.initialPan.x + dx,
          y: touchStateRef.current.initialPan.y + dy,
        });
      } else {
        setPanOffset({ x: 0, y: 0 });
      }
    }
  };

  const handleCanvasTouchEnd = (e: React.TouchEvent) => {
    if (touchStateRef.current.isPinching && e.touches.length < 2) {
      touchStateRef.current.isPinching = false;
    }
  };

  const selectedBounds = (() => {
    if (!selectedElement || selectedElement.kind === 'text') return null;
    if (selectedElement.kind === 'shape') {
      const sh = shapes.find((s) => s.id === selectedElement.id);
      return sh ? getShapeBounds(sh) : null;
    }
    const st = strokes.find((s) => s.id === selectedElement.id);
    return st ? getStrokeBounds(st) : null;
  })();

  const content = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0b141a',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'none',
        userSelect: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      onTouchMove={handleCanvasTouchMove}
      onTouchEnd={handleCanvasTouchEnd}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* 1. Mobile Emerald Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          paddingTop: 'max(10px, env(safe-area-inset-top, 10px))',
          backgroundColor: '#111b21',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          color: '#ffffff',
          zIndex: 10002,
        }}
      >
        {/* Cancel */}
        <button
          onClick={onClose}
          style={styles.mobileTouchBtn}
          title="Cancel"
          type="button"
          aria-label="Cancel"
        >
          <X size={22} color="#ffffff" />
        </button>

        {/* Center: Undo / Redo / Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={undo}
            disabled={!canUndo}
            style={{ ...styles.mobileTouchBtn, opacity: canUndo ? 1 : 0.3 }}
            type="button"
            aria-label="Undo"
          >
            <Undo2 size={20} color="#ffffff" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            style={{ ...styles.mobileTouchBtn, opacity: canRedo ? 1 : 0.3 }}
            type="button"
            aria-label="Redo"
          >
            <Redo2 size={20} color="#ffffff" />
          </button>
          <button
            onClick={resetToOriginal}
            style={styles.mobileTouchBtn}
            type="button"
            aria-label="Reset"
          >
            <RefreshCw size={19} color="#ffffff" />
          </button>
        </div>

        {/* Apply / Send */}
        <button
          onClick={handleApply}
          disabled={isApplying}
          style={{
            ...styles.mobileTouchBtn,
            backgroundColor: '#00a884',
            borderRadius: '50%',
            width: '42px',
            height: '42px',
          }}
          type="button"
          aria-label="Done"
        >
          <Check size={22} color="#ffffff" strokeWidth={2.8} />
        </button>
      </header>

      {/* 2. Main Canvas Viewport */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          touchAction: 'none',
        }}
        onTouchStart={handleCanvasTouchStart}
        onPointerDown={handleCanvasPointerDown}
      >
        {imageLoaded && displayW > 0 && displayH > 0 && (
          <div
            data-editor-canvas="true"
            style={{
              position: 'relative',
              width: `${displayW}px`,
              height: `${displayH}px`,
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
              transition: touchStateRef.current.isPinching ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            {/* Image */}
            <img
              src={currentImageUrl || imageUrl}
              alt="Edit canvas"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `rotate(${rotation}deg)`,
                pointerEvents: 'none',
              }}
            />

            {/* Strokes & Shapes SVG */}
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              {strokes.map((st) => {
                const b = getStrokeBounds(st);
                return (
                  <polyline
                    key={st.id}
                    data-editor-element-kind="stroke"
                    data-element-id={st.id}
                    data-bounds-x={b.x.toFixed(4)}
                    data-bounds-y={b.y.toFixed(4)}
                    points={st.points.map((p) => `${p.x * displayW},${p.y * displayH}`).join(' ')}
                    fill="none"
                    stroke={st.color}
                    strokeWidth={st.width}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}
              {currentStroke && (
                <polyline
                  points={currentStroke.points.map((p) => `${p.x * displayW},${p.y * displayH}`).join(' ')}
                  fill="none"
                  stroke={currentStroke.color}
                  strokeWidth={currentStroke.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Shapes */}
              {shapes.map((sh) => renderMobileSvgShape(sh, displayW, displayH))}
              {currentShape && renderMobileSvgShape(currentShape, displayW, displayH)}
            </svg>

            {/* Selection Bounding Box for Selected Shape or Stroke */}
            {selectedElement && selectedElement.kind !== 'text' && selectedBounds && mode === 'select' && (
              <div
                style={{
                  position: 'absolute',
                  left: `${selectedBounds.x * displayW - 8}px`,
                  top: `${selectedBounds.y * displayH - 8}px`,
                  width: `${selectedBounds.width * displayW + 16}px`,
                  height: `${selectedBounds.height * displayH + 16}px`,
                  border: '1.5px dashed #00a884',
                  borderRadius: '6px',
                  backgroundColor: 'rgba(0, 168, 132, 0.08)',
                  boxSizing: 'border-box',
                  touchAction: 'none',
                }}
                onPointerDown={(e) => startDraggingElement(selectedElement, e)}
              >
                <button
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelectedElement();
                  }}
                  style={styles.deleteBadgeBtn}
                  title="Delete element"
                  type="button"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            )}

            {/* Text Callouts */}
            {textItems.map((item) => {
              if (inlineTextDraft?.id === item.id) return null;
              const isTextInteractive = mode === 'select' || mode === 'text';
              return (
                <div
                  key={item.id}
                  data-editor-element-kind="text"
                  data-element-id={item.id}
                  data-bounds-x={item.x.toFixed(4)}
                  data-bounds-y={item.y.toFixed(4)}
                  style={{
                    position: 'absolute',
                    left: `${item.x * displayW}px`,
                    top: `${item.y * displayH}px`,
                    transform: 'translate(-50%, -50%)',
                    padding: '5px 12px',
                    borderRadius: '16px',
                    backgroundColor: item.hasBadge ? 'rgba(0, 0, 0, 0.75)' : 'transparent',
                    color: item.color,
                    fontSize: `${item.fontSize}px`,
                    fontWeight: 700,
                    border: selectedTextId === item.id ? '1.5px dashed #00a884' : '1px solid transparent',
                    whiteSpace: 'nowrap',
                    touchAction: 'none',
                    pointerEvents: isTextInteractive ? 'auto' : 'none',
                  }}
                  onPointerDown={(e) => isTextInteractive && startDraggingElement({ kind: 'text', id: item.id }, e)}
                >
                  {item.text}
                  {selectedTextId === item.id && (
                    <button
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTextItem(item.id);
                      }}
                      style={styles.inlineDeleteBtn}
                      type="button"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Inline Text Typing Input Directly on Canvas */}
            {inlineTextDraft && (
              <input
                type="text"
                autoFocus
                data-inline-editor-text="true"
                data-dark-input="true"
                placeholder="Type text..."
                value={inlineTextDraft.text}
                onChange={(e) => setInlineTextDraft({ ...inlineTextDraft, text: e.target.value })}
                onPointerDown={(e) => e.stopPropagation()}
                onBlur={() => commitInlineText(inlineTextDraft)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitInlineText(inlineTextDraft);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    inlineTextCommittedRef.current = true;
                    setInlineTextDraft(null);
                  }
                }}
                style={{
                  position: 'absolute',
                  left: `${inlineTextDraft.x * displayW}px`,
                  top: `${inlineTextDraft.y * displayH}px`,
                  transform: 'translate(-50%, -50%)',
                  minWidth: '120px',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(0, 0, 0, 0.84)',
                  color,
                  fontSize: `${strokePreset === 'fine' ? 18 : strokePreset === 'medium' ? 24 : 32}px`,
                  fontWeight: 700,
                  border: '1.5px solid #00a884',
                  outline: 'none',
                  textAlign: 'center',
                  zIndex: 20,
                }}
              />
            )}

            {/* Crop Overlay */}
            {mode === 'crop' && (
              <div
                style={{
                  position: 'absolute',
                  left: `${cropRect.x * 100}%`,
                  top: `${cropRect.y * 100}%`,
                  width: `${cropRect.width * 100}%`,
                  height: `${cropRect.height * 100}%`,
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.65)',
                  border: '2px solid #00a884',
                  boxSizing: 'border-box',
                }}
                onPointerDown={(e) => handleCropPointerDown('move', e)}
              >
                {/* 8 Touch Handles with Minimum 44px Hit Targets */}
                {['tl', 'tc', 'tr', 'ml', 'mr', 'bl', 'bc', 'br'].map((handle) => (
                  <div
                    key={handle}
                    style={{
                      position: 'absolute',
                      width: '44px',
                      height: '44px',
                      ...getMobileHandlePosition(handle),
                      transform: 'translate(-50%, -50%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      touchAction: 'none',
                    }}
                    onPointerDown={(e) => handleCropPointerDown(handle, e)}
                  >
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        border: '2.5px solid #00a884',
                        boxShadow: '0 0 4px rgba(0,0,0,0.4)',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Mobile Bottom Toolbar Controls */}
      <footer
        style={{
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#111b21',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: 'max(8px, env(safe-area-inset-bottom, 8px))',
          zIndex: 10002,
        }}
      >
        {/* Tool Sub-Bar: Palettes or Crop options */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '8px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            overflowX: 'auto',
          }}
        >
          {mode === 'crop' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'space-around' }}>
              <button
                onClick={rotateCounterClockwise}
                style={styles.mobileSubBtn}
                type="button"
              >
                <RotateCcw size={15} />
                <span>-90°</span>
              </button>
              <button
                onClick={rotateClockwise}
                style={styles.mobileSubBtn}
                type="button"
              >
                <RotateCw size={15} />
                <span>+90°</span>
              </button>
              {(['free', '1:1', '4:3', '16:9'] as AspectRatioOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => applyAspectRatio(opt)}
                  style={{
                    ...styles.mobileSubBtn,
                    backgroundColor: aspectRatio === opt ? '#00a884' : 'transparent',
                    color: '#ffffff',
                  }}
                  type="button"
                >
                  {opt.toUpperCase()}
                </button>
              ))}
              <button
                onClick={async () => {
                  await commitCrop();
                  setMode('pencil');
                }}
                style={{
                  ...styles.mobileSubBtn,
                  backgroundColor: '#00a884',
                  color: '#ffffff',
                  fontWeight: 600,
                  gap: 4,
                }}
                type="button"
                title="Apply crop and switch to drawing/annotations"
              >
                <Check size={14} />
                <span>Apply Crop</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'space-between' }}>
              {/* Color Circles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {COLOR_PALETTE.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      border: color === c ? '3px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                      padding: 0,
                    }}
                    type="button"
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>

              {/* Stroke Size */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {(['fine', 'medium', 'bold'] as StrokeWidthPreset[]).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setStrokePreset(preset)}
                    style={{
                      ...styles.mobileSubBtn,
                      backgroundColor: strokePreset === preset ? 'rgba(255,255,255,0.2)' : 'transparent',
                      padding: '4px 8px',
                    }}
                    type="button"
                  >
                    <span
                      style={{
                        width: preset === 'fine' ? '4px' : preset === 'medium' ? '7px' : '10px',
                        height: preset === 'fine' ? '4px' : preset === 'medium' ? '7px' : '10px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        display: 'inline-block',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {(mode === 'text' || mode === 'select') && (
          <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.72rem', paddingBottom: '2px' }}>
            {mode === 'text'
              ? 'Double-tap anywhere to type • Drag text to move'
              : 'Tap & drag any text, shape, or drawing to move'}
          </div>
        )}

        {/* Tool Mode Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '6px 4px',
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => handleSwitchMode('select')}
            style={mode === 'select' ? styles.activeMobileTab : styles.mobileTab}
            type="button"
            aria-label="Move elements"
          >
            <Move size={18} />
            <span style={{ fontSize: '0.7rem' }}>Move</span>
          </button>
          <button
            onClick={() => handleSwitchMode('crop')}
            style={mode === 'crop' ? styles.activeMobileTab : styles.mobileTab}
            type="button"
          >
            <Crop size={18} />
            <span style={{ fontSize: '0.7rem' }}>Crop</span>
          </button>
          <button
            onClick={() => handleSwitchMode('pencil')}
            style={mode === 'pencil' ? styles.activeMobileTab : styles.mobileTab}
            type="button"
          >
            <Pen size={18} />
            <span style={{ fontSize: '0.7rem' }}>Pencil</span>
          </button>
          <button
            onClick={() => handleSwitchMode('arrow')}
            style={mode === 'arrow' ? styles.activeMobileTab : styles.mobileTab}
            type="button"
          >
            <ArrowRight size={18} />
            <span style={{ fontSize: '0.7rem' }}>Arrow</span>
          </button>
          <button
            onClick={() => handleSwitchMode('rect')}
            style={mode === 'rect' ? styles.activeMobileTab : styles.mobileTab}
            type="button"
          >
            <Square size={18} />
            <span style={{ fontSize: '0.7rem' }}>Box</span>
          </button>
          <button
            onClick={() => handleSwitchMode('circle')}
            style={mode === 'circle' ? styles.activeMobileTab : styles.mobileTab}
            type="button"
          >
            <Circle size={18} />
            <span style={{ fontSize: '0.7rem' }}>Circle</span>
          </button>
          <button
            onClick={() => handleSwitchMode('text')}
            style={mode === 'text' ? styles.activeMobileTab : styles.mobileTab}
            type="button"
          >
            <Type size={18} />
            <span style={{ fontSize: '0.7rem' }}>Text</span>
          </button>
        </div>
      </footer>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }
  return content;
};

function renderMobileSvgShape(sh: any, w: number, h: number) {
  const sx = sh.startX * w;
  const sy = sh.startY * h;
  const ex = sh.endX * w;
  const ey = sh.endY * h;
  const b = getShapeBounds(sh);
  const dataAttrs = {
    'data-editor-element-kind': 'shape',
    'data-element-id': sh.id,
    'data-bounds-x': b.x.toFixed(4),
    'data-bounds-y': b.y.toFixed(4),
  };

  if (sh.type === 'arrow') {
    const angle = Math.atan2(ey - sy, ex - sx);
    const headLen = Math.max(12, sh.width * 3);
    const p1 = `${ex - headLen * Math.cos(angle - Math.PI / 6)},${ey - headLen * Math.sin(angle - Math.PI / 6)}`;
    const p2 = `${ex - headLen * Math.cos(angle + Math.PI / 6)},${ey - headLen * Math.sin(angle + Math.PI / 6)}`;
    return (
      <g key={sh.id} {...dataAttrs}>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={sh.color} strokeWidth={sh.width} strokeLinecap="round" />
        <polygon points={`${ex},${ey} ${p1} ${p2}`} fill={sh.color} />
      </g>
    );
  }

  if (sh.type === 'rect') {
    return (
      <rect
        key={sh.id}
        {...dataAttrs}
        x={Math.min(sx, ex)}
        y={Math.min(sy, ey)}
        width={Math.abs(ex - sx)}
        height={Math.abs(ey - sy)}
        fill="none"
        stroke={sh.color}
        strokeWidth={sh.width}
        strokeLinecap="round"
      />
    );
  }

  if (sh.type === 'circle') {
    const rx = Math.abs(ex - sx) / 2;
    const ry = Math.abs(ey - sy) / 2;
    const cx = Math.min(sx, ex) + rx;
    const cy = Math.min(sy, ey) + ry;
    return (
      <ellipse
        key={sh.id}
        {...dataAttrs}
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={sh.color}
        strokeWidth={sh.width}
      />
    );
  }

  return null;
}

function getMobileHandlePosition(handle: string): React.CSSProperties {
  switch (handle) {
    case 'tl': return { left: '0%', top: '0%' };
    case 'tc': return { left: '50%', top: '0%' };
    case 'tr': return { left: '100%', top: '0%' };
    case 'ml': return { left: '0%', top: '50%' };
    case 'mr': return { left: '100%', top: '50%' };
    case 'bl': return { left: '0%', top: '100%' };
    case 'bc': return { left: '50%', top: '100%' };
    case 'br': return { left: '100%', top: '100%' };
    default: return {};
  }
}

const styles: Record<string, React.CSSProperties> = {
  mobileTouchBtn: {
    width: '44px',
    height: '44px',
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
  },
  mobileTab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    padding: '6px 8px',
    cursor: 'pointer',
  },
  activeMobileTab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    border: 'none',
    color: '#00a884',
    padding: '6px 8px',
    cursor: 'pointer',
  },
  mobileSubBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '14px',
    padding: '4px 8px',
    fontSize: '0.74rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  deleteBadgeBtn: {
    position: 'absolute',
    top: '-12px',
    right: '-12px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.45)',
  },
  inlineDeleteBtn: {
    marginLeft: '8px',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
};
