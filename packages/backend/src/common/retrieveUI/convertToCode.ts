import { PluginSettings } from "types";
import { flutterMain } from "../../flutter/flutterMain";
import { htmlMain } from "../../html/htmlMain";
import { swiftuiMain } from "../../swiftui/swiftuiMain";
import { tailwindMain } from "../../tailwind/tailwindMain";

export const convertToCode = async (
  nodes: SceneNode[],
  settings: PluginSettings,
) => {
  switch (settings.framework) {
    case "Tailwind":
      return await tailwindMain(nodes, settings);
    case "Flutter":
      return await flutterMain(nodes, settings);
    case "SwiftUI":
      return await swiftuiMain(nodes, settings);
    case "HTML":
    default:
      return (await htmlMain(nodes, settings)).html;
  }
};
