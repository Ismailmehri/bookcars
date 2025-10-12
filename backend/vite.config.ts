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
      target: 'esnext'
    },

    test: {
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
      },
    }
  })
}
