/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Her main device isn't known yet; reach back to older iPads and phones
    // (Safari 14 and up) instead of Vite's newer default.
    target: ['es2020', 'safari14', 'chrome87', 'firefox78', 'edge88'],
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
