export interface Notification {
  id: string;
  tenant_code: string;
  user_id: string;
  title: string;
  body: string;
  type: 'mention' | 'chat_reply' | 'ticket_update' | 'read_state_changed' | 'read_all_state_changed';
  link?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  metadata?: string;
}
