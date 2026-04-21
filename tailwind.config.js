/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  important: '#root', // To ensure Tailwind classes override MUI defaults easily if needed
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4a83b6',
          DEFAULT: '#4276a4',
          dark: '#2d5f88',
        },
        secondary: {
          DEFAULT: '#c94a38',
          hover: '#b03d2e',
        }
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: true, // Standard Tailwind reset
  },
}
