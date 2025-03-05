import { useState } from "react";
import { Check, HelpCircle } from "lucide-react";

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
        className={`h-8 px-3 truncate flex items-center justify-center rounded-md transition-all duration-200
        border ${
          isSelected
            ? `${buttonClass} border-transparent`
            : "bg-white dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900"
        }`}
      >
        <div className="flex items-center gap-2">
          {/* Checkbox circle with check mark for selected state */}
          <div
            className={`h-4 w-4 flex-shrink-0 flex items-center justify-center rounded-full border transition-colors ${
              isSelected
                ? `${checkClass} border-transparent`
                : "bg-white dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600"
            }`}
          >
            {isSelected && (
              <Check size={10} className="text-white dark:text-black" />
            )}
          </div>

          <span className="text-sm font-medium">{title}</span>

          {/* Help icon for description */}
          {description && (
            <div
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <HelpCircle size={12} />
            </div>
          )}
        </div>
      </button>

      {/* Tooltip */}
      {showTooltip && description && (
        <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 px-3 py-2 bg-white dark:bg-neutral-800 rounded shadow-lg border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-300">
          {description}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white dark:border-t-neutral-800"></div>
        </div>
      )}
    </div>
  );
};

export default SelectableToggle;
