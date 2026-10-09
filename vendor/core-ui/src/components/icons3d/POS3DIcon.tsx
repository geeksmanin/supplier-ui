import React from 'react';
import { Icon3DProps } from './Location3DIcon';

export interface Counter3DIconProps extends Icon3DProps {
  variant?: 'classic' | 'express' | 'kiosk' | 'scanner' | 'retail' | 'cafe' | string;
  counterCode?: string;
}

/**
 * 1. Classic POS Billing Terminal (Blue / Slate Metallic with Cash Drawer & Keypad)
 */
export const CounterClassic3DIcon: React.FC<Icon3DProps> = ({
  width = '100%',
  height = '100%',
  size,
  style
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
        <linearGradient id="cntClassicBody" x1="25" y1="35" x2="115" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="45%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="cntClassicScreen" x1="40" y1="25" x2="100" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        <linearGradient id="cntClassicGlow" x1="45" y1="30" x2="95" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>

        <linearGradient id="cntClassicDrawer" x1="20" y1="105" x2="120" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="cntClassicGold" x1="90" y1="85" x2="125" y2="125" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        <linearGradient id="cntClassicKey" x1="40" y1="75" x2="90" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>

        <linearGradient id="cntClassicReceipt" x1="75" y1="10" x2="105" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        <radialGradient id="cntClassicBase" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2563EB" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#1D4ED8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
        </radialGradient>

        <filter id="cntClassicShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0F172A" floodOpacity="0.35" />
        </filter>
      </defs>

      <ellipse cx="70" cy="138" rx="46" ry="10" fill="url(#cntClassicBase)" />
      <rect x="22" y="105" width="96" height="26" rx="6" fill="url(#cntClassicDrawer)" filter="url(#cntClassicShadow)" />
      <rect x="26" y="112" width="88" height="3" rx="1.5" fill="#475569" />
      <circle cx="70" cy="122" r="3" fill="#64748B" />
      <rect x="69" y="122" width="2" height="3" fill="#0F172A" />

      <path
        d="M28 105 L38 48 C39 45 42 42 45 42 L95 42 C98 42 101 45 102 48 L112 105 Z"
        fill="url(#cntClassicBody)"
      />

      <rect x="36" y="24" width="68" height="38" rx="7" fill="url(#cntClassicScreen)" stroke="#475569" strokeWidth="2" />
      <rect x="41" y="29" width="58" height="28" rx="4" fill="#020617" />
      <rect x="46" y="34" width="28" height="4" rx="2" fill="url(#cntClassicGlow)" />
      <rect x="46" y="42" width="48" height="3" rx="1.5" fill="#38BDF8" opacity="0.65" />
      <rect x="46" y="48" width="36" height="3" rx="1.5" fill="#38BDF8" opacity="0.4" />
      <text x="88" y="38" fill="#34D399" fontSize="6" fontWeight="bold" textAnchor="end" fontFamily="monospace">₹8,450</text>

      <path d="M86 16 L100 16 L100 32 L86 32 Z" fill="url(#cntClassicReceipt)" stroke="#CBD5E1" strokeWidth="0.8" />
      <path d="M86 16 L88 14 L90 16 L92 14 L94 16 L96 14 L98 16 L100 14 L100 16" stroke="#94A3B8" strokeWidth="0.8" fill="none" />
      <rect x="89" y="19" width="8" height="1.5" fill="#94A3B8" />
      <rect x="89" y="22" width="6" height="1.5" fill="#94A3B8" />

      {/* Tactile Keypad */}
      <rect x="42" y="72" width="10" height="7" rx="2" fill="url(#cntClassicKey)" />
      <rect x="56" y="72" width="10" height="7" rx="2" fill="url(#cntClassicKey)" />
      <rect x="70" y="72" width="10" height="7" rx="2" fill="url(#cntClassicKey)" />
      <rect x="84" y="72" width="14" height="7" rx="2" fill="#10B981" />

      <rect x="42" y="82" width="10" height="7" rx="2" fill="url(#cntClassicKey)" />
      <rect x="56" y="82" width="10" height="7" rx="2" fill="url(#cntClassicKey)" />
      <rect x="70" y="82" width="10" height="7" rx="2" fill="url(#cntClassicKey)" />
      <rect x="84" y="82" width="14" height="7" rx="2" fill="#EF4444" />

      <rect x="42" y="92" width="10" height="7" rx="2" fill="url(#cntClassicKey)" />
      <rect x="56" y="92" width="10" height="7" rx="2" fill="url(#cntClassicKey)" />
      <rect x="70" y="92" width="10" height="7" rx="2" fill="url(#cntClassicKey)" />
      <rect x="84" y="92" width="14" height="7" rx="2" fill="#F59E0B" />

      {/* Floating 3D Gold Coin */}
      <g filter="url(#cntClassicShadow)">
        <ellipse cx="106" cy="106" rx="14" ry="14" fill="url(#cntClassicGold)" stroke="#F59E0B" strokeWidth="1.5" />
        <ellipse cx="106" cy="106" rx="10.5" ry="10.5" fill="none" stroke="#FEF3C7" strokeWidth="1" strokeDasharray="2 2" />
        <text x="106" y="110" fill="#78350F" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">₹</text>
      </g>
    </svg>
  );
};

export const POS3DIcon = CounterClassic3DIcon;

/**
 * 2. Express Checkout Counter (Vibrant Amber/Orange with Speed Lightning & Fast Scanner)
 */
export const CounterExpress3DIcon: React.FC<Icon3DProps> = ({
  width = '100%',
  height = '100%',
  size,
  style
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
        <linearGradient id="cntExpBody" x1="20" y1="30" x2="120" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="40%" stopColor="#EA580C" />
          <stop offset="100%" stopColor="#7C2D12" />
        </linearGradient>

        <linearGradient id="cntExpBolt" x1="90" y1="15" x2="125" y2="55" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="50%" stopColor="#FACC15" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>

        <linearGradient id="cntExpScreen" x1="35" y1="25" x2="95" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0B132B" />
        </linearGradient>

        <radialGradient id="cntExpBase" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#EA580C" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#C2410C" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <filter id="cntExpShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#7C2D12" floodOpacity="0.35" />
        </filter>
      </defs>

      <ellipse cx="70" cy="138" rx="46" ry="10" fill="url(#cntExpBase)" />

      {/* Express Plinth Counter */}
      <rect x="20" y="102" width="100" height="28" rx="7" fill="#1C1917" filter="url(#cntExpShadow)" />
      {/* High-speed hazard / stripe accent */}
      <rect x="24" y="108" width="92" height="4" rx="2" fill="#F97316" />
      <rect x="30" y="118" width="16" height="6" rx="3" fill="#22C55E" />
      <text x="38" y="123" fill="#FFFFFF" fontSize="4.5" fontWeight="900" textAnchor="middle">FAST</text>
      <rect x="52" y="118" width="58" height="6" rx="3" fill="#292524" />
      <circle cx="58" cy="121" r="1.5" fill="#22C55E" />
      <circle cx="64" cy="121" r="1.5" fill="#3B82F6" />
      <circle cx="70" cy="121" r="1.5" fill="#EAB308" />

      {/* Angular Fast Counter Terminal */}
      <path
        d="M26 102 L36 46 C37 42 41 39 45 39 L95 39 C99 39 103 42 104 46 L114 102 Z"
        fill="url(#cntExpBody)"
      />

      {/* High Speed Screen */}
      <rect x="35" y="24" width="70" height="38" rx="7" fill="url(#cntExpScreen)" stroke="#FDBA74" strokeWidth="1.5" />
      <rect x="40" y="29" width="60" height="28" rx="4" fill="#030712" />
      {/* Express Check Banner */}
      <rect x="44" y="33" width="34" height="6" rx="3" fill="#15803D" />
      <text x="61" y="38" fill="#DCFCE7" fontSize="4.5" fontWeight="bold" textAnchor="middle">EXPRESS ⚡</text>
      <rect x="44" y="43" width="22" height="3" rx="1.5" fill="#F97316" />
      <rect x="44" y="48" width="36" height="3" rx="1.5" fill="#FDBA74" opacity="0.7" />
      <text x="94" y="48" fill="#4ADE80" fontSize="7" fontWeight="bold" textAnchor="end" fontFamily="monospace">₹450</text>

      {/* Quick Pay Tap Area */}
      <rect x="42" y="72" width="56" height="22" rx="4" fill="#292524" stroke="#44403C" strokeWidth="1" />
      <path d="M52 83 A 6 6 0 0 1 52 75" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M55 85 A 9 9 0 0 1 55 73" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <rect x="64" y="76" width="28" height="13" rx="2" fill="#0284C7" />
      <rect x="67" y="79" width="7" height="4" rx="1" fill="#FDE047" />

      {/* 3D Floating Express Lightning Bolt */}
      <g filter="url(#cntExpShadow)">
        <polygon points="106,12 92,34 102,34 94,54 116,28 104,28" fill="url(#cntExpBolt)" stroke="#EAB308" strokeWidth="1.2" />
      </g>
    </svg>
  );
};

/**
 * 3. Self-Service Kiosk Terminal (Emerald & Teal Glass Vertical Display with Touch & UPI QR)
 */
export const CounterKiosk3DIcon: React.FC<Icon3DProps> = ({
  width = '100%',
  height = '100%',
  size,
  style
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
        <linearGradient id="cntKioskFrame" x1="30" y1="10" x2="110" y2="135" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14B8A6" />
          <stop offset="45%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#115E59" />
        </linearGradient>

        <linearGradient id="cntKioskScreen" x1="42" y1="15" x2="98" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#042F2E" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        <linearGradient id="cntKioskGlow" x1="45" y1="20" x2="95" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>

        <radialGradient id="cntKioskBase" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0D9488" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#115E59" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <filter id="cntKioskShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#042F2E" floodOpacity="0.4" />
        </filter>
      </defs>

      <ellipse cx="70" cy="138" rx="44" ry="9" fill="url(#cntKioskBase)" />

      {/* Solid Stainless Pedestal Stand */}
      <path d="M52 118 L50 134 L90 134 L88 118 Z" fill="#334155" />
      <rect x="42" y="132" width="56" height="7" rx="3.5" fill="#1E293B" stroke="#475569" strokeWidth="1" />

      {/* Tall Vertical Kiosk Body */}
      <rect x="38" y="14" width="64" height="106" rx="9" fill="url(#cntKioskFrame)" filter="url(#cntKioskShadow)" stroke="#2DD4BF" strokeWidth="1.2" />

      {/* Full-Length Glass Touch Surface */}
      <rect x="43" y="19" width="54" height="84" rx="6" fill="url(#cntKioskScreen)" />

      {/* Top Banner & Header */}
      <rect x="47" y="24" width="46" height="8" rx="3" fill="#0D9488" />
      <text x="70" y="30" fill="#CCFBF1" fontSize="5" fontWeight="bold" textAnchor="middle">SELF-CHECKOUT</text>

      {/* Cart Items List Preview on Kiosk Screen */}
      <rect x="48" y="37" width="22" height="18" rx="3" fill="#134E4A" />
      <text x="59" y="48" fill="#5EEAD4" fontSize="9" textAnchor="middle">🛒</text>
      <rect x="73" y="39" width="20" height="3" rx="1.5" fill="#5EEAD4" />
      <rect x="73" y="45" width="14" height="2.5" rx="1" fill="#99F6E4" opacity="0.7" />
      <text x="89" y="53" fill="#2DD4BF" fontSize="5" fontWeight="bold" textAnchor="end">₹1,280</text>

      {/* Interactive UPI QR Code on Screen */}
      <rect x="52" y="60" width="36" height="36" rx="4" fill="#FFFFFF" />
      {/* QR Corner Markers */}
      <rect x="55" y="63" width="10" height="10" fill="#0F172A" />
      <rect x="57" y="65" width="6" height="6" fill="#FFFFFF" />
      <rect x="59" y="67" width="2" height="2" fill="#0F172A" />

      <rect x="75" y="63" width="10" height="10" fill="#0F172A" />
      <rect x="77" y="65" width="6" height="6" fill="#FFFFFF" />
      <rect x="79" y="67" width="2" height="2" fill="#0F172A" />

      <rect x="55" y="83" width="10" height="10" fill="#0F172A" />
      <rect x="57" y="85" width="6" height="6" fill="#FFFFFF" />
      <rect x="59" y="87" width="2" height="2" fill="#0F172A" />

      {/* QR Center Data Dots */}
      <rect x="70" y="69" width="3" height="4" fill="#0F172A" />
      <rect x="75" y="78" width="4" height="4" fill="#0F172A" />
      <rect x="81" y="83" width="4" height="4" fill="#0F172A" />
      <rect x="68" y="81" width="3" height="6" fill="#0D9488" />

      {/* Lower Hardware Slots (Scanner / Card Tap / Receipt) */}
      <rect x="47" y="107" width="46" height="3" rx="1.5" fill="#0F172A" />
      <circle cx="54" cy="114" r="2.5" fill="#10B981" />
      <rect x="62" y="113" width="22" height="2" rx="1" fill="#042F2E" />
    </svg>
  );
};

/**
 * 4. Optical Scanner Counter (Indigo / Purple with Wireless Barcode Scanner Gun & Laser Beam)
 */
export const CounterScanner3DIcon: React.FC<Icon3DProps> = ({
  width = '100%',
  height = '100%',
  size,
  style
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
        <linearGradient id="cntScanBody" x1="20" y1="40" x2="110" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="45%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>

        <linearGradient id="cntScanGun" x1="70" y1="15" x2="125" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#312E81" />
          <stop offset="50%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="cntScanLaser" x1="100" y1="35" x2="25" y2="85" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F87171" stopOpacity="0.1" />
        </linearGradient>

        <radialGradient id="cntScanBase" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#312E81" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <filter id="cntScanShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#1E1B4B" floodOpacity="0.38" />
        </filter>
      </defs>

      <ellipse cx="70" cy="138" rx="46" ry="10" fill="url(#cntScanBase)" />

      {/* Heavy Base Station */}
      <rect x="22" y="104" width="96" height="26" rx="6" fill="#18181B" filter="url(#cntScanShadow)" />
      <rect x="26" y="111" width="88" height="3" rx="1.5" fill="#3F3F46" />
      <circle cx="70" cy="122" r="3" fill="#A855F7" />

      {/* Main Angular Console */}
      <path
        d="M26 104 L34 52 C35 48 38 45 42 45 L90 45 C94 45 97 48 98 52 L106 104 Z"
        fill="url(#cntScanBody)"
      />

      {/* Left Screen for Scanned SKU / Price */}
      <rect x="32" y="49" width="38" height="32" rx="4" fill="#09090B" stroke="#6366F1" strokeWidth="1" />
      <rect x="36" y="54" width="30" height="3" rx="1.5" fill="#A5B4FC" />
      <rect x="36" y="60" width="22" height="2.5" rx="1" fill="#818CF8" opacity="0.7" />
      <text x="66" y="73" fill="#4ADE80" fontSize="6.5" fontWeight="bold" textAnchor="end" fontFamily="monospace">SCAN OK</text>

      {/* 3D Handheld Barcode Scanner Gun mounted on swivel dock */}
      {/* Scanner Gun Handle */}
      <path d="M100 48 L108 82 C109 85 106 88 103 88 L94 88 C91 88 89 85 90 82 L96 48 Z" fill="url(#cntScanGun)" filter="url(#cntScanShadow)" />
      {/* Scanner Gun Head */}
      <path d="M78 32 L112 32 C115 32 118 35 117 39 L115 50 C114 53 111 55 108 55 L82 52 C79 51 77 48 78 45 Z" fill="#4338CA" stroke="#818CF8" strokeWidth="1" />
      {/* Scanner Optical Bezel / Front Window */}
      <rect x="76" y="34" width="4" height="15" rx="2" fill="#DC2626" />

      {/* Vivid Red Laser Beam projecting from scanner nozzle */}
      <polygon points="76,41 24,65 24,78 76,43" fill="url(#cntScanLaser)" />
      <line x1="76" y1="42" x2="24" y2="71" stroke="#EF4444" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* Barcode Lines receiving scan */}
      <g transform="translate(18, 62) rotate(-5)">
        <rect x="0" y="0" width="22" height="18" rx="2" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
        <rect x="2" y="3" width="2" height="12" fill="#000000" />
        <rect x="5" y="3" width="1" height="12" fill="#000000" />
        <rect x="7" y="3" width="3" height="12" fill="#000000" />
        <rect x="11" y="3" width="1" height="12" fill="#000000" />
        <rect x="13" y="3" width="2" height="12" fill="#000000" />
        <rect x="16" y="3" width="1" height="12" fill="#000000" />
        <rect x="18" y="3" width="2" height="12" fill="#000000" />
      </g>
    </svg>
  );
};

/**
 * 5. Modern Tablet / Touchscreen Counter (Sleek iPad Aluminum Stand with Card Puck)
 */
export const CounterRetail3DIcon: React.FC<Icon3DProps> = ({
  width = '100%',
  height = '100%',
  size,
  style
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
        <linearGradient id="cntRetAlum" x1="20" y1="20" x2="110" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F1F5F9" />
          <stop offset="50%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>

        <linearGradient id="cntRetScreen" x1="30" y1="18" x2="105" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        <linearGradient id="cntRetGlow" x1="35" y1="25" x2="100" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        <radialGradient id="cntRetBase" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0284C7" stopOpacity="0.35" />
          <stop offset="70%" stopColor="#0369A1" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <filter id="cntRetShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#334155" floodOpacity="0.3" />
        </filter>
      </defs>

      <ellipse cx="70" cy="138" rx="46" ry="9" fill="url(#cntRetBase)" />

      {/* Retail Wooden Counter Top Plank */}
      <rect x="18" y="112" width="104" height="18" rx="5" fill="#334155" filter="url(#cntRetShadow)" />
      <rect x="22" y="117" width="96" height="2" rx="1" fill="#64748B" />

      {/* Minimalist Aluminum Tablet Stand Foot & Neck */}
      <ellipse cx="64" cy="116" rx="20" ry="6" fill="#94A3B8" />
      <path d="M60 84 L68 84 L67 114 L61 114 Z" fill="url(#cntRetAlum)" />

      {/* Sleek Landscape Tablet Screen tilted back */}
      <g filter="url(#cntRetShadow)">
        <rect x="26" y="24" width="76" height="58" rx="7" fill="url(#cntRetAlum)" stroke="#E2E8F0" strokeWidth="1.2" />
        <rect x="30" y="28" width="68" height="50" rx="4" fill="url(#cntRetScreen)" />

        {/* Modern Flat POS UI on Tablet */}
        <rect x="34" y="33" width="28" height="5" rx="2.5" fill="url(#cntRetGlow)" />
        <rect x="34" y="41" width="34" height="2.5" rx="1.2" fill="#94A3B8" opacity="0.6" />
        <rect x="34" y="46" width="26" height="2.5" rx="1.2" fill="#94A3B8" opacity="0.4" />

        {/* Product Grid Tiles on Screen */}
        <rect x="34" y="53" width="10" height="9" rx="2" fill="#1E293B" />
        <rect x="46" y="53" width="10" height="9" rx="2" fill="#1E293B" />
        <rect x="58" y="53" width="10" height="9" rx="2" fill="#1E293B" />

        {/* Right Panel Cart Summary */}
        <rect x="72" y="33" width="22" height="40" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="0.8" />
        <text x="83" y="40" fill="#94A3B8" fontSize="4.5" textAnchor="middle">TOTAL</text>
        <text x="83" y="50" fill="#38BDF8" fontSize="6.5" fontWeight="bold" textAnchor="middle">₹3,290</text>
        <rect x="75" y="60" width="16" height="8" rx="2" fill="#10B981" />
        <text x="83" y="66" fill="#FFFFFF" fontSize="4.5" fontWeight="bold" textAnchor="middle">CHARGE</text>
      </g>

      {/* Wireless Contactless Payment Puck (Card Reader) on Counter */}
      <g filter="url(#cntRetShadow)">
        <rect x="98" y="98" width="26" height="22" rx="5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
        <rect x="103" y="103" width="16" height="5" rx="1" fill="#0F172A" />
        <circle cx="106" cy="113" r="1.5" fill="#10B981" />
        <circle cx="111" cy="113" r="1.5" fill="#10B981" />
        <circle cx="116" cy="113" r="1.5" fill="#10B981" />
      </g>
    </svg>
  );
};

/**
 * 6. Cafe & Food Order Counter (Warm Rose/Mocha with Steam Cup, Call Bell & Token Screen)
 */
export const CounterCafe3DIcon: React.FC<Icon3DProps> = ({
  width = '100%',
  height = '100%',
  size,
  style
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
        <linearGradient id="cntCafeBody" x1="20" y1="35" x2="115" y2="130" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="45%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#4C0519" />
        </linearGradient>

        <linearGradient id="cntCafeBell" x1="15" y1="80" x2="45" y2="115" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>

        <linearGradient id="cntCafeCup" x1="90" y1="80" x2="125" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E2E8F0" />
        </linearGradient>

        <radialGradient id="cntCafeBase" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E11D48" stopOpacity="0.45" />
          <stop offset="70%" stopColor="#881337" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        <filter id="cntCafeShadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#4C0519" floodOpacity="0.35" />
        </filter>
      </defs>

      <ellipse cx="70" cy="138" rx="46" ry="10" fill="url(#cntCafeBase)" />

      {/* Coffee Bar Counter Base */}
      <rect x="20" y="105" width="100" height="25" rx="6" fill="#292524" filter="url(#cntCafeShadow)" />
      <rect x="24" y="112" width="92" height="3" rx="1.5" fill="#57534E" />

      {/* POS Order Register Console */}
      <path
        d="M32 105 L40 50 C41 46 44 44 48 44 L92 44 C96 44 99 46 100 50 L108 105 Z"
        fill="url(#cntCafeBody)"
      />

      {/* Order Display Screen */}
      <rect x="42" y="26" width="56" height="36" rx="6" fill="#1C1917" stroke="#FDA4AF" strokeWidth="1.2" />
      <rect x="46" y="30" width="48" height="28" rx="3" fill="#0C0A09" />
      <rect x="50" y="34" width="22" height="4" rx="2" fill="#F43F5E" />
      <text x="61" y="37.5" fill="#FFE4E6" fontSize="4.5" fontWeight="bold" textAnchor="middle">ORDER #42</text>
      <text x="89" y="44" fill="#34D399" fontSize="6.5" fontWeight="bold" textAnchor="end">₹680</text>
      <rect x="50" y="48" width="40" height="2.5" rx="1" fill="#78716C" />

      {/* Quick Dish Category Keys */}
      <rect x="46" y="70" width="12" height="8" rx="2" fill="#BE123C" />
      <rect x="62" y="70" width="12" height="8" rx="2" fill="#BE123C" />
      <rect x="78" y="70" width="16" height="8" rx="2" fill="#10B981" />
      <rect x="46" y="82" width="12" height="8" rx="2" fill="#BE123C" />
      <rect x="62" y="82" width="12" height="8" rx="2" fill="#BE123C" />
      <rect x="78" y="82" width="16" height="8" rx="2" fill="#F59E0B" />

      {/* 3D Brass Service Call Bell (Left Counter) */}
      <g filter="url(#cntCafeShadow)">
        <ellipse cx="28" cy="112" rx="9" ry="3" fill="#78350F" />
        <path d="M20 111 C20 102 36 102 36 111 Z" fill="url(#cntCafeBell)" stroke="#F59E0B" strokeWidth="0.8" />
        <rect x="27" y="98" width="2" height="4" fill="#D97706" />
        <circle cx="28" cy="98" r="2.5" fill="#FEF3C7" stroke="#D97706" strokeWidth="0.6" />
      </g>

      {/* 3D Steaming Coffee Mug (Right Counter) */}
      <g filter="url(#cntCafeShadow)">
        <ellipse cx="112" cy="113" rx="10" ry="3.5" fill="#0C0A09" opacity="0.3" />
        <rect x="104" y="96" width="16" height="15" rx="3" fill="url(#cntCafeCup)" stroke="#CBD5E1" strokeWidth="0.8" />
        {/* Mug handle */}
        <path d="M120 99 C124 99 124 107 120 107" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Coffee Heart Aroma */}
        <path d="M109 92 C109 88 111 86 112 84" stroke="#F43F5E" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M115 92 C115 88 113 86 112 84" stroke="#F43F5E" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
};

/**
 * Universal Smart Counter 3D Icon Component
 * Seamlessly selects between the 6 stylized 3D counter logos based on variant or deterministic counter code hash.
 */
export const Counter3DIcon: React.FC<Counter3DIconProps> = ({ variant, counterCode, ...props }) => {
  let selected = variant;
  if (!selected && counterCode) {
    const variants = ['classic', 'express', 'kiosk', 'scanner', 'retail', 'cafe'];
    let hash = 0;
    for (let i = 0; i < counterCode.length; i++) {
      hash = (hash << 5) - hash + counterCode.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % variants.length;
    selected = variants[index];
  }

  switch (selected) {
    case 'express':
      return <CounterExpress3DIcon {...props} />;
    case 'kiosk':
      return <CounterKiosk3DIcon {...props} />;
    case 'scanner':
      return <CounterScanner3DIcon {...props} />;
    case 'retail':
      return <CounterRetail3DIcon {...props} />;
    case 'cafe':
      return <CounterCafe3DIcon {...props} />;
    case 'classic':
    default:
      return <CounterClassic3DIcon {...props} />;
  }
};

/**
 * Standard registry list of 3D Counter Logos for picklists, forms, and preview galleries
 */
export const COUNTER_3D_ICONS_LIST = [
  { id: 'classic', label: 'Classic Billing Terminal', description: 'Traditional register with tactile keypad, cash drawer & gold coins', Component: CounterClassic3DIcon },
  { id: 'express', label: 'Express Checkout', description: 'High-speed checkout with lightning badge & contactless tap', Component: CounterExpress3DIcon },
  { id: 'kiosk', label: 'Self-Service Kiosk', description: 'Vertical glass tower with touch navigation & instant UPI QR', Component: CounterKiosk3DIcon },
  { id: 'scanner', label: 'Optical Scanner Counter', description: 'Ergonomic wireless barcode scanner gun with laser alignment', Component: CounterScanner3DIcon },
  { id: 'retail', label: 'Touchscreen Tablet Counter', description: 'Minimalist aluminum tablet stand with wireless card puck', Component: CounterRetail3DIcon },
  { id: 'cafe', label: 'Cafe & Dining Counter', description: 'Hospitality counter with kitchen bell, order screen & coffee emblem', Component: CounterCafe3DIcon },
];
