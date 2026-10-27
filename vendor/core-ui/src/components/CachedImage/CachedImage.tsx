import React from 'react';
import { useCachedMediaUrl } from '../../utils/mediaCache';
import { ResolveMediaOptions } from '../../utils/media';

export interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  options?: ResolveMediaOptions;
  fallback?: React.ReactNode;
}

/**
 * CachedImage is a high-performance image component that retrieves assets from
 * the Universal Enterprise Media Cache (Memory -> CacheStorage -> IndexedDB -> CDN).
 * Renders local Blob URLs synchronously at 0ms when cached, eliminating broken-image flicker.
 */
export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  options,
  fallback,
  alt = '',
  loading = 'lazy',
  ...imgProps
}) => {
  const cachedSrc = useCachedMediaUrl(src, options);

  if (!cachedSrc && fallback) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={cachedSrc || src || ''}
      alt={alt}
      loading={loading}
      {...imgProps}
    />
  );
};
