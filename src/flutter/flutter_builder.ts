import {
  AltSceneNode,
  AltBlendMixin,
  AltLayoutMixin,
  AltRectangleNode,
  AltEllipseNode,
  AltFrameNode,
} from "./../common/altMixins";

import {
  wrapOpacity,
  wrapContainerPosition,
  wrapRotation,
  wrapVisibility,
} from "./flutter_wrappers";
import { makeContainer } from "./make_container";

export class FlutterChildBuilder {
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
    node: AltRectangleNode | AltEllipseNode | AltFrameNode
  ): this {
    this.child = makeContainer(node, this.child);
    return this;
  }

  blendAttr(node: AltSceneNode): this {
    this.visibility(node);
    this.rotation(node);
    this.opacity(node);

    return this;
  }

  opacity(node: AltBlendMixin): this {
    this.child = wrapOpacity(node, this.child);
    return this;
  }

  visibility(node: AltSceneNode): this {
    this.child = wrapVisibility(node, this.child);
    return this;
  }

  rotation(node: AltLayoutMixin): this {
    this.child = wrapRotation(node, this.child);
    return this;
  }

  containerPosition(node: AltSceneNode, parentId: string): this {
    this.child = wrapContainerPosition(node, this.child, parentId);
    return this;
  }
}
