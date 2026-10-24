import React from 'react';

export interface AgentContext {
  agentId: string;
  tenantCode: string;
  businessCode?: string;
  userEmail: string;
  currentUserId: string;
  userName?: string;
  customerId?: string;
  customerName?: string;
  navigate: (path: string) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'error') => void;
  activeLocationId?: string;
  setActiveLocationId?: (id: string) => void;
  openDrawer?: (drawerId: string, payload?: any) => void;
}

export interface AgentMessage {
  id: string;
  sender_type: 'user' | 'agent';
  sender_name: string;
  body: string;
  created_at: string;
  card?: {
    type: string;
    data: any;
  };
}

export interface AgentQuickPrompt {
  id: string;
  label: string;
  prompt: string;
  icon?: React.ReactNode;
  autoSend?: boolean;
}

export interface AgentAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action: (context: AgentContext) => void | Promise<void>;
  variant?: 'default' | 'danger' | 'primary';
}

export interface AgentTabProps {
  agent?: AgentConfig;
  context?: AgentContext;
  onNavigateToTab?: (tabId: string) => void;
}

export interface AgentTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  component: React.ComponentType<AgentTabProps>;
  badge?: string | number;
  badgeCount?: number;
}

export interface AgentConfig {
  id: string; // e.g., 'agent-sales', 'agent-ticket', 'agent-subscription'
  slug: string; // e.g., 'sales', 'ticket', 'subscription'
  name: string; // e.g., 'Sales & Orders Agent'
  description: string;
  subtitle?: string; // e.g., '24/7 Ordering & Dispatches'
  avatarIcon?: React.ReactNode;
  avatarBg?: string; // e.g., '#dcfce7'
  isVerified: boolean; // Renders official VerifiedBlueTick badge
  isPinned: boolean; // Pinned in verified agent rows
  searchPlaceholder?: string;
  tabs?: AgentTab[];
  quickPrompts?: AgentQuickPrompt[];
  headerActions?: AgentAction[];
  initialMessages?: (context: AgentContext) => AgentMessage[];
  onUserMessage?: (text: string, context: AgentContext) => Promise<AgentMessage[] | AgentMessage>;
  renderCard?: (
    card: { type: string; data: any },
    context: AgentContext,
    onSend?: (text: string) => void
  ) => React.ReactNode;
  // Pluggable conversational component
  component?: React.ComponentType<{
    agent: AgentConfig;
    context: AgentContext;
    onBack?: () => void;
  }>;
}

// Backward-compatibility aliases
export type SamwadAgent = AgentConfig;
export type SamwadAgentContext = AgentContext;
export type SamwadAgentQuickPrompt = AgentQuickPrompt;
export type SamwadAgentAction = AgentAction;
export type SamwadAgentTab = AgentTab;
export type SamwadAgentTabProps = AgentTabProps;
