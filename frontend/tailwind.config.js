/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",  // تمام فایل‌های داخل src
  ],

  theme: {
    extend: {
        fontFamily: {
            vazir: ['Vazirmatn', 'Helvetica', 'sans-serif'], // فونت پیش‌فرض
        },
    },
  },

  
  plugins: [],
}
