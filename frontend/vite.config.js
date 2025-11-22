import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss({
          content: [
            "./index.html",
            "./src/**/*.{js,ts,jsx,tsx}",
          ],
          theme: {
            extend: {
              fontFamily: {
                display: ['Space Grotesk', 'sans-serif'],
                body: ['Outfit', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
              },
              colors: {
                deep: '#030712',
                cyan: {
                  DEFAULT: '#00f3ff',
                  glow: '#00f3ff80'
                }
              }
            },
          },
        }),
        autoprefixer(),
      ],
    },
  },
})