"use client";

import { PluginUI } from "plugin-ui";
import Image from "next/image";
import { useState } from "react";
import type { Framework, HTMLPreview, PluginSettings } from "types";
import roundIcon from "../../../assets/icon_round.png";
import { cn } from "../lib/utils";

const defaultSettings: PluginSettings = {
  framework: "HTML",
  showLayerNames: false,
  useOldPluginVersion2025: false,
  responsiveRoot: false,
  flutterGenerationMode: "snippet",
  swiftUIGenerationMode: "snippet",
  composeGenerationMode: "snippet",
  roundTailwindValues: true,
  roundTailwindColors: true,
  useColorVariables: true,
  customTailwindPrefix: "",
  embedImages: false,
  embedVectors: false,
  htmlGenerationMode: "html",
  tailwindGenerationMode: "jsx",
  baseFontSize: 16,
  useTailwind4: true,
  thresholdPercent: 15,
  baseFontFamily: "",
  fontFamilyCustomConfig: {},
};

const htmlMarkup = `<article class="feature-card">
  <span class="feature-card__label">New</span>
  <h2>Ship the design, not the cleanup</h2>
  <p>Start with a responsive structure generated from your Figma selection.</p>
  <a href="/docs">Explore the workflow</a>
</article>`;

const flutterSnippet = `Container(
  padding: const EdgeInsets.all(32),
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(24),
  ),
  child: const Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text('New'),
      Text('Ship the design, not the cleanup'),
    ],
  ),
)`;

const swiftUISnippet = `VStack(alignment: .leading, spacing: 16) {
  Text("New")
    .font(.subheadline.weight(.medium))
    .foregroundStyle(.green)

  Text("Ship the design, not the cleanup")
    .font(.title.weight(.semibold))
}
.padding(32)
.background(.white, in: RoundedRectangle(cornerRadius: 24))`;

function indent(code: string, spaces = 2) {
  const padding = " ".repeat(spaces);
  return code
    .split("\n")
    .map((line) => `${padding}${line}`)
    .join("\n");
}

function getHTMLSample(settings: PluginSettings) {
  const className = settings.showLayerNames
    ? "feature-card figma-feature-card"
    : "feature-card";
  const markup = htmlMarkup.replace(
    'class="feature-card"',
    `class="${className}"`,
  );

  switch (settings.htmlGenerationMode) {
    case "jsx":
      return `export function FeatureCard() {
  return (
${indent(markup.replaceAll("class=", "className="), 4)}
  );
}`;
    case "svelte":
      return `<script lang="ts">
  const label = "New";
</script>

${markup.replace(">New</span>", ">{label}</span>")}`;
    case "styled-components":
      return `import styled from "styled-components";

const Card = styled.article\`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
  border-radius: 1.5rem;
\`;

export function FeatureCard() {
  return (
    <Card>
      <span>New</span>
      <h2>Ship the design, not the cleanup</h2>
    </Card>
  );
}`;
    default:
      return markup;
  }
}

function getTailwindSample(settings: PluginSettings) {
  const mode = settings.tailwindGenerationMode;
  const attribute = mode === "jsx" ? "className" : "class";
  const padding = settings.roundTailwindValues ? "p-8" : "p-[31px]";
  const radius = settings.roundTailwindValues
    ? "rounded-3xl"
    : "rounded-[23px]";
  const surface = settings.useColorVariables ? "bg-background" : "bg-white";
  const accent = settings.roundTailwindColors
    ? "bg-emerald-50 text-emerald-700"
    : "bg-[#e7f8ec] text-[#287a45]";
  const layerName = settings.showLayerNames ? "figma-FeatureCard " : "";
  const label = mode === "twig" ? "{{ badge_label }}" : "New";

  return `<article ${attribute}="${layerName}flex max-w-md flex-col gap-4 ${radius} ${surface} ${padding} shadow-sm ring-1 ring-black/5">
  <span ${attribute}="w-fit rounded-full ${accent} px-3 py-1 text-sm font-medium">${label}</span>
  <h2 ${attribute}="text-balance text-3xl font-semibold tracking-tight text-slate-950">Ship the design, not the cleanup</h2>
  <p ${attribute}="text-pretty leading-7 text-slate-600">Start with a responsive structure generated from your Figma selection.</p>
</article>`;
}

function getFlutterSample(settings: PluginSettings) {
  switch (settings.flutterGenerationMode) {
    case "stateless":
      return `class FeatureCard extends StatelessWidget {
  const FeatureCard({super.key});

  @override
  Widget build(BuildContext context) {
    return
${indent(flutterSnippet, 6)};
  }
}`;
    case "fullApp":
      return `import 'package:flutter/material.dart';

void main() => runApp(const DesignPreview());

class DesignPreview extends StatelessWidget {
  const DesignPreview({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        body: Center(
          child:
${indent(flutterSnippet, 12)},
        ),
      ),
    );
  }
}`;
    default:
      return flutterSnippet;
  }
}

function getSwiftUISample(settings: PluginSettings) {
  const featureCard = `struct FeatureCard: View {
  var body: some View {
${indent(swiftUISnippet, 4)}
  }
}`;

  switch (settings.swiftUIGenerationMode) {
    case "struct":
      return `import SwiftUI

${featureCard}`;
    case "preview":
      return `import SwiftUI

${featureCard}

#Preview {
  FeatureCard()
    .padding()
}`;
    default:
      return swiftUISnippet;
  }
}

function getSampleCode(framework: Framework, settings: PluginSettings) {
  switch (framework) {
    case "HTML":
      return getHTMLSample(settings);
    case "Tailwind":
      return getTailwindSample(settings);
    case "Flutter":
      return getFlutterSample(settings);
    case "SwiftUI":
      return getSwiftUISample(settings);
    default:
      return "";
  }
}

const samplePreview: HTMLPreview = {
  size: { width: 360, height: 220 },
  content: `<section style="box-sizing:border-box;width:360px;height:220px;padding:24px;border-radius:24px;background:#f5f7f3;color:#172019;font-family:Inter,Arial,sans-serif;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden">
  <div style="display:flex;align-items:center;justify-content:space-between">
    <span style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#38754c">Component library</span>
    <span style="width:30px;height:30px;border-radius:10px;background:#d8f2df;display:grid;place-items:center;font-size:15px;color:#27653c">↗</span>
  </div>
  <div>
    <h2 style="max-width:260px;margin:0;font-size:28px;line-height:1.05;letter-spacing:-.04em">Build once. Stay consistent.</h2>
    <p style="max-width:280px;margin:10px 0 0;color:#68726a;font-size:13px;line-height:1.45">Reusable patterns ready for your next product surface.</p>
  </div>
  <div style="display:flex;align-items:center;justify-content:space-between">
    <span style="font-size:12px;color:#68726a">24 components</span>
    <span style="border-radius:9px;background:#172019;padding:9px 13px;color:white;font-size:12px;font-weight:650">Explore library</span>
  </div>
</section>`,
};

type PreviewState = "ready" | "warning" | "empty";
type PreviewTheme = "light" | "dark";

const previewStates: { value: PreviewState; label: string }[] = [
  { value: "ready", label: "Generated" },
  { value: "warning", label: "With warning" },
  { value: "empty", label: "Empty" },
];

const previewThemes: { value: PreviewTheme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export default function PreviewLab() {
  const [selectedFramework, setSelectedFramework] = useState<Framework>("HTML");
  const [previewState, setPreviewState] = useState<PreviewState>("ready");
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>("light");
  const [settings, setSettings] = useState<PluginSettings>(defaultSettings);

  const code =
    previewState === "empty" ? "" : getSampleCode(selectedFramework, settings);
  const warnings =
    previewState === "warning"
      ? ["Image fills are exported as project assets"]
      : [];

  const handlePreferenceChanged = (
    key: keyof PluginSettings,
    value: PluginSettings[keyof PluginSettings],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const handleFrameworkChanged = (framework: Framework) => {
    setSelectedFramework(framework);
    setSettings((current) => ({ ...current, framework }));
  };

  return (
    <div className="isolate mx-auto grid max-w-[82rem] grid-cols-1 overflow-hidden rounded-2xl bg-[oklch(0.955_0.007_154)] shadow-[0_0_0_1px_oklch(0.18_0.02_154/7%),0_2px_4px_oklch(0_0_0/6%),0_24px_55px_-22px_oklch(0.18_0.03_154/22%),0_52px_100px_-44px_oklch(0.18_0.03_154/18%)] md:rounded-[1.6rem] min-[68rem]:grid-cols-[17.5rem_minmax(0,1fr)] dark:bg-[oklch(0.135_0.014_154)]">
      <aside
        className="flex min-w-0 flex-col bg-[oklch(0.16_0.018_154)] p-4.5 text-[oklch(0.96_0.007_154)] md:grid md:grid-cols-[minmax(13rem,0.7fr)_minmax(0,1.3fr)] md:gap-x-8 md:gap-y-6 md:p-5.5 min-[68rem]:flex min-[68rem]:p-5.5"
        aria-label="Preview controls"
      >
        <div>
          <span className="inline-flex items-center gap-2 font-mono text-[0.68rem] font-[680] tracking-[0.08em] text-[oklch(0.76_0.14_151)] uppercase">
            <span
              className="size-1.5 rounded-full bg-current shadow-[0_0_0_0.22rem_oklch(0.71_0.16_151/10%)]"
              aria-hidden="true"
            />{" "}
            Interactive preview
          </span>
          <h3 className="mt-4 text-[1.4rem] font-[650] tracking-[-0.035em]">
            Test the interface
          </h3>
          <p className="mt-2 text-[0.78rem] leading-[1.55] text-[oklch(0.7_0.015_154)]">
            Change the conditions and inspect the plugin in place.
          </p>
        </div>

        <div className="mt-7 grid flex-1 grid-cols-1 gap-4 md:mt-0 md:grid-cols-2 min-[68rem]:mt-9 min-[68rem]:flex min-[68rem]:flex-col min-[68rem]:gap-6">
          <section
            className="flex flex-col gap-3"
            aria-labelledby="theme-control-label"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-[0.6rem] border border-[oklch(0.35_0.015_154)] bg-[oklch(0.2_0.018_154)] text-[oklch(0.78_0.08_151)] [&_svg]:size-4 [&_svg]:stroke-current [&_svg]:stroke-[1.55]"
                aria-hidden="true"
              >
                <AppearanceIcon />
              </span>
              <div>
                <h4
                  className="text-[0.78rem] font-[640] text-[oklch(0.94_0.008_154)]"
                  id="theme-control-label"
                >
                  Appearance
                </h4>
                <p className="mt-0.5 text-[0.66rem] text-[oklch(0.63_0.012_154)]">
                  Interface theme
                </p>
              </div>
            </div>
            <div
              className="flex gap-1 rounded-xl border border-[oklch(0.3_0.015_154)] bg-[oklch(0.125_0.014_154)] p-1"
              aria-label="Choose a preview theme"
            >
              {previewThemes.map((theme) => (
                <button
                  className={cn(
                    "flex min-h-10.5 min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-3 text-[0.74rem] font-[610] transition-[background-color,color,transform] duration-150 active:scale-[0.96]",
                    previewTheme === theme.value
                      ? "bg-[oklch(0.28_0.025_154)] text-white shadow-[0_1px_1px_oklch(0_0_0/20%),inset_0_0_0_1px_oklch(1_0_0/4%)]"
                      : "bg-transparent text-[oklch(0.69_0.015_154)] hover:bg-[oklch(0.2_0.018_154)] hover:text-[oklch(0.94_0.008_154)]",
                  )}
                  data-active={previewTheme === theme.value}
                  type="button"
                  key={theme.value}
                  onClick={() => setPreviewTheme(theme.value)}
                  aria-pressed={previewTheme === theme.value}
                >
                  {theme.label}
                </button>
              ))}
            </div>
          </section>

          <section
            className="flex flex-col gap-3"
            aria-labelledby="state-control-label"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="grid size-8 shrink-0 place-items-center rounded-[0.6rem] border border-[oklch(0.35_0.015_154)] bg-[oklch(0.2_0.018_154)] text-[oklch(0.78_0.08_151)] [&_svg]:size-4 [&_svg]:stroke-current [&_svg]:stroke-[1.55]"
                aria-hidden="true"
              >
                <StateIcon />
              </span>
              <div>
                <h4
                  className="text-[0.78rem] font-[640] text-[oklch(0.94_0.008_154)]"
                  id="state-control-label"
                >
                  Content state
                </h4>
                <p className="mt-0.5 text-[0.66rem] text-[oklch(0.63_0.012_154)]">
                  Test the output
                </p>
              </div>
            </div>
            <div
              className="flex flex-col gap-1 rounded-xl border border-[oklch(0.3_0.015_154)] bg-[oklch(0.125_0.014_154)] p-1"
              aria-label="Choose a preview state"
            >
              {previewStates.map((state) => (
                <button
                  className={cn(
                    "flex min-h-10.5 min-w-0 flex-1 items-center justify-between gap-2 rounded-lg px-3 text-[0.74rem] font-[610] transition-[background-color,color,transform] duration-150 active:scale-[0.96] [&_svg]:size-3.5 [&_svg]:stroke-2",
                    previewState === state.value
                      ? "bg-[oklch(0.28_0.025_154)] text-white shadow-[0_1px_1px_oklch(0_0_0/20%),inset_0_0_0_1px_oklch(1_0_0/4%)] [&_svg]:opacity-100"
                      : "bg-transparent text-[oklch(0.69_0.015_154)] hover:bg-[oklch(0.2_0.018_154)] hover:text-[oklch(0.94_0.008_154)] [&_svg]:opacity-0",
                  )}
                  data-active={previewState === state.value}
                  type="button"
                  key={state.value}
                  onClick={() => setPreviewState(state.value)}
                  aria-pressed={previewState === state.value}
                >
                  <span>{state.label}</span>
                  <CheckIcon />
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-8 flex items-end justify-between gap-4 border-t border-[oklch(0.3_0.015_154)] pt-4 md:col-span-full md:mt-0 min-[68rem]:mt-8">
          <div className="flex flex-col gap-0.5">
            <span className="text-[0.64rem] text-[oklch(0.62_0.012_154)]">
              Current target
            </span>
            <strong className="text-[0.78rem] font-[650]">
              {selectedFramework}
            </strong>
          </div>
        </div>
      </aside>

      <div className="min-w-0 bg-[oklch(0.95_0.007_154)] dark:bg-[oklch(0.13_0.014_154)]">
        <div className="flex min-h-15 items-center justify-between gap-4 border-b border-site-border bg-[oklch(0.985_0.004_154)] px-[clamp(1rem,2vw,1.4rem)] dark:bg-[oklch(0.17_0.016_154)]">
          <div className="flex items-center gap-3">
            <span
              className="grid size-8 shrink-0 place-items-center rounded-[0.58rem] border border-site-border bg-white text-site-muted shadow-sm dark:bg-[oklch(0.21_0.016_154)] [&_svg]:size-4 [&_svg]:stroke-current [&_svg]:stroke-[1.55]"
              aria-hidden="true"
            >
              <PreviewIcon />
            </span>
            <strong className="text-[0.78rem] font-[650] text-site-ink">
              Plugin preview
            </strong>
          </div>
          <span className="rounded-full border border-site-border bg-white px-2.5 py-1.5 text-[0.66rem] font-[590] text-site-muted tabular-nums dark:bg-[oklch(0.21_0.016_154)]">
            760 × 656
          </span>
        </div>

        <div className="grid min-h-0 place-items-center bg-[linear-gradient(var(--site-border)_1px,transparent_1px),linear-gradient(90deg,var(--site-border)_1px,transparent_1px)] bg-size-[1.1rem_1.1rem] p-2.5 md:min-h-180 md:bg-size-[1.5rem_1.5rem] md:p-[clamp(1rem,2.5vw,2rem)]">
          <PluginPreview
            theme={previewTheme}
            code={code}
            warnings={warnings}
            settings={settings}
            selectedFramework={selectedFramework}
            setSelectedFramework={handleFrameworkChanged}
            onPreferenceChanged={handlePreferenceChanged}
          />
        </div>
      </div>
    </div>
  );
}

type PluginPreviewProps = {
  theme: "light" | "dark";
  code: string;
  warnings: string[];
  settings: PluginSettings;
  selectedFramework: Framework;
  setSelectedFramework: (framework: Framework) => void;
  onPreferenceChanged: (
    key: keyof PluginSettings,
    value: PluginSettings[keyof PluginSettings],
  ) => void;
};

function PluginPreview({
  theme,
  code,
  warnings,
  settings,
  selectedFramework,
  setSelectedFramework,
  onPreferenceChanged,
}: PluginPreviewProps) {
  const isDark = theme === "dark";

  return (
    <article
      className={cn(
        "min-w-0 w-full max-w-190 overflow-hidden rounded-2xl shadow-[0_1px_2px_oklch(0_0_0/8%),0_12px_32px_oklch(0.18_0.03_154/12%),0_30px_60px_oklch(0.18_0.03_154/7%)]",
        isDark
          ? "border border-[oklch(0.1_0.01_154)] bg-[oklch(0.205_0.015_154)]"
          : "border border-[oklch(0.18_0.02_154/11%)] bg-[oklch(0.965_0.006_145)]",
      )}
      data-theme={theme}
    >
      <div
        className={cn(
          "overflow-hidden bg-white",
          isDark && "bg-[oklch(0.12_0.04_266.7)]",
        )}
      >
        <div className="flex h-10 items-center gap-2 bg-[oklch(0.19_0.008_154)] px-3 text-[0.7rem] font-[630] text-[oklch(0.97_0.005_154)]">
          <span
            className="grid size-6 shrink-0 place-items-center"
            aria-hidden="true"
          >
            <Image
              className="size-full object-contain [scale:1.42]"
              src={roundIcon}
              alt=""
              width={32}
              height={32}
            />
          </span>
          <span>Figma to Code</span>
        </div>
        <div className="h-136 md:h-164">
          <PluginUI
            code={code}
            isLoading={false}
            selectedFramework={selectedFramework}
            setSelectedFramework={setSelectedFramework}
            htmlPreview={samplePreview}
            settings={settings}
            onPreferenceChanged={onPreferenceChanged}
            colors={[]}
            gradients={[]}
            warnings={warnings}
          />
        </div>
      </div>
    </article>
  );
}

function AppearanceIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7" />
      <circle cx="10" cy="10" r="3.25" />
    </svg>
  );
}

function StateIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="3" />
      <path d="m6.75 10 2.05 2.05 4.45-4.45" />
    </svg>
  );
}

function PreviewIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="3.25" width="15" height="13.5" rx="2.5" />
      <path d="M2.5 7h15" />
      <path d="M5.5 5.15h.01M8 5.15h.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m4 8.25 2.35 2.35L12 5" />
    </svg>
  );
}
