import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  server: { host: '127.0.0.1' },
  build: { outDir: fileURLToPath(new URL('../../.demo-dist', import.meta.url)), emptyOutDir: true },
});
