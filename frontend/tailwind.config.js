/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surf: {
          900: '#ffffff', // main bg
          800: '#fafafa', // card bg
          700: '#f4f4f5', // hover
          600: '#e4e4e7', // border
          500: '#d4d4d8',
        },
        brand: {
          DEFAULT: '#f97316', // orange-500
          light: '#fdba74',   // orange-300
        },
        neon: '#ea580c', // replaced for legacy usage
        'neon-dim': '#c2410c',
        crimson: '#ef4444',
        'crimson-dim': '#dc2626',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', '"SF Mono"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to top right, #ea580c, #f97316)',
      },
      animation: {
        'ticker-scroll': 'ticker-scroll 60s linear infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.3s ease-out',
      },
      keyframes: {
        'ticker-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'pulse-neon': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
