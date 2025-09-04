/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-bg': '#FDFBF8',
        'brand-surface': '#FFFFFF',
        'brand-primary': '#C8A47E',
        'brand-primary-dark': '#AF8F6D',
        'brand-secondary': '#6B7280',
        'brand-text': '#374151',
        'brand-accent': '#85A398',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
         'slide-in-left': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.3s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'fade-in': 'fade-in 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
