import { convertIntoNodes } from "./altNodes/altConversion";
import {
  retrieveGenericSolidUIColors,
  retrieveGenericLinearGradients as retrieveGenericGradients,
} from "./common/retrieveUI/retrieveColors";
import { flutterMain } from "./flutter/flutterMain";
import { htmlMain } from "./html/htmlMain";
import { swiftuiMain } from "./swiftui/swiftuiMain";
import { tailwindMain } from "./tailwind/tailwindMain";

export type FrameworkTypes = "Flutter" | "SwiftUI" | "HTML" | "Tailwind";

export type PluginSettings = {
  framework: FrameworkTypes;
  jsx: boolean;
  inlineStyle: boolean;
  optimizeLayout: boolean;
  layerName: boolean;
  responsiveRoot: boolean;
  flutterGenerationMode: string;
  swiftUIGenerationMode: string;
  roundTailwind: boolean;
  roundTailwindColors: boolean;
  preferColorAlias: boolean;
};

export const run = async (settings: PluginSettings) => {
  // ignore when nothing was selected
  if (figma.currentPage.selection.length === 0) {
    figma.ui.postMessage({
      type: "empty",
    });
    return;
  }

  const convertedSelection = convertIntoNodes(
    figma.currentPage.selection,
    null
  );
  let result = "";
  switch (settings.framework) {
    case "HTML":
      result = htmlMain(convertedSelection, settings);
      break;
    case "Tailwind":
      result = await tailwindMain(convertedSelection, settings);
      break;
    case "Flutter":
      result = flutterMain(convertedSelection, settings);
      break;
    case "SwiftUI":
      result = swiftuiMain(convertedSelection, settings);
      break;
  }

  figma.ui.postMessage({
    type: "code",
    data: result,
    settings: settings,
    htmlPreview:
      convertedSelection.length > 0
        ? {
            size: convertedSelection.map((node) => ({
              width: node.width,
              height: node.height,
            }))[0],
            content: htmlMain(
              convertedSelection,
              {
                ...settings,
                jsx: false,
              },
              true
            ),
          }
        : null,
    colors: await retrieveGenericSolidUIColors(settings.framework),
    gradients: await retrieveGenericGradients(settings.framework),
    preferences: settings,
    // text: retrieveTailwindText(convertedSelection),
  });
};
