import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

function resolvePkg(isDev: boolean, vendorRel: string, siblingRel: string): string {
  const vendorAbs = path.resolve(__dirname, vendorRel);
  const siblingAbs = path.resolve(__dirname, siblingRel);
  if (isDev && fs.existsSync(siblingAbs)) {
    return siblingAbs;
  }
  return fs.existsSync(vendorAbs) ? vendorAbs : siblingAbs;
}

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@geeksman/core-ui': resolvePkg(isDev, './vendor/core-ui/src', '../core-ui/src'),
        '@geeksman/notification': resolvePkg(isDev, './vendor/notification-ui/packages/notification/src', '../notification-ui/packages/notification/src'),
      },
    },
    server: {
      port: 3002,
    },
  };
});
