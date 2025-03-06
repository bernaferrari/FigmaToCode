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
    <div className="bg-gray-100 dark:bg-neutral-900 w-full rounded-lg p-4 flex flex-col gap-2">
      <div className="p-0 pb-2 border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
            {/* <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div> */}
            Color Palette
          </h2>
          <span className="text-xs bg-neutral-100 dark:bg-neutral-700 px-2 py-1 rounded-full text-neutral-500 dark:text-neutral-400">
            {props.colors.length} color{props.colors.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

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
