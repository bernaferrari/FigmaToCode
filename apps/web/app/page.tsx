import Link from "next/link";
import { FAQAccordion } from "./FAQAccordion";
import PreviewLab from "./PreviewLab";
import { comparisons } from "./comparisons";
import { ExternalArrowIcon, MarketingShell } from "./MarketingShell";
import {
  arrowMotion,
  buttonClass,
  capabilityCardClass,
  heroActions,
  home,
  outputCardClass,
  sectionHeading,
  sectionKicker,
  sectionKickerInverse,
} from "./marketingStyles";
import {
  FIGMA_PLUGIN_URL,
  GITHUB_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  getSiteUrl,
} from "./site";

const faqs = [
  {
    question: "Is Figma to Code really free?",
    answer:
      "Yes. The plugin is free to use without generation credits, trials or an account. Its source code is published under the GPL-3.0 license on GitHub.",
  },
  {
    question: "Does the plugin upload my Figma designs?",
    answer:
      "No. The plugin manifest explicitly allows no network domains and requests no permissions. Conversion happens inside Figma's plugin sandbox and the generated code is returned to you there.",
  },
  {
    question: "Does it work without Dev Mode?",
    answer:
      "Yes. Run it as a regular plugin in Figma Design, or select it as a code generator in Dev Mode. The manifest supports both editor surfaces.",
  },
  {
    question: "Can it sync with an existing codebase?",
    answer:
      "No. The plugin cannot connect to or inspect a repository, import an application back into Figma, keep generated files synchronized, or push later Figma edits into existing components. It creates a new, editable scaffold from the current selection.",
  },
  {
    question: "Is the generated code production ready?",
    answer:
      "Treat it as an editable visual scaffold. It can preserve useful layout, styling, colors and typography, but a Figma file does not contain your application state, business rules, accessibility intent or backend behavior.",
  },
  {
    question: "Why doesn't it use AI?",
    answer:
      "AI could infer semantics, map a codebase and invent interactions, but it also requires model infrastructure and network access. This plugin chooses deterministic, inspectable conversion so it can remain private and work in restricted environments.",
  },
  {
    question: "Which frameworks are supported?",
    answer:
      "Web output includes HTML, React JSX, Svelte, styled-components and Tailwind. Native output includes Flutter and SwiftUI. Tailwind can generate HTML, JSX or Twig-shaped output.",
  },
];

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Figma",
  url: getSiteUrl().toString(),
  downloadUrl: FIGMA_PLUGIN_URL,
  codeRepository: GITHUB_URL,
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "HTML, React JSX, Svelte and styled-components generation",
    "Tailwind CSS generation",
    "Flutter generation",
    "SwiftUI generation",
    "Figma Design and Dev Mode support",
    "No plugin network access",
    "Open-source code",
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function Web() {
  return (
    <MarketingShell>
      <main id="main-content">
        <section className={home.hero} aria-labelledby="hero-title">
          <div className={home.heroCopy}>
            <p className={home.heroKicker}>
              <span aria-hidden="true" /> Free · open source · runs inside Figma
            </p>
            <h1 className={home.heroTitle} id="hero-title">
              Fast, flexible{" "}
              <span className="bg-linear-to-r from-[oklch(0.44_0.17_250)] via-[oklch(0.48_0.19_266)] via-[48%] to-[oklch(0.53_0.18_284)] bg-clip-text pr-[0.05em] text-transparent [-webkit-text-fill-color:transparent] dark:from-[oklch(0.7_0.13_151)] dark:via-[oklch(0.78_0.16_151)] dark:via-[52%] dark:to-[oklch(0.74_0.11_181)]">
                Figma to code.
              </span>{" "}
              Private by design.
            </h1>
            <p className={home.heroDescription}>
              Turn a selection into responsive HTML, React, Svelte, Tailwind,
              Flutter or SwiftUI. Tune the output in Design or Dev Mode without
              sending your file to another service.
            </p>
            <div className={`${heroActions} justify-start`}>
              <a
                className={buttonClass("primary")}
                href={FIGMA_PLUGIN_URL}
                target="_blank"
                rel="noreferrer"
              >
                Install the free plugin
                <ExternalArrowIcon />
              </a>
              <a
                className={buttonClass("secondary")}
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
              >
                <GitHubIcon />
                Inspect the source
              </a>
            </div>
            <ul className={home.proofList} aria-label="Product guarantees">
              <li>
                <CheckIcon /> No account
              </li>
              <li>
                <CheckIcon /> No generation limits
              </li>
              <li>
                <CheckIcon /> No network access
              </li>
            </ul>
          </div>

          <figure className={home.manifest}>
            <figcaption className="sr-only">
              Plugin manifest showing no permissions and no allowed network
              domains
            </figcaption>
            <div className={home.manifestToolbar}>
              <span className={home.manifestFileIcon} aria-hidden="true">
                &#123; &#125;
              </span>
              <div>
                <strong>manifest.json</strong>
                <span>Published plugin configuration</span>
              </div>
              <span className={home.verifiedChip}>
                <CheckIcon /> Verified in source
              </span>
            </div>
            <pre className={home.manifestCode} aria-hidden="true">
              <code>
                <span className="text-[oklch(0.68_0.015_154)]">&#123;</span>
                {"\n  "}
                <span className="text-[oklch(0.79_0.08_205)]">
                  &quot;editorType&quot;
                </span>
                <span className="text-[oklch(0.68_0.015_154)]">: [</span>
                <span className="text-[oklch(0.79_0.14_151)]">
                  &quot;figma&quot;
                </span>
                <span className="text-[oklch(0.68_0.015_154)]">, </span>
                <span className="text-[oklch(0.79_0.14_151)]">
                  &quot;dev&quot;
                </span>
                <span className="text-[oklch(0.68_0.015_154)]">],</span>
                {"\n  "}
                <span className="text-[oklch(0.79_0.08_205)]">
                  &quot;permissions&quot;
                </span>
                <span className="text-[oklch(0.68_0.015_154)]">: [],</span>
                {"\n  "}
                <span className="text-[oklch(0.79_0.08_205)]">
                  &quot;networkAccess&quot;
                </span>
                <span className="text-[oklch(0.68_0.015_154)]">: &#123;</span>
                {"\n    "}
                <span className="text-[oklch(0.79_0.08_205)]">
                  &quot;allowedDomains&quot;
                </span>
                <span className="text-[oklch(0.68_0.015_154)]">: [</span>
                <span className="text-[oklch(0.79_0.14_151)]">
                  &quot;none&quot;
                </span>
                <span className="text-[oklch(0.68_0.015_154)]">]</span>
                {"\n  "}
                <span className="text-[oklch(0.68_0.015_154)]">&#125;</span>
                {"\n"}
                <span className="text-[oklch(0.68_0.015_154)]">&#125;</span>
              </code>
            </pre>
            <div className={home.manifestFlow} aria-hidden="true">
              <span>Your selection</span>
              <FlowArrow />
              <span>Local conversion</span>
              <FlowArrow />
              <span>Your code</span>
            </div>
          </figure>
        </section>

        <section className={home.trustStrip} aria-label="Product facts">
          <div>
            <strong>0</strong>
            <span>allowed network domains</span>
          </div>
          <div>
            <strong>8</strong>
            <span>Dev Mode output choices</span>
          </div>
          <div>
            <strong>2</strong>
            <span>Figma modes supported</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>open-source generator</span>
          </div>
        </section>

        <section
          className={home.previewSection}
          id="preview"
          aria-labelledby="preview-title"
        >
          <div className={home.sectionHeading}>
            <div>
              <p className={sectionKicker}>Interactive example</p>
              <h2 className={sectionHeading} id="preview-title">
                See what the plugin actually returns.
              </h2>
            </div>
            <p>
              Switch frameworks, output modes, themes and edge cases. The demo
              uses the real shared plugin interface—not a polished video of a
              different product.
            </p>
          </div>
          <PreviewLab />
        </section>

        <section
          className={home.privacy}
          id="privacy"
          aria-labelledby="privacy-title"
        >
          <div className={home.privacyCopy}>
            <p className={sectionKickerInverse}>Privacy model</p>
            <h2 id="privacy-title">Your design never becomes a prompt.</h2>
            <p>
              There is no account to create, cloud workspace to authorize, or
              repository to connect. Figma to Code reads the current selection,
              converts it in the plugin sandbox, and returns code to the same
              interface.
            </p>
            <Link className={home.textLinkInverse} href="/privacy">
              Read the privacy architecture{" "}
              <ArrowIcon className={arrowMotion} />
            </Link>
          </div>
          <div className={home.privacyFacts}>
            <article>
              <span className={home.featureIcon}>
                <ShieldIcon />
              </span>
              <div>
                <h3>Network disabled by manifest</h3>
                <p>
                  The published configuration sets allowed network domains to
                  none. Privacy is an architectural constraint, not a toggle.
                </p>
              </div>
            </article>
            <article>
              <span className={home.featureIcon}>
                <EyeIcon />
              </span>
              <div>
                <h3>Auditable source</h3>
                <p>
                  The conversion logic, supported nodes, warnings and project
                  templates are public TypeScript—not an opaque API response.
                </p>
              </div>
            </article>
            <article>
              <span className={home.featureIcon}>
                <BuildingIcon />
              </span>
              <div>
                <h3>Friendly to restricted environments</h3>
                <p>
                  Useful where design uploads, third-party model processing or
                  new SaaS accounts are blocked by policy.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section
          className={home.largeSection}
          id="outputs"
          aria-labelledby="outputs-title"
        >
          <div className={home.centeredHeading}>
            <p className={sectionKicker}>One selection, several targets</p>
            <h2 className={sectionHeading} id="outputs-title">
              Web and native code from the same plugin.
            </h2>
            <p>
              Pick a small component for a focused snippet, or export a frame as
              a starter project with local assets and setup instructions.
            </p>
          </div>
          <div className={home.outputGrid}>
            <article className={outputCardClass("web")}>
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[0.68rem] font-[690] tracking-[0.08em] text-site-green-dark uppercase">
                  01
                </span>
                <span className="font-mono text-[0.68rem] font-[690] tracking-[0.08em] text-site-muted uppercase">
                  Web standards
                </span>
              </div>
              <h3>HTML that stays close to the platform.</h3>
              <p>
                Generate plain HTML, React JSX, Svelte or styled-components.
                Preserve layout relationships without forcing a hosted runtime.
              </p>
              <div className="mt-6 flex flex-wrap gap-2 [&_span]:rounded-full [&_span]:bg-white/65 [&_span]:px-2.5 [&_span]:py-1.5 [&_span]:text-[0.68rem] [&_span]:font-[590] [&_span]:text-site-ink [&_span]:shadow-[0_0_0_1px_var(--site-border)] dark:[&_span]:bg-white/6">
                <span>HTML</span>
                <span>React JSX</span>
                <span>Svelte</span>
                <span>styled-components</span>
              </div>
            </article>
            <article className={outputCardClass("tailwind")}>
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[0.68rem] font-[690] tracking-[0.08em] text-site-green-dark uppercase">
                  02
                </span>
                <span className="font-mono text-[0.68rem] font-[690] tracking-[0.08em] text-[oklch(0.67_0.015_154)] uppercase">
                  Utility CSS
                </span>
              </div>
              <h3>Tailwind that fits your configuration.</h3>
              <p>
                Choose HTML, JSX or Twig output. Round values and colors, keep
                Figma variables, add a custom prefix, or preserve exact values.
              </p>
              <pre
                className="mt-6 overflow-x-auto rounded-xl border border-[oklch(0.36_0.02_154)] bg-[oklch(0.12_0.016_154)] p-3.5 font-mono text-[0.72rem] text-[oklch(0.78_0.14_151)]"
                aria-label="Example Tailwind output"
              >
                <code>className=&quot;flex gap-4 rounded-3xl p-8&quot;</code>
              </pre>
            </article>
            <article className={outputCardClass("flutter")}>
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[0.68rem] font-[690] tracking-[0.08em] text-site-green-dark uppercase">
                  03
                </span>
                <span className="font-mono text-[0.68rem] font-[690] tracking-[0.08em] text-site-muted uppercase">
                  Flutter
                </span>
              </div>
              <h3>Widget, snippet or runnable starter.</h3>
              <p>
                Convert frames and text to Dart, with optional full-app wrapping
                and exported image assets.
              </p>
              <div
                className="pointer-events-none absolute right-[clamp(1.2rem,3vw,2.4rem)] -bottom-3 left-[clamp(1.2rem,3vw,2.4rem)] min-h-18 rounded-t-[0.9rem] bg-[oklch(0.14_0.019_154)] px-4 pt-3 pb-4 font-mono text-[oklch(0.78_0.015_154)] shadow-[0_0_0_1px_oklch(1_0_0/8%),0_18px_35px_-16px_oklch(0.18_0.03_154/35%)] select-none [&>span]:mb-2.5 [&>span]:block [&>span]:text-[0.58rem] [&>span]:text-[oklch(0.58_0.015_154)] [&_code]:text-[clamp(0.61rem,1vw,0.72rem)] [&_code]:whitespace-nowrap [&_i]:text-[oklch(0.76_0.11_194)] [&_i]:not-italic [&_b]:font-semibold [&_b]:text-[oklch(0.82_0.13_151)]"
                aria-hidden="true"
              >
                <span>main.dart</span>
                <code>
                  <i>Container</i>(padding: <b>32</b>, child: Column(…))
                </code>
              </div>
            </article>
            <article className={outputCardClass("swiftui")}>
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[0.68rem] font-[690] tracking-[0.08em] text-site-green-dark uppercase">
                  04
                </span>
                <span className="font-mono text-[0.68rem] font-[690] tracking-[0.08em] text-site-muted uppercase">
                  SwiftUI
                </span>
              </div>
              <h3>Views that are ready to refine in Xcode.</h3>
              <p>
                Generate a snippet, View struct or preview file, with images
                prepared for an asset catalog.
              </p>
              <div
                className="pointer-events-none absolute right-[clamp(1.2rem,3vw,2.4rem)] -bottom-3 left-[clamp(1.2rem,3vw,2.4rem)] min-h-18 rounded-t-[0.9rem] bg-[oklch(0.14_0.019_154)] px-4 pt-3 pb-4 font-mono text-[oklch(0.78_0.015_154)] shadow-[0_0_0_1px_oklch(1_0_0/8%),0_18px_35px_-16px_oklch(0.18_0.03_154/35%)] select-none [&>span]:mb-2.5 [&>span]:block [&>span]:text-[0.58rem] [&>span]:text-[oklch(0.58_0.015_154)] [&_code]:text-[clamp(0.61rem,1vw,0.72rem)] [&_code]:whitespace-nowrap [&_i]:text-[oklch(0.76_0.11_194)] [&_i]:not-italic [&_b]:font-semibold [&_b]:text-[oklch(0.82_0.13_151)]"
                aria-hidden="true"
              >
                <span>FeatureCard.swift</span>
                <code>
                  <i>VStack</i>(spacing: <b>16</b>) &#123; Text(…)&nbsp;&#125;
                </code>
              </div>
            </article>
          </div>
        </section>

        <section className={home.process} aria-labelledby="process-title">
          <div className={home.processIntro}>
            <p className={sectionKicker}>How it works</p>
            <h2 className={sectionHeading} id="process-title">
              A compiler-shaped pipeline, not a screenshot guess.
            </h2>
            <p>
              The generator reads structured Figma nodes and turns them into an
              intermediate representation before producing framework-specific
              code.
            </p>
          </div>
          <ol className={home.processList}>
            <li>
              <span>01</span>
              <div>
                <h3>Read the selection</h3>
                <p>
                  Frames, groups, text, shapes, fills, variables and layout
                  metadata are inspected.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Normalize the structure</h3>
                <p>
                  Nodes become a portable intermediate tree with parent and
                  layout relationships.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Optimize layout decisions</h3>
                <p>
                  Auto Layout, alignment, sizing, absolute positioning and
                  stacking inform the result.
                </p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <h3>Generate and explain</h3>
                <p>
                  The selected backend writes code and surfaces warnings when a
                  detail cannot translate cleanly.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section
          className={home.limitations}
          id="limitations"
          aria-labelledby="limitations-title"
        >
          <div className="max-w-5xl text-left [&>p:last-child]:mt-5 [&>p:last-child]:max-w-3xl [&>p:last-child]:leading-[1.7] [&>p:last-child]:text-site-muted">
            <p className={sectionKicker}>Clear boundaries</p>
            <h2 className={sectionHeading} id="limitations-title">
              What it handles. What it cannot know.
            </h2>
            <p>
              A useful generator should tell you where translation ends. The
              plugin reports conversion warnings instead of quietly inventing a
              result.
            </p>
          </div>
          <div className={home.capabilityGrid}>
            <article className={capabilityCardClass("supported")}>
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] font-[680] tracking-[0.03em] text-site-green-dark [&_svg]:size-3.5 [&_svg]:stroke-current [&_svg]:stroke-2">
                <CheckIcon /> Strong support
              </span>
              <h3>Visual structure and styling</h3>
              <ul>
                <li>Auto Layout, nested frames and alignment</li>
                <li>Mixed absolute and flow positioning</li>
                <li>Typography, fills, borders and corner radii</li>
                <li>Color variables, gradients and many effects</li>
                <li>Images and downloadable starter projects</li>
              </ul>
            </article>
            <article className={capabilityCardClass("partial")}>
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] font-[680] tracking-[0.03em] text-[oklch(0.57_0.14_77)] dark:text-[oklch(0.78_0.13_77)] [&_svg]:size-3.5 [&_svg]:stroke-current [&_svg]:stroke-2">
                <WarningIcon /> Target dependent
              </span>
              <h3>Details with uneven platform equivalents</h3>
              <ul>
                <li>
                  Vectors are optional for web and unsupported in some native
                  targets
                </li>
                <li>
                  Stars, polygons, lines and gradient types vary by framework
                </li>
                <li>
                  Very large selections trade preview detail for stability
                </li>
                <li>Exact responsive behavior still needs human review</li>
              </ul>
            </article>
            <article className={capabilityCardClass("absent")}>
              <span className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] font-[680] tracking-[0.03em] text-site-muted [&_svg]:size-3.5 [&_svg]:stroke-current [&_svg]:stroke-2">
                <MinusIcon /> Intentionally absent
              </span>
              <h3>Meaning that is not present in the file</h3>
              <ul>
                <li>No AI inference or prompt-based redesign</li>
                <li>
                  No codebase connection, import, synchronization or round-trip
                  updates
                </li>
                <li>No backend, data fetching or business logic</li>
                <li>No invented accessibility labels or interactions</li>
                <li>No cloud deployment or hosted editor</li>
              </ul>
            </article>
          </div>
        </section>

        <section
          className={home.comparison}
          id="compare"
          aria-labelledby="compare-title"
        >
          <div className={home.comparisonHeading}>
            <div>
              <p className={sectionKickerInverse}>Compare approaches</p>
              <h2 id="compare-title">
                Connected intelligence or private control.
              </h2>
            </div>
            <p>
              Connected AI tools can understand repositories, map components and
              invent application behavior. Figma to Code gives up those
              capabilities to remain private, free and inspectable.
            </p>
          </div>
          <div className={home.comparisonCards}>
            {comparisons.map((comparison) => (
              <article key={comparison.slug}>
                <h3>{comparison.name}</h3>
                <p>{comparison.cardSummary}</p>
                <Link href={`/compare/${comparison.slug}`}>
                  View comparison <ArrowIcon className={arrowMotion} />
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className={home.decision} aria-labelledby="decision-title">
          <div>
            <p className={sectionKicker}>Choose by constraint</p>
            <h2 className={sectionHeading} id="decision-title">
              The best tool depends on what cannot move.
            </h2>
          </div>
          <div className={home.decisionColumns}>
            <article>
              <span className={home.decisionIcon}>
                <LockIcon />
              </span>
              <h3>Use Figma to Code when privacy is the hard requirement.</h3>
              <p>
                Ideal for regulated teams, confidential client work, offline
                policies, quick scaffolds, native output and developers who want
                source they can inspect.
              </p>
            </article>
            <article>
              <span className={home.decisionIcon}>
                <SparkIcon />
              </span>
              <h3>
                Use an AI platform when deeper inference is worth the
                connection.
              </h3>
              <p>
                Better when you need component mapping, repository context,
                generated interactions, natural-language iteration or a hosted
                end-to-end workflow.
              </p>
            </article>
          </div>
        </section>

        <section className={home.faq} aria-labelledby="faq-title">
          <div>
            <p className={sectionKicker}>Frequently asked</p>
            <h2 className={sectionHeading} id="faq-title">
              Before you install.
            </h2>
          </div>
          <FAQAccordion items={faqs} />
        </section>

        <section className={home.finalCta} aria-labelledby="cta-title">
          <p className={sectionKickerInverse}>Start with one selection</p>
          <h2 id="cta-title">
            Get a useful scaffold without creating another account.
          </h2>
          <p>
            Install the plugin, select a frame, choose a target and copy the
            result. If it misses something, the issue tracker and the generator
            are both open.
          </p>
          <div className={heroActions}>
            <a
              className={buttonClass("inverse")}
              href={FIGMA_PLUGIN_URL}
              target="_blank"
              rel="noreferrer"
            >
              Open in Figma <ExternalArrowIcon />
            </a>
            <a
              className={buttonClass("darkGhost")}
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </section>
      </main>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </MarketingShell>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m3.5 8.2 2.7 2.7 6.3-6.3" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" />
    </svg>
  );
}

function FlowArrow() {
  return (
    <svg viewBox="0 0 24 12" fill="none">
      <path d="M1 6h20M17 2l4 4-4 4" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      className="github-icon"
      viewBox="0 0 438.549 438.549"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 0 1-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5 16 5v4.2c0 4-2.5 6.6-6 8.3-3.5-1.7-6-4.3-6-8.3V5l6-2.5Z" />
      <path d="m7.2 10 1.8 1.8 3.8-4" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M2.5 10s2.7-4.5 7.5-4.5 7.5 4.5 7.5 4.5-2.7 4.5-7.5 4.5S2.5 10 2.5 10Z" />
      <circle cx="10" cy="10" r="2.2" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M4 17V3h9v14M13 8h3v9M2.5 17h15M7 6h3M7 9h3M7 12h3" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none">
      <path d="M8 2.2 14 13H2L8 2.2Z" />
      <path d="M8 6v3.5M8 11.7h.01" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.5" />
      <path d="M5.5 8h5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <rect x="3.5" y="8.5" width="13" height="9" rx="2.5" />
      <path d="M6.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5M10 12v2" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none">
      <path d="M10 2.5c.5 4.5 3 7 7.5 7.5-4.5.5-7 3-7.5 7.5-.5-4.5-3-7-7.5-7.5 4.5-.5 7-3 7.5-7.5Z" />
    </svg>
  );
}
