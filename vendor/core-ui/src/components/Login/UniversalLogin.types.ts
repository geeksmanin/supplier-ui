import React from 'react';

export type UserPersonaRole = 'staff' | 'customer' | 'vendor' | 'universal';

export interface UniversalLoginFeature {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface UniversalLoginProps {
  /** Target persona role: 'staff' (default), 'customer', 'vendor', or 'universal' */
  role?: UserPersonaRole;
  /** Custom application name (e.g. "संवाद Samwad", "Staff Operations", "Customer Portal", "Point of Sale") */
  appName?: string;
  /** Form title (e.g. "Staff Sign In", "Customer Portal Login", "POS Cashier Sign In") */
  title?: string;
  /** Form subtitle */
  subtitle?: string;
  /** System badge shown in hero pane (e.g. "ENTERPRISE OS V2.0", "COMMUNICATIONS SUITE", "RETAIL CHECKOUT V2.0") */
  systemBadge?: string;
  /** Primary accent color (hex code) - controls button, focus ring, active highlights */
  themeColor?: string;
  /** Outer background color (defaults to #f1f5f9) */
  backgroundColor?: string;
  /** Custom gradient for desktop left pane (used in hero layout) */
  gradient?: string;
  /** Optional custom logo image URL */
  logoUrl?: string;
  /** Optional workspace logo image URL */
  workspaceLogo?: string;
  /** Visual presentation mode: 'loader' (split card with 3D Geeksman GalaxyLoader, default) or 'hero' (gradient hero pane) */
  layout?: 'loader' | 'hero';
  /** Theme for the 3D GalaxyLoader particle canvas: 'light' (default), 'dark', 'cosmic', or 'green' */
  loaderTheme?: 'light' | 'dark' | 'cosmic' | 'green';
  /** Hero feature highlights displayed on desktop view */
  features?: UniversalLoginFeature[];
  /** Optional custom login endpoint path */
  loginEndpoint?: string;
  /** Fallback default tenant code if none resolved */
  defaultTenant?: string;
  /** Optional pre-selected workspace code */
  workspaceCode?: string;
  /** Optional custom login handler override for full Inversion of Control */
  onLogin?: (credentials: { email: string; password: string; workspaceCode: string; role: string }) => Promise<any>;
  /** Callback on successful authentication */
  onSuccess?: (authData: any) => void;
  /** Destination route path on success (defaults to '/') */
  redirectPath?: string;
  /** Optional workspace change event callback */
  onWorkspaceChange?: (newCode: string, metadata?: any) => void;
  /** Optional trigger to open workspace modal */
  onOpenWorkspaceModal?: () => void;
}

