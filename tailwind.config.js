/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        serif: ['"Fraunces"', 'Georgia', 'serif'],
        chaos: ['"Rubik Mono One"', '"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        feed: {
          bg: '#030407',
          accent: '#ff146a',
          lime: '#ccff00',
        },
        desk: {
          paper: '#fdfcf9',
          ink: '#1c1b18',
          accent: '#d93829',
          rule: '#e6ded3',
          shadow: '#0a0908',
          board: '#181a1f',
        },
      },
      boxShadow: {
        card: '0 30px 60px -20px rgba(0,0,0,0.8)',
        desk: '0 4px 12px rgba(0,0,0,0.08), 0 20px 40px -15px rgba(0,0,0,0.15)',
        glow: '0 0 20px rgba(255, 20, 106, 0.4)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      },
      keyframes: {
        floatUp: {
          '0%': { opacity: '0', transform: 'translate(-50%, -30%) scale(0.6)' },
          '20%': { opacity: '1', transform: 'translate(-50%, -60%) scale(1.15)' },
          '80%': { opacity: '0.8', transform: 'translate(-50%, -100%) scale(1)' },
          '100%': { opacity: '0', transform: 'translate(-50%, -120%) scale(0.85)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        }
      },
      animation: {
        floatUp: 'floatUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shimmer: 'shimmer 2.4s linear infinite',
        pulseSoft: 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.01) 100%)',
        'glass-dark': 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)',
      }
    },
  },
  plugins: [],
}
