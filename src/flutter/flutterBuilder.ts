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

import { makeContainer } from "./flutterContainer";
import { makeMaterial } from "./flutterMaterial";

export class FlutterDefaultBuilder {
  child: string = "";

  /**
   * A fresh builder instance should contain a blank product object, which is
   * used in further assembly.
   */
  constructor(optChild: string = "") {
    this.child = optChild ?? "";
  }

  reset(): void {
    this.child = "";
  }

  createContainer(
    node: AltRectangleNode | AltEllipseNode | AltFrameNode,
    material: boolean
  ): this {
    if (
      material &&
      node.fills !== figma.mixed &&
      node.fills.length > 0 &&
      node.fills[0].visible === true
    ) {
      this.child = makeMaterial(node, this.child);
    } else {
      this.child = makeContainer(node, this.child);
    }
    return this;
  }

  blendAttr(node: AltSceneNode): this {
    this.child = flutterVisibility(node, this.child);
    this.child = flutterRotation(node, this.child);
    this.child = flutterOpacity(node, this.child);

    return this;
  }

  containerPosition(node: AltSceneNode, parentId: string): this {
    this.child = flutterPosition(node, this.child, parentId);
    return this;
  }
}
