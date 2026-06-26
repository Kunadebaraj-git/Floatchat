/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          deep: '#0a2647',
          medium: '#144272',
          light: '#205295',
          accent: '#2C74B3',
        }
      }
    },
  },
  plugins: [],
}
