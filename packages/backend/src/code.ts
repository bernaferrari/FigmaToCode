import { convertIntoNodes } from "./altNodes/altConversion";
import {
  retrieveGenericSolidUIColors,
  retrieveGenericLinearGradients as retrieveGenericGradients,
} from "./common/retrieveUI/retrieveColors";
import { flutterMain } from "./flutter/flutterMain";
import { htmlMain } from "./html/htmlMain";
import { postEmptyMessage } from "./messaging";
import { swiftuiMain } from "./swiftui/swiftuiMain";
import { tailwindMain } from "./tailwind/tailwindMain";
import { PluginSettings } from "types";

export const run = (settings: PluginSettings) => {
  const { selection } = figma.currentPage;

  // ignore when nothing was selected
  if (selection.length === 0) {
    postEmptyMessage();
    return;
  }

  const convertedSelection = convertIntoNodes(selection, null);
  const data = convertToCode(convertedSelection, settings);
  const colors = retrieveGenericSolidUIColors(settings.framework);
  const gradients = retrieveGenericGradients(settings.framework);

  figma.ui.postMessage({
    type: "code",
    data,
    settings,
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
              true,
            ),
          }
        : null,
    colors,
    gradients,
    preferences: settings,
  });
};

export const convertToCode = (nodes: SceneNode[], settings: PluginSettings) => {
  switch (settings.framework) {
    case "Tailwind":
      return tailwindMain(nodes, settings);
    case "Flutter":
      return flutterMain(nodes, settings);
    case "SwiftUI":
      return swiftuiMain(nodes, settings);
    case "HTML":
    default:
      return htmlMain(nodes, settings);
  }
};
