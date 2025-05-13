import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import Obfuscator from 'javascript-obfuscator';

// https://vite.dev/config/
export default defineConfig({
  base: '/eduhub/',
  plugins: [
    react(),
    {
      name: 'vite-plugin-obfuscate',
      enforce: 'post',
      apply: 'build',
      async generateBundle(_, bundle) {
        for (const file in bundle) {
          const chunk = bundle[file];
          if (file.endsWith('.js')) {
            const obfuscated = Obfuscator.obfuscate(chunk.code, {
              compact: true,
              controlFlowFlattening: true,
              stringArray: true,
              stringArrayThreshold: 0.8,
            }).getObfuscatedCode();
            chunk.code = obfuscated;
          }
        }
      },
    },
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
