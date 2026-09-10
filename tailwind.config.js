/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: '#040914',
          surface: '#0A1325',
          card: '#0F1E36',
          border: '#1E3A68',
          cyan: '#00F0FF',
          blue: '#0072FF',
          amber: '#FFB800',
          red: '#FF3366',
          green: '#00FF9D',
          text: '#E0F2FE',
          muted: '#7DD3FC',
        }
      },
      boxShadow: {
        'cyan-glow': '0 0 25px rgba(0, 240, 255, 0.45)',
        'blue-glow': '0 0 30px rgba(0, 114, 255, 0.4)',
        'reactor': '0 0 50px rgba(0, 240, 255, 0.6), inset 0 0 30px rgba(0, 240, 255, 0.4)',
      },
      animation: {
        'spin-slow': 'spin 12s linear infinite',
        'spin-reverse': 'spin 18s linear infinite reverse',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.04)' },
        }
      }
    },
  },
  plugins: [],
}
