import { formatWithJSX } from "../../common/parseJSX";

export const htmlBorderRadius = (node: SceneNode, isJsx: boolean): string[] => {
  if (node.type === "ELLIPSE") {
    return [formatWithJSX("border-radius", isJsx, 9999)];
  }

  let comp: string[] = [];
  let cornerValues: number[] = [0, 0, 0, 0];
  let singleCorner: number = 0;

  if (
    "cornerRadius" in node &&
    node.cornerRadius !== figma.mixed &&
    node.cornerRadius
  ) {
    singleCorner = node.cornerRadius;
    comp.push(formatWithJSX("border-radius", isJsx, node.cornerRadius));
  } else if ("topLeftRadius" in node) {
    cornerValues = handleIndividualRadius(node);
    comp.push(
      ...cornerValues
        .filter((d) => d !== 0)
        .map((value, index) => {
          const property = [
            "border-top-left-radius",
            "border-top-right-radius",
            "border-bottom-right-radius",
            "border-bottom-left-radius",
          ][index];
          return formatWithJSX(property, isJsx, value);
        })
    );
  }

  if (
    "children" in node &&
    "clipsContent" in node &&
    node.children.length > 0 &&
    node.clipsContent === true
  ) {
    if (
      node.children.some(
        (child) =>
          "layoutPositioning" in child && node.layoutPositioning === "AUTO"
      )
    ) {
      if (singleCorner) {
        comp.push(
          formatWithJSX(
            "clip-path",
            isJsx,
            `inset(0px round ${singleCorner}px)`
          )
        );
      } else {
        const insetValues = cornerValues.map((value) => `${value}px`).join(" ");
        comp.push(
          formatWithJSX("clip-path", isJsx, `inset(0px round ${insetValues})`)
        );
      }
    } else {
      comp.push(formatWithJSX("overflow", isJsx, "hidden"));
    }
  }

  return comp;
};

const handleIndividualRadius = (node: RectangleCornerMixin): number[] => {
  const cornerValues = [
    node.topLeftRadius,
    node.topRightRadius,
    node.bottomRightRadius,
    node.bottomLeftRadius,
  ];
  return cornerValues;
};
