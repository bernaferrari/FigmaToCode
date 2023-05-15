// ALTSCENENODE
export type AltSceneNode =
  | FrameNode
  | GroupNode
  | RectangleNode
  | EllipseNode
  | AltTextNode;

export class RectangleNode {
  readonly type = "RECTANGLE";
}
export class EllipseNode {
  readonly type = "ELLIPSE";
}
export class FrameNode {
  readonly type = "FRAME";
}
export class GroupNode {
  readonly type = "GROUP";
}
export class AltTextNode {
  readonly type = "TEXT";
}

export interface AltTextNode extends TextNode {
  testRawr: string;
}
