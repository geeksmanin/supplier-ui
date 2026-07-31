import React from 'react';
import { UIRegistry, HelpGuide } from '@geeksman/core-ui';
import { Catalog } from './pages/Catalog';
import { Orders } from './pages/Orders';
import { Invoices } from './pages/Invoices';
import { EnquiryCart } from './pages/EnquiryCart';
import { OrderCart } from './pages/OrderCart';
import { Enquiries } from './pages/Enquiries';
import { Quotations } from './pages/Quotations';
import { Tickets } from './pages/Tickets';
import { Home } from './pages/Home';
import { Subscriptions } from './pages/Subscriptions';

export function registerCustomerPortalModule() {
  UIRegistry.registerRoute({
    path: '/home',
    element: React.createElement(Home),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/tickets',
    element: React.createElement(Tickets),
    isProtected: true,
  });

  // 1. Register Routes
  UIRegistry.registerRoute({
    path: '/catalog',
    element: React.createElement(Catalog),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/orders',
    element: React.createElement(Orders),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/wishlist',
    element: React.createElement(Catalog),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/invoices',
    element: React.createElement(Invoices),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/enquiry-cart',
    element: React.createElement(EnquiryCart),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/order-cart',
    element: React.createElement(OrderCart),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/enquiries',
    element: React.createElement(Enquiries),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/quotations',
    element: React.createElement(Quotations),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/subscriptions',
    element: React.createElement(Subscriptions),
    isProtected: true,
  });

  UIRegistry.registerRoute({
    path: '/guide',
    element: React.createElement(HelpGuide),
    isProtected: true,
  });

  // 2. Register Navigation Items
  // Parent item in main section
  UIRegistry.registerNavItem({
    id: 'customer-portal',
    label: 'Customer Portal',
    path: '/catalog',
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
    bgGradient: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
    sublabel: 'Self-Service'
  });

  // Extended sub-menu options
  UIRegistry.registerNavItem({
    id: 'customer-catalog-nav',
    label: 'Product Catalog',
    path: '/catalog',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
      React.createElement('path', { d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' }),
      React.createElement('polyline', { points: '3.27 6.96 12 12.01 20.73 6.96' }),
      React.createElement('line', { x1: '12', y1: '22.08', x2: '12', y2: '12' })
    ),
    section: 'extended',
    parentId: 'customer-portal'
  });

  UIRegistry.registerNavItem({
    id: 'customer-enquiry-cart-nav',
    label: 'Enquiry Cart',
    path: '/enquiry-cart',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
      React.createElement('path', { d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2' }),
      React.createElement('rect', { x: '8', y: '2', width: '8', height: '4', rx: '1', ry: '1' })
    ),
    section: 'extended',
    parentId: 'customer-portal'
  });

  UIRegistry.registerNavItem({
    id: 'customer-enquiries-nav',
    label: 'Enquiries List',
    path: '/enquiries',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
      React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
    ),
    section: 'extended',
    parentId: 'customer-portal'
  });

  UIRegistry.registerNavItem({
    id: 'customer-order-cart-nav',
    label: 'Order Cart',
    path: '/order-cart',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
      React.createElement('circle', { cx: '9', cy: '21', r: '1' }),
      React.createElement('circle', { cx: '20', cy: '21', r: '1' }),
      React.createElement('path', { d: 'M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' })
    ),
    section: 'extended',
    parentId: 'customer-portal'
  });

  UIRegistry.registerNavItem({
    id: 'customer-orders-nav',
    label: 'Orders List',
    path: '/orders',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
      React.createElement('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      React.createElement('polyline', { points: '14 2 14 8 20 8' }),
      React.createElement('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
      React.createElement('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
      React.createElement('polyline', { points: '10 9 9 9 8 9' })
    ),
    section: 'extended',
    parentId: 'customer-portal'
  });

  UIRegistry.registerNavItem({
    id: 'customer-invoices-nav',
    label: 'Billing & Invoices',
    path: '/invoices',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
      React.createElement('rect', { x: '2', y: '4', width: '20', height: '16', rx: '2', ry: '2' }),
      React.createElement('line', { x1: '12', y1: '10', x2: '18', y2: '10' }),
      React.createElement('line', { x1: '12', y1: '14', x2: '16', y2: '14' }),
      React.createElement('circle', { cx: '7', cy: '12', r: '2' })
    ),
    section: 'extended',
    parentId: 'customer-portal'
  });

  UIRegistry.registerNavItem({
    id: 'customer-quotations-nav',
    label: 'My Quotations',
    path: '/quotations',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
      React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
      React.createElement('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
      React.createElement('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
    ),
    section: 'extended',
    parentId: 'customer-portal'
  });

  UIRegistry.registerNavItem({
    id: 'customer-tickets-nav',
    label: 'Support Tickets',
    path: '/tickets',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
      React.createElement('path', { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' })
    ),
    section: 'extended',
    parentId: 'customer-portal'
  });

  UIRegistry.registerNavItem({
    id: 'customer-subscriptions-nav',
    label: 'My Subscriptions',
    path: '/subscriptions',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
      React.createElement('circle', { cx: '12', cy: '8', r: '7' }),
      React.createElement('polyline', { points: '8.21 13.89 7 23 12 20 17 23 15.79 13.88' })
    ),
    section: 'extended',
    parentId: 'customer-portal'
  });

  UIRegistry.registerNavItem({
    id: 'customer-guide-nav',
    label: 'Help Guide',
    path: '/guide',
    icon: React.createElement('svg', {
      width: '16',
      height: '16',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round'
    },
      React.createElement('circle', { cx: '12', cy: '12', r: '10' }),
      React.createElement('path', { d: 'M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' }),
      React.createElement('line', { x1: '12', y1: '17', x2: '12.01', y2: '17' })
    ),
    section: 'extended',
    parentId: 'customer-portal'
  });
}
