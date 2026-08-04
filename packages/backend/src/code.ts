import {
  retrieveGenericLinearGradients,
  retrieveGenericSolidUIColors,
} from "./common/retrieveUI/retrieveColors";
import {
  addWarning,
  clearWarnings,
  warnings,
} from "./common/commonConversionWarnings";
import {
  postConversionComplete,
  postEmptyMessage,
  postError,
} from "./messaging";
import { PluginSettings } from "types";
import { convertToCode } from "./common/retrieveUI/convertToCode";
import { generateHTMLPreview } from "./html/htmlMain";
import { oldConvertNodesToAltNodes } from "./altNodes/oldAltConversion";
import {
  getNodeByIdAsyncCalls,
  getNodeByIdAsyncTime,
  getStyledTextSegmentsCalls,
  getStyledTextSegmentsTime,
  nodesToJSON,
  processColorVariablesCalls,
  processColorVariablesTime,
  resetPerformanceCounters,
} from "./altNodes/jsonNodeConversion";

export const run = async (settings: PluginSettings) => {
  resetPerformanceCounters();
  clearWarnings();

  const { framework, useOldPluginVersion2025 } = settings;
  const selection = figma.currentPage.selection;

  if (selection.length === 0) {
    postEmptyMessage();
    return;
  }

  const MAX_NODE_COUNT_PREVIEW = 1200;
  const MAX_NODE_COUNT_HARD = 4000;
  const countNodes = (nodes: ReadonlyArray<SceneNode>) => {
    let count = 0;
    const stack = [...nodes];
    while (stack.length > 0) {
      const node = stack.pop()!;
      count += 1;
      if ("children" in node && Array.isArray(node.children)) {
        for (const child of node.children) {
          stack.push(child);
        }
      }
    }
    return count;
  };

  const nodeCount = countNodes(selection);
  if (nodeCount > MAX_NODE_COUNT_HARD) {
    postError(
      `Selection too large (${nodeCount} nodes). Please select a smaller frame.`,
    );
    return;
  }
  const skipHeavyUI = nodeCount > MAX_NODE_COUNT_PREVIEW;
  if (skipHeavyUI) {
    addWarning(
      `Large selection (${nodeCount} nodes). HTML preview and colors are disabled to avoid memory issues.`,
    );
  }

  // Timing with Date.now() instead of console.time
  const nodeToJSONStart = Date.now();

  let convertedSelection: any;
  if (useOldPluginVersion2025) {
    convertedSelection = oldConvertNodesToAltNodes(selection, null);
    console.log(
      "[debug] convertedSelection count (old conversion):",
      convertedSelection.length,
    );
  } else {
    convertedSelection = await nodesToJSON(selection, settings);
    console.log(`[benchmark] nodesToJSON: ${Date.now() - nodeToJSONStart}ms`);
    console.log("[debug] convertedSelection count:", convertedSelection.length);
    // const removeParentRecursive = (obj: any): any => {
    //   if (Array.isArray(obj)) {
    //     return obj.map(removeParentRecursive);
    //   }
    //   if (obj && typeof obj === 'object') {
    //     const newObj = { ...obj };
    //     delete newObj.parent;
    //     for (const key in newObj) {
    //       newObj[key] = removeParentRecursive(newObj[key]);
    //     }
    //     return newObj;
    //   }
    //   return obj;
    // };
    // console.log("nodeJson without parent refs:", removeParentRecursive(convertedSelection));
  }

  if (convertedSelection.length > 0) {
    console.log("[debug] first convertedSelection summary:", {
      id: convertedSelection[0]?.id,
      type: convertedSelection[0]?.type,
      name: convertedSelection[0]?.name,
      childCount: convertedSelection[0]?.children?.length ?? 0,
    });
  }

  // ignore when nothing was selected
  // If the selection was empty, the converted selection will also be empty.
  if (convertedSelection.length === 0) {
    postEmptyMessage();
    return;
  }

  const convertToCodeStart = Date.now();
  const code = await convertToCode(convertedSelection, settings);
  console.log(
    `[benchmark] convertToCode: ${Date.now() - convertToCodeStart}ms`,
  );

  let htmlPreview = { size: { width: 0, height: 0 }, content: "" };
  let colors: Awaited<ReturnType<typeof retrieveGenericSolidUIColors>> = [];
  let gradients: Awaited<ReturnType<typeof retrieveGenericLinearGradients>> =
    [];

  if (!skipHeavyUI) {
    const generatePreviewStart = Date.now();
    htmlPreview = await generateHTMLPreview(convertedSelection, settings);
    console.log(
      `[benchmark] generateHTMLPreview: ${Date.now() - generatePreviewStart}ms`,
    );

    const colorPanelStart = Date.now();
    colors = await retrieveGenericSolidUIColors(framework);
    gradients = await retrieveGenericLinearGradients(framework);
    console.log(
      `[benchmark] color and gradient panel: ${Date.now() - colorPanelStart}ms`,
    );
  }
  console.log(
    `[benchmark] total generation time: ${Date.now() - nodeToJSONStart}ms`,
  );

  // Log performance statistics
  console.log(
    `[benchmark] getNodeByIdAsync: ${getNodeByIdAsyncTime}ms (${getNodeByIdAsyncCalls} calls, avg: ${(getNodeByIdAsyncTime / getNodeByIdAsyncCalls || 1).toFixed(2)}ms)`,
  );
  console.log(
    `[benchmark] getStyledTextSegments: ${getStyledTextSegmentsTime}ms (${getStyledTextSegmentsCalls} calls, avg: ${
      getStyledTextSegmentsCalls > 0
        ? (getStyledTextSegmentsTime / getStyledTextSegmentsCalls).toFixed(2)
        : 0
    }ms)`,
  );
  console.log(
    `[benchmark] processColorVariables: ${processColorVariablesTime}ms (${processColorVariablesCalls} calls, avg: ${
      processColorVariablesCalls > 0
        ? (processColorVariablesTime / processColorVariablesCalls).toFixed(2)
        : 0
    }ms)`,
  );

  postConversionComplete({
    code,
    htmlPreview,
    colors,
    gradients,
    settings,
    warnings: [...warnings],
  });
};
