import React from "react";
import { Code, MousePointer, Eye, Copy } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card/50 border border-dashed border-neutral-300 dark:border-neutral-600 rounded-lg text-center">
      {/* Icon with "no code" symbol */}
      <div className="w-16 h-16 bg-linear-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 rounded-full flex items-center justify-center mb-5 shadow-2xs">
        <div className="relative">
          <Code size={24} className="text-neutral-500 dark:text-neutral-400" />
          <svg
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500"
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
      </div>

      {/* Title and hint */}
      <h3 className="text-lg font-medium text-neutral-800 dark:text-neutral-200 mb-2">
        No Layer Selected
      </h3>
      <p className="text-neutral-500 dark:text-neutral-400 max-w-xs mb-8">
        Select a layer from your Figma design to view the generated code.
      </p>

      {/* Completely redesigned steps section */}
      <div className="w-full max-w-xs">
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-4 left-0 w-full h-0.5 bg-neutral-200 dark:bg-neutral-700"></div>

          {/* Steps with connecting line */}
          <ol className="relative flex justify-between">
            {/* Step 1 - Current */}
            <li className="flex flex-col items-center">
              <div className="relative z-10">
                <div className="absolute -inset-1.5 rounded-full bg-green-100 dark:bg-green-900/20 animate-pulse-slow"></div>
                <div className="relative flex items-center justify-center w-8 h-8 bg-green-500 dark:bg-green-600 rounded-full text-white">
                  <MousePointer size={15} />
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="font-medium text-sm text-green-600 dark:text-green-500">
                  Select
                </div>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Choose a layer
                </p>
              </div>
            </li>

            {/* Step 2 */}
            <li className="flex flex-col items-center">
              <div className="z-10 flex items-center justify-center w-8 h-8 bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 rounded-full text-neutral-400 dark:text-neutral-500">
                <Eye size={15} />
              </div>
              <div className="mt-3 text-center">
                <div className="font-medium text-sm text-neutral-600 dark:text-neutral-400">
                  View
                </div>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  See the code
                </p>
              </div>
            </li>

            {/* Step 3 */}
            <li className="flex flex-col items-center">
              <div className="z-10 flex items-center justify-center w-8 h-8 bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 rounded-full text-neutral-400 dark:text-neutral-500">
                <Copy size={15} />
              </div>
              <div className="mt-3 text-center">
                <div className="font-medium text-sm text-neutral-600 dark:text-neutral-400">
                  Copy
                </div>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  Use anywhere
                </p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
