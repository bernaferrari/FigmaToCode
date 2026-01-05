"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Layers,
  Palette,
  Zap,
  Check,
} from "lucide-react";

const categories = [
  {
    id: "layout",
    name: "Layout",
    icon: Layers,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    headline: "Pixel-perfect layouts, automatically",
    description:
      "Figma's auto-layout becomes flexbox. Constraints become responsive. No manual tweaking required.",
    features: [
      "Auto-layout → Flexbox / Row / Column",
      "Constraints → Responsive positioning",
      "Padding & spacing preserved exactly",
      "Nested frames handled correctly",
    ],
    visual: (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
          <div className="w-8 h-8 rounded bg-cyan-500/20" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2 w-20 rounded bg-cyan-500/30" />
            <div className="h-1.5 w-28 rounded bg-cyan-500/15" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 rounded bg-cyan-500/20 flex items-center justify-center">
            <span className="text-[10px] text-cyan-500 font-mono">flex-1</span>
          </div>
          <div className="w-16 h-10 rounded bg-cyan-500/10 flex items-center justify-center">
            <span className="text-[10px] text-cyan-500/70 font-mono">w-16</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "styling",
    name: "Styling",
    icon: Palette,
    color: "text-fuchsia-500",
    bgColor: "bg-fuchsia-500/10",
    headline: "Every detail, preserved",
    description:
      "Colors, typography, shadows, borders — all converted to clean, maintainable code using your design tokens.",
    features: [
      "Design tokens → CSS variables",
      "Typography with full font stacks",
      "Shadows, blurs & blend modes",
      "Border radius per corner",
    ],
    visual: (
      <div className="space-y-3">
        <div className="flex gap-2">
          {["#8B5CF6", "#D946EF", "#EC4899", "#F43F5E"].map((color) => (
            <div
              key={color}
              className="w-8 h-8 rounded-lg shadow-sm"
              style={{ background: color }}
            />
          ))}
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-r from-fuchsia-500/10 to-violet-500/10 border border-fuchsia-500/20">
          <div className="text-xs font-medium text-fuchsia-400 mb-1">--color-primary</div>
          <div className="text-[10px] font-mono text-muted-foreground">oklch(0.65 0.25 280)</div>
        </div>
      </div>
    ),
  },
  {
    id: "smart",
    name: "Smart Export",
    icon: Zap,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    headline: "Intelligent, not just accurate",
    description:
      "Values snap to your framework's scale. Layer names become class names. Images embed or export. It just works.",
    features: [
      "17px → Tailwind's 4 (16px)",
      "Layer names → semantic classes",
      "Images → Base64 or external",
      "Vectors → optimized SVG",
    ],
    visual: (
      <div className="space-y-2 font-mono text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground line-through">17px</span>
          <span className="text-amber-500">→</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500">p-4</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground line-through">#6366f1</span>
          <span className="text-amber-500">→</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500">indigo-500</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Frame 47</span>
          <span className="text-amber-500">→</span>
          <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500">.card</span>
        </div>
      </div>
    ),
  },
];

export function Features() {
  const [activeCategory, setActiveCategory] = useState("layout");
  const active = categories.find((c) => c.id === activeCategory)!;

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-emerald-500 mb-4"
          >
            Features
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Built for real-world designs
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Not just rectangles — complex production Figma files with all their
            nuances.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                activeCategory === cat.id
                  ? `${cat.bgColor} ${cat.color} border-current`
                  : "border-border hover:border-muted-foreground/50 text-muted-foreground"
              }`}
            >
              <cat.icon size={18} />
              <span className="font-medium text-sm">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Active Category Content */}
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Info */}
          <div className="glass rounded-xl p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-lg ${active.bgColor} ${active.color} flex items-center justify-center`}
              >
                <active.icon size={20} />
              </div>
              <h3 className="font-semibold text-lg">{active.headline}</h3>
            </div>

            <p className="text-muted-foreground mb-6">{active.description}</p>

            <ul className="space-y-2 mt-auto">
              {active.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Check size={16} className={active.color} />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual */}
          <div className="glass rounded-xl p-6 flex items-center justify-center">
            <div className="w-full max-w-[240px]">{active.visual}</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
