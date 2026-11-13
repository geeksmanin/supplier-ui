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

  // If not an image or already smaller than target size (and already target format), return original
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  const targetSizeBytes = maxSizeKB * 1024;
  if (file.size <= targetSizeBytes && (format === file.type || format === 'image/webp')) {
    // If it's already under target size, we still convert to webp if requested and not webp
    if (file.type === format) {
      return file;
    }
  }

  return new Promise<File>((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(file); // Fallback to original on read error
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => resolve(file); // Fallback to original on decode error
      img.onload = async () => {
        try {
          let { width, height } = img;

          // Scale down if dimensions exceed maxWidthOrHeight
          if (width > maxWidthOrHeight || height > maxWidthOrHeight) {
            if (width > height) {
              height = Math.round((height * maxWidthOrHeight) / width);
              width = maxWidthOrHeight;
            } else {
              width = Math.round((width * maxWidthOrHeight) / height);
              height = maxWidthOrHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(file);
            return;
          }

          // Fill white background for transparent images converting to JPEG
          if (format === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Binary search / iterative quality adjustment to stay under maxSizeKB
          let minQuality = 0.1;
          let maxQuality = 0.92;
          let bestBlob: Blob | null = null;

          const getBlob = (quality: number): Promise<Blob | null> => {
            return new Promise((res) => {
              canvas.toBlob((blob) => res(blob), format, quality);
            });
          };

          // Try standard quality first
          let blob = await getBlob(0.8);
          if (blob && blob.size <= targetSizeBytes) {
            bestBlob = blob;
          } else {
            // Iterative search for highest quality under targetSizeBytes
            for (let i = 0; i < 4; i++) {
              const midQuality = (minQuality + maxQuality) / 2;
              blob = await getBlob(midQuality);
              if (blob) {
                if (blob.size <= targetSizeBytes) {
                  bestBlob = blob;
                  minQuality = midQuality; // Try better quality
                } else {
                  maxQuality = midQuality; // Need more compression
                  bestBlob = blob; // Keep as fallback
                }
              }
            }
          }

          if (!bestBlob) {
            resolve(file);
            return;
          }

          // Build new filename with target extension
          const ext = format === 'image/webp' ? '.webp' : format === 'image/jpeg' ? '.jpg' : '.png';
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const newFileName = `${baseName}${ext}`;

          const compressedFile = new File([bestBlob], newFileName, {
            type: format,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
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
