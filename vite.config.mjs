import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.mjs',
  },
  preview: {
    allowedHosts: ['project-challenge.up.railway.app', 'www.bingochallengers.com', 'bingochallengers.com'],
    host: true,
    port: Number(process.env.PORT) || 5173,
  },
});
