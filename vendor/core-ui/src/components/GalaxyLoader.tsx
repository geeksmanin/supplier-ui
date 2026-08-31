import React, { useEffect, useState } from 'react';

export interface GalaxyLoaderProps {
  fullscreen?: boolean;
  appName?: string;
  tagline?: string;
  statusMessage?: string;
  statusList?: string[];
  logoUrl?: string;
  theme?: 'cosmic' | 'light' | 'dark';
  scale?: number;
}

interface SatelliteApp {
  id: string;
  name: string;
  code: string;
  gradient: string;
  glow: string;
  orbit: 'inner' | 'outer';
  icon: React.ReactNode;
}

export const GalaxyLoader: React.FC<GalaxyLoaderProps> = ({
  fullscreen = true,
  appName = 'Geeksman OS',
  tagline = 'Enterprise Resource Planning',
  statusMessage,
  statusList = [
    'Initializing ecosystem modules...',
    'Connecting workspace...',
    'Synchronizing business registry...',
    'Loading intelligent workflows...',
    'Preparing enterprise dashboard...',
  ],
  logoUrl,
  theme = 'cosmic',
  scale = 1,
}) => {
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  useEffect(() => {
    if (statusList && statusList.length > 1) {
      const interval = setInterval(() => {
        setCurrentStatusIndex((prev) => (prev + 1) % statusList.length);
      }, 2400);
      return () => clearInterval(interval);
    }
  }, [statusList]);

  const activeMessage = statusMessage || (statusList ? statusList[currentStatusIndex] : 'Loading...');

  // 8 Curated Revolving Ecosystem Satellite Apps
  const innerOrbitApps: SatelliteApp[] = [
    {
      id: 'contacts',
      name: 'Contacts & CRM',
      code: 'CRM',
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      glow: 'rgba(59, 130, 246, 0.65)',
      orbit: 'inner',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      id: 'catalogue',
      name: 'Catalogue & Stock',
      code: 'CAT',
      gradient: 'linear-gradient(135deg, #10b981, #047857)',
      glow: 'rgba(16, 185, 129, 0.65)',
      orbit: 'inner',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      ),
    },
    {
      id: 'billing',
      name: 'Billing & Accounts',
      code: 'ACC',
      gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      glow: 'rgba(139, 92, 246, 0.65)',
      orbit: 'inner',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="14" x="2" y="5" rx="2" />
          <line x1="2" x2="22" y1="10" y2="10" />
          <circle cx="7" cy="15" r="1.2" fill="#ffffff" />
        </svg>
      ),
    },
  ];

  const outerOrbitApps: SatelliteApp[] = [
    {
      id: 'sales',
      name: 'Sales & Orders',
      code: 'SLS',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      glow: 'rgba(245, 158, 11, 0.65)',
      orbit: 'outer',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
          <path d="M3 6h18" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
    },
    {
      id: 'purchase',
      name: 'Purchase & RFQ',
      code: 'PUR',
      gradient: 'linear-gradient(135deg, #f43f5e, #be123c)',
      glow: 'rgba(244, 63, 94, 0.65)',
      orbit: 'outer',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      id: 'support',
      name: 'Support & Tickets',
      code: 'TCK',
      gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      glow: 'rgba(6, 182, 212, 0.65)',
      orbit: 'outer',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      ),
    },
    {
      id: 'hr',
      name: 'HR & Staff',
      code: 'HRM',
      gradient: 'linear-gradient(135deg, #14b8a6, #0d9488)',
      glow: 'rgba(20, 184, 166, 0.65)',
      orbit: 'outer',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 21a8.38 8.38 0 0 1 13 0" />
          <polygon points="12 2 15 8 9 8" fill="#ffffff" opacity="0.3" />
        </svg>
      ),
    },
    {
      id: 'tenant',
      name: 'Platform Security',
      code: 'SEC',
      gradient: 'linear-gradient(135deg, #6366f1, #4338ca)',
      glow: 'rgba(99, 102, 241, 0.65)',
      orbit: 'outer',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      ),
    },
  ];

  // CSS Animations & Keyframes
  const galaxyStyles = `
    @keyframes galaxy-core-pulse {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 35px rgba(59, 130, 246, 0.6), 0 0 80px rgba(99, 102, 241, 0.35), inset 0 0 20px rgba(255, 255, 255, 0.3);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 0 55px rgba(99, 102, 241, 0.8), 0 0 110px rgba(59, 130, 246, 0.5), inset 0 0 30px rgba(255, 255, 255, 0.5);
      }
    }

    @keyframes galaxy-orbit-clockwise {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    @keyframes galaxy-orbit-counter-clockwise {
      from {
        transform: rotate(360deg);
      }
      to {
        transform: rotate(0deg);
      }
    }

    @keyframes galaxy-counter-rotate-clockwise {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(-360deg);
      }
    }

    @keyframes galaxy-counter-rotate-counter {
      from {
        transform: rotate(-360deg);
      }
      to {
        transform: rotate(0deg);
      }
    }

    @keyframes galaxy-star-twinkle {
      0%, 100% { opacity: 0.25; transform: scale(0.85); }
      50% { opacity: 0.95; transform: scale(1.3); }
    }

    @keyframes galaxy-progress-shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes galaxy-fade-in {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  const isCosmic = theme === 'cosmic';
  const isDark = theme === 'dark' || isCosmic;

  const bgStyle: React.CSSProperties = fullscreen
    ? {
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundColor: isCosmic ? '#070b14' : isDark ? '#0f172a' : '#f8fafc',
        backgroundImage: isCosmic
          ? 'radial-gradient(circle at 50% 45%, rgba(37, 99, 235, 0.18) 0%, rgba(99, 102, 241, 0.12) 30%, rgba(7, 11, 20, 0.98) 75%)'
          : isDark
          ? 'radial-gradient(circle at 50% 50%, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 1) 100%)'
          : 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
        userSelect: 'none',
      }
    : {
        position: 'relative',
        width: '100%',
        minHeight: '440px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
        userSelect: 'none',
      };

  // Dimensions
  const innerRadius = 100; // px
  const outerRadius = 168; // px
  const innerOrbitSize = innerRadius * 2;
  const outerOrbitSize = outerRadius * 2;

  return (
    <div style={bgStyle}>
      <style dangerouslySetInnerHTML={{ __html: galaxyStyles }} />

      {/* Ambient Celestial Stars Background */}
      {isCosmic && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          {[
            { top: '12%', left: '18%', size: 3, delay: '0s' },
            { top: '22%', left: '78%', size: 2, delay: '1.2s' },
            { top: '75%', left: '25%', size: 3.5, delay: '0.6s' },
            { top: '82%', left: '72%', size: 2.5, delay: '1.8s' },
            { top: '35%', left: '12%', size: 2, delay: '2.4s' },
            { top: '60%', left: '88%', size: 3, delay: '1s' },
            { top: '15%', left: '50%', size: 2, delay: '1.5s' },
            { top: '88%', left: '45%', size: 2.5, delay: '0.3s' },
          ].map((star, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                boxShadow: '0 0 8px #93c5fd',
                animation: `galaxy-star-twinkle 3s ease-in-out infinite`,
                animationDelay: star.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* Main Galaxy System Container */}
      <div
        style={{
          position: 'relative',
          width: `${outerOrbitSize + 60}px`,
          height: `${outerOrbitSize + 60}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${scale})`,
          transition: 'transform 0.3s ease',
        }}
      >
        {/* Deep Galaxy Space Glow Radial Field */}
        <div
          style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(99, 102, 241, 0.1) 50%, transparent 70%)',
            filter: 'blur(20px)',
            pointerEvents: 'none',
          }}
        />

        {/* 1. OUTER ORBIT RING */}
        <div
          style={{
            position: 'absolute',
            width: `${outerOrbitSize}px`,
            height: `${outerOrbitSize}px`,
            borderRadius: '50%',
            border: isDark ? '1.5px dashed rgba(99, 102, 241, 0.28)' : '1.5px dashed rgba(99, 102, 241, 0.35)',
            boxShadow: isDark ? '0 0 20px rgba(99, 102, 241, 0.08), inset 0 0 20px rgba(99, 102, 241, 0.08)' : 'none',
            animation: 'galaxy-orbit-counter-clockwise 32s linear infinite',
            pointerEvents: 'none',
          }}
        >
          {outerOrbitApps.map((app, index) => {
            const angle = (index * 360) / outerOrbitApps.length;
            const rad = (angle * Math.PI) / 180;
            const x = outerRadius + outerRadius * Math.cos(rad) - 22; // 44px / 2 = 22
            const y = outerRadius + outerRadius * Math.sin(rad) - 22;

            return (
              <div
                key={app.id}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  width: '44px',
                  height: '44px',
                  borderRadius: '13px',
                  background: app.gradient,
                  boxShadow: `0 4px 14px ${app.glow}, 0 0 0 1.5px rgba(255, 255, 255, 0.35)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'galaxy-counter-rotate-counter 32s linear infinite',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                }}
                title={app.name}
              >
                {app.icon}
              </div>
            );
          })}
        </div>

        {/* 2. INNER ORBIT RING */}
        <div
          style={{
            position: 'absolute',
            width: `${innerOrbitSize}px`,
            height: `${innerOrbitSize}px`,
            borderRadius: '50%',
            border: isDark ? '1.5px solid rgba(59, 130, 246, 0.35)' : '1.5px solid rgba(59, 130, 246, 0.4)',
            boxShadow: isDark ? '0 0 25px rgba(59, 130, 246, 0.12), inset 0 0 25px rgba(59, 130, 246, 0.12)' : 'none',
            animation: 'galaxy-orbit-clockwise 20s linear infinite',
            pointerEvents: 'none',
          }}
        >
          {innerOrbitApps.map((app, index) => {
            const angle = (index * 360) / innerOrbitApps.length;
            const rad = (angle * Math.PI) / 180;
            const x = innerRadius + innerRadius * Math.cos(rad) - 22;
            const y = innerRadius + innerRadius * Math.sin(rad) - 22;

            return (
              <div
                key={app.id}
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  width: '44px',
                  height: '44px',
                  borderRadius: '13px',
                  background: app.gradient,
                  boxShadow: `0 4px 14px ${app.glow}, 0 0 0 1.5px rgba(255, 255, 255, 0.35)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'galaxy-counter-rotate-clockwise 20s linear infinite',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                }}
                title={app.name}
              >
                {app.icon}
              </div>
            );
          })}
        </div>

        {/* 3. CENTER EPIMETHEUS NUCLEUS (The Sun / Geeksman Core) */}
        <div
          style={{
            position: 'relative',
            width: '88px',
            height: '88px',
            borderRadius: '26px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(240, 245, 255, 0.94) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            border: '2px solid rgba(255, 255, 255, 0.8)',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.7), 0 0 70px rgba(99, 102, 241, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.9)',
            animation: 'galaxy-core-pulse 3.5s ease-in-out infinite',
            cursor: 'default',
            padding: '10px',
          }}
        >
          <img
            src={logoUrl || '/logo.png'}
            alt={appName || 'Geeksman'}
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(37, 99, 235, 0.35))',
            }}
            onError={(e) => {
              // Fallback to favicon or alternative logo path if /logo.png fails
              const target = e.currentTarget;
              if (target.src.indexOf('/favicon.png') === -1) {
                target.src = '/favicon.png';
              }
            }}
          />
        </div>
      </div>

      {/* Brand Identity & Progress Messaging */}
      <div
        style={{
          marginTop: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
          textAlign: 'center',
          maxWidth: '420px',
          padding: '0 1rem',
          zIndex: 10,
        }}
      >
        {/* Title with Gradient Polish */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'center' }}>
          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: 800,
              margin: 0,
              letterSpacing: '0.04em',
              background: isDark
                ? 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)'
                : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
            }}
          >
            {appName}
          </h1>
          {tagline && (
            <p
              style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: isDark ? '#64748b' : '#64748b',
                margin: 0,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {tagline}
            </p>
          )}
        </div>

        {/* Shimmering Progress Bar */}
        <div
          style={{
            width: '200px',
            height: '4px',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            borderRadius: '999px',
            overflow: 'hidden',
            position: 'relative',
            marginTop: '0.25rem',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, #ec4899, transparent)',
              backgroundSize: '200% 100%',
              borderRadius: '999px',
              animation: 'galaxy-progress-shimmer 2s linear infinite',
            }}
          />
        </div>

        {/* Live Phased Status Text */}
        <div
          key={activeMessage}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.86rem',
            fontWeight: 500,
            color: isDark ? '#94a3b8' : '#475569',
            animation: 'galaxy-fade-in 0.4s ease',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              boxShadow: '0 0 8px #3b82f6',
              display: 'inline-block',
            }}
          />
          <span>{activeMessage}</span>
        </div>
      </div>
    </div>
  );
};
