import {
  wrapOpacity,
  wrapContainerPosition,
  wrapTextInsideAlign,
  wrapTextAutoResize,
  wrapRotation,
  wrapVisibility,
} from "./flutter_wrappers";
import { makeTextComponent, makeContainer } from "./flutter_widget";

export class FlutterChildBuilder {
  public child: string = "";

  /**
   * A fresh builder instance should contain a blank product object, which is
   * used in further assembly.
   */
  constructor(optChild: string = "") {
    this.child = optChild ?? "";
  }

  public reset(): void {
    this.child = "";
  }

  public createText(node: TextNode): this {
    this.child = makeTextComponent(node);
    return this;
  }

  public createContainer(
    node:
      | RectangleNode
      | FrameNode
      | InstanceNode
      | ComponentNode
      | EllipseNode,
    child: string
  ): this {
    this.child = makeContainer(node, child);
    return this;
  }

  public opacity(node: BlendMixin): this {
    this.child = wrapOpacity(node, this.child);
    return this;
  }

  public visibility(node: SceneNode): this {
    this.child = wrapVisibility(node, this.child);
    return this;
  }

  public rotation(node: LayoutMixin): this {
    this.child = wrapRotation(node, this.child);
    return this;
  }

  public containerPosition(node: SceneNode, parentId: string): this {
    this.child = wrapContainerPosition(node, this.child, parentId);
    return this;
  }

  public textInAlign(node: TextNode): this {
    this.child = wrapTextInsideAlign(node, this.child);
    return this;
  }

  public textAutoSize(node: TextNode): this {
    this.child = wrapTextAutoResize(node, this.child);
    return this;
  }
}
