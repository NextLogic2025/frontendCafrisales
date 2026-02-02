import path from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig(async () => {
  const tailwindcss = (await import('@tailwindcss/vite')).default
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        components: path.resolve(__dirname, 'src/components'),
        features: path.resolve(__dirname, 'src/features'),
        utils: path.resolve(__dirname, 'src/utils'),
        hooks: path.resolve(__dirname, 'src/hooks'),
        services: path.resolve(__dirname, 'src/services'),
        context: path.resolve(__dirname, 'src/context'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
            'vendor-ui': ['@headlessui/react', 'lucide-react'],
            'vendor-maps': ['@react-google-maps/api'],
            'vendor-socket': ['socket.io-client'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
    },
  }
})
