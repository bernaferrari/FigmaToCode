const prod = process.env.NODE_ENV === "production";

module.exports = {
  purge: {
    enabled: prod,
    content: ["./src/**/*.svelte"],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
