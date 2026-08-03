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
  });

  it("creates Vite and Next.js projects from JSX without floating dependencies", () => {
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
  });
});
