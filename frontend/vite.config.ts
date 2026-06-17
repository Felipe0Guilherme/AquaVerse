import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// No Tailwind v4, o plugin é importado direto — sem postcss.config.js
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Plugin oficial do Tailwind v4 para Vite
  ],
  resolve: {
    alias: {
      // Necessário para o shadcn funcionar com "@/components/..."
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
})
