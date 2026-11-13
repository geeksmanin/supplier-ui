/**
 * Image compression utility to compress images client-side into WebP (or specified format)
 * under a configurable maximum size in KB (default: 100 KB).
 */

export interface ImageCompressionOptions {
  maxSizeKB?: number;
  format?: 'image/webp' | 'image/jpeg' | 'image/png';
  maxWidthOrHeight?: number;
}

export async function compressImageFile(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<File> {
  const {
    maxSizeKB = 100,
    format = 'image/webp',
    maxWidthOrHeight = 1920,
  } = options;

  // If not an image or SVG, return original
  const isImage = (file.type.startsWith('image/') || /\.(jpe?g|png|webp|heic|heif|avif|bmp|tiff)$/i.test(file.name)) && file.type !== 'image/svg+xml';
  if (!isImage) {
    return file;
  }

  const targetSizeBytes = maxSizeKB * 1024;
  if (file.size <= targetSizeBytes && (format === file.type || format === 'image/webp')) {
    // If it's already under target size, we still convert to webp if requested and not webp
    if (file.type === format) {
      return file;
    }
  }

  // Helper to compress an HTMLImageElement or ImageBitmap onto an adaptively sized canvas
  const compressDrawable = async (
    source: CanvasImageSource,
    origWidth: number,
    origHeight: number
  ): Promise<File> => {
    let width = origWidth;
    let height = origHeight;

    // Initial scale down if dimensions exceed maxWidthOrHeight
    if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
      if (width > height) {
        height = Math.round((height * maxWidthOrHeight) / width);
        width = maxWidthOrHeight;
      } else {
        width = Math.round((width * maxWidthOrHeight) / height);
        height = maxWidthOrHeight;
      }
    }

    let currentWidth = width;
    let currentHeight = height;
    let bestBlob: Blob | null = null;

    // Iterative resolution scale-down loop (up to 3 resolution passes)
    for (let attempt = 0; attempt < 3; attempt++) {
      const canvas = document.createElement('canvas');
      canvas.width = currentWidth;
      canvas.height = currentHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) break;

      // Fill white background for transparent images converting to JPEG
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, currentWidth, currentHeight);
      }

      ctx.drawImage(source, 0, 0, currentWidth, currentHeight);

      const getBlob = (quality: number): Promise<Blob | null> => {
        return new Promise((res) => {
          canvas.toBlob((blob) => res(blob), format, quality);
        });
      };

      // Quality binary search
      let minQuality = 0.05;
      let maxQuality = 0.88;
      let attemptBlob: Blob | null = null;

      let blob = await getBlob(0.7);
      if (blob && blob.size <= targetSizeBytes) {
        attemptBlob = blob;
      } else {
        for (let i = 0; i < 4; i++) {
          const midQuality = (minQuality + maxQuality) / 2;
          blob = await getBlob(midQuality);
          if (blob) {
            if (blob.size <= targetSizeBytes) {
              attemptBlob = blob;
              minQuality = midQuality;
            } else {
              maxQuality = midQuality;
              if (!attemptBlob || blob.size < attemptBlob.size) {
                attemptBlob = blob;
              }
            }
          }
        }
      }

      bestBlob = attemptBlob;
      if (bestBlob && bestBlob.size <= targetSizeBytes) {
        break; // Reached target size under budget!
      }

      // If still exceeding maxSizeKB, downscale resolution by 25% and retry
      currentWidth = Math.round(currentWidth * 0.75);
      currentHeight = Math.round(currentHeight * 0.75);
      if (currentWidth < 480 || currentHeight < 480) {
        break;
      }
    }

    if (!bestBlob) {
      return file;
    }

    const ext = format === 'image/webp' ? '.webp' : format === 'image/jpeg' ? '.jpg' : '.png';
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const newFileName = `${baseName}${ext}`;

    return new File([bestBlob], newFileName, {
      type: format,
      lastModified: Date.now(),
    });
  };

  // Try modern createImageBitmap first (fast, off-main-thread hardware decoding)
  if (typeof window !== 'undefined' && typeof window.createImageBitmap === 'function') {
    try {
      const bitmap = await window.createImageBitmap(file);
      try {
        const compressed = await compressDrawable(bitmap, bitmap.width, bitmap.height);
        return compressed;
      } finally {
        if (typeof bitmap.close === 'function') {
          bitmap.close();
        }
      }
    } catch {
      // Fall through to FileReader + Image element fallback
    }
  }

  // Fallback: FileReader + HTMLImageElement
  return new Promise<File>((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(file);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(file);
      img.onload = async () => {
        try {
          const compressed = await compressDrawable(img, img.width, img.height);
          resolve(compressed);
        } catch (err) {
          console.warn('[imageCompressor] compression error, using original:', err);
          resolve(file);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
