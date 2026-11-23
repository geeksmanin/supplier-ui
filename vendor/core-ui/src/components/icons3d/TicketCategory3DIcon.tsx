import React from 'react';
import {
  Category3DIconProps,
  TicketCategoryIconProps,
} from './TicketCategoryIcons.types';
import { OrderIssue3DIcon } from './OrderIssue3DIcon';
import { SubscriptionCategory3DIcon } from './SubscriptionCategory3DIcon';
import { BillingPayment3DIcon } from './BillingPayment3DIcon';
import { ProductEnquiry3DIcon } from './ProductEnquiry3DIcon';
import { TechSupport3DIcon } from './TechSupport3DIcon';

export * from './TicketCategoryIcons.types';
export * from './OrderIssue3DIcon';
export * from './SubscriptionCategory3DIcon';
export * from './BillingPayment3DIcon';
export * from './ProductEnquiry3DIcon';
export * from './TechSupport3DIcon';

/**
 * Unified Dispatcher: Renders the appropriate 3D Category Logo.
 */
export const TicketCategoryIcon: React.FC<TicketCategoryIconProps> = ({
  category,
  size = 20,
  style,
  className,
}) => {
  switch (category) {
    case 'ORDER_ISSUE':
    case 'order':
    case 'delivery':
      return <OrderIssue3DIcon size={size} style={style} className={className} />;

    case 'SUBSCRIPTION':
    case 'subscription':
    case 'license':
      return <SubscriptionCategory3DIcon size={size} style={style} className={className} />;

    case 'BILLING_PAYMENT':
    case 'billing':
    case 'payment':
    case 'invoice':
      return <BillingPayment3DIcon size={size} style={style} className={className} />;

    case 'PRODUCT_ENQUIRY':
    case 'product':
    case 'enquiry':
      return <ProductEnquiry3DIcon size={size} style={style} className={className} />;

    case 'TECHNICAL_SUPPORT':
    case 'technical':
    case 'tech':
    default:
      return <TechSupport3DIcon size={size} style={style} className={className} />;
  }
};
