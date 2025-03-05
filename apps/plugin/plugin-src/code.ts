import { tailwindCodeGenTextStyles } from "./../../../packages/backend/src/tailwind/tailwindMain";
import {
  run,
  flutterMain,
  tailwindMain,
  swiftuiMain,
  convertIntoNodes,
  htmlMain,
  postSettingsChanged,
} from "backend";
import { nodesToJSON } from "backend/src/code";
import { retrieveGenericSolidUIColors } from "backend/src/common/retrieveUI/retrieveColors";
import { flutterCodeGenTextStyles } from "backend/src/flutter/flutterMain";
import { htmlCodeGenTextStyles } from "backend/src/html/htmlMain";
import { swiftUICodeGenTextStyles } from "backend/src/swiftui/swiftuiMain";
import { PluginSettings, SettingWillChangeMessage } from "types";

let userPluginSettings: PluginSettings;

export const defaultPluginSettings: PluginSettings = {
  framework: "HTML",
  jsx: false,
  optimizeLayout: true,
  showLayerNames: false,
  inlineStyle: true,
  responsiveRoot: false,
  flutterGenerationMode: "snippet",
  swiftUIGenerationMode: "snippet",
  roundTailwindValues: false,
  roundTailwindColors: false,
  useColorVariables: false,
  customTailwindPrefix: "",
  embedImages: false,
  embedVectors: false,
};

// A helper type guard to ensure the key belongs to the PluginSettings type
function isKeyOfPluginSettings(key: string): key is keyof PluginSettings {
  return key in defaultPluginSettings;
}

const getUserSettings = async () => {
  console.log("[DEBUG] getUserSettings - Starting to fetch user settings");
  const possiblePluginSrcSettings =
    (await figma.clientStorage.getAsync("userPluginSettings")) ?? {};
  console.log(
    "[DEBUG] getUserSettings - Raw settings from storage:",
    possiblePluginSrcSettings,
  );

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
  console.log("[DEBUG] getUserSettings - Final settings:", userPluginSettings);
  return userPluginSettings;
};

const initSettings = async () => {
  console.log("[DEBUG] initSettings - Initializing plugin settings");
  await getUserSettings();
  postSettingsChanged(userPluginSettings);
  console.log("[DEBUG] initSettings - Calling safeRun with settings");
  safeRun(userPluginSettings);
};

// Used to prevent running from happening again.
let isLoading = false;
const safeRun = async (settings: PluginSettings) => {
  console.log(
    "[DEBUG] safeRun - Called with isLoading =",
    isLoading,
    "selection =",
    figma.currentPage.selection,
  );
  if (isLoading === false) {
    try {
      isLoading = true;
      console.log("[DEBUG] safeRun - Starting run execution");
      await run(settings);
      console.log("[DEBUG] safeRun - Run execution completed");
      // hack to make it not immediately set to false when complete. (executes on next frame)
      setTimeout(() => {
        console.log("[DEBUG] safeRun - Resetting isLoading to false");
        isLoading = false;
      }, 1);
    } catch (e) {
      console.log("[DEBUG] safeRun - Error caught in execution");
      isLoading = false; // Make sure to reset the flag on error
      if (e && typeof e === "object" && "message" in e) {
        const error = e as Error;
        console.log("error: ", error.stack);
        figma.ui.postMessage({ type: "error", error: error.message });
      }
    }
  } else {
    console.log(
      "[DEBUG] safeRun - Skipping execution because isLoading =",
      isLoading,
    );
  }
};

const standardMode = async () => {
  console.log("[DEBUG] standardMode - Starting standard mode initialization");
  figma.showUI(__html__, { width: 450, height: 700, themeColors: true });
  await initSettings();

  // Listen for selection changes
  figma.on("selectionchange", () => {
    console.log(
      "[DEBUG] selectionchange event - New selection:",
      figma.currentPage.selection,
    );
    safeRun(userPluginSettings);
  });

  // Listen for document changes
  figma.on("documentchange", () => {
    console.log("[DEBUG] documentchange event triggered");
    // Node: This was causing an infinite load when you try to export a background image from a group that contains children.
    // The reason for this is that the code will temporarily hide the children of the group in order to export a clean image
    // then restores the visibility of the children. This constitutes a document change so it's restarting the whole conversion.
    // In order to stop this, we disable safeRun() when doing conversions (while isLoading === true).
    safeRun(userPluginSettings);
  });

  figma.ui.onmessage = (msg) => {
    console.log("[DEBUG] figma.ui.onmessage", msg);

    if (msg.type === "pluginSettingWillChange") {
      const { key, value } = msg as SettingWillChangeMessage<unknown>;
      console.log(`[DEBUG] Setting changed: ${key} = ${value}`);
      (userPluginSettings as any)[key] = value;
      figma.clientStorage.setAsync("userPluginSettings", userPluginSettings);
      safeRun(userPluginSettings);
    }
  };
};

const codegenMode = async () => {
  console.log("[DEBUG] codegenMode - Starting codegen mode initialization");
  // figma.showUI(__html__, { visible: false });
  await getUserSettings();

  figma.codegen.on(
    "generate",
    async ({ language, node }: CodegenEvent): Promise<CodegenResult[]> => {
      console.log(
        `[DEBUG] codegen.generate - Language: ${language}, Node:`,
        node,
      );

      const nodeJson = await nodesToJSON([node]);
      const convertedSelection = await convertIntoNodes(nodeJson, null);
      console.log(
        "[DEBUG] codegen.generate - Converted selection:",
        convertedSelection,
      );

      switch (language) {
        case "html":
          return [
            {
              title: "Code",
              code: await htmlMain(
                convertedSelection,
                { ...userPluginSettings, jsx: false },
                true,
              ),
              language: "HTML",
            },
            {
              title: "Text Styles",
              code: htmlCodeGenTextStyles(userPluginSettings),
              language: "HTML",
            },
          ];
        case "html_jsx":
          return [
            {
              title: "Code",
              code: await htmlMain(
                convertedSelection,
                { ...userPluginSettings, jsx: true },
                true,
              ),
              language: "HTML",
            },
            {
              title: "Text Styles",
              code: htmlCodeGenTextStyles(userPluginSettings),
              language: "HTML",
            },
          ];
        case "tailwind":
        case "tailwind_jsx":
          return [
            {
              title: "Code",
              code: await tailwindMain(convertedSelection, {
                ...userPluginSettings,
                jsx: language === "tailwind_jsx",
              }),
              language: "HTML",
            },
            // {
            //   title: "Style",
            //   code: tailwindMain(convertedSelection, defaultPluginSettings),
            //   language: "HTML",
            // },
            {
              title: "Tailwind Colors",
              code: retrieveGenericSolidUIColors("Tailwind")
                .map((d) => {
                  let str = `${d.hex};`;
                  if (d.colorName !== d.hex) {
                    str += ` // ${d.colorName}`;
                  }
                  if (d.meta) {
                    str += ` (${d.meta})`;
                  }
                  return str;
                })
                .join("\n"),
              language: "JAVASCRIPT",
            },
            {
              title: "Text Styles",
              code: tailwindCodeGenTextStyles(),
              language: "HTML",
            },
          ];
        case "flutter":
          return [
            {
              title: "Code",
              code: flutterMain(convertedSelection, {
                ...userPluginSettings,
                flutterGenerationMode: "snippet",
              }),
              language: "SWIFT",
            },
            {
              title: "Text Styles",
              code: flutterCodeGenTextStyles(),
              language: "SWIFT",
            },
          ];
        case "swiftUI":
          return [
            {
              title: "SwiftUI",
              code: swiftuiMain(convertedSelection, {
                ...userPluginSettings,
                swiftUIGenerationMode: "snippet",
              }),
              language: "SWIFT",
            },
            {
              title: "Text Styles",
              code: swiftUICodeGenTextStyles(),
              language: "SWIFT",
            },
          ];
        default:
          break;
      }

      const blocks: CodegenResult[] = [];
      return blocks;
    },
  );
};

switch (figma.mode) {
  case "default":
  case "inspect":
    console.log("[DEBUG] Starting plugin in", figma.mode, "mode");
    standardMode();
    break;
  case "codegen":
    console.log("[DEBUG] Starting plugin in codegen mode");
    codegenMode();
    break;
  default:
    console.log("[DEBUG] Unknown plugin mode:", figma.mode);
    break;
}
