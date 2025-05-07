

/** @type {import('tailwindcss').Config} */


module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Culori personalizate (ex: inspirate din Google Classroom)
        "primary": "#1a73e8",
        "secondary": "#fbbc04",
        "background": "#f8f9fa",
      },
    },
  },
  plugins: [],
}