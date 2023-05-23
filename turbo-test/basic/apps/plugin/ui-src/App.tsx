import { useEffect, useState } from "react";
import { FrameworkTypes, PluginUI } from "plugin-ui";

interface AppState {
  code: string;
  selectedFramework: FrameworkTypes | null;
  isLoading: boolean;
  htmlPreview: {
    size: { width: number; height: number };
    content: string;
  } | null;
}

export default function App() {
  const [state, setState] = useState<AppState>({
    code: "",
    selectedFramework: null,
    isLoading: false,
    htmlPreview: null,
  });

  useEffect(() => {
    window.onmessage = (event: MessageEvent) => {
      const message = event.data.pluginMessage;

      if (message.type === "code") {
        setState((prevState) => ({
          ...prevState,
          code: message.data,
          selectedFramework: message.framework,
          htmlPreview: message.htmlPreview,
        }));
      } else if (message.type === "tabChange") {
        setState((prevState) => ({
          ...prevState,
          selectedFramework: message.data,
        }));
      } else if (message.type === "empty") {
        setState((prevState) => ({
          ...prevState,
          code: "empty",
        }));
      } else if (message.type === "error") {
        setState((prevState) => ({
          ...prevState,
          code: `Error :(\n// ${message.data}`,
        }));
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

  const handleFrameworkChange = (newFramework: FrameworkTypes) => {
    setState((prevState) => ({
      ...prevState,
      selectedFramework: newFramework,
    }));
    parent.postMessage(
      { pluginMessage: { type: "tabChange", data: newFramework } },
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
    />
  );
}
