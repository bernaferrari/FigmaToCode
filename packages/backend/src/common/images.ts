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

  addWarning("Some images exported as Base64 PNG");

  // Encode binary string to base64
  return imageBytesToBase64(bytes);
};

interface ImageBinaryData {
  base64: string;
  fill: ImagePaint;
}

export const exportFillAsBase64PNG = async <T extends ExportableNode>(
  node: AltNode<T> | ExportableNode,
): Promise<ImageBinaryData | null> => {
  let n: ExportableNode;
  if ("originalNode" in node) {
    n = node.originalNode;
  } else {
    n = node;
  }

  const fills = getImageFills(n);
  const topImageFill = fills[0];
  const scale = topImageFill.scalingFactor ?? 1;

  const imageHash = topImageFill.imageHash;
  if (!imageHash) return null;
  const image = figma.getImageByHash(imageHash);
  if (image === null) return null;

  console.log(topImageFill.imageTransform);
  console.log(topImageFill.scaleMode);
  console.log(topImageFill.scalingFactor);
  console.log(topImageFill.rotation);

  let bytes: Uint8Array<ArrayBufferLike> = new Uint8Array();
  try {
    bytes = await image.getBytesAsync();
  } catch (error) {
    throw error as Error;
  }

  addWarning("Some images exported as Base64 PNG");
  const base64 = imageBytesToBase64(bytes);

  return {
    base64,
    fill: topImageFill,
  };
};
