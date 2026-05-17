/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bebas Neue', 'cursive'],
        mono: ['DM Mono', 'monospace'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        bg: '#0C0C0F',
        surface: '#141418',
        border: '#1E1E24',
        accent: '#F97316',
        'accent-dim': '#7C3B12',
        muted: '#4B4B57',
        text: '#E8E8F0',
        subtle: '#8888A0',
      },
    },
  },
  plugins: [],
}
