import React from "react";
import { Code } from "lucide-react";

interface LoadingProps {}

const Loading = (_props: LoadingProps) => (
  <div className="flex items-center justify-center w-full h-full p-4 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-white animate-fadeIn">
    <div className="flex flex-col items-center max-w-sm">
      {/* Logo animation */}
      <div className="relative w-16 h-16 mb-5">
        <div className="absolute inset-0 bg-linear-to-br from-green-400 to-emerald-600 rounded-xl opacity-20 animate-pulse"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Code size={32} className="text-green-500 dark:text-green-400" />
        </div>
        {/* Loading spinner */}
        <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
            className="text-green-500/20 dark:text-green-500/30"
          />
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="4" 
            strokeLinecap="round"
            className="text-green-500 dark:text-green-400"
            strokeDasharray="60 200"
            strokeDashoffset="0"
          />
        </svg>
      </div>
      
      {/* Text */}
      <h2 className="text-xl font-semibold mb-2 text-center">
        Converting Design
      </h2>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center max-w-xs">
        Please wait while your design is being converted to code. This may take a moment for complex designs.
      </p>
      
      {/* Progress bar */}
      <div className="w-64 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mt-5">
        <div className="h-full bg-green-500 dark:bg-green-400 rounded-full animate-progress"></div>
      </div>
    </div>
  </div>
);

export default Loading;
