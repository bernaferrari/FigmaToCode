import { AltGroupNode } from "./../altNodes/altMixins";
import { retrieveTopFill } from "./../common/retrieveFill";
import { flutterPosition } from "./builderImpl/flutterPosition";
import {
  flutterVisibility,
  flutterOpacity,
  flutterRotation,
} from "./builderImpl/flutterBlend";
import {
  AltSceneNode,
  AltRectangleNode,
  AltEllipseNode,
  AltFrameNode,
} from "../altNodes/altMixins";

import { flutterContainer } from "./flutterContainer";
import { flutterMaterial } from "./flutterMaterial";

export class FlutterDefaultBuilder {
  child: string;

  constructor(optChild: string) {
    this.child = optChild;
  }

  createContainer(
    node: AltRectangleNode | AltEllipseNode | AltFrameNode | AltGroupNode,
    material: boolean
  ): this {
    const fill = node.type === "GROUP" ? null : retrieveTopFill(node.fills);
    // fill.visible can be true or undefined (on tests)
    if (
      node.type !== "GROUP" &&
      material &&
      fill &&
      fill.visible !== false &&
      fill.type === "SOLID"
    ) {
      this.child = flutterMaterial(node, this.child);
    } else {
      this.child = flutterContainer(node, this.child);
    }
    return this;
  }

  blendAttr(node: AltSceneNode): this {
    this.child = flutterVisibility(node, this.child);
    this.child = flutterRotation(node, this.child);
    this.child = flutterOpacity(node, this.child);

    return this;
  }

  position(node: AltSceneNode, parentId: string): this {
    this.child = flutterPosition(node, this.child, parentId);
    return this;
  }
}
