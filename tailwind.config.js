/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f0f1f5',
          100: '#d9dce6',
          200: '#b3b9cd',
          300: '#8d96b4',
          400: '#67739b',
          500: '#4a5578',
          600: '#3a4361',
          700: '#2b324a',
          800: '#1c2133',
          900: '#0d111c',
          950: '#060810',
        },
        paper: {
          50: '#fefdfb',
          100: '#fdf9f3',
          200: '#faf3e7',
          300: '#f5e9d4',
          400: '#efdfc1',
          500: '#e8d4ae',
        },
        accent: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
