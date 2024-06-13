import { rgbTo6hex } from "../color";
import {
  swiftuiColor,
  swiftuiGradient,
} from "../../swiftui/builderImpl/swiftuiColor";
import {
  tailwindColors,
  tailwindGradient,
  tailwindNameFromColorSpec,
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
import { nodePaintFromFills, nodePaintFromStyles } from "../../tailwind/tailwindDefaultBuilder.js";

export type ExportSolidColor = {
  hex: string;
  colorName: string;
  exportValue: string;
  contrastWhite: number;
  contrastBlack: number;
};

export const retrieveGenericSolidUIColors = async (
  framework: FrameworkTypes
): Promise<ExportSolidColor[]> => {
  const selectionColors = figma.getSelectionColors();
  if (!selectionColors || (selectionColors.paints.length + selectionColors.styles.length) === 0) return [];
  const colorExports: Array<ExportSolidColor> = [];
  for (const paint of selectionColors.paints) {
    const fill = await convertSolidColor(paint, undefined, framework);
    if (fill) {
      colorExports.push(fill);
    }
  }
  for (const style of selectionColors.styles) {
    const paint = style.paints.find((p) => p.type === "SOLID")
    const fill = paint && await convertSolidColor(paint, style, framework);
    if (fill) {
      colorExports.push(fill);
    }
  }

  return colorExports.sort((a, b) => a.hex.localeCompare(b.hex));
};

const convertSolidColor = async (
  paint: Paint,
  style: PaintStyle | undefined,
  framework: FrameworkTypes
): Promise<ExportSolidColor | null> => {
  const black = { r: 0, g: 0, b: 0 };
  const white = { r: 1, g: 1, b: 1 };

  if (paint.type !== "SOLID") return null;

  const opacity = paint.opacity ?? 1.0;
  let exported = "";
  let colorName = "";
  let contrastBlack = calculateContrastRatio(paint.color, black);
  let contrastWhite = calculateContrastRatio(paint.color, white);

  if (framework === "Flutter") {
    exported = flutterColor(paint.color, opacity);
  } else if (framework === "HTML") {
    exported = htmlColor(paint.color, opacity);
  } else if (framework === "Tailwind") {
    const kind = "solid";

    const genPaint = await nodePaintFromStyles(style) ?? await nodePaintFromFills([paint])
    colorName = genPaint?.name ?? ""
  } else if (framework === "SwiftUI") {
    exported = swiftuiColor(paint.color, opacity);
  }

  return {
    hex: rgbTo6hex(paint.color).toUpperCase(),
    colorName,
    exportValue: exported,
    contrastBlack,
    contrastWhite,
  };
};

type ExportLinearGradient = { cssPreview: string; exportValue: string };

export const retrieveGenericLinearGradients = async (
  framework: FrameworkTypes
): Promise<ExportLinearGradient[]> => {
  const selectionColors = figma.getSelectionColors();
  const colorStr: Array<ExportLinearGradient> = [];

  await Promise.all((selectionColors?.paints ?? []).map(async (paint) => {
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
          const gradientDef = await nodePaintFromFills([paint])
          if (gradientDef?.gradient) {
            exported = tailwindGradient(gradientDef);
          }
          break;
        case "SwiftUI":
          exported = swiftuiGradient(paint);
          break;
      }
      colorStr.push({
        cssPreview: htmlGradientFromFills([paint]),
        exportValue: exported,
      });
    }
  }));

  return colorStr;
};
