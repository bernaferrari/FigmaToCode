import React from "react";
import { Button } from "./ui/button";

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
    <div className="flex flex-wrap gap-1">
      <div className="flex flex-wrap bg-muted p-1 rounded-lg gap-1 w-fit">
        {options.map((option) => {
          const isSelected = option.value === selectedValue;
          return (
            <Button
              variant="ghost"
              size="sm"
              key={option.value}
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              className={`h-7 rounded-md px-3 text-xs ${
                isSelected
                  ? "bg-blue-500 text-primary-foreground shadow-2xs hover:bg-blue-500 hover:text-primary-foreground dark:bg-blue-500 dark:hover:bg-blue-500"
                  : "text-muted-foreground hover:bg-muted-foreground/10 hover:text-muted-foreground dark:hover:bg-muted-foreground/10"
              }`}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default FrameworkTabs;
