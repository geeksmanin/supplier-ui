import React, { useState, useEffect, useMemo } from 'react';
import { AgentConfig, AgentApplication, SamwadAgent } from './types';

// Global singleton map of registered agents
const agentsMap = new Map<string, AgentConfig>();
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (err) {
      console.error('[AgentRegistry] Listener error:', err);
    }
  });
}

/**
 * Register a pluggable agent
 */
export function registerAgent(agent: AgentConfig): void {
  agentsMap.set(agent.id, agent);
  if (agent.slug && agent.slug !== agent.id) {
    agentsMap.set(agent.slug, agent);
  }
  notifyListeners();
}

/**
 * Retrieve an agent by ID or slug
 */
export function getAgent(idOrSlug: string): AgentConfig | undefined {
  if (!idOrSlug) return undefined;
  const cleanId = idOrSlug.replace(/^(agent-|thr-agent-)/, '');
  return (
    agentsMap.get(idOrSlug) ||
    agentsMap.get(`agent-${cleanId}`) ||
    agentsMap.get(cleanId)
  );
}

/**
 * Helper to determine if an agent belongs to a specific application target.
 */
export function isAgentForApp(agent: AgentConfig, app: AgentApplication): boolean {
  if (app === 'all') return true;
  if (agent.applications && agent.applications.length > 0) {
    return agent.applications.includes(app) || agent.applications.includes('all');
  }
  if (agent.tags && agent.tags.length > 0) {
    return agent.tags.includes(app) || agent.tags.includes('all');
  }
  return false;
}

/**
 * Return all unique registered agents sorted by pinned state and name,
 * optionally filtered by target application ('samwad' | 'customer' | 'staff').
 */
export function getAllAgents(app?: AgentApplication): AgentConfig[] {
  const unique = new Map<string, AgentConfig>();
  agentsMap.forEach((agent) => {
    if (!app || isAgentForApp(agent, app)) {
      unique.set(agent.id, agent);
    }
  });
  return Array.from(unique.values()).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Retrieve all agents tagged for a specific target application.
 */
export function getAgentsForApp(app: AgentApplication): AgentConfig[] {
  return getAllAgents(app);
}

export const getSamwadAgents = () => getAgentsForApp('samwad');
export const getCustomerAgents = () => getAgentsForApp('customer');
export const getStaffAgents = () => getAgentsForApp('staff');

/**
 * Reactive hook for UI components to consume registered agents,
 * optionally filtered by application scope.
 */
export function useAgents(app?: AgentApplication) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleChange = () => setTick((prev) => prev + 1);
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  const agents = useMemo(() => getAllAgents(app), [tick, app]);

  return {
    agents,
    getAgent,
  };
}

// Backward-compatibility aliases for Samwad
export const registerSamwadAgent = registerAgent;
export const getSamwadAgent = getAgent;
export const getAllSamwadAgents = () => getAllAgents('samwad');
export const useSamwadAgents = () => useAgents('samwad');

// =========================================================================
// Pluggable Operational Card Registry
// Enables domain modules (inventory, pos, ticketing, hr) to inject interactive
// operational cards into chat streams without hardcoding or circular dependencies.
// =========================================================================

export type OperationalCardComponent = React.ComponentType<{
  data?: any;
  card?: { type: string; data: any };
  message?: any;
  onDismiss?: () => void;
  onAction?: (actionId: string, payload?: any) => void | Promise<void>;
  [key: string]: any;
}>;

const cardRegistryMap = new Map<string, OperationalCardComponent>();

/**
 * Register an operational card component for a specific message card type
 */
export function registerOperationalCard(cardType: string, component: OperationalCardComponent): void {
  cardRegistryMap.set(cardType, component);
  notifyListeners();
}

/**
 * Retrieve an operational card component by its card type
 */
export function getOperationalCard(cardType?: string): OperationalCardComponent | undefined {
  if (!cardType) return undefined;
  return cardRegistryMap.get(cardType);
}

/**
 * Returns all registered operational card types
 */
export function getAllOperationalCardTypes(): string[] {
  return Array.from(cardRegistryMap.keys());
}

/**
 * Reactive hook to resolve an operational card component in chat streams
 */
export function useOperationalCard(cardType?: string): OperationalCardComponent | undefined {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleChange = () => setTick((prev) => prev + 1);
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  return useMemo(() => {
    return cardType ? getOperationalCard(cardType) : undefined;
  }, [cardType, tick]);
}
