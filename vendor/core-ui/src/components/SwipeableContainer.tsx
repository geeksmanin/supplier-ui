import React, { useRef, useState } from 'react';

export interface SwipeableContainerProps {
  children: React.ReactNode;
  currentPath: string;
  links: string[];
  onNavigate: (path: string) => void;
  getLoadingPlaceholder?: (path: string) => React.ReactNode;
  animationClass?: string;
  style?: React.CSSProperties;
}

export const SwipeableContainer: React.FC<SwipeableContainerProps> = ({
  children,
  currentPath,
  links,
  onNavigate,
  getLoadingPlaceholder,
  animationClass = '',
  style
}) => {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const gestureType = useRef<'none' | 'horizontal' | 'vertical'>('none');
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [targetPath, setTargetPath] = useState<string | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    gestureType.current = 'none';
    setIsDragging(true);
    setTargetPath(null);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const diffX = e.touches[0].clientX - touchStartX.current;
    const diffY = e.touches[0].clientY - touchStartY.current;

    // Detect and lock gesture type
    if (gestureType.current === 'none') {
      if (Math.abs(diffX) > 10 && Math.abs(diffX) > Math.abs(diffY)) {
        gestureType.current = 'horizontal';
      } else if (Math.abs(diffY) > 10) {
        gestureType.current = 'vertical';
      }
    }

    if (gestureType.current === 'horizontal') {
      setDragOffset(diffX);

      // Determine target path
      const currentIndex = links.indexOf(currentPath);
      if (currentIndex !== -1) {
        if (diffX < 0) {
          // Dragging left (next tab)
          const nextIndex = currentIndex + 1;
          if (nextIndex < links.length) {
            setTargetPath(links[nextIndex]);
          } else {
            setTargetPath(null);
          }
        } else {
          // Dragging right (prev tab)
          const prevIndex = currentIndex - 1;
          if (prevIndex >= 0) {
            setTargetPath(links[prevIndex]);
          } else {
            setTargetPath(null);
          }
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    if (gestureType.current === 'horizontal' && Math.abs(diffX) > 100 && Math.abs(diffY) < 60 && targetPath) {
      onNavigate(targetPath);
    }
    setDragOffset(0);
    setTargetPath(null);
    gestureType.current = 'none';
  };

  const renderPlaceholder = (path: string) => {
    if (getLoadingPlaceholder) {
      return getLoadingPlaceholder(path);
    }

    const cleanName = path.replace('/inventory-', '').replace('/', '').toUpperCase();
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.725rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          Loading {cleanName}...
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#e2e8f0', opacity: 0.6 }} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ width: '60%', height: '14px', borderRadius: '4px', backgroundColor: '#e2e8f0', opacity: 0.6 }} />
              <div style={{ width: '40%', height: '10px', borderRadius: '4px', backgroundColor: '#e2e8f0', opacity: 0.6 }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        transform: `translateX(${dragOffset}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.1, 0.9, 0.2, 1)',
        position: 'relative',
        touchAction: 'pan-y',
        ...style
      }}
    >
      {/* Incoming Preview Pane (Left) */}
      {dragOffset > 0 && targetPath && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          backgroundColor: '#f8fafc',
          padding: '1.25rem 1rem',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          {renderPlaceholder(targetPath)}
        </div>
      )}

      {/* Current Page Children Pane */}
      <div 
        key={currentPath}
        className={isDragging ? '' : animationClass}
        style={{
          width: '100%',
          height: '100%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflowY: currentPath.startsWith('/tickets') ? 'hidden' : 'auto'
        }}
      >
        {children}
      </div>

      {/* Incoming Preview Pane (Right) */}
      {dragOffset < 0 && targetPath && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: '100%',
          width: '100%',
          height: '100%',
          backgroundColor: '#f8fafc',
          padding: '1.25rem 1rem',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          {renderPlaceholder(targetPath)}
        </div>
      )}
    </div>
  );
};
