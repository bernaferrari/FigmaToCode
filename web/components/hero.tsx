"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { frameworkIcons } from "@/components/icons";

const frameworks = [
  { name: "HTML", icon: frameworkIcons.html },
  { name: "Tailwind", icon: frameworkIcons.tailwind },
  { name: "Flutter", icon: frameworkIcons.flutter },
  { name: "SwiftUI", icon: frameworkIcons.swiftui },
  { name: "Compose", icon: frameworkIcons.compose },
];

export function Hero() {
  return (
    <section className="relative hero-gradient overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm text-sm text-muted-foreground mb-8"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Trusted by 2M+ designers and developers</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
          >
            From Figma to{" "}
            <span className="text-gradient">production code</span>
            <br className="hidden sm:block" />
            in seconds
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Select any layer in Figma. Get clean, maintainable code for web,
            mobile, and desktop — instantly.
          </motion.p>

          {/* Framework pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {frameworks.map((fw, i) => (
              <motion.span
                key={fw.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
              >
                {fw.icon("w-3.5 h-3.5")}
                {fw.name}
              </motion.span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4"
          >
            <Button size="lg" className="group" asChild>
              <a
                href="https://www.figma.com/community/plugin/842128343887142055"
                target="_blank"
              >
                View on Figma
                <ArrowRight
                  size={16}
                  className="ml-2 transition-transform group-hover:translate-x-1"
                />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a
                href="https://github.com/bernaferrari/FigmaToCode"
                target="_blank"
              >
                {frameworkIcons.github("w-4 h-4 mr-2")}
                View Source
              </a>
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-sm text-muted-foreground mb-20"
          >
            Free forever. No account required.
          </motion.p>
        </div>

        {/* Code Preview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative"
        >
          <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {/* Figma Design Card */}
            <div className="glass rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-muted-foreground ml-2">
                  Figma Design
                </span>
              </div>
              <div className="p-6 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5">
                <div className="bg-card rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-3 bg-foreground/10 rounded w-24" />
                      <div className="h-2 bg-foreground/5 rounded w-32" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 bg-foreground/5 rounded w-full" />
                    <div className="h-2.5 bg-foreground/5 rounded w-4/5" />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <div className="h-8 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-md flex-1" />
                    <div className="h-8 border border-border rounded-md w-20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Code Card */}
            <div className="glass rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">
                    Generated Code
                  </span>
                </div>
                <span className="text-xs font-medium text-cyan-500">
                  Tailwind
                </span>
              </div>
              <div className="p-4 font-mono text-xs leading-relaxed overflow-hidden">
                <pre className="text-muted-foreground">
                  <code>
                    <span className="text-pink-500">{"<div "}</span>
                    <span className="text-cyan-500">className</span>
                    <span className="text-foreground">{"="}</span>
                    <span className="text-amber-500">
                      {'"flex items-center gap-3 p-4"'}
                    </span>
                    <span className="text-pink-500">{">"}</span>
                    {"\n  "}
                    <span className="text-pink-500">{"<div "}</span>
                    <span className="text-cyan-500">className</span>
                    <span className="text-foreground">{"="}</span>
                    <span className="text-amber-500">
                      {'"w-10 h-10 rounded-full'}
                    </span>
                    {"\n    "}
                    <span className="text-amber-500">
                      {'bg-gradient-to-br from-violet-500'}
                    </span>
                    {"\n    "}
                    <span className="text-amber-500">{'to-fuchsia-500"'}</span>
                    <span className="text-pink-500">{" />"}</span>
                    {"\n  "}
                    <span className="text-pink-500">{"<div "}</span>
                    <span className="text-cyan-500">className</span>
                    <span className="text-foreground">{"="}</span>
                    <span className="text-amber-500">{'"flex-1"'}</span>
                    <span className="text-pink-500">{">"}</span>
                    {"\n    "}
                    <span className="text-pink-500">{"<h3 "}</span>
                    <span className="text-cyan-500">className</span>
                    <span className="text-foreground">{"="}</span>
                    <span className="text-amber-500">
                      {'"font-semibold"'}
                    </span>
                    <span className="text-pink-500">{">"}</span>
                    <span className="text-foreground">Title</span>
                    <span className="text-pink-500">{"</h3>"}</span>
                    {"\n    "}
                    <span className="text-pink-500">{"<p "}</span>
                    <span className="text-cyan-500">className</span>
                    <span className="text-foreground">{"="}</span>
                    <span className="text-amber-500">
                      {'"text-muted-foreground"'}
                    </span>
                    <span className="text-pink-500">{">"}</span>
                    <span className="text-muted-foreground/70">...</span>
                    <span className="text-pink-500">{"</p>"}</span>
                    {"\n  "}
                    <span className="text-pink-500">{"</div>"}</span>
                    {"\n"}
                    <span className="text-pink-500">{"</div>"}</span>
                  </code>
                </pre>
              </div>
            </div>
          </div>

          {/* Arrow between cards on mobile */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-card border border-border shadow-lg z-10">
            <ArrowRight className="text-muted-foreground" size={20} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
