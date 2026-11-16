import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node24',
  outDir: 'dist',
  clean: true,
  // Workspace-пакет экспортирует TS-исходники, поэтому встраиваем его в бандл,
  // чтобы `node dist/server.js` не зависел от структуры монорепозитория.
  noExternal: ['@aurora/contracts'],
})
