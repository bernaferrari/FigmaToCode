import { postConversionStart } from "../messaging";

let isRunning = false;

/*
 * This is a wrapper for exportAsync() This allows us to pass a message to the UI every time
 * this rather costly operation gets run so that it can display a loading message. This avoids
 * showing a loading message every time anything in the UI changes and only showing it when
 * exportAsync() is called.
 */
export const exportAsyncProxy = async <
  T extends string | Uint8Array = Uint8Array /* | Object */,
>(
  node: SceneNode,
  settings: ExportSettings | ExportSettingsSVGString /*| ExportSettingsREST*/,
): Promise<T> => {
  if (isRunning === false) {
    isRunning = true;
    postConversionStart();
    // force postMessage to run right now.
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  const figmaNode = (await figma.getNodeByIdAsync(node.id)) as ExportMixin;
  // console.log("getting figma id for", figmaNode);

  if (figmaNode.exportAsync === undefined) {
    // console.log(node);
    throw new TypeError(
      "Something went wrong. This node doesn't have an exportAsync() function. Maybe check the type before calling this function.",
    );
  }

  // The following is necessary for typescript to not lose its mind.
  let result;
  if (settings.format === "SVG_STRING") {
    result = await figmaNode.exportAsync(settings as ExportSettingsSVGString);
    // } else if (settings.format === "JSON_REST_V1") {
    //   result = await node.exportAsync(settings as ExportSettingsREST);
  } else {
    result = await figmaNode.exportAsync(settings as ExportSettings);
  }

  isRunning = false;
  return result as T;
};
