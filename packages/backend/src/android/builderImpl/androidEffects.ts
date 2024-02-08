import { resourceName } from "../androidDefaultBuilder";
import { Modifier } from "./androidParser";

export const androidShadow = (node: SceneNode): Modifier | null => {

  if (!("effects" in node) || node.effects.length === 0) {
    return null;
  }

  const dropShadow: Array<DropShadowEffect> = node.effects.filter(
    (d): d is DropShadowEffect => d.type === "DROP_SHADOW" && d.visible
  );

  if (dropShadow.length === 0) {
    return null;
  }

  const shadow = dropShadow[0];

  // TODO: selected offsetY because of elevation which is single value.
  return ["android:elevation", `${shadow.offset.y != 0 ? shadow.offset.y : shadow.offset.x}dp`];
};
