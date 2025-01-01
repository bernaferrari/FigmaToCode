import { PluginSettings } from "types";
import { flutterMain } from "../../flutter/flutterMain";
import { htmlMain } from "../../html/htmlMain";
import { swiftuiMain } from "../../swiftui/swiftuiMain";
import { tailwindMain } from "../../tailwind/tailwindMain";

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
