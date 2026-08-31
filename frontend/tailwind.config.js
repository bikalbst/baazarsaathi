/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Professional slate + ink palette with deep forest accent
        ink: '#0f1722',
        'ink-soft': '#33414f',
        'ink-muted': '#5c6b7a',
        paper: '#faf9f7',
        'paper-warm': '#f4f2ed',
        'paper-deep': '#eceae4',
        line: '#e3e0d9',
        brand: '#0e5741',
        'brand-deep': '#093f30',
        'brand-soft': '#e4efe9',
        gold: '#b58a3c',
        'gold-soft': '#f3ead9',
        // Legacy tokens kept in sync so other pages still compile
        surface: '#faf9f7',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f4f2ed',
        'surface-container': '#eceae4',
        'surface-container-high': '#e6e3db',
        'surface-variant': '#e3e0d9',
        primary: '#0e5741',
        'primary-container': '#0e5741',
        'primary-fixed': '#cfe3da',
        secondary: '#8a6a2f',
        'secondary-container': '#b58a3c',
        'secondary-fixed': '#f3ead9',
        tertiary: '#9a4636',
        'tertiary-container': '#c26a56',
        'tertiary-fixed': '#f6ddd6',
        'on-surface': '#0f1722',
        'on-surface-variant': '#5c6b7a',
        outline: '#8b98a5',
        'outline-variant': '#d5d1c8',
      },
      boxShadow: {
        ambient: '0 1px 2px rgba(15, 23, 34, 0.04), 0 8px 24px rgba(15, 23, 34, 0.06)',
        'ambient-hover': '0 2px 4px rgba(15, 23, 34, 0.05), 0 16px 40px rgba(15, 23, 34, 0.12)',
        card: '0 1px 0 rgba(15, 23, 34, 0.04), 0 12px 32px -12px rgba(15, 23, 34, 0.14)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      maxWidth: {
        'container-max': '1200px',
      },
    },
  },
  plugins: [],
}
