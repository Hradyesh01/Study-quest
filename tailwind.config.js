/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      colors: {
        base: {
          950: '#05060f',
          900: '#0b0e1a',
          800: '#12162a',
          700: '#1a1f3a',
          600: '#242b4d',
        },
        neon: {
          cyan: '#00f5ff',
          purple: '#b026ff',
          pink: '#ff2e93',
          green: '#39ff88',
          gold: '#ffd700',
          silver: '#c7d0dd',
          bronze: '#e0995e',
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 6px rgba(0,245,255,0.6), 0 0 24px rgba(0,245,255,0.25)',
        'neon-purple': '0 0 6px rgba(176,38,255,0.6), 0 0 24px rgba(176,38,255,0.25)',
        'neon-pink': '0 0 6px rgba(255,46,147,0.6), 0 0 24px rgba(255,46,147,0.25)',
        'neon-green': '0 0 6px rgba(57,255,136,0.6), 0 0 24px rgba(57,255,136,0.25)',
        'neon-gold': '0 0 8px rgba(255,215,0,0.7), 0 0 28px rgba(255,215,0,0.3)',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: 1, filter: 'brightness(1)' },
          '50%': { opacity: 0.85, filter: 'brightness(1.3)' },
        },
        flicker: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
          '25%': { transform: 'scale(1.05) rotate(-2deg)' },
          '75%': { transform: 'scale(0.97) rotate(2deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'confetti-fall': {
          '0%': { transform: 'translateY(-10vh) rotate(0deg)', opacity: 1 },
          '100%': { transform: 'translateY(110vh) rotate(720deg)', opacity: 0 },
        },
        'progress-fill': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2.4s ease-in-out infinite',
        flicker: 'flicker 1.8s ease-in-out infinite',
        float: 'float 3.5s ease-in-out infinite',
        'confetti-fall': 'confetti-fall linear forwards',
        'progress-fill': 'progress-fill 0.6s ease-out forwards',
      },
    },
  },
  plugins: [],
}
