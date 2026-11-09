import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export const APM3DIcon: React.FC<Icon3DProps> = ({
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
        {/* Soft Radial Ambient Ground Glow */}
        <radialGradient id="apmGroundGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.65" />
          <stop offset="55%" stopColor="#0369A1" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>

        {/* 3D Drop Shadow */}
        <filter id="apmDropShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#0F172A" floodOpacity="0.55" />
        </filter>

        {/* High-Tech Pulse Glow */}
        <filter id="apmPulseGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Gauge Arc Glow */}
        <filter id="apmArcGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#38BDF8" floodOpacity="0.75" />
        </filter>

        {/* 3D Chassis Depth Extrusion */}
        <linearGradient id="apmChassisDepth" x1="24" y1="24" x2="116" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="45%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Monitor Front Bezel */}
        <linearGradient id="apmChassisFront" x1="24" y1="20" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="35%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        {/* Screen Bezel Rim Light */}
        <linearGradient id="apmBezelRim" x1="24" y1="20" x2="116" y2="116" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.7" />
          <stop offset="30%" stopColor="#38BDF8" stopOpacity="0.4" />
          <stop offset="70%" stopColor="#0284C7" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0.8" />
        </linearGradient>

        {/* Obsidian Glass Screen Interior */}
        <linearGradient id="apmScreenGlass" x1="30" y1="26" x2="110" y2="108" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#030712" />
          <stop offset="60%" stopColor="#0B132B" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Realtime Telemetry Pulse Gradient */}
        <linearGradient id="apmPulseGrad" x1="32" y1="70" x2="108" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="30%" stopColor="#00F5FF" />
          <stop offset="65%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Gauge Arc Performance Color Track */}
        <linearGradient id="apmGaugeArcGrad" x1="44" y1="65" x2="96" y2="45" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>

        {/* Precision Needle Gradient */}
        <linearGradient id="apmNeedleGrad" x1="70" y1="65" x2="86" y2="49" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Apple Glass Specular Curvature */}
        <linearGradient id="apmGlassHighlight" x1="70" y1="30" x2="70" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Ground Glow */}
      <ellipse cx="70" cy="134" rx="48" ry="12" fill="url(#apmGroundGlow)" />

      {/* 3D Depth Extrusion (Offset Downwards) */}
      <rect
        x="23"
        y="23"
        width="94"
        height="92"
        rx="24"
        fill="url(#apmChassisDepth)"
        transform="translate(0, 6)"
      />

      {/* Main Front Chassis (Apple Squircle Monitor) */}
      <g filter="url(#apmDropShadow)">
        <rect
          x="23"
          y="23"
          width="94"
          height="92"
          rx="24"
          fill="url(#apmChassisFront)"
          stroke="url(#apmBezelRim)"
          strokeWidth="1.5"
        />
      </g>

      {/* Deep Obsidian Screen Face */}
      <rect
        x="30"
        y="30"
        width="80"
        height="78"
        rx="16"
        fill="url(#apmScreenGlass)"
        stroke="#1E293B"
        strokeWidth="1"
      />

      {/* Telemetry Radar Grid Lines */}
      <line x1="30" y1="52" x2="110" y2="52" stroke="#38BDF8" strokeOpacity="0.1" strokeDasharray="3 3" />
      <line x1="30" y1="69" x2="110" y2="69" stroke="#38BDF8" strokeOpacity="0.14" strokeDasharray="3 3" />
      <line x1="30" y1="86" x2="110" y2="86" stroke="#38BDF8" strokeOpacity="0.1" strokeDasharray="3 3" />
      <line x1="70" y1="30" x2="70" y2="108" stroke="#38BDF8" strokeOpacity="0.1" strokeDasharray="3 3" />

      {/* Tachometer / Performance Gauge Track */}
      <path
        d="M 44 65 A 28 28 0 0 1 96 65"
        fill="none"
        stroke="#1E293B"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M 44 65 A 28 28 0 0 1 88 47"
        fill="none"
        stroke="url(#apmGaugeArcGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        filter="url(#apmArcGlow)"
      />

      {/* Gauge Pivot Hub */}
      <circle cx="70" cy="65" r="5" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
      <circle cx="70" cy="65" r="2.5" fill="#FFFFFF" />

      {/* Speed Needle */}
      <line
        x1="70"
        y1="65"
        x2="85"
        y2="49"
        stroke="url(#apmNeedleGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="85" cy="49" r="1.5" fill="#FFFFFF" />

      {/* Glowing ECG / Telemetry Heartbeat Wave Underglow */}
      <path
        d="M 33 76 L 46 76 L 51 83 L 58 48 L 66 94 L 73 66 L 80 80 L 87 73 L 92 76 L 107 76"
        fill="none"
        stroke="#00F5FF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.45"
        filter="url(#apmPulseGlow)"
      />

      {/* Crisp Foreground Waveform */}
      <path
        d="M 33 76 L 46 76 L 51 83 L 58 48 L 66 94 L 73 66 L 80 80 L 87 73 L 92 76 L 107 76"
        fill="none"
        stroke="url(#apmPulseGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Peak Telemetry Pulse Beacon Ping */}
      <circle cx="58" cy="48" r="6" fill="#38BDF8" opacity="0.25" />
      <circle cx="58" cy="48" r="3.5" fill="#00F5FF" opacity="0.75" />
      <circle cx="58" cy="48" r="1.8" fill="#FFFFFF" />

      {/* Live Status Indicators */}
      <circle cx="44" cy="98" r="2.5" fill="#10B981" />
      <circle cx="44" cy="98" r="4.5" fill="#10B981" opacity="0.3" />
      <circle cx="54" cy="98" r="2.5" fill="#38BDF8" />
      <circle cx="54" cy="98" r="4.5" fill="#38BDF8" opacity="0.3" />
      <circle cx="64" cy="98" r="2.5" fill="#6366F1" />
      <circle cx="64" cy="98" r="4.5" fill="#6366F1" opacity="0.3" />

      {/* Apple Glass Specular Curvature Highlight */}
      <path
        d="M 32 32 C 40 44 60 48 70 48 C 80 48 100 44 108 32 C 100 30 75 30 70 30 C 65 30 40 30 32 32 Z"
        fill="url(#apmGlassHighlight)"
      />
      <circle cx="37" cy="37" r="1.8" fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
};

