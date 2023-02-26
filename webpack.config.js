/* eslint-disable @typescript-eslint/no-var-requires */
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");
const tailwindcss = require("tailwindcss");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

console.log("env", process.env.NODE_ENV);

const mode = process.env.NODE_ENV || "development";
const prod = mode === "production";

module.exports = {
  mode,
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"), // Compile into a folder called "dist"
    clean: true,
    publicPath: "/",
  },
  entry: {
    ui: "./src/main.js", // The entry point for UI code
    code: "./src/code.ts", // The entry point for plugin code
  },
  devtool: prod ? false : "inline-source-map",
  resolve: {
    alias: {
      svelte: path.dirname(require.resolve("svelte/package.json")),
    },
    extensions: [".tsx", ".ts", ".js", ".svelte"],
    mainFields: ["svelte", "browser", "module", "main"],
  },
  optimization: {
    minimize: true,
    minimizer: ["...", new CssMinimizerPlugin({ parallel: true })],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.svelte$/,
        use: {
          loader: "svelte-loader",
          options: {
            compilerOptions: {
              // NOTE Svelte's dev mode MUST be enabled for HMR to work
              dev: false,
            },
            // NOTE emitCss: true is currently not supported with HMR
            // Enable it for production to output separate css file
            emitCss: true,
            // Enable HMR only for dev mode
            hotReload: false,
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              sourceMap: !prod,
              url: false, // necessary if you use url('/path/to/some/asset.png|jpg|gif')
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  tailwindcss(path.join(__dirname, "tailwind.config.js")),
                  require("autoprefixer"),
                ],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      global: {}, // Fix missing symbol error when running in developer VM
    }),
    new HtmlWebpackPlugin({
      inject: "body",
      template: "./src/template.html",
      filename: "index.html",
      chunks: ["ui"],
    }),
    new HtmlInlineScriptPlugin({ scriptMatchPattern: [/ui/] }),
  ],
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename],
    },
    cacheDirectory: path.resolve(__dirname, "node_modules/.cache/webpack"),
  },
};
