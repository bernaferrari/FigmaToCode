import { tailwindCodeGenTextStyles } from "./../../../packages/backend/src/tailwind/tailwindMain";
import {
  run,
  flutterMain,
  tailwindMain,
  swiftuiMain,
  convertIntoNodes,
  htmlMain,
  PluginSettings,
} from "backend";
import { retrieveGenericSolidUIColors } from "backend/src/common/retrieveUI/retrieveColors";
import { flutterCodeGenTextStyles } from "backend/src/flutter/flutterMain";
import { htmlCodeGenTextStyles } from "backend/src/html/htmlMain";
import { swiftUICodeGenTextStyles } from "backend/src/swiftui/swiftuiMain";

let userPluginSettings: PluginSettings;

const defaultPluginSettings: PluginSettings = {
  framework: "HTML",
  jsx: false,
  optimizeLayout: true,
  layerName: false,
  inlineStyle: true,
  responsiveRoot: false,
  flutterGenerationMode: "snippet",
  swiftUIGenerationMode: "snippet",
};

// A helper type guard to ensure the key belongs to the PluginSettings type
function isKeyOfPluginSettings(key: string): key is keyof PluginSettings {
  return key in defaultPluginSettings;
}

const getUserSettings = async () => {
  const possiblePluginSrcSettings =
    (await figma.clientStorage.getAsync("userPluginSettings")) ?? {};

  const updatedPluginSrcSettings = {
    ...defaultPluginSettings,
    ...Object.keys(defaultPluginSettings).reduce((validSettings, key) => {
      if (
        isKeyOfPluginSettings(key) &&
        key in possiblePluginSrcSettings &&
        typeof possiblePluginSrcSettings[key] ===
          typeof defaultPluginSettings[key]
      ) {
        validSettings[key] = possiblePluginSrcSettings[key] as any;
      }
      return validSettings;
    }, {} as Partial<PluginSettings>),
  };

  userPluginSettings = updatedPluginSrcSettings as PluginSettings;
};

const initSettings = async () => {
  await getUserSettings();
  figma.ui.postMessage({
    type: "pluginSettingChanged",
    data: userPluginSettings,
  });

  safeRun(userPluginSettings);
};

const safeRun = (settings: PluginSettings) => {
  try {
    run(settings);
  } catch (e) {
    if (e && typeof e === "object" && "message" in e) {
      console.log("error: ", (e as any).stack);
      figma.ui.postMessage({
        type: "error",
        data: e.message,
      });
    }
  }
};

const standardMode = async () => {
  figma.showUI(__html__, { width: 450, height: 550, themeColors: true });
  await initSettings();
  figma.on("selectionchange", () => {
    safeRun(userPluginSettings);
  });
  figma.ui.onmessage = (msg) => {
    console.log("[node] figma.ui.onmessage", msg);

    if (msg.type === "pluginSettingChanged") {
      (userPluginSettings as any)[msg.key] = msg.value;
      figma.clientStorage.setAsync("userPluginSettings", userPluginSettings);
      // figma.ui.postMessage({
      //   type: "pluginSettingChanged",
      //   data: userPluginSettings,
      // });
      safeRun(userPluginSettings);
    }
  };
};

switch (figma.mode) {
  case "default":
  case "inspect":
    standardMode();
    break;
  case "codegen":
    initSettings();
    // figma.codegen.on("preferenceschange", (preferences) => {

    // });
    figma.codegen.on("generate", ({ language, node }) => {
      const convertedSelection = convertIntoNodes([node], null);

      switch (language) {
        case "html":
          return [
            {
              title: `Code`,
              code: htmlMain(
                convertedSelection,
                { ...defaultPluginSettings, jsx: false },
                true
              ),
              language: "HTML",
            },
            {
              title: `Text Styles`,
              code: htmlCodeGenTextStyles(false),
              language: "HTML",
            },
          ];
        case "html_jsx":
          return [
            {
              title: `Code`,
              code: htmlMain(
                convertedSelection,
                { ...defaultPluginSettings, jsx: true },
                true
              ),
              language: "HTML",
            },
            {
              title: `Text Styles`,
              code: htmlCodeGenTextStyles(true),
              language: "HTML",
            },
          ];
        case "tailwind":
          return [
            {
              title: `Code`,
              code: tailwindMain(convertedSelection, {
                ...defaultPluginSettings,
                jsx: false,
              }),
              language: "HTML",
            },
            {
              title: `Colors`,
              code: retrieveGenericSolidUIColors("Tailwind")
                .map((d) => `#${d.hex} <- ${d.colorName}`)
                .join("\n"),
              language: "HTML",
            },
            {
              title: `Text Styles`,
              code: tailwindCodeGenTextStyles(),
              language: "HTML",
            },
          ];
        case "tailwind_jsx":
          return [
            {
              title: `Code`,
              code: tailwindMain(convertedSelection, {
                ...defaultPluginSettings,
                jsx: true,
              }),
              language: "HTML",
            },
            // {
            //   title: `Style`,
            //   code: tailwindMain(convertedSelection, defaultPluginSettings),
            //   language: "HTML",
            // },
            {
              title: `Colors`,
              code: retrieveGenericSolidUIColors("Tailwind")
                .map((d) => `#${d.hex} <- ${d.colorName}`)
                .join("\n"),
              language: "HTML",
            },
            {
              title: `Text Styles`,
              code: tailwindCodeGenTextStyles(),
              language: "HTML",
            },
          ];
        case "flutter":
          return [
            {
              title: `Code`,
              code: flutterMain(convertedSelection, {
                ...defaultPluginSettings,
                flutterGenerationMode: "snippet",
              }),
              language: "SWIFT",
            },
            {
              title: `Text Styles`,
              code: flutterCodeGenTextStyles(),
              language: "SWIFT",
            },
          ];
        case "swiftUI":
          return [
            {
              title: `SwiftUI`,
              code: swiftuiMain(convertedSelection, defaultPluginSettings),
              language: "SWIFT",
            },
            {
              title: `Text Styles`,
              code: swiftUICodeGenTextStyles(),
              language: "SWIFT",
            },
          ];
        default:
          break;
      }

      const blocks: CodegenResult[] = [
        // {
        //   title: `Code`,
        //   code: tailwindMain(convertedSelection, defaultPluginSettings),
        //   language: "HTML",
        // },
        // {
        //   title: `Flutter`,
        //   code: flutterMain(convertedSelection, defaultPluginSettings),
        //   language: "SWIFT",
        // },
        // {
        //   title: `SwiftUI`,
        //   code: swiftuiMain(convertedSelection, node.parent?.id),
        //   language: "SWIFT",
        // },
        // {
        //   title: `Settings`,
        //   code: "To change settings, export to\n CodeSandbox, and see a preview,\n click in the 'Plugins' tab above",
        //   language: "JSON",
        // },
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
