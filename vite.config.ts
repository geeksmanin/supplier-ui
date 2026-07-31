import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

const useVendor = fs.existsSync(path.resolve(__dirname, './vendor/core-ui/src'));
const coreUiTarget = useVendor
  ? path.resolve(__dirname, './vendor/core-ui/src')
  : path.resolve(__dirname, '../core-ui/src');

const useNotificationVendor = fs.existsSync(path.resolve(__dirname, './vendor/notification-ui/packages/notification/src'));
const notificationTarget = useNotificationVendor
  ? path.resolve(__dirname, './vendor/notification-ui/packages/notification/src')
  : path.resolve(__dirname, '../notification-ui/packages/notification/src');

console.log("VITE CONFIG ALIAS TARGET:", coreUiTarget);
console.log("VITE NOTIFICATION ALIAS TARGET:", notificationTarget);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@geeksman/core-ui': coreUiTarget,
      '@geeksman/notification': notificationTarget,
    },
  },
  server: {
    port: 3002,
  },
});
