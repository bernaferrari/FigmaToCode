import { useState } from "react";

const GradientsPanel = (props: {
  gradients: {
    cssPreview: string;
    exportValue: string;
  }[];
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
        Gradients
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {props.gradients.map((gradient, idx) => (
          <button
            key={"button" + idx}
            className={`w-full h-16 rounded-lg text-sm shadow-sm transition-all duration-300 ${
              isPressed === idx
                ? "ring-4 ring-green-300 ring-opacity-50 animate-pulse"
                : "ring-0"
            }`}
            style={{ background: gradient.cssPreview }}
            onClick={() => {
              handleButtonClick(gradient.exportValue, idx);
            }}
          ></button>
        ))}
      </div>
    </div>
  );
};
export default GradientsPanel;
