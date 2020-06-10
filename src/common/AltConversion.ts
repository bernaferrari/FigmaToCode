import {
  AltSceneNode,
  AltRectangleNode,
  AltFrameNode,
  AltTextNode,
  AltGroupNode,
  AltLayoutMixin,
  AltFrameMixin,
  AltGeometryMixin,
  AltBlendMixin,
  AltCornerMixin,
  AltRectangleCornerMixin,
  AltDefaultShapeMixin,
} from "./AltMixins";

export const convertIntoAltNodes = (
  sceneNode: ReadonlyArray<SceneNode>,
  parent: AltSceneNode | undefined
): AltSceneNode | Array<AltSceneNode> => {
  const mapped: Array<AltSceneNode | undefined> = sceneNode.map(
    (node: SceneNode) => {
      console.log("node type is ", node.type);
      if (node.type === "RECTANGLE") {
        const altNode = new AltRectangleNode();

        altNode.id = node.id;
        altNode.name = node.name;

        if (parent && "children" in parent) altNode.parent = parent;

        convertDefaultShape(altNode, node);
        convertCorner(altNode, node);
        convertRectangleCorner(altNode, node);

        return altNode;
      } else if (node.type === "FRAME") {
        const altNode = new AltFrameNode();

        altNode.id = node.id;
        altNode.name = node.name;

        if (parent && "children" in parent) altNode.parent = parent;

        convertDefaultShape(altNode, node);
        convertFrame(altNode, node);
        convertCorner(altNode, node);
        convertRectangleCorner(altNode, node);

        altNode.setChildren(convertIntoAltNodes(node.children, altNode));

        return altNode;
      } else if (node.type === "GROUP") {
        const altNode = new AltGroupNode();

        altNode.id = node.id;
        altNode.name = node.name;

        if (parent && "children" in parent) altNode.parent = parent;

        convertLayout(altNode, node);
        convertBlend(altNode, node);

        altNode.setChildren(convertIntoAltNodes(node.children, altNode));
        return altNode;
      } else if (node.type === "TEXT") {
        const altNode = new AltTextNode();

        altNode.id = node.id;
        altNode.name = node.name;

        if (parent && "children" in parent) altNode.parent = parent;

        convertLayout(altNode, node);
        convertBlend(altNode, node);
        convertIntoAltText(altNode, node);
        return altNode;
      }

      return undefined;
    }
  );

  console.log("mapped ", mapped);
  const nonNull: Array<AltSceneNode> = mapped.filter(notEmpty);
  if (nonNull.length === 1) {
    return nonNull[0];
  } else {
    return nonNull;
  }
};

const convertLayout = (altNode: AltLayoutMixin, node: LayoutMixin) => {
  altNode.x = node.x;
  altNode.y = node.y;
  altNode.width = node.width;
  altNode.height = node.height;
  altNode.rotation = node.rotation;
};

const convertFrame = (altNode: AltFrameMixin, node: DefaultFrameMixin) => {
  altNode.layoutMode = node.layoutMode;
  altNode.counterAxisSizingMode = node.counterAxisSizingMode;
  altNode.horizontalPadding = node.horizontalPadding;
  altNode.verticalPadding = node.verticalPadding;

  altNode.itemSpacing = node.itemSpacing;
  altNode.layoutGrids = node.layoutGrids;
  altNode.gridStyleId = node.gridStyleId;
  altNode.clipsContent = node.clipsContent;
  altNode.guides = node.guides;
};

const convertGeometry = (altNode: AltGeometryMixin, node: GeometryMixin) => {
  altNode.fills = node.fills;
  altNode.strokes = node.strokes;
  altNode.strokeWeight = node.strokeWeight;
  altNode.strokeMiterLimit = node.strokeMiterLimit;
  altNode.strokeAlign = node.strokeAlign;
  altNode.strokeCap = node.strokeCap;
  altNode.strokeJoin = node.strokeJoin;
  altNode.dashPattern = node.dashPattern;
  altNode.fillStyleId = node.fillStyleId;
  altNode.strokeStyleId = node.strokeStyleId;
};

const convertBlend = (
  altNode: AltBlendMixin,
  node: BlendMixin & SceneNodeMixin
) => {
  altNode.opacity = node.opacity;
  altNode.blendMode = node.blendMode;
  altNode.isMask = node.isMask;
  altNode.effects = node.effects;
  altNode.effectStyleId = node.effectStyleId;

  altNode.visible = node.visible;
};

const convertDefaultShape = (
  altNode: AltDefaultShapeMixin,
  node: DefaultShapeMixin
) => {
  // opacity, visible
  convertBlend(altNode, node);

  // fills, storkes
  convertGeometry(altNode, node);

  // width, x, y
  convertLayout(altNode, node);
};

const convertCorner = (altNode: AltCornerMixin, node: CornerMixin) => {
  altNode.cornerRadius = node.cornerRadius;
  altNode.cornerSmoothing = node.cornerSmoothing;
};

const convertRectangleCorner = (
  altNode: AltRectangleCornerMixin,
  node: RectangleCornerMixin
) => {
  altNode.topLeftRadius = node.topLeftRadius;
  altNode.topRightRadius = node.topRightRadius;
  altNode.bottomLeftRadius = node.bottomLeftRadius;
  altNode.bottomRightRadius = node.bottomRightRadius;
};

const convertIntoAltText = (altNode: AltTextNode, node: TextNode) => {
  altNode.textAlignHorizontal = node.textAlignHorizontal;
  altNode.textAlignVertical = node.textAlignVertical;
  altNode.paragraphIndent = node.paragraphIndent;
  altNode.paragraphSpacing = node.paragraphSpacing;
  altNode.fontSize = node.fontSize;
  altNode.textDecoration = node.textDecoration;
  altNode.letterSpacing = node.letterSpacing;
  altNode.characters = node.characters;
};

function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}
