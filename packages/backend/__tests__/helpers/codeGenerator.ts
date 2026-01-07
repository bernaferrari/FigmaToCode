import type { PluginSettings } from "types";
import { htmlMain } from "../../src/html/htmlMain";
import { RendererConfig } from "./rendererConfig";

function createDefaultSettings(): PluginSettings {
  return {
    framework: "HTML",
    showLayerNames: false,
    embedImages: false,
    embedVectors: false,
    useColorVariables: false,
    htmlGenerationMode: "html",
    tailwindGenerationMode: "html",
    roundTailwindValues: true,
    roundTailwindColors: true,
    customTailwindPrefix: "",
    baseFontSize: 16,
    useTailwind4: false,
    thresholdPercent: 0.05,
    baseFontFamily: "Inter",
    fontFamilyCustomConfig: {},
    flutterGenerationMode: "snippet",
    swiftUIGenerationMode: "snippet",
    composeGenerationMode: "snippet",
    useOldPluginVersion2025: false,
    responsiveRoot: false,
  };
}

function createSettingsForConfig(config: RendererConfig): PluginSettings {
  const baseSettings = createDefaultSettings();

  return {
    ...baseSettings,
    framework: config.framework,
    [config.settingsKey]: config.mode,
  };
}

export async function generateCode(
  nodes: any[],
  config: RendererConfig
): Promise<string> {
  const settings = createSettingsForConfig(config);

  switch (config.framework) {
    case "HTML": {
      const result = await htmlMain(nodes as any, settings);
      return result.html;
    }
    default:
      throw new Error(`Unknown framework: ${config.framework}`);
  }
}
