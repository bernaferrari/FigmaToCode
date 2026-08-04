import type { Metadata } from "next";
import Link from "next/link";
import { Check, Code2, ShieldCheck, WifiOff } from "lucide-react";
import { FAQAccordion } from "../FAQAccordion";
import { ExternalArrowIcon, MarketingShell } from "../MarketingShell";
import {
  buttonClass,
  editorial,
  heroActions,
  sectionHeading,
  sectionKicker,
  sectionKickerInverse,
} from "../marketingStyles";
import { FIGMA_PLUGIN_URL, GITHUB_URL, getSiteUrl } from "../site";

const FIGMA_MANIFEST_DOCS_URL =
  "https://developers.figma.com/docs/plugins/manifest/";

const privacyFaqs = [
  {
    question: "Is Figma to Code suitable for enterprise and confidential work?",
    answer:
      "It is designed for restricted environments. There is no plugin backend, account, API token, telemetry, or allowed network domain. The conversion rules are public, and Figma enforces the network boundary. Your organization's normal plugin approval or allowlisting policy still applies.",
  },
  {
    question: "Can the plugin upload my design, even accidentally?",
    answer:
      'The plugin reads the layers you select so it can generate code, but the published manifest sets allowedDomains to "none". Figma blocks external requests made by the plugin, including requests added accidentally or by a future code path, unless the published manifest itself is changed.',
  },
  {
    question: "Does an enterprise still need to review or approve the plugin?",
    answer:
      "The plugin is protected by an enforceable technical boundary, not just a privacy promise. It declares no allowed network domains, so Figma blocks uploads, API calls, and telemetry. If your organization requires approval, reviewers can verify that boundary themselves in the public manifest and source. Your normal security, legal, and Figma admin policies still apply.",
  },
  {
    question: "Does the plugin operate a data processor or cloud service?",
    answer:
      "No service operated by this project receives or stores your selected design data. Conversion happens in Figma's plugin runtime and the result is returned to you there. Whether your organization requires additional documentation is a policy decision for your own security or legal team.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: privacyFaqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export const metadata: Metadata = {
  title: "Private and offline-first Figma to code generation",
  description:
    "How Figma to Code keeps design conversion private: no plugin network access, no account, no telemetry, open-source conversion rules and local output.",
  alternates: { canonical: "/privacy" },
  openGraph: {
    title: "Private Figma to code generation",
    description:
      "No design upload, no external model and no account. Read the source-backed privacy architecture behind Figma to Code.",
    url: new URL("/privacy", getSiteUrl()),
    type: "article",
  },
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <main id="main-content" className={editorial.page}>
        <nav className={editorial.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <span>Privacy</span>
        </nav>
        <article className={editorial.article}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
          />
          <header className={editorial.hero}>
            <p className={sectionKicker}>Privacy by architecture</p>
            <h1>The plugin cannot send your design to the internet.</h1>
            <p>
              It reads the layers you select, converts them inside Figma, and
              returns code to you. There is no upload step, plugin backend, or
              external service in between.
            </p>
            <div className={`${heroActions} justify-start`}>
              <a
                className={buttonClass("primary")}
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
              >
                Inspect the repository <ExternalArrowIcon />
              </a>
              <a
                className={buttonClass("secondary")}
                href={FIGMA_PLUGIN_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open in Figma
              </a>
            </div>
          </header>

          <section
            className={editorial.privacyProof}
            aria-labelledby="proof-title"
          >
            <div>
              <p className={sectionKickerInverse}>Published manifest</p>
              <h2 className={sectionHeading} id="proof-title">
                The privacy claim is machine-enforced.
              </h2>
              <p>
                Figma uses the plugin manifest to control capabilities. This
                project declares an empty permissions array and sets
                <code>networkAccess.allowedDomains</code> to <code>none</code>.
              </p>
            </div>
            <pre aria-label="Relevant lines from the plugin manifest">
              <code>{`{
  "permissions": [],
  "networkAccess": {
    "allowedDomains": ["none"]
  }
}`}</code>
            </pre>
          </section>

          <section
            className="border-t border-border py-20 sm:py-24"
            aria-labelledby="flow-title"
          >
            <div className="max-w-4xl">
              <p className={sectionKicker}>The complete data flow</p>
              <h2 className={sectionHeading} id="flow-title">
                Your selection goes in. Code comes back.
              </h2>
              <p className="mt-5 max-w-3xl text-pretty text-[0.95rem] leading-[1.7] text-muted-foreground">
                The entire conversion is a short, closed loop inside Figma. No
                account is created and no design data is handed to another
                company.
              </p>
            </div>
            <ol className="mt-10 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-3">
              <li className="rounded-2xl border border-border bg-site-surface p-6 sm:p-7">
                <span className="grid size-10 place-items-center rounded-xl bg-[oklch(0.79_0.1_151/18%)] text-site-green-dark">
                  <Code2 className="size-5 stroke-[1.6]" aria-hidden="true" />
                </span>
                <p className="mt-9 font-mono text-[0.68rem] font-[680] tracking-[0.08em] text-site-green-dark uppercase">
                  01 · Read
                </p>
                <h3 className="mt-2 text-[1.15rem] font-[650] tracking-[-0.025em] text-site-ink">
                  You choose the layers
                </h3>
                <p className="mt-3 text-[0.82rem] leading-[1.65] text-muted-foreground">
                  The plugin reads only the Figma selection needed to generate
                  the requested output.
                </p>
              </li>
              <li className="rounded-2xl border border-border bg-site-surface p-6 sm:p-7">
                <span className="grid size-10 place-items-center rounded-xl bg-[oklch(0.79_0.1_151/18%)] text-site-green-dark">
                  <ShieldCheck
                    className="size-5 stroke-[1.6]"
                    aria-hidden="true"
                  />
                </span>
                <p className="mt-9 font-mono text-[0.68rem] font-[680] tracking-[0.08em] text-site-green-dark uppercase">
                  02 · Convert
                </p>
                <h3 className="mt-2 text-[1.15rem] font-[650] tracking-[-0.025em] text-site-ink">
                  Generation stays in Figma
                </h3>
                <p className="mt-3 text-[0.82rem] leading-[1.65] text-muted-foreground">
                  Public TypeScript rules transform layout and style metadata
                  inside the plugin runtime.
                </p>
              </li>
              <li className="rounded-2xl border border-border bg-site-surface p-6 sm:p-7">
                <span className="grid size-10 place-items-center rounded-xl bg-[oklch(0.79_0.1_151/18%)] text-site-green-dark">
                  <Check className="size-5 stroke-[1.8]" aria-hidden="true" />
                </span>
                <p className="mt-9 font-mono text-[0.68rem] font-[680] tracking-[0.08em] text-site-green-dark uppercase">
                  03 · Return
                </p>
                <h3 className="mt-2 text-[1.15rem] font-[650] tracking-[-0.025em] text-site-ink">
                  The result comes back to you
                </h3>
                <p className="mt-3 text-[0.82rem] leading-[1.65] text-muted-foreground">
                  Preview, copy, or download the generated code and its local
                  assets from the plugin interface.
                </p>
              </li>
            </ol>
          </section>

          <section
            className="grid grid-cols-1 gap-10 rounded-[1.6rem] bg-[oklch(0.14_0.019_154)] bg-[radial-gradient(circle_at_88%_0%,oklch(0.46_0.12_151/30%),transparent_42%)] p-[clamp(2rem,6vw,5rem)] text-white min-[68rem]:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.92fr)] min-[68rem]:gap-[clamp(4rem,9vw,8rem)]"
            id="enterprise-security"
          >
            <div className="max-w-3xl">
              <span className="mb-7 grid size-12 place-items-center rounded-2xl bg-[oklch(0.76_0.14_151/13%)] text-[oklch(0.8_0.14_151)]">
                <WifiOff className="size-6 stroke-[1.5]" aria-hidden="true" />
              </span>
              <p className={sectionKickerInverse}>
                Enterprise-friendly by design
              </p>
              <h2 className="m-0 text-balance text-[clamp(2.25rem,4.6vw,4.2rem)] leading-[0.98] font-[650] tracking-[-0.055em] text-white">
                There is no server to trust.
              </h2>
              <p className="mt-6 max-w-2xl text-pretty leading-[1.75] text-[oklch(0.72_0.014_154)]">
                Figma enforces the published network boundary. If plugin code
                tries to call an API, upload data, or fetch an external
                resource, Figma blocks the request because no domains are
                allowed.
              </p>
            </div>
            <div className="self-end rounded-2xl border border-white/10 bg-white/4 p-6 sm:p-7">
              <p className="font-mono text-[0.68rem] font-[680] tracking-[0.08em] text-[oklch(0.8_0.14_151)] uppercase">
                A smaller security review
              </p>
              <ul className="mt-5 list-none space-y-3 p-0 text-[0.82rem] text-[oklch(0.82_0.01_154)] [&_li]:flex [&_li]:items-center [&_li]:gap-2.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[oklch(0.78_0.14_151)] [&_svg]:stroke-2">
                <li>
                  <Check aria-hidden="true" /> No upload endpoint
                </li>
                <li>
                  <Check aria-hidden="true" /> No account or API token
                </li>
                <li>
                  <Check aria-hidden="true" /> No telemetry or cloud storage
                </li>
                <li>
                  <Check aria-hidden="true" /> Public manifest and source
                </li>
              </ul>
              <p className="mt-6 border-t border-white/10 pt-5 text-[0.75rem] leading-[1.65] text-[oklch(0.67_0.014_154)]">
                Your organization's normal plugin approval policy still applies.
                The difference is that the privacy boundary is inspectable and
                enforced, not merely promised.
              </p>
              <a
                className="group mt-5 inline-flex min-h-11 items-center gap-2 text-[0.76rem] font-[650] text-[oklch(0.82_0.14_151)] no-underline whitespace-nowrap"
                href={FIGMA_MANIFEST_DOCS_URL}
                target="_blank"
                rel="noreferrer"
              >
                Read Figma&apos;s network rules <ExternalArrowIcon />
              </a>
            </div>
          </section>

          <section
            className="grid grid-cols-1 gap-10 border-t border-border py-20 sm:py-24 min-[68rem]:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] min-[68rem]:gap-[clamp(4rem,10vw,9rem)]"
            aria-labelledby="privacy-faq-title"
          >
            <div className="max-w-xl">
              <p className={sectionKicker}>Enterprise and privacy FAQ</p>
              <h2 className={sectionHeading} id="privacy-faq-title">
                What security teams usually ask.
              </h2>
              <p className="mt-5 text-pretty text-[0.9rem] leading-[1.7] text-muted-foreground">
                Direct answers for teams evaluating whether selected design data
                can leave Figma.
              </p>
            </div>
            <FAQAccordion items={privacyFaqs} />
          </section>

          <section className={editorial.cta}>
            <div>
              <p className={sectionKickerInverse}>Source-backed trust</p>
              <h2>No policy page can replace inspectable architecture.</h2>
              <p>
                Review the manifest and generator, then try it on a selection.
              </p>
            </div>
            <div className={`${heroActions} mt-0 shrink-0`}>
              <a
                className={buttonClass("inverse")}
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
              >
                View source <ExternalArrowIcon />
              </a>
              <a
                className={buttonClass("darkGhost")}
                href={FIGMA_PLUGIN_URL}
                target="_blank"
                rel="noreferrer"
              >
                Install plugin
              </a>
            </div>
          </section>
        </article>
      </main>
    </MarketingShell>
  );
}
