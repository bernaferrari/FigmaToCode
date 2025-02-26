import { AltNode, ExportableNode } from "types";
import { btoa } from "js-base64";
import { addWarning, warnings } from "./commonConversionWarnings";

export const PLACEHOLDER_IMAGE_DOMAIN = "https://placehold.co";

export const getPlaceholderImage = (w: number, h = -1) => {
  const _w = w.toFixed(0);
  const _h = (h < 0 ? w : h).toFixed(0);
  return `${PLACEHOLDER_IMAGE_DOMAIN}/${_w}x${_h}`;
};

const uint8ArrayToBase64 = (bytes: Uint8Array) => {
  // Convert Uint8Array to binary string
  const binaryString = bytes.reduce((data, byte) => {
    return data + String.fromCharCode(byte);
  }, "");

  // Encode binary string to base64
  return btoa(binaryString);
};

const fillIsImage = ({ type }: Paint) => type === "IMAGE";

export const nodeHasImageFill = (node: MinimalFillsMixin): Boolean =>
  node.fills && (node.fills as Paint[]).some(fillIsImage);

export const exportNodeAsBase64PNG = async <T extends ExportableNode>(
  node: AltNode<T> | ExportableNode,
) => {
  let n: ExportableNode;
  if ("originalNode" in node) {
    n = node.originalNode;
  } else {
    n = node;
  }

  if (n.exportAsync === undefined) {
    console.log(n);
    throw new TypeError(
      "Something went wrong. This node doesn't have an exportAsync function. Maybe check the type before calling this function.",
    );
  }
  const exportSettings: ExportSettingsImage = {
    format: "PNG",
    constraint: { type: "SCALE", value: 1 },
  };

  let bytes: Uint8Array<ArrayBufferLike> = new Uint8Array();
  try {
    bytes = await node.exportAsync(exportSettings);
  } catch (error) {
    throw error as Error;
  }

  // Encode binary string to base64
  const base64Url = `data:image/png;base64,${uint8ArrayToBase64(bytes)}`;

  addWarning("Some images exported as Base64 PNG");
  return base64Url;
};
