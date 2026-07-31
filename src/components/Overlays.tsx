import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, PanelLeftOpen, Zap } from 'lucide-react';

interface OverlaysProps {
  showInstallBanner: boolean;
  setShowInstallBanner: (show: boolean) => void;
  isIOS: boolean;
  deferredPrompt: any;
  handleInstallClick: () => void;
  showUpdateBanner: boolean;
  handleUpdateApp: () => void;
  isUpdating: boolean;
}

const Overlays: React.FC<OverlaysProps> = ({
  showInstallBanner,
  setShowInstallBanner,
  isIOS,
  deferredPrompt,
  handleInstallClick,
  showUpdateBanner,
  handleUpdateApp,
  isUpdating
}) => {
  return (
    <>
      {/* PWA Update Banner */}
      <AnimatePresence>
        {showUpdateBanner && !isUpdating && (
          <motion.div 
            initial={{ y: 100, opacity: 0, x: '-50%' }} 
            animate={{ y: 0, opacity: 1, x: '-50%' }} 
            exit={{ y: 100, opacity: 0, x: '-50%' }}
            style={{ 
              position: 'fixed', bottom: '110px', left: '50%', 
              background: '#1e293b', 
              color: '#fff', 
              padding: '1.25rem', 
              borderRadius: '24px', 
              zIndex: 30000, 
              display: 'flex', 
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(20px)',
              width: '92%',
              maxWidth: '380px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '44px', height: '44px', 
                background: 'rgba(37, 99, 235, 0.2)', 
                borderRadius: '14px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 0 0 1px rgba(37, 99, 235, 0.3)'
              }}>
                <Zap size={22} color="#2563eb" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 950, fontSize: '1rem', letterSpacing: '0.02em', color: '#fff' }}>New Version Ready</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: 700 }}>Better performance & new features</div>
              </div>
            </div>
            
            <button 
              onClick={handleUpdateApp}
              style={{ 
                background: '#2563eb', 
                color: '#fff', 
                border: 'none', 
                padding: '0.9rem', 
                borderRadius: '16px', 
                fontWeight: 950, 
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                boxShadow: '0 12px 24px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
            >
              UPDATE NOW
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Reload Overlay */}
      <AnimatePresence>
        {isUpdating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: '#0f172a',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2rem',
              textAlign: 'center'
            }}
          >
            <div style={{ position: 'relative' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                style={{
                  width: '80px',
                  height: '80px',
                  border: '4px solid rgba(255,255,255,0.05)',
                  borderTopColor: '#2563eb',
                  borderRadius: '50%'
                }}
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Zap size={24} color="#2563eb" fill="#2563eb" />
              </motion.div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 950, color: '#fff', margin: 0 }}>Syncing Experience</h2>
              <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.02em' }}>Applying the latest updates...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Banner */}
      <AnimatePresence>
        {((deferredPrompt && !isIOS) || isIOS) && showInstallBanner && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 100, opacity: 0 }}
            style={{ 
              position: 'fixed', 
              bottom: '80px', 
              left: '1rem', 
              right: '1rem', 
              zIndex: 3000, 
              background: '#0f172a', 
              color: '#fff', 
              borderRadius: '16px', 
              padding: '0.8rem 1rem', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)', 
              border: '1px solid rgba(255,255,255,0.1)' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.5rem', borderRadius: '10px' }}>
                {isIOS ? <PanelLeftOpen size={20} /> : <Home size={20} />}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>
                  {isIOS ? 'Install on iPhone' : 'Install Portal App'}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                  {isIOS ? 'Tap Share > Add to Home Screen' : 'Fast, reliable & easy access'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {!isIOS && (
                <button 
                  onClick={handleInstallClick} 
                  style={{ 
                    background: '#fff', 
                    color: '#2563eb', 
                    border: 'none', 
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '8px', 
                    fontWeight: 800, 
                    fontSize: '0.75rem', 
                    cursor: 'pointer' 
                  }}
                >
                  Install
                </button>
              )}
              <button 
                onClick={() => setShowInstallBanner(false)} 
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  color: '#fff', 
                  border: 'none', 
                  padding: '0.4rem', 
                  borderRadius: '8px', 
                  cursor: 'pointer' 
                }}
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Overlays;
