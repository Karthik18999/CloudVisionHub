/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aws: {
          orange: '#FF9900',
          squid: '#232F3E',
          navy: '#0F172A',
          blue: '#146EB4',
          accent: '#38BDF8'
        }
      }
    },
  },
  plugins: [],
}
