import { sliceNum } from "../../common/numToAutoFixed";
import { Modifier } from "./androidParser";

export const androidOpacity = (node: MinimalBlendMixin): Modifier | null => {
  if (node.opacity !== undefined && node.opacity !== 1) {
    return ["android:alpha", sliceNum(node.opacity)];
  }
  return null;
};

export const androidVisibility = (node: SceneNodeMixin): Modifier | null => {
  // [when testing] node.visible can be undefined
  if (node.visible !== undefined && !node.visible) {
    return ["android:visibility", `invisible`];
  }
  return null;
};

export const androidRotation = (node: LayoutMixin): Modifier | null => {
  if (node.rotation !== undefined && Math.round(node.rotation) !== 0) {
    return ["android:rotation", `${sliceNum(-node.rotation)}`];
  }
  return null;
};