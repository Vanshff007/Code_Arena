import { readFileSync } from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// The version shown in the footer comes straight from package.json, so the
// version rule (docs/contributing.md) only ever needs `npm version`.
const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'import.meta.env.APP_VERSION': JSON.stringify(version),
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
