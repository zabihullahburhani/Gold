/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{ts,tsx,js,jsx}"
  ],
 theme: {
    extend: {
      colors: {
        gold: "#D4AF37",
        "bg-dark": "#0b0b0b",
        "card-dark": "#121212"
      }
    }
  },
  plugins: []
}
