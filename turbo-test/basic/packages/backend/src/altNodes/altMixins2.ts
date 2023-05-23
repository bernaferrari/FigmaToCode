// SCENENODE
export type SceneNode =
  | FrameNode
  | GroupNode
  | RectangleNode
  | EllipseNode
  | TextNode;

export class RectangleNode {
  readonly type = "RECTANGLE";
}
export class EllipseNode {
  readonly type = "ELLIPSE";
}
export class FrameNodeMock {
  readonly type = "FRAME";
}
export interface FrameNodeMock extends DefaultFrameMixin {}

export class GroupNode {
  readonly type = "GROUP";
}
export class TextNode {
  readonly type = "TEXT";
}

export interface TextNode2 extends TextNode {
  testRawr: string;
}
