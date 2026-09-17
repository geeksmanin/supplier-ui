import React from 'react';

export interface IntegrationsIconProps {
  width?: string | number;
  height?: string | number;
  size?: number | string;
  style?: React.CSSProperties;
  color?: string;
}

export const IntegrationsIcon: React.FC<IntegrationsIconProps> = ({
  width = '100%',
  height = '100%',
  size,
  style,
}) => {
  const w = size ?? width;
  const h = size ?? height;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 140 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', maxWidth: '100%', maxHeight: '100%', ...style }}
    >
      <defs>
        {/* Soft Ground Glow */}
        <radialGradient id="intBaseGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
          <stop offset="60%" stopColor="#6366F1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1E1B4B" stopOpacity="0" />
        </radialGradient>

        {/* Central Hub 3D Front Gradient */}
        <linearGradient id="intHubFront" x1="40" y1="38" x2="100" y2="98" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="30%" stopColor="#3B82F6" />
          <stop offset="70%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Central Hub 3D Depth Shadow */}
        <linearGradient id="intHubDepth" x1="40" y1="45" x2="100" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E40AF" />
          <stop offset="100%" stopColor="#0B1329" />
        </linearGradient>

        {/* Specular Highlight Streak */}
        <linearGradient id="intHighlight" x1="48" y1="44" x2="92" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>

        {/* Node 1: Emerald Green (Top-Left) */}
        <linearGradient id="intNodeGreen" x1="16" y1="20" x2="48" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6EE7B7" />
          <stop offset="35%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>

        {/* Node 2: Vibrant Pink / Magenta (Top-Right) */}
        <linearGradient id="intNodePink" x1="92" y1="20" x2="124" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="35%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#BE185D" />
        </linearGradient>

        {/* Node 3: Golden Amber (Bottom-Right) */}
        <linearGradient id="intNodeAmber" x1="92" y1="84" x2="124" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        {/* Node 4: Electric Cyan (Bottom-Left) */}
        <linearGradient id="intNodeCyan" x1="16" y1="84" x2="48" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="35%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#0E7490" />
        </linearGradient>

        {/* 3D Connecting Tubes Outer Depth */}
        <linearGradient id="intTubeDepth" x1="20" y1="20" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* 3D Connecting Tubes Lit Surface */}
        <linearGradient id="intTubeLit" x1="20" y1="20" x2="120" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" />
          <stop offset="50%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>

        {/* Drop Shadow for Hub */}
        <filter id="int3DShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0F172A" floodOpacity="0.4" />
        </filter>

        {/* Drop Shadow for Satellite Nodes */}
        <filter id="intNodeShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#0F172A" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* Ground Soft Ambient Glow */}
      <ellipse cx="70" cy="134" rx="48" ry="12" fill="url(#intBaseGlow)" />
      <ellipse cx="70" cy="132" rx="34" ry="7" fill="#3B82F6" opacity="0.3" />

      {/* 3D Extruded Heavy Base Connectors (Tubes) */}
      <g stroke="url(#intTubeDepth)" strokeWidth="12" strokeLinecap="round">
        <line x1="32" y1="42" x2="70" y2="72" />
        <line x1="108" y1="42" x2="70" y2="72" />
        <line x1="108" y1="102" x2="70" y2="72" />
        <line x1="32" y1="102" x2="70" y2="72" />
      </g>

      {/* 3D Lit Foreground Connectors */}
      <g stroke="url(#intTubeLit)" strokeWidth="8" strokeLinecap="round">
        <line x1="32" y1="38" x2="70" y2="68" />
        <line x1="108" y1="38" x2="70" y2="68" />
        <line x1="108" y1="98" x2="70" y2="68" />
        <line x1="32" y1="98" x2="70" y2="68" />
      </g>

      {/* Specular White Line on Connectors */}
      <g stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.75">
        <line x1="32" y1="37" x2="70" y2="67" />
        <line x1="108" y1="37" x2="70" y2="67" />
        <line x1="108" y1="97" x2="70" y2="67" />
        <line x1="32" y1="97" x2="70" y2="67" />
      </g>

      {/* Central Hub 3D Depth Base */}
      <circle cx="70" cy="74" r="28" fill="url(#intHubDepth)" />

      {/* Central Hub 3D Front Sphere */}
      <g filter="url(#int3DShadow)">
        <circle cx="70" cy="68" r="28" fill="url(#intHubFront)" />
      </g>

      {/* Central Hub Specular Flare */}
      <path
        d="M49 57 C53 47 60 42 70 42 C80 42 87 47 91 57 C80 52 60 52 49 57 Z"
        fill="url(#intHighlight)"
      />

      {/* Central Core Inner Rings & Pulse */}
      <circle cx="70" cy="68" r="13" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeDasharray="6 3" opacity="0.9" />
      <circle cx="70" cy="68" r="6" fill="#FFFFFF" opacity="0.95" />

      {/* Satellite Node 1: Top-Left (Emerald Green) */}
      <g filter="url(#intNodeShadow)">
        {/* Depth */}
        <circle cx="32" cy="42" r="17" fill="#064E3B" />
        {/* Front */}
        <circle cx="32" cy="38" r="17" fill="url(#intNodeGreen)" />
        {/* Specular */}
        <ellipse cx="28" cy="32" rx="7" ry="3.5" fill="#FFFFFF" opacity="0.8" />
        <circle cx="32" cy="38" r="4.5" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* Satellite Node 2: Top-Right (Magenta Pink) */}
      <g filter="url(#intNodeShadow)">
        {/* Depth */}
        <circle cx="108" cy="42" r="17" fill="#831843" />
        {/* Front */}
        <circle cx="108" cy="38" r="17" fill="url(#intNodePink)" />
        {/* Specular */}
        <ellipse cx="104" cy="32" rx="7" ry="3.5" fill="#FFFFFF" opacity="0.8" />
        <circle cx="108" cy="38" r="4.5" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* Satellite Node 3: Bottom-Right (Amber Gold) */}
      <g filter="url(#intNodeShadow)">
        {/* Depth */}
        <circle cx="108" cy="102" r="17" fill="#78350F" />
        {/* Front */}
        <circle cx="108" cy="98" r="17" fill="url(#intNodeAmber)" />
        {/* Specular */}
        <ellipse cx="104" cy="92" rx="7" ry="3.5" fill="#FFFFFF" opacity="0.8" />
        <circle cx="108" cy="98" r="4.5" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* Satellite Node 4: Bottom-Left (Electric Cyan) */}
      <g filter="url(#intNodeShadow)">
        {/* Depth */}
        <circle cx="32" cy="102" r="17" fill="#0C4A6E" />
        {/* Front */}
        <circle cx="32" cy="98" r="17" fill="url(#intNodeCyan)" />
        {/* Specular */}
        <ellipse cx="28" cy="92" rx="7" ry="3.5" fill="#FFFFFF" opacity="0.8" />
        <circle cx="32" cy="98" r="4.5" fill="#FFFFFF" opacity="0.95" />
      </g>

      {/* Active Data Packets / Pulses traveling along tubes */}
      <circle cx="51" cy="53" r="3.5" fill="#FFFFFF" opacity="0.95" />
      <circle cx="89" cy="53" r="3.5" fill="#FFFFFF" opacity="0.95" />
      <circle cx="89" cy="83" r="3.5" fill="#FFFFFF" opacity="0.95" />
      <circle cx="51" cy="83" r="3.5" fill="#FFFFFF" opacity="0.95" />
    </svg>
  );
};
