export const SITE_NAME = "Figma to Code";
export const SITE_DESCRIPTION =
  "A fast, flexible and private Figma plugin that generates HTML, React, Svelte, Tailwind, Flutter and SwiftUI without sending your designs to an external service.";
export const FIGMA_PLUGIN_URL =
  "https://www.figma.com/community/plugin/842128343887142055";
export const GITHUB_URL = "https://github.com/bernaferrari/FigmaToCode";

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (!configuredUrl) {
    return new URL("http://localhost:3000");
  }

  const url = configuredUrl.startsWith("http")
    ? configuredUrl
    : `https://${configuredUrl}`;
  return new URL(url.replace(/\/$/, ""));
}
