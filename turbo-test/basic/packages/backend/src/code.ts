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

export interface PluginSettings {
  framework: FrameworkTypes;
  jsx: boolean;
  optimize: boolean;
  layerName: boolean;
}

export const run = (settings: PluginSettings) => {
  // ignore when nothing was selected
  if (figma.currentPage.selection.length === 0) {
    figma.ui.postMessage({
      type: "empty",
    });
    return;
  }

  let isJsx = settings.jsx;
  let layerName = settings.layerName;

  const firstSelection = figma.currentPage.selection[0];
  const parentId = firstSelection.parent?.id ?? "";
  const convertedSelection = convertIntoNodes([firstSelection], null);
  let result = "";
  switch (settings.framework) {
    case "HTML":
      result = htmlMain(convertedSelection, parentId, isJsx, layerName);
      break;
    case "Tailwind":
      result = tailwindMain(convertedSelection, parentId, isJsx, layerName);
      break;
    case "Flutter":
      result = flutterMain(convertedSelection, parentId, false);
      break;
    case "SwiftUI":
      result = swiftuiMain(convertedSelection, parentId);
      break;
  }
  console.log(result);

  figma.ui.postMessage({
    type: "code",
    data: result,
    settings: settings,
    htmlPreview: {
      size: convertedSelection.map((node) => ({
        width: node.width,
        height: node.height,
      }))[0],
      content: htmlMain(convertedSelection, parentId, false, layerName, true),
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
