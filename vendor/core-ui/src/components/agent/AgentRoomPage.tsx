import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { getAgent } from '../../agents/registry';
import { AgentConfig, AgentContext } from '../../agents/types';
import { AgentAvatar } from './AgentAvatar';
import { VerifiedBlueTick } from './VerifiedBlueTick';
import { getCurrentUser } from '../../utils/auth';
import { useToast } from '../Toast/Toast';

export interface AgentRoomPageProps {
  agentId?: string;
  defaultTab?: string;
  onBack?: () => void;
}

export const AgentRoomPage: React.FC<AgentRoomPageProps> = ({
  agentId: propAgentId,
  defaultTab: propDefaultTab,
  onBack: propOnBack,
}) => {
  const params = useParams<{ id?: string; agentId?: string; tab?: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const idToLookup = propAgentId || params.id || params.agentId || '';
  const agent: AgentConfig | undefined = useMemo(() => {
    return getAgent(idToLookup);
  }, [idToLookup]);

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    if (params.tab) return params.tab;
    if (propDefaultTab) return propDefaultTab;
    return agent?.tabs?.[0]?.id || 'chat';
  });

  const currentUser = useMemo(() => {
    return getCurrentUser();
  }, []);

  const agentContext: AgentContext = useMemo(() => {
    return {
      agentId: agent?.id || idToLookup,
      tenantCode: currentUser?.tenantCode || '',
      businessCode: (currentUser as any)?.businessCode || '',
      userEmail: currentUser?.userEmail || '',
      currentUserId: currentUser?.userId || '',
      userName: currentUser?.userName || '',
      navigate,
      showToast: (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
        if (toast && typeof (toast as any)[type] === 'function') {
          (toast as any)[type](msg);
        } else if (toast?.showToast) {
          toast.showToast(msg, type);
        }
      },
    };
  }, [agent, idToLookup, currentUser, navigate, toast]);

  const handleBack = () => {
    if (propOnBack) {
      propOnBack();
    } else {
      navigate(-1);
    }
  };

  const handleNavigateToTab = (tabId: string) => {
    setActiveTabId(tabId);
    if (params.id) {
      navigate(`/agent/${params.id}/${tabId}`, { replace: true });
    }
  };

  if (!agent) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#F0F2F5',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111b21', marginBottom: '8px' }}>
          Agent Not Found
        </h2>
        <p style={{ fontSize: '14px', color: '#667781', marginBottom: '24px' }}>
          The requested agent "{idToLookup}" is not registered.
        </p>
        <button
          onClick={handleBack}
          style={{
            padding: '10px 24px',
            borderRadius: '20px',
            backgroundColor: '#008069',
            color: '#ffffff',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (agent.component) {
    const CustomComponent = agent.component;
    return (
      <CustomComponent
        agent={agent}
        context={agentContext}
        onBack={handleBack}
      />
    );
  }

  const tabs = agent.tabs || [];
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const ActiveComponent = activeTab?.component;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        flex: 1,
        width: '100%',
        backgroundColor: '#EFEAE2',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 1. Header Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#008069',
          color: '#ffffff',
          padding: '10px 16px',
          flexShrink: 0,
          zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <button
            onClick={handleBack}
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '50%',
            }}
            aria-label="Back"
          >
            <ArrowLeft size={22} />
          </button>

          <AgentAvatar
            size={40}
            icon={agent.avatarIcon}
            bg={agent.avatarBg || 'rgba(255,255,255,0.2)'}
            isVerified={agent.isVerified}
          />

          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {agent.name}
              </span>
              {agent.isVerified && <VerifiedBlueTick size={15} />}
            </div>
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.82)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {agent.subtitle || agent.description}
            </span>
          </div>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {agent.headerActions?.map((act) => (
            <button
              key={act.id}
              onClick={() => act.action(agentContext)}
              style={{
                background: 'rgba(255, 255, 255, 0.16)',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(8px)',
              }}
            >
              {act.label}
            </button>
          ))}
        </div>
      </header>

      {/* 2. WhatsApp Navigation Tab Strip (if more than 1 tab) */}
      {agent.tabs.length > 1 && (
        <div
          style={{
            display: 'flex',
            backgroundColor: '#008069',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            flexShrink: 0,
            overflowX: 'auto',
          }}
        >
          {agent.tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => handleNavigateToTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #ffffff' : '3px solid transparent',
                  color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.4px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.18s cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {typeof tab.badgeCount === 'number' && tab.badgeCount > 0 && (
                  <span
                    style={{
                      backgroundColor: '#25D366',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '10px',
                    }}
                  >
                    {tab.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Tab Body */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
          minHeight: 0,
        }}
      >
        {ActiveComponent ? (
          <ActiveComponent
            agent={agent}
            context={agentContext}
            onNavigateToTab={handleNavigateToTab}
          />
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: '#667781' }}>
            No component registered for tab "{activeTabId}".
          </div>
        )}
      </div>
    </div>
  );
};

// Aliases
export const SamwadAgentRoomPage = AgentRoomPage;
