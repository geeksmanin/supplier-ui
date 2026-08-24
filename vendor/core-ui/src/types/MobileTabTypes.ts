import React from 'react';

export interface AppTab {
  path: string;
  label: string;
  closable?: boolean;
  icon?: React.ComponentType<any>;
  badge?: number;
  color?: string;
  category?: string;
}

export interface AppFolderItem {
  id: string;
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  color?: string;
  badge?: number;
  description?: string;
}

export interface AppFolderGroup {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color?: string;
  items: AppFolderItem[];
}
