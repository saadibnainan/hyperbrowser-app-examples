/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#FFFD39',
        terminal: '#000000',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SF Mono', 'Monaco', 'monospace'],
      },
      fontWeight: {
        normal: '500',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      letterSpacing: {
        tight4: '-0.04em',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 253, 57, 0.3)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 253, 57, 0.6)' },
        },
      },
      backdropBlur: {
        md: '12px',
      },
    },
  },
  plugins: [],
} 