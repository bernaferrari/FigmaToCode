import { useEffect, useState } from "react";
<<<<<<< HEAD
import { PluginUI } from "plugin-ui";
import {
  FrameworkTypes,
  PluginSettings,
  ConversionMessage,
  Message,
  HTMLPreview,
  LinearGradientConversion,
  SolidColorConversion,
  ErrorMessage,
  SettingsChangedMessage,
} from "types";
import { postUISettingsChangingMessage } from "./messaging";
=======
import { FrameworkTypes, PluginSettings, PluginUI } from "plugin-ui";
import { Warnings } from "backend/src/common/commonConversionWarnings";
>>>>>>> 4f01feb (Added a method for recording and displaying warnings when doing conversions.)

interface AppState {
  code: string;
  selectedFramework: FrameworkTypes;
  isLoading: boolean;
<<<<<<< HEAD
  htmlPreview: HTMLPreview;
  settings: PluginSettings | null;
  colors: SolidColorConversion[];
  gradients: LinearGradientConversion[];
=======
  htmlPreview: {
    size: { width: number; height: number };
    content: string;
  } | null;
  preferences: PluginSettings | null;
  colors: {
    hex: string;
    colorName: string;
    exportValue: string;
    contrastWhite: number;
    contrastBlack: number;
  }[];
  gradients: { cssPreview: string; exportedValue: string }[];
  warnings: string[];
>>>>>>> 4f01feb (Added a method for recording and displaying warnings when doing conversions.)
}

const emptyPreview = { size: { width: 0, height: 0 }, content: "" };
export default function App() {
  const [state, setState] = useState<AppState>({
    code: "",
    selectedFramework: "HTML",
    isLoading: false,
    htmlPreview: emptyPreview,
    settings: null,
    colors: [],
    gradients: [],
    warnings: [],
  });

  const rootStyles = getComputedStyle(document.documentElement);
  const figmaColorBgValue = rootStyles
    .getPropertyValue("--figma-color-bg")
    .trim();

  useEffect(() => {
    window.onmessage = (event: MessageEvent) => {
      const untypedMessage = event.data.pluginMessage as Message;
      console.log("[ui] message received:", untypedMessage);

      switch (untypedMessage.type) {
        case "code":
          const conversionMessage = untypedMessage as ConversionMessage;
          setState((prevState) => ({
            ...prevState,
<<<<<<< HEAD
            ...conversionMessage,
            selectedFramework: conversionMessage.settings.framework,
=======
            code: message.data,
            htmlPreview: message.htmlPreview,
            colors: message.colors,
            gradients: message.gradients,
            preferences: message.preferences,
            selectedFramework: message.preferences.framework,
            warnings: message.warnings,
>>>>>>> 4f01feb (Added a method for recording and displaying warnings when doing conversions.)
          }));
          break;

        case "pluginSettingChanged":
          const settingsMessage = untypedMessage as SettingsChangedMessage;
          setState((prevState) => ({
            ...prevState,
            settings: settingsMessage.settings,
            selectedFramework: settingsMessage.settings.framework,
          }));
          break;

        case "empty":
          // const emptyMessage = untypedMessage as EmptyMessage;
          setState((prevState) => ({
            ...prevState,
<<<<<<< HEAD
            code: "// No layer is selected.",
            htmlPreview: emptyPreview,
=======
            code: "",
            warnings: [],
            htmlPreview: null,
>>>>>>> 4f01feb (Added a method for recording and displaying warnings when doing conversions.)
            colors: [],
            gradients: [],
          }));
          break;

        case "error":
          const errorMessage = untypedMessage as ErrorMessage;

          setState((prevState) => ({
            ...prevState,
            colors: [],
            gradients: [],
            code: `Error :(\n// ${errorMessage.error}`,
          }));
          break;
        default:
          break;
      }
    };

    return () => {
      window.onmessage = null;
    };
  }, []);

  useEffect(() => {
    if (state.selectedFramework === null) {
      const timer = setTimeout(
        () => setState((prevState) => ({ ...prevState, isLoading: true })),
        300,
      );
      return () => clearTimeout(timer);
    } else {
      setState((prevState) => ({ ...prevState, isLoading: false }));
    }
  }, [state.selectedFramework]);

  if (state.selectedFramework === null) {
    return state.isLoading ? (
      <div className="w-full h-96 justify-center text-center items-center dark:text-white text-lg">
        Loading Plugin...
      </div>
    ) : null;
  }

  const handleFrameworkChange = (updatedFramework: FrameworkTypes) => {
    setState((prevState) => ({
      ...prevState,
      // code: "// Loading...",
      selectedFramework: updatedFramework,
    }));
    postUISettingsChangingMessage("framework", updatedFramework, {
      targetOrigin: "*",
    });
  };
  console.log("state.code", state.code.slice(0, 25));

  return (
    <div className={`${figmaColorBgValue === "#ffffff" ? "" : "dark"}`}>
      <PluginUI
        code={state.code}
        warnings={state.warnings}
        emptySelection={false}
        selectedFramework={state.selectedFramework}
        setSelectedFramework={handleFrameworkChange}
        htmlPreview={state.htmlPreview}
        settings={state.settings}
        onPreferenceChanged={(key: string, value: boolean | string) =>
          postUISettingsChangingMessage(key, value, { targetOrigin: "*" })
        }
        colors={state.colors}
        gradients={state.gradients}
      />
    </div>
  );
}
