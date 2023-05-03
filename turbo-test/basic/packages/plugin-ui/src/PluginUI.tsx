import * as React from "react";
import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { Description } from "./description";

type PluginUIProps = {
  code: string;
  onNodeSelected?: (node: string) => void;
  // onSelectionChange?: (selection: string) => void;
};

export type exportTypes = "HTML" | "Tailwind" | "Flutter" | "SwiftUI";

export const PluginUI = (props: PluginUIProps) => {
  const [selectedNode, setSelectedNode] = React.useState<exportTypes>("HTML");

  return (
    <div className="flex flex-col px-2 mt-2 dark:text-white">
      <div className="grid grid-cols-4 gap-1">
        {["HTML", "Tailwind", "Flutter", "SwiftUI"].map((tab) => (
          <button
            className={`w-full p-1 text-sm ${
              selectedNode === tab
                ? "bg-green-400 dark:bg-emerald-600 dark:text-white bg-opacity-50 rounded text-gray-700 font-semibold"
                : "bg-green-50 dark:bg-green-600 dark:bg-opacity-25 border-[1px] border-green-500 border-opacity-20 dark:text-white dark:border-green-500 dark:border-opacity-25 rounded hover:text-gray-800 dark:hover:hover:text-gray-200 font-semibold"
            }`}
            onClick={() => {
              setSelectedNode(tab as exportTypes);
            }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center py-2 bg-gray-50 dark:bg-transparent">
        <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded">
          <Description selected={selectedNode} />
        </div>

        <div className="h-2"></div>

        {/* <ResponsiveGrade /> */}

        {/* <div className="h-2"></div>
        <div className="flex justify-end w-full mb-1">
          <button className="px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-lg ring-1 ring-gray-700 hover:bg-gray-700 focus:outline-none">
            Copy
          </button>
        </div> */}

        {/* Code View */}
        <CodeWindow code={props.code} />

        <div className="text-xs">
          Other things go here, such as color, tokens, etc.
        </div>
      </div>
    </div>
  );
};

export const ResponsiveGrade = () => {
  return (
    <div className="flex justify-between w-full">
      <span className="text-sm">80% responsive</span>
      <div className="flex items-center checkbox">
        <input id="uniqueId" type="checkbox" className="w-6 checkbox__box" />
        <label htmlFor="uniqueId" className="text-sm checkbox__label">
          Auto-fix
        </label>
      </div>
    </div>
  );
};

export const CodeWindow = (props: { code: string }) => {
  const emptySelection = false;
  const codeObservable = "";
  const [isPressed, setIsPressed] = useState(false);

  // Add your clipboard function here or any other actions
  const handleButtonClick = () => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 250);
  };

  if (emptySelection)
    return (
      <div className="flex flex-col space-y-2 m-auto items-center justify-center p-4 {sectionStyle}">
        <p className="text-lg font-bold">Nothing is selected</p>
        <p className="text-xs">Try selecting a layer, any layer</p>
      </div>
    );
  else
    return (
      <div className="w-full pt-2 {sectionStyle}">
        <div className="flex items-center justify-between space-x-2">
          <p className="px-4 py-1.5 text-lg font-medium text-center dark:text-white rounded-lg">
            HTML Code
          </p>
          <button
            className={`px-4 py-2 font-semibold border border-blue-500 rounded-lg hover:bg-blue-500 dark:hover:bg-blue-500 hover:text-white hover:border-transparent transition-all duration-300 ${
              isPressed
                ? "bg-green-500 text-white hover:bg-green-500 ring-4 ring-green-300 ring-opacity-50 animate-pulse"
                : "bg-transparent text-blue-700 dark:text-blue-200"
            }`}
            onClick={handleButtonClick}
          >
            Copy
          </button>
        </div>

        <SyntaxHighlighter
          language="dart"
          style={materialDark}
          customStyle={{
            fontSize: 12,
            borderRadius: 8,
          }}
        >
          {props.code}
        </SyntaxHighlighter>

        <div className="flex items-center content-center justify-end mx-2 mb-2 space-x-8">
          {/* <Switch id="material" text="Material" /> */}
        </div>
      </div>
    );
};
