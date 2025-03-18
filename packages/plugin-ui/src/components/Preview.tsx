import React from "react";
import { HTMLPreview } from "types";
import {
  Maximize2,
  Minimize2,
  MonitorSmartphone,
  Smartphone,
  Circle,
  Ruler,
  Monitor,
} from "lucide-react";
import { cn } from "../lib/utils";

// Update the component props to receive state from parent
const Preview: React.FC<{
  htmlPreview: HTMLPreview;
  expanded: boolean;
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  viewMode: "desktop" | "mobile" | "precision";
  setViewMode: React.Dispatch<
    React.SetStateAction<"desktop" | "mobile" | "precision">
  >;
  bgColor: "white" | "black";
  setBgColor: React.Dispatch<React.SetStateAction<"white" | "black">>;
}> = (props) => {
  const {
    htmlPreview,
    expanded,
    setExpanded,
    viewMode,
    setViewMode,
    bgColor,
    setBgColor,
  } = props;

  // Define consistent dimensions regardless of mode
  const containerWidth = expanded ? 320 : 240;
  const containerHeight = expanded ? 180 : 120;

  // Calculate scale factor first to use in content width calculation
  const scaleFactor = Math.min(
    containerWidth / htmlPreview.size.width,
    containerHeight / htmlPreview.size.height,
  );

  // Calculate content dimensions based on view mode
  const contentWidth =
    viewMode === "desktop"
      ? containerWidth
      : viewMode === "mobile"
        ? Math.floor(containerWidth * 0.4) // Narrower for mobile
        : htmlPreview.size.width * scaleFactor + 2; // I don't know why I need the 2, but it works always. I guess rounding error for zoom.

  return (
    <div className="flex flex-col w-full bg-card rounded-lg border border-border">
      {/* Header with view mode controls */}
      <div className="flex justify-between items-center px-3 py-2 border-b border-border">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <MonitorSmartphone size={16} />
          Preview
        </h3>
        <div className="flex items-center gap-1">
          {/* Background Color Toggle - Only show in desktop and mobile modes */}

          <button
            onClick={() => setBgColor(bgColor === "white" ? "black" : "white")}
            className="p-1.5 mr-1 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors"
            aria-label={`Switch the preview to ${bgColor === "white" ? "black" : "white"} background.\nUseful to avoid black text on black background.`}
            title={`Switch the preview to ${bgColor === "white" ? "black" : "white"} background.\nUseful to avoid black text on black background.`}
          >
            <Circle size={14} fill={bgColor} className="stroke-current" />
          </button>

          {/* View Mode Toggle */}
          {/* <div className="mr-1 flex bg-neutral-100 dark:bg-neutral-700 rounded-md p-0.5">
            <button
              onClick={() => setViewMode("desktop")}
              className={`p-1 rounded text-xs ${
                viewMode === "desktop"
                  ? "bg-white dark:bg-neutral-600 shadow-2xs text-neutral-800 dark:text-white"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
              } transition-colors duration-200`}
              aria-label="Desktop view"
              title="Desktop view"
            >
              <Monitor size={14} />
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`p-1 rounded text-xs ${
                viewMode === "mobile"
                  ? "bg-white dark:bg-neutral-600 shadow-2xs text-neutral-800 dark:text-white"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
              } transition-colors duration-200`}
              aria-label="Mobile view"
              title="Mobile view"
            >
              <Smartphone size={14} />
            </button>
            <button
              onClick={() => setViewMode("precision")}
              className={`p-1 rounded text-xs ${
                viewMode === "precision"
                  ? "bg-white dark:bg-neutral-600 shadow-2xs text-neutral-800 dark:text-white"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white"
              } transition-colors duration-200`}
              aria-label="Precision view (exact dimensions)"
              title="Precision view (exact dimensions)"
            >
              <Ruler size={14} />
            </button>
          </div> */}

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors"
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
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
            style={{
              width: contentWidth,
              height:
                viewMode === "mobile"
                  ? Math.min(containerHeight * 0.9, containerHeight)
                  : viewMode === "precision"
                    ? htmlPreview.size.height * scaleFactor // Use scaled height for precision
                    : containerHeight,
              transition: "width 0.3s ease, height 0.3s ease",
            }}
          >
            {/* Device frame - no background for precision mode */}
            <div
              className={cn(
                "w-full h-full flex justify-center items-center overflow-hidden",
                bgColor === "white" ? "bg-white" : "bg-black",
                viewMode === "desktop"
                  ? "border border-neutral-300 dark:border-neutral-600 rounded-sm shadow-2xs"
                  : viewMode === "mobile"
                    ? "border-2 border-neutral-400 dark:border-neutral-500 rounded-xl shadow-2xs"
                    : "border border-indigo-400 dark:border-indigo-500 rounded-sm shadow-2xs",
                `transition-all duration-300 ease-in-out`,
              )}
            >
              {/* Content */}
              <div className="w-full h-full flex justify-center items-center">
                <div
                  style={{
                    zoom: scaleFactor,
                    width:
                      viewMode === "precision"
                        ? htmlPreview.size.width
                        : "100%",
                    height:
                      viewMode === "precision"
                        ? htmlPreview.size.height
                        : "100%",
                    transformOrigin: "center",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    aspectRatio:
                      viewMode === "precision"
                        ? `${htmlPreview.size.width} / ${htmlPreview.size.height}`
                        : undefined,
                    transition: "all 0.3s ease",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: htmlPreview.content,
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
          {htmlPreview.size.width.toFixed(0)}×
          {htmlPreview.size.height.toFixed(0)}px
        </span>
        {/* <div className="flex items-center gap-1.5">
          {viewMode === "mobile" ? (
            <span className="flex items-center gap-1">
              <Smartphone size={10} />
              <span>Mobile view</span>
            </span>
          ) : viewMode === "precision" ? (
            <span className="flex items-center gap-1">
              <Ruler size={10} />
              <span>Precision view</span>
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Monitor size={10} />
              <span>Desktop view</span>
            </span>
          )}
        </div> */}
      </div>
    </div>
  );
};

export default Preview;
