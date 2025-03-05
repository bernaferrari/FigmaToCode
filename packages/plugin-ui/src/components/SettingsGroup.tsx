import { useState, ReactNode } from "react";
import { LocalCodegenPreferenceOptions, PluginSettings } from "types";
import SelectableToggle from "./SelectableToggle";
import { ChevronDownIcon, ChevronRightIcon } from "lucide-react";

interface SettingsGroupProps {
  title: string;
  settings?: LocalCodegenPreferenceOptions[];
  alwaysExpanded?: boolean;
  selectedSettings?: PluginSettings | null;
  onPreferenceChanged?: (
    key: keyof PluginSettings,
    value: boolean | string,
  ) => void;
  children?: ReactNode;
}

const SettingsGroup: React.FC<SettingsGroupProps> = ({
  title,
  settings = [],
  alwaysExpanded = false,
  selectedSettings,
  onPreferenceChanged,
  children,
}) => {
  const [expanded, setExpanded] = useState(alwaysExpanded);

  const hasContent = settings.length > 0 || children;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="w-full mb-2">
      {!alwaysExpanded && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors w-full text-left"
        >
          {expanded ? (
            <ChevronDownIcon className="w-3 h-3 flex-shrink-0" />
          ) : (
            <ChevronRightIcon className="w-3 h-3 flex-shrink-0" />
          )}
          <span className="truncate">{title}</span>
          {/* <div className="flex-grow border-t border-dashed border-gray-300 dark:border-gray-600 mx-2" /> */}
        </button>
      )}

      {(expanded || alwaysExpanded) && (
        <div className="flex flex-col gap-2 mt-2">
          {/* Render preference toggles if any */}
          {settings.length > 0 && (
            <div className="flex gap-2 items-center flex-wrap">
              {settings.map((preference) => (
                <SelectableToggle
                  key={preference.propertyName}
                  title={preference.label}
                  description={preference.description}
                  isSelected={
                    typeof selectedSettings?.[preference.propertyName] ===
                    "boolean"
                      ? (selectedSettings?.[preference.propertyName] as boolean)
                      : preference.isDefault
                  }
                  onSelect={(value) => {
                    onPreferenceChanged?.(preference.propertyName, value);
                  }}
                  buttonClass="bg-green-100 dark:bg-black dark:ring-green-800 ring-green-500"
                  checkClass="bg-green-400 dark:bg-black dark:bg-green-500 dark:border-green-500 ring-green-300 border-green-400"
                />
              ))}
            </div>
          )}
          {children}
        </div>
      )}
    </div>
  );
};

export default SettingsGroup;
