import React, { useEffect, useState } from 'react';
import {
  Location3DIcon,
  Contacts3DIcon,
  Catalogue3DIcon,
  Sales3DIcon,
  PurchaseOrder3DIcon,
  Invoices3DIcon,
  Accounts3DIcon,
  Inventory3DIcon,
  WMS3DIcon,
  CRM3DIcon,
  Chat3DIcon,
  Settings3DIcon,
  Dashboard3DIcon,
  Tenant3DIcon,
  Automations3DIcon,
  HR3DIcon,
  Backupsync3DIcon,
  Pricing3DIcon,
  Requisition3DIcon,
  RFQ3DIcon
} from './icons3d';

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

interface SatelliteApp3D {
  id: string;
  name: string;
  glow: string;
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
  theme = 'dark',
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

  // -------------------------------------------------------------------------
  // ALL 20 3D VOLUMETRIC ICONS SPREAD ACROSS 3 CONCENTRIC GALAXY ORBITS
  // -------------------------------------------------------------------------

  // 1. Inner Orbit (6 Core Master Modules) - Radius: 120px, Size: 44px
  const innerOrbitApps: SatelliteApp3D[] = [
    {
      id: 'locations',
      name: 'Locations & Warehouses',
      glow: 'rgba(16, 185, 129, 0.65)',
      icon: <Location3DIcon size={44} />,
    },
    {
      id: 'catalogue',
      name: 'Product Catalogue',
      glow: 'rgba(236, 72, 153, 0.65)',
      icon: <Catalogue3DIcon size={44} />,
    },
    {
      id: 'accounts',
      name: 'Financial Accounts & Ledgers',
      glow: 'rgba(16, 185, 129, 0.65)',
      icon: <Accounts3DIcon size={44} />,
    },
    {
      id: 'contacts',
      name: 'Contacts & Parties',
      glow: 'rgba(245, 158, 11, 0.65)',
      icon: <Contacts3DIcon size={44} />,
    },
    {
      id: 'invoices',
      name: 'Invoices & Billing',
      glow: 'rgba(6, 182, 212, 0.65)',
      icon: <Invoices3DIcon size={44} />,
    },
    {
      id: 'dashboard',
      name: 'Dashboard Analytics',
      glow: 'rgba(59, 130, 246, 0.65)',
      icon: <Dashboard3DIcon size={44} />,
    },
  ];

  // 2. Middle Orbit (7 Commercial & Ops Modules) - Radius: 195px, Size: 46px
  const middleOrbitApps: SatelliteApp3D[] = [
    {
      id: 'sales',
      name: 'Sales & Quotations',
      glow: 'rgba(244, 63, 94, 0.65)',
      icon: <Sales3DIcon size={46} />,
    },
    {
      id: 'purchase',
      name: 'Purchase Orders',
      glow: 'rgba(37, 99, 235, 0.65)',
      icon: <PurchaseOrder3DIcon size={46} />,
    },
    {
      id: 'inventory',
      name: 'Inventory & Stock Control',
      glow: 'rgba(168, 85, 247, 0.65)',
      icon: <Inventory3DIcon size={46} />,
    },
    {
      id: 'wms',
      name: 'WMS Logistics',
      glow: 'rgba(2, 132, 199, 0.65)',
      icon: <WMS3DIcon size={46} />,
    },
    {
      id: 'crm',
      name: 'CRM & Pipeline',
      glow: 'rgba(14, 165, 233, 0.65)',
      icon: <CRM3DIcon size={46} />,
    },
    {
      id: 'chat',
      name: 'Staff Chat & Comms',
      glow: 'rgba(59, 130, 246, 0.65)',
      icon: <Chat3DIcon size={46} />,
    },
    {
      id: 'pricing',
      name: 'Pricing & Rules',
      glow: 'rgba(244, 63, 94, 0.65)',
      icon: <Pricing3DIcon size={46} />,
    },
  ];

  // 3. Outer Orbit (7 Enterprise & Workflow Modules) - Radius: 270px, Size: 48px
  const outerOrbitApps: SatelliteApp3D[] = [
    {
      id: 'automations',
      name: 'Automations & Rules',
      glow: 'rgba(56, 189, 248, 0.65)',
      icon: <Automations3DIcon size={48} />,
    },
    {
      id: 'settings',
      name: 'System Config',
      glow: 'rgba(148, 163, 184, 0.65)',
      icon: <Settings3DIcon size={48} />,
    },
    {
      id: 'tenant',
      name: 'Tenant Onboarding',
      glow: 'rgba(16, 185, 129, 0.65)',
      icon: <Tenant3DIcon size={48} />,
    },
    {
      id: 'hr',
      name: 'HR & People Hierarchy',
      glow: 'rgba(99, 102, 241, 0.65)',
      icon: <HR3DIcon size={48} />,
    },
    {
      id: 'backupsync',
      name: 'Backupsync & Cloud',
      glow: 'rgba(168, 85, 247, 0.65)',
      icon: <Backupsync3DIcon size={48} />,
    },
    {
      id: 'requisitions',
      name: 'Requisitions & Indents',
      glow: 'rgba(16, 185, 129, 0.65)',
      icon: <Requisition3DIcon size={48} />,
    },
    {
      id: 'rfqs',
      name: 'RFQs & Quotes',
      glow: 'rgba(139, 92, 246, 0.65)',
      icon: <RFQ3DIcon size={48} />,
    },
  ];

  const isLight = theme === 'light';

  // CSS Animations & Keyframes
  const galaxyStyles = `
    @keyframes galaxy-core-pulse {
      0%, 100% {
        transform: scale(1);
        filter: drop-shadow(0 0 28px rgba(59, 130, 246, 0.55));
      }
      50% {
        transform: scale(1.08);
        filter: drop-shadow(0 0 42px rgba(99, 102, 241, 0.8));
      }
    }

    @keyframes galaxy-energy-ring {
      0% {
        transform: scale(0.85);
        opacity: 0.85;
      }
      50% {
        transform: scale(1.22);
        opacity: 0.28;
      }
      100% {
        transform: scale(1.5);
        opacity: 0;
      }
    }

    @keyframes galaxy-orbit-cw {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes galaxy-orbit-ccw {
      from { transform: rotate(360deg); }
      to { transform: rotate(0deg); }
    }

    @keyframes galaxy-counter-cw {
      from { transform: rotate(0deg); }
      to { transform: rotate(-360deg); }
    }

    @keyframes galaxy-counter-ccw {
      from { transform: rotate(-360deg); }
      to { transform: rotate(0deg); }
    }

    @keyframes galaxy-star-twinkle {
      0%, 100% { opacity: 0.2; transform: scale(0.8); }
      50% { opacity: 0.95; transform: scale(1.3); }
    }

    @keyframes galaxy-laser-scan {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(250%); }
    }

    @keyframes galaxy-fade-in {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .galaxy-free-floating-icon {
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), filter 0.25s ease;
    }
    .galaxy-free-floating-icon:hover {
      transform: scale(1.35) !important;
      z-index: 99;
    }
  `;

  // Cosmic Dark Background Configuration
  const bgStyle: React.CSSProperties = fullscreen
    ? {
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 999999,
        backgroundColor: isLight ? '#f8fafc' : '#070a13',
        backgroundImage: isLight
          ? 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%)'
          : 'radial-gradient(circle at 50% 45%, rgba(30, 58, 138, 0.32) 0%, rgba(15, 23, 42, 0.65) 45%, #05070e 85%)',
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
        minHeight: '600px',
        backgroundColor: isLight ? '#f8fafc' : '#070a13',
        backgroundImage: isLight
          ? 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%)'
          : 'radial-gradient(circle at 50% 45%, rgba(30, 58, 138, 0.28) 0%, rgba(15, 23, 42, 0.55) 50%, #05070e 90%)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: "'Outfit', 'Inter', system-ui, -apple-system, sans-serif",
        userSelect: 'none',
      };

  // Concentric Orbit Radii (px)
  const innerRadius = 120;
  const middleRadius = 195;
  const outerRadius = 270;

  const innerOrbitSize = innerRadius * 2;
  const middleOrbitSize = middleRadius * 2;
  const outerOrbitSize = outerRadius * 2;

  // Starfield Dust Particles
  const stars = [
    { top: '6%', left: '12%', size: 2.5, delay: '0.2s' },
    { top: '12%', left: '85%', size: 3, delay: '1.4s' },
    { top: '18%', left: '26%', size: 1.8, delay: '2.1s' },
    { top: '24%', left: '72%', size: 2.2, delay: '0.8s' },
    { top: '75%', left: '14%', size: 3.2, delay: '1.9s' },
    { top: '80%', left: '88%', size: 2.4, delay: '0.5s' },
    { top: '35%', left: '6%', size: 2, delay: '2.8s' },
    { top: '65%', left: '94%', size: 2.8, delay: '1.1s' },
    { top: '88%', left: '30%', size: 2.2, delay: '1.6s' },
    { top: '92%', left: '68%', size: 3.5, delay: '0.3s' },
    { top: '10%', left: '50%', size: 2, delay: '2.4s' },
    { top: '55%', left: '3%', size: 1.5, delay: '1.7s' },
  ];

  return (
    <div style={bgStyle}>
      <style dangerouslySetInnerHTML={{ __html: galaxyStyles }} />

      {/* 1. Celestial Ambient Starfield & Nebula Fields */}
      {!isLight && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: '30%',
              width: '520px',
              height: '520px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.16) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 72%)',
              filter: 'blur(55px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '38%',
              left: '52%',
              width: '450px',
              height: '450px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(236, 72, 153, 0.06) 55%, transparent 72%)',
              filter: 'blur(50px)',
            }}
          />

          {stars.map((star, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                boxShadow: '0 0 10px #93c5fd, 0 0 4px #ffffff',
                animation: 'galaxy-star-twinkle 3.2s ease-in-out infinite',
                animationDelay: star.delay,
              }}
            />
          ))}
        </div>
      )}

      {/* 2. Main Galaxy Revolution System (3 Concentric Orbits) */}
      <div
        style={{
          position: 'relative',
          width: `${outerOrbitSize + 90}px`,
          height: `${outerOrbitSize + 90}px`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${scale})`,
          transition: 'transform 0.3s ease',
          maxWidth: '100vw',
          maxHeight: '75vh',
        }}
      >
        {/* Core Ambient Energy Glow */}
        <div
          style={{
            position: 'absolute',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.14) 0%, rgba(99, 102, 241, 0.05) 55%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.32) 0%, rgba(99, 102, 241, 0.18) 45%, rgba(147, 51, 234, 0.08) 65%, transparent 75%)',
            filter: 'blur(32px)',
            pointerEvents: 'none',
          }}
        />

        {/* ------------------------------------------------------------- */}
        {/* 2A. OUTER ORBIT (7 Apps, Clockwise 48s, Radius: 270px)        */}
        {/* ------------------------------------------------------------- */}
        <div
          style={{
            position: 'absolute',
            width: `${outerOrbitSize}px`,
            height: `${outerOrbitSize}px`,
            borderRadius: '50%',
            border: isLight
              ? '1.5px dashed rgba(99, 102, 241, 0.28)'
              : '1.5px dashed rgba(99, 102, 241, 0.32)',
            boxShadow: isLight
              ? '0 0 16px rgba(99, 102, 241, 0.04)'
              : '0 0 32px rgba(99, 102, 241, 0.12), inset 0 0 32px rgba(99, 102, 241, 0.08)',
            animation: 'galaxy-orbit-cw 48s linear infinite',
            pointerEvents: 'none',
          }}
        >
          {outerOrbitApps.map((app, index) => {
            const angle = (index * 360) / outerOrbitApps.length;
            const rad = (angle * Math.PI) / 180;
            const x = outerRadius + outerRadius * Math.cos(rad) - 24; // 48px / 2 = 24
            const y = outerRadius + outerRadius * Math.sin(rad) - 24;

            return (
              <div
                key={app.id}
                className="galaxy-free-floating-icon"
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'galaxy-counter-cw 48s linear infinite',
                  filter: `drop-shadow(0 12px 24px ${app.glow})`,
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

        {/* ------------------------------------------------------------- */}
        {/* 2B. MIDDLE ORBIT (7 Apps, Counter-Clockwise 34s, Radius: 195px)*/}
        {/* ------------------------------------------------------------- */}
        <div
          style={{
            position: 'absolute',
            width: `${middleOrbitSize}px`,
            height: `${middleOrbitSize}px`,
            borderRadius: '50%',
            border: isLight
              ? '1.5px solid rgba(139, 92, 246, 0.28)'
              : '1.5px solid rgba(139, 92, 246, 0.32)',
            boxShadow: isLight
              ? '0 0 20px rgba(139, 92, 246, 0.05)'
              : '0 0 32px rgba(139, 92, 246, 0.16), inset 0 0 32px rgba(139, 92, 246, 0.1)',
            animation: 'galaxy-orbit-ccw 34s linear infinite',
            pointerEvents: 'none',
          }}
        >
          {middleOrbitApps.map((app, index) => {
            const angle = (index * 360) / middleOrbitApps.length;
            const rad = (angle * Math.PI) / 180;
            const x = middleRadius + middleRadius * Math.cos(rad) - 23; // 46px / 2 = 23
            const y = middleRadius + middleRadius * Math.sin(rad) - 23;

            return (
              <div
                key={app.id}
                className="galaxy-free-floating-icon"
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  width: '46px',
                  height: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'galaxy-counter-ccw 34s linear infinite',
                  filter: `drop-shadow(0 10px 20px ${app.glow})`,
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

        {/* ------------------------------------------------------------- */}
        {/* 2C. INNER ORBIT (6 Apps, Clockwise 22s, Radius: 120px)        */}
        {/* ------------------------------------------------------------- */}
        <div
          style={{
            position: 'absolute',
            width: `${innerOrbitSize}px`,
            height: `${innerOrbitSize}px`,
            borderRadius: '50%',
            border: isLight
              ? '1.5px dashed rgba(59, 130, 246, 0.35)'
              : '1.5px dashed rgba(59, 130, 246, 0.42)',
            boxShadow: isLight
              ? '0 0 20px rgba(59, 130, 246, 0.06)'
              : '0 0 32px rgba(59, 130, 246, 0.2), inset 0 0 32px rgba(59, 130, 246, 0.12)',
            animation: 'galaxy-orbit-cw 22s linear infinite',
            pointerEvents: 'none',
          }}
        >
          {innerOrbitApps.map((app, index) => {
            const angle = (index * 360) / innerOrbitApps.length;
            const rad = (angle * Math.PI) / 180;
            const x = innerRadius + innerRadius * Math.cos(rad) - 22; // 44px / 2 = 22
            const y = innerRadius + innerRadius * Math.sin(rad) - 22;

            return (
              <div
                key={app.id}
                className="galaxy-free-floating-icon"
                style={{
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'galaxy-counter-cw 22s linear infinite',
                  filter: `drop-shadow(0 8px 18px ${app.glow})`,
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

        {/* 2D. EXPANDING NUCLEUS RIPPLES */}
        {!isLight && (
          <>
            <div
              style={{
                position: 'absolute',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '1.5px solid rgba(56, 189, 248, 0.65)',
                animation: 'galaxy-energy-ring 3.6s cubic-bezier(0.16, 1, 0.3, 1) infinite',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '1.5px solid rgba(139, 92, 246, 0.55)',
                animation: 'galaxy-energy-ring 3.6s cubic-bezier(0.16, 1, 0.3, 1) infinite',
                animationDelay: '1.8s',
                pointerEvents: 'none',
              }}
            />
          </>
        )}

        {/* 2E. CENTER NUCLEUS CORE (Geeksman Core Logo Floating in Space) */}
        <div
          style={{
            position: 'relative',
            width: '94px',
            height: '94px',
            borderRadius: '50%',
            background: isLight
              ? 'rgba(255, 255, 255, 0.95)'
              : 'radial-gradient(circle at 35% 35%, #1e293b 0%, #0a0f1d 85%)',
            border: isLight
              ? '2px solid rgba(59, 130, 246, 0.25)'
              : '2px solid rgba(96, 165, 250, 0.45)',
            boxShadow: isLight
              ? '0 10px 25px rgba(37, 99, 235, 0.2)'
              : '0 0 40px rgba(59, 130, 246, 0.5), 0 0 16px rgba(255, 255, 255, 0.1) inset',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            animation: 'galaxy-core-pulse 3.6s ease-in-out infinite',
            cursor: 'default',
          }}
        >
          <img
            src={logoUrl || '/logo.png'}
            alt={appName || 'Geeksman'}
            style={{
              width: '68px',
              height: '68px',
              objectFit: 'contain',
              filter: isLight ? 'none' : 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.7))',
            }}
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src.indexOf('/favicon.png') === -1) {
                target.src = '/favicon.png';
              }
            }}
          />
        </div>
      </div>

      {/* 3. Brand Identity & High-Tech Status Telemetry */}
      <div
        style={{
          marginTop: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.85rem',
          textAlign: 'center',
          maxWidth: '440px',
          padding: '0 1.25rem',
          zIndex: 30,
        }}
      >
        {/* Title with Metallic Sheen */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center' }}>
          <h1
            style={{
              fontSize: '1.55rem',
              fontWeight: 900,
              margin: 0,
              letterSpacing: '0.06em',
              background: isLight
                ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 45%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textTransform: 'uppercase',
              textShadow: isLight ? 'none' : '0 2px 12px rgba(255, 255, 255, 0.15)',
            }}
          >
            {appName}
          </h1>
          {tagline && (
            <p
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#64748b',
                margin: 0,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              {tagline}
            </p>
          )}
        </div>

        {/* Animated Laser Progress Line */}
        <div
          style={{
            width: '180px',
            height: '3px',
            backgroundColor: isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)',
            borderRadius: '9999px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '60px',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, #38bdf8, #818cf8, transparent)',
              borderRadius: '9999px',
              animation: 'galaxy-laser-scan 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
            }}
          />
        </div>

        {/* Live Phased Status Text Pill */}
        <div
          key={activeMessage}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            padding: '0.35rem 0.95rem',
            borderRadius: '9999px',
            backgroundColor: isLight ? 'rgba(241, 245, 249, 0.85)' : 'rgba(15, 23, 42, 0.7)',
            border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            fontSize: '0.84rem',
            fontWeight: 500,
            color: isLight ? '#334155' : '#cbd5e1',
            animation: 'galaxy-fade-in 0.35s ease',
            boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.04)' : '0 4px 12px rgba(0,0,0,0.35)',
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 8px #38bdf8, 0 0 16px #38bdf8',
              display: 'inline-block',
              flexShrink: 0,
            }}
          />
          <span style={{ letterSpacing: '0.01em' }}>{activeMessage}</span>
        </div>
      </div>
    </div>
  );
};
