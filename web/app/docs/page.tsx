import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Lightbulb,
  Download,
  Layers,
  Settings,
  Palette,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function DocsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-32 pb-24 px-6 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-12 transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="mr-2 group-hover:-translate-x-1 transition-transform"
            />
            Back to Home
          </Link>

          <header className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Getting Started
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Learn how to use Figma to Code to transform your designs into
              production-ready code.
            </p>
          </header>

          <article className="prose prose-neutral dark:prose-invert prose-lg max-w-none">
            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-violet-500/10 text-violet-500">
                  <Download size={24} />
                </div>
                <h2 className="text-2xl font-bold m-0">Installation</h2>
              </div>

              <div className="glass p-6 not-prose mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">
                      Install from Figma Community
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Free plugin for Figma Desktop & Web
                    </p>
                  </div>
                  <Button asChild>
                    <a
                      href="https://www.figma.com/community/plugin/842128343887142055"
                      target="_blank"
                    >
                      Install Plugin
                    </a>
                  </Button>
                </div>
              </div>

              <p>
                Click the install button on the Figma Community page. Once
                installed, open any Figma file and run the plugin via{" "}
                <strong>Plugins → Figma to Code</strong> or use the keyboard
                shortcut.
              </p>
            </section>

            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500">
                  <Layers size={24} />
                </div>
                <h2 className="text-2xl font-bold m-0">Basic Usage</h2>
              </div>

              <ol className="space-y-2">
                <li>Select any frame, component, or group in your design</li>
                <li>Run the Figma to Code plugin</li>
                <li>Choose your target framework (HTML, Tailwind, Flutter, etc.)</li>
                <li>Copy the generated code to your project</li>
              </ol>

              <div className="not-prose glass p-4 my-6 mt-8 flex gap-4 items-start border-l-4 border-l-green-500">
                <CheckCircle2
                  className="text-green-500 shrink-0 mt-0.5"
                  size={20}
                />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">
                    Pro Tip: Use Auto-Layout
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Designs using Figma's Auto-Layout produce the best results.
                    The plugin converts auto-layout to flexbox (web) or
                    Row/Column widgets (Flutter/SwiftUI).
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Settings size={24} />
                </div>
                <h2 className="text-2xl font-bold m-0">Output Modes</h2>
              </div>

              <p>
                Each framework supports multiple output modes to match your
                workflow:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
                <div className="p-4 rounded-lg border border-border bg-card">
                  <h4 className="font-semibold mb-1">Tailwind CSS</h4>
                  <p className="text-sm text-muted-foreground">
                    HTML, React JSX, Svelte, Twig
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <h4 className="font-semibold mb-1">HTML + CSS</h4>
                  <p className="text-sm text-muted-foreground">
                    Inline CSS, External CSS, styled-components
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <h4 className="font-semibold mb-1">Flutter</h4>
                  <p className="text-sm text-muted-foreground">
                    Full App, Widget, Snippet
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-card">
                  <h4 className="font-semibold mb-1">SwiftUI</h4>
                  <p className="text-sm text-muted-foreground">
                    Preview, Struct, Snippet
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-fuchsia-500/10 text-fuchsia-500">
                  <Palette size={24} />
                </div>
                <h2 className="text-2xl font-bold m-0">Key Features</h2>
              </div>

              <ul className="space-y-4 not-prose">
                <li className="flex gap-3">
                  <CheckCircle2
                    className="text-green-500 shrink-0 mt-1"
                    size={18}
                  />
                  <div>
                    <strong className="font-medium">Color Variables</strong>
                    <p className="text-sm text-muted-foreground">
                      Export using Figma's design tokens instead of hardcoded hex
                      values
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2
                    className="text-green-500 shrink-0 mt-1"
                    size={18}
                  />
                  <div>
                    <strong className="font-medium">Layer Names as Classes</strong>
                    <p className="text-sm text-muted-foreground">
                      Preserve meaningful layer names as CSS class names or
                      component names
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2
                    className="text-green-500 shrink-0 mt-1"
                    size={18}
                  />
                  <div>
                    <strong className="font-medium">Smart Rounding</strong>
                    <p className="text-sm text-muted-foreground">
                      Automatically snap arbitrary values to Tailwind's design
                      scale (17px → 4)
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2
                    className="text-green-500 shrink-0 mt-1"
                    size={18}
                  />
                  <div>
                    <strong className="font-medium">Image Embedding</strong>
                    <p className="text-sm text-muted-foreground">
                      Convert images to Base64 for instant preview or export as
                      external files
                    </p>
                  </div>
                </li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Lightbulb size={24} />
                </div>
                <h2 className="text-2xl font-bold m-0">Best Practices</h2>
              </div>

              <div className="not-prose glass p-6 bg-muted/30 space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">Use Auto-Layout</h4>
                  <p className="text-sm text-muted-foreground">
                    Auto-layout frames produce responsive flexbox code. Absolute
                    positioning is used as a fallback but may require manual
                    adjustments.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Name Your Layers</h4>
                  <p className="text-sm text-muted-foreground">
                    Descriptive layer names become readable class names and
                    variable names in your generated code.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Use Components</h4>
                  <p className="text-sm text-muted-foreground">
                    Figma components help the plugin identify reusable patterns
                    and generate cleaner, DRY code.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Set Constraints</h4>
                  <p className="text-sm text-muted-foreground">
                    Proper constraints help generate responsive layouts that
                    adapt to different screen sizes.
                  </p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
