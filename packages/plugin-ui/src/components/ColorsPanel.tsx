import { useState } from "react";
import { SolidColorConversion } from "types";

const ColorsPanel = (props: {
  colors: SolidColorConversion[];
  onColorClick: (color: string) => void;
}) => {
  const [isPressed, setIsPressed] = useState(-1);

  const handleButtonClick = (value: string, idx: number) => {
    setIsPressed(idx);
    setTimeout(() => setIsPressed(-1), 250);
    props.onColorClick(value);
  };

  return (
    <div className="bg-gray-100 dark:bg-neutral-900 w-full rounded-lg p-2 flex flex-col gap-2">
      <h2 className="text-gray-800 dark:text-gray-200 text-lg font-medium">
        Colors
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {props.colors.map((color, idx) => (
          <button
            key={"button" + idx}
            className={`w-full h-16 rounded-lg text-sm font-semibold shadow-sm transition-all duration-300 ${
              isPressed === idx
                ? "ring-4 ring-green-300 ring-opacity-50 animate-pulse"
                : "ring-0"
            }`}
            style={{ backgroundColor: color.hex }}
            onClick={() => {
              handleButtonClick(color.exportValue, idx);
            }}
          >
            <div className="flex flex-col h-full justify-center items-center">
              <span
                className={`text-xs font-semibold ${
                  color.contrastWhite > color.contrastBlack
                    ? "text-white"
                    : "text-black"
                }`}
              >
                {color.colorName ? color.colorName : `#${color.hex}`}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
export default ColorsPanel;
