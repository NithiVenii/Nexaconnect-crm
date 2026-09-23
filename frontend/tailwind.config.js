/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef5ff',
          100: '#d9e9ff',
          200: '#bcd9ff',
          300: '#8fc1ff',
          400: '#5aa1ff',
          500: '#2f7dfa',
          600: '#1a5eef',
          700: '#154bd6',
          800: '#173fac',
          900: '#183988',
          950: '#122455',
        },
        surface: {
          light: 'rgba(255,255,255,0.65)',
          dark: 'rgba(17,24,39,0.55)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 65, 148, 0.15)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { '0%': { opacity: 0, transform: 'translateX(-12px)' }, '100%': { opacity: 1, transform: 'translateX(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-out both',
        slideIn: 'slideIn 0.35s ease-out both',
        pulseSoft: 'pulseSoft 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
