/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        text: "#020304",
        background: "#dceeef",
        primary: "#87c5c9",
        secondary: "#bcdfe1",
        accent: "#346669",
      },
    },
  },
  plugins: [],
};
