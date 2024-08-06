/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./**/*.tsx"],
  plugins: [],
  theme: {
    extend: {
      colors: {
        "gradient-start": "#f5f7fa",
        "gradient-end": "#c3cfe2"
      }
    }
  }
}
