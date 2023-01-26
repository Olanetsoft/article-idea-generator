/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        Ubuntu: "'Ubuntu'",
        OpenSans: "'Open Sans'",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
