import {
  Framework,
  LocalCodegenPreferenceOptions,
  PluginSettings,
  SelectPreferenceOptions,
} from "types";
import { useMemo, useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { coldarkDark as theme } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CopyButton } from "./CopyButton";
import EmptyState from "./EmptyState";
import SettingsGroup from "./SettingsGroup";
import FrameworkTabs from "./FrameworkTabs";
import { TailwindSettings } from "./TailwindSettings";

interface CodePanelProps {
  code: string;
  selectedFramework: Framework;
  settings: PluginSettings | null;
  preferenceOptions: LocalCodegenPreferenceOptions[];
  selectPreferenceOptions: SelectPreferenceOptions[];
  onPreferenceChanged: (
    key: keyof PluginSettings,
    value: boolean | string | number,
  ) => void;
}

const CodePanel = (props: CodePanelProps) => {
  const [syntaxHovered, setSyntaxHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const initialLinesToShow = 25;
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
  const applyPrefixToClasses = (
    codeString: string,
    prefix: string | undefined,
  ) => {
    if (!prefix) {
      return codeString;
    }

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

  // Function to truncate code to a specific number of lines
  const truncateCode = (codeString: string, lines: number) => {
    const codeLines = codeString.split("\n");
    if (codeLines.length <= lines) {
      return codeString;
    }
    return codeLines.slice(0, lines).join("\n") + "\n...";
  };

  // If the selected framework is Tailwind and a prefix is provided then transform the code.
  const prefixedCode =
    selectedFramework === "Tailwind" &&
    settings?.customTailwindPrefix?.trim() !== ""
      ? applyPrefixToClasses(code, settings?.customTailwindPrefix)
      : code;

  // Memoize the line count calculation to improve performance for large code blocks
  const lineCount = useMemo(
    () => prefixedCode.split("\n").length,
    [prefixedCode],
  );

  // Determine if code should be truncated
  const shouldTruncate = !isExpanded && lineCount > initialLinesToShow;
  const displayedCode = shouldTruncate
    ? truncateCode(prefixedCode, initialLinesToShow)
    : prefixedCode;
  const showMoreButton = lineCount > initialLinesToShow;

  const handleButtonHover = () => setSyntaxHovered(true);
  const handleButtonLeave = () => setSyntaxHovered(false);

  // Memoized preference groups for better performance
  const {
    essentialPreferences,
    stylingPreferences,
    selectableSettingsFiltered,
  } = useMemo(() => {
    // Get preferences for the current framework
    const frameworkPreferences = preferenceOptions.filter((preference) =>
      preference.includedLanguages?.includes(selectedFramework),
    );

    // Define preference grouping based on property names
    const essentialPropertyNames = ["jsx"];
    const stylingPropertyNames = [
      "useTailwind4",
      "roundTailwindValues",
      "roundTailwindColors",
      "useColorVariables",
      "showLayerNames",
      "embedImages",
      "embedVectors",
    ];

    // Group preferences by category
    return {
      essentialPreferences: frameworkPreferences.filter((p) =>
        essentialPropertyNames.includes(p.propertyName),
      ),
      stylingPreferences: frameworkPreferences.filter((p) =>
        stylingPropertyNames.includes(p.propertyName),
      ),
      selectableSettingsFiltered: selectPreferenceOptions.filter((p) =>
        p.includedLanguages?.includes(selectedFramework),
      ),
    };
  }, [preferenceOptions, selectPreferenceOptions, selectedFramework]);

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
        <div className="flex flex-col p-3 bg-card border rounded-lg text-sm">
          {/* Essential settings always shown */}
          <SettingsGroup
            title=""
            settings={essentialPreferences}
            alwaysExpanded={true}
            selectedSettings={settings}
            onPreferenceChanged={onPreferenceChanged}
          />

          {/* Framework-specific options */}
          {selectableSettingsFiltered.length > 0 && (
            <div className="mt-1 mb-2 last:mb-0">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {selectedFramework} Options
              </p>
              {selectableSettingsFiltered.map((preference) => {
                // Regular toggle buttons for other options
                return (
                  <FrameworkTabs
                    options={preference.options}
                    selectedValue={
                      (settings?.[preference.propertyName] ??
                        preference.options.find((option) => option.isDefault)
                          ?.value ??
                        "") as string
                    }
                    onChange={(value) => {
                      onPreferenceChanged(preference.propertyName, value);
                    }}
                  />
                );
              })}
            </div>
          )}

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
                <TailwindSettings
                  settings={settings}
                  onPreferenceChanged={onPreferenceChanged}
                />
              )}
            </SettingsGroup>
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
          <>
            <SyntaxHighlighter
              language={
                selectedFramework === "HTML" &&
                settings?.htmlGenerationMode === "styled-components"
                  ? "jsx"
                  : selectedFramework === "Flutter"
                    ? "dart"
                    : selectedFramework === "SwiftUI"
                      ? "swift"
                      : selectedFramework === "Compose"
                        ? "kotlin"
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
              {displayedCode}
            </SyntaxHighlighter>
            {showMoreButton && (
              <div className="flex justify-center dark:bg-[#1B1B1B] border-t dark:border-gray-700">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs w-full flex justify-center py-3 text-blue-500 hover:text-blue-400 transition-colors"
                  aria-label="Show more code. This could be slow or freeze Figma for a few seconds."
                  title="Show more code. This could be slow or freeze Figma for a few seconds."
                >
                  {isExpanded ? "Show Less" : "Show More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CodePanel;
