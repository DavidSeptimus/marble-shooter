import { defineConfig } from 'vite';

export default defineConfig({
  base: '/marble-shooter/',
  build: {
    target: 'es2020',
  },
  optimizeDeps: {
    exclude: ['@dimforge/rapier3d-compat'],
  },
});
