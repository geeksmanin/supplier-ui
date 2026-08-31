import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.geeksman.supplier',
  appName: 'Geeksman Supplier',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'LIGHT',
      backgroundColor: '#ffffff',
    },
  },
};

export default config;
