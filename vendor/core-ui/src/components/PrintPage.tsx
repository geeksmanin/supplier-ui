import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/client';
import { isDesktopEnvironment } from '../utils/downloader';

export const PrintPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [html, setHtml] = useState<string>('');
  const [css, setCss] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchPrintContent = async () => {
      try {
        const res = await apiClient.get(`/runtime/print-view?token=${token}`);
        const data = res.data?.data !== undefined ? res.data.data : res.data;
        setHtml(data?.html || '');
        setCss(data?.css || '');
      } catch (err) {
        console.error('PrintPage: Failed to fetch print job content', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrintContent();
  }, [searchParams]);

  useEffect(() => {
    if (loading || !html) return;

    const triggerPrint = async () => {
      // Allow DOM repaint to settle before triggering print dialog
      setTimeout(async () => {
        if (isDesktopEnvironment()) {
          try {
            // Dynamically import @wailsio/runtime in desktop context
            const { Window } = await import('@wailsio/runtime');
            await Window.Print();
          } catch (e) {
            console.error('PrintPage: Native Wails Window.Print failed, falling back to browser print', e);
            window.print();
          }
        } else {
          window.print();
        }
      }, 300);
    };

    triggerPrint();
  }, [loading, html]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif', color: '#64748b' }}>
        Loading print template...
      </div>
    );
  }

  if (!html) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif', color: '#ef4444' }}>
        No print job content found or token expired.
      </div>
    );
  }

  return (
    <div className="print-wrapper" style={{ padding: css ? undefined : '16px', display: css ? undefined : 'flex', justifyContent: css ? undefined : 'center', backgroundColor: css ? undefined : '#f1f5f9', minHeight: '100vh' }}>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
      <style>{`
        @media print {
          body, html {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            min-height: 0 !important;
          }
          .print-wrapper {
            padding: 0 !important;
            margin: 0 !important;
            background-color: #ffffff !important;
            min-height: 0 !important;
            height: auto !important;
            display: block !important;
          }
        }
      `}</style>
      <div 
        className="print-container"
        style={css ? undefined : { 
          width: '100%', 
          maxWidth: '800px', 
          backgroundColor: '#ffffff', 
          padding: '24px', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          boxSizing: 'border-box',
          height: 'fit-content'
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
