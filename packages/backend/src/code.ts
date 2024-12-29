import { convertIntoNodes } from "./altNodes/altConversion";
import {
  retrieveGenericSolidUIColors,
  retrieveGenericLinearGradients as retrieveGenericGradients,
} from "./common/retrieveUI/retrieveColors";
import { flutterMain } from "./flutter/flutterMain";
import { generateHTMLPreview, htmlMain } from "./html/htmlMain";
import { postConversionComplete, postEmptyMessage } from "./messaging";
import { swiftuiMain } from "./swiftui/swiftuiMain";
import { tailwindMain } from "./tailwind/tailwindMain";
import { clearWarnings, warnings } from "./common/commonConversionWarnings";
import { PluginSettings } from "types";

export const run = (settings: PluginSettings) => {
  clearWarnings();
  const selection = figma.currentPage.selection;
  const convertedSelection = convertIntoNodes(selection, null);

  // ignore when nothing was selected
  // If the selection was empty, the converted selection will also be empty.
  if (convertedSelection.length === 0) {
    postEmptyMessage();
    return;
  }

  const { framework } = settings;
  const code = convertToCode(convertedSelection, settings);
  // Only generate HTML code if necessary
  const htmlCode =
    framework === "HTML" && settings.jsx === false
      ? code
      : generateHTMLPreview(convertedSelection, settings);
  const colors = retrieveGenericSolidUIColors(framework);
  const gradients = retrieveGenericGradients(framework);

  const htmlPreview = {
    size: {
      width: convertedSelection[0].width,
      height: convertedSelection[0].height,
    },
    content: htmlCode,
  };

  postConversionComplete({
    code,
    htmlPreview,
    colors,
    gradients,
    settings,
    warnings: [...warnings],
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
