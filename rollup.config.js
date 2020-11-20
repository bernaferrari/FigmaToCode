import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import livereload from "rollup-plugin-livereload";
import { terser } from "rollup-plugin-terser";
import svg from "rollup-plugin-svg";
import typescript from "@rollup/plugin-typescript";

/* Post CSS */
import postcss from "rollup-plugin-postcss";
import tailwind from "tailwindcss";
import cssnano from "cssnano";

/* Inline to single html */
import htmlBundle from "rollup-plugin-html-bundle";

const production = !process.env.ROLLUP_WATCH || process.env.PRODUCTION;

export default [
  {
    input: "src/main.js",
    output: {
      file: "src/build/bundle.js",
      format: "iife",
      name: "ui",
    },
    plugins: [
      svelte({
        // enable run-time checks when not in production
        dev: !production,
        emitCss: true,
      }),

      // If you have external dependencies installed from
      // npm, you'll most likely need these plugins. In
      // some cases you'll need additional configuration —
      // consult the documentation for details:¡
      // https://github.com/rollup/plugins/tree/master/packages/commonjs
      resolve({
        browser: true,
        dedupe: (importee) =>
          importee === "svelte" || importee.startsWith("svelte/"),
        extensions: [".svelte", ".ts", ".mjs", ".js", ".json", ".node"],
      }),
      commonjs(),
      svg(),
      postcss({
        extensions: [".css"],
        // extract: true,
        plugins: [cssnano(), tailwind()],
      }),
      htmlBundle({
        template: "src/template.html",
        target: "public/index.html",
        inline: true,
      }),

      // In dev mode, call `npm run start` once
      // the bundle has been generated
      !production && serve(),

      // Watch the `dist` directory and refresh the
      // browser on changes when not in production
      !production && livereload("public"),

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser(),
    ],
    watch: {
      clearScreen: false,
    },
  },
  {
    input: "src/code.ts",
    output: {
      file: "public/code.js",
      format: "cjs",
      sourcemap: true,
    },
    plugins: [typescript(), commonjs(), production && terser()],
  },
];

function serve() {
  let started = false;

  return {
    writeBundle() {
      if (!started) {
        started = true;

        require("child_process").spawn("npm", ["run", "start", "--", "--dev"], {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true,
        });
      }
    },
  };
}
