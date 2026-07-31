import React from 'react';

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  isProtected?: boolean;
  title?: string | ((path: string, searchParams: URLSearchParams) => string);
}

export interface NavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  section: 'main' | 'extended' | 'settings';
  parentId?: string; // Links extended items to main nav items
  bgGradient?: string;
  sublabel?: string;
  iconColor?: string;
  requiredPermission?: string;
  visible?: () => boolean;
}

export interface SearchItemConfig {
  id: string;
  title: string;
  description?: string;
  category: string;
  keywords?: string[];
  action: (navigate: (path: string) => void) => void;
  visible?: () => boolean;
}

type RegistryListener = () => void;

class UIRegistryClass {
  private routes: RouteConfig[] = [];
  private navItems: NavItemConfig[] = [];
  private searchItems: SearchItemConfig[] = [];
  private listeners: Set<RegistryListener> = new Set();

  subscribe(listener: RegistryListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => {
      try {
        listener();
      } catch (err) {
        console.error('Registry listener error:', err);
      }
    });
  }

  registerRoute(route: RouteConfig) {
    // Prevent duplicate paths
    this.routes = this.routes.filter(r => r.path !== route.path);
    this.routes.push(route);
    this.notify();
  }

  getRoutes(): RouteConfig[] {
    return this.routes;
  }

  registerNavItem(item: NavItemConfig) {
    this.navItems = this.navItems.filter(n => n.id !== item.id);
    this.navItems.push(item);
    this.notify();
  }

  unregisterNavItem(id: string) {
    this.navItems = this.navItems.filter(n => n.id !== id);
    this.notify();
  }

  unregisterRoute(path: string) {
    this.routes = this.routes.filter(r => r.path !== path);
    this.notify();
  }

  getNavItems(): NavItemConfig[] {
    return this.navItems.filter(item => !item.visible || item.visible());
  }

  registerSearchItem(item: SearchItemConfig) {
    this.searchItems = this.searchItems.filter(s => s.id !== item.id);
    this.searchItems.push(item);
    this.notify();
  }

  getSearchItems(): SearchItemConfig[] {
    return this.searchItems.filter(item => !item.visible || item.visible());
  }
}


export const UIRegistry = new UIRegistryClass();
export default UIRegistry;
