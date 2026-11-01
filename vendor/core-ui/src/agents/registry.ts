import React, { useState, useEffect, useMemo } from 'react';
import { AgentConfig, SamwadAgent } from './types';

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
 * Return all unique registered agents sorted by pinned state and name
 */
export function getAllAgents(): AgentConfig[] {
  const unique = new Map<string, AgentConfig>();
  agentsMap.forEach((agent) => {
    unique.set(agent.id, agent);
  });
  return Array.from(unique.values()).sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Reactive hook for UI components to consume registered agents
 */
export function useAgents() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleChange = () => setTick((prev) => prev + 1);
    listeners.add(handleChange);
    return () => {
      listeners.delete(handleChange);
    };
  }, []);

  const agents = useMemo(() => getAllAgents(), [tick]);

  return {
    agents,
    getAgent,
  };
}

// Backward-compatibility aliases for Samwad
export const registerSamwadAgent = registerAgent;
export const getSamwadAgent = getAgent;
export const getAllSamwadAgents = getAllAgents;
export const useSamwadAgents = useAgents;

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
