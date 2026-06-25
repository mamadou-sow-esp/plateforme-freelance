/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fff3e0',
          100: '#ffe0b2',
          500: '#ff9800',
          600: '#fb8c00',
          700: '#f57c00',
        },
        dark: {
          800: '#1a1a2e',
          900: '#0f0f23',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}