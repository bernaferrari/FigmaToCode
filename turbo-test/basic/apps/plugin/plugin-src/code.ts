import {
  run,
  flutterMain,
  tailwindMain,
  swiftuiMain,
  convertIntoAltNodes,
} from "backend";

if (figma.mode === "default" || figma.mode === "panel") {
  figma.showUI(__html__, { width: 450, height: 550 });
  figma.on("selectionchange", () => {
    run();
  });
}

if (figma.mode === "codegen") {
  figma.on("codegen", ({ node }) => {
    const convertedSelection = convertIntoAltNodes([node], null);
    const blocks: CodegenResult = [
      {
        title: `Tailwind Code`,
        code: tailwindMain(
          convertedSelection,
          node.parent ? node.parent.id : null,
          true,
          false
        ),
        language: "HTML",
      },
      {
        title: `Flutter`,
        code: flutterMain(
          convertedSelection,
          node.parent ? node.parent.id : null,
          true
        ),
        language: "SWIFT",
      },
      {
        title: `SwiftUI`,
        code: swiftuiMain(
          convertedSelection,
          node.parent ? node.parent.id : null
        ),
        language: "SWIFT",
      },
      {
        title: `Settings`,
        code: "To change settings, export to\n CodeSandbox, and see a preview,\n click in the 'Plugins' tab above",
        language: "JSON",
      },
      // {
      //   title: `Tailwind Colors`,
      //   code: JSON.stringify(colors).split(", ").join(",\n"),
      //   language: "JSON",
      // },
    ];

    figma.showUI(__html__, { visible: false });
    return blocks;
  });
}
