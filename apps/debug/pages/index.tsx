import { FrameworkTypes, PluginUI } from "plugin-ui";
import * as React from "react";

export default function Web() {
  const [selectedFramework, setSelectedFramework] =
    React.useState<FrameworkTypes>("HTML");

  return (
    <div className="flex flex-col p-8 space-y-2">
      <p className="text-3xl font-bold">Debug Mode</p>
      <div className="h-0.5 bg-gray-100 rounded"></div>

      <div className="flex w-full space-x-2">
        <div className="bg-gray-100 p-2 rounded-md">
          <div className="bg-white w-96 shadow-md rounded-md">
            <PluginFigmaToolbar variant="(Light)" />
            <PluginUI
              code={
                "backend:dev: CJS dist/index.js 105.74 KB backend:dev: CJS ⚡️ Build        success in 419ms plugin:dev: warn - Port 3000 is in use, trying 3001        instead. plugin:dev: warn - Port 3001 is in use, trying 3002 instead."
              }
              emptySelection={false}
              selectedFramework={selectedFramework}
              setSelectedFramework={setSelectedFramework}
              htmlPreview={null}
              preferences={undefined}
              onPreferenceChange={() => {}}
              colors={[]}
              gradients={[]}
            />
          </div>
        </div>

        <div className="dark bg-gray-100 bg- p-2 rounded-md">
          <div className="bg-black w-96 shadow-md rounded-md">
            <PluginFigmaToolbar variant="(Dark)" />
            <PluginUI
              code={"code goes hereeeee"}
              selectedFramework={selectedFramework}
              setSelectedFramework={setSelectedFramework}
              emptySelection={false}
              htmlPreview={null}
              preferences={undefined}
              onPreferenceChange={() => {}}
              colors={[]}
              gradients={[]}
            />
          </div>
        </div>
      </div>
      {/* <div>Templates for debugging</div>
      <div className="flex space-x-4">
        {[1, 2, 3, 4, 5].map((d) => (
          <div
            key={`row ${d}`}
            className={`bg-gray-400 w-28 h-28 rounded ${
              d == 1 ? "ring-2 ring-green-500" : ""
            }`}
          >
            <Image
              src="https://images.unsplash.com/photo-1678653300204-75de70535454?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=120&q=0"
              alt="A random image"
              width={112}
              height={112}
              style={{ objectFit: "cover" }}
              className="rounded"
            />
          </div>
        ))}
      </div> */}

      <div>Plugin dropdown selection (each frame a different breakpoint)</div>
      <div className="flex space-x-4">
        <div className="w-24 h-12 bg-red-400"></div>
        <div className="w-12 h-12 bg-green-500"></div>
        <div className="w-4 h-12 bg-blue-600"></div>
      </div>

      <div>Outputs from plugin (different screen sizes)</div>
      <div className="flex space-x-4">
        <div className="w-24 h-12 bg-gray-400"></div>
        <div className="w-12 h-12 bg-gray-500"></div>
        <div className="w-4 h-12 bg-gray-600"></div>
      </div>

      <div> - Experiment on dark mode (invert colors on output) </div>
      <div className="flex space-x-4">
        <div className="w-24 h-12 bg-gray-900"></div>
        <div className="w-12 h-12 bg-gray-800"></div>
        <div className="w-4 h-12 bg-gray-700"></div>
      </div>
    </div>
  );
}

const PluginFigmaToolbar = (props: { variant: string }) => (
  <div className="bg-gray-800 w-full h-8 flex items-center text-white space-x-4 px-4">
    {/* <div className="bg-white w-4 h-4 rounded" /> */}
    <span>Figma to Code {props.variant}</span>
  </div>
);
