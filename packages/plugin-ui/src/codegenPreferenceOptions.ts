import { LocalCodegenPreferenceOptions, SelectPreferenceOptions } from "types";

export const preferenceOptions: LocalCodegenPreferenceOptions[] = [
  {
    itemType: "individual_select",
    propertyName: "showLayerNames",
    label: "Layer names",
    description: "Include Figma layer names in classes.",
    isDefault: false,
    includedLanguages: ["HTML", "Tailwind"],
  },
  {
    itemType: "individual_select",
    propertyName: "optimizeLayout",
    label: "Optimize layout",
    description:
      "Attempt to auto-layout suitable element groups. This may increase code quality, but may not always work as expected.",
    isDefault: true,
    includedLanguages: ["HTML", "Tailwind", "Flutter", "SwiftUI"],
  },
  {
    itemType: "individual_select",
    propertyName: "roundTailwindValues",
    label: "Round values",
    description:
      "Round pixel values to nearest Tailwind sizes (within a 15% range).",
    isDefault: false,
    includedLanguages: ["Tailwind"],
  },
  {
    itemType: "individual_select",
    propertyName: "roundTailwindColors",
    label: "Round colors",
    description: "Round Figma color values to nearest Tailwind colors.",
    isDefault: false,
    includedLanguages: ["Tailwind"],
  },
  {
    itemType: "individual_select",
    propertyName: "useColorVariables",
    label: "Color Variables",
    description:
      "Export code using Figma variables as colors. Example: 'bg-background' instead of 'bg-white'.",
    isDefault: false,
    includedLanguages: ["HTML", "Tailwind"],
  },
  {
    itemType: "individual_select",
    propertyName: "embedImages",
    label: "Embed Images",
    description:
      "Convert Figma images to Base64 and embed them in the code. This may be slow. If there are too many images, it could freeze Figma.",
    isDefault: false,
    includedLanguages: ["HTML"],
  },
  {
    itemType: "individual_select",
    propertyName: "embedVectors",
    label: "Embed Vectors",
    description:
      "Convert Figma vectors to code. This is faster than embedding images, but still slower than not embedding.",
    isDefault: false,
    includedLanguages: ["HTML", "Tailwind"],
  },
];

export const selectPreferenceOptions: SelectPreferenceOptions[] = [
  {
    itemType: "select",
    propertyName: "htmlGenerationMode",
    label: "Mode",
    options: [
      { label: "HTML", value: "html" },
      { label: "React (JSX)", value: "jsx" },
      { label: "Svelte", value: "svelte" },
      { label: "styled-components", value: "styled-components" },
    ],
    includedLanguages: ["HTML"],
  },
  {
    itemType: "select",
    propertyName: "tailwindGenerationMode",
    label: "Mode",
    options: [
      { label: "HTML", value: "html" },
      { label: "React (JSX)", value: "jsx" },
    ],
    includedLanguages: ["Tailwind"],
  },
  {
    itemType: "select",
    propertyName: "flutterGenerationMode",
    label: "Mode",
    options: [
      { label: "Full App", value: "fullApp" },
      { label: "Widget", value: "stateless" },
      { label: "Snippet", value: "snippet" },
    ],
    includedLanguages: ["Flutter"],
  },
  {
    itemType: "select",
    propertyName: "swiftUIGenerationMode",
    label: "Mode",
    options: [
      { label: "Preview", value: "preview" },
      { label: "Struct", value: "struct" },
      { label: "Snippet", value: "snippet" },
    ],
    includedLanguages: ["SwiftUI"],
  },
];
