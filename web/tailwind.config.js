/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
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
};
