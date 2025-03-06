import React from "react";

type Option = {
  value: string;
  label: string;
};

interface FrameworkTabsProps {
  options: Option[];
  selectedValue: string;
  onChange: (value: string) => void;
}

const FrameworkTabs: React.FC<FrameworkTabsProps> = ({
  options,
  selectedValue,
  onChange,
}) => {
  return (
    <div className="flex flex-wrap gap-1 my-2">
      <div className="flex flex-wrap bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg gap-1 w-fit">
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-white dark:bg-blue-500 shadow-sm dark:text-white"
                  : "hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FrameworkTabs;
