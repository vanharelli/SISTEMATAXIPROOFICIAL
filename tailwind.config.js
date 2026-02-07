/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'scan-ultra': 'scan-ultra 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        'global-scan': 'global-scan 3s linear infinite',
        'atmospheric-pulse': 'atmospheric-pulse 4s ease-in-out infinite',
        'spin-linear': 'spin 1s linear infinite',
        'spin-reverse': 'spin-reverse 1.5s linear infinite',
        'spin-fast': 'spin 0.6s linear infinite',
        'spin-slow': 'spin 1.2s cubic-bezier(0.68,-0.55,0.265,1.55) infinite',
        'text-glow-pulse': 'text-glow-pulse 2s ease-in-out infinite',
        'breathing': 'breathing 3s ease-in-out infinite',
      },
      keyframes: {
        'scan-ultra': {
          '0%': { top: '-10%', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { top: '110%', opacity: '0' },
        },
        'global-scan': {
          '0%': { top: '-10%' },
          '100%': { top: '110%' },
        },
        'atmospheric-pulse': {
          '0%, 100%': { backgroundColor: 'rgba(0, 0, 0, 0.75)' },
          '50%': { backgroundColor: 'rgba(212, 175, 55, 0.1)' },
        },
        'spin-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        'text-glow-pulse': {
          '0%, 100%': { opacity: '1', textShadow: '0 0 25px rgba(255, 255, 255, 0.9)' },
          '50%': { opacity: '0.4', textShadow: '0 0 5px rgba(255, 255, 255, 0.2)' },
        },
        'breathing': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}
