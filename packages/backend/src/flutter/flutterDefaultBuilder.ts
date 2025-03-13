import {
  flutterVisibility,
  flutterOpacity,
  flutterRotation,
} from "./builderImpl/flutterBlend";

import { flutterContainer } from "./flutterContainer";
import {
  commonIsAbsolutePosition,
  getCommonPositionValue,
} from "../common/commonPosition";
import { generateWidgetCode } from "../common/numToAutoFixed";

export class FlutterDefaultBuilder {
  child: string;

  constructor(optChild: string) {
    this.child = optChild;
  }

  createContainer(node: SceneNode): this {
    this.child = flutterContainer(node, this.child);
    return this;
  }

  blendAttr(node: SceneNode): this {
    console.log("rotation is", node.rotation);
    if ("rotation" in node) {
      this.child = flutterRotation(node, this.child);
    }
    if ("visible" in node) {
      this.child = flutterVisibility(node, this.child);
    } else if ("opacity" in node) {
      this.child = flutterOpacity(node, this.child);
    }
    return this;
  }

  position(node: SceneNode): this {
    if (commonIsAbsolutePosition(node)) {
      const { x, y } = getCommonPositionValue(node);
      this.child = generateWidgetCode("Positioned", {
        left: x,
        top: y,
        child: this.child,
      });
    }
    return this;
  }
}
