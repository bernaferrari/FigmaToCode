import {
  Framework,
  LocalCodegenPreferenceOptions,
  PluginSettings,
  SelectPreferenceOptions,
} from "types";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark as theme } from "react-syntax-highlighter/dist/esm/styles/prism";
import SelectableToggle from "./SelectableToggle";
import { IconWand } from "@tabler/icons-react";

interface CodePanelProps {
  code: string;
  selectedFramework: Framework;
  settings: PluginSettings | null;
  preferenceOptions: LocalCodegenPreferenceOptions[];
  selectPreferenceOptions: SelectPreferenceOptions[];
  onPreferenceChanged: (key: string, value: boolean | string) => void;
}

const CodePanel = (props: CodePanelProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const [syntaxHovered, setSyntaxHovered] = useState(false);
  const {
    code,
    preferenceOptions,
    selectPreferenceOptions,
    selectedFramework,
    settings,
    onPreferenceChanged,
  } = props;
  const isEmpty = code === "";

  // Add your clipboard function here or any other actions
  const handleButtonClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 250);

  };

  const handleButtonHover = () => setSyntaxHovered(true);
  const handleButtonLeave = () => setSyntaxHovered(false);

  const selectableSettingsFiltered = selectPreferenceOptions.filter(
    (preference) =>
      preference.includedLanguages?.includes(props.selectedFramework),
  );

  return (
    <div className="w-full flex flex-col gap-2 mt-2">
      <div className="flex items-center justify-between w-full">
        <p className="text-lg font-medium text-center dark:text-white rounded-lg">
          Code
        </p>
        {isEmpty === false && (
          <button
            className={`flex items-center justify-center gap-2 px-4 py-1 text-sm font-semibold border border-blue-500 rounded-md shadow-sm hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white hover:border-transparent transition-all duration-300 ${isPressed
              ? "bg-blue-500 dark:text-white hover:bg-blue-500 ring-4 ring-blue-300 ring-opacity-50 animate-pulse"
              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600 dark:hover:border-blue-600"
              }`}
            onClick={handleButtonClick}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <IconWand className="" size={16} />
            Open with Polymet
          </button>
        )}
      </div>

      {isEmpty === false && (
        <div className="flex gap-2 justify-center flex-col p-2 dark:bg-black dark:bg-opacity-25 bg-neutral-100 ring-1 ring-neutral-200 dark:ring-neutral-700 rounded-lg text-sm">
          <div className="flex gap-2 items-center flex-wrap">
            {preferenceOptions
              .filter((preference) =>
                preference.includedLanguages?.includes(selectedFramework),
              )
              .map((preference) => (
                <SelectableToggle
                  key={preference.propertyName}
                  title={preference.label}
                  description={preference.description}
                  isSelected={
                    settings?.[preference.propertyName] ?? preference.isDefault
                  }
                  onSelect={(value) => {
                    onPreferenceChanged(preference.propertyName, value);
                  }}
                  buttonClass="bg-blue-100 dark:bg-black dark:ring-blue-800 ring-blue-500"
                  checkClass="bg-blue-400 dark:bg-black dark:bg-blue-500 dark:border-blue-500 ring-blue-300 border-blue-400"
                />
              ))}
          </div>
          {selectableSettingsFiltered.length > 0 && (
            <>
              <div className="w-full h-px bg-neutral-200 dark:bg-neutral-700" />

              <div className="flex gap-2 items-center flex-wrap">
                {selectableSettingsFiltered.map((preference) => (
                  <>
                    {preference.options.map((option) => (
                      <SelectableToggle
                        key={option.label}
                        title={option.label}
                        isSelected={
                          option.value ===
                          (settings?.[preference.propertyName] ??
                            option.isDefault)
                        }
                        onSelect={() => {
                          onPreferenceChanged(
                            preference.propertyName,
                            option.value,
                          );
                        }}
                        buttonClass="bg-blue-100 dark:bg-black dark:ring-blue-800"
                        checkClass="bg-blue-400 dark:bg-black dark:bg-blue-500 dark:border-blue-500 ring-blue-300 border-blue-400"
                      />
                    ))}
                  </>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div
        className={`rounded-lg ring-blue-600 transition-all duratio overflow-clip ${syntaxHovered ? "ring-2" : "ring-0"
          }`}
      >
        {isEmpty ? (
          <h3>No layer is selected. Please select a layer.</h3>
        ) : (
          <SyntaxHighlighter
            language="dart"
            style={theme}
            customStyle={{
              fontSize: 12,
              borderRadius: 8,
              marginTop: 0,
              marginBottom: 0,
              backgroundColor: syntaxHovered ? "#1A1E2B" : "#1B1B1B",
              transitionProperty: "all",
              transitionTimingFunction: "ease",
              transitionDuration: "0.2s",
            }}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
};
export default CodePanel;
