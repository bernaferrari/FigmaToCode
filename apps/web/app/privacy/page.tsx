import type { Metadata } from "next";
import Link from "next/link";
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
          <header className={editorial.hero}>
            <p className={sectionKicker}>Privacy by architecture</p>
            <h1>The plugin cannot send your design to the internet.</h1>
            <p>
              Figma to Code has no allowed network domains, requests no plugin
              permissions and requires no user account. The same public source
              that generates your code proves those boundaries.
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

          <section className={editorial.privacyDetails}>
            <div className={editorial.heading}>
              <p className={sectionKicker}>Data flow</p>
              <h2 className={sectionHeading}>What happens to a selection.</h2>
            </div>
            <ol>
              <li>
                <span>01</span>
                <div>
                  <h3>Figma exposes the selected nodes</h3>
                  <p>
                    The plugin reads the current page selection through Figma's
                    Plugin API.
                  </p>
                </div>
              </li>
              <li>
                <span>02</span>
                <div>
                  <h3>The plugin creates an intermediate tree</h3>
                  <p>
                    Layout and style metadata are normalized in memory inside
                    the plugin runtime.
                  </p>
                </div>
              </li>
              <li>
                <span>03</span>
                <div>
                  <h3>A local generator writes the target code</h3>
                  <p>
                    Framework-specific TypeScript functions generate the output
                    deterministically.
                  </p>
                </div>
              </li>
              <li>
                <span>04</span>
                <div>
                  <h3>The UI shows or downloads the result</h3>
                  <p>
                    Code and exported assets are returned to the plugin
                    interface and your machine.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section className={editorial.privacyBoundary}>
            <div>
              <p className={sectionKicker}>An important boundary</p>
              <h2 className={sectionHeading}>
                Private plugin does not mean offline Figma.
              </h2>
            </div>
            <p>
              Figma itself is a connected product and remains responsible for
              storing and serving your Figma files according to your Figma plan
              and policies. The claim here is narrower and verifiable: this
              third-party plugin does not add another network destination for
              your selected design data.
            </p>
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
