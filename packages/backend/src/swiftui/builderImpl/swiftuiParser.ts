import { indentString } from "../../common/indentString";
import { SwiftUIModifier } from "types";

export class SwiftUIElement {
  private readonly element: string;
  private readonly modifiers: SwiftUIModifier[];

  constructor(element: string = "", modifiers: SwiftUIModifier[] = []) {
    this.element = element;
    this.modifiers = modifiers;
  }

  addModifierMixed(
    property: string,
    value: string | SwiftUIModifier | SwiftUIModifier[],
  ): this {
    this.modifiers.push([property, value]);
    return this;
  }

  addModifier(
    modifier: SwiftUIModifier | [string | null, string | null],
  ): this {
    if (modifier && modifier[0] !== null && modifier[1] !== null) {
      this.modifiers.push([modifier[0], modifier[1]]);
    }
    return this;
  }

  addChildElement(
    element: string,
    ...modifiers: SwiftUIModifier[]
  ): SwiftUIElement {
    const childModifiers = modifiers.length === 1 ? modifiers[0] : modifiers;
    return this.addModifierMixed(element, childModifiers as SwiftUIModifier);
  }

  private buildModifierLines(indentLevel: number): string {
    const indent = " ".repeat(indentLevel);
    return this.modifiers
      .map(([property, value]) =>
        Array.isArray(value)
          ? `${indent}.${property}(${new SwiftUIElement(
              property,
              value as SwiftUIModifier[],
            )
              .toString()
              .trim()})`
          : value.length > 60
            ? `${indent}.${property}(\n${indentString(
                value,
                indentLevel + 2,
              )}\n${indent})`
            : `${indent}.${property}(${value})`,
      )
      .join("\n");
  }

  toString(indentLevel = 0): string {
    if (this.modifiers.length === 0) {
      return this.element;
    }

    const modifierLines = this.buildModifierLines(indentLevel + 2);
    return indentString(`${this.element}\n${modifierLines}`, 0);
  }
}
