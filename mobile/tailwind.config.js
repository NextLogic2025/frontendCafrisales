/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{ts,tsx,js,jsx}', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        red: '#F0412D',
        red700: '#C52C1B',
        gold: '#F4D46A',
        cream: '#FFF5D9',
      },
    },
  },
  plugins: [],
}
