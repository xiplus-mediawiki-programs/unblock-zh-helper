import { fileURLToPath, URL } from 'url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  esbuild: {
    charset: 'utf8',
  },
  build: {
    // minify: false,
    lib: {
      entry: 'src/main.js',
      formats: ['iife'],
      name: 'unblock-zh-helper.js',
      fileName: 'unblock-zh-helper',
    },
    rollupOptions: {
      output: {
        banner:
          '/*! <nowiki>\nItroduction: https://zh.wikipedia.org/wiki/User:Xiplus/js/unblock-zh-helper\nUnminify code: https://github.com/Xi-Plus/unblock-zh-helper\n*/',
        footer: '/*! </nowiki> */',
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['mock-mediawiki', 'tests/setup.js'],
  },
});
