import { AltNode, ExportableNode } from "types";
import { btoa } from "js-base64";
import { addWarning } from "./commonConversionWarnings";

export const PLACEHOLDER_IMAGE_DOMAIN = "https://placehold.co";

export const getPlaceholderImage = (w: number, h = -1) => {
  const _w = w.toFixed(0);
  const _h = (h < 0 ? w : h).toFixed(0);
  return `${PLACEHOLDER_IMAGE_DOMAIN}/${_w}x${_h}`;
};

const fillIsImage = ({ type }: Paint) => type === "IMAGE";

export const getImageFills = (node: MinimalFillsMixin): ImagePaint[] => {
  try {
    return (node.fills as ImagePaint[]).filter(fillIsImage);
  } catch (e) {
    return [];
  }
};

export const nodeHasImageFill = (node: MinimalFillsMixin): Boolean =>
  getImageFills(node).length > 0;

export const nodeHasMultipleFills = (node: MinimalFillsMixin) =>
  node.fills instanceof Array && node.fills.length > 1;

const imageBytesToBase64 = (bytes: Uint8Array): string => {
  // Convert Uint8Array to binary string
  const binaryString = bytes.reduce((data, byte) => {
    return data + String.fromCharCode(byte);
  }, "");

  // Encode binary string to base64
  const b64 = btoa(binaryString);

  return `data:image/png;base64,${b64}`;
};

export const exportNodeAsBase64PNG = async <T extends ExportableNode>(
  node: AltNode<T> | ExportableNode,
  excludeChildren: boolean,
) => {
  // Shorcut export if the node has already been converted.
  if ("base64" in node && node.base64 !== "") {
    return node.base64;
  }

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

  if ("children" in n && n.children.length > 0 && excludeChildren) {
    // Store the original visible state of children
    const originalVisibility = new Map<SceneNode, boolean>(
      n.children.map((child) => [child, child.visible]),
    );

    // Temporarily hide all children
    n.children.forEach((child) => {
      child.visible = false;
    });

    bytes = await node.exportAsync(exportSettings);

    // After export, restore visibility
    n.children.forEach((child) => {
      child.visible = originalVisibility.get(child) ?? false;
    });
  } else {
    bytes = await node.exportAsync(exportSettings);
  }

  addWarning("Some images exported as Base64 PNG");

  // Encode binary string to base64
  return imageBytesToBase64(bytes);
};
