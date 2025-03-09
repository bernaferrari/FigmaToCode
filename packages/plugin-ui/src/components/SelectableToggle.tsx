import { useState } from "react";
import { Check, HelpCircle } from "lucide-react";
import { cn } from "../lib/utils";

type SelectableToggleProps = {
  onSelect: (isSelected: boolean) => void;
  isSelected?: boolean;
  title: string;
  description?: string;
  buttonClass: string;
  checkClass: string;
};

const SelectableToggle = ({
  onSelect,
  isSelected = false,
  title,
  description,
  buttonClass,
  checkClass,
}: SelectableToggleProps) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    onSelect(!isSelected);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={handleClick}
        className={cn(
          `h-8 px-2 flex items-center justify-center rounded-md transition-all duration-200 border`,
          isSelected
            ? `${buttonClass} text-white shadow-sm border-transparent`
            : "bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border-neutral-100 dark:border-neutral-700",
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className={`h-4 w-4 flex-shrink-0 flex items-center justify-center rounded-md transition-all duration-200 border ${
              isSelected
                ? `${checkClass}`
                : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600"
            }`}
          >
            {isSelected && (
              <Check size={10} className="text-white dark:text-black" />
            )}
          </div>

          <span className="text-sm font-medium whitespace-nowrap">{title}</span>

          {/* Help icon for description */}
          {description && (
            <div
              className="text-current opacity-70 hover:opacity-100 transition-opacity cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <HelpCircle size={12} />
            </div>
          )}
        </div>
      </button>

      {/* Enhanced tooltip */}
      {showTooltip && description && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 text-xs">
          <p className="text-neutral-700 dark:text-neutral-200">
            {description}
          </p>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white dark:border-t-neutral-800"></div>
        </div>
      )}
    </div>
  );
};

export default SelectableToggle;
