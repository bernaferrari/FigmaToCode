<p align="center"><img src="assets/icon_256.png" alt="Figma to Code" height="128px"></p>

# Figma to Code

<p align="center">
<a href="https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=bernaferrari/FigmaToCode&amp;utm_campaign=Badge_Grade"><img src="https://app.codacy.com/project/badge/Grade/af3321afff1f4d078037e09111120384"/></a>
<a href="https://www.codacy.com?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=bernaferrari/FigmaToCode&amp;utm_campaign=Badge_Coverage"><img src="https://app.codacy.com/project/badge/Coverage/af3321afff1f4d078037e09111120384"/></a>
<a href="http://twitter.com/bernaferrari"><img src="https://img.shields.io/badge/Twitter-@bernaferrari-brightgreen.svg?style=flat" style="max-height: 300px;" alt="Twitter"/></a>
</p>



Most *design to code* plugins are bad. This project aims to solve, or at least improve, the situation. This plugin generates responsive layouts in [Tailwind](https://tailwindcss.com/) and [Flutter](https://flutter.github.io/). The plan is to eventually add support for [Jetpack Compose](https://developer.android.com/jetpack/compose) and possibly standard HTML or other frameworks like [React Native](https://reactnative.dev/), [SwiftUI](https://developer.apple.com/xcode/swiftui/), [Bootstrap](https://getbootstrap.com/), [Material](https://material.io/develop/web/) or [Fluent](https://www.microsoft.com/design/fluent/). Feedback and partnerships are appreciated!

![Gif showing the conversion](assets/lossy_gif.gif)

## How it works

This plugin takes an unconventional approach to improve code quality: it optimizes the layout before the conversion to code even begins. The standard Figma [Nodes](https://www.figma.com/plugin-docs/api/nodes/) (what represents each layer) was a joy to work with, but it can't modify a layer without modifying the user project. For this reason, I decided to virtualize it, remaking the official implementation and naming it `AltNodes`. During the process to convert a `Node` into an `AltNode`, the plugin does the following:

![Conversion Workflow](assets/workflow.png)

## Hard cases

When finding the unknown (a `Group` or `Frame` with more than one child and no vertical or horizontal alignment), Tailwind mode uses [insets](https://tailwindcss.com/docs/top-right-bottom-left/#app) for best cases and `left`, `top` from standard CSS for the worst cases. Flutter mode uses `Stack` and `Positioned.fill`. Both are usually not recommended and can easily defeat the responsiveness. In many scenarios, just wrapping some elements in a `Group` or `Frame` can solve:

![Conversion Workflow](assets/examples.png)

## Todo

- Vectors (tricky in HTML, unsupported in Flutter)
- Images (they are local, how to support?)
- Gradients (unsupported by Tailwind, todo in Flutter)
- Line/Star/Polygon (todo. Rectangle and Ellipse were prioritized and are more common)
- Identify buttons
- The source code is fully commented and there are around 30 "todo"s there

### Tailwind limitations

- **Width:** Tailwind has a maximum width of 256px. If an item passes this, the width will be set to `w-full` (unless it is already relative like `w-1/2`, `w-1/3`, etc). This is usually a feature, but be careful: if most layers in your project are larger than 256px, the plugin's result might be less than optimal.
- **Height:** The plugin avoids setting the height whenever possible, because width and height work differently in CSS. `h-full` means get the full height of the parent, but the parent **must** have it, while `w-full` doesn't require it. During experiments, avoiding a fixed height, in most cases, brought improved responsiveness and avoided nondeterministic scenarios.

### Flutter limits and ideas

- **Align:** currently items are aligned inside a Row/Column according to their average position. Todo: find a way to improve this.
- **Unreadable code:** output code is not formatted, but even [dartpad](https://dartpad.dev/) offers a format button.
- **Stack:** in some simpler cases, a `Stack` could be replaced with a `Container` and a `BoxDecoration`. Discover those cases and optimize them.
- **Material Styles**: texts could be matched to existing Material styles (like outputting `Headline6` when text size is 20).
- **Identify FlatButtons**: the plugin could identify specific buttons and output them instead of always using `Container` or `Material`.

### How to build the project

The project is configured to be built with Webpack or Rollup. The author couldn't find a way to correctly configure Svelte in Webpack, so Rollup was added. But Rollup is a lot less stable than Webpack and crashes regularly in watch mode when editing Typescript files. So, if you are going to work only Typescript, I reccommend sticking with Webpack. If you are going to make changes in the UI, you **need** to use Rollup for now.

## Issues

The Figma file for this README and icon is also open! [Check it here](https://www.figma.com/file/8buWpm6Mpq4yK9MhbkcdJB/Figma-to-Code).
It is hard to work alone. I took decisions thinking about how it would benefit the majority of people, but I can (and probably will!) be wrong many times. Found a bug? Have an idea for an improvement? Feel free to [add an issue](../../issues) or email me. Pull requests are also more than welcome.