export type NativePlatform = 'android' | 'ios' | 'web';

export interface DeviceRegistrationPayload {
  device_token: string;
  platform: NativePlatform;
  device_model?: string;
  app_version?: string;
}

export interface PushNotificationData {
  title?: string;
  body?: string;
  route?: string;
  url?: string;
  type?: string;
  tenant_code?: string;
  id?: string;
  [key: string]: any;
}
