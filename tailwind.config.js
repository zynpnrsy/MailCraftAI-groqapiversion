/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "dash-bg": "#050816",
        "dash-surface": "#0b1020",
        "dash-surface-alt": "#111827",
        "dash-purple": "#8b5cf6",
        "dash-purple-soft": "#4c1d95"
      }
    }
  },
  plugins: []
};

