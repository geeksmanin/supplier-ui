import React, { useEffect, useRef, useState } from 'react';
import { GEEKSMAN_LOGO_POINTS, GEEKSMAN_LOGO_ASPECT } from './logoPoints';
import { ICON_POINTS } from './iconPoints';

export interface GeeksmanOSLoaderProps {
  fullscreen?: boolean;
  appName?: string;
  tagline?: string;
  statusMessage?: string;
  statusList?: string[];
  theme?: 'cosmic' | 'light' | 'dark' | 'green';
  backgroundColor?: string;
  minHeight?: string | number;
  scale?: number;
  style?: React.CSSProperties;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scatterX: number;
  scatterY: number;
  targetX: number;
  targetY: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
  pulsePhase: number;
  isShape: boolean;
  isCenterLogo?: boolean;
  iconId?: string;
}

interface IconLayoutMeta {
  id: string;
  name: string;
  category: string;
  ring: 1 | 2;
  angle: number;
  glow: string;
}

// 20 modules distributed in a harmonious double-orbit celestial rosette
const ICON_METAS: IconLayoutMeta[] = [
  // Orbit 1: Inner 8 Core Modules (45° spacing)
  { id: 'locations', name: 'Locations & Warehouses', category: 'Inventory Node', ring: 1, angle: 0, glow: '#10B981' },
  { id: 'catalogue', name: 'Product Catalogue', category: 'Master Data', ring: 1, angle: 45, glow: '#EC4899' },
  { id: 'accounts', name: 'Financial Accounts & Ledgers', category: 'Finance Core', ring: 1, angle: 90, glow: '#34D399' },
  { id: 'contacts', name: 'Contacts & Parties', category: 'Entity Hub', ring: 1, angle: 135, glow: '#F59E0B' },
  { id: 'invoices', name: 'Invoices & Billing', category: 'Commercial Ops', ring: 1, angle: 180, glow: '#06B6D4' },
  { id: 'dashboard', name: 'Dashboard Analytics', category: 'Intelligence', ring: 1, angle: 225, glow: '#3B82F6' },
  { id: 'sales', name: 'Sales & Quotations', category: 'Revenue Engine', ring: 1, angle: 270, glow: '#F43F5E' },
  { id: 'purchase', name: 'Purchase Orders', category: 'Procurement', ring: 1, angle: 315, glow: '#60A5FA' },

  // Orbit 2: Outer 12 Enterprise Modules (30° spacing, interleaved by 15° for perfect balance)
  { id: 'inventory', name: 'Inventory & Stock Control', category: 'Stock Matrix', ring: 2, angle: 15, glow: '#C084FC' },
  { id: 'crm', name: 'CRM & Pipeline', category: 'Client Lifecycle', ring: 2, angle: 45 + 15, glow: '#38BDF8' },
  { id: 'chat', name: 'Staff Chat & Comms', category: 'Live Broadcast', ring: 2, angle: 75, glow: '#60A5FA' },
  { id: 'pricing', name: 'Pricing & Rules Engine', category: 'Yield & Margin', ring: 2, angle: 105, glow: '#FB7185' },
  { id: 'wms', name: 'WMS Logistics', category: 'Fulfillment', ring: 2, angle: 135 + 15, glow: '#38BDF8' },
  { id: 'automations', name: 'Automations & Rules', category: 'Event Trigger', ring: 2, angle: 165, glow: '#38BDF8' },
  { id: 'settings', name: 'System Config', category: 'Governance', ring: 2, angle: 195, glow: '#E2E8F0' },
  { id: 'tenant', name: 'Tenant Onboarding', category: 'Organization', ring: 2, angle: 225 + 15, glow: '#34D399' },
  { id: 'hr', name: 'HR & People Hierarchy', category: 'Talent & Teams', ring: 2, angle: 255, glow: '#818CF8' },
  { id: 'backupsync', name: 'Backupsync & Cloud', category: 'Storage Mesh', ring: 2, angle: 285, glow: '#C084FC' },
  { id: 'requisitions', name: 'Requisitions & Indents', category: 'Material Demand', ring: 2, angle: 315 + 15, glow: '#2DD4BF' },
  { id: 'rfqs', name: 'RFQs & Quotes', category: 'Vendor Sourcing', ring: 2, angle: 345, glow: '#A78BFA' },
];

export const GeeksmanOSLoader: React.FC<GeeksmanOSLoaderProps> = ({
  fullscreen = true,
  theme = 'cosmic',
  backgroundColor,
  minHeight,
  scale = 1,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const [hoveredModule, setHoveredModule] = useState<{ name: string; category: string; glow: string; x: number; y: number } | null>(null);

  // Support query param ?theme= override
  const queryTheme = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : window.location.search).get('theme') as 'cosmic' | 'light' | 'dark' | 'green' | null)
    : null;
  const activeTheme = queryTheme || theme;

  const isLight = activeTheme === 'light';
  const isGreen = activeTheme === 'green';

  const defaultBg = isGreen
    ? '#008069'
    : isLight
    ? '#ffffff'
    : activeTheme === 'dark'
    ? '#090d16'
    : '#05070e';

  const containerBg = backgroundColor || defaultBg;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const blueShades = isGreen
      ? ['#ffffff', '#dcfce7', '#25D366', '#4ade80', '#bbf7d0', '#ffffff']
      : isLight
      ? ['#1d4ed8', '#2563eb', '#3b82f6', '#1e40af']
      : ['#60a5fa', '#38bdf8', '#3b82f6', '#93c5fd', '#ffffff'];

    const ambientDots = isGreen
      ? ['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.25)', 'rgba(217, 253, 211, 0.35)', 'rgba(255, 255, 255, 0.15)']
      : isLight
      ? ['#0f172a', '#334155', '#64748b', '#94a3b8']
      : ['#475569', '#64748b', '#334155', '#1e293b'];

    let particles: Particle[] = [];
    let iconCenterPositions: { id: string; name: string; category: string; glow: string; x: number; y: number; radius: number }[] = [];

    const computeLayout = () => {
      const cx = width / 2;
      const cy = height / 2;

      // Ensure the entire galaxy fits inside the screen with generous margins
      const maxOrbit = Math.min(width * 0.42, height * 0.42, 430) * scale;
      const r2 = maxOrbit;
      const r1 = maxOrbit * 0.65;

      // Central logo sits inside inner orbit with clear space
      const logoW = Math.min(r1 * 1.05, 330 * scale);
      const logoH = logoW * GEEKSMAN_LOGO_ASPECT;

      // Icon size tuned for distinct non-overlapping dots
      const iconSize = Math.max(48, Math.min(62, Math.min(width, height) * 0.055)) * scale;

      iconCenterPositions = ICON_METAS.map((meta) => {
        const radius = meta.ring === 1 ? r1 : r2;
        const rad = (meta.angle * Math.PI) / 180;
        return {
          id: meta.id,
          name: meta.name,
          category: meta.category,
          glow: meta.glow,
          x: cx + radius * Math.cos(rad),
          y: cy + radius * Math.sin(rad),
          radius: iconSize / 2,
        };
      });

      return { cx, cy, logoW, logoH, iconSize, r1, r2 };
    };

    const initParticles = () => {
      particles = [];
      const { cx, cy, logoW, logoH, iconSize } = computeLayout();
      const dotRadius = Math.max(1.1, Math.min(1.35, width / 800));

      // 1. Central Geeksman Logo Particles (Classic Sharp Geodesic Dome)
      for (let i = 0; i < GEEKSMAN_LOGO_POINTS.length; i++) {
        const [nx, ny] = GEEKSMAN_LOGO_POINTS[i];
        const tx = cx + nx * logoW;
        const ty = cy + ny * logoH;
        const sx = Math.random() * width;
        const sy = Math.random() * height;

        const color = blueShades[i % blueShades.length];
        const baseAlpha = 0.85 + Math.random() * 0.15;

        particles.push({
          x: tx,
          y: ty,
          vx: 0,
          vy: 0,
          scatterX: sx,
          scatterY: sy,
          targetX: tx,
          targetY: ty,
          radius: dotRadius,
          color,
          alpha: baseAlpha,
          baseAlpha,
          pulseSpeed: 1.2 + Math.random() * 2.0,
          pulsePhase: Math.random() * Math.PI * 2,
          isShape: true,
          isCenterLogo: true,
        });
      }

      // 2. Surrounding 3D Icons Particles (Non-Overlapping Crisp Diamond Halftone)
      const iconDotRadius = dotRadius * 0.95;
      iconCenterPositions.forEach((iconPos) => {
        const rawPts = ICON_POINTS[iconPos.id] || [];
        for (let i = 0; i < rawPts.length; i++) {
          const [nx, ny, hexColor] = rawPts[i];
          const tx = iconPos.x + nx * iconSize * 1.15;
          const ty = iconPos.y + ny * iconSize * 1.15;
          const sx = Math.random() * width;
          const sy = Math.random() * height;

          let finalColor = hexColor;
          if (isGreen) {
            // In green theme, lift dark colors to brilliant white or emerald mint
            if (hexColor === '#000000' || hexColor.startsWith('#0') || hexColor.startsWith('#1')) {
              finalColor = '#dcfce7';
            }
          }

          const baseAlpha = 0.90 + Math.random() * 0.10;

          particles.push({
            x: tx,
            y: ty,
            vx: 0,
            vy: 0,
            scatterX: sx,
            scatterY: sy,
            targetX: tx,
            targetY: ty,
            radius: iconDotRadius,
            color: finalColor,
            alpha: baseAlpha,
            baseAlpha,
            pulseSpeed: 1.4 + Math.random() * 2.2,
            pulsePhase: Math.random() * Math.PI * 2,
            isShape: true,
            isCenterLogo: false,
            iconId: iconPos.id,
          });
        }
      });

      // 3. Ambient Drifting Background Star Dust Particles
      const ambCount = Math.floor((width * height) / 9000);
      for (let i = 0; i < ambCount; i++) {
        const ax = Math.random() * width;
        const ay = Math.random() * height;
        const isBlue = Math.random() < 0.25;
        const color = isBlue
          ? blueShades[Math.floor(Math.random() * blueShades.length)]
          : ambientDots[Math.floor(Math.random() * ambientDots.length)];
        const baseAlpha = isBlue ? 0.35 : 0.12 + Math.random() * 0.20;

        particles.push({
          x: ax,
          y: ay,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          scatterX: ax,
          scatterY: ay,
          targetX: ax,
          targetY: ay,
          radius: 0.9 + Math.random() * 0.7,
          color,
          alpha: baseAlpha,
          baseAlpha,
          pulseSpeed: 1.0 + Math.random() * 2.0,
          pulsePhase: Math.random() * Math.PI * 2,
          isShape: false,
        });
      }
    };

    initParticles();

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.parentElement.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    let startTime = performance.now();
    // 7.4s Choreographic loop: Formed -> Dispersal -> Ambient Drift -> Magnetic Re-creation -> Settle
    const CYCLE_DURATION = 7400;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const cycleTime = elapsed % CYCLE_DURATION;

      // Smooth continuous transitions:
      // 0ms - 2500ms: Formed - Logo & 3D Icons sharply assembled and gently breathing
      // 2500ms - 4200ms: Dispersal - Soft gradual scatter outward across the screen
      // 4200ms - 5400ms: Ambient drift - Weightless floating in space
      // 5400ms - 6900ms: Re-creation - Gentle magnetic gravitational attraction pulls all dots back
      // 6900ms - 7400ms: Settle - Calm settle back into formed universe
      let formWeight = 1;
      if (cycleTime < 2500) {
        formWeight = 1;
      } else if (cycleTime < 4200) {
        const t = (cycleTime - 2500) / 1700;
        formWeight = 1 - Math.sin((t * Math.PI) / 2);
      } else if (cycleTime < 5400) {
        formWeight = 0;
      } else if (cycleTime < 6900) {
        const t = (cycleTime - 5400) / 1500;
        formWeight = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      } else {
        formWeight = 1;
      }

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const mouseDistThreshold = 90;

      // Check cursor proximity to any icon for hover detection
      if (mouse.active && formWeight > 0.7) {
        let foundHover: any = null;
        for (const iconPos of iconCenterPositions) {
          const d = Math.hypot(iconPos.x - mouse.x, iconPos.y - mouse.y);
          if (d < iconPos.radius + 14) {
            foundHover = {
              name: iconPos.name,
              category: iconPos.category,
              glow: iconPos.glow,
              x: iconPos.x,
              y: iconPos.y,
            };
            break;
          }
        }
        setHoveredModule(foundHover);
      } else if (hoveredModule) {
        setHoveredModule(null);
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.isShape) {
          // Gentle breathing harmonic wave when formed
          const breatheX = Math.sin(now * 0.0016 + p.pulsePhase) * (formWeight * 0.7);
          const breatheY = Math.cos(now * 0.0016 + p.pulsePhase) * (formWeight * 0.7);

          const destX = p.scatterX + (p.targetX + breatheX - p.scatterX) * formWeight;
          const destY = p.scatterY + (p.targetY + breatheY - p.scatterY) * formWeight;

          const dx = destX - p.x;
          const dy = destY - p.y;

          // Gentle spring physics with smooth damping to prevent harsh bouncing
          const spring = formWeight > 0.4 ? 0.055 : 0.022;
          const damp = formWeight > 0.4 ? 0.16 : 0.08;
          p.vx += dx * spring - p.vx * damp;
          p.vy += dy * spring - p.vy * damp;
        } else {
          // Ambient background float
          p.vx += (Math.random() - 0.5) * 0.04;
          p.vy += (Math.random() - 0.5) * 0.04;
          p.vx *= 0.96;
          p.vy *= 0.96;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        // Mouse cursor interaction
        if (mouse.active) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.hypot(mdx, mdy);
          if (mdist < mouseDistThreshold && mdist > 0) {
            const force = (1 - mdist / mouseDistThreshold) * 4.0;
            p.vx += (mdx / mdist) * force;
            p.vy += (mdy / mdist) * force;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // Blinking alpha
        const blink = Math.sin(now * 0.003 * p.pulseSpeed + p.pulsePhase);
        p.alpha = Math.max(0.2, Math.min(1, p.baseAlpha + blink * 0.18));

        // Draw particle dot sharply
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const handlePointerLeave = () => {
      mouseRef.current.active = false;
      setHoveredModule(null);
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [isLight, isGreen, containerBg, scale]);

  const bgStyle: React.CSSProperties = {
    position: fullscreen ? 'fixed' : 'relative',
    inset: fullscreen ? 0 : 'auto',
    width: '100%',
    height: fullscreen ? '100vh' : '100%',
    minHeight: fullscreen ? '100vh' : (minHeight !== undefined ? minHeight : '640px'),
    backgroundColor: containerBg,
    backgroundImage: isLight
      ? 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%)'
      : isGreen
      ? 'radial-gradient(circle at 50% 50%, rgba(37, 211, 102, 0.22) 0%, rgba(0, 128, 105, 0.85) 55%, #015c4b 100%)'
      : 'radial-gradient(circle at 50% 50%, rgba(30, 58, 138, 0.32) 0%, rgba(15, 23, 42, 0.7) 45%, #05070e 90%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: fullscreen ? 99999 : 1,
    userSelect: 'none',
    ...style,
  };

  return (
    <div style={bgStyle}>
      {/* Interactive Unified Particle Canvas (Central Geeksman Dome + Surrounding Sharp 3D Icons) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'auto',
          zIndex: 1,
        }}
      />

      {/* Floating Module Tooltip on Cursor Hover */}
      {hoveredModule && (
        <div
          style={{
            position: 'absolute',
            left: `${hoveredModule.x}px`,
            top: `${hoveredModule.y - 36}px`,
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px',
            background: isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${hoveredModule.glow}`,
            borderRadius: '9999px',
            padding: '4px 12px',
            boxShadow: `0 8px 24px rgba(0, 0, 0, 0.45), 0 0 16px ${hoveredModule.glow}`,
            fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif",
          }}
        >
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: isLight ? '#0f172a' : '#f8fafc',
              letterSpacing: '0.04em',
            }}
          >
            {hoveredModule.name}
          </span>
          <span
            style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              color: hoveredModule.glow,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {hoveredModule.category}
          </span>
        </div>
      )}
    </div>
  );
};
