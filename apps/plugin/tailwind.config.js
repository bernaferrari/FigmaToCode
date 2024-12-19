module.exports = {
  content: [
    "plugin-ui",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/plugin-ui/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: process.env.TAILWIND_PREFIX || "",
  darkMode: "class",
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
