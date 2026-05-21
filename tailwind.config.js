/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#16a34a",
          600: "#15803d",
          700: "#166534",
          800: "#14532d",
          900: "#052e16",
        },
        dark: {
          bg: "#111318",
          surface: "#1a1d24",
          card: "#21252e",
          border: "#2e3340",
          hover: "#2a2f3a",
          input: "#1e2229",
        },
      },
      fontFamily: {
        sans: ["'DM Sans'", "'Noto Sans Bengali'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
