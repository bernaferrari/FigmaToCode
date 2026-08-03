import { zipSync } from "fflate";
import type { DownloadProjectFormat } from "types";

export interface ProjectImage {
  name: string;
  bytes: Uint8Array;
  nodeId: string;
}

const IMAGE_PLACEHOLDER_PATTERN = /__FIGMA_IMAGE_(.*?)__/g;

const removeExtension = (fileName: string) => fileName.replace(/\.[^.]+$/, "");
const toPackageName = (rootName: string) =>
  (rootName || "figma-export")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "figma-export";
const toDartPackageName = (rootName: string) =>
  toPackageName(rootName).replace(/-/g, "_");

const encodeText = (text: string): Uint8Array => {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(text);
  }

  const utf8 = unescape(encodeURIComponent(text));
  const bytes = new Uint8Array(utf8.length);
  for (let i = 0; i < utf8.length; i += 1) {
    bytes[i] = utf8.charCodeAt(i);
  }
  return bytes;
};

const writeJson = (value: unknown) =>
  encodeText(JSON.stringify(value, null, 2));

const isTailwindProject = (framework: string) => framework === "Tailwind";

const getImagePath = (
  image: ProjectImage,
  format: DownloadProjectFormat,
): string => {
  if (format === "flutter") {
    return `assets/images/${image.name}`;
  }
  if (format === "swiftui") {
    return removeExtension(image.name);
  }
  if (format === "html") {
    return `images/${image.name}`;
  }
  return `/images/${image.name}`;
};

export const extractProjectImageNodeIds = (code: string): Set<string> => {
  const nodeIds = new Set<string>();
  for (const match of code.matchAll(IMAGE_PLACEHOLDER_PATTERN)) {
    nodeIds.add(decodeURIComponent(match[1]));
  }
  return nodeIds;
};

export const replaceProjectImagePlaceholders = (
  code: string,
  images: ProjectImage[],
  format: DownloadProjectFormat,
): string => {
  const imagesByNodeId = new Map(images.map((image) => [image.nodeId, image]));
  const resolveImage = (encodedNodeId: string): ProjectImage => {
    const nodeId = decodeURIComponent(encodedNodeId);
    const image = imagesByNodeId.get(nodeId);
    if (!image) {
      throw new Error(`Missing exported image for Figma node ${nodeId}.`);
    }
    return image;
  };

  let replacedCode = code;
  if (format === "flutter") {
    replacedCode = replacedCode.replace(
      /NetworkImage\("__FIGMA_IMAGE_(.*?)__"\)/g,
      (_match, encodedNodeId: string) =>
        `AssetImage("${getImagePath(resolveImage(encodedNodeId), format)}")`,
    );
  }

  replacedCode = replacedCode.replace(
    IMAGE_PLACEHOLDER_PATTERN,
    (_match, encodedNodeId: string) =>
      getImagePath(resolveImage(encodedNodeId), format),
  );

  if (replacedCode.includes("__FIGMA_IMAGE_")) {
    throw new Error("Failed to resolve every exported image reference.");
  }

  return replacedCode;
};

export function generateProjectZip(
  code: string,
  framework: string,
  images: ProjectImage[],
  format: DownloadProjectFormat,
  rootName = "figma-export",
): Uint8Array {
  const files: Record<string, Uint8Array> = {};
  const usesTailwind = isTailwindProject(framework);
  const rootDir = rootName || "figma-export";
  const packageName = toPackageName(rootDir);

  if (format === "flutter") {
    files["pubspec.yaml"] = encodeText(`name: ${toDartPackageName(rootDir)}
description: Generated from Figma
publish_to: "none"
version: 0.0.1

environment:
  sdk: ">=3.0.0 <4.0.0"

dependencies:
  flutter:
    sdk: flutter

dev_dependencies:
  flutter_test:
    sdk: flutter

flutter:
  uses-material-design: true
  assets:
    - assets/images/
`);

    files["lib/main.dart"] = encodeText(code);
  } else if (format === "swiftui") {
    files[`${rootDir}/Assets.xcassets/Contents.json`] = writeJson({
      info: {
        author: "xcode",
        version: 1,
      },
    });
    files[`${rootDir}/README.md`] = encodeText(`# ${rootDir} SwiftUI Source

This export contains SwiftUI source files and image assets.

To use it in Xcode:

1. Create a new iOS app project using the SwiftUI interface.
2. Drag \`ContentView.swift\` into your app target and replace the generated ContentView.
3. Drag \`Assets.xcassets\` into the project, or copy the image sets into your existing asset catalog.

This ZIP intentionally does not include an \`.xcodeproj\` file because generated Xcode project metadata is brittle across Xcode versions.
`);
    files[`${rootDir}/ContentView.swift`] = encodeText(code);
  } else if (format === "html") {
    files[`${rootDir}/index.html`] = encodeText(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Figma Export</title>
    ${
      usesTailwind
        ? '<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>'
        : ""
    }
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      img { max-width: 100%; height: auto; }
    </style>
  </head>
  <body>
    ${code}
  </body>
</html>
`);
  } else if (format === "nextjs") {
    files["package.json"] = writeJson({
      name: packageName,
      private: true,
      version: "0.0.1",
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
      },
      dependencies: {
        next: "^16.2.6",
        react: "^19.2.6",
        "react-dom": "^19.2.6",
      },
      devDependencies: {
        "@types/node": "^25.7.0",
        "@types/react": "^19.2.14",
        "@types/react-dom": "^19.2.3",
        typescript: "^6.0.3",
        ...(usesTailwind
          ? {
              "@tailwindcss/postcss": "^4.3.0",
              tailwindcss: "4.3.0",
              postcss: "^8.5.14",
            }
          : {}),
      },
    });

    files["next.config.ts"] =
      encodeText(`import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
`);

    files["tsconfig.json"] = writeJson({
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "ES6"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: { "@/*": ["./*"] },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    });

    files["app/globals.css"] = encodeText(
      usesTailwind
        ? `@import "tailwindcss";

img { max-width: 100%; height: auto; }
`
        : `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

img { max-width: 100%; height: auto; }
`,
    );

    if (usesTailwind) {
      files["postcss.config.mjs"] = encodeText(
        `export default { plugins: ["@tailwindcss/postcss"] };
`,
      );
    }

    files["app/layout.tsx"] = encodeText(`import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Figma Export",
  description: "Generated from Figma",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`);

    const mainAttributes = usesTailwind
      ? ' className="container mx-auto p-4"'
      : "";
    files["app/page.tsx"] = encodeText(`export default function Page() {
  return (
    <main${mainAttributes}>
      ${code}
    </main>
  );
}
`);
  } else {
    files["package.json"] = writeJson({
      name: packageName,
      private: true,
      version: "0.0.1",
      scripts: {
        dev: "vite",
        build: "vite build",
        preview: "vite preview",
      },
      dependencies: {
        react: "^19.2.6",
        "react-dom": "^19.2.6",
      },
      devDependencies: {
        "@types/react": "^19.2.14",
        "@types/react-dom": "^19.2.3",
        "@vitejs/plugin-react": "^6.0.1",
        typescript: "^6.0.3",
        vite: "^8.0.12",
        ...(usesTailwind
          ? {
              "@tailwindcss/vite": "^4.3.0",
              tailwindcss: "4.3.0",
            }
          : {}),
      },
    });

    files["index.html"] = encodeText(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Figma Export</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`);

    files["src/main.tsx"] = encodeText(`import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
${usesTailwind ? 'import "./index.css";' : ""}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
`);

    const mainAttributes = usesTailwind
      ? ' className="container mx-auto p-4"'
      : "";
    files["src/App.tsx"] = encodeText(`export default function App() {
  return (
    <main${mainAttributes}>
      ${code}
    </main>
  );
}
`);

    files["vite.config.ts"] = encodeText(
      usesTailwind
        ? `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
`
        : `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
`,
    );

    files["tsconfig.json"] = writeJson({
      compilerOptions: {
        jsx: "react-jsx",
        moduleResolution: "bundler",
        target: "ES2020",
        module: "ESNext",
        strict: true,
        skipLibCheck: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
      },
      include: ["src"],
    });

    if (usesTailwind) {
      files["src/index.css"] = encodeText(`@import "tailwindcss";

img { max-width: 100%; height: auto; }
`);
    }
  }

  for (const image of images) {
    if (format === "flutter") {
      files[`assets/images/${image.name}`] = image.bytes;
    } else if (format === "swiftui") {
      const assetName = removeExtension(image.name);
      files[`${rootDir}/Assets.xcassets/${assetName}.imageset/${image.name}`] =
        image.bytes;
      files[`${rootDir}/Assets.xcassets/${assetName}.imageset/Contents.json`] =
        writeJson({
          images: [
            {
              filename: image.name,
              idiom: "universal",
              scale: "1x",
            },
            {
              idiom: "universal",
              scale: "2x",
            },
            {
              idiom: "universal",
              scale: "3x",
            },
          ],
          info: {
            author: "xcode",
            version: 1,
          },
        });
    } else if (format === "html") {
      files[`${rootDir}/images/${image.name}`] = image.bytes;
    } else {
      files[`public/images/${image.name}`] = image.bytes;
    }
  }

  try {
    return zipSync(files, { level: 6 });
  } catch (error) {
    console.error("Zip creation failed:", error);
    throw new Error(
      "Failed to create project archive. The project might be too large or complex.",
    );
  }
}
