import { ChevronDown, ChevronRight, HelpCircle, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { PluginSettings } from "types";
import FormField from "./CustomPrefixInput"; // Still importing from the same file

// Added InputGroup component
interface InputGroupProps {
  label: string;
  children: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, children }) => (
  <div className="mb-2">
    <div className="flex items-center gap-1.5 mb-1.5">
      <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* This is where the success message will appear, rendered by the child component */}
    </div>
    {children}
  </div>
);

// Enhanced InputWithText component
interface InputWithTextProps {
  value: string | number;
  onChange: (value: number) => void;
  placeholder?: string;
  suffix?: string;
  min?: number;
  max?: number;
}

const InputWithText: React.FC<InputWithTextProps> = ({
  value,
  onChange,
  placeholder,
  suffix,
  min = 1,
  max = 100,
}) => {
  const [inputValue, setInputValue] = useState(String(value));
  const [isFocused, setIsFocused] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Update internal state when value changes (from parent)
  useEffect(() => {
    setInputValue(String(value));
    setHasChanges(false);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Check for non-numeric characters
    if (/[^0-9]/.test(newValue)) {
      setHasError(true);
      setErrorMessage("Only numbers are allowed");
      setHasChanges(newValue !== String(value));
      return;
    }

    const numValue = parseInt(newValue, 10);

    if (isNaN(numValue)) {
      setHasError(true);
      setErrorMessage("Please enter a valid number");
    } else if (numValue < min) {
      setHasError(true);
      setErrorMessage(`Minimum value is ${min}`);
    } else if (numValue > max) {
      setHasError(true);
      setErrorMessage(`Maximum value is ${max}`);
    } else {
      setHasError(false);
      setErrorMessage("");
    }

    setHasChanges(newValue !== String(value));
  };

  const applyChanges = () => {
    if (hasError) return;

    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      onChange(numValue);

      // Show success indicator briefly
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
      setHasChanges(false);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyChanges();
      inputRef.current?.blur();
    }
  };

  return (
    <div className="flex flex-col w-full">
      {showSuccess && (
        <span className="text-xs text-green-500 flex items-center gap-1 animate-fade-in-out ml-auto mb-1">
          <Check className="w-3 h-3" /> Applied
        </span>
      )}

      <div className="flex items-start gap-2">
        <div className="flex-1 flex flex-col">
          <div className="flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={`p-1.5 px-2.5 w-full transition-all focus:outline-none ${
                suffix ? "rounded-l-md" : "rounded-md"
              } ${
                hasError
                  ? "border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                  : isFocused
                    ? "border border-green-400 dark:border-green-600 ring-1 ring-green-300 dark:ring-green-800 bg-white dark:bg-neutral-800"
                    : "border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 hover:border-gray-400 dark:hover:border-gray-500"
              }`}
            />
            {suffix && (
              <span
                className="py-1.5 px-2.5 text-sm border border-l-0 border-gray-300 dark:border-gray-600 
                bg-gray-100 dark:bg-gray-700 rounded-r-md text-gray-700 dark:text-gray-300"
              >
                {suffix}
              </span>
            )}
          </div>

          {hasError && (
            <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
          )}
        </div>

        {hasChanges && (
          <button
            onClick={applyChanges}
            disabled={hasError}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              hasError
                ? "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
            }`}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

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
      </div>
    </div>
  );
};
