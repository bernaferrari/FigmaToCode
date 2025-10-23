import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, Check } from "lucide-react";

interface FormFieldProps {
  // Common props
  label: string;
  initialValue: string | number;
  onValueChange: (value: string | number) => void;
  placeholder?: string;
  helpText?: string;

  // Validation props
  type?: "text" | "number"| "json";
  min?: number;
  max?: number;
  suffix?: string;

  // For text input validation
  disallowedPattern?: RegExp;
  disallowedMessage?: string;

  // Optional preview (for text inputs)
  showPreview?: boolean;
  previewExamples?: string[];
  previewTransform?: (value: string, example: string) => React.ReactNode;
}

const FormField = React.memo(
  ({
    label,
    initialValue,
    onValueChange,
    placeholder,
    helpText,
    type = "text",
    min,
    max,
    suffix,
    disallowedPattern = /\s/,
    disallowedMessage = "Input cannot contain spaces",
    showPreview = false,
    previewExamples = ["flex"],
    previewTransform,
  }: FormFieldProps) => {
    // Use internal state to manage the input value
    const [inputValue, setInputValue] = useState(String(initialValue));
    const [isFocused, setIsFocused] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    // Update internal state when initialValue changes (from parent)
    useEffect(() => {
      setInputValue(String(initialValue));
      setHasChanges(false);
      setHasError(false);
      setErrorMessage("");
    }, [initialValue]);

    const validateInput = (value: string): boolean => {
      // Text validation
      if (type === "text") {
        if (disallowedPattern && disallowedPattern.test(value)) {
          setHasError(true);
          setErrorMessage(disallowedMessage);
          return false;
        }
        setHasError(false);
        setErrorMessage("");
        return true;
      }

      // Number validation
      if (type === "number") {
        // Check for non-numeric characters
        if (/[^0-9]/.test(value)) {
          setHasError(true);
          setErrorMessage("Only numbers are allowed");
          return false;
        }

        const numValue = parseInt(value, 10);

        if (isNaN(numValue)) {
          setHasError(true);
          setErrorMessage("Please enter a valid number");
          return false;
        }

        if (min !== undefined && numValue < min) {
          setHasError(true);
          setErrorMessage(`Minimum value is ${min}`);
          return false;
        }

        if (max !== undefined && numValue > max) {
          setHasError(true);
          setErrorMessage(`Maximum value is ${max}`);
          return false;
        }

        setHasError(false);
        setErrorMessage("");
        return true;
      }

      if (type === "json") {
        // Check if the string is empty skip validation
        if (!value.trim()) {
          setHasError(false);
          setErrorMessage("");
          return true;
        }

        try {
            // Try to parse the JSON
            const config = JSON.parse(value);

            // Validate that the config is an object
            if (typeof config !== 'object' || Array.isArray(config) || config === null) {
              throw new Error("Configuration must be a valid JSON object");
            }

            for (const item in config) {
              if (!Array.isArray(config[item])) {
                throw new Error(`Key ${item} is not valid and should be an array`);
              }
              config[item].forEach((val) => {
                if (typeof val !== 'string') {
                  throw new Error(`Values from Key ${item} should be string`);
                }
              });
            }

            // Additional validation could be added here based on expected structure
            // For example, checking specific properties or types

            // If valid, update the preference
            setHasError(false);
            setErrorMessage("");
            return true
          } catch (error) {
            // Handle parsing errors
            console.error("Invalid JSON configuration:", error);
            setHasError(true);
            setErrorMessage(`Invalid JSON configuration: ${error}`)
            // You could show an error message to the user here
            // Or reset to default/previous value
            return false
          }
      }

      return true;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      validateInput(newValue);
      setHasChanges(newValue !== String(initialValue));
    };

    const applyChanges = () => {
      if (hasError) return;

      if (type === "number") {
        const numValue = parseInt(inputValue, 10);
        if (!isNaN(numValue)) {
          onValueChange(numValue);
        }
      } else {
        onValueChange(inputValue);
      }

      setHasChanges(false);

      // Show success indicator briefly
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 1500);
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

    // Default preview transform for text prefixes
    const defaultPreviewTransform = (value: string, example: string) => (
      <div className="flex items-center gap-1.5">
        <div className="py-0.5 px-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-xs font-mono">
          <span className="text-green-500 dark:text-green-400">{value}</span>
          <span className="text-blue-500 dark:text-blue-400">{example}</span>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500">→</span>
        <div className="py-0.5 px-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-sm text-xs font-mono text-blue-500 dark:text-blue-400">
          {example}
        </div>
      </div>
    );

    const renderPreview = previewTransform || defaultPreviewTransform;

    return (
      <div className="mt-2 mb-1">
        <div className="flex items-center gap-1.5 mb-1.5">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>

          {helpText && (
            <div className="relative group">
              <HelpCircle className="w-3 h-3 text-gray-400" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 w-56 p-2 bg-white dark:bg-gray-800 shadow-lg rounded-sm border border-gray-200 dark:border-gray-700 text-xs hidden group-hover:block z-10">
                {helpText}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
              </div>
            </div>
          )}

          {showSuccess && (
            <span className="text-xs text-green-500 flex items-center gap-1 animate-fade-in-out">
              <Check className="w-3 h-3" /> Applied
            </span>
          )}
        </div>

        <div className="flex w-full items-start gap-2">
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
                className={`p-1.5 px-2.5 text-sm w-full transition-all focus:outline-hidden ${
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

        {showPreview && inputValue && !hasError && (
          <div className="flex flex-col w-full mt-2.5 rounded-md bg-gray-50 dark:bg-gray-800/50 p-2.5 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Preview{hasChanges ? " (not applied yet)" : ""}:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {previewExamples.map((example) => (
                <React.Fragment key={example}>
                  {renderPreview(inputValue, example)}
                </React.Fragment>
              ))}
            </div>

            {hasChanges && (
              <p className="text-xs text-amber-500 dark:text-amber-400 mt-2 italic">
                Press Enter or click Done to apply changes
              </p>
            )}
          </div>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";

export default FormField;
