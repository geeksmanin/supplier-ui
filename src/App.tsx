import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider, UIRegistry, PortalConfigModal, HelpGuide } from '@geeksman/core-ui';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { CustomerLayout } from './components/CustomerLayout';
import Overlays from './components/Overlays';

export const App: React.FC = () => {
  const [routes, setRoutes] = useState(() => UIRegistry.getRoutes());
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [showUpdateBanner, setShowUpdateBanner] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const unsubscribe = UIRegistry.subscribe(() => {
      setRoutes([...UIRegistry.getRoutes()]);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobileIOS = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = (window.navigator as any).standalone || window.matchMedia('(display-mode: standalone)').matches;
    setIsIOS(isMobileIOS && !isStandalone);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if ('serviceWorker' in navigator && (!(import.meta as any).env?.PROD || isLocal)) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister().then((success) => {
            if (success) console.log('Successfully unregistered stale local Service Worker');
          });
        }
      });
    }

    if ((import.meta as any).env?.PROD && 'serviceWorker' in navigator && !isLocal) {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then((reg) => {
        // Poll for updates every 5 minutes
        setInterval(() => reg.update().catch(() => { }), 1000 * 60 * 5);

        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setShowUpdateBanner(true);
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowUpdateBanner(true);
              }
            });
          }
        });
      });

    }

    // Request notification permission and subscribe
    if ('Notification' in window && 'serviceWorker' in navigator) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            console.log('Notification permission granted.');
          }
        });
      }
    }

    // Clear application icon badge count
    if ('clearAppBadge' in navigator) {
      navigator.clearAppBadge().catch(() => { });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  const handleUpdateApp = () => {
    setIsUpdating(true);
    if (waitingWorker) {
      let reloaded = false;
      const doReload = () => {
        if (!reloaded) {
          reloaded = true;
          window.location.reload();
        }
      };
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('controllerchange', doReload);
      }
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      // Fallback
      setTimeout(doReload, 1500);
    } else {
      window.location.reload();
    }
  };

  return (
    <ToastProvider>
      <PortalConfigModal />
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          {routes.map((route) => {
            if (route.isProtected) {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute>
                      <CustomerLayout>{route.element}</CustomerLayout>
                    </ProtectedRoute>
                  }
                />
              );
            }
            return (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            );
          })}

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
      <Overlays
        showInstallBanner={showInstallBanner}
        setShowInstallBanner={setShowInstallBanner}
        isIOS={isIOS}
        deferredPrompt={deferredPrompt}
        handleInstallClick={handleInstallClick}
        showUpdateBanner={showUpdateBanner}
        handleUpdateApp={handleUpdateApp}
        isUpdating={isUpdating}
      />
    </ToastProvider>
  );
};

