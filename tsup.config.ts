import { defineConfig } from 'tsup'

export default defineConfig({
  name: 'kalman-filter',
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  splitting: false,
  dts: true
})
