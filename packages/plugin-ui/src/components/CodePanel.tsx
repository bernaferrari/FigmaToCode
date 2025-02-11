import {
  Framework,
  LocalCodegenPreferenceOptions,
  PluginSettings,
  SelectPreferenceOptions,
} from "types";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark as theme } from "react-syntax-highlighter/dist/esm/styles/prism";
import copy from "copy-to-clipboard";
import SelectableToggle from "./SelectableToggle";

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

  // State for custom prefix for Tailwind classes.
  // It is initially set from settings (if available) or an empty string.
  const [customPrefix, setCustomPrefix] = useState(settings?.customTailwindPrefix || "");

  // Helper function to add the prefix before every class (or className) in the code.
  // It finds every occurrence of class="..." or className="..." and, for each class,
  // prepends the custom prefix.
  const applyPrefixToClasses = (codeString: string, prefix: string) => {
    return codeString.replace(/(class(?:Name)?)="([^"]*)"/g, (match, attr, classes) => {
      const prefixedClasses = classes
        .split(/\s+/)
        .filter(Boolean)
        .map((cls: string) => prefix + cls)
        .join(" ");
      return `${attr}="${prefixedClasses}"`;
    });
  };

  // If the selected framework is Tailwind and a prefix is provided then transform the code.
  const prefixedCode =
    selectedFramework === "Tailwind" && customPrefix.trim() !== ""
      ? applyPrefixToClasses(code, customPrefix)
      : code;

  // Clipboard and hover handlers.
  const handleButtonClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 250);
    copy(prefixedCode);
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
            className={`px-4 py-1 text-sm font-semibold border border-green-500 rounded-md shadow-sm hover:bg-green-500 dark:hover:bg-green-600 hover:text-white hover:border-transparent transition-all duration-300 ${
              isPressed
                ? "bg-green-500 dark:text-white hover:bg-green-500 ring-4 ring-green-300 ring-opacity-50 animate-pulse"
                : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600"
            }`}
            onClick={handleButtonClick}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            Copy
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
                    typeof settings?.[preference.propertyName] === "boolean"
                      ? (settings?.[preference.propertyName] as boolean)
                      : preference.isDefault
                  }
                  onSelect={(value) => {
                    onPreferenceChanged(preference.propertyName, value);
                  }}
                  buttonClass="bg-green-100 dark:bg-black dark:ring-green-800 ring-green-500"
                  checkClass="bg-green-400 dark:bg-black dark:bg-green-500 dark:border-green-500 ring-green-300 border-green-400"
                />
              ))}
          </div>

          {/* Input field for custom Tailwind prefix (only rendered when Tailwind is selected) */}
          {selectedFramework === "Tailwind" && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Prefix
              </label>
              <input
                type="text"
                value={customPrefix}
                onChange={(e) => {
                  const newVal = e.target.value;
                  setCustomPrefix(newVal);
                  onPreferenceChanged("tailwindPrefix", newVal);
                }}
                placeholder="e.g., tw-"
                className="mt-1 p-1 px-2 border border-gray-300 rounded bg-white dark:bg-black dark:border-gray-500 text-sm"
              />
            </div>
          )}

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
        className={`rounded-lg ring-green-600 transition-all duratio overflow-clip ${
          syntaxHovered ? "ring-2" : "ring-0"
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
              backgroundColor: syntaxHovered ? "#1E2B1A" : "#1B1B1B",
              transitionProperty: "all",
              transitionTimingFunction: "ease",
              transitionDuration: "0.2s",
            }}
          >
            {prefixedCode}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
};
export default CodePanel;
