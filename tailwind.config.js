/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        darkEarth: '#342e29',
        richRed: '#86312b',
        forestGreen: '#344736',
        deepBlue: '#002140',
        
        // Secondary & Accent Colors
        darkBrown: '#4b3c35',
        burntRed: '#9e3430', 
        oliveGreen: '#415c43',
        darkBlue: '#00385e',
        warmYellow: '#ffc083',
        coralOrange: '#ff774a',
        softGreen: '#b8dc99',
        lightBlue: '#b0ddf1',
        
        // Neutral Colors
        charcoalGray: '#51514d',
        softGray: '#e7e4df',
        offWhite: '#fdfbf7'
      },
      fontFamily: {
        serif: ['"ABC Arizona Flare"', '"EB Garamond"', 'Georgia', 'serif'],
        sans: ['"ABC Arizona Flare Sans"', 'Inter', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display': ['124px', { lineHeight: '1.1' }],
        'hero': ['69.47px', { lineHeight: '1.2' }],
        'subheading': ['52.12px', { lineHeight: '1.3' }],
        'body': ['22px', { lineHeight: '1.5' }],
        'button': ['14px', { lineHeight: '1.4', letterSpacing: '0.05em' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'pulse-slow': 'pulseSlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'loading-bar': 'loadingBar 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.5' },
        },
        loadingBar: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
