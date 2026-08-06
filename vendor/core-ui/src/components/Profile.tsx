import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { ProfileMobile } from './ProfileMobile';

declare global {
  interface Window {
    wails?: any;
  }
}

export const Profile: React.FC = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [appVersion, setAppVersion] = useState<string>('Loading...');
  const [checking, setChecking] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [updateResult, setUpdateResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string>('');

  const userEmail = localStorage.getItem('user_email') || 'admin@geeksman.com';
  const tenantCode = localStorage.getItem('tenant_code') || 'platform';

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const res = await apiClient.get('/tenant/setup-status');
        if (res.data && res.data.data) {
          setAppVersion(res.data.data.app_version || '1.0.3');
        }
      } catch (err) {
        console.error('Failed to fetch app version', err);
        setAppVersion('1.0.3 (Fallback)');
      }
    };
    fetchVersion();
  }, []);

  const handleCheckUpdates = async () => {
    setChecking(true);
    setError('');
    setUpdateResult(null);
    try {
      const baseUrl = apiClient.defaults.baseURL || '';
      const apiRoot = baseUrl.replace(/\/v1$/, '');
      const res = await apiClient.get(`${apiRoot}/check-updates`);
      if (res.data && res.data.data) {
        setUpdateResult(res.data.data);
        
        if (res.data.data.update_available) {
          showNotification(res.data.data.latest_version);
        }
      }
    } catch (err: any) {
      console.error('Update check failed', err);
      setError('Could not connect to update server. Please try again later.');
    } finally {
      setChecking(false);
    }
  };

  const handleTriggerUpdate = async () => {
    setUpdating(true);
    setError('');
    // Safety timeout: if the app hasn't reloaded in 15s, reset spinner so user can retry
    const safetyTimer = setTimeout(() => {
      setUpdating(false);
      setError('Update is taking longer than expected. Please try again or reload manually.');
    }, 15000);
    try {
      const res = await apiClient.post('/runtime/trigger-update');
      if (res.data && res.data.data) {
        setUpdateSuccessMsg(res.data.data.message || 'Update started.');
      } else {
        setUpdateSuccessMsg('Update process started. The application will close and install the update.');
      }
      // App should reload itself; give it 3 extra seconds before clearing the spinner
      setTimeout(() => {
        clearTimeout(safetyTimer);
        setUpdating(false);
      }, 3000);
    } catch (err: any) {
      clearTimeout(safetyTimer);
      console.error('Update failed to trigger', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error?.message || err.message;
      setError(`Failed to trigger update: ${errMsg}`);
      setUpdating(false);
    }
  };

  const showNotification = (latestVersion: string) => {
    if (!('Notification' in window)) return;
    
    const trigger = () => {
      new Notification('Geeksman OS Update Available', {
        body: `A new version ${latestVersion} is ready to install. Click here to view release details.`,
        icon: '/favicon.png'
      });
    };

    if (Notification.permission === 'granted') {
      trigger();
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') trigger();
      });
    }
  };

  if (isMobile) {
    return <ProfileMobile />;
  }

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#1f2937',
      position: 'relative'
    }}>
      {/* Update Progress Overlay Modal */}
      {updating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2.5rem',
            borderRadius: '16px',
            maxWidth: '450px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid #f3f4f6',
              borderTop: '4px solid #2563eb',
              borderRadius: '50%',
              margin: '0 auto 1.5rem auto',
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>
              Downloading Update...
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.6' }}>
              {updateSuccessMsg || 'Initializing download. Please do not close the application. It will automatically restart to complete the installation.'}
            </p>
          </div>
        </div>
      )}

      {/* Header section with gradient */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        borderRadius: '16px',
        padding: '2.5rem',
        color: '#ffffff',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '2rem'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          border: '3px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          fontWeight: 700
        }}>
          {userEmail[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700 }}>
            {userEmail.split('@')[0]}
          </h1>
          <p style={{ margin: '0.25rem 0 0 0', opacity: 0.8, fontSize: '0.95rem' }}>
            System Administrator (Verified Update v2)
          </p>
        </div>
      </div>

      {/* Grid of panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        
        {/* User Profile Details */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.75rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            👤 Profile Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Email Address</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: '0.2rem', wordBreak: 'break-all' }}>{userEmail}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Workspace Domain</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: '0.2rem' }}>{tenantCode}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>System Roles</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                <span style={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* About Geeksman OS */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.75rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ℹ️ About Geeksman OS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Product Name</span>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e3a8a', marginTop: '0.2rem' }}>Geeksman OS Enterprise</div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Description</span>
              <div style={{ fontSize: '0.8rem', color: '#4b5563', marginTop: '0.2rem', lineHeight: '1.45' }}>
                A premium desktop shell and web client interface providing unified, real-time enterprise app navigation.
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Platform Target</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, marginTop: '0.2rem' }}>
                {window.wails ? '🖥️ Desktop Shell Application' : '🌐 Progressive Web App (PWA)'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Copyright</span>
              <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.2rem' }}>
                © 2026 Geeksman Enterprise.
              </div>
            </div>
          </div>
        </div>

        {/* System & Update details */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '1.75rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚙️ System & Updates
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Current Version</span>
                <div style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>{appVersion}</span>
                  <span style={{
                    backgroundColor: '#def7ec',
                    color: '#03543f',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}>Stable</span>
                </div>
              </div>

              {/* Updates result display */}
              {checking && (
                <div style={{ fontSize: '0.85rem', color: '#4b5563', padding: '0.5rem 0' }}>
                  Checking for new updates...
                </div>
              )}
              {error && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '8px' }}>
                  {error}
                </div>
              )}
              {updateResult && (
                <div style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  backgroundColor: updateResult.update_available ? '#eff6ff' : '#f0fdf4',
                  border: updateResult.update_available ? '1px solid #bfdbfe' : '1px solid #bbf7d0'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: updateResult.update_available ? '#1e40af' : '#166534' }}>
                    {updateResult.update_available ? '🚀 Update Available!' : '✅ Up to Date'}
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: '#4b5563' }}>
                    {updateResult.update_available ? (
                      <div>
                        <div>Version <strong>{updateResult.latest_version}</strong> is available.</div>
                        {updateResult.release_notes && (
                          <div style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            background: '#ffffff',
                            borderRadius: '4px',
                            maxHeight: '80px',
                            overflowY: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem'
                          }}>
                            {updateResult.release_notes}
                          </div>
                        )}
                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <button
                            onClick={handleTriggerUpdate}
                            disabled={updating}
                            style={{
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.4rem 0.8rem',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              cursor: updating ? 'not-allowed' : 'pointer'
                            }}
                          >
                            {updating ? 'Installing...' : '🚀 Update Now'}
                          </button>
                          <a
                            href={updateResult.release_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#2563eb',
                              fontWeight: 600,
                              textDecoration: 'underline',
                              fontSize: '0.75rem'
                            }}
                          >
                            View details
                          </a>
                        </div>
                      </div>
                    ) : (
                      'You are running the latest version of Geeksman OS.'
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleCheckUpdates}
            disabled={checking || updating}
            style={{
              marginTop: '1.5rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.6rem 1.2rem',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: (checking || updating) ? 'not-allowed' : 'pointer',
              opacity: (checking || updating) ? 0.7 : 1,
              transition: 'background-color 0.2s',
              width: '100%'
            }}
            onMouseEnter={(e) => { if (!checking && !updating) e.currentTarget.style.backgroundColor = '#1d4ed8'; }}
            onMouseLeave={(e) => { if (!checking && !updating) e.currentTarget.style.backgroundColor = '#2563eb'; }}
          >
            {checking ? 'Checking...' : '🔄 Check for Updates'}
          </button>
        </div>

      </div>
    </div>
  );
};
