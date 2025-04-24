<!-- <p align="center"><img src="assets/icon_256.png" alt="Figma to Code" height="128px"></p> -->

[![Figma to Code](assets/git_preview.png)](https://www.figma.com/community/plugin/842128343887142055)

# Figma to Code

<p align="center">
<a href="https://github.com/bernaferrari/FigmaToCode/actions/"><img src="https://github.com/bernaferrari/FigmaToCode/workflows/CI/badge.svg"/></a>
<a href="https://codecov.io/gh/bernaferrari/FigmaToCode"><img src="https://codecov.io/gh/bernaferrari/FigmaToCode/branch/master/graph/badge.svg" /></a>
<a href="http://twitter.com/bernaferrari">
<img src="https://img.shields.io/badge/Twitter-@bernaferrari-brightgreen.svg?style=flat" alt="Twitter"/></a>
</p><p align="center">
<a href="https://www.figma.com/community/plugin/842128343887142055"><img src="assets/badge.png" height="60"/></a>
</p>

Converting Figma designs into usable code can be a challenge, often requiring time-consuming manual work. Figma to Code simplifies that process. This plugin generates responsive layouts in `HTML`, `React (JSX)`, `Svelte`, `styled-components`, `Tailwind`, `Flutter`, and `SwiftUI` directly from your designs. Your feedback and ideas are always welcome.

![Gif showing the conversion](assets/lossy_gif.gif)

## How it works

The plugin uses a sophisticated multi-step process to transform your Figma designs into clean, optimized code:

1. **Node Conversion**: First, the plugin converts Figma's native nodes into JSON representations, preserving all necessary properties while adding optimizations and parent references.

2. **Intermediate Representation**: The JSON nodes are then transformed into `AltNodes` - a custom virtual representation that can be manipulated without affecting your original design.

3. **Layout Optimization**: The plugin analyzes and optimizes layouts, detecting patterns like auto-layouts, responsive constraints and color variables.

4. **Code Generation**: Finally, the optimized structure is transformed into the target framework's code, with special handling for each framework's unique patterns and best practices. If a feature is unsupported, the plugin will provide a warning.

![Conversion Workflow](assets/workflow.png)

This intermediate representation approach allows for sophisticated transformations and optimizations before any code is generated, resulting in cleaner, more maintainable output.

## Hard cases

Converting visual designs to code inevitably encounters complex edge cases. Here are some challenges the plugin handles:

1. **Complex Layouts**: When working with mixed positioning (absolute + auto-layout), the plugin has to make intelligent decisions about how to structure the resulting code. It detects parent-child relationships and z-index ordering to produce the most accurate representation.

2. **Color Variables**: The plugin detects and processes color variables, allowing for theme-consistent output.

3. **Gradients and Effects**: Different frameworks handle gradients and effects in unique ways, requiring specialized conversion logic.

![Conversion Workflow](assets/examples.png)

**Tip**: Instead of selecting the whole page, you can also select individual items. This can be useful for both debugging and componentization. For example: you can use the plugin to generate the code of a single element and then replicate it using a for-loop.

### Todo

- Vectors (possible to enable in HTML and Tailwind)
- Images (possible to enable to inline them in HTML and Tailwind)
- Line/Star/Polygon

## How to build the project

### Package Manager

The project is configured for [pnpm](https://pnpm.io/). To install, see the [installation notes for pnpm](https://pnpm.io/installation).

### Monorepo

The plugin is organized as a monorepo. There are several packages:

- `packages/backend` - Contains the business logic that reads the Figma API and converts nodes
- `packages/plugin-ui` - Contains the common UI for the plugin
- `packages/eslint-config-custom` - Config file for ESLint
- `packages/tsconfig` - Collection of TSConfig files used throughout the project

- `apps/plugin` - This is the actual plugin assembled from the parts in `backend` & `plugin-ui`. Within this folder it's divided between:
  - `plugin-src` - loads from `backend` and compiles to `code.js`
  - `ui-src` - loads the common `plugin-ui` and compiles to `index.html`
- `apps/debug` - This is a debug mode plugin that is a more convenient way to see all the UI elements.

### Development Workflow

The project uses [Turborepo](https://turborepo.com/) for managing the monorepo, and each package is compiled using [esbuild](https://esbuild.github.io/) for fast development cycles. Only modified files are recompiled when changes are made, making the development process more efficient.

#### Running the Project

You have two main options for development:

1. **Root development mode** (includes debug UI):

   ```bash
   pnpm dev
   ```

   This runs the plugin in dev mode and also starts a Next.js server for the debug UI. You can access the debug UI at `http://localhost:3000`.

2. **Plugin-only development mode**:

   ```bash
   cd apps/plugin
   pnpm dev
   ```

   This focuses only on the plugin without the Next.js debug UI. Use this when you're making changes specifically to the plugin.

#### Where to Make Changes

Most of your development work will happen in these directories:

- `packages/backend` - For plugin backend
- `packages/plugin-ui` - For plugin UI
- `apps/plugin/` - The main plugin result that combines the backend and UI and is called by Figma.

You'll rarely need to modify files directly in the `apps/` directory, as they mostly contain build configuration.

#### Commands

`pnpm run ...`

- `dev` - runs the app in dev mode. This can be run in the Figma editor.
- `build` - builds the project for production
- `build:watch` - builds and watches for changes
- `lint` - runs ESLint
- `format` - formats with prettier (warning: may edit files!)

#### Debug mode

When running the `dev` task, you can open `http://localhost:3000` to see the debug version of the UI.

<img width="600" alt="Screenshot 2024-12-13 at 16 26 43" src="https://github.com/user-attachments/assets/427fb066-70e1-47bd-8718-51f7f4d83e35" />

## Issues

The Figma file for this README and icon is also open and welcome to changes! [Check it here.](https://www.figma.com/file/8buWpm6Mpq4yK9MhbkcdJB/Figma-to-Code)

I took decisions thinking about how it would benefit the majority of people, but I can (and probably will!) be wrong many times. Found a bug? Have an idea for an improvement? Feel free to [add an issue](../../issues) or email me. Pull requests are also more than welcome.
