import React from 'react';

export interface WhatsAppListItemData {
  id: string;
  title: string;
  subtitle?: string;
  timestamp?: string;
  avatarText?: string;
  avatarIcon?: React.ReactNode;
  avatarBg?: string;
  isVerified?: boolean;
  isAgent?: boolean;
  badgePill?: string; // e.g. "AI" or "STAFF"
  unreadCount?: number;
  isRead?: boolean;
  statusBadge?: {
    label: string;
    color?: string;
    bg?: string;
  };
  priorityBadge?: {
    label: string;
    color?: string;
    bg?: string;
  };
  metadataLine?: React.ReactNode;
  raw?: any;
}

export type WhatsAppDataListItem = WhatsAppListItemData;

export interface WhatsAppFilterPill {
  key: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export interface WhatsAppDataListProps<T = any> {
  items: T[];
  renderItem?: (item: T, index: number) => WhatsAppListItemData;
  onItemClick: (item: T) => void;
  selectedId?: string;
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  filterPills?: WhatsAppFilterPill[];
  activeFilter?: string;
  onFilterChange?: (filterKey: string) => void;
  headerTitle?: string;
  headerActions?: React.ReactNode;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptySubtitle?: string;
  isMobile?: boolean;
  style?: React.CSSProperties;
  className?: string;
}
