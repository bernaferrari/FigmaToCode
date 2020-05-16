export const getOpacity = (node: BlendMixin, child: string) => {
  if (node.opacity !== 1) {
    return `
        Opacity(
            opacity: ${node.opacity},
            child: ${child}
        ),`;
  }
  return ``;
};

export const getTextAligned = (node: TextNode, child: string) => {
  let alignment;
  if (node.layoutAlign === "CENTER") {
    if (node.textAlignHorizontal === "LEFT") alignment = "centerLeft";
    if (node.textAlignHorizontal === "RIGHT") alignment = "centerRight";
    if (node.textAlignHorizontal === "CENTER") alignment = "center";
    // no support for justified yet
  } else if (node.layoutAlign === "MAX") {
    if (node.textAlignHorizontal === "LEFT") alignment = "leftBottom";
    if (node.textAlignHorizontal === "RIGHT") alignment = "rightBottom";
    if (node.textAlignHorizontal === "CENTER") alignment = "centerBottom";
  }
  // [node.layoutAlign === "MIN"] is the default, so no need to specify it.
  if (!alignment) alignment = "center";

  // there are many ways to align a text
  if (node.textAlignVertical === "BOTTOM" && node.textAutoResize === "NONE") {
    alignment = "bottomCenter";
  }

  if (
    node.layoutAlign !== "MIN" ||
    (node.textAlignVertical === "BOTTOM" && node.textAutoResize === "NONE")
  ) {
    return `
      Align(
        alignment: Alignment.${alignment},
        child: ${child}
      ),`;
  }
  return ``;
};
