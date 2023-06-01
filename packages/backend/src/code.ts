import { convertIntoNodes } from "./altNodes/altConversion";
import {
  retrieveGenericSolidUIColors,
  retrieveGenericLinearGradients,
} from "./common/retrieveUI/retrieveColors";
import { flutterMain } from "./flutter/flutterMain";
import { htmlMain } from "./html/htmlMain";
import { swiftuiMain } from "./swiftui/swiftuiMain";
import { retrieveTailwindText } from "./tailwind/retrieveUI/retrieveTexts";
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
};

export const run = (settings: PluginSettings) => {
  // ignore when nothing was selected
  if (figma.currentPage.selection.length === 0) {
    figma.ui.postMessage({
      type: "empty",
    });
    return;
  }

  const firstSelection = figma.currentPage.selection[0];
  const parentId = firstSelection.parent?.id ?? "";
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
      result = tailwindMain(convertedSelection, settings);
      break;
    case "Flutter":
      result = flutterMain(convertedSelection, settings);
      break;
    case "SwiftUI":
      result = swiftuiMain(convertedSelection, parentId);
      break;
  }
  // console.log(result);

  figma.ui.postMessage({
    type: "code",
    data: result,
    settings: settings,
    htmlPreview: {
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
    },
  });

  figma.ui.postMessage({
    type: "colors",
    data: retrieveGenericSolidUIColors(convertedSelection, settings.framework),
  });

  figma.ui.postMessage({
    type: "gradients",
    data: retrieveGenericLinearGradients(
      convertedSelection,
      settings.framework
    ),
  });
  // }
  if (settings.framework === "Tailwind") {
    figma.ui.postMessage({
      type: "text",
      data: retrieveTailwindText(convertedSelection),
    });
  }
};
