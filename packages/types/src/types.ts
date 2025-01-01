// Settings
export type Framework = "Flutter" | "SwiftUI" | "HTML" | "Tailwind";

export interface PluginSettings {
  framework: Framework;
  jsx: boolean;
  inlineStyle: boolean;
  optimizeLayout: boolean;
  showLayerNames: boolean;
  responsiveRoot: boolean;
  flutterGenerationMode: string;
  swiftUIGenerationMode: string;
  roundTailwindValues: boolean;
  roundTailwindColors: boolean;
  customTailwindColors: boolean;
}

// Messaging
export interface ConversionData {
  code: string;
  settings: PluginSettings;
  htmlPreview: HTMLPreview;
  colors: SolidColorConversion[];
  gradients: LinearGradientConversion[];
  warnings: Warning[];
}

export type Warning = string;
export type Warnings = Set<Warning>;

export interface Message {
  type: string;
}
export interface UIMessage {
  pluginMessage: Message;
}
export type EmptyMessage = Message & { type: "empty" };
export type ConversionMessage = Message & {
  type: "code";
} & ConversionData;
export type SettingWillChangeMessage<T> = Message & {
  type: "pluginSettingWillChange";
  key: string;
  value: T;
};
export type SettingsChangedMessage = Message & {
  type: "pluginSettingsChanged";
  settings: PluginSettings;
};
export type ErrorMessage = Message & {
  type: "error";
  error: string;
};

// Nodes
export type ParentNode = BaseNode & ChildrenMixin;

// Styles & Conversions

export type LayoutMode =
  | ""
  | "Absolute"
  | "TopStart"
  | "TopCenter"
  | "TopEnd"
  | "CenterStart"
  | "Center"
  | "CenterEnd"
  | "BottomStart"
  | "BottomCenter"
  | "BottomEnd";

export interface BoundingRect {
  x: number;
  y: number;
}

interface AllSides {
  all: number;
}
interface Sides {
  left: number;
  right: number;
  top: number;
  bottom: number;
}
interface Corners {
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}
interface HorizontalAndVertical {
  horizontal: number;
  vertical: number;
}

export type PaddingType = Sides | AllSides | HorizontalAndVertical;
export type BorderSide = AllSides | Sides;
export type CornerRadius = AllSides | Corners;

export type SizeValue = number | "fill" | null;
export interface Size {
  readonly width: SizeValue;
  readonly height: SizeValue;
}

export type StyledTextSegmentSubset = Omit<
  StyledTextSegment,
  "listSpacing" | "paragraphIndent" | "paragraphSpacing" | "textStyleOverrides"
>;

export type FontWeightNumber =
  | "100"
  | "200"
  | "300"
  | "400"
  | "500"
  | "600"
  | "700"
  | "800"
  | "900";

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export type ColorSpec = {
  source: string;
  rgb: RGB;
};

export type SolidColorConversion = {
  hex: string;
  colorName: string;
  exportValue: string;
  contrastWhite: number;
  contrastBlack: number;
  meta?: string;
};
export type LinearGradientConversion = {
  cssPreview: string;
  exportValue: string;
};

// Framework Specific

export interface HTMLPreview {
  size: { width: number; height: number };
  content: string;
}

export interface TailwindTextConversion {
  name: string;
  attr: string;
  full: string;
  style: string;
  contrastBlack: number;
}

export type TailwindColorType = "text" | "bg" | "border" | "solid";

export type SwiftUIModifier = [
  string,
  string | SwiftUIModifier | SwiftUIModifier[],
];

// UI

export interface PreferenceOptions {
  itemType: string;
  label: string;
  propertyName: string;
  includedLanguages?: Framework[];
}
export interface SelectPreferenceOptions extends PreferenceOptions {
  itemType: "select";
  propertyName: Exclude<keyof PluginSettings, "framework">;
  options: { label: string; value: string; isDefault?: boolean }[];
}

export interface LocalCodegenPreferenceOptions extends PreferenceOptions {
  itemType: "individual_select";
  propertyName: Exclude<
    keyof PluginSettings,
    "framework" | "flutterGenerationMode" | "swiftUIGenerationMode"
  >;
  description: string;
  value?: boolean;
  isDefault?: boolean;
}
