"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Check } from "lucide-react";
import { frameworkIcons } from "@/components/icons";

const frameworks = [
  {
    id: "tailwind",
    name: "Tailwind CSS",
    icon: frameworkIcons.tailwind,
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    modes: ["HTML", "React JSX", "Svelte", "Twig"],
    features: [
      "Tailwind 4 support",
      "Auto-rounds to design scale",
      "Color palette matching",
      "Custom font families",
    ],
    code: `<div class="flex items-center gap-4 p-6
  bg-white rounded-2xl shadow-lg">
  <img class="w-12 h-12 rounded-full"
    src="avatar.jpg" alt="" />
  <div class="flex-1">
    <h3 class="font-semibold text-gray-900">
      Sarah Chen
    </h3>
    <p class="text-sm text-gray-500">
      Product Designer
    </p>
  </div>
  <button class="px-4 py-2 bg-indigo-600
    text-white rounded-lg">
    Follow
  </button>
</div>`,
  },
  {
    id: "html",
    name: "HTML + CSS",
    icon: frameworkIcons.html,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    modes: ["Inline CSS", "External CSS", "styled-components"],
    features: [
      "Clean semantic HTML",
      "CSS variables support",
      "Flexbox layouts",
      "Base64 image embedding",
    ],
    code: `<div class="card">
  <img class="avatar" src="avatar.jpg" />
  <div class="content">
    <h3 class="name">Sarah Chen</h3>
    <p class="role">Product Designer</p>
  </div>
  <button class="follow-btn">Follow</button>
</div>

<style>
.card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
</style>`,
  },
  {
    id: "flutter",
    name: "Flutter",
    icon: frameworkIcons.flutter,
    color: "text-sky-500",
    bgColor: "bg-sky-500/10",
    modes: ["Snippet", "Widget", "Full App"],
    features: [
      "Stateless widgets",
      "Container & Padding",
      "Row/Column layouts",
      "BoxDecoration shadows",
    ],
    code: `Container(
  padding: EdgeInsets.all(24),
  decoration: BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(16),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.1),
        blurRadius: 6,
        offset: Offset(0, 4),
      ),
    ],
  ),
  child: Row(
    children: [
      CircleAvatar(radius: 24),
      SizedBox(width: 16),
      Column(
        children: [
          Text("Sarah Chen"),
          Text("Product Designer"),
        ],
      ),
    ],
  ),
)`,
  },
  {
    id: "swiftui",
    name: "SwiftUI",
    icon: frameworkIcons.swiftui,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    modes: ["Snippet", "Struct", "Preview"],
    features: [
      "Native SwiftUI views",
      "HStack/VStack layouts",
      "SF Symbols support",
      "iOS styling patterns",
    ],
    code: `HStack(spacing: 16) {
    Image("avatar")
        .resizable()
        .frame(width: 48, height: 48)
        .clipShape(Circle())

    VStack(alignment: .leading) {
        Text("Sarah Chen")
            .font(.headline)
        Text("Product Designer")
            .font(.subheadline)
            .foregroundColor(.secondary)
    }

    Spacer()

    Button("Follow") {}
        .buttonStyle(.borderedProminent)
}
.padding(24)
.background(.white)
.cornerRadius(16)
.shadow(radius: 6, y: 4)`,
  },
  {
    id: "compose",
    name: "Jetpack Compose",
    icon: frameworkIcons.compose,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    modes: ["Snippet", "Composable", "Full App"],
    features: [
      "Material 3 support",
      "Modifier chains",
      "Row/Column composables",
      "Android best practices",
    ],
    code: `Card(
    modifier = Modifier
        .fillMaxWidth()
        .padding(24.dp),
    shape = RoundedCornerShape(16.dp),
    elevation = CardDefaults.cardElevation(4.dp)
) {
    Row(
        modifier = Modifier.padding(24.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Image(
            painter = painterResource(R.drawable.avatar),
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
        )
        Spacer(modifier = Modifier.width(16.dp))
        Column {
            Text("Sarah Chen", style = MaterialTheme.typography.titleMedium)
            Text("Product Designer", color = MaterialTheme.colorScheme.secondary)
        }
    }
}`,
  },
];

export function Showcase() {
  const [activeFramework, setActiveFramework] = useState("tailwind");
  const active = frameworks.find((f) => f.id === activeFramework)!;

  return (
    <section id="frameworks" className="py-24 px-6 border-t border-border">
      <div className="max-w-6xl mx-auto">
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
            Frameworks
          </motion.span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            One design, five frameworks
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Generate production-ready code for web, iOS, Android, and
            cross-platform — all from the same Figma file.
          </p>
        </motion.div>

        {/* Framework Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {frameworks.map((fw) => (
            <button
              key={fw.id}
              onClick={() => setActiveFramework(fw.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                activeFramework === fw.id
                  ? `${fw.bgColor} ${fw.color} border-current`
                  : "border-border hover:border-muted-foreground/50 text-muted-foreground"
              }`}
            >
              {fw.icon("w-5 h-5")}
              <span className="font-medium text-sm">{fw.name}</span>
            </button>
          ))}
        </div>

        {/* Active Framework Content */}
        <motion.div
          key={activeFramework}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          {/* Features & Modes */}
          <div className="glass rounded-xl p-6 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`w-10 h-10 rounded-lg ${active.bgColor} ${active.color} flex items-center justify-center`}
                >
                  {active.icon("w-5 h-5")}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{active.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {active.modes.length} output modes
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Output Modes
              </h4>
              <div className="flex flex-wrap gap-2">
                {active.modes.map((mode) => (
                  <span
                    key={mode}
                    className="px-3 py-1 rounded-full bg-muted text-sm"
                  >
                    {mode}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Key Features
              </h4>
              <ul className="space-y-2">
                {active.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Check size={16} className={active.color} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Code Preview */}
          <div className="glass rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50">
              <span className="text-sm text-muted-foreground">
                Generated Output
              </span>
              <span className={`text-xs font-medium ${active.color}`}>
                {active.name}
              </span>
            </div>
            <div className="p-4 overflow-auto max-h-[400px]">
              <pre className="font-mono text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
                <code>{active.code}</code>
              </pre>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
