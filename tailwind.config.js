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
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sansSerif: "sans-serif",
      },
      backgroundColor: {
        darkOffset: "#111111",
      },
      colors: {
        dark: {
          bg: "#000000",
          card: "#111111",
          border: "#222222",
        },
      },
      boxShadow: {
        lg: "rgba(100, 100, 111, 0.2) 0px 7px 29px 0px",
      },
    },
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
