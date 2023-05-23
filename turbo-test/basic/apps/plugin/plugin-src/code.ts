import {
  run,
  flutterMain,
  tailwindMain,
  swiftuiMain,
  convertIntoNodes,
  FrameworkTypes,
  htmlMain,
} from "backend";

const settings: {
  framework: FrameworkTypes;
} = {
  framework: "HTML",
};

const initSettings = () => {
  figma.clientStorage.getAsync("settings").then((clientSettings) => {
    if (clientSettings && clientSettings.lastSelected) {
      settings.framework = clientSettings.lastSelected;
    } else {
      settings.framework = "HTML";
    }

    figma.ui.postMessage({
      type: "tabChange",
      data: settings.framework,
    });

    safeRun(settings.framework);
  });
};


const safeRun = (framework: FrameworkTypes) => {
  try {
    run(framework);
  } catch (e) {
    console.log(e);

    if (e && typeof e === "object" && "message" in e) {
      figma.ui.postMessage({
        type: "error",
        data: e.message,
      });
    }
  }
};

switch (figma.mode) {
  case "default":
  case "panel":
    let isJsx = false;
    let layerName = false;

    initSettings();

    figma.showUI(__html__, { width: 450, height: 550, themeColors: true });
    figma.on("selectionchange", () => {
      safeRun(settings.framework);
    });
    figma.ui.onmessage = (msg) => {
      if (msg.type === "tabChange") {
        // get from storage
        figma.clientStorage.setAsync("settings", {
          whenOpen: "lastSelected",
          lastSelected: msg.data,
        });

        settings.framework = msg.data;

        // if (
        //   msg.type === "Tailwind" ||
        //   msg.type === "Flutter" ||
        //   msg.type === "SwiftUI" ||
        //   msg.type === "HTML"
        // ) {
        //   mode = msg.type;
        //   run(mode);
        // } else if (msg.type === "jsx" && msg.data !== isJsx) {
        //   isJsx = msg.data;
        //   run(mode);
        // } else if (msg.type === "layerName" && msg.data !== layerName) {
        //   layerName = msg.data;
        //   run(mode);
        // }
        safeRun(settings.framework);
      }
    };
    break;
  case "codegen":
    initSettings();
    figma.codegen.on("generate", ({ language, node }) => {
      const convertedSelection = convertIntoNodes([node], null);

      switch (language) {
        case "html":
          return [
            {
              title: `HTML`,
              code: htmlMain(convertedSelection, node.parent?.id, true),
              language: "HTML",
            },
          ];
        case "tailwind":
          return [
            {
              title: `Whole Code`,
              code: tailwindMain(
                convertedSelection,
                node.parent?.id,
                true,
                false
              ),
              language: "HTML",
            },
            {
              title: `Layout`,
              code: tailwindMain(
                convertedSelection,
                node.parent?.id,
                true,
                false
              ),
              language: "HTML",
            },
            {
              title: `Style`,
              code: tailwindMain(
                convertedSelection,
                node.parent?.id,
                true,
                false
              ),
              language: "HTML",
            },
            {
              title: `Colors`,
              code: tailwindMain(
                convertedSelection,
                node.parent?.id,
                true,
                false
              ),
              language: "HTML",
            },
          ];
        case "flutter":
          return [
            {
              title: `Flutter`,
              code: flutterMain(convertedSelection, node.parent?.id, true),
              language: "SWIFT",
            },
          ];
        case "swiftui":
          return [
            {
              title: `SwiftUI`,
              code: swiftuiMain(convertedSelection, node.parent?.id),
              language: "SWIFT",
            },
          ];
        default:
          break;
      }

      const blocks: CodegenResult[] = [
        {
          title: `Tailwind Code`,
          code: tailwindMain(convertedSelection, node.parent?.id, true, false),
          language: "HTML",
        },
        {
          title: `Flutter`,
          code: flutterMain(convertedSelection, node.parent?.id, true),
          language: "SWIFT",
        },
        {
          title: `SwiftUI`,
          code: swiftuiMain(convertedSelection, node.parent?.id),
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
  default:
    break;
}
