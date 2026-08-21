import React from 'react';
import { UIRegistry } from '@geeksman/core-ui';
import { Dashboard } from './pages/Dashboard';
import { ProductList } from './pages/Products/ProductList';
import { ProductForm } from './pages/Products/ProductForm';
import { Tickets } from './pages/Tickets';

export function registerSupplierPortalModule() {
  // Register Routes
  UIRegistry.registerRoute({
    path: '/',
    element: React.createElement(Dashboard),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/dashboard',
    element: React.createElement(Dashboard),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/products',
    element: React.createElement(ProductList),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/products/new',
    element: React.createElement(ProductForm),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/products/:id/edit',
    element: React.createElement(ProductForm),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/tickets',
    element: React.createElement(Tickets),
    isProtected: true,
  });

  // Register Navigation Items
  UIRegistry.registerNavItem({
    id: 'supplier-portal',
    label: 'Supplier Portal',
    path: '/dashboard',
    icon: React.createElement('svg', {
      width: '20',
      height: '20',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
      React.createElement('rect', { x: '3', y: '3', width: '7', height: '9' }),
      React.createElement('rect', { x: '14', y: '3', width: '7', height: '5' }),
      React.createElement('rect', { x: '14', y: '12', width: '7', height: '9' }),
      React.createElement('rect', { x: '3', y: '16', width: '7', height: '5' })
    ),
    section: 'main',
    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    sublabel: 'Supplier Self-Service'
  });

  UIRegistry.registerNavItem({
    id: 'supplier-dashboard-nav',
    label: 'Dashboard',
    path: '/dashboard',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2'
    },
      React.createElement('path', { d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' })
    ),
    section: 'extended',
    parentId: 'supplier-portal'
  });

  UIRegistry.registerNavItem({
    id: 'supplier-products-nav',
    label: 'Products Catalogue',
    path: '/products',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2'
    },
      React.createElement('path', { d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' })
    ),
    section: 'extended',
    parentId: 'supplier-portal'
  });

  UIRegistry.registerNavItem({
    id: 'supplier-tickets-nav',
    label: 'Support Tickets',
    path: '/tickets',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2'
    },
      React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
    ),
    section: 'extended',
    parentId: 'supplier-portal'
  });

  // Register Global Search Items
  UIRegistry.registerSearchItem({
    id: 'supplier-products-search',
    title: 'Supplier Products Catalogue',
    description: 'Manage and update products, SKU variants, and packings',
    category: 'Supplier Portal',
    keywords: ['product', 'sku', 'catalog', 'catalogue', 'variant', 'price', 'packing', 'supplier'],
    action: (navigate: any) => navigate('/products')
  });

  UIRegistry.registerSearchItem({
    id: 'supplier-products-create-search',
    title: '+ Create Supplier Product',
    description: 'Add a new product with SKU variants and specifications',
    category: 'Supplier Portal',
    keywords: ['create product', 'new product', 'add sku', 'new variant'],
    action: (navigate: any) => navigate('/products/new')
  });

  UIRegistry.registerSearchItem({
    id: 'supplier-tickets-search',
    title: 'Support Tickets',
    description: 'View support tickets and communicate with procurement',
    category: 'Supplier Portal',
    keywords: ['ticket', 'support', 'help', 'inquiry', 'chat', 'issue'],
    action: (navigate: any) => navigate('/tickets')
  });
}
