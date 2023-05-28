import { flutterPosition } from "./builderImpl/flutterPosition";
import {
  flutterVisibility,
  flutterOpacity,
  flutterRotation,
} from "./builderImpl/flutterBlend";

import { flutterContainer } from "./flutterContainer";
import { commonIsAbsolutePosition } from "../common/commonPosition";
import { generateWidgetCode, sliceNum } from "../common/numToAutoFixed";

export class FlutterDefaultBuilder {
  child: string;

  constructor(optChild: string) {
    this.child = optChild;
  }

  createContainer(node: SceneNode, optimizeLayout: boolean): this {
    this.child = flutterContainer(node, this.child, optimizeLayout);
    return this;
  }

  blendAttr(node: SceneNode & LayoutMixin & MinimalBlendMixin): this {
    this.child = flutterVisibility(node, this.child);
    this.child = flutterRotation(node, this.child);
    this.child = flutterOpacity(node, this.child);
    return this;
  }

  position(node: SceneNode, optimizeLayout: boolean): this {
    if (commonIsAbsolutePosition(node, optimizeLayout)) {
      this.child = generateWidgetCode("Positioned", {
        left: node.x,
        top: node.y,
        child: this.child,
      });
    }
    return this;

    // TODO see if necessary.
    // return this.child = flutterPosition(node, this.child, parentId);
  }
}
