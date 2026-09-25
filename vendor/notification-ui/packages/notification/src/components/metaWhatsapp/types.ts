import React from 'react';

export const META_BLUE = '#1877F2';
export const WHATSAPP_GREEN = '#25D366';

export interface WhatsAppAccount {
  id: string;
  connection_name: string;
  phone_number: string;
  phone_number_id: string;
  waba_id: string;
  access_token: string;
  webhook_verify_token: string;
  webhook_secret?: string;
  is_default: boolean;
  is_active: boolean;
  status: string;
  quality_rating: string;
  messaging_limit: string;
  created_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  account_id: string;
  name: string;
  language: string;
  category: string;
  status: string;
  components: string;
}

export interface WhatsAppContact {
  id: string;
  phone_number: string;
  contact_name?: string;
  status: 'VALID' | 'NOT_ON_WHATSAPP' | 'OPTED_OUT';
  last_inbound_at?: string;
  created_at: string;
}

export interface WhatsAppLog {
  id: string;
  account_id: string;
  wamid: string;
  recipient_phone: string;
  direction: 'OUTBOUND' | 'INBOUND';
  message_type: 'TEMPLATE' | 'SESSION_TEXT' | 'SESSION_MEDIA';
  template_name?: string;
  content?: string;
  media_url?: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  error_code?: string;
  error_details?: string;
  created_at: string;
}

export const MetaBlueTickIcon: React.FC<{ size?: number }> = ({ size = 18 }) =>
  React.createElement(
    'svg',
    { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', title: 'Meta Official Business Verified' },
    React.createElement('path', {
      d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
      fill: META_BLUE,
    })
  );

