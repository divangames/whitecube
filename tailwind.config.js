/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Unbounded', 'sans-serif'],
      },
      colors: {
        ink:    '#0B0B0B',
        card:   '#111111',
        edge:   '#1C1C1C',
        muted:  '#2A2A2A',
        dim:    '#666666',
        mid:    '#999999',
        soft:   '#CCCCCC',
        cream:  '#F0EDE6',
        fire:   '#22b7d8',
        'fire-dim': '#22b7d822',
        'fire-mid': '#22b7d844',
      },
      animation: {
        aurora: 'aurora 8s ease-in-out infinite alternate',
        marquee: 'marquee var(--duration, 30s) linear infinite',
        'marquee-reverse': 'marquee var(--duration, 30s) linear infinite reverse',
        'border-beam': 'border-beam calc(var(--duration)*1s) infinite linear',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
      },
      keyframes: {
        aurora: {
          '0%':   { backgroundPosition: '0% 50%',   transform: 'rotate(-5deg) scale(0.9)' },
          '25%':  { backgroundPosition: '50% 100%', transform: 'rotate(5deg) scale(1.1)' },
          '50%':  { backgroundPosition: '100% 50%', transform: 'rotate(-3deg) scale(0.95)' },
          '75%':  { backgroundPosition: '50% 0%',   transform: 'rotate(3deg) scale(1.05)' },
          '100%': { backgroundPosition: '0% 50%',   transform: 'rotate(-5deg) scale(0.9)' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(calc(-100% - var(--gap, 1rem)))' },
        },
        'border-beam': {
          '100%': { offsetDistance: '100%' },
        },
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
