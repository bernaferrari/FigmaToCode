import React, { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  XCircle,
  AlertOctagon,
  ExternalLink,
  Info,
} from "lucide-react";
import { Warning } from "types";

interface WarningsPanelProps {
  warnings: Warning[];
}

// Helper function to categorize warnings by severity
const categorizeWarnings = (warnings: Warning[]) => {
  const critical = warnings.filter(
    (w) =>
      w.toString().toLowerCase().includes("error") ||
      w.toString().toLowerCase().includes("critical") ||
      w.toString().toLowerCase().includes("missing"),
  );
  const standard = warnings.filter((w) => !critical.includes(w));

  return { critical, standard };
};

const WarningsPanel: React.FC<WarningsPanelProps> = ({ warnings }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "critical" | "standard">(
    "all",
  );
  const { critical, standard } = categorizeWarnings(warnings);

  if (warnings.length === 0) return null;

  const displayedWarnings =
    activeTab === "all"
      ? warnings
      : activeTab === "critical"
        ? critical
        : standard;

  return (
    <div className="bg-white dark:bg-neutral-800 border border-amber-200 dark:border-amber-700 rounded-md shadow-xs overflow-hidden w-full">
      {/* Header - medium size */}
      <div
        className="flex items-center justify-between py-2 px-3 border-b border-amber-100 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20 cursor-pointer hover:bg-amber-100/70 dark:hover:bg-amber-900/30 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-2">
          <div className="text-amber-500 dark:text-amber-400">
            <AlertTriangle size={16} />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-amber-900 dark:text-amber-200 text-sm">
              {warnings.length} {warnings.length === 1 ? "Warning" : "Warnings"}
            </h3>
            {critical.length > 0 && (
              <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs">
                {critical.length} critical
              </span>
            )}
          </div>
        </div>
        <button
          className="p-1 hover:bg-amber-200/70 dark:hover:bg-amber-800/50 rounded text-amber-700 dark:text-amber-300 transition-colors"
          aria-label={isCollapsed ? "Expand warnings" : "Collapse warnings"}
        >
          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>

      {/* Warning content - balanced size */}
      {!isCollapsed && (
        <div className="p-2.5">
          {/* Tabs - medium size */}
          {critical.length > 0 && standard.length > 0 && (
            <div className="flex mb-2 bg-neutral-100 dark:bg-neutral-800 p-0.5 rounded">
              <button
                className={`px-2 py-1 text-xs font-medium rounded transition-colors flex-1 ${
                  activeTab === "all"
                    ? "bg-white dark:bg-neutral-700 shadow-xs"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-white/50 dark:hover:bg-neutral-700/50"
                }`}
                onClick={() => setActiveTab("all")}
              >
                All ({warnings.length})
              </button>
              <button
                className={`px-2 py-1 text-xs font-medium rounded transition-colors flex-1 flex items-center justify-center gap-1 ${
                  activeTab === "critical"
                    ? "bg-white dark:bg-neutral-700 shadow-xs text-red-600 dark:text-red-400"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-white/50 dark:hover:bg-neutral-700/50"
                }`}
                onClick={() => setActiveTab("critical")}
              >
                <AlertOctagon size={12} />
                <span>Critical ({critical.length})</span>
              </button>
              <button
                className={`px-2 py-1 text-xs font-medium rounded transition-colors flex-1 flex items-center justify-center gap-1 ${
                  activeTab === "standard"
                    ? "bg-white dark:bg-neutral-700 shadow-xs text-amber-600 dark:text-amber-400"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-white/50 dark:hover:bg-neutral-700/50"
                }`}
                onClick={() => setActiveTab("standard")}
              >
                <Info size={12} />
                <span>Other ({standard.length})</span>
              </button>
            </div>
          )}

          {/* Warning list - balanced size */}
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto pb-0.5">
            {displayedWarnings.map((message, index) => {
              const isCritical = critical.includes(message);
              return (
                <div
                  key={index}
                  className={`rounded border ${
                    isCritical
                      ? "border-red-200 dark:border-red-800/30"
                      : "border-amber-200 dark:border-amber-800/30"
                  } overflow-hidden animate-fadeIn`}
                >
                  <div
                    className={`flex items-start gap-2 py-1.5 px-2 ${
                      isCritical
                        ? "bg-red-50/50 dark:bg-red-900/5"
                        : "bg-amber-50/50 dark:bg-amber-900/5"
                    }`}
                  >
                    <div
                      className={`mt-0.5 shrink-0 ${
                        isCritical
                          ? "text-red-500 dark:text-red-400"
                          : "text-amber-500 dark:text-amber-400"
                      }`}
                    >
                      {isCritical ? (
                        <AlertOctagon size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-xs ${isCritical ? "text-red-700 dark:text-red-300" : "text-amber-700 dark:text-amber-300"}`}
                      >
                        {message.toString()}
                      </p>

                      {/* Suggested fix - balanced size */}
                      {isCritical && (
                        <div className="mt-1 bg-white/70 dark:bg-black/20 rounded py-1 px-2 text-neutral-600 dark:text-neutral-400 border-l border-red-300 dark:border-red-500 text-xs">
                          <span className="font-medium">Tip: </span>
                          {suggestFixForWarning(message.toString())}
                        </div>
                      )}
                    </div>

                    {/* Action link - balanced size */}
                    {shouldShowActionButtons(message.toString()) && (
                      <a
                        href={getDocsLinkForWarning(message.toString())}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 flex items-center text-xs text-blue-600 dark:text-blue-400 hover:underline mt-0.5"
                      >
                        <span>Info</span>
                        <ExternalLink size={10} className="ml-0.5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Help text - balanced size */}
          {displayedWarnings.length > 0 && (
            <div className="mt-2 py-1 px-1 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 rounded border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5">
              {/* <Info size={10} className="shrink-0" /> */}
              <span>
                Addressing warnings can improve the quality of the generated
                code.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper functions (these would be expanded with actual logic in your implementation)
const suggestFixForWarning = (warning: string): string => {
  if (warning.toLowerCase().includes("missing")) {
    return "Add the required properties to your component or select a parent element that includes all necessary children.";
  }
  if (warning.toLowerCase().includes("unsupported")) {
    return "Consider using a different element type or simplifying the design for better conversion results.";
  }
  return "Check your design elements and ensure they follow the recommended structure for code conversion.";
};

const shouldShowActionButtons = (warning: string): boolean => {
  // Example condition - you would customize this based on your specific warnings
  return (
    warning.toLowerCase().includes("unsupported") ||
    warning.toLowerCase().includes("missing")
  );
};

const getDocsLinkForWarning = (warning: string): string => {
  // Example URLs - in reality you would point to specific documentation pages
  if (warning.toLowerCase().includes("unsupported")) {
    return "https://github.com/bernaferrari/figma-to-code/wiki/Supported-Elements";
  }
  return "https://github.com/bernaferrari/figma-to-code/wiki";
};

export default WarningsPanel;
