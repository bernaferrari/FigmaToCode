export type Comparison = {
  slug: string;
  name: string;
  shortName: string;
  title: string;
  description: string;
  intro: string;
  competitorStrength: string;
  ourStrength: string;
  cardSummary: string;
  sourceLabel: string;
  sourceUrl: string;
  sourceNote: string;
  pricing: {
    scale: string;
    accessibleLabel: string;
    note: string;
    url: string;
  };
  rows: Array<{
    topic: string;
    figmaToCode: string;
    competitor: string;
  }>;
};

export const comparisons: Comparison[] = [
  {
    slug: "anima",
    name: "Anima",
    shortName: "Anima",
    title:
      "Figma to Code vs Anima: private local generation or an AI platform?",
    description:
      "Compare the free, offline-first Figma to Code plugin with Anima for Figma exports, privacy, pricing, AI features and supported output.",
    intro:
      "Anima offers a broader AI cloud workflow. Figma to Code is a deterministic open-source plugin with network access disabled.",
    competitorStrength:
      "AI iteration, website cloning, APIs, or a managed platform—and your organization permits a cloud workflow.",
    ourStrength:
      "Designs must stay inside Figma; you need unlimited generation without an account; or you want auditable web and native starter code.",
    cardSummary:
      "Unlimited web and native scaffolds when designs must stay inside Figma.",
    sourceLabel: "Anima pricing and plan details",
    sourceUrl: "https://www.animaapp.com/pricing",
    sourceNote:
      "Anima lists 5 code generations in its Figma plugin on the free plan. Check its current page for the latest terms.",
    pricing: {
      scale: "$–$$$",
      accessibleLabel: "Five generations free, with paid plans available",
      note: "5 generations free",
      url: "https://www.animaapp.com/pricing",
    },
    rows: [
      {
        topic: "Processing model",
        figmaToCode: "Rules-based conversion inside the Figma plugin sandbox",
        competitor: "AI-assisted product and cloud platform",
      },
      {
        topic: "Network access",
        figmaToCode: "Disabled in the plugin manifest",
        competitor: "Required for account, AI and platform features",
      },
      {
        topic: "Usage model",
        figmaToCode: "Free with no generation credits",
        competitor: "Free usage limits plus paid plans",
      },
      {
        topic: "Best fit",
        figmaToCode: "Private scaffolds and auditable handoff",
        competitor: "AI-led iteration and broader automation",
      },
    ],
  },
  {
    slug: "locofy",
    name: "Locofy Lightning",
    shortName: "Locofy",
    title:
      "Figma to Code vs Locofy: offline code export or AI frontend workflow?",
    description:
      "Compare Figma to Code and Locofy across privacy, LDM tokens, AI generation, Dev Mode and framework output.",
    intro:
      "Locofy uses a Large Design Model and token-based workflow. Figma to Code avoids models, accounts and remote processing.",
    competitorStrength:
      "An AI-assisted frontend workflow is the priority, and optimizing designs for its model and managing a hosted account are acceptable.",
    ourStrength:
      "Zero network access, predictable conversion, native output and no usage credits matter more than AI interpretation.",
    cardSummary:
      "Predictable conversion, native output, and no usage credits or network access.",
    sourceLabel: "Locofy pricing and LDM token FAQ",
    sourceUrl: "https://www.locofy.ai/pricing",
    sourceNote:
      "Locofy describes LDM tokens as credits consumed when designs are converted. Check its current pricing page for plan details.",
    pricing: {
      scale: "$$–$$$",
      accessibleLabel: "Paid token plans through enterprise pricing",
      note: "Token plans through enterprise",
      url: "https://www.locofy.ai/pricing",
    },
    rows: [
      {
        topic: "Processing model",
        figmaToCode: "Deterministic TypeScript conversion pipeline",
        competitor: "Large Design Model-powered conversion",
      },
      {
        topic: "Network access",
        figmaToCode: "No allowed network domains",
        competitor: "Hosted product workflow",
      },
      {
        topic: "Usage model",
        figmaToCode: "Unlimited, free and open source",
        competitor: "LDM token-based plans",
      },
      {
        topic: "Best fit",
        figmaToCode: "Regulated or offline-constrained teams",
        competitor: "Teams seeking model-assisted frontend automation",
      },
    ],
  },
  {
    slug: "builder-visual-copilot",
    name: "Builder.io Visual Copilot",
    shortName: "Visual Copilot",
    title:
      "Figma to Code vs Visual Copilot: local conversion or codebase-aware AI?",
    description:
      "Compare Figma to Code with Builder.io Visual Copilot for privacy, AI usage, component mapping, codebase context and pricing.",
    intro:
      "Visual Copilot uses AI, codebase context and component mapping. Figma to Code converts the selected structure locally without inspecting a repository or calling an LLM.",
    competitorStrength:
      "Importing your components, prompt iteration and deep codebase integration justify a connected AI workflow.",
    ourStrength:
      "The design cannot be uploaded, the repository should stay disconnected, or a transparent one-click scaffold is the right handoff.",
    cardSummary:
      "A transparent one-click scaffold without uploading the design or connecting a repository.",
    sourceLabel: "How Builder uses AI",
    sourceUrl: "https://www.builder.io/c/docs/ai-use",
    sourceNote:
      "Builder documents where proprietary and third-party models are used, including optional quality-code generation. Review its current documentation for details.",
    pricing: {
      scale: "$–$$$",
      accessibleLabel: "Free tier through enterprise pricing",
      note: "Free tier through custom enterprise",
      url: "https://www.builder.io/pricing",
    },
    rows: [
      {
        topic: "Processing model",
        figmaToCode: "Local rules-based generator",
        competitor: "AI and compiler-based generation",
      },
      {
        topic: "Codebase context",
        figmaToCode: "None (by design)",
        competitor: "Can use components, tokens and repository context",
      },
      {
        topic: "Network access",
        figmaToCode: "Disabled",
        competitor: "Required for its connected workflow",
      },
      {
        topic: "Best fit",
        figmaToCode: "Private, portable starter code",
        competitor: "Codebase-aware AI implementation",
      },
    ],
  },
  {
    slug: "figma-code-connect",
    name: "Figma Code Connect",
    shortName: "Code Connect",
    title:
      "Figma to Code vs Code Connect: generate a scaffold or map real components?",
    description:
      "Understand the difference between automatic Figma-to-code generation and Figma Code Connect for design-system component mapping.",
    intro:
      "Code Connect maps Figma components to existing code. Figma to Code generates a new visual scaffold from selected layers.",
    competitorStrength:
      "You have a mature design system and want Dev Mode to show the exact imports, props and examples your team already ships.",
    ourStrength:
      "No mapped component exists yet; you need a scaffold from arbitrary layers; or you want generation outside Dev Mode.",
    cardSummary:
      "Quick scaffolds from arbitrary layers in Design or Dev Mode, with no component mapping required.",
    sourceLabel: "Figma Code Connect documentation",
    sourceUrl: "https://developers.figma.com/docs/code-connect/",
    sourceNote:
      "Figma describes Code Connect as a bridge between design components and existing code. Availability depends on Figma plan and seat type.",
    pricing: {
      scale: "$$$",
      accessibleLabel: "Organization or Enterprise Figma plan pricing",
      note: "Organization or Enterprise plan",
      url: "https://www.figma.com/pricing/",
    },
    rows: [
      {
        topic: "Primary job",
        figmaToCode: "Generate new code from selected layers",
        competitor: "Map designs to existing production components",
      },
      {
        topic: "Setup",
        figmaToCode: "Install and select a layer",
        competitor: "Create and publish component mappings",
      },
      {
        topic: "Output",
        figmaToCode: "Editable HTML, Tailwind, Flutter or SwiftUI scaffold",
        competitor: "Your existing component imports and examples",
      },
      {
        topic: "Best fit",
        figmaToCode: "Exploration and unmapped designs",
        competitor: "Established design systems",
      },
    ],
  },
];

export function getComparison(slug: string) {
  return comparisons.find((comparison) => comparison.slug === slug);
}
