/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        slate: {
          850: '#151f32',
          950: '#020617',
        },
        brand: {
          dark: '#002147',
          blue: '#2264ab',
        }
      }
    },
  },
  plugins: [],
}