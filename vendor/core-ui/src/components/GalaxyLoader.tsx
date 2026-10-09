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

      // 1. Create shape particles - spawn slightly offset so they snap into logo immediately!
      GEEKSMAN_LOGO_POINTS.forEach(([nx, ny]) => {
        const tx = cx + nx * logoW;
        const ty = cy + ny * logoH;
        
        // Outward radial scatter destination for explosive disruption
        const blastAngle = Math.atan2(ty - cy, tx - cx) + (Math.random() - 0.5) * 0.7;
        const blastDist = Math.max(width, height) * (0.32 + Math.random() * 0.4);
        const sx = cx + Math.cos(blastAngle) * blastDist;
        const sy = cy + Math.sin(blastAngle) * blastDist;

        // Initial offset: rapid inward magnetic converge on mount
        const spawnAngle = Math.random() * Math.PI * 2;
        const spawnDist = 45 + Math.random() * 75;
        const initX = tx + Math.cos(spawnAngle) * spawnDist;
        const initY = ty + Math.sin(spawnAngle) * spawnDist;

        const color = blueShades[Math.floor(Math.random() * blueShades.length)];
        const baseAlpha = 0.85 + Math.random() * 0.15;

        particles.push({
          x: initX,
          y: initY,
          vx: (tx - initX) * 0.09,
          vy: (ty - initY) * 0.09,
          scatterX: sx,
          scatterY: sy,
          targetX: tx,
          targetY: ty,
          radius: dotRadius,
          color,
          alpha: baseAlpha,
          baseAlpha,
          pulseSpeed: 2.0 + Math.random() * 3.0,
          pulsePhase: Math.random() * Math.PI * 2,
          isShape: true,
        });
      });

      // 2. Ambient drifting particles across background
      const ambCount = Math.floor((width * height) / 6500);
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
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          scatterX: ax,
          scatterY: ay,
          targetX: ax,
          targetY: ay,
          radius: 1.0 + Math.random() * 0.8,
          color,
          alpha: baseAlpha,
          baseAlpha,
          pulseSpeed: 1.0 + Math.random() * 2.5,
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
    const CYCLE_DURATION = 2600; // 2.6 second tight & energetic choreographic loop

    const render = (now: number) => {
      const elapsed = now - startTime;
      const cycleTime = elapsed % CYCLE_DURATION;

      // Choreography (Fast payoff so fast page loads immediately feel the style):
      // 0ms - 240ms: Phase 1: FAST CREATION - Rapid inward magnetic snap into formed logo
      // 240ms - 650ms: Phase 2: FORMED LOCK - Crisp illuminated logo presentation
      // 650ms - 1150ms: Phase 3: FAST DISRUPTION - Explosive shatter into cosmic pieces
      // 1150ms - 1750ms: Phase 4: CELESTIAL DRIFT - Swirling pieces in orbit
      // 1750ms - 2200ms: Phase 5: RE-CREATION - Magnetic snap pulling pieces back into logo
      // 2200ms - 2600ms: Phase 6: SETTLE - Settle beat before repeating
      let formWeight = 1;
      if (cycleTime < 240) {
        const t = cycleTime / 240;
        formWeight = Math.min(1, t * (2 - t));
      } else if (cycleTime < 650) {
        formWeight = 1;
      } else if (cycleTime < 1150) {
        const t = (cycleTime - 650) / 500;
        formWeight = Math.max(0, 1 - Math.pow(t, 2.2));
      } else if (cycleTime < 1750) {
        formWeight = 0;
      } else if (cycleTime < 2200) {
        const t = (cycleTime - 1750) / 450;
        formWeight = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      } else {
        formWeight = 1;
      }

      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      const mouseDistThreshold = 85;
      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (p.isShape) {
          // Dynamic destination based on formWeight
          const breatheX = Math.sin(now * 0.003 + p.pulsePhase) * (formWeight * 1.2);
          const breatheY = Math.cos(now * 0.003 + p.pulsePhase) * (formWeight * 1.2);

          const destX = p.scatterX + (p.targetX + breatheX - p.scatterX) * formWeight;
          const destY = p.scatterY + (p.targetY + breatheY - p.scatterY) * formWeight;

          const dx = destX - p.x;
          const dy = destY - p.y;

          // Snappy magnetic springs for fast creation and explosive disruption
          const spring = formWeight > 0.3 ? 0.14 : 0.06;
          const damp = formWeight > 0.3 ? 0.18 : 0.09;
          p.vx += dx * spring - p.vx * damp;
          p.vy += dy * spring - p.vy * damp;

          if (formWeight < 0.25) {
            // Subtle celestial orbital swirl while shattered
            const rx = p.x - cx;
            const ry = p.y - cy;
            p.vx += -ry * 0.0006;
            p.vy += rx * 0.0006;
          }
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
