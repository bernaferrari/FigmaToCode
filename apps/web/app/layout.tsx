import type { Metadata } from "next";
import gitPreview from "../../../assets/git_preview.png";
import "../styles/globals.css";
import { SITE_DESCRIPTION, getSiteUrl } from "./site";
import { ThemeProvider } from "./ThemeProvider";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: {
    default: "Figma to Code — Fast, flexible and private Figma plugin",
    template: "%s | Figma to Code",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Figma to Code",
  keywords: [
    "Figma to code",
    "Figma to HTML",
    "Figma to React",
    "Figma to Tailwind",
    "Figma to Flutter",
    "Figma to SwiftUI",
    "private Figma plugin",
    "offline Figma to code",
    "open source Figma plugin",
    "Dev Mode code generation",
  ],
  authors: [
    { name: "Bernardo Ferrari", url: "https://github.com/bernaferrari" },
  ],
  creator: "Bernardo Ferrari",
  publisher: "Figma to Code",
  alternates: { canonical: "/" },
  category: "developer tools",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "768x768" }],
    apple: [{ url: "/icon.png", type: "image/png", sizes: "768x768" }],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Figma to Code — Fast, flexible code generation inside Figma",
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: "Figma to Code",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: gitPreview.src,
        width: gitPreview.width,
        height: gitPreview.height,
        alt: "Figma to Code converting a Figma selection into multiple code targets",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Figma to Code — Fast, flexible and private",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: gitPreview.src,
        alt: "Figma to Code converting a Figma selection into multiple code targets",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
