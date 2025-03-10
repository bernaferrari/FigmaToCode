import { getCommonRadius } from "../../common/commonRadius";
import { formatWithJSX } from "../../common/parseJSX";

export const htmlBorderRadius = (node: SceneNode, isJsx: boolean): string[] => {
  if (node.type === "ELLIPSE") {
    return [formatWithJSX("border-radius", isJsx, 9999)];
  }

  const radius = getCommonRadius(node);

  let comp: string[] = [];
  let singleCorner: number = 0;

  if ("all" in radius) {
    if (radius.all === 0) {
      return [];
    }
    singleCorner = radius.all;
    comp.push(formatWithJSX("border-radius", isJsx, radius.all));
  } else {
    const cornerValues = [
      radius.topLeft,
      radius.topRight,
      radius.bottomRight,
      radius.bottomLeft,
    ];

    // Map each corner value to its corresponding CSS property
    const cornerProperties = [
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius",
    ];

    // Add CSS properties for non-zero corner values
    for (let i = 0; i < 4; i++) {
      if (cornerValues[i] > 0) {
        comp.push(formatWithJSX(cornerProperties[i], isJsx, cornerValues[i]));
      }
    }
  }

  if (
    "children" in node &&
    "clipsContent" in node &&
    node.children.length > 0 &&
    node.clipsContent === true
  ) {
    comp.push(formatWithJSX("overflow", isJsx, "hidden"));
  }

  return comp;
};
