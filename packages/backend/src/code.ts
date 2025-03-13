import {
  retrieveGenericLinearGradients,
  retrieveGenericSolidUIColors,
} from "./common/retrieveUI/retrieveColors";
import {
  addWarning,
  clearWarnings,
  warnings,
} from "./common/commonConversionWarnings";
import { postConversionComplete, postEmptyMessage } from "./messaging";
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

  // Timing with Date.now() instead of console.time
  const nodeToJSONStart = Date.now();

  let convertedSelection: any;
  if (useOldPluginVersion2025) {
    convertedSelection = oldConvertNodesToAltNodes(selection, null);
    console.log("convertedSelection", convertedSelection);
  } else {
    convertedSelection = await nodesToJSON(selection, settings);
    console.log(`[benchmark] nodesToJSON: ${Date.now() - nodeToJSONStart}ms`);
    console.log("nodeJson", convertedSelection);
  }

  console.log("[debug] convertedSelection", { ...convertedSelection[0] });

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

  const generatePreviewStart = Date.now();
  const htmlPreview = await generateHTMLPreview(convertedSelection, settings);
  console.log(
    `[benchmark] generateHTMLPreview: ${Date.now() - generatePreviewStart}ms`,
  );

  const colorPanelStart = Date.now();
  const colors = retrieveGenericSolidUIColors(framework);
  const gradients = retrieveGenericLinearGradients(framework);
  console.log(
    `[benchmark] color and gradient panel: ${Date.now() - colorPanelStart}ms`,
  );
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
