import type { Framework } from "types";

export interface RendererConfig {
  framework: Framework;
  mode: string;
  extension: string;
  settingsKey: string;
}

// POC: HTML renderer with 3 modes
export const RENDERER_CONFIGS: RendererConfig[] = [
  {
    framework: "HTML",
    mode: "html",
    extension: ".html",
    settingsKey: "htmlGenerationMode",
  },
  {
    framework: "HTML",
    mode: "jsx",
    extension: ".tsx",
    settingsKey: "htmlGenerationMode",
  },
  {
    framework: "HTML",
    mode: "styled-components",
    extension: ".tsx",
    settingsKey: "htmlGenerationMode",
  },
];
