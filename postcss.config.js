
const production = !process.env.ROLLUP_WATCH || process.env.PRODUCTION;

const tailwind = require("tailwindcss");

const autoprefixer = require("autoprefixer");

const purgecss = require("@fullhuman/postcss-purgecss")({
  content: ["./src/**/*.svelte", "./src/**/*.html"],
  whitelistPatterns: [/svelte-/],
  whitelistPatternsChildren: [/^token/, /^Prism/, /^code/, /^pre/],
  defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
})

const cssnano = require("cssnano");

module.exports = {
  plugins: [tailwind, ...(production ? [autoprefixer, purgecss, cssnano] : [])],
}