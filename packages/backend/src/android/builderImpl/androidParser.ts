import { indentString } from "../../common/indentString";
import { generateAndroidViewCode } from "../androidMain";

export type Modifier = [string, string | Modifier | Modifier[]];

export class androidElement {
  private readonly element: string;
  private readonly modifiers: Modifier[];

  constructor(element: string = "", modifiers: Modifier[] = []) {
    this.element = element;
    this.modifiers = modifiers;
  }

  addModifierMixed(
    property: string,
    value: string | Modifier | Modifier[]
  ): this {
    this.modifiers.push([property, value]);
    return this;
  }

  addModifier(modifier: Modifier | [string | null, string | null]): this {
    if (modifier && modifier[0] !== null && modifier[1] !== null) {
      this.modifiers.push([modifier[0], modifier[1]]);
    }
    return this;
  }

  private buildproperties(): Record<string, string | number> {
    let prop = {} as Record<string, string | number>;
    this.modifiers.map(([property, value]) => {
      if (!Array.isArray(value)) {
        prop[property]= value as string;
      }
    });
    return prop;
  }

  private buildChilds(): string {
    let childs = "";
    this.modifiers.map(([property, value]) => {
      if (Array.isArray(value)) {
        childs += value.join("¥n");
      }
      else if (property == "_CHILD") {
        childs += value;
      }
    });
    return childs;
  }

  toString(indentLevel = 0): string {
    if (this.modifiers.length === 0) {
      return generateAndroidViewCode(this.element,{},"");
    }
    else {
      return generateAndroidViewCode(this.element,this.buildproperties(), this.buildChilds());
    }
  }
}
