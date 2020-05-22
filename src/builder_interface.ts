export interface CodeBuilder {
  createText(node: TextNode): this;
  createContainer(
    node:
      | RectangleNode
      | FrameNode
      | InstanceNode
      | ComponentNode
      | EllipseNode,
    child: string
  ): this;

  opacity(node: BlendMixin): this;
  visibility(node: SceneNode): this;
  rotation(node: LayoutMixin): this;

  containerPosition(node: SceneNode, parentId: string): this;

  textInAlign(node: TextNode): this;
  textAutoSize(node: TextNode): this;
}
