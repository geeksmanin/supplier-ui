export type EditorToolMode = 'select' | 'crop' | 'pencil' | 'arrow' | 'rect' | 'circle' | 'text';

export interface SelectedElement {
  kind: 'text' | 'shape' | 'stroke';
  id: string;
}

export interface InlineTextDraft {
  id?: string;
  x: number;
  y: number;
  text: string;
}

export type StrokeWidthPreset = 'fine' | 'medium' | 'bold';

export interface EditorStroke {
  id: string;
  type: 'pencil';
  points: Array<{ x: number; y: number }>;
  color: string;
  width: number;
}

export interface EditorShape {
  id: string;
  type: 'arrow' | 'rect' | 'circle';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  width: number;
}

export interface EditorTextItem {
  id: string;
  type: 'text';
  text: string;
  x: number;
  y: number;
  color: string;
  fontSize: number;
  hasBadge: boolean;
}

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AspectRatioOption = 'free' | 'original' | '1:1' | '4:3' | '16:9';

export interface ImageEditorResult {
  blob: Blob;
  file: File;
  previewUrl: string;
}

export interface ImageEditorModalProps {
  isOpen: boolean;
  imageUrl: string;
  initialFile?: File;
  initialMode?: EditorToolMode;
  fileNamePrefix?: string;
  onClose: () => void;
  onApply: (result: ImageEditorResult) => void;
}
