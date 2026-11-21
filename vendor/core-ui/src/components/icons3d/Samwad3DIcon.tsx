import React from 'react';

export interface Samwad3DIconProps {
  size?: number | string;
  width?: number | string;
  height?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const Samwad3DIcon: React.FC<Samwad3DIconProps> = ({
  width = '100%',
  height = '100%',
  size,
  className,
  style,
}) => {
  const w = size ?? width;
  const h = size ?? height;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 192 192"
      width={w}
      height={h}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      <image
        href="/samwad-icon-3d.png"
        xlinkHref="/samwad-icon-3d.png"
        width="192"
        height="192"
      />
    </svg>
  );
};
