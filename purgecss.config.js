module.exports = {
    content: ['public/index.html', 'public/*.js'],
    css: ['public/global.css'],
    defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || [],
};