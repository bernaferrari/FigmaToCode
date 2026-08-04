import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { comparisons, getComparison } from "../../comparisons";
import { ExternalArrowIcon, MarketingShell } from "../../MarketingShell";
import {
  arrowMotion,
  buttonClass,
  editorial,
  heroActions,
  sectionHeading,
  sectionKicker,
  sectionKickerInverse,
} from "../../marketingStyles";
import { FIGMA_PLUGIN_URL, GITHUB_URL, getSiteUrl } from "../../site";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return comparisons.map((comparison) => ({ slug: comparison.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparison = getComparison(slug);

  if (!comparison) return {};

  return {
    title: comparison.title,
    description: comparison.description,
    alternates: { canonical: `/compare/${comparison.slug}` },
    openGraph: {
      title: comparison.title,
      description: comparison.description,
      url: new URL(`/compare/${comparison.slug}`, getSiteUrl()),
      type: "article",
    },
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const comparison = getComparison(slug);

  if (!comparison) notFound();

  const otherComparisons = comparisons.filter((item) => item.slug !== slug);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: comparison.title,
    description: comparison.description,
    mainEntityOfPage: new URL(`/compare/${comparison.slug}`, getSiteUrl()),
    author: { "@type": "Organization", name: "Figma to Code" },
  };

  return (
    <MarketingShell>
      <main id="main-content" className={editorial.page}>
        <nav className={editorial.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/#compare">Compare</Link>
          <span aria-hidden="true">/</span>
          <span>{comparison.shortName}</span>
        </nav>

        <article className={editorial.article}>
          <header className={editorial.hero}>
            <p className={sectionKicker}>Compare workflows</p>
            <h1>
              <mark className="box-decoration-clone rounded-[0.12em] bg-[oklch(0.86_0.11_151/65%)] px-[0.08em] text-[oklch(0.18_0.02_154)] dark:bg-[oklch(0.48_0.12_151/45%)] dark:text-site-ink">
                Figma to Code
              </mark>{" "}
              vs {comparison.shortName}
            </h1>
            <p>{comparison.intro}</p>
            <div className={`${heroActions} justify-start`}>
              <a
                className={buttonClass("primary")}
                href={FIGMA_PLUGIN_URL}
                target="_blank"
                rel="noreferrer"
              >
                Try Figma to Code
                <ExternalArrowIcon />
              </a>
              <Link
                className={buttonClass("secondary")}
                href="#comparison-table"
              >
                See the differences
              </Link>
            </div>
          </header>

          <section
            className={editorial.verdict}
            aria-labelledby="verdict-title"
          >
            <h2 className={sectionHeading} id="verdict-title">
              The short answer
            </h2>
            <div>
              <article>
                <span>Best fit for {comparison.shortName}</span>
                <p>{comparison.competitorStrength}</p>
              </article>
              <article>
                <span>Best fit for Figma to Code</span>
                <p>{comparison.ourStrength}</p>
              </article>
            </div>
          </section>

          <section
            className={editorial.ruledSection}
            id="comparison-table"
            aria-labelledby="table-title"
          >
            <div className={editorial.heading}>
              <p className={sectionKicker}>At a glance</p>
              <h2 className={sectionHeading} id="table-title">
                Figma to Code vs {comparison.name}
              </h2>
            </div>
            <div className={editorial.tableWrap}>
              <table className={editorial.table}>
                <caption className="sr-only">
                  Relative pricing comparison. More dollar signs indicate a
                  higher typical cost; consult each product&apos;s official
                  pricing page for current prices.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Decision</th>
                    <th scope="col">Figma to Code</th>
                    <th scope="col">{comparison.shortName}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">
                      Pricing
                      <span className="mt-0.5 block text-[0.64rem] font-[480] text-muted-foreground">
                        Relative
                      </span>
                    </th>
                    <td aria-label="Figma to Code pricing: free with unlimited generations">
                      <div className="flex flex-col items-start gap-1">
                        <strong className="text-[0.9rem] font-[700] text-site-ink">
                          Free
                        </strong>
                        <span>Unlimited generations</span>
                      </div>
                    </td>
                    <td
                      aria-label={`${comparison.shortName} pricing: ${comparison.pricing.accessibleLabel}`}
                    >
                      <div className="flex flex-col items-start gap-1">
                        <strong
                          className="font-mono text-[0.9rem] font-[700] tracking-[-0.04em] text-site-ink"
                          aria-label={comparison.pricing.accessibleLabel}
                        >
                          {comparison.pricing.scale}
                        </strong>
                        <span>{comparison.pricing.note}</span>
                        <a
                          className="group inline-flex items-center gap-1 text-[0.66rem] font-[650] text-site-green-dark no-underline transition-colors duration-150 hover:text-site-ink [&_svg]:size-3 [&_svg]:stroke-current [&_svg]:stroke-[1.7]"
                          href={comparison.pricing.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Current pricing <ExternalArrowIcon />
                        </a>
                      </div>
                    </td>
                  </tr>
                  {comparison.rows.map((row) => (
                    <tr key={row.topic}>
                      <th scope="row">{row.topic}</th>
                      <td>
                        {row.figmaToCode === "None (by design)" ? (
                          <>
                            <strong className="font-[680] text-site-ink">
                              None
                            </strong>{" "}
                            <span>(by design)</span>
                          </>
                        ) : (
                          row.figmaToCode
                        )}
                      </td>
                      <td>{row.competitor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={editorial.explanation}>
            <div>
              <p className={sectionKicker}>Why the gap exists</p>
              <h2 className={sectionHeading}>
                Privacy and intelligence pull the architecture in opposite
                directions.
              </h2>
            </div>
            <div>
              <p>
                A connected service can send structured design context to
                models, inspect a repository, map real components and iterate
                through a prompt. Those are valuable capabilities. They also
                require an account, infrastructure and a data-processing path.
              </p>
              <p>
                Figma to Code fixes the boundary at the plugin sandbox. It reads
                Figma nodes, applies public conversion rules and produces code
                without calling an external domain. The result is less magical,
                but easier to approve, understand and repeat.
              </p>
            </div>
          </section>

          <aside className={editorial.sourceNote}>
            <div>
              <span>Competitor source</span>
              <strong>{comparison.sourceLabel}</strong>
              <p>{comparison.sourceNote}</p>
            </div>
            <a href={comparison.sourceUrl} target="_blank" rel="noreferrer">
              Read the official source <ExternalArrowIcon />
            </a>
          </aside>

          <section className={editorial.next}>
            <div>
              <p className={sectionKicker}>Keep comparing</p>
              <h2 className={sectionHeading}>
                Choose the workflow your constraints allow.
              </h2>
            </div>
            <div>
              {otherComparisons.map((item) => (
                <Link key={item.slug} href={`/compare/${item.slug}`}>
                  <strong>{item.name}</strong>
                  <ArrowIcon className={arrowMotion} />
                </Link>
              ))}
            </div>
          </section>

          <section className={editorial.cta}>
            <div>
              <p className={sectionKickerInverse}>No account required</p>
              <h2>Generate code from a Figma design—privately.</h2>
              <p>
                The plugin is free, open source, and cannot send your design to
                external services.
              </p>
            </div>
            <div className={`${heroActions} mt-0 shrink-0`}>
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
                Review the source
              </a>
            </div>
          </section>
        </article>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
    </MarketingShell>
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
