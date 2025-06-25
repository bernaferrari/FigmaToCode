import {
  composeVisibility,
  composeOpacity,
  composeRotation,
} from "./builderImpl/composeBlend";

import { composeContainer } from "./composeContainer";
import {
  commonIsAbsolutePosition,
  getCommonPositionValue,
} from "../common/commonPosition";

export class ComposeDefaultBuilder {
  child: string;
  rotationApplied: boolean = false;

  constructor(optChild: string) {
    this.child = optChild;
  }

  createContainer(node: SceneNode): this {
    this.child = composeContainer(node, this.child);
    this.rotationApplied = true;

    return this;
  }

  blendAttr(node: SceneNode): this {
    if ("rotation" in node && !this.rotationApplied) {
      this.child = composeRotation(node, this.child);
    }

    if ("visible" in node) {
      this.child = composeVisibility(node, this.child);
    } else if ("opacity" in node) {
      this.child = composeOpacity(node, this.child);
    }
    return this;
  }

  position(node: SceneNode): this {
    if (commonIsAbsolutePosition(node)) {
      const { x, y } = getCommonPositionValue(node);
      // In Compose, absolute positioning is handled differently
      // We use offset modifier instead of a positioned wrapper
      this.child = `Box(
    modifier = Modifier.offset(x = ${x}.dp, y = ${y}.dp)
) {
    ${this.child}
}`;
    }
    return this;
  }
}