import React, { useEffect, useRef, useState } from 'react';
import { SAMWAD_LOGO_POINTS, SamwadLogoPoint } from './samwadLogoPoints';

export interface SamwadAppLoaderProps {
  fullscreen?: boolean;
  appName?: string;
  tagline?: string;
  statusMessage?: string;
  statusList?: string[];
  theme?: 'green' | 'cosmic' | 'light' | 'dark';
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
  group?: 'blue' | 'green' | 'white';
}

const DEFAULT_STATUS_LIST = [
  'Connecting to Samvad Realtime Mesh...',
  'Verifying session encryption keys...',
  'Synchronizing conversation threads...',
  'Restoring offline IndexedDB cache...',
  'Live chat ready',
];

export const SamwadAppLoader: React.FC<SamwadAppLoaderProps> = ({
  fullscreen = true,
  appName = 'संवाद Samvad',
  tagline = 'Real-Time Enterprise Collaboration Mesh',
  statusMessage,
  statusList = DEFAULT_STATUS_LIST,
  theme = 'green',
  backgroundColor,
  minHeight,
  scale = 1,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  // Status message rotation
  useEffect(() => {
    if (statusMessage || !statusList || statusList.length === 0) return;
    const interval = setInterval(() => {
      setCurrentStatusIndex((prev) => (prev + 1) % statusList.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [statusMessage, statusList]);

  // Support query param ?theme= override
  const queryTheme = typeof window !== 'undefined'
    ? (new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : window.location.search).get('theme') as 'green' | 'cosmic' | 'light' | 'dark' | null)
    : null;
  const activeTheme = queryTheme || theme;

  const isLight = activeTheme === 'light';
  const isGreen = activeTheme === 'green';
  const isCosmic = activeTheme === 'cosmic';

  const defaultBg = isGreen
    ? '#008069'
    : isLight
    ? '#FFFFFF'
    : isCosmic
    ? '#05070E'
    : '#090D16';

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

    const ambientShades = isGreen
      ? ['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.25)', 'rgba(217, 253, 211, 0.35)', 'rgba(255, 255, 255, 0.15)']
      : isLight
      ? ['#0F172A', '#334155', '#64748B', '#94A3B8']
      : ['#60A5FA', '#34D399', '#38BDF8', '#4ADE80'];

    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      const cx = width / 2;
      // Position logo slightly above vertical center to give room for status text
      const cy = height / 2 - 25;

      const logoDim = Math.min(width * 0.75, height * 0.45, 360) * scale;
      const dotRadius = Math.max(2.2, Math.min(3.8, logoDim * 0.009));

      // 1. Logo Point Particles (Dual Bubble S-geometry)
      for (let i = 0; i < SAMWAD_LOGO_POINTS.length; i++) {
        const pt = SAMWAD_LOGO_POINTS[i];
        const tx = cx + pt.x * logoDim;
        const ty = cy + pt.y * logoDim;

        // Random initial scatter position
        const angle = Math.random() * Math.PI * 2;
        const dist = 80 + Math.random() * Math.max(width, height) * 0.6;
        const sx = cx + Math.cos(angle) * dist;
        const sy = cy + Math.sin(angle) * dist;

        let color = pt.color;
        // In Green theme: tune colors for high contrast against #008069 emerald backdrop
        if (isGreen) {
          if (pt.group === 'blue') {
            color = ['#BAE6FD', '#7DD3FC', '#38BDF8', '#FFFFFF', '#E0F2FE'][Math.floor(Math.random() * 5)];
          } else if (pt.group === 'green') {
            color = ['#A7F3D0', '#6EE7B7', '#34D399', '#FFFFFF', '#D1FAE5'][Math.floor(Math.random() * 5)];
          } else {
            color = '#FFFFFF';
          }
        }

        const baseAlpha = pt.group === 'white' ? 1.0 : 0.88 + Math.random() * 0.12;

        particles.push({
          x: sx,
          y: sy,
          vx: 0,
          vy: 0,
          scatterX: sx,
          scatterY: sy,
          targetX: tx,
          targetY: ty,
          radius: pt.group === 'white' ? dotRadius * 1.25 : dotRadius,
          color,
          alpha: baseAlpha,
          baseAlpha,
          pulseSpeed: 1.5 + Math.random() * 2.0,
          pulsePhase: Math.random() * Math.PI * 2,
          isShape: true,
          group: pt.group,
        });
      }

      // 2. Ambient Drifting Mesh Star Dust Particles
      const ambientCount = Math.floor((width * height) / 10000);
      for (let i = 0; i < ambientCount; i++) {
        const ax = Math.random() * width;
        const ay = Math.random() * height;
        const color = ambientShades[Math.floor(Math.random() * ambientShades.length)];
        const baseAlpha = 0.12 + Math.random() * 0.25;

        particles.push({
          x: ax,
          y: ay,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          scatterX: ax,
          scatterY: ay,
          targetX: ax,
          targetY: ay,
          radius: 1.0 + Math.random() * 1.2,
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

    const startTime = performance.now();
    // 6.0s Smooth choreographic breathing loop
    const CYCLE_DURATION = 6000;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const cycleTime = elapsed % CYCLE_DURATION;

      // Formation transition phase: 0 -> 1.4s assembly
      let assembleFactor = 1;
      if (elapsed < 1400) {
        // Smooth cubic ease-out
        const t = elapsed / 1400;
        assembleFactor = 1 - Math.pow(1 - t, 3);
      }

      // Subtle organic breathing scale
      const breathe = 1 + Math.sin((elapsed / 1200) * Math.PI) * 0.015;

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const mouseDistThreshold = 75;

      const cx = width / 2;
      const cy = height / 2 - 25;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.isShape) {
          // Calculate destination with breathing effect
          const dxToCenter = p.targetX - cx;
          const dyToCenter = p.targetY - cy;
          const currentDestX = cx + dxToCenter * breathe;
          const currentDestY = cy + dyToCenter * breathe;

          // Assemble from scatter position towards target
          const targetX = p.scatterX + (currentDestX - p.scatterX) * assembleFactor;
          const targetY = p.scatterY + (currentDestY - p.scatterY) * assembleFactor;

          // Gentle spring physics
          p.x += (targetX - p.x) * 0.12;
          p.y += (targetY - p.y) * 0.12;

          // Mouse interaction (gentle repulsion)
          if (mouse.active) {
            const mdx = p.x - mouse.x;
            const mdy = p.y - mouse.y;
            const dist = Math.sqrt(mdx * mdx + mdy * mdy);
            if (dist < mouseDistThreshold && dist > 0) {
              const force = (1 - dist / mouseDistThreshold) * 14;
              p.x += (mdx / dist) * force;
              p.y += (mdy / dist) * force;
            }
          }
        } else {
          // Ambient particles drift
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }

        // Shimmering twinkling alpha
        const pulse = Math.sin((now / 1000) * p.pulseSpeed + p.pulsePhase);
        const dynamicAlpha = Math.max(0.08, Math.min(1.0, p.baseAlpha + pulse * 0.18));

        ctx.fillStyle = p.color;
        ctx.globalAlpha = dynamicAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };

    const onMouseLeave = () => {
      mouseRef.current.active = false;
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, [scale, isGreen, isLight, isCosmic]);

  const textColor = isGreen
    ? '#FFFFFF'
    : isLight
    ? '#0F172A'
    : '#F8FAFC';

  const subtextColor = isGreen
    ? 'rgba(255, 255, 255, 0.75)'
    : isLight
    ? '#64748B'
    : '#94A3B8';

  const activeStatus = statusMessage || (statusList && statusList[currentStatusIndex]) || 'Loading...';

  return (
    <div
      style={{
        position: fullscreen ? 'fixed' : 'relative',
        inset: fullscreen ? 0 : undefined,
        width: '100%',
        height: fullscreen ? '100%' : '100%',
        minHeight: minHeight || (fullscreen ? '100vh' : '400px'),
        backgroundColor: containerBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        zIndex: fullscreen ? 99999 : 1,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        userSelect: 'none',
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />

      {/* Foreground Brand & Status Typography */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          marginTop: 'auto',
          marginBottom: fullscreen ? '7vh' : '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          textAlign: 'center',
          padding: '0 20px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: textColor,
            textShadow: isGreen ? '0 2px 10px rgba(0,0,0,0.25)' : 'none',
          }}
        >
          {appName}
        </div>

        {tagline && (
          <div
            style={{
              fontSize: '0.78rem',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: subtextColor,
              opacity: 0.9,
            }}
          >
            {tagline}
          </div>
        )}

        {/* Live Status Pill with Pulsing Indicator */}
        <div
          style={{
            marginTop: 10,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: isGreen ? 'rgba(0, 0, 0, 0.18)' : isLight ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: isGreen ? '1px solid rgba(255, 255, 255, 0.22)' : '1px solid rgba(0, 0, 0, 0.08)',
            padding: '5px 14px',
            borderRadius: '20px',
            fontSize: '0.82rem',
            color: textColor,
            fontWeight: 600,
            transition: 'all 0.3s ease',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: isGreen ? '#4ADE80' : '#25D366',
              boxShadow: isGreen ? '0 0 8px #4ADE80' : '0 0 8px #25D366',
              animation: 'pulse 1.4s ease-in-out infinite',
            }}
          />
          <span>{activeStatus}</span>
        </div>
      </div>
    </div>
  );
};
