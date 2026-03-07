/** @type {import('tailwindcss').Config} */
const monochromeScale = {
  50: "#0a0a0a",
  100: "#171717",
  200: "#262626",
  300: "#404040",
  400: "#525252",
  500: "#737373",
  600: "#a3a3a3",
  700: "#d4d4d4",
  800: "#e5e5e5",
  900: "#f5f5f5",
}

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: monochromeScale,
        indigo: monochromeScale,
        purple: monochromeScale,
        cyan: monochromeScale,
      },
    },
  },
  plugins: [],
}
