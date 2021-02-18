import { AltFrameNode, AltGroupNode } from "../altNodes/altMixins";
import { TailwindDefaultBuilder } from "./tailwindDefaultBuilder";

export const tailwindVector = (
  node: AltFrameNode | AltGroupNode,
  showLayerName: boolean,
  parentId: string,
  isJsx: boolean
): string => {
  // TODO VECTOR
  return "";
};

// import {
//   AltFrameMixin,
//   AltFrameNode,
//   AltGroupNode,
// } from "./../common/AltMixins";
// import { rgbTo6hex } from "./colors";

// // todo improve this, positioning is wrong
// // todo support for ungroup vectors. This was reused because 80% of people are going
// export const tailwindVector = (
//   group: AltFrameNode | AltGroupNode,
//   isJsx: Boolean
// ) => {
//   // to use Vectors in groups (like icons)

//   // if every children is a VECTOR, no children have a child
//   if (
//     group.children.length === 0 ||
//     !group.children.every((d) => d.type === "VECTOR")
//   ) {
//     return "";
//   }

//   const node = group.children[0] as VectorNode;

//   const strokeOpacity = vectorOpacity(node.strokes);
//   const strokeOpacityAttr =
//     strokeOpacity < 1
//       ? `${isJsx ? "strokeOpacity" : "stroke-opacity"}=${
//           isJsx ? `{${strokeOpacity}}` : `"${strokeOpacity}"`
//         }\n`
//       : "";

//   const strokeWidthAttr = `${isJsx ? "strokeWidth" : "stroke-width"}=${
//     isJsx ? `{${node.strokeWeight}}` : `"${node.strokeWeight}"`
//   }\n`;

//   const strokeLineCapAttr =
//     node.strokeCap === "ROUND"
//       ? `${isJsx ? "strokeLinecap" : "stroke-linecap"}="round"\n`
//       : "";

//   const strokeLineJoinAttr =
//     node.strokeJoin !== "MITER"
//       ? `${
//           isJsx ? "strokeLinejoin" : "stroke-linejoin"
//         }="${node.strokeJoin.toString().toLowerCase()}"\n`
//       : "";

//   const strokeAttr =
//     node.strokes.length > 0 ? `stroke="#${vectorColor(node.strokes)}"\n` : "";

//   const sizeAttr = isJsx
//     ? `height={${node.height}} width={${node.width}}`
//     : `height="${node.height}" width="${node.width}"`;

//   // reduce everything into a single string
//   const paths = group.children.reduce(
//     (acc, n) =>
//       acc +
//       (n as VectorNode).vectorPaths.reduce((acc, d) => {
//         const fillRuleAttr =
//           d.windingRule !== "NONE"
//             ? `${isJsx ? "fillRule" : "fill-rule"}="${d.windingRule}"\n`
//             : "";

//         return (
//           acc +
//           `<path\n${fillRuleAttr}${strokeAttr}${strokeOpacityAttr}${strokeWidthAttr}${strokeLineCapAttr}${strokeLineJoinAttr}d="${d.data}"/>\n`
//         );
//       }, ""),
//     ""
//   );

//   return `<svg ${sizeAttr} fill="none">
//     ${paths}
//     </svg>`;

//   // return `<div height=\"${node.height}\" width=\"${node.width}\"></div>`;
//   // return `<svg height="${node.height}" width="${node.width}">
//   // <path d="${node.vectorPaths[0].data}" />
//   // </svg>`;
// };

// const vectorColor = (
//   fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
// ): string => {
//   // kind can be text, bg, border...
//   if (fills !== figma.mixed && fills.length > 0) {
//     let fill = fills[0];
//     if (fill.type === "SOLID") {
//       const hex = rgbTo6hex(fill.color);
//       return fill.visible ? `${hex}` : "";
//     }
//   }

//   return "";
// };

// const vectorOpacity = (
//   fills: ReadonlyArray<Paint> | PluginAPI["mixed"]
// ): number => {
//   // kind can be text, bg, border...
//   if (fills !== figma.mixed && fills.length > 0) {
//     let fill = fills[0];
//     if (fill.opacity !== undefined) {
//       return fill.opacity;
//     }
//   }

//   return 1;
// };
