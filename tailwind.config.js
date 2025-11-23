/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1DB954',
          'green-light': '#1ed760',
          black: '#191414',
          white: '#FFFFFF',
          gray: '#B3B3B3',
        },
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '20px',
        'glass-strong': '24px',
      },
      backdropSaturate: {
        'glass': '180%',
      },
      animation: {
        'shimmer': 'shimmer 20s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        'glow-green': '0 4px 15px 0 rgba(29, 185, 84, 0.4)',
        'glow-green-strong': '0 8px 25px 0 rgba(29, 185, 84, 0.5)',
      },
    },
  },
  plugins: [],
}
