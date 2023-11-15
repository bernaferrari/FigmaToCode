import { rgbTo6hex } from "../color";
import {
  swiftuiColor,
  swiftuiGradient,
} from "../../swiftui/builderImpl/swiftuiColor";
import {
  tailwindColors,
  tailwindGradient,
  tailwindNearestColor,
  tailwindSolidColor,
} from "../../tailwind/builderImpl/tailwindColor";
import {
  flutterColor,
  flutterGradient,
} from "../../flutter/builderImpl/flutterColor";
import {
  htmlColor,
  htmlGradientFromFills,
} from "../../html/builderImpl/htmlColor";
import { calculateContrastRatio } from "./commonUI";
import { FrameworkTypes } from "../../code";

export type ExportSolidColor = {
  hex: string;
  colorName: string;
  exportValue: string;
  contrastWhite: number;
  contrastBlack: number;
};

export const retrieveGenericSolidUIColors = (
  framework: FrameworkTypes
): Array<ExportSolidColor> => {
  const selectionColors = figma.getSelectionColors();
  if (!selectionColors || selectionColors.paints.length === 0) return [];

  const colorStr: Array<ExportSolidColor> = [];
  selectionColors.paints.forEach((paint) => {
    const fill = convertSolidColor(paint, framework);
    if (fill) {
      colorStr.push(fill);
    }
  });

  return colorStr.sort((a, b) => a.hex.localeCompare(b.hex));
};

const convertSolidColor = (
  fill: Paint,
  framework: FrameworkTypes
): ExportSolidColor | null => {
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 1, g: 1, b: 1 };

  if (fill.type !== "SOLID") return null;

  const opacity = fill.opacity ?? 1.0;
  let exported = "";
  let colorName = "";
  let contrastBlack = calculateContrastRatio(fill.color, black);
  let contrastWhite = calculateContrastRatio(fill.color, white);

  if (framework === "Flutter") {
    exported = flutterColor(fill.color, opacity);
  } else if (framework === "HTML") {
    exported = htmlColor(fill.color, opacity);
  } else if (framework === "Tailwind") {
    const kind = "solid";
    const hex = rgbTo6hex(fill.color);
    const hexNearestColor = tailwindNearestColor(hex);
    exported = tailwindSolidColor(fill.color, fill.opacity, kind);
    colorName = tailwindColors[hexNearestColor];
  } else /*if (framework === "SwiftUI")*/ {
    exported = swiftuiColor(fill.color, opacity);
  }

  return {
    hex: rgbTo6hex(fill.color).toUpperCase(),
    colorName,
    exportValue: exported,
    contrastBlack,
    contrastWhite,
  };
};

type ExportLinearGradient = { cssPreview: string; exportValue: string };

export const retrieveGenericLinearGradients = (
  framework: FrameworkTypes
): Array<ExportLinearGradient> => {
  const selectionColors = figma.getSelectionColors();
  const colorStr: Array<ExportLinearGradient> = [];

  selectionColors?.paints.forEach((paint) => {
    if (paint.type === "GRADIENT_LINEAR") {
      let exported = "";
      switch (framework) {
        case "Flutter":
          exported = flutterGradient(paint);
          break;
        case "HTML":
          exported = htmlGradientFromFills([paint]);
          break;
        case "Tailwind":
          exported = tailwindGradient(paint);
          break;
        case "SwiftUI":
        default:
          exported = swiftuiGradient(paint);
          break;
      }
      colorStr.push({
        cssPreview: htmlGradientFromFills([paint]),
        exportValue: exported,
      });
    }
  });

  return colorStr;
};
