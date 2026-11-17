import React, { useRef, useState, useEffect } from 'react';
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
    setIsApplying(true);
    try {
      const result = await generateExportResult(fileNamePrefix);
      onApply(result);
      onClose();
    } catch (err) {
      console.error('Failed to generate mobile edited image:', err);
    } finally {
      setIsApplying(false);
    }
  };

  // Crop Handle Touch
  const handleCropTouchStart = (handle: string, e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    if (!touch) return;
    setDragHandle(handle);
    dragStartRef.current = {
      clientX: touch.clientX,
      clientY: touch.clientY,
      initialRect: { ...cropRect },
    };
  };

  // Touch Start (Drawing or Multi-touch)
  const handleCanvasTouchStart = (e: React.TouchEvent) => {
    // 1. Two-Finger Pinch & Pan
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
      // Cancel active single finger strokes if two fingers land
      setCurrentStroke(null);
      setCurrentShape(null);
      return;
    }

    // 2. Single-finger Interaction
    if (e.touches.length === 1 && !touchStateRef.current.isPinching) {
      if (mode === 'crop') return;
      if (!displayW || !displayH) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const t = e.touches[0];
      const offsetX = (containerSize.width - displayW) / 2 + panOffset.x;
      const offsetY = (containerSize.height - displayH) / 2 + panOffset.y;
      const px = (t.clientX - rect.left - offsetX) / (displayW * zoom);
      const py = (t.clientY - rect.top - offsetY) / (displayH * zoom);

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
    }
  };

  // Touch Move
  const handleCanvasTouchMove = (e: React.TouchEvent) => {
    // Two-finger Pinch & Pan
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
      return;
    }

    // Single-finger Crop Drag
    if (e.touches.length === 1 && dragHandle && displayW > 0 && displayH > 0) {
      const t = e.touches[0];
      const dx = (t.clientX - dragStartRef.current.clientX) / displayW;
      const dy = (t.clientY - dragStartRef.current.clientY) / displayH;
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

    // Single-finger Drawing or Shapes
    if (e.touches.length === 1 && !touchStateRef.current.isPinching) {
      if (!displayW || !displayH) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const t = e.touches[0];
      const offsetX = (containerSize.width - displayW) / 2 + panOffset.x;
      const offsetY = (containerSize.height - displayH) / 2 + panOffset.y;
      const px = (t.clientX - rect.left - offsetX) / (displayW * zoom);
      const py = (t.clientY - rect.top - offsetY) / (displayH * zoom);

      if (currentStroke) {
        setCurrentStroke((prev) => (prev ? { ...prev, points: [...prev.points, { x: px, y: py }] } : null));
      } else if (currentShape) {
        setCurrentShape((prev) => (prev ? { ...prev, endX: px, endY: py } : null));
      }
    }
  };

  // Touch End
  const handleCanvasTouchEnd = () => {
    if (touchStateRef.current.isPinching) {
      touchStateRef.current.isPinching = false;
      return;
    }
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#0b141a',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'none',
        userSelect: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
      onTouchMove={handleCanvasTouchMove}
      onTouchEnd={handleCanvasTouchEnd}
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
      >
        {imageLoaded && displayW > 0 && displayH > 0 && (
          <div
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
              {shapes.map((sh) => renderMobileSvgShape(sh, displayW, displayH))}
              {currentShape && renderMobileSvgShape(currentShape, displayW, displayH)}
            </svg>

            {/* Text Callouts */}
            {textItems.map((item) => (
              <div
                key={item.id}
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
                  border: selectedTextId === item.id ? '1px dashed #00a884' : 'none',
                  whiteSpace: 'nowrap',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTextId(item.id);
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
                    }}
                    type="button"
                  >
                    <Trash2 size={11} />
                  </button>
                )}
              </div>
            ))}

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
                onTouchStart={(e) => handleCropTouchStart('move', e)}
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
                    onTouchStart={(e) => handleCropTouchStart(handle, e)}
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

        {/* Tool Mode Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '6px 8px',
          }}
        >
          <button
            onClick={() => setMode('crop')}
            style={mode === 'crop' ? styles.activeMobileTab : styles.mobileTab}
            type="button"
          >
            <Crop size={18} />
            <span style={{ fontSize: '0.72rem' }}>Crop</span>
          </button>
          <button
            onClick={() => setMode('pencil')}
            style={mode === 'pencil' ? styles.activeMobileTab : styles.mobileTab}
            type="button"
          >
            <Pen size={18} />
            <span style={{ fontSize: '0.72rem' }}>Pencil</span>
          </button>
          <button
            onClick={() => setMode('arrow')}
            style={mode === 'arrow' ? styles.activeMobileTab : styles.mobileTab}
            type="button"
          >
            <ArrowRight size={18} />
            <span style={{ fontSize: '0.72rem' }}>Arrow</span>
          </button>
          <button
            onClick={() => setMode('rect')}
            style={mode === 'rect' ? styles.activeMobileTab : styles.mobileTab}
            type="button"
          >
            <Square size={18} />
            <span style={{ fontSize: '0.72rem' }}>Box</span>
          </button>
          <button
            onClick={() => setMode('circle')}
            style={mode === 'circle' ? styles.activeMobileTab : styles.mobileTab}
            type="button"
          >
            <Circle size={18} />
            <span style={{ fontSize: '0.72rem' }}>Circle</span>
          </button>
          <button
            onClick={() => setMode('text')}
            style={mode === 'text' ? styles.activeMobileTab : styles.mobileTab}
            type="button"
          >
            <Type size={18} />
            <span style={{ fontSize: '0.72rem' }}>Text</span>
          </button>
        </div>
      </footer>

      {/* Custom Mobile Apple HIG Dialog for Adding/Editing Callout Text */}
      {textModalState && textModalState.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            zIndex: 10005,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            boxSizing: 'border-box',
          }}
          onClick={() => setTextModalState(null)}
        >
          <div
            style={{
              backgroundColor: '#1f2c34',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
              width: '100%',
              maxWidth: '320px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ margin: 0, color: '#ffffff', fontSize: '1rem', fontWeight: 600 }}>
              {textModalState.id ? 'Edit Callout Text' : 'Add Callout Text'}
            </h4>
            <input
              type="text"
              autoFocus
              placeholder="Type callout text..."
              value={textModalState.text}
              onChange={(e) => setTextModalState({ ...textModalState, text: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTextModal();
                if (e.key === 'Escape') setTextModalState(null);
              }}
              style={{
                backgroundColor: '#2a3942',
                border: '1px solid rgba(255, 255, 255, 0.2)',
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

function renderMobileSvgShape(sh: any, w: number, h: number) {
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
      <ellipse key={sh.id} cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={sh.color} strokeWidth={sh.width} />
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
    padding: '6px 12px',
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
    padding: '6px 12px',
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
};
