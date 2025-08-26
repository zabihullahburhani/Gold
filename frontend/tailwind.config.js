/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}"
  ],

theme: {
    extend: {
      colors: {
        gold: {
          400: "#d4af37", // رنگ طلایی برای متن
        },
        darkbg: "#1a1a1a", // رنگ عقب کمی سیاه
      },
      fontFamily: {
        vazir: ["Vazir", "sans-serif"], // فونت فارسی دلخواه
      },
    },
  },
  plugins: [],
};
