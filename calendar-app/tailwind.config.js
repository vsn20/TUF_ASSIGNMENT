/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        accent: {
          DEFAULT: '#1B8FD2',
          light: '#5BB8F5',
          dark: '#0F5F8A',
        },
        paper: '#FAFAF8',
        ink: '#1A1A2E',
      },
      boxShadow: {
        calendar: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.1)',
        'calendar-hover': '0 28px 80px rgba(0,0,0,0.22), 0 6px 20px rgba(0,0,0,0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease forwards',
        'slide-up': 'slideUp 0.35s ease forwards',
        'page-flip': 'pageFlip 0.5s ease forwards',
        'range-pulse': 'rangePulse 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        pageFlip: {
          '0%': { transform: 'rotateX(0deg)', opacity: 1 },
          '50%': { transform: 'rotateX(-90deg)', opacity: 0 },
          '51%': { transform: 'rotateX(90deg)', opacity: 0 },
          '100%': { transform: 'rotateX(0deg)', opacity: 1 },
        },
        rangePulse: {
          '0%, 100%': { opacity: 0.7 },
          '50%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
};
