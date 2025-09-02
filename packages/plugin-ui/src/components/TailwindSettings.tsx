import { PluginSettings } from "types";
import FormField from "./CustomPrefixInput"; // Still importing from the same file

interface TailwindSettingsProps {
  settings: PluginSettings | null;
  onPreferenceChanged: (
    key: keyof PluginSettings,
    value: boolean | string | number,
  ) => void;
}

export const TailwindSettings: React.FC<TailwindSettingsProps> = ({
  settings,
  onPreferenceChanged,
}) => {
  if (!settings) return null;

  const handleCustomPrefixChange = (newValue: string) => {
    onPreferenceChanged("customTailwindPrefix", newValue);
  };
  const handleBaseFontSizeChange = (value: number) => {
    onPreferenceChanged("baseFontSize", value);
  };
  const handleThresholdPercentChange = (value: number) => {
    onPreferenceChanged("thresholdPercent", value);
  };
  const handleBaseFontFamilyChange = (newValue: string) => {
    onPreferenceChanged("baseFontFamily", newValue);
  };

  return (
    <div className="mt-2">
      <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
        Advanced Settings
      </p>

      {/* Advanced Settings Section */}
      <div className="ml-2 pl-2 border-l border-neutral-200 dark:border-neutral-700">
        {/* Class name prefix setting */}
        <div className="mb-3">
          <FormField
            label="Custom Class Prefix"
            initialValue={settings.customTailwindPrefix || ""}
            onValueChange={(d) => {
              handleCustomPrefixChange(d as any);
            }}
            placeholder="e.g., tw-"
            helpText="Add a prefix to all generated Tailwind classes. Useful for avoiding conflicts with existing CSS. Default is empty."
            type="text"
            showPreview={true}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Add a custom prefix to all Tailwind classes (e.g. "tw-")
          </p>
        </div>

        {/* Base font size setting */}
        <div className="mb-3">
          <FormField
            label="Base Font Size"
            initialValue={settings.baseFontSize || 16}
            onValueChange={(d) => {
              handleBaseFontSizeChange(d as any);
            }}
            placeholder="16"
            suffix="px"
            type="number"
            min={1}
            max={100}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Use this value to calculate rem values (default: 16px)
          </p>
        </div>

        {/* Threshold percent setting */}
        <div className="mb-3">
          <FormField
            label="Rounding Threshold"
            initialValue={settings.thresholdPercent || 15}
            onValueChange={(d) => {
              handleThresholdPercentChange(d as any);
            }}
            placeholder="15"
            suffix="%"
            type="number"
            min={0}
            max={50}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Maximum allowed difference when rounding values (default: 15%)
          </p>
        </div>

        {/* Base font family setting */}
        <div className="mb-3">
          <FormField
            label="Base Font Family"
            initialValue={settings.baseFontFamily || ''}
            onValueChange={(d) => {
              handleBaseFontFamilyChange(String(d));
            }}
            placeholder="sans-serif"
            helpText="Font family that won't be included in generated classes."
            type="text"
          />
          <p className="text-xs text-neutral-500 mt-1">
            {`Elements with this font won't have "font-[<value>]" class added`}
          </p>
        </div>
      </div>
    </div>
  );
};
