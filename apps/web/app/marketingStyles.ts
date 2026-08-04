import { cn } from "../lib/utils";

export const pageWidth =
  "mx-auto w-[min(calc(100%_-_1.5rem),90rem)] sm:w-[min(calc(100%_-_2.5rem),90rem)]";

export const sectionKicker =
  "mb-3.5 font-mono text-xs font-[650] tracking-[0.085em] text-site-green-dark uppercase";

export const sectionKickerInverse =
  "mb-3.5 font-mono text-xs font-[650] tracking-[0.085em] text-[oklch(0.82_0.13_151)] uppercase";

export const sectionHeading =
  "m-0 text-balance text-[clamp(2.1rem,4vw,3.8rem)] leading-[1.02] font-[670] tracking-[-0.055em] text-site-ink";

export const bodyCopy = "text-pretty leading-[1.7] text-site-muted";

const buttonBase =
  "group inline-flex min-h-12.5 items-center justify-center gap-2 rounded-xl border px-[1.15rem] text-sm font-[650] no-underline transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out active:scale-[0.96] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-current [&_svg]:stroke-[1.7] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]";

const buttonVariants = {
  primary:
    "border-transparent bg-site-ink text-white shadow-[0_1px_1px_oklch(0_0_0/12%),0_6px_16px_oklch(0_0_0/10%)] hover:bg-[oklch(0.24_0.025_154)] dark:bg-[oklch(0.92_0.01_154)] dark:text-[oklch(0.14_0.019_154)] dark:hover:bg-[oklch(0.84_0.012_154)]",
  secondary:
    "border-site-border bg-white/72 text-site-ink hover:border-site-border-strong hover:bg-white dark:bg-white/5 dark:hover:bg-white/9",
  inverse:
    "border-transparent bg-white text-[oklch(0.14_0.019_154)] shadow-[0_1px_2px_oklch(0_0_0/12%)] hover:bg-[oklch(0.92_0.008_154)]",
  darkGhost:
    "border-[oklch(0.38_0.025_154)] bg-transparent text-white hover:border-[oklch(0.55_0.03_154)] hover:bg-white/8",
} as const;

export function buttonClass(
  variant: keyof typeof buttonVariants,
  className?: string,
) {
  return cn(buttonBase, buttonVariants[variant], className);
}

export const heroActions =
  "mt-7 flex flex-wrap items-center justify-center gap-3 max-[28rem]:items-stretch max-[28rem]:flex-col";

export const arrowMotion =
  "transition-transform duration-150 ease-out group-hover:translate-x-0.75";

export const externalArrowMotion =
  "transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5";

export const home = {
  hero: "relative isolate mx-auto grid min-h-[42rem] w-[min(calc(100%_-_1.5rem),88rem)] grid-cols-1 place-items-center gap-12 py-18 text-left sm:w-[min(calc(100%_-_2.5rem),88rem)] sm:py-24 min-[68rem]:min-h-[47rem] min-[68rem]:grid-cols-[minmax(0,1.08fr)_minmax(29rem,0.92fr)] min-[68rem]:gap-[clamp(3rem,7vw,7rem)] min-[68rem]:py-[clamp(5.5rem,9vw,8.5rem)]",
  heroCopy: "max-w-3xl",
  heroKicker:
    "mb-5 inline-flex items-center gap-2 font-mono text-[0.68rem] font-[650] tracking-[0.08em] text-site-green-dark uppercase [&>span]:size-2 [&>span]:rounded-full [&>span]:bg-site-green [&>span]:shadow-[0_0_0_0.3rem_oklch(0.66_0.18_151/11%)]",
  heroTitle:
    "m-0 max-w-[14.5ch] text-balance text-[clamp(3.65rem,5.8vw,5.95rem)] leading-[0.94] font-[660] tracking-[-0.064em] text-site-ink max-md:text-[clamp(3rem,14vw,4.8rem)]",
  heroDescription:
    "mt-6 max-w-2xl text-pretty text-[clamp(1.05rem,1.5vw,1.22rem)] leading-[1.6] text-site-muted",
  proofList:
    "mt-6 flex list-none flex-wrap gap-x-5 gap-y-3 p-0 text-[0.78rem] font-[580] text-site-muted max-[28rem]:flex-col max-[28rem]:items-start [&_li]:inline-flex [&_li]:items-center [&_li]:gap-1.5 [&_svg]:size-3.5 [&_svg]:stroke-site-green-dark [&_svg]:stroke-2 [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]",
  manifest:
    "pointer-events-none min-w-0 overflow-hidden rounded-3xl bg-[oklch(0.14_0.019_154)] text-white shadow-[0_0_0_1px_oklch(1_0_0/8%),0_2px_3px_oklch(0_0_0/14%),0_24px_55px_-16px_oklch(0.18_0.04_154/32%),0_54px_110px_-34px_oklch(0.18_0.04_154/25%)] select-none max-[68rem]:w-full max-[68rem]:max-w-2xl",
  manifestToolbar:
    "flex min-h-[4.6rem] items-center gap-3 border-b border-[oklch(0.32_0.015_154)] px-4 [&>div]:flex [&>div]:min-w-0 [&>div]:flex-1 [&>div]:flex-col [&>div]:gap-0.5 [&_strong]:text-[0.78rem] [&_strong]:font-[650] [&>div_span]:text-[0.65rem] [&>div_span]:text-[oklch(0.66_0.015_154)]",
  manifestFileIcon:
    "grid size-9.5 shrink-0 place-items-center rounded-xl border border-[oklch(0.38_0.02_154)] bg-[oklch(0.2_0.02_154)] font-mono text-[0.72rem] font-bold text-[oklch(0.76_0.15_151)]",
  verifiedChip:
    "inline-flex items-center gap-1.5 rounded-full border border-[oklch(0.7_0.15_151/24%)] bg-[oklch(0.65_0.16_151/9%)] px-2.5 py-1.5 text-[0.62rem] font-[640] text-[oklch(0.78_0.15_151)] max-md:hidden [&_svg]:size-3 [&_svg]:stroke-2",
  manifestCode:
    "m-0 min-h-68 p-[clamp(1.5rem,4vw,2.5rem)] font-mono text-[clamp(0.82rem,1.25vw,1rem)] leading-[1.9] whitespace-pre-wrap max-md:min-h-64",
  manifestFlow:
    "grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2.5 border-t border-[oklch(0.32_0.015_154)] p-4 text-center text-[0.65rem] text-[oklch(0.72_0.015_154)] max-md:gap-1 max-md:px-3 max-md:py-3 max-md:text-[0.58rem] [&_svg]:w-6 [&_svg]:stroke-[oklch(0.55_0.03_154)] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]",
  trustStrip:
    "relative z-2 mx-auto -mt-9 grid w-[min(calc(100%_-_1.5rem),88rem)] grid-cols-1 overflow-hidden rounded-2xl bg-[oklch(0.995_0.002_145/92%)] shadow-[0_0_0_1px_oklch(0.18_0.02_154/5%),0_1px_3px_oklch(0.18_0.03_154/5%),0_12px_32px_-18px_oklch(0.18_0.03_154/18%)] backdrop-blur-xl sm:w-[min(calc(100%_-_2.5rem),88rem)] sm:grid-cols-2 lg:grid-cols-4 dark:bg-[oklch(0.17_0.016_154/92%)] [&>div]:flex [&>div]:min-h-25 [&>div]:flex-col [&>div]:justify-center [&>div]:gap-1.5 [&>div]:border-t [&>div]:border-site-border [&>div]:px-[clamp(1rem,3vw,2.5rem)] sm:[&>div]:min-h-30 lg:[&>div]:border-t-0 lg:[&>div+div]:border-l [&_strong]:text-[clamp(1.65rem,3vw,2.35rem)] [&_strong]:font-[660] [&_strong]:tracking-[-0.05em] [&_strong]:text-site-ink [&_strong]:tabular-nums [&_span]:text-[0.72rem] [&_span]:text-site-muted",
  previewSection:
    "mx-auto w-[min(calc(100%_-_1.5rem),90rem)] pt-24 pb-28 sm:w-[min(calc(100%_-_2.5rem),90rem)] sm:pt-40",
  sectionHeading:
    "mb-8 grid grid-cols-1 items-end gap-5 md:grid-cols-[1fr_minmax(17rem,28rem)] md:gap-12 [&>p]:m-0 [&>p]:text-pretty [&>p]:leading-[1.65] [&>p]:text-site-muted",
  privacy:
    "mx-auto grid w-[min(calc(100%_-_1.5rem),88rem)] grid-cols-1 gap-12 rounded-[1.6rem] bg-[oklch(0.14_0.019_154)] p-[clamp(2rem,6vw,5.5rem)] text-white shadow-[0_0_0_1px_oklch(1_0_0/7%),0_30px_72px_-38px_oklch(0.18_0.04_154/42%)] sm:w-[min(calc(100%_-_2.5rem),88rem)] min-[68rem]:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)] min-[68rem]:gap-[clamp(4rem,9vw,9rem)]",
  privacyCopy:
    "[&_h2]:m-0 [&_h2]:text-balance [&_h2]:text-[clamp(2.4rem,4.7vw,4.5rem)] [&_h2]:leading-[0.98] [&_h2]:font-[650] [&_h2]:tracking-[-0.055em] [&_h2]:text-white [&>p:not(:first-child)]:mt-6 [&>p:not(:first-child)]:max-w-xl [&>p:not(:first-child)]:leading-[1.7] [&>p:not(:first-child)]:text-[oklch(0.72_0.014_154)]",
  textLinkInverse:
    "group mt-5 inline-flex min-h-11 items-center gap-2 text-[0.8rem] font-[650] text-[oklch(0.82_0.13_151)] no-underline [&_svg]:size-4 [&_svg]:stroke-current [&_svg]:stroke-[1.7]",
  privacyFacts:
    "[&>article]:grid [&>article]:grid-cols-[2.75rem_1fr] [&>article]:gap-5 [&>article]:py-6 [&>article+article]:border-t [&>article+article]:border-[oklch(0.32_0.015_154)] [&_h3]:m-0 [&_h3]:text-[0.95rem] [&_h3]:font-[630] [&_h3]:tracking-[-0.015em] [&_p]:mt-1.5 [&_p]:text-[0.78rem] [&_p]:leading-[1.6] [&_p]:text-[oklch(0.69_0.014_154)]",
  featureIcon:
    "grid size-10 place-items-center rounded-xl bg-[oklch(0.68_0.15_151/12%)] text-[oklch(0.76_0.14_151)] [&_svg]:size-5 [&_svg]:stroke-current [&_svg]:stroke-[1.45] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]",
  largeSection:
    "mx-auto w-[min(calc(100%_-_1.5rem),88rem)] py-24 sm:w-[min(calc(100%_-_2.5rem),88rem)] sm:py-36",
  centeredHeading:
    "mx-auto max-w-4xl text-center [&>p:last-child]:mx-auto [&>p:last-child]:mt-5 [&>p:last-child]:max-w-3xl [&>p:last-child]:leading-[1.7] [&>p:last-child]:text-site-muted",
  outputGrid: "mt-16 grid grid-cols-1 gap-3.5 lg:grid-cols-12",
  process:
    "mx-auto grid w-[min(calc(100%_-_1.5rem),88rem)] grid-cols-1 gap-12 border-t border-site-border py-24 sm:w-[min(calc(100%_-_2.5rem),88rem)] sm:py-36 min-[68rem]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] min-[68rem]:gap-[clamp(4rem,10vw,10rem)]",
  processIntro:
    "[&>p:last-child]:mt-5 [&>p:last-child]:max-w-lg [&>p:last-child]:leading-[1.7] [&>p:last-child]:text-site-muted",
  processList:
    "m-0 list-none border-t border-site-border p-0 [&_li]:grid [&_li]:grid-cols-[2.5rem_1fr] [&_li]:gap-5 [&_li]:border-b [&_li]:border-site-border [&_li]:py-5 [&_li>span]:text-[0.68rem] [&_li>span]:font-bold [&_li>span]:tracking-[0.08em] [&_li>span]:text-site-green-dark [&_li>span]:tabular-nums [&_h3]:m-0 [&_h3]:text-[0.95rem] [&_h3]:font-[650] [&_h3]:text-site-ink [&_p]:mt-1.5 [&_p]:text-[0.8rem] [&_p]:leading-[1.6] [&_p]:text-site-muted",
  limitations:
    "mx-auto w-[min(calc(100%_-_1.5rem),88rem)] border-t border-site-border py-24 sm:w-[min(calc(100%_-_2.5rem),88rem)] sm:py-36",
  capabilityGrid:
    "mt-16 grid grid-cols-1 overflow-hidden rounded-[1.35rem] bg-site-surface shadow-[0_0_0_1px_oklch(0.18_0.02_154/5%),0_1px_3px_oklch(0.18_0.03_154/5%),0_12px_32px_-18px_oklch(0.18_0.03_154/18%)] min-[68rem]:grid-cols-3 min-[68rem]:[&>article+article]:border-l max-[68rem]:[&>article+article]:border-t [&>article+article]:border-site-border",
  comparison:
    "relative mx-auto w-[min(calc(100%_-_1.5rem),88rem)] overflow-hidden rounded-[1.75rem] bg-[oklch(0.135_0.019_154)] bg-[radial-gradient(circle_at_86%_-12%,oklch(0.54_0.13_151/32%)_0%,oklch(0.28_0.06_151/14%)_26%,transparent_54%)] p-[clamp(2rem,6vw,5.5rem)] text-white shadow-[0_0_0_1px_oklch(1_0_0/7%),0_28px_70px_-34px_oklch(0.18_0.04_154/45%)] sm:w-[min(calc(100%_-_2.5rem),88rem)]",
  comparisonHeading:
    "grid grid-cols-1 items-end gap-6 min-[68rem]:grid-cols-[minmax(0,1fr)_minmax(18rem,29rem)] min-[68rem]:gap-16 [&_h2]:m-0 [&_h2]:text-balance [&_h2]:text-[clamp(2.4rem,4.7vw,4.5rem)] [&_h2]:leading-[0.98] [&_h2]:font-[650] [&_h2]:tracking-[-0.055em] [&_h2]:text-white [&>p]:m-0 [&>p]:leading-[1.7] [&>p]:text-[oklch(0.7_0.014_154)]",
  comparisonCards:
    "mt-12 grid grid-cols-1 gap-3 md:grid-cols-2 [&>article]:grid [&>article]:content-start [&>article]:gap-2 [&>article]:rounded-[1.1rem] [&>article]:bg-white/3 [&>article]:p-[clamp(1.4rem,3vw,2rem)] [&>article]:transition-[background-color,transform] [&>article]:duration-150 [&>article:hover]:bg-white/5 [&>article:active]:scale-[0.99] [&_h3]:m-0 [&_h3]:text-balance [&_h3]:text-[clamp(1.35rem,2.2vw,1.8rem)] [&_h3]:leading-[1.05] [&_h3]:font-[640] [&_h3]:tracking-[-0.035em] [&_p]:m-0 [&_p]:max-w-2xl [&_p]:text-[0.78rem] [&_p]:leading-[1.6] [&_p]:text-[oklch(0.7_0.014_154)] [&_a]:group [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-start [&_a]:gap-1.5 [&_a]:pt-1.5 [&_a]:text-[0.72rem] [&_a]:font-[640] [&_a]:text-[oklch(0.78_0.14_151)] [&_a]:no-underline [&_a]:whitespace-nowrap [&_svg]:size-4 [&_svg]:stroke-current [&_svg]:stroke-[1.7]",
  decision:
    "mx-auto grid w-[min(calc(100%_-_1.5rem),88rem)] grid-cols-1 gap-12 border-t border-site-border py-24 sm:w-[min(calc(100%_-_2.5rem),88rem)] sm:py-36 min-[68rem]:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] min-[68rem]:gap-[clamp(4rem,9vw,9rem)]",
  decisionColumns:
    "grid grid-cols-1 gap-6 md:grid-cols-2 [&>article]:grid [&>article]:grid-cols-[2.8rem_minmax(0,1fr)] [&>article]:content-start [&>article]:items-start [&>article]:gap-x-4 [&>article]:gap-y-3 [&>article]:border-t [&>article]:border-site-border [&>article]:pt-6 [&_h3]:col-start-2 [&_h3]:m-0 [&_h3]:mt-1 [&_h3]:text-[1.35rem] [&_h3]:leading-[1.12] [&_h3]:font-[640] [&_h3]:tracking-[-0.035em] [&_h3]:text-site-ink [&_p]:col-start-2 [&_p]:m-0 [&_p]:text-[0.8rem] [&_p]:leading-[1.65] [&_p]:text-site-muted",
  decisionIcon:
    "grid size-11 place-items-center rounded-[0.8rem] bg-[oklch(0.79_0.1_151/18%)] text-site-green-dark [&_svg]:size-5 [&_svg]:stroke-current [&_svg]:stroke-[1.45]",
  faq: "mx-auto grid w-[min(calc(100%_-_1.5rem),88rem)] grid-cols-1 gap-12 border-t border-site-border py-24 sm:w-[min(calc(100%_-_2.5rem),88rem)] sm:py-36 min-[68rem]:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)] min-[68rem]:gap-[clamp(4rem,10vw,10rem)]",
  finalCta:
    "mx-auto w-[min(calc(100%_-_1.5rem),88rem)] rounded-[1.6rem] bg-[oklch(0.14_0.019_154)] bg-[radial-gradient(circle_at_85%_10%,oklch(0.46_0.12_151/35%),transparent_30%)] p-[clamp(2.2rem,7vw,6rem)] text-center text-white sm:w-[min(calc(100%_-_2.5rem),88rem)] [&_h2]:m-0 [&_h2]:text-balance [&_h2]:text-[clamp(2.4rem,4.7vw,4.5rem)] [&_h2]:leading-[0.98] [&_h2]:font-[650] [&_h2]:tracking-[-0.055em] [&_h2]:text-white [&>p:not(:first-child)]:mx-auto [&>p:not(:first-child)]:mt-5 [&>p:not(:first-child)]:max-w-2xl [&>p:not(:first-child)]:leading-[1.65] [&>p:not(:first-child)]:text-[oklch(0.7_0.014_154)]",
} as const;

const outputCardBase =
  "relative min-h-88 overflow-hidden rounded-[1.35rem] p-[clamp(1.6rem,3.5vw,2.65rem)] shadow-[0_0_0_1px_oklch(0.18_0.02_154/5%),0_1px_3px_oklch(0.18_0.03_154/5%),0_12px_32px_-18px_oklch(0.18_0.03_154/18%)] lg:col-span-6 [&_h3]:mt-15 [&_h3]:max-w-[18ch] [&_h3]:text-balance [&_h3]:text-[clamp(1.65rem,3vw,2.6rem)] [&_h3]:leading-[1.02] [&_h3]:font-[640] [&_h3]:tracking-[-0.045em] [&_h3]:text-site-ink [&>p]:mt-4 [&>p]:max-w-2xl [&>p]:text-[0.85rem] [&>p]:leading-[1.65] [&>p]:text-site-muted";

const outputCardVariants = {
  web: "[background-color:var(--site-surface)] [background-image:radial-gradient(circle_at_92%_8%,oklch(0.83_0.13_151/52%)_0%,oklch(0.9_0.07_151/24%)_24%,transparent_52%)] lg:col-span-7",
  tailwind:
    "bg-[oklch(0.18_0.02_154)] text-white lg:col-span-5 [&_h3]:text-white [&>p]:text-[oklch(0.68_0.014_154)]",
  flutter:
    "min-h-76 [background-color:oklch(0.985_0.008_218)] [background-image:radial-gradient(circle_at_90%_100%,oklch(0.82_0.08_218/42%),transparent_48%)] lg:col-span-5 [&_h3]:mt-10",
  swiftui:
    "min-h-76 [background-color:oklch(0.988_0.007_61)] [background-image:radial-gradient(circle_at_88%_94%,oklch(0.87_0.12_61/44%),transparent_45%)] lg:col-span-7 [&_h3]:mt-10",
} as const;

export function outputCardClass(variant: keyof typeof outputCardVariants) {
  return cn(outputCardBase, outputCardVariants[variant]);
}

const capabilityBase =
  "min-h-0 p-[clamp(1.6rem,3vw,2.25rem)] min-[68rem]:min-h-108 [&_h3]:mt-13 [&_h3]:max-w-[15ch] [&_h3]:text-[1.35rem] [&_h3]:leading-[1.12] [&_h3]:font-[640] [&_h3]:tracking-[-0.03em] [&_h3]:text-site-ink [&_ul]:mt-6 [&_ul]:flex [&_ul]:list-none [&_ul]:flex-col [&_ul]:gap-3 [&_ul]:p-0 [&_ul]:text-[0.78rem] [&_ul]:leading-[1.45] [&_ul]:text-site-muted [&_li]:relative [&_li]:pl-3.5 [&_li]:before:absolute [&_li]:before:top-[0.55em] [&_li]:before:left-0 [&_li]:before:size-1 [&_li]:before:rounded-full [&_li]:before:bg-current";

const capabilityVariants = {
  supported: "bg-[oklch(0.97_0.018_151)] dark:bg-[oklch(0.19_0.035_151)]",
  partial: "bg-[oklch(0.982_0.014_82)] dark:bg-[oklch(0.2_0.03_82)]",
  absent: "bg-[oklch(0.975_0.004_154)] dark:bg-[oklch(0.185_0.012_154)]",
} as const;

export function capabilityCardClass(variant: keyof typeof capabilityVariants) {
  return cn(capabilityBase, capabilityVariants[variant]);
}

export const editorial = {
  page: `${pageWidth} pt-6`,
  breadcrumbs:
    "flex min-h-12 items-center gap-2 text-[0.7rem] text-site-muted [&_a]:text-inherit [&_a]:no-underline [&_a:hover]:text-site-ink",
  article: "mx-auto max-w-[76rem]",
  hero: "max-w-5xl py-[clamp(4.5rem,9vw,8rem)] [&_h1]:m-0 [&_h1]:max-w-[15ch] [&_h1]:text-balance [&_h1]:text-[clamp(3.25rem,6.5vw,6.2rem)] [&_h1]:leading-[0.94] [&_h1]:font-[660] [&_h1]:tracking-[-0.06em] [&_h1]:text-site-ink [&>p:not(:first-child)]:mt-6 [&>p:not(:first-child)]:max-w-3xl [&>p:not(:first-child)]:text-[clamp(1rem,1.5vw,1.15rem)] [&>p:not(:first-child)]:leading-[1.7] [&>p:not(:first-child)]:text-site-muted",
  ruledSection: "border-t border-site-border py-24",
  verdict:
    "border-t border-site-border py-24 [&>div]:mt-10 [&>div]:grid [&>div]:grid-cols-1 [&>div]:gap-4 md:[&>div]:grid-cols-2 [&_article]:rounded-2xl [&_article]:border [&_article]:border-site-border [&_article]:bg-white [&_article]:p-6 dark:[&_article]:bg-site-surface [&_article>span]:text-[0.68rem] [&_article>span]:font-[680] [&_article>span]:tracking-[0.07em] [&_article>span]:text-site-green-dark [&_article>span]:uppercase [&_article_p]:mt-4 [&_article_p]:text-[1.1rem] [&_article_p]:leading-[1.55] [&_article_p]:text-site-ink",
  heading: "max-w-4xl",
  tableWrap:
    "mt-10 overflow-x-auto rounded-2xl border border-site-border bg-white overscroll-x-contain dark:bg-site-surface",
  table:
    "w-full min-w-160 table-fixed border-collapse [&_tr+tr>*]:border-t [&_tr+tr>*]:border-site-border [&_tr>*]:h-20 [&_tr>*]:w-[36.5%] [&_tr>*]:px-5 [&_tr>*]:py-4 [&_tr>*]:text-left [&_tr>*]:align-middle [&_tr>*]:text-[0.75rem] [&_tr>*]:leading-[1.5] [&_tr>*]:font-[450] [&_tr>*]:text-site-muted [&_tr>*:first-child]:w-[27%] [&_tr>*+*]:border-l [&_tr>*+*]:border-site-border [&_th]:font-[640] [&_th]:text-site-ink [&_thead_tr]:bg-[oklch(0.96_0.006_145)] dark:[&_thead_tr]:bg-[oklch(0.21_0.016_154)] [&_thead_tr>*]:h-14 [&_thead_tr>*]:font-[680] [&_thead_tr>*]:text-site-ink",
  explanation:
    "grid grid-cols-1 gap-12 border-t border-site-border py-24 min-[68rem]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] min-[68rem]:gap-[clamp(4rem,9vw,9rem)] [&>div:last-child_p]:m-0 [&>div:last-child_p]:leading-[1.75] [&>div:last-child_p]:text-site-muted [&>div:last-child_p+p]:mt-5",
  sourceNote:
    "flex flex-col items-start justify-between gap-6 rounded-2xl border border-site-border bg-white p-6 dark:bg-site-surface sm:flex-row sm:items-center [&>div]:max-w-3xl [&_span]:text-[0.65rem] [&_span]:font-[680] [&_span]:tracking-[0.07em] [&_span]:text-site-green-dark [&_span]:uppercase [&_strong]:mt-1.5 [&_strong]:block [&_strong]:text-[0.9rem] [&_strong]:text-site-ink [&_p]:mt-2 [&_p]:text-[0.75rem] [&_p]:leading-[1.55] [&_p]:text-site-muted [&>a]:group [&>a]:inline-flex [&>a]:shrink-0 [&>a]:items-center [&>a]:gap-1.5 [&>a]:text-[0.72rem] [&>a]:font-[650] [&>a]:text-site-ink [&>a]:no-underline [&_svg]:size-4 [&_svg]:stroke-current [&_svg]:stroke-[1.7]",
  next: "mt-16 mb-16 grid grid-cols-1 gap-10 sm:mt-24 sm:mb-24 min-[68rem]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] min-[68rem]:gap-20 [&>div:last-child]:border-t [&>div:last-child]:border-site-border [&_a]:group [&_a]:grid [&_a]:min-h-14 [&_a]:grid-cols-[1fr_auto] [&_a]:items-center [&_a]:gap-3 [&_a]:border-b [&_a]:border-site-border [&_a]:text-site-ink [&_a]:no-underline [&_a_strong]:text-[0.78rem] [&_a_strong]:font-[640] [&_svg]:size-4 [&_svg]:stroke-current [&_svg]:stroke-[1.7]",
  cta: "mt-8 flex flex-col items-start justify-between gap-12 rounded-[1.6rem] bg-[oklch(0.14_0.019_154)] bg-[radial-gradient(circle_at_85%_10%,oklch(0.46_0.12_151/35%),transparent_30%)] p-[clamp(2.2rem,7vw,6rem)] text-left text-white min-[68rem]:flex-row min-[68rem]:items-end [&>div:first-child]:max-w-3xl [&_h2]:m-0 [&_h2]:text-balance [&_h2]:text-[clamp(2.2rem,4vw,3.8rem)] [&_h2]:leading-[0.98] [&_h2]:font-[650] [&_h2]:tracking-[-0.055em] [&_h2]:text-white [&>div>p:not(:first-child)]:mt-5 [&>div>p:not(:first-child)]:max-w-2xl [&>div>p:not(:first-child)]:leading-[1.65] [&>div>p:not(:first-child)]:text-[oklch(0.7_0.014_154)]",
  privacyProof:
    "grid grid-cols-1 items-center gap-12 rounded-[1.3rem] bg-[oklch(0.14_0.019_154)] p-[clamp(2rem,5vw,4.5rem)] text-white min-[68rem]:grid-cols-[minmax(0,1fr)_minmax(20rem,0.75fr)] min-[68rem]:gap-[clamp(3rem,8vw,8rem)] [&_h2]:text-white [&>div>p:last-child]:mt-5 [&>div>p:last-child]:leading-[1.7] [&>div>p:last-child]:text-[oklch(0.7_0.014_154)] [&_p_code]:rounded-sm [&_p_code]:bg-white/8 [&_p_code]:px-1 [&_p_code]:py-0.5 [&_p_code]:text-[0.82em] [&_p_code]:text-[oklch(0.8_0.13_151)] [&_pre]:m-0 [&_pre]:overflow-x-auto [&_pre]:rounded-[0.9rem] [&_pre]:border [&_pre]:border-[oklch(0.35_0.02_154)] [&_pre]:bg-[oklch(0.1_0.014_154)] [&_pre]:p-6 [&_pre]:font-mono [&_pre]:text-[0.78rem] [&_pre]:leading-[1.7] [&_pre]:text-[oklch(0.8_0.13_151)]",
  privacyDetails:
    "grid grid-cols-1 gap-12 border-t border-site-border py-24 min-[68rem]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] min-[68rem]:gap-[clamp(4rem,9vw,9rem)] [&_ol]:m-0 [&_ol]:list-none [&_ol]:border-t [&_ol]:border-site-border [&_ol]:p-0 [&_li]:grid [&_li]:grid-cols-[2.5rem_1fr] [&_li]:gap-5 [&_li]:border-b [&_li]:border-site-border [&_li]:py-5 [&_li>span]:text-[0.68rem] [&_li>span]:font-bold [&_li>span]:tracking-[0.08em] [&_li>span]:text-site-green-dark [&_li>span]:tabular-nums [&_h3]:m-0 [&_h3]:text-[0.95rem] [&_h3]:font-[650] [&_h3]:text-site-ink [&_p]:mt-1.5 [&_p]:text-[0.8rem] [&_p]:leading-[1.6] [&_p]:text-site-muted",
  privacyBoundary:
    "grid grid-cols-1 gap-12 border-t border-site-border py-24 min-[68rem]:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] min-[68rem]:gap-[clamp(4rem,9vw,9rem)] [&>p]:m-0 [&>p]:leading-[1.75] [&>p]:text-site-muted",
} as const;
