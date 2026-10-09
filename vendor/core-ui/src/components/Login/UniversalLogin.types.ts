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
  /** Custom application name (e.g. "संवाद Samwad", "Staff Operations", "Customer Portal") */
  appName?: string;
  /** Form title (e.g. "Staff Sign In", "Customer Portal Login") */
  title?: string;
  /** Form subtitle */
  subtitle?: string;
  /** System badge shown in hero pane (e.g. "ENTERPRISE OS V2.0", "COMMUNICATIONS SUITE") */
  systemBadge?: string;
  /** Primary accent color (hex code) */
  themeColor?: string;
  /** Custom gradient for desktop left pane */
  gradient?: string;
  /** Optional custom logo image URL */
  logoUrl?: string;
  /** Hero feature highlights displayed on desktop view */
  features?: UniversalLoginFeature[];
  /** Optional custom login endpoint path */
  loginEndpoint?: string;
  /** Fallback default tenant code if none resolved */
  defaultTenant?: string;
  /** Callback on successful authentication */
  onSuccess?: (authData: any) => void;
  /** Destination route path on success (defaults to '/') */
  redirectPath?: string;
}
