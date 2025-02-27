import { Framework } from "types";
import * as React from "react";
import { PluginUI } from "plugin-ui";

export default function Web() {
  const [selectedFramework, setSelectedFramework] =
    React.useState<Framework>("HTML");

  const testWarnings = ["This is an example of a conversion warning message."];

  return (
    <div className="flex flex-col p-8 space-y-2">
      <p className="text-3xl font-bold">Debug Mode</p>
      <div className="h-0.5 bg-gray-100 rounded"></div>

      <div className="flex w-full space-x-2">
        <div className="bg-gray-100 p-2 rounded-md">
          <div className="bg-white w-96 shadow-md rounded-md">
            <PluginFigmaToolbar variant="(Light)" />
            <PluginUI
              code={"code goes hereeeee"}
              isLoading={false}
              selectedFramework={selectedFramework}
              setSelectedFramework={setSelectedFramework}
              htmlPreview={null}
              settings={undefined}
              onPreferenceChanged={() => {}}
              colors={[]}
              gradients={[]}
              warnings={testWarnings}
            />
          </div>
        </div>

        <div className="dark bg-gray-100 bg- p-2 rounded-md">
          <div className="bg-black w-96 shadow-md rounded-md">
            <PluginFigmaToolbar variant="(Dark)" />
            <PluginUI
              code={"code goes hereeeee"}
              isLoading={false}
              selectedFramework={selectedFramework}
              setSelectedFramework={setSelectedFramework}
              htmlPreview={null}
              settings={undefined}
              onPreferenceChanged={() => {}}
              colors={[]}
              gradients={[]}
              warnings={testWarnings}
            />
          </div>
        </div>
      </div>

      <div className="flex-col space-y-4 py-4">
        <div>
          <div>
            Plugin dropdown selection (each frame a different breakpoint)
          </div>
          <div className="flex space-x-4">
            <div className="w-24 h-12 bg-red-400"></div>
            <div className="w-12 h-12 bg-green-500"></div>
            <div className="w-4 h-12 bg-blue-600"></div>
          </div>
        </div>

        <div>
          <div>Outputs from plugin (different screen sizes)</div>
          <div className="flex space-x-4">
            <div className="w-24 h-12 bg-gray-400"></div>
            <div className="w-12 h-12 bg-gray-500"></div>
            <div className="w-4 h-12 bg-gray-600"></div>
          </div>
        </div>

        <div>
          <div> - Experiment on dark mode (invert colors on output) </div>
          <div className="flex space-x-4">
            <div className="w-24 h-12 bg-gray-900"></div>
            <div className="w-12 h-12 bg-gray-800"></div>
            <div className="w-4 h-12 bg-gray-700"></div>
          </div>
        </div>
      </div>

      <div className="min-w-1/2">
        <h3 className="text-lg">HTML Output Tester (No JSX)</h3>
        <textarea
          placeholder="Paste generated HTML snippet here"
          className="border-black border-2 p-2 w-1/2 min-h-10"
          onChange={(e) => {
            const preview = document.getElementById("preview");
            if (preview) {
              preview.innerHTML = e.target.value;
            }
          }}
        ></textarea>
        <div
          id="preview"
          className="border-black border-2 p-2 min-w-24 w-full min-h-10"
        >
          Empty
        </div>
      </div>
    </div>
  );
}

const PluginFigmaToolbar = (props: { variant: string }) => (
  <div className="bg-gray-800 w-full h-8 flex items-center text-white space-x-4 px-4">
    <span>Figma to Code {props.variant}</span>
  </div>
);
