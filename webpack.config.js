/* eslint-disable @typescript-eslint/no-var-requires */
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const tailwindcss = require('tailwindcss');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

console.log('env', process.env.NODE_ENV);

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

const commonConfig = {
  mode,
  devtool: prod ? false : 'inline-source-map',
  resolve: {
    alias: {
      svelte: path.dirname(require.resolve('svelte/package.json')),
    },
    extensions: ['.tsx', '.ts', '.js', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main'],
  },
  optimization: {
    minimize: prod,
    minimizer: ['...', new CssMinimizerPlugin({ parallel: true })],
  },
  devServer: {
    hot: true,
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            preprocess: require('svelte-preprocess')({
              // crashes the build in webpack
              // do not use
              // postcss: true,
            }),
            compilerOptions: {
              // NOTE Svelte's dev mode MUST be enabled for HMR to work
              dev: !prod,
            },
            // NOTE emitCss: true is currently not supported with HMR
            // Enable it for production to output separate css file
            emitCss: prod,
            // Enable HMR only for dev mode
            hotReload: !prod,
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          // 'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: !prod,
              url: false, // necessary if you use url('/path/to/some/asset.png|jpg|gif')
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  tailwindcss(path.join(__dirname, 'tailwind.config.js')),
                  require('autoprefixer'),
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
  ],
};

module.exports = [
  {
    ...commonConfig,
    name: 'code',
    entry: './src/code.ts',
    output: {
      filename: 'code.js',
      path: path.resolve(__dirname, 'public'),
    },
  },
  {
    ...commonConfig,
    name: 'ui',
    entry: './src/main.js',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'public'),
      library: 'ui',
      libraryTarget: 'var',
    },
    plugins: [
      ...commonConfig.plugins,
      new HtmlWebpackPlugin({
        title: 'FigmaToCode',
        template: 'src/template.html',
        filename: path.join(__dirname, 'public/index.html'),
      }),
    ],
  },
];
