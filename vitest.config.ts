import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Ant Design Drawer/virtual-list suites share a single jsdom event loop;
    // serializing files prevents parallel suites from starving each other's
    // userEvent/waitFor work without changing individual test timeouts.
    fileParallelism: false,
  },
});
