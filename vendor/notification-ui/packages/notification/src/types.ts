export interface Notification {
  id: string;
  tenant_code: string;
  user_id: string;
  title: string;
  body: string;
  type: 'mention' | 'chat_reply' | 'support_chat' | 'ticket_update' | 'new_chat' | 'silent_sync' | 'comment' | 'import_status' | 'read_state_changed' | 'read_all_state_changed' | (string & {});
  link?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  metadata?: string;
  entity_name?: string;
  entity_id?: string;
}
