import { tailwindCodeGenTextStyles } from "./../../../packages/backend/src/tailwind/tailwindMain";
import {
  run,
  flutterMain,
  tailwindMain,
  swiftuiMain,
  htmlMain,
  extractProjectImageNodeIds,
  generateProjectZip,
  postSettingsChanged,
  replaceProjectImagePlaceholders,
} from "backend";
import { nodesToJSON } from "backend/src/altNodes/jsonNodeConversion";
import { oldConvertNodesToAltNodes } from "backend/src/altNodes/oldAltConversion";
import { exportNodeAsPNG } from "backend/src/common/images";
import { retrieveGenericSolidUIColors } from "backend/src/common/retrieveUI/retrieveColors";
import { flutterCodeGenTextStyles } from "backend/src/flutter/flutterMain";
import { htmlCodeGenTextStyles } from "backend/src/html/htmlMain";
import { swiftUICodeGenTextStyles } from "backend/src/swiftui/swiftuiMain";
import {
  DownloadProjectFormat,
  PluginSettings,
  SettingWillChangeMessage,
} from "types";

let userPluginSettings: PluginSettings;

export const defaultPluginSettings: PluginSettings = {
  framework: "HTML",
  showLayerNames: false,
  useOldPluginVersion2025: false,
  responsiveRoot: false,
  flutterGenerationMode: "snippet",
  swiftUIGenerationMode: "snippet",
  composeGenerationMode: "snippet",
  roundTailwindValues: true,
  roundTailwindColors: true,
  useColorVariables: true,
  customTailwindPrefix: "",
  embedImages: false,
  embedVectors: false,
  htmlGenerationMode: "html",
  tailwindGenerationMode: "jsx",
  baseFontSize: 16,
  useTailwind4: true,
  thresholdPercent: 15,
  baseFontFamily: "",
  fontFamilyCustomConfig: {},
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
let isDownloadingProject = false;
let rerunAfterDownload = false;
const safeRun = async (settings: PluginSettings) => {
  console.log(
    "[DEBUG] safeRun - Called with isLoading =",
    isLoading,
    "selectionCount =",
    figma.currentPage.selection.length,
  );
  if (isDownloadingProject) {
    rerunAfterDownload = true;
    return;
  }

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
      } else {
        // Handle non-standard errors or unknown error types
        const errorMessage = String(e);
        console.log("Unknown error: ", errorMessage);
        figma.ui.postMessage({
          type: "error",
          error: errorMessage || "Unknown error occurred",
        });
      }

      // Send a message to reset the UI state
      figma.ui.postMessage({ type: "conversion-complete", success: false });
    }
  } else {
    console.log(
      "[DEBUG] safeRun - Skipping execution because isLoading =",
      isLoading,
    );
  }
};

type ExportedProjectImage = {
  name: string;
  bytes: Uint8Array;
  nodeId: string;
};

const allowedFormatsByFramework: Record<
  "Flutter" | "HTML" | "SwiftUI" | "Tailwind",
  DownloadProjectFormat[]
> = {
  Flutter: ["flutter"],
  HTML: ["html", "nextjs", "vite"],
  SwiftUI: ["swiftui"],
  Tailwind: ["html", "nextjs", "vite"],
};

const toKebab = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const getRootSelectionName = (selection: readonly SceneNode[]) => {
  if (selection.length === 0) {
    return "figma-export";
  }

  if (selection.length === 1) {
    return toKebab(selection[0].name) || "figma-export";
  }

  return (
    toKebab(selection[0].parent?.name ?? "figma-selection") || "figma-selection"
  );
};

const createImageName = (nodeId: string, nodeName: string) => {
  const cleanName = toKebab(nodeName);
  const suffix = nodeId.replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "");
  return `${cleanName || "image"}-${suffix}.png`;
};

const isImageNode = (node: SceneNode): boolean => {
  if ("fills" in node) {
    const fills = node.fills;
    if (fills && fills !== figma.mixed && Array.isArray(fills)) {
      return fills.some((fill) => fill.type === "IMAGE");
    }
  }

  return false;
};

const exportProjectImages = async (
  selection: readonly SceneNode[],
  requiredNodeIds: ReadonlySet<string>,
): Promise<ExportedProjectImage[]> => {
  const images: ExportedProjectImage[] = [];
  const missingNodeIds = new Set(requiredNodeIds);

  const visit = async (node: SceneNode) => {
    if (node.visible === false) {
      return;
    }

    if (missingNodeIds.has(node.id)) {
      if (!isImageNode(node) || !("exportAsync" in node)) {
        throw new Error(
          `Node ${node.name || node.id} cannot be exported as an image.`,
        );
      }

      const hasChildren = "children" in node && node.children.length > 0;
      const bytes = await exportNodeAsPNG(node, hasChildren);
      images.push({
        bytes,
        name: createImageName(node.id, node.name),
        nodeId: node.id,
      });
      missingNodeIds.delete(node.id);
    }

    if ("children" in node) {
      for (const child of node.children) {
        await visit(child);
      }
    }
  };

  for (const node of selection) {
    await visit(node);
  }

  if (missingNodeIds.size > 0) {
    throw new Error(
      `Could not find ${missingNodeIds.size} image layer${
        missingNodeIds.size === 1 ? "" : "s"
      } in the selected content.`,
    );
  }

  return images;
};

const getConvertedSelectionForDownload = async (
  nodes: readonly SceneNode[],
  pluginSettings: PluginSettings,
): Promise<SceneNode[]> => {
  if (nodes.length === 0) {
    return [];
  }

  const convertedSelection = pluginSettings.useOldPluginVersion2025
    ? oldConvertNodesToAltNodes(nodes, null)
    : await nodesToJSON(nodes, pluginSettings);
  return convertedSelection as unknown as SceneNode[];
};

const generateDownloadCode = async (
  nodes: readonly SceneNode[],
  format: DownloadProjectFormat,
  pluginSettings: PluginSettings,
) => {
  const convertedSelection = await getConvertedSelectionForDownload(
    nodes,
    pluginSettings,
  );

  if (convertedSelection.length === 0) {
    return "<div>No content to export</div>";
  }

  const settings = {
    ...pluginSettings,
    embedImages: false,
    imagePlaceholderMode: "asset" as const,
  };
  const isReactProject = format === "nextjs" || format === "vite";

  if (pluginSettings.framework === "Flutter") {
    return flutterMain(convertedSelection, {
      ...settings,
      flutterGenerationMode: "fullApp",
    });
  }

  if (pluginSettings.framework === "SwiftUI") {
    return swiftuiMain(convertedSelection, {
      ...settings,
      swiftUIGenerationMode: "preview",
    });
  }

  if (pluginSettings.framework === "Tailwind") {
    const result = await tailwindMain(convertedSelection, {
      ...settings,
      tailwindGenerationMode: isReactProject ? "jsx" : "html",
    });
    return result || "<div>Failed to generate Tailwind</div>";
  }

  const result = await htmlMain(
    convertedSelection,
    {
      ...settings,
      htmlGenerationMode: isReactProject ? "jsx" : "html",
    },
    true,
  );
  return result?.html || "<div>Failed to generate HTML</div>";
};

const downloadProject = async (format: DownloadProjectFormat) => {
  if (!["flutter", "html", "nextjs", "swiftui", "vite"].includes(format)) {
    throw new Error(`Invalid download format: ${format}.`);
  }

  const pluginSettings = { ...userPluginSettings };
  if (
    pluginSettings.framework === "Compose" ||
    !allowedFormatsByFramework[pluginSettings.framework].includes(format)
  ) {
    throw new Error(
      `${format} export is not available for ${pluginSettings.framework}.`,
    );
  }

  const selection = [...figma.currentPage.selection];
  if (selection.length === 0) {
    throw new Error("Please select at least one layer to export.");
  }

  const rawCode = await generateDownloadCode(selection, format, pluginSettings);
  const requiredImageNodeIds = extractProjectImageNodeIds(rawCode);
  const images = await exportProjectImages(selection, requiredImageNodeIds);
  const code = replaceProjectImagePlaceholders(rawCode, images, format);
  const rootName = getRootSelectionName(selection);
  const rawAssetSize = images.reduce(
    (sum, image) => sum + image.bytes.byteLength,
    0,
  );
  const maxRawAssetSizeBytes = 25 * 1024 * 1024;
  if (rawAssetSize > maxRawAssetSizeBytes) {
    throw new Error(
      `Images are too large (${Math.round(rawAssetSize / 1024 / 1024)}MB). Try selecting fewer images or smaller components.`,
    );
  }
  const zipData = generateProjectZip(
    code,
    pluginSettings.framework,
    images,
    format,
    rootName,
  );

  const maxMessageSizeBytes = 10 * 1024 * 1024;
  if (zipData.byteLength > maxMessageSizeBytes) {
    throw new Error(
      `Project too large (${Math.round(zipData.byteLength / 1024 / 1024)}MB). Try selecting fewer images or smaller components.`,
    );
  }

  const zip = zipData.buffer.slice(
    zipData.byteOffset,
    zipData.byteOffset + zipData.byteLength,
  );

  figma.ui.postMessage({
    type: "project-zip",
    zip,
    format,
    fileName: `${rootName}-${format}.zip`,
  });
};

const standardMode = async () => {
  console.log("[DEBUG] standardMode - Starting standard mode initialization");
  figma.showUI(__html__, { width: 450, height: 700, themeColors: true });
  let initialized = false;
  const initializeOnce = async () => {
    if (initialized) {
      return;
    }
    initialized = true;
    await initSettings();
  };

  // Listen for selection changes
  figma.on("selectionchange", () => {
    console.log(
      "[DEBUG] selectionchange event - New selection count:",
      figma.currentPage.selection.length,
    );
    safeRun(userPluginSettings);
  });

  // Listen for page changes
  figma.loadAllPagesAsync();
  figma.on("documentchange", () => {
    console.log("[DEBUG] documentchange event triggered");
    // Node: This was causing an infinite load when you try to export a background image from a group that contains children.
    // The reason for this is that the code will temporarily hide the children of the group in order to export a clean image
    // then restores the visibility of the children. This constitutes a document change so it's restarting the whole conversion.
    // In order to stop this, we disable safeRun() when doing conversions (while isLoading === true).
    safeRun(userPluginSettings);
  });

  figma.ui.onmessage = async (msg) => {
    console.log(
      "[DEBUG] figma.ui.onmessage",
      msg?.type ? `type=${msg.type}` : "unknown type",
    );

    if (msg.type === "ui-ready") {
      await initializeOnce();
    } else if (msg.type === "download-project") {
      if (isLoading) {
        figma.ui.postMessage({
          type: "project-download-error",
          error: "Please wait for the current conversion to finish.",
        });
        return;
      }

      if (isDownloadingProject) {
        figma.ui.postMessage({
          type: "project-download-error",
          error: "A project download is already in progress.",
        });
        return;
      }

      isDownloadingProject = true;
      try {
        await downloadProject(msg.format as DownloadProjectFormat);
      } catch (error) {
        console.error("Download project failed:", error);
        figma.ui.postMessage({
          type: "project-download-error",
          error: `Failed to create project: ${
            error instanceof Error ? error.message : "Unknown error occurred"
          }`,
        });
      } finally {
        isDownloadingProject = false;
        if (rerunAfterDownload) {
          rerunAfterDownload = false;
          void safeRun(userPluginSettings);
        }
      }
    } else if (msg.type === "pluginSettingWillChange") {
      const { key, value } = msg as SettingWillChangeMessage<unknown>;
      console.log(`[DEBUG] Setting changed: ${key} = ${value}`);
      (userPluginSettings as any)[key] = value;
      figma.clientStorage.setAsync("userPluginSettings", userPluginSettings);
      safeRun(userPluginSettings);
    } else if (msg.type === "get-selection-json") {
      console.log("[DEBUG] get-selection-json message received");

      const nodes = figma.currentPage.selection;
      if (nodes.length === 0) {
        figma.ui.postMessage({
          type: "selection-json",
          data: { message: "No nodes selected" },
        });
        return;
      }
      const result: {
        json?: SceneNode[];
        oldConversion?: any;
        newConversion?: any;
      } = {};

      try {
        result.json = (await Promise.all(
          nodes.map(
            async (node) =>
              (
                (await node.exportAsync({
                  format: "JSON_REST_V1",
                })) as any
              ).document,
          ),
        )) as SceneNode[];
      } catch (error) {
        console.error("Error exporting JSON:", error);
      }

      try {
        const newNodes = await nodesToJSON(nodes, userPluginSettings);
        const removeParent = (node: any) => {
          if (node.parent) {
            delete node.parent;
          }
          if (node.children) {
            node.children.forEach(removeParent);
          }
        };
        newNodes.forEach(removeParent);
        result.newConversion = newNodes;
      } catch (error) {
        console.error("Error in new conversion:", error);
      }

      const nodeJson = result;

      console.log(
        "[DEBUG] Exported node JSON:",
        `jsonCount=${result.json?.length ?? 0}`,
        `newConversionCount=${result.newConversion?.length ?? 0}`,
      );

      // Send the JSON data back to the UI
      figma.ui.postMessage({
        type: "selection-json",
        data: nodeJson,
      });
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
        `[DEBUG] codegen.generate - Language: ${language}, Node: id=${node.id}, type=${node.type}`,
      );

      const convertedSelection = await nodesToJSON([node], userPluginSettings);
      console.log(
        "[DEBUG] codegen.generate - Converted selection count:",
        convertedSelection.length,
      );

      switch (language) {
        case "html":
          return [
            {
              title: "Code",
              code: (
                await htmlMain(
                  convertedSelection,
                  { ...userPluginSettings, htmlGenerationMode: "html" },
                  true,
                )
              ).html,
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
              code: (
                await htmlMain(
                  convertedSelection,
                  { ...userPluginSettings, htmlGenerationMode: "jsx" },
                  true,
                )
              ).html,
              language: "HTML",
            },
            {
              title: "Text Styles",
              code: htmlCodeGenTextStyles(userPluginSettings),
              language: "HTML",
            },
          ];

        case "html_svelte":
          return [
            {
              title: "Code",
              code: (
                await htmlMain(
                  convertedSelection,
                  { ...userPluginSettings, htmlGenerationMode: "svelte" },
                  true,
                )
              ).html,
              language: "HTML",
            },
            {
              title: "Text Styles",
              code: htmlCodeGenTextStyles(userPluginSettings),
              language: "HTML",
            },
          ];

        case "html_styled_components":
          return [
            {
              title: "Code",
              code: (
                await htmlMain(
                  convertedSelection,
                  {
                    ...userPluginSettings,
                    htmlGenerationMode: "styled-components",
                  },
                  true,
                )
              ).html,
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
                tailwindGenerationMode:
                  language === "tailwind_jsx" ? "jsx" : "html",
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
              code: (await retrieveGenericSolidUIColors("Tailwind"))
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
        // case "compose":
        //   return [
        //     {
        //       title: "Jetpack Compose",
        //       code: composeMain(convertedSelection, {
        //         ...userPluginSettings,
        //         composeGenerationMode: "snippet",
        //       }),
        //       language: "KOTLIN",
        //     },
        //     {
        //       title: "Text Styles",
        //       code: composeCodeGenTextStyles(),
        //       language: "KOTLIN",
        //     },
        //   ];
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
