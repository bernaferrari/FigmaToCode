"use client";

import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";
import copy from "copy-to-clipboard";
import { cn } from "../lib/utils";

interface CopyButtonProps {
  value: string;
  className?: string;
  showLabel?: boolean;
  successDuration?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function CopyButton({
  value,
  className,
  showLabel = true,
  successDuration = 750,
  onMouseEnter,
  onMouseLeave,
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, successDuration);

      return () => clearTimeout(timer);
    }
  }, [isCopied, successDuration]);

  const handleCopy = async () => {
    try {
      copy(value);
      setIsCopied(true);
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  return (
    <button
      onClick={handleCopy}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        `inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-300`,
        isCopied
          ? "bg-primary text-primary-foreground"
          : "bg-neutral-100 dark:bg-neutral-700 dark:hover:bg-muted-foreground/30 text-foreground",
        className,
        `relative`,
      )}
      aria-label={isCopied ? "Copied!" : "Copy to clipboard"}
    >
      <div className="relative h-4 w-4 mr-1.5">
        <span
          className={`absolute inset-0 transition-all duration-200 ${
            isCopied
              ? "opacity-0 scale-75 rotate-[-10deg]"
              : "opacity-100 scale-100 rotate-0"
          }`}
        >
          <Copy className="h-4 w-4 text-foreground" />
        </span>
        <span
          className={`absolute inset-0 transition-all duration-200 ${
            isCopied
              ? "opacity-100 scale-100 rotate-0"
              : "opacity-0 scale-75 rotate-[10deg]"
          }`}
        >
          <Check className="h-4 w-4 text-primary-foreground" />
        </span>
      </div>

      {showLabel && (
        <span className="font-medium">{isCopied ? "Copied" : "Copy"}</span>
      )}

      {isCopied && (
        <span
          className="absolute inset-0 rounded-md animate-pulse bg-primary/10"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
