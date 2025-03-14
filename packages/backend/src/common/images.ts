import { AltNode, ExportableNode } from "types";
import { btoa } from "js-base64";
import { addWarning } from "./commonConversionWarnings";
import { exportAsyncProxy } from "./exportAsyncProxy";

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
  node: AltNode<T>,
  excludeChildren: boolean,
) => {
  // Shorcut export if the node has already been converted.
  if (node.base64 !== undefined && node.base64 !== "") {
    return node.base64;
  }

  const n: ExportableNode = node;

  const temporarilyHideChildren =
    excludeChildren && "children" in n && n.children.length > 0;
  const parent = n as ChildrenMixin;
  const originalVisibility = new Map<SceneNode, boolean>();

  if (temporarilyHideChildren) {
    // Store the original visible state of children
    parent.children.map((child: SceneNode) =>
      originalVisibility.set(child, child.visible),
    ),
      // Temporarily hide all children
      parent.children.forEach((child) => {
        child.visible = false;
      });
  }

  // export the image as bytes
  const exportSettings: ExportSettingsImage = {
    format: "PNG",
    constraint: { type: "SCALE", value: 1 },
  };
  const bytes = await exportAsyncProxy(n, exportSettings);

  if (temporarilyHideChildren) {
    // After export, restore visibility
    parent.children.forEach((child) => {
      child.visible = originalVisibility.get(child) ?? false;
    });
  }

  addWarning("Some images exported as Base64 PNG");

  // Encode binary string to base64
  const base64 = imageBytesToBase64(bytes);
  // Save the value so it's only calculated once.
  node.base64 = base64;
  return base64;
};
