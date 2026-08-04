import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import roundIcon from "../../../assets/icon_round.png";
import { comparisons } from "./comparisons";
import { buttonClass, externalArrowMotion, pageWidth } from "./marketingStyles";
import { SectionLink } from "./SectionLink";
import { FIGMA_PLUGIN_URL, GITHUB_URL } from "./site";
import { ThemeToggle } from "./ThemeToggle";

export function SiteHeader() {
  return (
    <header
      className="sticky top-2 z-50 mx-auto mt-2 flex min-h-17 w-[calc(100%_-_1rem)] items-center justify-between rounded-2xl border-[length:var(--border-hairline)] border-[oklch(0.18_0.02_154/9%)] bg-[oklch(0.985_0.006_145/82%)] py-[0.45rem] pr-2 pl-[0.7rem] shadow-[0_1px_2px_oklch(0_0_0/4%),0_10px_30px_-18px_oklch(0.18_0.03_154/25%)] backdrop-blur-[18px] backdrop-saturate-125 sm:top-3 sm:mt-3 sm:w-[min(calc(100%_-_2.5rem),88rem)] dark:border-white/10 dark:bg-[oklch(0.16_0.016_154/84%)] dark:shadow-[0_1px_2px_oklch(0_0_0/24%),0_14px_34px_-18px_oklch(0_0_0/72%)]"
      aria-label="Primary navigation"
    >
      <Link
        className="flex items-center gap-3 text-site-ink no-underline"
        href="/"
        aria-label="Figma to Code home"
      >
        <span className="grid size-9.5 place-content-center" aria-hidden="true">
          <Image
            className="size-full object-contain [scale:1.42]"
            src={roundIcon}
            alt=""
            width={48}
            height={48}
            priority
          />
        </span>
        <span className="flex items-center leading-[1.1] max-[28rem]:hidden sm:block">
          <strong className="text-[0.94rem] tracking-[-0.015em]">
            Figma to Code
          </strong>
          <small className="hidden text-[0.62rem] text-muted-foreground sm:block">
            Free · Private · Open source
          </small>
        </span>
      </Link>

      <nav className="flex items-center gap-1.5" aria-label="Site links">
        <SectionLink
          className="hidden min-h-11 items-center rounded-[0.65rem] px-3.5 text-sm font-[560] text-muted-foreground no-underline transition-colors duration-150 hover:bg-site-ink/5 hover:text-site-ink md:inline-flex dark:hover:bg-white/7"
          section="privacy"
        >
          Privacy
        </SectionLink>
        <SectionLink
          className="hidden min-h-11 items-center rounded-[0.65rem] px-3.5 text-sm font-[560] text-muted-foreground no-underline transition-colors duration-150 hover:bg-site-ink/5 hover:text-site-ink md:inline-flex dark:hover:bg-white/7"
          section="outputs"
        >
          Outputs
        </SectionLink>
        <SectionLink
          className="hidden min-h-11 items-center rounded-[0.65rem] px-3.5 text-sm font-[560] text-muted-foreground no-underline transition-colors duration-150 hover:bg-site-ink/5 hover:text-site-ink md:inline-flex dark:hover:bg-white/7"
          section="compare"
        >
          Compare
        </SectionLink>
        <ThemeToggle />
        <a
          className={buttonClass(
            "primary",
            "ml-0 min-h-11 px-4 sm:ml-1.5 max-[28rem]:w-auto",
          )}
          href={FIGMA_PLUGIN_URL}
          target="_blank"
          rel="noreferrer"
        >
          Open in Figma
          <ExternalArrowIcon />
        </a>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer
      className={`${pageWidth} mt-14 grid grid-cols-1 items-start gap-8 border-t border-border py-9 text-[0.82rem] text-muted-foreground sm:mt-20 sm:py-12 min-[68rem]:mt-28 min-[68rem]:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)] min-[68rem]:gap-16 min-[68rem]:pt-16 min-[68rem]:pb-8`}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex size-8 items-center justify-center"
          aria-hidden="true"
        >
          <Image
            className="size-full object-contain [scale:1.42]"
            src={roundIcon}
            alt=""
            width={40}
            height={40}
          />
        </span>
        <div className="flex flex-col gap-0.5">
          <strong className="text-site-ink">Figma to Code</strong>
          <p className="m-0 text-xs text-muted-foreground">
            Fast, flexible conversion. Private by design.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-[minmax(8rem,0.7fr)_minmax(0,1.3fr)] sm:gap-x-16 sm:gap-y-9 [&_a]:inline-flex [&_a]:min-h-8 [&_a]:items-center [&_a]:gap-1 [&_a]:text-[0.72rem] [&_a]:font-[540] [&_a]:text-muted-foreground [&_a]:no-underline [&_a]:transition-colors [&_a]:duration-150 hover:[&_a]:text-site-ink [&_svg]:size-3.5 [&_svg]:stroke-current [&_svg]:stroke-[1.7]">
        <div className="flex flex-col items-start gap-2">
          <strong className="text-[0.68rem] font-[680] tracking-[0.06em] text-site-ink uppercase">
            Product
          </strong>
          <div className="flex flex-wrap gap-x-4.5 gap-y-1">
            <SectionLink section="outputs">Frameworks</SectionLink>
            <SectionLink section="limitations">Limitations</SectionLink>
            <Link href="/privacy">Privacy</Link>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:col-start-2 sm:row-span-2 sm:row-start-1">
          <strong className="text-[0.68rem] font-[680] tracking-[0.06em] text-site-ink uppercase">
            Compare
          </strong>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1">
            {comparisons.map((comparison) => (
              <Link key={comparison.slug} href={`/compare/${comparison.slug}`}>
                {comparison.shortName}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 sm:col-start-1 sm:row-start-2">
          <strong className="text-[0.68rem] font-[680] tracking-[0.06em] text-site-ink uppercase">
            Open source
          </strong>
          <div className="flex flex-wrap gap-x-4.5 gap-y-1">
            <a
              className="group"
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
            >
              GitHub <ExternalArrowIcon />
            </a>
            <a
              className="group"
              href={`${GITHUB_URL}/issues`}
              target="_blank"
              rel="noreferrer"
            >
              Issues <ExternalArrowIcon />
            </a>
            <a
              className="group"
              href={FIGMA_PLUGIN_URL}
              target="_blank"
              rel="noreferrer"
            >
              Figma Community <ExternalArrowIcon />
            </a>
          </div>
        </div>
      </div>
      <div className="col-span-full flex flex-col items-start justify-between gap-1.5 border-t border-border pt-5 text-[0.68rem] sm:flex-row sm:items-center sm:gap-4 sm:pt-6">
        <span>Made in the open for designers and developers.</span>
        <span>No account. No telemetry. No design uploads.</span>
      </div>
    </footer>
  );
}

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell min-h-screen overflow-clip text-site-ink dark:[color-scheme:dark]">
      <a
        className="fixed top-3 left-3 z-100 -translate-y-[150%] rounded-[0.6rem] bg-site-ink px-4 py-[0.7rem] text-sm font-[650] text-white transition-transform duration-150 focus:translate-y-0"
        href="#main-content"
      >
        Skip to content
      </a>
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}

export function ExternalArrowIcon() {
  return (
    <svg
      className={externalArrowMotion}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}
