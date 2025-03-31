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

  // Helper function to format complex color values
  const formatColorValue = (value: string) => {
    // Extract CSS variable name if present
    if (value.includes("var(--")) {
      const varMatch = value.match(/var\(--([\w-]+)/);
      return varMatch ? `--${varMatch[1]}` : value;
    }
    return value;
  };

  return (
    <div className="bg-card border w-full rounded-lg p-4 flex flex-col gap-2">
      <div className="p-0 pb-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            Color Palette
          </h2>
          <span className="text-xs bg-muted dark:bg-muted px-2 py-1 rounded-xl text-muted-foreground">
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
                ? "ring-4 ring-primary ring-opacity-50 animate-pulse"
                : "ring-0"
            }`}
            style={{ backgroundColor: color.hex }}
            onClick={() => {
              handleButtonClick(color.exportValue, idx);
            }}
            title={color.exportValue} // Show full value on hover
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
              {color.exportValue !== `#${color.hex}` && (
                <span
                  className={`text-[10px] opacity-70 max-w-full truncate px-1 ${
                    color.contrastWhite > color.contrastBlack
                      ? "text-white"
                      : "text-black"
                  }`}
                >
                  {formatColorValue(color.exportValue)}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
export default ColorsPanel;
