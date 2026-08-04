import { describe, expect, it } from "vitest";
import { strFromU8, unzipSync } from "fflate";
import {
  extractProjectImageNodeIds,
  generateProjectZip,
  replaceProjectImagePlaceholders,
} from "./zipGenerator";
import type { ProjectImage } from "./zipGenerator";

const image: ProjectImage = {
  bytes: new Uint8Array([1, 2, 3]),
  name: "hero-12-34.png",
  nodeId: "12:34",
};
const placeholder = "__FIGMA_IMAGE_12%3A34__";

const unzipProject = (zip: Uint8Array) => {
  const files = unzipSync(zip);
  return {
    files,
    text: (path: string) => strFromU8(files[path]),
    json: <T>(path: string) => JSON.parse(strFromU8(files[path])) as T,
  };
};

describe("project image references", () => {
  it("extracts and deduplicates encoded Figma node IDs", () => {
    expect([
      ...extractProjectImageNodeIds(`<img src="${placeholder}">${placeholder}`),
    ]).toEqual(["12:34"]);
  });

  it("uses AssetImage for Flutter assets", () => {
    expect(
      replaceProjectImagePlaceholders(
        `DecorationImage(image: NetworkImage("${placeholder}"))`,
        [image],
        "flutter",
      ),
    ).toBe(
      'DecorationImage(image: AssetImage("assets/images/hero-12-34.png"))',
    );
  });

  it.each([
    ["html", "images/hero-12-34.png"],
    ["nextjs", "/images/hero-12-34.png"],
    ["vite", "/images/hero-12-34.png"],
    ["swiftui", "hero-12-34"],
  ] as const)("resolves %s image paths", (format, expectedPath) => {
    expect(
      replaceProjectImagePlaceholders(
        `Image("${placeholder}")`,
        [image],
        format,
      ),
    ).toBe(`Image("${expectedPath}")`);
  });

  it("fails instead of substituting an unrelated image", () => {
    expect(() =>
      replaceProjectImagePlaceholders(`<img src="${placeholder}">`, [], "html"),
    ).toThrow("Missing exported image for Figma node 12:34");
  });
});

describe("generated project archives", () => {
  it("creates a self-contained HTML project", () => {
    const project = unzipProject(
      generateProjectZip(
        '<img src="images/hero-12-34.png">',
        "HTML",
        [image],
        "html",
        "landing-page",
      ),
    );

    expect(project.text("landing-page/index.html")).toContain(
      '<img src="images/hero-12-34.png">',
    );
    expect(project.files["landing-page/images/hero-12-34.png"]).toEqual(
      image.bytes,
    );
    expect(project.text("landing-page/README.md")).toContain(
      "This export has no runtime dependencies and works offline.",
    );
  });

  it("creates Vite and Next.js projects with current, reproducible manifests", () => {
    const jsx = '<div className="p-4" style={{ color: "red" }}>Hello</div>';
    const vite = unzipProject(
      generateProjectZip(jsx, "Tailwind", [image], "vite", "dashboard"),
    );
    const next = unzipProject(
      generateProjectZip(jsx, "Tailwind", [image], "nextjs", "dashboard"),
    );

    expect(vite.text("src/App.tsx")).toContain(jsx);
    expect(vite.text("src/App.tsx")).not.toContain('style="');
    expect(vite.text("package.json")).not.toContain('"latest"');
    expect(vite.files["public/images/hero-12-34.png"]).toEqual(image.bytes);

    expect(next.text("app/page.tsx")).toContain(jsx);
    expect(next.text("package.json")).not.toContain('"latest"');
    expect(next.files["postcss.config.mjs"]).toBeDefined();
    expect(next.files["public/images/hero-12-34.png"]).toEqual(image.bytes);

    const vitePackage = vite.json<{
      engines: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
      scripts: Record<string, string>;
    }>("package.json");
    expect(vitePackage.engines).toEqual({ node: ">=24", pnpm: "^11" });
    expect(vitePackage.dependencies).toMatchObject({
      react: "^19.2.8",
      "react-dom": "^19.2.8",
    });
    expect(vitePackage.devDependencies).toMatchObject({
      "@tailwindcss/vite": "^4.3.3",
      "@typescript/native": "npm:typescript@^7.0.2",
      "@vitejs/plugin-react": "^6.0.5",
      tailwindcss: "4.3.3",
      typescript: "npm:@typescript/typescript6@^6.0.2",
      vite: "^8.2.0",
    });
    expect(vitePackage.scripts.typecheck).toBe("tsc --noEmit");
    expect(vite.text("README.md")).toContain("pnpm typecheck");
    expect(vite.text("tsconfig.json")).toContain('"vite/client"');

    const nextPackage = next.json<{
      engines: Record<string, string>;
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
      scripts: Record<string, string>;
    }>("package.json");
    expect(nextPackage.engines).toEqual({ node: ">=24", pnpm: "^11" });
    expect(nextPackage.dependencies).toMatchObject({
      next: "^16.2.12",
      react: "^19.2.8",
      "react-dom": "^19.2.8",
    });
    expect(nextPackage.devDependencies).toMatchObject({
      "@tailwindcss/postcss": "^4.3.3",
      "@types/node": "^26.1.2",
      "@typescript/native": "npm:typescript@^7.0.2",
      postcss: "^8.5.25",
      tailwindcss: "4.3.3",
      typescript: "npm:@typescript/typescript6@^6.0.2",
    });
    expect(nextPackage.scripts.typecheck).toBe("tsc --noEmit");
    expect(next.text("README.md")).toContain("pnpm build");
    expect(next.text("pnpm-workspace.yaml")).toContain("sharp: true");
    expect(next.text("tsconfig.json")).toContain('"jsx": "react-jsx"');
    expect(next.text("tsconfig.json")).toContain(".next/dev/types/**/*.ts");
  });

  it("creates Flutter and SwiftUI asset structures referenced by source", () => {
    const flutter = unzipProject(
      generateProjectZip(
        'const AssetImage("assets/images/hero-12-34.png")',
        "Flutter",
        [image],
        "flutter",
        "mobile-app",
      ),
    );
    const swiftui = unzipProject(
      generateProjectZip(
        'Image("hero-12-34")',
        "SwiftUI",
        [image],
        "swiftui",
        "mobile-app",
      ),
    );

    expect(flutter.text("lib/main.dart")).toContain(
      'AssetImage("assets/images/hero-12-34.png")',
    );
    expect(flutter.text("pubspec.yaml")).toContain("- assets/images/");
    expect(flutter.files["assets/images/hero-12-34.png"]).toEqual(image.bytes);
    expect(flutter.text("README.md")).toContain("flutter pub get");

    expect(swiftui.text("mobile-app/ContentView.swift")).toContain(
      'Image("hero-12-34")',
    );
    expect(
      swiftui.files[
        "mobile-app/Assets.xcassets/hero-12-34.imageset/hero-12-34.png"
      ],
    ).toEqual(image.bytes);
    expect(
      swiftui.text(
        "mobile-app/Assets.xcassets/hero-12-34.imageset/Contents.json",
      ),
    ).toContain('"filename": "hero-12-34.png"');
    expect(swiftui.text("mobile-app/README.md")).toContain(
      "Review previews, accessibility labels, dynamic type",
    );
  });
});
