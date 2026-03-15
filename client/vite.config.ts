import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: [
      '@tensorflow/tfjs-core',
      '@tensorflow/tfjs-converter',
      '@tensorflow/tfjs-backend-webgl',
      '@tensorflow/tfjs-backend-webgpu',
      '@tensorflow-models/pose-detection',
      '@mediapipe/pose',
    ],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
