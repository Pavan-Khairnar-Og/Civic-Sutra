/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
  civic: {
    parchment: '#F8F6F1',
    surface: '#FFFFFF',
    muted: '#E8E4DC',
    mutedDark: '#C8C4BC',
    textPrimary: '#1C1917',
    textSecondary: '#6B6560',
    orange: '#D4522A',
    orangeHover: '#B8441F',
    orangeLight: '#FBF0EB',
    teal: '#2A9D8F',
    tealLight: '#E8F6F4',
    amber: '#E9A84C',
    amberLight: '#FEF6E7',
    red: '#C1121F',
    redLight: '#FCEAEA',
    govBg: '#111110',
    govSurface: '#1C1C1A',
    govBorder: '#2C2C2A',
    govText: '#E8E4DC',
    govMuted: '#6B6560',
  }
},
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['DM Serif Display', 'serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.15)',
        'civic-orange': '0 8px 24px rgba(212,82,42,0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
