// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (see documentation).

// This shows the HTML page in "ui.html".
// figma.showUI(__html__);

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.

let masterComponents: Map<string, ComponentNode> = new Map();
let diffInMasterComps: Map<string, Array<string>> = new Map();

const rgbTohex = (r: number, g: number, b: number) => {
  const hex =
    ((r * 255) | (1 << 8)).toString(16).slice(1) +
    ((g * 255) | (1 << 8)).toString(16).slice(1) +
    ((b * 255) | (1 << 8)).toString(16).slice(1);

  return hex;
};

// TODO
// Extract components.
// Wait a minute!
// This can be made directly in Flutter!
// A lot more people will benefit from it!
// const retrieveMasterComponents = (
//   sceneNode: ReadonlyArray<SceneNode>
// ): string => {
//   let comp = "";
//   for (const node of sceneNode) {
//     if (node.type === "INSTANCE") {
//       masterComponents.set(node.masterComponent.name, node.masterComponent);

//       let arr = diffInMasterComps.get(node.masterComponent.name) ?? Array();

//       node.masterComponent.children.forEach((d) => {
//         let masterChild = d;
//         let instanceChild = node.children.find((dd) => dd.id.includes(d.id));
//         if (instanceChild !== undefined) {
//           if (masterChild.visible !== instanceChild.visible) {
//             arr.push("VISIBLE");
//           }
//           if (
//             masterChild.type === "RECTANGLE" &&
//             instanceChild.type === "RECTANGLE"
//           ) {
//             // if (masterChild.fills[0].color !== instanceChild.fills[0].color) {
//             //   arr.push("COLOR");
//             // }
//           }
//         }
//       });

//       diffInMasterComps.set(node.masterComponent.name, arr);
//     }

//     if (
//       node.type === "INSTANCE" ||
//       node.type === "FRAME" ||
//       node.type === "GROUP"
//     ) {
//       retrieveMasterComponents(node.children);
//     }
//   }

//   return comp;
// };

// [getContainerPosition] can get confused.
// If the parent frame is identified to be a Stack, it adds an unnecessary Positioned()
// which causes error in Flutter.
// Therefore, this will used as a counter. On the beggining, check if the parent of the selected is a stack,
// if it is, set this to 1. When it reaches [getContainerPosition], subtract 1. Only execute the function when 0.
let ignoreStackParent: number;

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
      // if fill isn't visible, it shouldn't be painted.
      return fill.visible === false
        ? ``
        : `color: Color(0xff${rgbTohex(
            fill.color.r,
            fill.color.g,
            fill.color.b
          )}),`;
    }
  }

  return ``;
};

const flutterCornerRadius = (
  node: RectangleNode | FrameNode | InstanceNode | ComponentNode | EllipseNode
) => {
  if (node.type === "ELLIPSE") return "";

  return node.cornerRadius !== figma.mixed
    ? `borderRadius: BorderRadius.circular(${node.cornerRadius}),`
    : `borderRadius: BorderRadius.only(topLeft: ${node.topLeftRadius}, topRight: ${node.topRightRadius}, bottomLeft: ${node.bottomLeftRadius}, bottomRight: ${node.bottomRightRadius}),`;
};

const generatePadding = (
  node: FrameNode | ComponentNode | InstanceNode
): string => {
  // Add padding if necessary!
  // This must happen before Stack or after the Positioned, but not before.
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

  // retrieve the borderRadius, when existent (returns "" for EllipseNode)
  const propBorderRadius = flutterCornerRadius(node);

  // generate the decoration, or just the backgroundColor
  const propBoxDecoration =
    node.cornerRadius !== 0 || propStrokeColor || propShape
      ? `decoration: BoxDecoration(${propBorderRadius}${propShape}${propBorder}${propBackgroundColor}),`
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

// properties named propSomething always take care of ","
// sometimes a property might not exist, so it doesn't add ","
const buildContainer = (
  node: RectangleNode | FrameNode | InstanceNode | ComponentNode | EllipseNode,
  child: string = ""
) => {
  const propBoxDecoration: string = getContainerDecoration(node);

  /// WIDTH AND HEIGHT
  /// Will the width and height be necessary?

  // if counterAxisSizingMode === "AUTO", width and height won't be set. For every other case, it will be.
  let propWidthHeight = ``;
  if (
    node.type === "FRAME" ||
    node.type === "INSTANCE" ||
    node.type === "COMPONENT"
  ) {
    if (node.counterAxisSizingMode === "FIXED") {
      propWidthHeight = `width: ${node.width}, height: ${node.height}, `;
    } else {
      // when AutoLayout is HORIZONTAL, width is set by Figma and height is auto.
      if (node.layoutMode === "HORIZONTAL") {
        propWidthHeight = `width: ${node.width}, `;
      } else if (node.layoutMode === "VERTICAL") {
        // when AutoLayout is VERTICAL, height is set by Figma and width is auto.
        propWidthHeight = `height: ${node.height}, `;
      }
    }
  } else if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
    propWidthHeight = `width: ${node.width}, height: ${node.height}, `;
  }

  /// CONTAINER
  /// Put everything together
  const propChild = child ? `child: ${child}` : ``;

  let propPadding = ``;
  if (
    node.type === "FRAME" ||
    node.type === "COMPONENT" ||
    node.type === "INSTANCE"
  ) {
    propPadding = generatePadding(node);
  }

  // if [propWidthHeight] and [propBoxDecoration] werent set, just return the child.
  const propContainer =
    propWidthHeight || propBoxDecoration
      ? `\nContainer(${propWidthHeight}${propBoxDecoration}${propPadding}${propChild}),`
      : child;

  // retrieve the position when the parent is a Stack.
  const propPositioned: string = getContainerPosition(node, propContainer);
  return propPositioned ? propPositioned : propContainer;
};

// lint ideas:
// replace BorderRadius.only(topleft: 8, topRight: 8) with BorderRadius.horizontal(8)
const recur = (sceneNode: ReadonlyArray<SceneNode>): string => {
  let comp = "";
  const sceneLen = sceneNode.length;

  sceneNode.forEach((node, index) => {
    console.log("AHAHAHAHA");
    console.log(node.type);

    if (node.type === "RECTANGLE" || node.type === "ELLIPSE") {
      comp += buildContainer(node);
    } else if (node.type === "VECTOR") {
      // TODO
      // Vector support in Flutter is... complicated.
      comp += `\nCenter(
          child: Container(
          //todo this is a vector. 
          width: ${node.width},
          height: ${node.height},
          color: Color(0xffff0000),
        ),
      ),`;
    } else if (node.type === "GROUP") {
      // TODO need to handle FILL differently!
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

      /*
${
            node.fontName !== figma.mixed
              ? `${
                  node.fontName.style.toLowerCase() === "bold"
                    ? "fontWeight: FontWeight.bold"
                    : ``
                }`
              : ``
          },
*/

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
          //${
            node.fontName !== figma.mixed
              ? `fontWeight: ${node.fontName.style}`
              : ``
          },
          ${color}
        ),
      ),`;

      if (node.opacity !== 1) {
        child += `
        Opacity(
            opacity: ${node.opacity},
            child: ${child}
        ),`;
      }

      // this must be run before [node.textAutoResize], else Align will overwrite TextAlign.
      // when [node.textAutoResize] !== "NONE", the box will have auto size and therefore the align attribute will be ignored.
      if (
        node.textAlignVertical === "CENTER" &&
        node.textAutoResize === "NONE"
      ) {
        child += `Center(child: ${child}),`;
      } else if (
        node.textAlignVertical === "BOTTOM" &&
        node.textAutoResize === "NONE"
      ) {
        child += `
        Align(
          alignment: Alignment.bottomCenter,
          child: ${child}
        ),
        `;
      }

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
      console.log(positioned);
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
// figma.closePlugin();

// figma.ui.onmessage = (msg) => {
//   console.log("hahahaha!!!");

//   recur(figma.currentPage.selection);
//   // Make sure to close the plugin when you're done. Otherwise the plugin will
//   // keep running, which shows the cancel button at the bottom of the screen.
//   figma.closePlugin();
// };
