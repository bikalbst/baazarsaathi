/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#f9f9ff',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f0f3ff',
        'surface-container': '#e7eefe',
        'surface-container-high': '#e2e8f8',
        'surface-variant': '#dce2f3',
        primary: '#006c49',
        'primary-container': '#10b981',
        'primary-fixed': '#6ffbbe',
        secondary: '#855300',
        'secondary-container': '#fea619',
        'secondary-fixed': '#ffddb8',
        tertiary: '#a43a3a',
        'tertiary-container': '#fc7c78',
        'tertiary-fixed': '#ffdad7',
        'on-surface': '#151c27',
        'on-surface-variant': '#3c4a42',
        outline: '#6c7a71',
        'outline-variant': '#bbcabf',
      },
      boxShadow: {
        ambient: '0 4px 20px rgba(0, 0, 0, 0.05)',
        'ambient-hover': '0 10px 30px rgba(0, 0, 0, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        'container-max': '1280px',
      },
    },
  },
  plugins: [],
}
