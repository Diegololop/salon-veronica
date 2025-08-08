/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#258d96', // Nuevo color principal
        secondary: '#a8d4c4', // Verde menta
      },
    },
  },
  plugins: [],
};
