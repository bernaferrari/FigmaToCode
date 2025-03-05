import {
  Framework,
  LocalCodegenPreferenceOptions,
  PluginSettings,
  SelectPreferenceOptions,
} from "types";
import { useMemo, useState, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark as theme } from "react-syntax-highlighter/dist/esm/styles/prism";
import SelectableToggle from "./SelectableToggle";
import { CopyButton } from "./CopyButton";
import EmptyState from "./EmptyState";
import SettingsGroup from "./SettingsGroup";
import CustomPrefixInput from "./CustomPrefixInput";

interface CodePanelProps {
  code: string;
  selectedFramework: Framework;
  settings: PluginSettings | null;
  preferenceOptions: LocalCodegenPreferenceOptions[];
  selectPreferenceOptions: SelectPreferenceOptions[];
  onPreferenceChanged: (
    key: keyof PluginSettings,
    value: boolean | string,
  ) => void;
}

const CodePanel = (props: CodePanelProps) => {
  const [syntaxHovered, setSyntaxHovered] = useState(false);
  const {
    code,
    preferenceOptions,
    selectPreferenceOptions,
    selectedFramework,
    settings,
    onPreferenceChanged,
  } = props;
  const isCodeEmpty = code === "";

  // Helper function to add the prefix before every class (or className) in the code.
  // It finds every occurrence of class="..." or className="..." and, for each class,
  // prepends the custom prefix.
  const applyPrefixToClasses = (codeString: string, prefix: string) => {
    return codeString.replace(
      /(class(?:Name)?)="([^"]*)"/g,
      (match, attr, classes) => {
        const prefixedClasses = classes
          .split(/\s+/)
          .filter(Boolean)
          .map((cls: string) => prefix + cls)
          .join(" ");
        return `${attr}="${prefixedClasses}"`;
      },
    );
  };

  // If the selected framework is Tailwind and a prefix is provided then transform the code.
  const prefixedCode =
    selectedFramework === "Tailwind" &&
    settings?.customTailwindPrefix?.trim() !== ""
      ? applyPrefixToClasses(code, settings.customTailwindPrefix)
      : code;

  const handleButtonHover = () => setSyntaxHovered(true);
  const handleButtonLeave = () => setSyntaxHovered(false);

  // Memoized preference groups for better performance
  const {
    essentialPreferences,
    stylingPreferences,
    advancedPreferences,
    selectableSettingsFiltered,
  } = useMemo(() => {
    // Get preferences for the current framework
    const frameworkPreferences = preferenceOptions.filter((preference) =>
      preference.includedLanguages?.includes(selectedFramework),
    );

    // Define preference grouping based on property names
    const essentialPropertyNames = ["jsx", "optimizeLayout"];
    const stylingPropertyNames = [
      "roundTailwindValues",
      "roundTailwindColors",
      "customTailwindColors",
      "showLayerNames",
    ];
    const advancedPropertyNames = ["embedImages", "embedVectors"];

    // Group preferences by category
    return {
      essentialPreferences: frameworkPreferences.filter((p) =>
        essentialPropertyNames.includes(p.propertyName),
      ),
      stylingPreferences: frameworkPreferences.filter((p) =>
        stylingPropertyNames.includes(p.propertyName),
      ),
      advancedPreferences: frameworkPreferences.filter((p) =>
        advancedPropertyNames.includes(p.propertyName),
      ),
      selectableSettingsFiltered: selectPreferenceOptions.filter((p) =>
        p.includedLanguages?.includes(selectedFramework),
      ),
    };
  }, [preferenceOptions, selectPreferenceOptions, selectedFramework]);

  // Handle custom prefix change
  const handleCustomPrefixChange = (newValue: string) => {
    onPreferenceChanged("customTailwindPrefix", newValue);
  };

  return (
    <div className="w-full flex flex-col gap-2 mt-2">
      <div className="flex items-center justify-between w-full">
        <p className="text-lg font-medium text-center dark:text-white rounded-lg">
          Code
        </p>
        {!isCodeEmpty && (
          <CopyButton
            value={prefixedCode}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          />
        )}
      </div>

      {!isCodeEmpty && (
        <div className="flex flex-col p-3 dark:bg-black dark:bg-opacity-25 bg-neutral-100 ring-1 ring-neutral-200 dark:ring-neutral-700 rounded-lg text-sm">
          {/* Essential settings always shown */}
          <SettingsGroup
            title=""
            settings={essentialPreferences}
            alwaysExpanded={true}
            selectedSettings={settings}
            onPreferenceChanged={onPreferenceChanged}
          />

          {/* Styling preferences with custom prefix for Tailwind */}
          {(stylingPreferences.length > 0 ||
            selectedFramework === "Tailwind") && (
            <SettingsGroup
              title="Styling Options"
              settings={stylingPreferences}
              selectedSettings={settings}
              onPreferenceChanged={onPreferenceChanged}
            >
              {selectedFramework === "Tailwind" && (
                <CustomPrefixInput
                  initialValue={settings?.customTailwindPrefix || ""}
                  onValueChange={handleCustomPrefixChange}
                />
              )}
            </SettingsGroup>
          )}

          {/* Advanced settings */}
          {advancedPreferences.length > 0 && (
            <SettingsGroup
              title="Advanced Options"
              settings={advancedPreferences}
              selectedSettings={settings}
              onPreferenceChanged={onPreferenceChanged}
            />
          )}

          {/* Framework-specific options */}
          {selectableSettingsFiltered.length > 0 && (
            <div className="mt-1">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                {selectedFramework} Options
              </p>
              <div className="flex gap-2 items-center flex-wrap">
                {selectableSettingsFiltered.map((preference) => (
                  <div
                    key={preference.propertyName}
                    className="flex gap-2 items-center flex-wrap"
                  >
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
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div
        className={`rounded-lg ring-green-600 transition-all duration-200 overflow-clip ${
          syntaxHovered ? "ring-2" : "ring-0"
        }`}
      >
        {isCodeEmpty ? (
          <EmptyState />
        ) : (
          <SyntaxHighlighter
            language={
              selectedFramework === "Flutter"
                ? "dart"
                : selectedFramework === "SwiftUI"
                  ? "swift"
                  : "html"
            }
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
