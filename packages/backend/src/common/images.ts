import { AltNode, ExportableNode } from "types";
import { btoa } from "js-base64";
import { addWarning } from "./commonConversionWarnings";
import { exportAsyncProxy } from "./exportAsyncProxy";

export const PLACEHOLDER_IMAGE_DOMAIN = "https://placehold.co";

export const getPlaceholderImage = (
  w: number,
  h = -1,
  nodeId?: string,
  mode: "remote" | "asset" = "remote",
) => {
  const _w = w.toFixed(0);
  const _h = (h < 0 ? w : h).toFixed(0);

  if (mode === "asset" && nodeId) {
    return `__FIGMA_IMAGE_${encodeURIComponent(nodeId)}__`;
  }

  return `${PLACEHOLDER_IMAGE_DOMAIN}/${_w}x${_h}`;
};

const fillIsImage = ({ type }: Paint) => type === "IMAGE";

export const getImageFills = (node: MinimalFillsMixin): ImagePaint[] => {
  try {
    return (node.fills as ImagePaint[]).filter(fillIsImage);
  } catch {
    return [];
  }
};

export const nodeHasImageFill = (node: MinimalFillsMixin): boolean =>
  getImageFills(node).length > 0;

export const nodeHasMultipleFills = (node: MinimalFillsMixin) =>
  Array.isArray(node.fills) && node.fills.length > 1;

const imageBytesToBase64 = (bytes: Uint8Array): string => {
  // Convert Uint8Array to binary string
  const binaryString = bytes.reduce((data, byte) => {
    return data + String.fromCharCode(byte);
  }, "");

  // Encode binary string to base64
  const b64 = btoa(binaryString);

  return `data:image/png;base64,${b64}`;
};

const exportWithHiddenChildren = async <T>(
  node: SceneNode,
  excludeChildren: boolean,
  exportNode: () => Promise<T>,
): Promise<T> => {
  const parent = node as SceneNode & Partial<ChildrenMixin>;
  const children =
    excludeChildren && "children" in parent && parent.children
      ? [...parent.children]
      : [];
  const originalVisibility = new Map(
    children.map((child) => [child, child.visible]),
  );

  try {
    for (const child of children) {
      child.visible = false;
    }
    return await exportNode();
  } finally {
    for (const child of children) {
      child.visible = originalVisibility.get(child) ?? false;
    }
  }
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

  // export the image as bytes
  const exportSettings: ExportSettingsImage = {
    format: "PNG",
    constraint: { type: "SCALE", value: 1 },
  };
  const bytes = await exportWithHiddenChildren(n, excludeChildren, () =>
    exportAsyncProxy(n, exportSettings),
  );

  addWarning("Some images exported as Base64 PNG");

  // Encode binary string to base64
  const base64 = imageBytesToBase64(bytes);
  // Save the value so it's only calculated once.
  node.base64 = base64;
  return base64;
};

export const exportNodeAsPNG = async (
  node: SceneNode & ExportMixin,
  excludeChildren: boolean,
): Promise<Uint8Array> => {
  return exportWithHiddenChildren(node, excludeChildren, () =>
    node.exportAsync({
      format: "PNG",
      constraint: { type: "SCALE", value: 1 },
    }),
  );
};
