import { convertNodesOnRectangle } from "./convertNodesOnRectangle";

type ParentType = (BaseNode & ChildrenMixin) | null;

export let globalTextStyleSegments: Record<string, StyledTextSegment[]> = {};

export const cloneNode = <T extends BaseNode>(node: T): T => {
  // Create the cloned object with the correct prototype
  const cloned = {} as T;
  // Create a new object with only the desired descriptors (excluding 'parent' and 'children')
  for (const prop in node) {
    if (
      prop !== "parent" &&
      prop !== "children" &&
      prop !== "horizontalPadding" &&
      prop !== "verticalPadding" &&
      prop !== "mainComponent" &&
      prop !== "masterComponent" &&
      prop !== "variantProperties" &&
      prop !== "componentPropertyDefinitions" &&
      prop !== "exposedInstances" &&
      prop !== "componentProperties" &&
      prop !== "componenPropertyReferences"
    ) {
      cloned[prop as keyof T] = node[prop as keyof T];
    }
  }

  return cloned;
};

export const frameNodeTo = (
  node: FrameNode | InstanceNode | ComponentNode | ComponentSetNode,
  parent: ParentType
):
  | RectangleNode
  | FrameNode
  | InstanceNode
  | ComponentNode
  | GroupNode
  | ComponentSetNode => {
  if (node.children.length === 0) {
    // if it has no children, convert frame to rectangle
    return frameToRectangleNode(node, parent);
  }
  const clone = standardClone(node, parent);

  overrideReadonlyProperty(
    clone,
    "children",
    convertIntoNodes(node.children, clone)
  );
  return convertNodesOnRectangle(clone);
};

// auto convert Frame to Rectangle when Frame has no Children
const frameToRectangleNode = (
  node: FrameNode | InstanceNode | ComponentNode | ComponentSetNode,
  parent: ParentType
): RectangleNode => {
  const clonedNode = cloneNode(node);
  if (parent) {
    assignParent(clonedNode, parent);
  }
  overrideReadonlyProperty(clonedNode, "type", "RECTANGLE");

  return clonedNode as unknown as RectangleNode;
};

export const overrideReadonlyProperty = <T, K extends keyof T>(
  obj: T,
  prop: K,
  value: any
): void => {
  Object.defineProperty(obj, prop, {
    value: value,
    writable: true,
    configurable: true,
  });
};

const assignParent = (node: SceneNode, parent: ParentType) => {
  if (parent) {
    overrideReadonlyProperty(node, "parent", parent);
  }
};

const standardClone = <T extends SceneNode>(node: T, parent: ParentType): T => {
  const clonedNode = cloneNode(node);
  if (parent !== null) {
    assignParent(clonedNode, parent);
  }
  return clonedNode;
};

export const convertIntoNodes = (
  sceneNode: ReadonlyArray<SceneNode>,
  parent: ParentType = null
): Array<SceneNode> => {
  const mapped: Array<SceneNode | null> = sceneNode.map((node: SceneNode) => {
    switch (node.type) {
      case "RECTANGLE":
      case "ELLIPSE":
        return standardClone(node, parent);
      case "LINE":
        return standardClone(node, parent);
      case "FRAME":
      case "INSTANCE":
      case "COMPONENT":
      case "COMPONENT_SET":
        // TODO Fix asset export. Use the new API.
        // const iconToRect = iconToRectangle(node, parent);
        // if (iconToRect != null) {
        //   return iconToRect;
        // }
        return frameNodeTo(node, parent);
      case "GROUP":
        if (node.children.length === 1 && node.visible) {
          // if Group is visible and has only one child, Group should disappear.
          // there will be a single value anyway.
          return convertIntoNodes(node.children, parent)[0];
        }

        // TODO see if necessary.
        const iconToRect = iconToRectangle(node, parent);
        if (iconToRect != null) {
          return iconToRect;
        }

        const clone = standardClone(node, parent);

        overrideReadonlyProperty(
          clone,
          "children",
          convertIntoNodes(node.children, clone)
        );

        // try to find big rect and regardless of that result, also try to convert to autolayout.
        // There is a big chance this will be returned as a Frame
        // also, Group will always have at least 2 children.
        return convertNodesOnRectangle(clone);
      case "TEXT":
        globalTextStyleSegments[node.id] = node.getStyledTextSegments([
          "fontName",
          "fills",
          "fontSize",
          "fontWeight",
          "hyperlink",
          "indentation",
          "letterSpacing",
          "lineHeight",
          "listOptions",
          "textCase",
          "textDecoration",
          "textStyleId",
          "fillStyleId",
        ]);
        return standardClone(node, parent);
      case "STAR":
      case "POLYGON":
      case "VECTOR":
        return standardClone(node, parent);
      case "SECTION":
        const sectionClone = standardClone(node, parent);
        overrideReadonlyProperty(
          sectionClone,
          "children",
          convertIntoNodes(node.children, sectionClone)
        );
        return sectionClone;
      case "BOOLEAN_OPERATION":
        const clonedOperation = standardClone(node, parent);
        overrideReadonlyProperty(clonedOperation, "type", "RECTANGLE");
        clonedOperation.fills = [
          {
            type: "IMAGE",
            scaleMode: "FILL",
            imageHash: "0",
            opacity: 1,
            visible: true,
            blendMode: "NORMAL",
            imageTransform: [
              [1, 0, 0],
              [0, 1, 0],
            ],
          },
        ];
        return clonedOperation;
      default:
        return null;
    }
  });

  return mapped.filter(notEmpty);
};

const iconToRectangle = (
  node: FrameNode | InstanceNode | ComponentNode | GroupNode,
  parent: ParentType
): RectangleNode | null => {
  // TODO Fix this.
  if (false && node.children.every((d) => d.type === "VECTOR")) {
    // const node = new RectangleNode();
    // node.id = node.id;
    // node.name = node.name;
    // if (Parent) {
    //   node.parent = Parent;
    // }
    // convertBlend(Node, node);
    // // width, x, y
    // convertLayout(Node, node);
    // // Vector support is still missing. Meanwhile, add placeholder.
    // node.cornerRadius = 8;
    // node.strokes = [];
    // node.strokeWeight = 0;
    // node.strokeMiterLimit = 0;
    // node.strokeAlign = "CENTER";
    // node.strokeCap = "NONE";
    // node.strokeJoin = "BEVEL";
    // node.dashPattern = [];
    // node.fillStyleId = "";
    // node.strokeStyleId = "";
    // node.fills = [
    //   {
    //     type: "IMAGE",
    //     imageHash: "",
    //     scaleMode: "FIT",
    //     visible: true,
    //     opacity: 0.5,
    //     blendMode: "NORMAL",
    //   },
    // ];
    // return node;
  }
  return null;
};

export function notEmpty<TValue>(
  value: TValue | null | undefined
): value is TValue {
  return value !== null && value !== undefined;
}

const applyMatrixToPoint = (matrix: number[][], point: number[]): number[] => {
  return [
    point[0] * matrix[0][0] + point[1] * matrix[0][1] + matrix[0][2],
    point[0] * matrix[1][0] + point[1] * matrix[1][1] + matrix[1][2],
  ];
};

/**
 *  this function return a bounding rect for an nodes
 */
// x/y absolute coordinates
// height/width
// x2/y2 bottom right coordinates
export const getBoundingRect = (
  node: LayoutMixin
): {
  x: number;
  y: number;
  // x2: number;
  // y2: number;
  // height: number;
  // width: number;
} => {
  const boundingRect = {
    x: 0,
    y: 0,
    // x2: 0,
    // y2: 0,
    // height: 0,
    // width: 0,
  };

  const halfHeight = node.height / 2;
  const halfWidth = node.width / 2;

  const [[c0, s0, x], [s1, c1, y]] = node.absoluteTransform;
  const matrix = [
    [c0, s0, x + halfWidth * c0 + halfHeight * s0],
    [s1, c1, y + halfWidth * s1 + halfHeight * c1],
  ];

  // the coordinates of the corners of the rectangle
  const XY: {
    x: number[];
    y: number[];
  } = {
    x: [1, -1, 1, -1],
    y: [1, -1, -1, 1],
  };

  // fill in
  for (let i = 0; i <= 3; i++) {
    const a = applyMatrixToPoint(matrix, [
      XY.x[i] * halfWidth,
      XY.y[i] * halfHeight,
    ]);
    XY.x[i] = a[0];
    XY.y[i] = a[1];
  }

  XY.x.sort((a, b) => a - b);
  XY.y.sort((a, b) => a - b);

  return {
    x: XY.x[0],
    y: XY.y[0],
  };

  return boundingRect;
};
