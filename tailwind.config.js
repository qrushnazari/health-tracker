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
      animation: {
        'slide-up': 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      colors: {
        bg: '#0C0C0F',
        surface: 'transparent',
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
