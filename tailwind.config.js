/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      main: 'var(--main-font)',
      additional: 'var(--additional-font)',
    },
    extend: {
      colors: {
        main: 'var(--main)',
        'main-light': 'var(--main-light)',
        'main-dark': 'var(--main-dark)',
        'main-text': '#d6d6d6',
        dark: 'var(--dark)',
        'dark-light': '#212121',
        black: '#000000',
        white: '#ffffff',
        light: 'var(--light)',
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
