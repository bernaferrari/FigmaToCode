import copy from "copy-to-clipboard";
import Preview from "./components/Preview";
import GradientsPanel from "./components/GradientsPanel";
import ColorsPanel from "./components/ColorsPanel";
import CodePanel from "./components/CodePanel";
import EmptyState from "./components/EmptyState";
import About from "./components/About";
import WarningsPanel from "./components/WarningsPanel";
import {
  Framework,
  DownloadProjectFormat,
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
import { useEffect, useState } from "react";
import { InfoIcon } from "lucide-react";
import React from "react";
import { Button } from "./components/ui/button";
import { ScrollArea } from "./components/ui/scroll-area";
import { TooltipProvider } from "./components/ui/tooltip";

type PluginUIProps = {
  code: string;
  htmlPreview: HTMLPreview;
  warnings: Warning[];
  selectedFramework: Framework;
  setSelectedFramework: (framework: Framework) => void;
  settings: PluginSettings | null;
  onPreferenceChanged: (
    key: keyof PluginSettings,
    value: PluginSettings[keyof PluginSettings],
  ) => void;
  colors: SolidColorConversion[];
  gradients: LinearGradientConversion[];
  isLoading: boolean;
  onDownloadProject?: (format: DownloadProjectFormat) => void;
  isDownloadingProject?: boolean;
  projectDownloadError?: string | null;
};

const frameworks: Framework[] = ["HTML", "Tailwind", "Flutter", "SwiftUI"];
const LOADING_INDICATOR_DELAY_MS = 250;

const DelayedLoading = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setVisible(true),
      LOADING_INDICATOR_DELAY_MS,
    );
    return () => window.clearTimeout(timer);
  }, []);

  return visible ? <Loading /> : null;
};

type FrameworkTabsProps = {
  frameworks: Framework[];
  selectedFramework: Framework;
  setSelectedFramework: (framework: Framework) => void;
  showAbout: boolean;
  setShowAbout: (show: boolean) => void;
};

const FrameworkTabs = ({
  frameworks,
  selectedFramework,
  setSelectedFramework,
  showAbout,
  setShowAbout,
}: FrameworkTabsProps) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-2 md:grid-cols-4 gap-1 grow">
      {frameworks.map((tab) => (
        <Button
          variant="ghost"
          size="sm"
          key={`tab ${tab}`}
          className={`w-full h-8 rounded-md text-sm ${
            selectedFramework === tab && !showAbout
              ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary"
              : "bg-muted text-foreground hover:bg-primary/90 hover:text-primary-foreground dark:hover:bg-primary/90"
          }`}
          onClick={() => {
            setSelectedFramework(tab as Framework);
            setShowAbout(false);
          }}
        >
          {tab}
        </Button>
      ))}
    </div>
  );
};

export const PluginUI = (props: PluginUIProps) => {
  const [showAbout, setShowAbout] = useState(false);

  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [previewViewMode, setPreviewViewMode] = useState<
    "desktop" | "mobile" | "precision"
  >("precision");
  const [previewBgColor, setPreviewBgColor] = useState<"white" | "black">(
    "white",
  );

  if (props.isLoading) {
    return <DelayedLoading />;
  }

  const isEmpty = props.code === "";
  const warnings = props.warnings ?? [];

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full overflow-hidden bg-background text-foreground">
        <div className="px-2 py-1.5 dark:bg-card">
          <div className="flex gap-1 bg-muted dark:bg-card rounded-lg p-0.5">
            <FrameworkTabs
              frameworks={frameworks}
              selectedFramework={props.selectedFramework}
              setSelectedFramework={props.setSelectedFramework}
              showAbout={showAbout}
              setShowAbout={setShowAbout}
            />
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 rounded-md ${
                showAbout
                  ? "bg-primary text-primary-foreground shadow-xs hover:bg-primary hover:text-primary-foreground dark:hover:bg-primary"
                  : "bg-muted text-foreground hover:bg-primary/90 hover:text-primary-foreground dark:hover:bg-primary/90"
              }`}
              onClick={() => {
                setShowAbout(!showAbout);
              }}
              aria-label="About"
            >
              <InfoIcon size={16} />
            </Button>
          </div>
        </div>
        <div
          style={{
            height: 1,
            width: "100%",
            backgroundColor: "rgba(255,255,255,0.12)",
          }}
        ></div>
        <ScrollArea className="min-h-0 flex-1 overflow-hidden">
          {showAbout ? (
            <About
              useOldPluginVersion={props.settings?.useOldPluginVersion2025}
              onPreferenceChanged={props.onPreferenceChanged}
            />
          ) : isEmpty ? (
            <div className="flex min-h-full items-center justify-center">
              <EmptyState />
            </div>
          ) : (
            <div className="flex flex-col items-center px-4 pt-3 pb-2 gap-2 dark:bg-transparent">
              {props.htmlPreview && (
                <Preview
                  htmlPreview={props.htmlPreview}
                  expanded={previewExpanded}
                  setExpanded={setPreviewExpanded}
                  viewMode={previewViewMode}
                  setViewMode={setPreviewViewMode}
                  bgColor={previewBgColor}
                  setBgColor={setPreviewBgColor}
                />
              )}

              {warnings.length > 0 && <WarningsPanel warnings={warnings} />}

              <CodePanel
                code={props.code}
                selectedFramework={props.selectedFramework}
                preferenceOptions={preferenceOptions}
                selectPreferenceOptions={selectPreferenceOptions}
                settings={props.settings}
                onPreferenceChanged={props.onPreferenceChanged}
                onDownloadProject={props.onDownloadProject}
                isDownloadingProject={props.isDownloadingProject}
                projectDownloadError={props.projectDownloadError}
              />

              {props.colors.length > 0 && (
                <div className="mt-3 w-full">
                  <ColorsPanel
                    colors={props.colors}
                    onColorClick={(value) => {
                      copy(value);
                    }}
                  />
                </div>
              )}

              {props.gradients.length > 0 && (
                <div className="mt-3 w-full">
                  <GradientsPanel
                    gradients={props.gradients}
                    onColorClick={(value) => {
                      copy(value);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
};
