import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Relative base so GitHub Pages works at any repo path
export default defineConfig({
  plugins: [react()],
  base: './',
})
