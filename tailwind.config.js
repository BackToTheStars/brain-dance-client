/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        main: '#829af7',
        'main-light': '#9baffd',
        'main-dark': '#21306e',
        'main-text': '#d6d6d6',
        dark: '#151819',
        'dark-light': '#212121',
        black: '#000000',
        white: '#ffffff',
        light: '#f3f4f6',
      },
      padding: {
        'section-padding': '48px',
      },
    },

    borderRadius: {
      DEFAULT: '14px',
      none: '0',
      sm: '6px',
      md: '12px',
      lg: '16px',
      xl: '28px',
      full: '9999px',
      'btn-border': '6px',
    },
  },
  plugins: [],
};