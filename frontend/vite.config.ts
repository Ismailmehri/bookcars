import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
export default ({ mode }: { mode: string }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }

  return defineConfig({
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'react-helmet': path.resolve(__dirname, './src/shims/react-helmet.tsx'),
        'react-helmet-async': path.resolve(__dirname, './src/shims/react-helmet-async.ts'),
        ':bookcars-types': path.resolve(__dirname, '../packages/bookcars-types'),
        ':bookcars-helper': path.resolve(__dirname, '../packages/bookcars-helper/index.ts'),
        ':disable-react-devtools': path.resolve(__dirname, '../packages/disable-react-devtools'),
      },
    },

    server: {
      host: '0.0.0.0',
      port: Number.parseInt(process.env.VITE_PORT || '3002', 10),
    },

    build: {
      outDir: 'build',
      target: 'es2015',
      cssTarget: 'chrome61',
      cssCodeSplit: true,
      sourcemap: mode === 'development',
      modulePreload: {
        polyfill: true,
      },
      rollupOptions: {
        output: {
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash][extname]',
          manualChunks: {
            react: ['react', 'react-dom'],
            mui: [
              '@mui/material',
              '@mui/icons-material',
              '@mui/joy',
              '@emotion/react',
              '@emotion/styled',
              '@mui/x-date-pickers',
              '@mui/x-data-grid',
            ],
            leaflet: ['leaflet', 'react-leaflet', 'leaflet-boundary-canvas'],
            vendor: [
              'axios',
              'history',
              'react-router-dom',
              'react-toastify',
              'react-gtm-module',
              'react-ga4',
            ],
          },
        },
      },
      reportCompressedSize: false,
    },
  })
}
