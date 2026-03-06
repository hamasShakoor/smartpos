/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#ff9f43', dark: '#f08a2a', light: '#fff3e6' },
        sidebar: '#1b1b2e',
      },
      fontFamily: { sans: ['Nunito', 'sans-serif'] },
    }
  },
  plugins: []
}
