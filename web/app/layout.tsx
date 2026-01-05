import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Figma to Code – Generate Production-Ready Code from Figma",
  description:
    "Transform Figma designs into clean HTML, Tailwind, Flutter, SwiftUI, and Compose code. The most powerful Figma plugin for developers.",
  metadataBase: new URL("https://figmatocode.com"),
  openGraph: {
    type: "website",
    url: "https://figmatocode.com",
    title: "Figma to Code – Design to Production",
    description:
      "Transform Figma designs into clean, production-ready code for 5 frameworks.",
    images: [{ url: "/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Figma to Code",
    description: "Transform Figma designs into production-ready code.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(outfit.variable, "antialiased min-h-screen")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
