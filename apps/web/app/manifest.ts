import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Figma to Code",
    short_name: "Figma to Code",
    description:
      "Private, free and open-source code generation for Figma designs.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7faf6",
    theme_color: "#07160d",
    icons: [{ src: "/icon.png", sizes: "768x768", type: "image/png" }],
  };
}
