import {
  ConversionMessage,
  EmptyMessage,
  ErrorMessage,
  PluginSettings,
  SettingsChangedMessage,
} from "types";

export const postMessage = figma.ui.postMessage;

export const postEmptyMessage = () =>
  postMessage({ type: "empty" } as EmptyMessage);

export const postConversionComplete = (conversionData: ConversionMessage) =>
  postMessage(conversionData);

export const postError = (error: string) =>
  postMessage({ type: "error", error } as ErrorMessage);
