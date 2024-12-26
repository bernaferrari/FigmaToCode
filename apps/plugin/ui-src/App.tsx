import { useEffect, useState } from "react";
import { PluginUI } from "plugin-ui";
import {
  FrameworkTypes,
  PluginSettings,
  ConversionMessage,
  Message,
  HTMLPreview,
  LinearGradientConversion,
  SolidColorConversion,
  SettingsChangedMessage,
  ErrorMessage,
  SettingsChangingMessage,
} from "types";

interface AppState {
  code: string;
  selectedFramework: FrameworkTypes;
  isLoading: boolean;
  htmlPreview: HTMLPreview;
  preferences: PluginSettings | null;
  colors: SolidColorConversion[];
  gradients: LinearGradientConversion[];
}

const emptyPreview = { size: { width: 0, height: 0 }, content: "" };
export default function App() {
  const [state, setState] = useState<AppState>({
    code: "",
    selectedFramework: "HTML",
    isLoading: false,
    htmlPreview: emptyPreview,
    preferences: null,
    colors: [],
    gradients: [],
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
            ...conversionMessage,
            selectedFramework: conversionMessage.preferences.framework,
          }));
          break;

        case "pluginSettingChanged":
          const settingsMessage = untypedMessage as any;
          setState((prevState) => ({
            ...prevState,
            preferences: settingsMessage.data,
            selectedFramework: settingsMessage.data.framework,
          }));
          break;

        case "empty":
          setState((prevState) => ({
            ...prevState,
            code: "// No layer is selected.",
            htmlPreview: emptyPreview,
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

    parent.postMessage(
      {
        pluginMessage: {
          type: "pluginSettingChanged",
          key: "framework",
          value: updatedFramework,
        },
      },
      "*",
    );
  };
  console.log("state.code", state.code.slice(0, 25));

  return (
    <div className={`${figmaColorBgValue === "#ffffff" ? "" : "dark"}`}>
      <PluginUI
        code={state.code}
        emptySelection={false}
        selectedFramework={state.selectedFramework}
        setSelectedFramework={handleFrameworkChange}
        htmlPreview={state.htmlPreview}
        preferences={state.preferences}
        onPreferenceChange={(key: string, value: boolean | string) => {
          parent.postMessage(
            {
              pluginMessage: {
                type: "pluginSettingChanged",
                key: key,
                value: value,
              },
            },
            "*",
          );
        }}
        colors={state.colors}
        gradients={state.gradients}
      />
    </div>
  );
}
