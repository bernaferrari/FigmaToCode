import React, { useState, useEffect } from "react";
import { HTMLPreview } from "types";
import {
  Maximize2,
  Minimize2,
  MonitorSmartphone,
  Smartphone,
} from "lucide-react";

const Preview: React.FC<{
  htmlPreview: HTMLPreview;
}> = (props) => {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [animationClass, setAnimationClass] = useState<string>("");

  // Define consistent dimensions regardless of mode
  const containerWidth = expanded ? 320 : 240;
  const containerHeight = expanded ? 180 : 120;

  // Calculate content dimensions based on view mode
  const contentWidth =
    viewMode === "desktop" ? containerWidth : Math.floor(containerWidth * 0.4); // Narrower for mobile

  // Adjust scale factor based on view mode
  const scaleFactor =
    viewMode === "desktop"
      ? Math.min(
          containerWidth / props.htmlPreview.size.width,
          containerHeight / props.htmlPreview.size.height,
        )
      : Math.min(
          contentWidth / props.htmlPreview.size.width,
          containerHeight / props.htmlPreview.size.height,
        );

  // Add animation when changing view mode
  useEffect(() => {
    setAnimationClass(
      viewMode === "desktop"
        ? "animate-slide-in-left"
        : "animate-slide-in-right",
    );
    const timer = setTimeout(() => setAnimationClass(""), 300); // Remove animation class after it completes
    return () => clearTimeout(timer);
  }, [viewMode]);

  // Add animation when changing size
  useEffect(() => {
    const timer = setTimeout(() => setAnimationClass("animate-scale-in"), 50);
    return () => {
      clearTimeout(timer);
      setAnimationClass("");
    };
  }, [expanded]);

  return (
    <div className="flex flex-col w-full bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
      {/* Header with view mode controls */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-neutral-200 dark:border-neutral-700">
        <h3 className="text-sm font-medium text-neutral-800 dark:text-white flex items-center gap-2">
          <MonitorSmartphone size={16} className="text-neutral-500" />
          Preview
        </h3>
        <div className="flex items-center gap-1">
          {/* View Mode Toggle */}
          <div className="mr-1 flex bg-neutral-100 dark:bg-neutral-700 rounded-md p-0.5">
            <button
              onClick={() => setViewMode("desktop")}
              className={`p-1 rounded text-xs ${
                viewMode === "desktop"
                  ? "bg-white dark:bg-neutral-600 shadow-sm text-neutral-800 dark:text-white"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
              } transition-colors duration-200`}
              aria-label="Desktop view"
              title="Desktop view"
            >
              <MonitorSmartphone size={14} />
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`p-1 rounded text-xs ${
                viewMode === "mobile"
                  ? "bg-white dark:bg-neutral-600 shadow-sm text-neutral-800 dark:text-white"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
              } transition-colors duration-200`}
              aria-label="Mobile view"
              title="Mobile view"
            >
              <Smartphone size={14} />
            </button>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors"
            aria-label={expanded ? "Minimize preview" : "Maximize preview"}
            title={expanded ? "Minimize preview" : "Maximize preview"}
          >
            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Preview container */}
      <div className="flex justify-center items-center bg-neutral-50 dark:bg-neutral-900 p-3">
        {/* Outer container with fixed dimensions */}
        <div
          className="relative"
          style={{
            width: containerWidth,
            height: containerHeight,
            transition: "width 0.3s ease, height 0.3s ease",
          }}
        >
          {/* Inner content positioned based on view mode */}
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${animationClass}`}
            style={{
              width: contentWidth,
              height:
                viewMode === "mobile"
                  ? Math.min(containerHeight * 0.9, containerHeight)
                  : containerHeight,
              transition: "width 0.3s ease, height 0.3s ease",
            }}
          >
            {/* Device frame - just a border for mobile, no status bar or home indicator */}
            <div
              className={`w-full h-full flex justify-center items-center overflow-hidden bg-white dark:bg-black ${
                viewMode === "desktop"
                  ? "border border-neutral-300 dark:border-neutral-600 rounded shadow-sm"
                  : "border-2 border-neutral-400 dark:border-neutral-500 rounded-xl shadow-sm"
              } transition-all duration-300 ease-in-out`}
            >
              {/* Content - no padding needed anymore */}
              <div className="w-full h-full flex justify-center items-center">
                <div
                  className="w-full"
                  style={{
                    zoom: scaleFactor,
                    transition: "all 0.3s ease",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: props.htmlPreview.content,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with size info */}
      <div className="px-3 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700">
        <span>
          {props.htmlPreview.size.width}×{props.htmlPreview.size.height}px
        </span>
        <div className="flex items-center gap-1.5">
          {viewMode === "mobile" ? (
            <span className="flex items-center gap-1">
              <Smartphone size={10} />
              <span>Mobile view</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <MonitorSmartphone size={10} />
              <span>Desktop view</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;
