import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export const ProfileMobile: React.FC = () => {
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
    try {
      const res = await apiClient.post('/runtime/trigger-update');
      if (res.data && res.data.data) {
        setUpdateSuccessMsg(res.data.data.message || 'Update started.');
      } else {
        setUpdateSuccessMsg('Update process started. The application will close and install the update.');
      }
    } catch (err: any) {
      console.error('Update failed to trigger', err);
      const errMsg = err.response?.data?.message || err.response?.data?.error?.message || err.message;
      setError(`Failed to trigger update: ${errMsg}`);
      setUpdating(false);
    }
  };

  return (
    <div style={{
      padding: '1rem',
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
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem 1.5rem',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '320px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #2563eb',
              borderRadius: '50%',
              margin: '0 auto 1.25rem auto',
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>
              Downloading Update...
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#4b5563', lineHeight: '1.5' }}>
              {updateSuccessMsg || 'Initializing download. Please do not close the application. It will automatically restart to complete the installation.'}
            </p>
          </div>
        </div>
      )}

      {/* Header section with gradient */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        borderRadius: '12px',
        padding: '1.5rem',
        color: '#ffffff',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1rem'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.2)',
          border: '2px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 700
        }}>
          {userEmail[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700 }}>
            {userEmail.split('@')[0]}
          </h1>
          <p style={{ margin: '0.2rem 0 0 0', opacity: 0.8, fontSize: '0.85rem' }}>
            System Administrator
          </p>
        </div>
      </div>

      {/* Layout stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* User Profile Details */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '1.25rem',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
            👤 Profile Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Email Address</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, marginTop: '0.1rem', wordBreak: 'break-all' }}>{userEmail}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Workspace Domain</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, marginTop: '0.1rem' }}>{tenantCode}</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>System Roles</span>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                <span style={{
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 600
                }}>Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* About Geeksman OS */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '1.25rem',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
            ℹ️ About Geeksman OS
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Product Name</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e3a8a', marginTop: '0.1rem' }}>Geeksman OS Enterprise</div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Description</span>
              <div style={{ fontSize: '0.75rem', color: '#4b5563', marginTop: '0.1rem', lineHeight: '1.4' }}>
                A premium desktop shell and web client interface providing unified, real-time enterprise app navigation.
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Platform Target</span>
              <div style={{ fontSize: '0.8rem', fontWeight: 500, marginTop: '0.1rem' }}>
                📱 Mobile Interface
              </div>
            </div>
          </div>
        </div>

        {/* System & Update details */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '1.25rem',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem 0' }}>
            ⚙️ System & Updates
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: 600 }}>Current Version</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 500, marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{appVersion}</span>
                <span style={{
                  backgroundColor: '#def7ec',
                  color: '#03543f',
                  padding: '0.05rem 0.3rem',
                  borderRadius: '3px',
                  fontSize: '0.65rem',
                  fontWeight: 600
                }}>Stable</span>
              </div>
            </div>

            {/* Updates result display */}
            {checking && (
              <div style={{ fontSize: '0.8rem', color: '#4b5563', padding: '0.25rem 0' }}>
                Checking for new updates...
              </div>
            )}
            {error && (
              <div style={{ color: '#ef4444', fontSize: '0.8rem', backgroundColor: '#fef2f2', padding: '0.5rem', borderRadius: '6px' }}>
                {error}
              </div>
            )}
            {updateResult && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '6px',
                backgroundColor: updateResult.update_available ? '#eff6ff' : '#f0fdf4',
                border: updateResult.update_available ? '1px solid #bfdbfe' : '1px solid #bbf7d0'
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: updateResult.update_available ? '#1e40af' : '#166534' }}>
                  {updateResult.update_available ? '🚀 Update Available!' : '✅ Up to Date'}
                </div>
                <div style={{ fontSize: '0.75rem', marginTop: '0.2rem', color: '#4b5563' }}>
                  {updateResult.update_available ? (
                    <div>
                      <div>Version <strong>{updateResult.latest_version}</strong> is available.</div>
                      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                          onClick={handleTriggerUpdate}
                          disabled={updating}
                          style={{
                            backgroundColor: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.35rem 0.6rem',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            cursor: updating ? 'not-allowed' : 'pointer',
                            width: '100%'
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
                            fontSize: '0.7rem',
                            textAlign: 'center'
                          }}
                        >
                          View release on GitHub
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

          <button
            onClick={handleCheckUpdates}
            disabled={checking || updating}
            style={{
              marginTop: '1.25rem',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: (checking || updating) ? 'not-allowed' : 'pointer',
              opacity: (checking || updating) ? 0.7 : 1,
              width: '100%'
            }}
          >
            {checking ? 'Checking...' : '🔄 Check for Updates'}
          </button>
        </div>

      </div>
    </div>
  );
};
