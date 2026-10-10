import React, { useEffect, useRef } from 'react';
import { GEEKSMAN_LOGO_POINTS, GEEKSMAN_LOGO_ASPECT } from './logoPoints';

export interface GalaxyLoaderProps {
  fullscreen?: boolean;
  appName?: string;
  tagline?: string;
  statusMessage?: string;
  statusList?: string[];
  logoUrl?: string;
  theme?: 'light' | 'dark' | 'cosmic' | 'green';
  backgroundColor?: string;
  minHeight?: string | number;
  style?: React.CSSProperties;
  scale?: number;
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
}

export const GalaxyLoader: React.FC<GalaxyLoaderProps> = ({
  fullscreen = true,
  theme = 'light',
  backgroundColor,
  minHeight,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({ x: -1000, y: -1000, active: false });

  const isGreen = theme === 'green';
  const isLight = theme === 'light';
  const bgColor = backgroundColor || (isGreen ? '#008069' : isLight ? '#ffffff' : '#0a0e17');

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

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.parentElement.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      updateTargetPoints();
    };

    window.addEventListener('resize', handleResize);

    const blueShades = isGreen
      ? ['#ffffff', '#dcfce7', '#25D366', '#4ade80', '#bbf7d0', '#ffffff']
      : isLight
      ? ['#1d4ed8', '#2563eb', '#3b82f6', '#1e40af']
      : ['#60a5fa', '#38bdf8', '#3b82f6', '#93c5fd'];

    const ambientDots = isGreen
      ? ['rgba(255, 255, 255, 0.55)', 'rgba(255, 255, 255, 0.35)', 'rgba(217, 253, 211, 0.45)', 'rgba(255, 255, 255, 0.2)']
      : isLight
      ? ['#0f172a', '#334155', '#64748b', '#94a3b8']
      : ['#475569', '#64748b', '#334155', '#1e293b'];

    let particles: Particle[] = [];

    const getLogoDimensions = () => {
      const cx = width / 2;
      const cy = height / 2;
      const maxWByHeight = (height * 0.72) / GEEKSMAN_LOGO_ASPECT;
      const logoW = Math.min(width * 0.75, Math.min(500, maxWByHeight));
      const logoH = logoW * GEEKSMAN_LOGO_ASPECT;
      return { cx, cy, logoW, logoH };
    };

    const initParticles = () => {
      particles = [];
      const { cx, cy, logoW, logoH } = getLogoDimensions();
      const dotRadius = Math.max(1.2, Math.min(1.45, width / 700));

      // 1. Create shape particles - INITIALLY FULLY FORMED AT LOGO POSITION!
      GEEKSMAN_LOGO_POINTS.forEach(([nx, ny]) => {
        const tx = cx + nx * logoW;
        const ty = cy + ny * logoH;
        const sx = Math.random() * width;
        const sy = Math.random() * height;

        const color = blueShades[Math.floor(Math.random() * blueShades.length)];
        const baseAlpha = 0.8 + Math.random() * 0.2;

        particles.push({
          x: tx, // Formed initially!
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
        });
      });

      // 2. Ambient drifting particles across background
      const ambCount = Math.floor((width * height) / 6000);
      for (let i = 0; i < ambCount; i++) {
        const ax = Math.random() * width;
        const ay = Math.random() * height;
        const isBlue = Math.random() < 0.25;
        const color = isBlue
          ? blueShades[Math.floor(Math.random() * blueShades.length)]
          : ambientDots[Math.floor(Math.random() * ambientDots.length)];
        const baseAlpha = isBlue ? 0.4 : 0.15 + Math.random() * 0.25;

        particles.push({
          x: ax,
          y: ay,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          scatterX: ax,
          scatterY: ay,
          targetX: ax,
          targetY: ay,
          radius: 1.0 + Math.random() * 0.8,
          color,
          alpha: baseAlpha,
          baseAlpha,
          pulseSpeed: 1.0 + Math.random() * 2.0,
          pulsePhase: Math.random() * Math.PI * 2,
          isShape: false,
        });
      }
    };

    const updateTargetPoints = () => {
      const { cx, cy, logoW, logoH } = getLogoDimensions();
      let shapeIdx = 0;
      particles.forEach((p) => {
        if (p.isShape && shapeIdx < GEEKSMAN_LOGO_POINTS.length) {
          const [nx, ny] = GEEKSMAN_LOGO_POINTS[shapeIdx++];
          p.targetX = cx + nx * logoW;
          p.targetY = cy + ny * logoH;
        }
      });
    };

    initParticles();

    let startTime = performance.now();
    const CYCLE_DURATION = 7200; // 7.2s smooth, slow, calm choreographic loop without discrete debounce phases

    const render = (now: number) => {
      const elapsed = now - startTime;
      const cycleTime = elapsed % CYCLE_DURATION;

      // Smooth continuous transitions:
      // 0ms - 2400ms: Formed - Logo is sharply assembled and gently breathing
      // 2400ms - 4100ms: Dispersal - Soft gradual scatter outward
      // 4100ms - 5200ms: Ambient drift - Smooth floating in space
      // 5200ms - 6800ms: Re-creation - Gentle magnetic attraction smoothly glides particles back
      // 6800ms - 7200ms: Settle - Calm settle back into formed logo
      let formWeight = 1;
      if (cycleTime < 2400) {
        formWeight = 1;
      } else if (cycleTime < 4100) {
        const t = (cycleTime - 2400) / 1700;
        formWeight = 1 - Math.sin((t * Math.PI) / 2);
      } else if (cycleTime < 5200) {
        formWeight = 0;
      } else if (cycleTime < 6800) {
        const t = (cycleTime - 5200) / 1600;
        formWeight = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      } else {
        formWeight = 1;
      }

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const mouseDistThreshold = 85;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.isShape) {
          // Gentle breathing when formed
          const breatheX = Math.sin(now * 0.0018 + p.pulsePhase) * (formWeight * 0.9);
          const breatheY = Math.cos(now * 0.0018 + p.pulsePhase) * (formWeight * 0.9);

          const destX = p.scatterX + (p.targetX + breatheX - p.scatterX) * formWeight;
          const destY = p.scatterY + (p.targetY + breatheY - p.scatterY) * formWeight;

          const dx = destX - p.x;
          const dy = destY - p.y;

          // Gentle spring physics with high damping to completely prevent oscillation and bouncing
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
        p.alpha = Math.max(0.1, Math.min(1, p.baseAlpha + blink * 0.25));

        // Draw particle dot
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
    };

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [isLight, isGreen, bgColor]);

  return (
    <div
      style={{
        position: fullscreen ? 'fixed' : 'relative',
        inset: fullscreen ? 0 : 'auto',
        width: '100%',
        height: fullscreen ? '100vh' : '100%',
        minHeight: fullscreen ? '100vh' : (minHeight !== undefined ? minHeight : '360px'),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: bgColor,
        zIndex: fullscreen ? 99999 : 1,
        fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        userSelect: 'none',
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Interactive Geodesic Dome Particles Canvas */}
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
    </div>
  );
};
