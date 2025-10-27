import { defineConfig, loadEnv, type ConfigEnv, type UserConfig } from 'vite'
import type { UserConfig as VitestUserConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// https://vitejs.dev/config/
type ExtendedConfig = UserConfig & Pick<VitestUserConfig, 'test'>

export default ({ mode }: ConfigEnv) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }

  const config = {
    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        ':bookcars-types': path.resolve(__dirname, '../packages/bookcars-types'),
        ':bookcars-helper': path.resolve(__dirname, '../packages/bookcars-helper/index.ts'),
        ':disable-react-devtools': path.resolve(__dirname, '../packages/disable-react-devtools'),
        ':bookcars-polyfills': path.resolve(__dirname, '../packages/bookcars-helper/polyfills.ts'),
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
      modulePreload: {
        polyfill: true,
      },
    },

    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/setupTests.ts',
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'json', 'html'],
        thresholds: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  } satisfies ExtendedConfig

  return defineConfig(config)
}
