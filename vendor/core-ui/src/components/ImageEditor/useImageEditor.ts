import { useState, useRef, useCallback, useEffect } from 'react';
import {
  EditorToolMode,
  StrokeWidthPreset,
  EditorStroke,
  EditorShape,
  EditorTextItem,
  CropRect,
  AspectRatioOption,
  ImageEditorResult
} from './ImageEditorModal.types';

export const COLOR_PALETTE = [
  '#EF4444', // Red
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#EAB308', // Yellow
  '#F97316', // Orange
  '#FFFFFF', // White
  '#000000', // Black
];

export const STROKE_WIDTH_MAP: Record<StrokeWidthPreset, number> = {
  fine: 2.5,
  medium: 5,
  bold: 10,
};

interface EditorHistoryState {
  imageUrl?: string;
  imageSize?: { width: number; height: number };
  cropRect: CropRect;
  rotation: number;
  strokes: EditorStroke[];
  shapes: EditorShape[];
  textItems: EditorTextItem[];
}

export function useImageEditor(imageUrl: string, initialFile?: File, initialMode: EditorToolMode = 'crop') {
  const [currentImageUrl, setCurrentImageUrl] = useState<string>(imageUrl);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [mode, setMode] = useState<EditorToolMode>(initialMode);
  const [color, setColor] = useState<string>(COLOR_PALETTE[0]);
  const [strokePreset, setStrokePreset] = useState<StrokeWidthPreset>('medium');
  const [rotation, setRotation] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>('free');

  // Normalized crop bounds (0 to 1 relative to image dimensions)
  const [cropRect, setCropRect] = useState<CropRect>({ x: 0, y: 0, width: 1, height: 1 });

  // Annotations
  const [strokes, setStrokes] = useState<EditorStroke[]>([]);
  const [shapes, setShapes] = useState<EditorShape[]>([]);
  const [textItems, setTextItems] = useState<EditorTextItem[]>([]);

  // Active interaction states
  const [currentStroke, setCurrentStroke] = useState<EditorStroke | null>(null);
  const [currentShape, setCurrentShape] = useState<EditorShape | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Viewport zoom & pan (for detail editing)
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // History stack
  const historyRef = useRef<EditorHistoryState[]>([]);
  const historyIdxRef = useRef<number>(-1);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  // Cached Image object & initial snapshot
  const imageObjRef = useRef<HTMLImageElement | null>(null);
  const initialImageUrlRef = useRef<string>(imageUrl);
  const initialImageObjRef = useRef<HTMLImageElement | null>(null);
  const initialImageSizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  const pushHistory = useCallback((newState: Partial<EditorHistoryState>) => {
    const current: EditorHistoryState = {
      imageUrl: newState.imageUrl ?? currentImageUrl,
      imageSize: newState.imageSize ?? imageSize,
      cropRect: newState.cropRect ?? cropRect,
      rotation: newState.rotation ?? rotation,
      strokes: newState.strokes ?? strokes,
      shapes: newState.shapes ?? shapes,
      textItems: newState.textItems ?? textItems,
    };

    // Slice any future history if we were in the middle
    const updated = historyRef.current.slice(0, historyIdxRef.current + 1);
    updated.push(current);
    historyRef.current = updated;
    historyIdxRef.current = updated.length - 1;
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(false);
  }, [currentImageUrl, imageSize, cropRect, rotation, strokes, shapes, textItems]);

  // Load Image and initialize default states
  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageObjRef.current = img;
      initialImageObjRef.current = img;
      initialImageUrlRef.current = imageUrl;
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      initialImageSizeRef.current = { width: naturalW, height: naturalH };
      setImageSize({ width: naturalW, height: naturalH });
      setCurrentImageUrl(imageUrl);
      setImageLoaded(true);

      const initialCrop: CropRect = { x: 0, y: 0, width: 1, height: 1 };
      setCropRect(initialCrop);
      setRotation(0);
      setStrokes([]);
      setShapes([]);
      setTextItems([]);
      setZoom(1);
      setPanOffset({ x: 0, y: 0 });

      const initialHistory: EditorHistoryState = {
        imageUrl,
        imageSize: { width: naturalW, height: naturalH },
        cropRect: initialCrop,
        rotation: 0,
        strokes: [],
        shapes: [],
        textItems: [],
      };
      historyRef.current = [initialHistory];
      historyIdxRef.current = 0;
      setCanUndo(false);
      setCanRedo(false);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Rotate 90 degrees clockwise
  const rotateClockwise = useCallback(() => {
    setRotation((prev) => {
      const next = (prev + 90) % 360;
      pushHistory({ rotation: next });
      return next;
    });
  }, [pushHistory]);

  // Rotate 90 degrees counter-clockwise
  const rotateCounterClockwise = useCallback(() => {
    setRotation((prev) => {
      const next = (prev + 270) % 360;
      pushHistory({ rotation: next });
      return next;
    });
  }, [pushHistory]);

  // Undo
  const undo = useCallback(() => {
    if (historyIdxRef.current <= 0) return;
    historyIdxRef.current -= 1;
    const target = historyRef.current[historyIdxRef.current];
    if (target) {
      if (target.imageUrl && target.imageUrl !== currentImageUrl) {
        setCurrentImageUrl(target.imageUrl);
        if (target.imageSize) setImageSize(target.imageSize);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          imageObjRef.current = img;
        };
        img.src = target.imageUrl;
      }
      setCropRect(target.cropRect);
      setRotation(target.rotation);
      setStrokes(target.strokes);
      setShapes(target.shapes);
      setTextItems(target.textItems);
    }
    setCanUndo(historyIdxRef.current > 0);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
  }, [currentImageUrl]);

  // Redo
  const redo = useCallback(() => {
    if (historyIdxRef.current >= historyRef.current.length - 1) return;
    historyIdxRef.current += 1;
    const target = historyRef.current[historyIdxRef.current];
    if (target) {
      if (target.imageUrl && target.imageUrl !== currentImageUrl) {
        setCurrentImageUrl(target.imageUrl);
        if (target.imageSize) setImageSize(target.imageSize);
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          imageObjRef.current = img;
        };
        img.src = target.imageUrl;
      }
      setCropRect(target.cropRect);
      setRotation(target.rotation);
      setStrokes(target.strokes);
      setShapes(target.shapes);
      setTextItems(target.textItems);
    }
    setCanUndo(true);
    setCanRedo(historyIdxRef.current < historyRef.current.length - 1);
  }, [currentImageUrl]);

  // Reset to original
  const resetToOriginal = useCallback(() => {
    const raw: CropRect = { x: 0, y: 0, width: 1, height: 1 };
    if (initialImageUrlRef.current && initialImageObjRef.current) {
      imageObjRef.current = initialImageObjRef.current;
      setCurrentImageUrl(initialImageUrlRef.current);
      setImageSize(initialImageSizeRef.current);
    }
    setCropRect(raw);
    setRotation(0);
    setStrokes([]);
    setShapes([]);
    setTextItems([]);
    setZoom(1);
    setPanOffset({ x: 0, y: 0 });
    pushHistory({
      imageUrl: initialImageUrlRef.current,
      imageSize: initialImageSizeRef.current,
      cropRect: raw,
      rotation: 0,
      strokes: [],
      shapes: [],
      textItems: [],
    });
  }, [pushHistory]);

  // Update Crop Aspect Ratio
  const applyAspectRatio = useCallback((preset: AspectRatioOption) => {
    setAspectRatio(preset);
    if (preset === 'free') return;

    let targetRatio = 1;
    const isSideways = rotation % 180 !== 0;
    const naturalW = isSideways ? imageSize.height : imageSize.width;
    const naturalH = isSideways ? imageSize.width : imageSize.height;

    if (preset === 'original') {
      targetRatio = naturalW / naturalH;
    } else if (preset === '1:1') {
      targetRatio = 1;
    } else if (preset === '4:3') {
      targetRatio = 4 / 3;
    } else if (preset === '16:9') {
      targetRatio = 16 / 9;
    }

    setCropRect((prev) => {
      let newW = prev.width;
      let newH = newW / targetRatio;
      if (newH > 1) {
        newH = 1;
        newW = newH * targetRatio;
      }
      if (newW > 1) {
        newW = 1;
        newH = newW / targetRatio;
      }
      const newX = Math.max(0, Math.min(1 - newW, prev.x));
      const newY = Math.max(0, Math.min(1 - newH, prev.y));
      const next = { x: newX, y: newY, width: newW, height: newH };
      pushHistory({ cropRect: next });
      return next;
    });
  }, [imageSize, rotation, pushHistory]);

  // Add / Update Text
  const addTextItem = useCallback((text: string, x = 0.5, y = 0.5) => {
    const newItem: EditorTextItem = {
      id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: 'text',
      text,
      x,
      y,
      color,
      fontSize: strokePreset === 'fine' ? 18 : strokePreset === 'medium' ? 24 : 32,
      hasBadge: true,
    };
    setTextItems((prev) => {
      const next = [...prev, newItem];
      pushHistory({ textItems: next });
      return next;
    });
    setSelectedTextId(newItem.id);
  }, [color, strokePreset, pushHistory]);

  const updateTextItem = useCallback((id: string, updates: Partial<EditorTextItem>) => {
    setTextItems((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
      pushHistory({ textItems: next });
      return next;
    });
  }, [pushHistory]);

  const removeTextItem = useCallback((id: string) => {
    setTextItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      pushHistory({ textItems: next });
      return next;
    });
    setSelectedTextId((prev) => (prev === id ? null : prev));
  }, [pushHistory]);

  // Finish a freehand stroke
  const finishStroke = useCallback((stroke: EditorStroke) => {
    if (stroke.points.length < 2) return;
    setStrokes((prev) => {
      const next = [...prev, stroke];
      pushHistory({ strokes: next });
      return next;
    });
    setCurrentStroke(null);
  }, [pushHistory]);

  // Finish a shape
  const finishShape = useCallback((shape: EditorShape) => {
    const dx = Math.abs(shape.endX - shape.startX);
    const dy = Math.abs(shape.endY - shape.startY);
    if (dx < 0.01 && dy < 0.01) return;
    setShapes((prev) => {
      const next = [...prev, shape];
      pushHistory({ shapes: next });
      return next;
    });
    setCurrentShape(null);
  }, [pushHistory]);

  // Export / Flatten to High-Res Canvas
  const generateExportResult = useCallback(async (fileNamePrefix = 'edited_photo'): Promise<ImageEditorResult> => {
    const img = imageObjRef.current;
    if (!img) throw new Error('Image not loaded');

    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;

    // Check orientation dimensions
    const isSideways = rotation % 180 !== 0;
    const orientedW = isSideways ? naturalH : naturalW;
    const orientedH = isSideways ? naturalW : naturalH;

    // Calculate crop area in oriented pixels
    const cropPixelX = Math.round(cropRect.x * orientedW);
    const cropPixelY = Math.round(cropRect.y * orientedH);
    const cropPixelW = Math.max(1, Math.round(cropRect.width * orientedW));
    const cropPixelH = Math.max(1, Math.round(cropRect.height * orientedH));

    // Constrain max canvas output resolution to 2048px for speed & clarity
    const maxDimension = 2048;
    let exportW = cropPixelW;
    let exportH = cropPixelH;
    if (exportW > maxDimension || exportH > maxDimension) {
      if (exportW > exportH) {
        exportH = Math.round((exportH * maxDimension) / exportW);
        exportW = maxDimension;
      } else {
        exportW = Math.round((exportW * maxDimension) / exportH);
        exportH = maxDimension;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = exportW;
    canvas.height = exportH;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    // Smooth rendering quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Draw base image with rotation & crop offset
    ctx.save();
    // Scale from cropPixel space into export space
    const scaleFactor = exportW / cropPixelW;
    ctx.scale(scaleFactor, scaleFactor);
    ctx.translate(-cropPixelX, -cropPixelY);

    // Apply rotation around oriented center
    ctx.translate(orientedW / 2, orientedH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -naturalW / 2, -naturalH / 2, naturalW, naturalH);
    ctx.restore();

    // 2. Render all freehand strokes
    ctx.save();
    const scaleToExportX = exportW / cropRect.width;
    const scaleToExportY = exportH / cropRect.height;

    strokes.forEach((st) => {
      if (st.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = st.color;
      ctx.lineWidth = st.width * (exportW / 800);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const p0 = st.points[0];
      const startX = (p0.x - cropRect.x) * scaleToExportX;
      const startY = (p0.y - cropRect.y) * scaleToExportY;
      ctx.moveTo(startX, startY);

      for (let i = 1; i < st.points.length; i++) {
        const pt = st.points[i];
        const px = (pt.x - cropRect.x) * scaleToExportX;
        const py = (pt.y - cropRect.y) * scaleToExportY;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
    });

    // 3. Render all shapes (Arrows, Rectangles, Circles)
    shapes.forEach((sh) => {
      const sx = (sh.startX - cropRect.x) * scaleToExportX;
      const sy = (sh.startY - cropRect.y) * scaleToExportY;
      const ex = (sh.endX - cropRect.x) * scaleToExportX;
      const ey = (sh.endY - cropRect.y) * scaleToExportY;
      const shapeLineWidth = sh.width * (exportW / 800);

      ctx.strokeStyle = sh.color;
      ctx.fillStyle = sh.color;
      ctx.lineWidth = shapeLineWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (sh.type === 'arrow') {
        // Draw stem
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        // Draw arrowhead
        const angle = Math.atan2(ey - sy, ex - sx);
        const headLen = Math.max(14, shapeLineWidth * 3.5);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(
          ex - headLen * Math.cos(angle - Math.PI / 6),
          ey - headLen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          ex - headLen * Math.cos(angle + Math.PI / 6),
          ey - headLen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      } else if (sh.type === 'rect') {
        ctx.beginPath();
        ctx.strokeRect(
          Math.min(sx, ex),
          Math.min(sy, ey),
          Math.abs(ex - sx),
          Math.abs(ey - sy)
        );
      } else if (sh.type === 'circle') {
        const rx = Math.abs(ex - sx) / 2;
        const ry = Math.abs(ey - sy) / 2;
        const cx = Math.min(sx, ex) + rx;
        const cy = Math.min(sy, ey) + ry;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });

    // 4. Render all text callouts
    textItems.forEach((item) => {
      if (!item.text.trim()) return;
      const tx = (item.x - cropRect.x) * scaleToExportX;
      const ty = (item.y - cropRect.y) * scaleToExportY;
      const fontSize = Math.max(14, Math.round(item.fontSize * (exportW / 800)));

      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      ctx.textBaseline = 'middle';

      const metrics = ctx.measureText(item.text);
      const paddingX = fontSize * 0.45;
      const paddingY = fontSize * 0.25;
      const bgW = metrics.width + paddingX * 2;
      const bgH = fontSize * 1.35;

      if (item.hasBadge) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
        const cornerRadius = bgH * 0.3;
        ctx.beginPath();
        ctx.roundRect(tx - bgW / 2, ty - bgH / 2, bgW, bgH, cornerRadius);
        ctx.fill();
      }

      ctx.fillStyle = item.color;
      ctx.fillText(item.text, tx - metrics.width / 2, ty);
    });

    ctx.restore();

    // Export to Blob
    return new Promise<ImageEditorResult>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob failed'));
          return;
        }
        const fileName = initialFile?.name
          ? initialFile.name.replace(/\.[^/.]+$/, '') + '_edited.jpg'
          : `${fileNamePrefix}_${Date.now()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        resolve({ blob, file, previewUrl });
      }, 'image/jpeg', 0.88);
    });
  }, [cropRect, rotation, strokes, shapes, textItems, initialFile]);

  // Commit crop so sequential effects (pen, arrow, shapes, text) operate directly on the cropped image
  const commitCrop = useCallback(async (): Promise<boolean> => {
    if (!imageObjRef.current) return false;
    const isUnchanged =
      Math.abs(cropRect.x) < 0.001 &&
      Math.abs(cropRect.y) < 0.001 &&
      Math.abs(cropRect.width - 1) < 0.001 &&
      Math.abs(cropRect.height - 1) < 0.001 &&
      rotation === 0;

    if (isUnchanged) return false;

    const img = imageObjRef.current;
    const naturalW = img.naturalWidth || img.width;
    const naturalH = img.naturalHeight || img.height;

    const isSideways = rotation % 180 !== 0;
    const orientedW = isSideways ? naturalH : naturalW;
    const orientedH = isSideways ? naturalW : naturalH;

    const cropPixelX = Math.round(cropRect.x * orientedW);
    const cropPixelY = Math.round(cropRect.y * orientedH);
    const cropPixelW = Math.max(1, Math.round(cropRect.width * orientedW));
    const cropPixelH = Math.max(1, Math.round(cropRect.height * orientedH));

    const canvas = document.createElement('canvas');
    canvas.width = cropPixelW;
    canvas.height = cropPixelH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.save();
    ctx.translate(-cropPixelX, -cropPixelY);
    ctx.translate(orientedW / 2, orientedH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(img, -naturalW / 2, -naturalH / 2, naturalW, naturalH);
    ctx.restore();

    const scaleToExportX = cropPixelW / cropRect.width;
    const scaleToExportY = cropPixelH / cropRect.height;
    if (strokes.length > 0) {
      ctx.save();
      strokes.forEach((st) => {
        if (st.points.length < 2) return;
        ctx.beginPath();
        ctx.strokeStyle = st.color;
        ctx.lineWidth = st.width * (cropPixelW / 800);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const p0 = st.points[0];
        ctx.moveTo((p0.x - cropRect.x) * scaleToExportX, (p0.y - cropRect.y) * scaleToExportY);
        for (let i = 1; i < st.points.length; i++) {
          const pt = st.points[i];
          ctx.lineTo((pt.x - cropRect.x) * scaleToExportX, (pt.y - cropRect.y) * scaleToExportY);
        }
        ctx.stroke();
      });
      ctx.restore();
    }

    if (shapes.length > 0) {
      shapes.forEach((sh) => {
        const sx = (sh.startX - cropRect.x) * scaleToExportX;
        const sy = (sh.startY - cropRect.y) * scaleToExportY;
        const ex = (sh.endX - cropRect.x) * scaleToExportX;
        const ey = (sh.endY - cropRect.y) * scaleToExportY;
        const shapeLineWidth = sh.width * (cropPixelW / 800);
        ctx.strokeStyle = sh.color;
        ctx.fillStyle = sh.color;
        ctx.lineWidth = shapeLineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        if (sh.type === 'arrow') {
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(ex, ey);
          ctx.stroke();
          const angle = Math.atan2(ey - sy, ex - sx);
          const headLen = Math.max(14, shapeLineWidth * 3.5);
          ctx.beginPath();
          ctx.moveTo(ex, ey);
          ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI / 6), ey - headLen * Math.sin(angle - Math.PI / 6));
          ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI / 6), ey - headLen * Math.sin(angle + Math.PI / 6));
          ctx.closePath();
          ctx.fill();
        } else if (sh.type === 'rect') {
          ctx.beginPath();
          ctx.strokeRect(Math.min(sx, ex), Math.min(sy, ey), Math.abs(ex - sx), Math.abs(ey - sy));
        } else if (sh.type === 'circle') {
          const rx = Math.abs(ex - sx) / 2;
          const ry = Math.abs(ey - sy) / 2;
          const cx = Math.min(sx, ex) + rx;
          const cy = Math.min(sy, ey) + ry;
          ctx.beginPath();
          ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
          ctx.stroke();
        }
      });
    }

    if (textItems.length > 0) {
      textItems.forEach((item) => {
        if (!item.text.trim()) return;
        const tx = (item.x - cropRect.x) * scaleToExportX;
        const ty = (item.y - cropRect.y) * scaleToExportY;
        const fontSize = Math.max(14, Math.round(item.fontSize * (cropPixelW / 800)));
        ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.textBaseline = 'middle';
        const metrics = ctx.measureText(item.text);
        const paddingX = fontSize * 0.45;
        const paddingY = fontSize * 0.25;
        const bgW = metrics.width + paddingX * 2;
        const bgH = fontSize * 1.35;
        if (item.hasBadge) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
          ctx.beginPath();
          ctx.roundRect(tx - bgW / 2, ty - bgH / 2, bgW, bgH, bgH * 0.3);
          ctx.fill();
        }
        ctx.fillStyle = item.color;
        ctx.fillText(item.text, tx - metrics.width / 2, ty);
      });
    }

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
    if (!blob) return false;

    const newUrl = URL.createObjectURL(blob);
    const newImg = new Image();
    newImg.crossOrigin = 'anonymous';
    await new Promise<void>((resolve) => {
      newImg.onload = () => resolve();
      newImg.src = newUrl;
    });

    imageObjRef.current = newImg;
    setCurrentImageUrl(newUrl);
    setImageSize({ width: cropPixelW, height: cropPixelH });
    setCropRect({ x: 0, y: 0, width: 1, height: 1 });
    setRotation(0);
    setStrokes([]);
    setShapes([]);
    setTextItems([]);

    pushHistory({
      imageUrl: newUrl,
      imageSize: { width: cropPixelW, height: cropPixelH },
      cropRect: { x: 0, y: 0, width: 1, height: 1 },
      rotation: 0,
      strokes: [],
      shapes: [],
      textItems: [],
    });

    return true;
  }, [cropRect, rotation, strokes, shapes, textItems, pushHistory]);

  return {
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
    setStrokes,
    currentStroke,
    setCurrentStroke,
    finishStroke,
    shapes,
    setShapes,
    currentShape,
    setCurrentShape,
    finishShape,
    textItems,
    setTextItems,
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
  };
}
