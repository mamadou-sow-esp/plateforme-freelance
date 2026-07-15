/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
      },
      colors: {
        brand: {
          black: '#111111',
          white: '#ffffff',
        },
        status: {
          pending: '#f59e0b',
          active: '#3b82f6',
          delivered: '#8b5cf6',
          validated: '#10b981',
          contested: '#ef4444',
          cancelled: '#6b7280',
        }
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        'modal': '0 20px 60px rgba(0,0,0,0.15)',
      }
    },
  },
  plugins: [],
}