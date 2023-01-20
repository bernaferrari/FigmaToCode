/* eslint-disable @typescript-eslint/no-var-requires */
const tailwindcss = require('tailwindcss')
const path = require('path')

module.exports = {
    plugins: [
        require('postcss-import'),
        tailwindcss(path.join(__dirname, 'tailwind.config.js')),
        require('autoprefixer'),
    ],
}
