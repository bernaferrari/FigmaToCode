import copy from "copy-to-clipboard";
import Preview from "./components/Preview";
import GradientsPanel from "./components/GradientsPanel";
import ColorsPanel from "./components/ColorsPanel";
import CodePanel from "./components/CodePanel";
import About from "./components/About";
import {
  Framework,
  HTMLPreview,
  LinearGradientConversion,
  PluginSettings,
  SolidColorConversion,
  Warning,
} from "types";
import {
  preferenceOptions,
  selectPreferenceOptions,
} from "./codegenPreferenceOptions";
import Loading from "./components/Loading";
import { useState } from "react";
import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import React from "react";

type PluginUIProps = {
  code: string;
  htmlPreview: HTMLPreview;
  warnings: Warning[];
  selectedFramework: Framework;
  setSelectedFramework: (framework: Framework) => void;
  settings: PluginSettings | null;
  onPreferenceChanged: (
    key: keyof PluginSettings,
    value: boolean | string,
  ) => void;
  colors: SolidColorConversion[];
  gradients: LinearGradientConversion[];
  isLoading: boolean;
};

const frameworks: Framework[] = ["HTML", "Tailwind", "Flutter", "SwiftUI"];

export const PluginUI = (props: PluginUIProps) => {
  const [showAbout, setShowAbout] = useState(false);

  if (props.isLoading) return <Loading />;

  const isEmpty = props.code === "";

  const warnings = props.warnings ?? [];

  return (
    <div className="flex flex-col h-full dark:text-white">
      <div className="p-2 flex gap-1">
        <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 gap-1 flex-grow">
          {frameworks.map((tab) => (
            <button
              key={`tab ${tab}`}
              className={`w-full p-1 text-sm ${
                props.selectedFramework === tab && !showAbout
                  ? "bg-green-500 dark:bg-green-600 text-white rounded-md font-semibold shadow-sm"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border focus:border-0 border-neutral-300 dark:border-neutral-600 rounded-md hover:bg-green-600 dark:hover:bg-green-800 dark:hover:border-green-800 hover:text-white dark:hover:text-white font-semibold shadow-sm"
              }`}
              onClick={() => {
                props.setSelectedFramework(tab as Framework);
                setShowAbout(false);
              }}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium ${
            showAbout
              ? "bg-green-500 dark:bg-green-600 text-white shadow-sm"
              : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-600 hover:bg-green-600 dark:hover:bg-green-800 dark:hover:border-green-800 hover:text-white dark:hover:text-white shadow-sm"
          }`}
          onClick={() => setShowAbout(!showAbout)}
          aria-label="About"
        >
          <InfoIcon size={16} />
        </button>
      </div>
      <div
        style={{
          height: 1,
          width: "100%",
          backgroundColor: "rgba(255,255,255,0.12)",
        }}
      ></div>
      <div className="flex flex-col h-full overflow-y-auto">
        {showAbout ? (
          <About />
        ) : (
          <div className="flex flex-col items-center px-4 py-2 gap-2 dark:bg-transparent">
            {isEmpty === false && props.htmlPreview && (
              <Preview htmlPreview={props.htmlPreview} />
            )}
            {warnings.length > 0 && (
              <div className="flex flex-col bg-yellow-400 text-black  dark:bg-yellow-500 dark:text-black p-3 w-full">
                <div className="flex flex-row gap-1">
                  <div style={{ transform: "translate(2px, 0px) scale(80%)" }}>
                    <TriangleAlertIcon />
                  </div>
                  <h3 className="text-base font-bold">Warnings:</h3>
                </div>
                <ul className="list-disc pl-6">
                  {warnings.map((message: string, index) => (
                    <li key={index} className="list-item">
                      <em className="italic text-sm">{message}</em>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <CodePanel
              code={props.code}
              selectedFramework={props.selectedFramework}
              preferenceOptions={preferenceOptions}
              selectPreferenceOptions={selectPreferenceOptions}
              settings={props.settings}
              onPreferenceChanged={props.onPreferenceChanged}
            />

            {props.colors.length > 0 && (
              <ColorsPanel
                colors={props.colors}
                onColorClick={(value) => {
                  copy(value);
                }}
              />
            )}

            {props.gradients.length > 0 && (
              <GradientsPanel
                gradients={props.gradients}
                onColorClick={(value) => {
                  copy(value);
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
