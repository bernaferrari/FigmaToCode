import { useEffect, useState } from "react";
import { PluginUI } from "plugin-ui";
import {
  Framework,
  PluginSettings,
  ConversionMessage,
  Message,
  HTMLPreview,
  LinearGradientConversion,
  SolidColorConversion,
  ErrorMessage,
  SettingsChangedMessage,
  Warning,
  DownloadProjectFormat,
  ProjectDownloadErrorMessage,
  ProjectZipMessage,
} from "types";
import { postUISettingsChangingMessage } from "./messaging";
import copy from "copy-to-clipboard";

interface AppState {
  code: string;
  selectedFramework: Framework;
  isLoading: boolean;
  htmlPreview: HTMLPreview;
  settings: PluginSettings | null;
  colors: SolidColorConversion[];
  gradients: LinearGradientConversion[];
  warnings: Warning[];
  isDownloadingProject: boolean;
  projectDownloadError: string | null;
}

const emptyPreview = { size: { width: 0, height: 0 }, content: "" };
const isDarkFigmaBackground = (background: string) => {
  const value = background.trim().toLowerCase();

  return Boolean(
    value &&
    value !== "#fff" &&
    value !== "#ffffff" &&
    value !== "rgb(255, 255, 255)" &&
    value !== "rgba(255, 255, 255, 1)",
  );
};

export default function App() {
  const [state, setState] = useState<AppState>({
    code: "",
    selectedFramework: "HTML",
    isLoading: true,
    htmlPreview: emptyPreview,
    settings: null,
    colors: [],
    gradients: [],
    warnings: [],
    isDownloadingProject: false,
    projectDownloadError: null,
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
        case "conversionStart":
          setState((prevState) => ({
            ...prevState,
            code: "",
            isLoading: true,
          }));
          break;

        case "code":
          const conversionMessage = untypedMessage as ConversionMessage;
          setState((prevState) => ({
            ...prevState,
            ...conversionMessage,
            selectedFramework: conversionMessage.settings.framework,
            isLoading: false,
          }));
          break;

        case "pluginSettingsChanged":
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
            code: "",
            htmlPreview: emptyPreview,
            warnings: [],
            colors: [],
            gradients: [],
            isLoading: false,
          }));
          break;

        case "error":
          const errorMessage = untypedMessage as ErrorMessage;

          setState((prevState) => ({
            ...prevState,
            colors: [],
            gradients: [],
            code: `Error :(\n// ${errorMessage.error}`,
            isLoading: false,
          }));
          break;

        case "selection-json":
          const json = event.data.pluginMessage.data;
          copy(JSON.stringify(json, null, 2));
          break;

        case "project-zip": {
          const zipMessage = untypedMessage as ProjectZipMessage;
          const blob = new Blob([zipMessage.zip], {
            type: "application/zip",
          });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = zipMessage.fileName;
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
          setState((prevState) => ({
            ...prevState,
            isDownloadingProject: false,
            projectDownloadError: null,
          }));
          break;
        }

        case "project-download-error": {
          const downloadError = untypedMessage as ProjectDownloadErrorMessage;
          setState((prevState) => ({
            ...prevState,
            isDownloadingProject: false,
            projectDownloadError: downloadError.error,
          }));
          break;
        }

        default:
          break;
      }
    };

    return () => {
      window.onmessage = null;
    };
  }, []);

  useEffect(() => {
    parent.postMessage({ pluginMessage: { type: "ui-ready" } }, "*");
  }, []);

  const handleFrameworkChange = (updatedFramework: Framework) => {
    if (updatedFramework !== state.selectedFramework) {
      setState((prevState) => ({
        ...prevState,
        // code: "// Loading...",
        selectedFramework: updatedFramework,
      }));
      postUISettingsChangingMessage("framework", updatedFramework, {
        targetOrigin: "*",
      });
    }
  };
  const handlePreferencesChange = (
    key: keyof PluginSettings,
    value: PluginSettings[keyof PluginSettings],
  ) => {
    if (state.settings && state.settings[key] === value) {
      // do nothing
    } else {
      postUISettingsChangingMessage(key, value, { targetOrigin: "*" });
    }
  };
  const handleDownloadProject = (format: DownloadProjectFormat) => {
    if (state.isDownloadingProject) {
      return;
    }

    setState((prevState) => ({
      ...prevState,
      isDownloadingProject: true,
      projectDownloadError: null,
    }));
    parent.postMessage(
      { pluginMessage: { type: "download-project", format } },
      "*",
    );
  };

  const darkMode = isDarkFigmaBackground(figmaColorBgValue);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);

    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [darkMode]);

  return (
    <div
      className={`${darkMode ? "dark" : ""} h-full bg-background text-foreground`}
    >
      <PluginUI
        isLoading={state.isLoading}
        code={state.code}
        warnings={state.warnings}
        selectedFramework={state.selectedFramework}
        setSelectedFramework={handleFrameworkChange}
        onPreferenceChanged={handlePreferencesChange}
        htmlPreview={state.htmlPreview}
        settings={state.settings}
        colors={state.colors}
        gradients={state.gradients}
        onDownloadProject={handleDownloadProject}
        isDownloadingProject={state.isDownloadingProject}
        projectDownloadError={state.projectDownloadError}
      />
    </div>
  );
}
