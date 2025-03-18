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
      <div className="flex flex-wrap bg-muted p-1 rounded-lg gap-1 w-fit">
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`py-1.5 px-3 rounded-md text-xs font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-blue-500 dark:bg-blue-500 text-primary-foreground shadow-xs"
                  : "hover:bg-muted-foreground/10 text-muted-foreground"
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
