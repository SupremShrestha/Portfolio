import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createContactHandler } from './server/contact.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const contactApi = {
    name: 'local-contact-api',
    configureServer(server) {
      server.middlewares.use('/api/contact', createContactHandler(env));
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/contact', createContactHandler(env));
    },
  };
  return { base: './', plugins: [react(), contactApi] };
})
