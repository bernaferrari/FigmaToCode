import React, { useState, useRef, useEffect } from "react";
import { HelpCircle, Check } from "lucide-react";

interface CustomPrefixInputProps {
  initialValue: string;
  onValueChange: (value: string) => void;
}

const CustomPrefixInput = React.memo(({ initialValue, onValueChange }: CustomPrefixInputProps) => {
  // Use internal state to manage the input value
  const [inputValue, setInputValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update internal state when initialValue changes (from parent)
  useEffect(() => {
    setInputValue(initialValue);
    setHasChanges(false);
  }, [initialValue]);
  
  const examples = ["flex"];
  const hasInvalidChars = /\s/.test(inputValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHasChanges(newValue !== initialValue);
  };

  const applyChanges = () => {
    if (hasInvalidChars) return;
    
    onValueChange(inputValue);
    setHasChanges(false);
    
    // Show success indicator briefly
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      applyChanges();
      inputRef.current?.blur();
    }
  };

  return (
    <div className="mt-2 mb-1">
      <div className="flex items-center gap-1.5 mb-1.5">
        <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          Custom Class Prefix
        </label>

        <div className="relative group">
          <HelpCircle className="w-3 h-3 text-gray-400" />
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 w-56 p-2 bg-white dark:bg-gray-800 shadow-lg rounded border border-gray-200 dark:border-gray-700 text-xs hidden group-hover:block z-10">
            Add a prefix to all generated Tailwind classes.
            <br />
            Useful for avoiding conflicts with existing CSS.
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800"></div>
          </div>
        </div>
        
        {showSuccess && (
          <span className="text-xs text-green-500 flex items-center gap-1 animate-fade-in-out">
            <Check className="w-3 h-3" /> Applied
          </span>
        )}
      </div>

      <div className="flex w-full items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="e.g., tw-"
            className={`p-1.5 px-2.5 border rounded-md text-sm w-full transition-all focus:outline-none ${
              hasInvalidChars
                ? "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20"
                : isFocused
                  ? "border-green-400 dark:border-green-600 ring-1 ring-green-300 dark:ring-green-800 bg-white dark:bg-neutral-800"
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-800 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          />
          
          {hasInvalidChars && (
            <p className="text-xs text-red-500 mt-1 absolute">
              Prefix cannot contain spaces
            </p>
          )}
        </div>
        
        {hasChanges && (
          <button
            onClick={applyChanges}
            disabled={hasInvalidChars}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              hasInvalidChars
                ? "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed"
                : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
            }`}
          >
            Done
          </button>
        )}
      </div>

      {inputValue && !hasInvalidChars && (
        <div className="flex flex-col w-full mt-2.5 rounded-md bg-gray-50 dark:bg-gray-800/50 p-2.5 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Preview{hasChanges ? " (not applied yet)" : ""}:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {examples.map((example) => (
              <div key={example} className="flex items-center gap-1.5">
                <div className="py-0.5 px-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono">
                  <span className="text-green-500 dark:text-green-400">
                    {inputValue}
                  </span>
                  <span className="text-blue-500 dark:text-blue-400">
                    {example}
                  </span>
                </div>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  →
                </span>
                <div className="py-0.5 px-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs font-mono text-blue-500 dark:text-blue-400">
                  {example}
                </div>
              </div>
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
});

CustomPrefixInput.displayName = "CustomPrefixInput";

// Add a keyframe for fade-in-out animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes fadeInOut {
      0% { opacity: 0; }
      20% { opacity: 1; }
      80% { opacity: 1; }
      100% { opacity: 0; }
    }
    .animate-fade-in-out {
      animation: fadeInOut 1.5s ease-in-out;
    }
  `;
  document.head.appendChild(style);
}

export default CustomPrefixInput;
