import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, CheckCheck } from 'lucide-react';
import { AgentConfig, AgentContext, AgentMessage } from '../../agents/types';
import { AgentAvatar } from './AgentAvatar';
import { VerifiedBlueTick } from './VerifiedBlueTick';

export interface AgentChatViewProps {
  agent: AgentConfig;
  context: AgentContext;
  onBack?: () => void;
}

export const AgentChatView: React.FC<AgentChatViewProps> = ({
  agent,
  context,
  onBack,
}) => {
  const [messages, setMessages] = useState<AgentMessage[]>(() => {
    if (agent.initialMessages) {
      return agent.initialMessages(context);
    }
    return [
      {
        id: `welcome-${agent.id}`,
        sender_type: 'agent',
        sender_name: agent.name,
        body: `Hello! I am your ${agent.name}. ${agent.description}`,
        created_at: new Date().toISOString(),
      },
    ];
  });
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || loading) return;

    const userMsg: AgentMessage = {
      id: `user-${Date.now()}`,
      sender_type: 'user',
      sender_name: context?.userName || 'You',
      body: textToSend,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');
    setLoading(true);

    try {
      if (agent.onUserMessage) {
        const response = await agent.onUserMessage(textToSend, context);
        if (Array.isArray(response)) {
          setMessages((prev) => [...prev, ...response]);
        } else if (response) {
          setMessages((prev) => [...prev, response]);
        }
      } else {
        // Fallback default reply
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `agent-${Date.now()}`,
              sender_type: 'agent',
              sender_name: agent.name,
              body: `Thank you for your message. I am processing: "${textToSend}".`,
              created_at: new Date().toISOString(),
            },
          ]);
        }, 500);
      }
    } catch (err: any) {
      console.warn('Agent message handler error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender_type: 'agent',
          sender_name: agent.name,
          body: 'I apologize, but I encountered an issue processing your request. Please try again.',
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: '#efeae2',
        backgroundImage: 'radial-gradient(rgba(0,0,0,0.035) 1px, transparent 0)',
        backgroundSize: '16px 16px',
        overflow: 'hidden',
        position: 'relative',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 1. WhatsApp Chat Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#008069',
          color: '#ffffff',
          padding: '10px 16px',
          flexShrink: 0,
          zIndex: 40,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
              }}
              aria-label="Back to chats"
            >
              <ArrowLeft size={22} />
            </button>
          )}

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
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {agent.name}
              </span>
              {agent.isVerified && <VerifiedBlueTick size={14} />}
            </div>
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.85)',
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
        {agent.headerActions && agent.headerActions.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {agent.headerActions.map((act) => (
              <button
                key={act.id}
                onClick={() => act.action(context)}
                style={{
                  background: 'rgba(255, 255, 255, 0.16)',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  color: '#ffffff',
                  padding: '5px 12px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {act.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* 2. Quick Prompts Chips Bar */}
      {agent.quickPrompts && agent.quickPrompts.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '8px 14px',
            overflowX: 'auto',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            scrollbarWidth: 'none',
            flexShrink: 0,
            zIndex: 10,
          }}
        >
          {agent.quickPrompts.map((qp) => (
            <button
              key={qp.id}
              onClick={() => handleSend(qp.prompt)}
              style={{
                padding: '6px 12px',
                borderRadius: '16px',
                backgroundColor: '#f0f2f5',
                border: '1px solid #e2e8f0',
                color: '#111b21',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f2f5';
              }}
            >
              {qp.icon}
              <span>{qp.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* 3. Messages Feed */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender_type === 'user';

          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                backgroundColor: isUser ? '#d9fdd3' : '#ffffff',
                borderRadius: '14px',
                borderTopRightRadius: isUser ? '2px' : '14px',
                borderTopLeftRadius: isUser ? '14px' : '2px',
                padding: '10px 14px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
              }}
            >
              {!isUser && (
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#008069' }}>
                  {msg.sender_name}
                </div>
              )}

              <div style={{ fontSize: '14px', color: '#111b21', lineHeight: 1.45 }}>
                {msg.body}
              </div>

              {/* Embedded Interactive Card */}
              {msg.card && agent.renderCard && (
                <div style={{ marginTop: '4px' }}>
                  {agent.renderCard(msg.card, context, handleSend)}
                </div>
              )}

              <div
                style={{
                  fontSize: '10px',
                  color: '#667781',
                  alignSelf: 'flex-end',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '2px',
                }}
              >
                <span>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isUser && <CheckCheck size={14} color="#53bdeb" />}
              </div>
            </div>
          );
        })}

        {loading && (
          <div
            style={{
              alignSelf: 'flex-start',
              padding: '8px 14px',
              backgroundColor: '#ffffff',
              borderRadius: '14px',
              fontSize: '12px',
              color: '#667781',
              boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
            }}
          >
            {agent.name} is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. WhatsApp Chat Input Bar */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: '#f0f2f5',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderTop: '1px solid #d1d7db',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder={agent.searchPlaceholder || `Message ${agent.name}...`}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '24px',
            border: 'none',
            outline: 'none',
            fontSize: '14px',
            backgroundColor: '#ffffff',
          }}
        />
        <button
          onClick={() => handleSend()}
          disabled={!inputText.trim() || loading}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: inputText.trim() ? '#008069' : '#cbd5e1',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() ? 'pointer' : 'default',
            transition: 'background-color 0.15s ease',
          }}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};
