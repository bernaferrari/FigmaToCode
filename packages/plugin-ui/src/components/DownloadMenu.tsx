import { Download, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { DownloadProjectFormat, Framework } from "types";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./ui/popover";

type DownloadMenuProps = {
  framework: Framework;
  onDownload: (format: DownloadProjectFormat) => void;
  isDownloading?: boolean;
};

const downloadOptions: Array<{
  label: string;
  format: DownloadProjectFormat;
}> = [
  {
    label: "Vite",
    format: "vite",
  },
  {
    label: "Next.js",
    format: "nextjs",
  },
  {
    label: "HTML",
    format: "html",
  },
];

const getDownloadOptions = (framework: Framework) => {
  if (framework === "Flutter") {
    return [{ label: "Flutter", format: "flutter" as const }];
  }

  if (framework === "SwiftUI") {
    return [{ label: "SwiftUI Source", format: "swiftui" as const }];
  }

  return downloadOptions;
};

const getDownloadLabel = (framework: Framework) =>
  framework === "Flutter" || framework === "SwiftUI"
    ? "Download source"
    : "Download project";

const DownloadMenu = ({
  framework,
  onDownload,
  isDownloading = false,
}: DownloadMenuProps) => {
  const [open, setOpen] = useState(false);
  const options = getDownloadOptions(framework);
  const directFormat = options.length === 1 ? options[0].format : null;
  const downloadLabel = getDownloadLabel(framework);
  const buttonLabel = isDownloading ? "Creating project…" : downloadLabel;

  const handleDownload = (format: DownloadProjectFormat) => {
    setOpen(false);
    onDownload(format);
  };

  if (directFormat) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 bg-neutral-100 text-neutral-800 shadow-sm ring-1 ring-neutral-200 transition-colors duration-300 ease-[cubic-bezier(0.165,0.85,0.45,1)] hover:bg-neutral-200 hover:text-neutral-950 dark:bg-neutral-800/90 dark:text-neutral-200 dark:ring-white/10 dark:hover:bg-neutral-600 dark:hover:text-white dark:hover:ring-white/20"
        aria-label={buttonLabel}
        title={buttonLabel}
        onClick={() => onDownload(directFormat)}
        disabled={isDownloading}
      >
        {isDownloading ? (
          <span
            className="inline-flex animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          >
            <LoaderCircle className="h-4 w-4" />
          </span>
        ) : (
          <Download className="h-4 w-4" />
        )}
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-neutral-100 text-neutral-800 shadow-sm ring-1 ring-neutral-200 transition-colors duration-300 ease-[cubic-bezier(0.165,0.85,0.45,1)] hover:bg-neutral-200 hover:text-neutral-950 dark:bg-neutral-800/90 dark:text-neutral-200 dark:ring-white/10 dark:hover:bg-neutral-600 dark:hover:text-white dark:hover:ring-white/20"
            aria-label={buttonLabel}
            title={buttonLabel}
            disabled={isDownloading}
          />
        }
      >
        {isDownloading ? (
          <span
            className="inline-flex animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          >
            <LoaderCircle className="h-4 w-4" />
          </span>
        ) : (
          <Download className="h-4 w-4" />
        )}
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="w-32 gap-1 p-1">
        <PopoverHeader className="px-2 py-1.5">
          <PopoverTitle className="text-xs text-muted-foreground">
            Download project as
          </PopoverTitle>
        </PopoverHeader>
        <div className="flex flex-col gap-0.5">
          {options.map((option) => (
            <button
              key={option.format}
              className="flex w-full flex-col rounded-md px-2 py-1.5 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
              onClick={() => handleDownload(option.format)}
              disabled={isDownloading}
            >
              <span className="font-medium text-foreground">
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DownloadMenu;
