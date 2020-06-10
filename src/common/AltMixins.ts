// ALTSCENENODE
export type AltSceneNode =
  | AltFrameNode
  | AltGroupNode
  | AltRectangleNode
  | AltTextNode;

export interface AltGeometryMixin {
  fills: ReadonlyArray<Paint> | PluginAPI["mixed"];
  strokes: ReadonlyArray<Paint>;
  strokeWeight: number;
  strokeMiterLimit: number;
  strokeAlign: "CENTER" | "INSIDE" | "OUTSIDE";
  strokeCap: StrokeCap | PluginAPI["mixed"];
  strokeJoin: StrokeJoin | PluginAPI["mixed"];
  dashPattern: ReadonlyArray<number>;
  fillStyleId: string | PluginAPI["mixed"];
  strokeStyleId: string;
}

export interface AltCornerMixin {
  cornerRadius: number | PluginAPI["mixed"];
  cornerSmoothing: number;
}

export interface AltRectangleCornerMixin {
  topLeftRadius: number;
  topRightRadius: number;
  bottomLeftRadius: number;
  bottomRightRadius: number;
}

export interface AltBlendMixin {
  opacity: number;
  blendMode: BlendMode;
  isMask: boolean;
  effects: ReadonlyArray<Effect>;
  effectStyleId: string;
  visible: boolean;
}

export interface AltLayoutMixin {
  x: number;
  y: number;
  rotation: number; // In degrees

  width: number;
  height: number;

  layoutAlign: "MIN" | "CENTER" | "MAX" | "STRETCH"; // applicable only inside auto-layout frames
}

export interface AltFrameMixin {
  layoutMode: "NONE" | "HORIZONTAL" | "VERTICAL";
  counterAxisSizingMode: "FIXED" | "AUTO"; // applicable only if layoutMode != "NONE"
  horizontalPadding: number; // applicable only if layoutMode != "NONE"
  verticalPadding: number; // applicable only if layoutMode != "NONE"
  itemSpacing: number; // applicable only if layoutMode != "NONE"

  layoutGrids: ReadonlyArray<LayoutGrid>;
  gridStyleId: string;
  clipsContent: boolean;
  guides: ReadonlyArray<Guide>;
}

export class AltRectangleNode {
  readonly type = "RECTANGLE";
}
export class AltFrameNode {
  readonly type = "FRAME";
}
export class AltGroupNode {
  readonly type = "GROUP";
}
export class AltTextNode {
  readonly type = "TEXT";
}

export interface AltDefaultShapeMixin
  extends BaseNodeMixinStub,
    AltBlendMixin,
    AltGeometryMixin,
    AltRectangleCornerMixin,
    AltCornerMixin,
    AltLayoutMixin {}

export interface AltRectangleNode
  extends AltDefaultShapeMixin,
    AltRectangleCornerMixin {}

export interface AltFrameNode
  extends AltFrameMixin,
    BaseNodeMixinStub,
    ChildrenMixinStub,
    AltGeometryMixin,
    AltCornerMixin,
    AltRectangleCornerMixin,
    AltBlendMixin,
    AltLayoutMixin {}

export interface AltGroupNode
  extends BaseNodeMixinStub,
    ChildrenMixinStub,
    AltBlendMixin,
    AltLayoutMixin {}

// DOCUMENT

interface AltDocumentNode extends BaseNodeMixinStub, ChildrenMixinStub {}

// PAGE
interface AltPageNode extends BaseNodeMixinStub, ChildrenMixinStub {}

interface AltTextMixin {
  characters: string;
  textAutoResize: "NONE" | "WIDTH_AND_HEIGHT" | "HEIGHT";

  textAlignHorizontal: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
  textAlignVertical: "TOP" | "CENTER" | "BOTTOM";

  paragraphIndent: number;
  paragraphSpacing: number;

  fontSize: number | PluginAPI["mixed"];
  fontName: FontName | PluginAPI["mixed"];
  textCase: TextCase | PluginAPI["mixed"];
  textDecoration: TextDecoration | PluginAPI["mixed"];
  letterSpacing: LetterSpacing | PluginAPI["mixed"];
  lineHeight: LineHeight | PluginAPI["mixed"];
}

export interface AltTextNode
  extends AltTextMixin,
    AltDefaultShapeMixin,
    BaseNodeMixinStub,
    AltLayoutMixin {}

const isInsideInstance = (node: any): boolean => {
  if (!node.parent) {
    return false;
  }
  return node.parent.type === "INSTANCE" || isInsideInstance(node.parent);
};

export class BaseNodeMixinStub {
  id: string = "missing";
  parent: ChildrenMixinStub | null = null;
  name: string = "missing";
  pluginData: { [key: string]: string } = {};

  setPluginData(key: string, value: string) {
    this.pluginData[key] = value;
  }

  getPluginData(key: string): string {
    return this.pluginData[key];
  }

  remove() {
    if (isInsideInstance(this)) {
      throw new Error("Error: can't remove item");
    }
    if (this.parent) {
      // @ts-ignore
      this.parent.children = this.parent.children.filter(
        (child: any) => child !== this
      );
    }
  }
}

export class ChildrenMixinStub {
  children: Array<AltSceneNode> = [];

  setChildren(altChildren: Array<AltSceneNode> | AltSceneNode) {
    if ("length" in altChildren) {
      this.children = altChildren;
    } else {
      this.children = [altChildren];
    }
  }

  appendChild(item: any) {
    if (item.parent) {
      item.parent.children = item.parent.children.filter(
        (child: any) => child !== item
      );
    }

    if (!item) {
      throw new Error("Error: empty child");
    }

    item.parent = this;
    this.children.push(item);
  }

  insertChild(index: number, child: any) {
    if (!this.children) {
      this.children = [];
    }

    if (!child) {
      throw new Error("Error: empty child");
    }

    // @ts-ignore
    if (child.parent === this) {
      throw new Error("Error: Node already inside parent");
    }

    if (
      // @ts-ignore
      this.type === "DOCUMENT" &&
      child.type !== "PAGE"
    ) {
      throw new Error(
        "Error: The root node cannot have children of type other than PAGE"
      );
    }
    if (child.parent) {
      child.parent.children = child.parent.children.filter(
        (_child: any) => child !== _child
      );
    }
    // @ts-ignore
    child.parent = this;
    this.children.splice(index, 0, child);
  }

  findAll(callback: (node: AltSceneNode) => boolean): AltSceneNode[] {
    if (!this.children) {
      return [];
    }
    return this.children.filter(callback);
  }

  findOne(callback: (node: AltSceneNode) => boolean): AltSceneNode | undefined {
    if (!this.children) {
      return undefined;
    }
    return this.children.find(callback);
  }

  findChild(
    callback: (node: AltSceneNode) => boolean
  ): AltSceneNode | undefined {
    if (!this.children) {
      return undefined;
    }
    return this.children.find(callback);
  }

  findChildren(
    callback: (node: AltSceneNode) => boolean
  ): AltSceneNode | undefined {
    if (!this.children) {
      return undefined;
    }

    return this.children.find(callback);
  }
}

// Original idea from from https://github.com/react-figma/figma-api-stub/blob/master/src/stubs.ts

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      Object.defineProperty(
        derivedCtor.prototype,
        name,
        // @ts-ignore
        Object.getOwnPropertyDescriptor(baseCtor.prototype, name)
      );
    });
  });
}

// DOCUMENT
class AltDocumentNode {
  type = "DOCUMENT";
  children = [];
}

// PAGE
class AltPageNode {
  type = "PAGE";
  children = [];
  _selection: Array<SceneNode> = [];

  get selection() {
    return this._selection || [];
  }

  set selection(value) {
    this._selection = value;
  }
}

applyMixins(AltRectangleNode, [BaseNodeMixinStub]);
applyMixins(AltFrameNode, [BaseNodeMixinStub, ChildrenMixinStub]);
applyMixins(AltGroupNode, [BaseNodeMixinStub, ChildrenMixinStub]);
applyMixins(AltDocumentNode, [BaseNodeMixinStub, ChildrenMixinStub]);
applyMixins(AltTextNode, [BaseNodeMixinStub]);
applyMixins(AltPageNode, [BaseNodeMixinStub, ChildrenMixinStub]);
