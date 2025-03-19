"use client";

import { Framework } from "types";
import * as React from "react";
import { PluginUI } from "plugin-ui";

export default function Web() {
  const [selectedFramework, setSelectedFramework] =
    React.useState<Framework>("HTML");
  const testWarnings = ["This is an example of a conversion warning message."];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <header className="mb-10">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
          Debug Mode
        </h1>
        <p className="text-gray-600 mt-2">
          Preview your Figma to Code plugin in both light and dark modes
        </p>
        <div className="h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 mt-6"></div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col">
          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-xl border border-gray-100">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Light Mode
            </h2>
            <div className="border rounded-xl">
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
        </div>

        <div className="flex flex-col">
          <div className="p-6 rounded-xl shadow-xl border border-gray-700 bg-[#2C2C2C]">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100">
              Dark Mode
            </h2>
            <div className="border rounded-xl dark">
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
      </div>
    </div>
  );
}

const PluginFigmaToolbar = (props: { variant: string }) => (
  <div className="bg-neutral-800 w-full h-12 flex items-center text-white gap-4 px-5 rounded-t-lg shadow-sm">
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-red-500"></div>
      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
      <div className="w-3 h-3 rounded-full bg-green-500"></div>
    </div>
    <span className="font-medium ml-2">Figma to Code {props.variant}</span>
  </div>
);
