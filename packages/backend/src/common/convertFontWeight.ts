import { FontWeightNumber } from "types";

// Convert generic named weights to numbers, which is the way tailwind understands
export const convertFontWeight = (weight: string): FontWeightNumber | null => {
  // change extra-light to extralight
  weight = weight.replace(" ", "").replace("-", "").toLowerCase();
  switch (weight) {
    case "thin":
      return "100";
    case "extralight":
      return "200";
    case "light":
      return "300";
    case "regular":
      return "400";
    case "medium":
      return "500";
    case "semibold":
      return "600";
    case "bold":
      return "700";
    case "extrabold":
      return "800";
    case "heavy":
      return "800";
    case "black":
      return "900";
    default:
      return "400";
  }
};
