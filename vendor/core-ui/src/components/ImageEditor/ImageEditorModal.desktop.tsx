import React, { useRef, useState, useEffect, useCallback } from 'react';
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
} from './ImageEditorModal.types';
import {
  useImageEditor,
  COLOR_PALETTE,
  STROKE_WIDTH_MAP,
} from './useImageEditor';

export const ImageEditorModalDesktop: React.FC<ImageEditorModalProps> = ({
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
    setSelectedTextId,
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
  const [textModalState, setTextModalState] = useState<{ isOpen: boolean; text: string; id?: string; x?: number; y?: number } | null>(null);

  const handleSaveTextModal = () => {
    if (!textModalState) return;
    const trimmed = textModalState.text.trim();
    if (trimmed) {
      if (textModalState.id) {
        updateTextItem(textModalState.id, { text: trimmed });
      } else if (textModalState.x !== undefined && textModalState.y !== undefined) {
        addTextItem(trimmed, textModalState.x, textModalState.y);
      }
    } else if (textModalState.id) {
      removeTextItem(textModalState.id);
    }
    setTextModalState(null);
  };

  // Dragging crop handle or crop box
  const [dragHandle, setDragHandle] = useState<string | null>(null);
  const dragStartRef = useRef<{ clientX: number; clientY: number; initialRect: typeof cropRect }>({
    clientX: 0,
    clientY: 0,
    initialRect: { x: 0, y: 0, width: 1, height: 1 },
  });

  // Track container size
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

  // Handle Apply
  const handleApply = async () => {
    if (isApplying) return;
    setIsApplying(true);
    try {
      const result = await generateExportResult(fileNamePrefix);
      onApply(result);
      onClose();
    } catch (err) {
      console.error('Failed to generate edited image:', err);
    } finally {
      setIsApplying(false);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, undo, redo]);

  if (!isOpen) return null;

  // Compute displayed image bounding box inside container
  const isSideways = rotation % 180 !== 0;
  const orientedW = isSideways ? imageSize.height : imageSize.width;
  const orientedH = isSideways ? imageSize.width : imageSize.height;

  let displayW = 0;
  let displayH = 0;
  if (containerSize.width > 0 && containerSize.height > 0 && orientedW > 0 && orientedH > 0) {
    const scale = Math.min(
      (containerSize.width - 48) / orientedW,
      (containerSize.height - 48) / orientedH
    );
    displayW = orientedW * scale;
    displayH = orientedH * scale;
  }

  // Pointer / Drag logic for Cropping
  const handleCropPointerDown = (handle: string, e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDragHandle(handle);
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialRect: { ...cropRect },
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragHandle && displayW > 0 && displayH > 0) {
      const dx = (e.clientX - dragStartRef.current.clientX) / displayW;
      const dy = (e.clientY - dragStartRef.current.clientY) / displayH;
      const initial = dragStartRef.current.initialRect;

      let nextX = initial.x;
      let nextY = initial.y;
      let nextW = initial.width;
      let nextH = initial.height;
      const minSize = 0.08;

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

    // Pointer move for drawing/shapes
    if (!displayW || !displayH) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const offsetX = (containerSize.width - displayW) / 2;
    const offsetY = (containerSize.height - displayH) / 2;
    const px = (e.clientX - rect.left - offsetX) / displayW;
    const py = (e.clientY - rect.top - offsetY) / displayH;

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
    if (currentStroke) {
      finishStroke(currentStroke);
    }
    if (currentShape) {
      finishShape(currentShape);
    }
  };

  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    if (mode === 'crop') return;
    if (!displayW || !displayH) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const offsetX = (containerSize.width - displayW) / 2;
    const offsetY = (containerSize.height - displayH) / 2;
    const px = (e.clientX - rect.left - offsetX) / displayW;
    const py = (e.clientY - rect.top - offsetY) / displayH;

    if (mode === 'pencil') {
      setCurrentStroke({
        id: `stroke-${Date.now()}`,
        type: 'pencil',
        points: [{ x: px, y: py }],
        color,
        width: STROKE_WIDTH_MAP[strokePreset],
      });
    } else if (mode === 'arrow' || mode === 'rect' || mode === 'circle') {
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
      setTextModalState({ isOpen: true, text: '', x: px, y: py });
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11, 20, 26, 0.96)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* 1. Header Toolbar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
          backgroundColor: '#111b21',
          color: '#ffffff',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Left: Close & Undo/Redo/Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onClose}
            style={styles.iconBtn}
            title="Cancel"
            type="button"
          >
            <X size={20} color="#ffffff" />
          </button>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'rgba(255,255,255,0.18)', margin: '0 4px' }} />
          <button
            onClick={undo}
            disabled={!canUndo}
            style={{ ...styles.iconBtn, opacity: canUndo ? 1 : 0.35, cursor: canUndo ? 'pointer' : 'default' }}
            title="Undo (Ctrl+Z)"
            type="button"
          >
            <Undo2 size={18} color="#ffffff" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            style={{ ...styles.iconBtn, opacity: canRedo ? 1 : 0.35, cursor: canRedo ? 'pointer' : 'default' }}
            title="Redo (Ctrl+Y)"
            type="button"
          >
            <Redo2 size={18} color="#ffffff" />
          </button>
          <button
            onClick={resetToOriginal}
            style={styles.iconBtn}
            title="Reset to Original Image"
            type="button"
          >
            <RefreshCw size={17} color="#ffffff" />
          </button>
        </div>

        {/* Center: Tool Switcher Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderRadius: '24px',
            padding: '3px',
            gap: '2px',
          }}
        >
          <button
            onClick={() => setMode('crop')}
            style={mode === 'crop' ? styles.activeToolTab : styles.toolTab}
            type="button"
          >
            <Crop size={16} />
            <span>Crop & Rotate</span>
          </button>
          <button
            onClick={() => setMode('pencil')}
            style={mode === 'pencil' ? styles.activeToolTab : styles.toolTab}
            type="button"
          >
            <Pen size={16} />
            <span>Pencil</span>
          </button>
          <button
            onClick={() => setMode('arrow')}
            style={mode === 'arrow' ? styles.activeToolTab : styles.toolTab}
            type="button"
          >
            <ArrowRight size={16} />
            <span>Arrow</span>
          </button>
          <button
            onClick={() => setMode('rect')}
            style={mode === 'rect' ? styles.activeToolTab : styles.toolTab}
            type="button"
          >
            <Square size={16} />
            <span>Box</span>
          </button>
          <button
            onClick={() => setMode('circle')}
            style={mode === 'circle' ? styles.activeToolTab : styles.toolTab}
            type="button"
          >
            <Circle size={16} />
            <span>Circle</span>
          </button>
          <button
            onClick={() => setMode('text')}
            style={mode === 'text' ? styles.activeToolTab : styles.toolTab}
            type="button"
          >
            <Type size={16} />
            <span>Text</span>
          </button>
        </div>

        {/* Right: Apply / Done Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleApply}
            disabled={isApplying}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#00a884',
              color: '#ffffff',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 18px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: isApplying ? 'wait' : 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            type="button"
          >
            <Check size={18} strokeWidth={2.5} />
            <span>{isApplying ? 'Applying...' : 'Done'}</span>
          </button>
        </div>
      </header>

      {/* 2. Sub-Toolbar for Active Tool */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 16px',
          backgroundColor: '#182229',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          gap: '20px',
          flexWrap: 'wrap',
        }}
      >
        {mode === 'crop' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Rotation Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={rotateCounterClockwise}
                style={styles.subBtn}
                title="Rotate 90° Left"
                type="button"
              >
                <RotateCcw size={15} />
                <span>-90°</span>
              </button>
              <button
                onClick={rotateClockwise}
                style={styles.subBtn}
                title="Rotate 90° Right"
                type="button"
              >
                <RotateCw size={15} />
                <span>+90°</span>
              </button>
            </div>

            <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255,255,255,0.15)' }} />

            {/* Aspect Ratio Presets */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {(['free', 'original', '1:1', '4:3', '16:9'] as AspectRatioOption[]).map((opt) => (
                <button
                  key={opt}
                  onClick={() => applyAspectRatio(opt)}
                  style={{
                    ...styles.subBtn,
                    backgroundColor: aspectRatio === opt ? '#00a884' : 'transparent',
                    color: '#ffffff',
                  }}
                  type="button"
                >
                  {opt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* Color Palette */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    backgroundColor: c,
                    border: color === c ? '2.5px solid #ffffff' : '1px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer',
                    boxShadow: color === c ? '0 0 6px rgba(255,255,255,0.6)' : 'none',
                    padding: 0,
                  }}
                  type="button"
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>

            <div style={{ width: '1px', height: '18px', backgroundColor: 'rgba(255,255,255,0.15)' }} />

            {/* Stroke Thickness Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {(['fine', 'medium', 'bold'] as StrokeWidthPreset[]).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setStrokePreset(preset)}
                  style={{
                    ...styles.subBtn,
                    backgroundColor: strokePreset === preset ? 'rgba(255,255,255,0.15)' : 'transparent',
                    border: strokePreset === preset ? '1px solid #00a884' : '1px solid transparent',
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
                      marginRight: '6px',
                    }}
                  />
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Image & Canvas Viewport */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          cursor: mode === 'crop' ? 'default' : mode === 'text' ? 'text' : 'crosshair',
        }}
        onPointerDown={handleCanvasPointerDown}
      >
        {imageLoaded && displayW > 0 && displayH > 0 && (
          <div
            style={{
              position: 'relative',
              width: `${displayW}px`,
              height: `${displayH}px`,
              userSelect: 'none',
            }}
          >
            {/* Base Image */}
            <img
              src={imageUrl}
              alt="Edit canvas"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                transform: `rotate(${rotation}deg)`,
                pointerEvents: 'none',
              }}
            />

            {/* Existing Freehand Strokes */}
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              {strokes.map((st) => (
                <polyline
                  key={st.id}
                  points={st.points.map((p) => `${p.x * displayW},${p.y * displayH}`).join(' ')}
                  fill="none"
                  stroke={st.color}
                  strokeWidth={st.width}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
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
              {shapes.map((sh) => renderSvgShape(sh, displayW, displayH))}
              {currentShape && renderSvgShape(currentShape, displayW, displayH)}
            </svg>

            {/* Text Callouts Layer */}
            {textItems.map((item) => (
              <div
                key={item.id}
                style={{
                  position: 'absolute',
                  left: `${item.x * displayW}px`,
                  top: `${item.y * displayH}px`,
                  transform: 'translate(-50%, -50%)',
                  padding: '4px 10px',
                  borderRadius: '14px',
                  backgroundColor: item.hasBadge ? 'rgba(0, 0, 0, 0.72)' : 'transparent',
                  color: item.color,
                  fontSize: `${item.fontSize}px`,
                  fontWeight: 700,
                  cursor: 'grab',
                  border: selectedTextId === item.id ? '1px dashed #00a884' : 'none',
                  whiteSpace: 'nowrap',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTextId(item.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setTextModalState({ isOpen: true, text: item.text, id: item.id });
                }}
              >
                {item.text}
                {selectedTextId === item.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTextItem(item.id);
                    }}
                    style={{
                      marginLeft: '6px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                    title="Delete callout"
                    type="button"
                  >
                    <Trash2 size={10} />
                  </button>
                )}
              </div>
            ))}

            {/* Crop Overlay (When in Crop Mode) */}
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
                  cursor: 'move',
                }}
                onPointerDown={(e) => handleCropPointerDown('move', e)}
              >
                {/* 8 Resizing Handles */}
                {['tl', 'tc', 'tr', 'ml', 'mr', 'bl', 'bc', 'br'].map((handle) => (
                  <div
                    key={handle}
                    style={{
                      position: 'absolute',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: '2px solid #00a884',
                      cursor: getHandleCursor(handle),
                      ...getHandlePosition(handle),
                      transform: 'translate(-50%, -50%)',
                      touchAction: 'none',
                    }}
                    onPointerDown={(e) => handleCropPointerDown(handle, e)}
                  />
                ))}

                {/* 3x3 Grid Lines */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
                  <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: '1px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
                  <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: '1px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
                  <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: '1px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Custom Apple HIG Dialog for Adding/Editing Callout Text */}
      {textModalState && textModalState.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            zIndex: 10005,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setTextModalState(null)}
        >
          <div
            style={{
              backgroundColor: '#1f2c34',
              padding: '24px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              width: '340px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1.05rem', fontWeight: 600 }}>
              {textModalState.id ? 'Edit Callout Text' : 'Add Callout Text'}
            </h4>
            <input
              type="text"
              autoFocus
              placeholder="Type your callout here..."
              value={textModalState.text}
              onChange={(e) => setTextModalState({ ...textModalState, text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTextModal();
                if (e.key === 'Escape') setTextModalState(null);
              }}
              style={{
                backgroundColor: '#2a3942',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setTextModalState(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#8696a0',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTextModal}
                style={{
                  backgroundColor: '#00a884',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#ffffff',
                  padding: '8px 18px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                }}
                type="button"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// SVG Shape Helper
function renderSvgShape(sh: any, w: number, h: number) {
  const sx = sh.startX * w;
  const sy = sh.startY * h;
  const ex = sh.endX * w;
  const ey = sh.endY * h;

  if (sh.type === 'arrow') {
    const angle = Math.atan2(ey - sy, ex - sx);
    const headLen = Math.max(12, sh.width * 3);
    const p1 = `${ex - headLen * Math.cos(angle - Math.PI / 6)},${ey - headLen * Math.sin(angle - Math.PI / 6)}`;
    const p2 = `${ex - headLen * Math.cos(angle + Math.PI / 6)},${ey - headLen * Math.sin(angle + Math.PI / 6)}`;

    return (
      <g key={sh.id}>
        <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={sh.color} strokeWidth={sh.width} strokeLinecap="round" />
        <polygon points={`${ex},${ey} ${p1} ${p2}`} fill={sh.color} />
      </g>
    );
  }

  if (sh.type === 'rect') {
    return (
      <rect
        key={sh.id}
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

function getHandlePosition(handle: string): React.CSSProperties {
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

function getHandleCursor(handle: string): string {
  switch (handle) {
    case 'tl':
    case 'br': return 'nwse-resize';
    case 'tr':
    case 'bl': return 'nesw-resize';
    case 'tc':
    case 'bc': return 'ns-resize';
    case 'ml':
    case 'mr': return 'ew-resize';
    default: return 'move';
  }
}

const styles: Record<string, React.CSSProperties> = {
  iconBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#ffffff',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    transition: 'background-color 0.12s ease',
  },
  toolTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.75)',
    border: 'none',
    borderRadius: '20px',
    padding: '6px 12px',
    fontSize: '0.82rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
  activeToolTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '20px',
    padding: '6px 12px',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  subBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'transparent',
    color: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '16px',
    padding: '4px 10px',
    fontSize: '0.76rem',
    fontWeight: 500,
    cursor: 'pointer',
  },
};
