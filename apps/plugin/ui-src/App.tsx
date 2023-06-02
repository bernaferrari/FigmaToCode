import { useEffect, useState } from "react";
import { FrameworkTypes, PluginSettings, PluginUI } from "plugin-ui";

interface AppState {
  code: string;
  selectedFramework: FrameworkTypes | null;
  isLoading: boolean;
  htmlPreview: {
    size: { width: number; height: number };
    content: string;
  } | null;
  preferences: PluginSettings | null;
}

export default function App() {
  const [state, setState] = useState<AppState>({
    code: "",
    selectedFramework: null,
    isLoading: false,
    htmlPreview: null,
    preferences: null,
  });

  useEffect(() => {
    window.onmessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;
      console.log("[ui] message received:", message);
      switch (message.type) {
        case "code":
          setState((prevState) => ({
            ...prevState,
            code: message.data,
            htmlPreview: message.htmlPreview,
          }));
          break;
        case "pluginSettingChanged":
          setState((prevState) => ({
            ...prevState,
            preferences: message.data,
            selectedFramework: message.data.framework,
          }));
          break;
        case "empty":
          setState((prevState) => ({
            ...prevState,
            code: "// No layer is selected.",
            htmlPreview: null,
          }));
          break;
        case "error":
          setState((prevState) => ({
            ...prevState,
            code: `Error :(\n// ${message.data}`,
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
        300
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
      "*"
    );
  };

  return (
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
          "*"
        );
      }}
    />
  );
}
