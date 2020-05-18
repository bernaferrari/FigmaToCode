// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

import { getOpacity, getTextAligned } from "./simple_methods";

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
// figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

const rgbTohex = (
  color: RGB | RGBA,
  alpha: number = "a" in color ? color.a : 1.0
): string => {
  // when color is RGBA, alpha is set automatically
  // when color is RGB, alpha need to be set manually (default: 1.0)
  const hex =
    ((alpha * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.r * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.g * 255) | (1 << 8)).toString(16).slice(1) +
    ((color.b * 255) | (1 << 8)).toString(16).slice(1);

  return hex;
};

// TODO
// Extract components.
// Wait a minute!
// This can be made directly in Flutter!
// A lot more people will benefit from it!

let parentId: string = "";

// https://stackoverflow.com/a/20762713
function mostFrequentString(arr: Array<string>) {
  return arr
    .sort(
      (a, b) =>
        arr.filter((v) => v === a).length - arr.filter((v) => v === b).length
    )
    .pop();
}

const flutterColor = (fills: ReadonlyArray<Paint> | PluginAPI["mixed"]) => {
  if (fills !== figma.mixed && fills.length > 0) {
    let fill = fills[0];
    if (fill.type === "SOLID") {
      let opacity = fill.opacity ?? 1.0;

      // if fill isn't visible, it shouldn't be painted.
      return fill.visible
        ? `color: Color(0x${rgbTohex(fill.color, opacity)}),`
        : ``;
    }
  }

  return ``;
};

const flutterCornerRadius = (
  node: RectangleNode | FrameNode | InstanceNode | ComponentNode | EllipseNode
) => {
  if (node.type === "ELLIPSE") return "";

  return node.cornerRadius !== figma.mixed
    ? `borderRadius: BorderRadius.circular(${node.cornerRadius}), `
    : `borderRadius: BorderRadius.only(topLeft: ${node.topLeftRadius}, topRight: ${node.topRightRadius}, bottomLeft: ${node.bottomLeftRadius}, bottomRight: ${node.bottomRightRadius}), `;
};

const generatePadding = (
  node: FrameNode | ComponentNode | InstanceNode
): string => {
  // Add padding if necessary!
  // This must happen before Stack or after the Positioned, but not before.

  // padding is only valid for auto layout.
  // [horizontalPadding] and [verticalPadding] can have values even when AutoLayout is off
  if (node.layoutMode === "NONE") return ``;

  if (node.horizontalPadding > 0 || node.verticalPadding > 0) {
    const propHorizontalPadding =
      node.horizontalPadding > 0
        ? `horizontal: ${node.horizontalPadding}, `
        : ``;

    const propVerticalPadding =
      node.verticalPadding > 0 ? `vertical: ${node.verticalPadding}, ` : ``;

    return `padding: const EdgeInsets.symmetric(${propVerticalPadding}${propHorizontalPadding}),`;
  }
  return ``;
};

const getContainerDecoration = (
  node: RectangleNode | FrameNode | InstanceNode | ComponentNode | EllipseNode
): string => {
  /// DECORATION
  /// This is the code that will generate the BoxDecoration for the Container

  // retrieve the fill color, when existent (returns "" otherwise)
  const propBackgroundColor = flutterColor(node.fills);

  // retrieve the stroke color, when existent (returns "" otherwise)
  const propStrokeColor = flutterColor(node.strokes);

  // only add strokeWidth when there is a strokeColor (returns "" otherwise)
  const propStrokeWidth = propStrokeColor ? `width: ${node.strokeWeight},` : ``;

  // modify the circle's shape when type is ellipse
  const propShape = node.type === "ELLIPSE" ? "shape: BoxShape.circle," : "";

  // generate the border, when it should exist
  const propBorder =
    propStrokeColor || propStrokeWidth
      ? `border: Border.all(${propStrokeColor}${propStrokeWidth}),`
      : ``;

  let propBoxShadow = "";
  if (node.effects.length > 0) {
    const drop_shadow: Array<ShadowEffect> = node.effects.filter(
      (d): d is ShadowEffect => d.type === "DROP_SHADOW"
    );
    let boxShadow = "";
    if (drop_shadow) {
      drop_shadow.forEach((d: ShadowEffect) => {
        d.radius;
        boxShadow += `BoxShadow(
          color: ${rgbTohex(d.color)},
          blurRadius: ${d.radius},
          offset: Offset(${d.offset.x}, ${d.offset.y}),
        ), `;
      });
    }
    // TODO inner shadow, layer blur
    propBoxShadow = `boxShadow: [ ${boxShadow} ]`;
  }

  // retrieve the borderRadius, when existent (returns "" for EllipseNode)
  const propBorderRadius = flutterCornerRadius(node);

  // generate the decoration, or just the backgroundColor
  const propBoxDecoration =
    node.cornerRadius !== 0 || propStrokeColor || propShape
      ? `decoration: BoxDecoration(${propBorderRadius}${propShape}${propBorder}${propBoxShadow}${propBackgroundColor}),`
      : `${propBackgroundColor}`;

  return propBoxDecoration;
};

const isStack = (parent: BaseNode): boolean => {
  if (parent.type === "GROUP" && parent.children.length > 1) {
    return true;
  }

  if (
    (parent.type === "FRAME" ||
      parent.type === "INSTANCE" ||
      parent.type === "COMPONENT") &&
    parent.layoutMode === "NONE" &&
    parent.children.length > 1
  ) {
    return true;
  }

  return false;
};

const getContainerPosition = (
  node: SceneNode,
  propContainer: string
): string => {
  const parent = node.parent;

  // avoid adding Positioned() when parent is not a Stack(), which can happen at the beggining
  if (parent === null || parentId === parent.id) {
    return ``;
  }

  if (
    isStack(parent) &&
    (parent.type === "FRAME" ||
      parent.type === "GROUP" ||
      parent.type === "COMPONENT" ||
      parent.type === "INSTANCE")
  ) {
    // [--x--][-width-][--x--]
    // that's how the formula below works, to see if view is centered
    const centerX = 2 * node.x + node.width === parent.width;
    const centerY = 2 * node.y + node.height === parent.height;

    const positionedAlign = (align: string) =>
      `Positioned.fill(child: Align(alingment: Alingment.${align},child: ${propContainer}),),`;

    if (centerX && centerY) {
      return `Positioned.fill(child: Center(child: ${propContainer}),),`;
    } else if (centerX) {
      if (node.y === 0) {
        // y = top, x = center
        return positionedAlign(`topCenter`);
      } else if (node.y === parent.height) {
        // y = bottom, x = center
        return positionedAlign(`bottomCenter`);
      }
      // y = any, x = center
      // there is no Alignment for this, therefore it goes to manual mode.
      // since we are using return, manual mode will be calculated at the end
    } else if (centerY) {
      if (node.x === 0) {
        // y = center, x = left
        return positionedAlign(`centerLeft`);
      } else if (node.x === parent.width) {
        // y = center, x = right
        return positionedAlign(`centerRight`);
      }
      // y = center, x = any
      // there is no Alignment for this, therefore it goes to manual mode.
    }

    // manual mode, just use the position.
    return `Positioned(left: ${node.x}, top: ${node.y}, child: ${propContainer}),`;
  }

  return ``;
};

const getContainerSize = (
  node: RectangleNode | FrameNode | InstanceNode | ComponentNode | EllipseNode
) => {
  /// WIDTH AND HEIGHT
  /// Will the width and height be necessary?

  // if counterAxisSizingMode === "AUTO", width and height won't be set. For every other case, it will be.

  // when the child has the same size as the parent, don't set the size twice
  if (
    node.type === "FRAME" ||
    node.type === "INSTANCE" ||
    node.type === "COMPONENT"
  ) {
    if (node.children.length === 1) {
      const child = node.children[0];
      if (child.width === node.width && child.height && node.height) {
        return ``;
      }
    }
  }

  let nodeHeight = node.height;
  let nodeWidth = node.width;

  // Flutter doesn't support OUTSIDE or CENTER, only INSIDE.
  // Therefore, to give the same feeling, the height and width will be slighly increased.
  // node.strokes.lenght is necessary because [strokeWeight] can exist even without strokes.
  if (node.strokes.length) {
    if (node.strokeAlign === "OUTSIDE") {
      nodeHeight += node.strokeWeight * 2;
      nodeWidth += node.strokeWeight * 2;
    } else if (node.strokeAlign === "CENTER") {
      nodeHeight += node.strokeWeight;
      nodeWidth += node.strokeWeight;
    }
  }

  const propHeight = `height: ${nodeHeight}, `;
  const propWidth = `width: ${nodeWidth}, `;

  if (
    node.type === "FRAME" ||
    node.type === "INSTANCE" ||
    node.type === "COMPONENT"
  ) {
    if (node.counterAxisSizingMode === "FIXED") {
      // when AutoLayout is HORIZONTAL, width is set by Figma and height is auto.
      if (node.layoutMode === "HORIZONTAL") {
        return propHeight;
      } else if (node.layoutMode === "VERTICAL") {
        // when AutoLayout is VERTICAL, height is set by Figma and width is auto.
        return propWidth;
      }
      return `${propWidth}${propHeight}`;
    }
  } else if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
    return `${propWidth}${propHeight}`;
  }

  return ``;
};

const convertFontWeight = (weight: string) => {
  switch (weight) {
    case "Thin":
      return "100";
    case "Extra Light":
      return "200";
    case "Light":
      return "300";
    case "Regular":
      return "400";
    case "Medium":
      return "500";
    case "Semi Bold":
      return "600";
    case "Bold":
      return "700";
    case "Extra Bold":
      return "800";
    case "Black":
      return "900";
    default:
      return "400";
  }
};

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
const buildContainer = (
  node: RectangleNode | FrameNode | InstanceNode | ComponentNode | EllipseNode,
  child: string = ""
) => {
  // ignore the view when size is zero or less
  // while technically it shouldn't get less than 0, due to rounding errors,
  // it can get to values like: -0.000004196293048153166
  if (node.width <= 0 || node.height <= 0) {
    return child;
  }

  const propBoxDecoration: string = getContainerDecoration(node);

  const propWidthHeight: string = getContainerSize(node);

  if (node.fills !== figma.mixed && node.fills.length > 0) {
    let fill = node.fills[0];

    // todo IMAGE and multiple Gradients
    if (fill.type === "IMAGE") {
    }
  }

  /// CONTAINER
  /// Put everything together
  const propChild: string = child ? `child: ${child}` : ``;

  // [propPadding] will be "padding: const EdgeInsets.symmetric(...)" or ""
  let propPadding: string = ``;
  if (
    node.type === "FRAME" ||
    node.type === "COMPONENT" ||
    node.type === "INSTANCE"
  ) {
    propPadding = generatePadding(node);
  }

  // Container is a container if [propWidthHeight] and [propBoxDecoration] are set.
  let propContainer: string;
  if (propWidthHeight || propBoxDecoration) {
    propContainer = `\nContainer(${propWidthHeight}${propBoxDecoration}${propPadding}${propChild}),`;
  } else if (propPadding) {
    propContainer = `\nPadding(${propPadding}${propChild}),`;
  } else {
    propContainer = child;
  }

  // Rotation. This must be done before Position is added.
  // that's how you convert angles to clockwise radians: angle * -pi/180
  // using 3.14159 as Pi for enough precision and to avoid importing math lib.
  const propRotation =
    node.rotation > 0
      ? `Transform.rotate(angle: ${
          node.rotation * (-3.14159 / 180)
        }, child: ${propContainer})`
      : propContainer;

  // Visibility. This must be done before Position is added.
  const propVisibility: string = !node.visible
    ? `Visibility(visible: ${node.visible}, child: ${propRotation}),`
    : propRotation;

  // retrieve the position when the parent is a Stack.
  const propPositioned: string = getContainerPosition(node, propVisibility);

  const updatedChild: string = propPositioned ? propPositioned : propVisibility;

  return updatedChild;
};

// lint ideas:
// replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const recur = (sceneNode: ReadonlyArray<SceneNode>): string => {
  let comp = "";
  const sceneLen = sceneNode.length;

  sceneNode.forEach((node, index) => {
    if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
      comp += buildContainer(node);
    } else if (node.type === "VECTOR") {
      // TODO Vector support in Flutter is complicated.
      comp += `\nCenter(
          child: Container(
          //todo this is a vector. 
          width: ${node.width},
          height: ${node.height},
          color: Color(0xffff0000),
        ),
      ),`;
    } else if (node.type === "GROUP") {
      // TODO generate Rows or Columns instead of Stack when Group is simple enough (two or three items) and they aren't on top of one another.
      // comp += recur(node.children);
      comp += `Stack(children:[${recur(node.children)}],),`;
    } else if (
      node.type === "FRAME" ||
      node.type === "INSTANCE" ||
      node.type === "COMPONENT"
    ) {
      const childrenItems = recur(node.children);

      if (node.layoutMode === "NONE" && node.children.length > 1) {
        comp += buildContainer(node, `Stack(children:[${childrenItems}],),`);
      } else if (node.children.length > 1) {
        // ROW or COLUMN
        const rowOrColumn = node.layoutMode === "HORIZONTAL" ? "Row" : "Column";
        const mostFrequent = mostFrequentString(
          node.children.map((d) => d.layoutAlign)
        );

        const layoutAlign = mostFrequent === "MIN" ? "start" : "center";
        const crossAxisColumn =
          rowOrColumn === "Column"
            ? `crossAxisAlignment: CrossAxisAlignment.${layoutAlign},`
            : "";
        const mainAxisSize = "mainAxisSize: MainAxisSize.min,";
        const propChild = `${rowOrColumn}(${mainAxisSize}${crossAxisColumn}children:[${childrenItems}],),`;
        comp += buildContainer(node, propChild);
      } else {
        comp += buildContainer(node, childrenItems);
      }
    } else if (node.type === "TEXT") {
      let alignHorizontal = node.textAlignHorizontal.toString().toLowerCase();
      alignHorizontal =
        alignHorizontal === "justify" ? "justified" : alignHorizontal;

      const color = flutterColor(node.fills);

      let child: string = `
      Text(
        "${node.characters}",
        ${
          alignHorizontal !== "left"
            ? `textAlign: TextAlign.${alignHorizontal},`
            : ``
        }
        style: TextStyle(
          ${node.fontSize !== figma.mixed ? `fontSize: ${node.fontSize}` : ``},
          //${
            node.fontName !== figma.mixed
              ? `fontFamily: ${node.fontName.family}`
              : ``
          },
          ${
            node.fontName !== figma.mixed
              ? `fontWeight: FontWeight.w${convertFontWeight(
                  node.fontName.style
                )}`
              : ``
          },
          ${color}
        ),
      ),`;

      if (node.opacity !== 1) {
        child = getOpacity(node, child);
      }

      // this must be run before [node.textAutoResize], else Align will overwrite TextAlign.
      // when [node.textAutoResize] !== "NONE", the box will have auto size and therefore the align attribute will be ignored.
      // if (
      //   node.textAlignVertical === "CENTER" &&
      //   node.textAutoResize === "NONE"
      // ) {
      //   child += `Center(child: ${child}),`;
      // } else if (
      //   node.textAlignVertical === "BOTTOM" &&
      //   node.textAutoResize === "NONE"
      // ) {
      //   child += `
      //   Align(
      //     alignment: Alignment.bottomCenter,
      //     child: ${child}
      //   ),
      //   `;
      // }
      const textAligned = getTextAligned(node, child);
      if (textAligned) child = textAligned;

      if (node.textAutoResize === "NONE") {
        // = instead of += because we want to replace it
        child = `
        SizedBox(
          width: ${node.width},
          height: ${node.height},
          child: ${child}
        ),
        `;
      } else if (node.textAutoResize === "HEIGHT") {
        // if HEIGHT is set, it means HEIGHT will be calculated automatically, but width won't
        // = instead of += because we want to replace it
        child = `
        SizedBox(
          width: ${node.width},
          child: ${child}
        ),
        `;
      }

      const positioned = getContainerPosition(node, child);
      if (positioned) {
        comp += positioned;
      } else {
        comp += child;
      }
    }

    // if the parent is an AutoLayout, and itemSpacing is set, add a SizedBox between items.
    if (
      node.parent?.type === "FRAME" ||
      node.parent?.type === "INSTANCE" ||
      node.parent?.type === "COMPONENT"
    ) {
      // check if itemSpacing is set and if it isn't the last value. Don't add the SizedBox at last value.
      // in Figma, itemSpacing CAN be negative. Here it can't.
      if (node.parent.itemSpacing > 0 && index < sceneLen - 1) {
        // this is necessary to avoid ", ," if comp is empty.
        if (node.parent.layoutMode === "HORIZONTAL") {
          // replace comp with this. It is =, not += here!
          comp = `${comp} SizedBox(width: ${node.parent.itemSpacing}),`;
        } else if (node.parent.layoutMode === "VERTICAL") {
          // replace comp with this. It is =, not += here!
          comp = `${comp} SizedBox(height: ${node.parent.itemSpacing}),`;
        }
      }
    }
  });

  return comp;
};

// check [ignoreStackParent] description
if (figma.currentPage.selection.length > 0) {
  parentId = figma.currentPage.selection[0].parent?.id ?? "";
}

const result = recur(figma.currentPage.selection);
console.log(result);
figma.closePlugin();

// figma.ui.onmessage = (msg) => {
//   recur(figma.currentPage.selection);
//   // Make sure to close the plugin when you're done. Otherwise the plugin will
//   // keep running, which shows the cancel button at the bottom of the screen.
//   figma.closePlugin();
// };
