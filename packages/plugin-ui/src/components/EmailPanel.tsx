import React from "react";
import { 
  SparklesIcon, 
  ExternalLinkIcon,
  BotIcon,
  ArrowRightIcon
} from "lucide-react";

// Correct Figma Icon Path (Monochrome)
const CustomFigmaIcon = ({ className }: { className?: string }) => (
<svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 256 256"><path d="M192,96a40,40,0,0,0-24-72H96A40,40,0,0,0,72,96a40,40,0,0,0,1.37,65A44,44,0,1,0,144,196V160a40,40,0,1,0,48-64Zm0-32a24,24,0,0,1-24,24H144V40h24A24,24,0,0,1,192,64ZM72,64A24,24,0,0,1,96,40h32V88H96A24,24,0,0,1,72,64Zm24,88a24,24,0,0,1,0-48h32v48H96Zm32,44a28,28,0,1,1-28-28h28Zm40-44a24,24,0,1,1,24-24A24,24,0,0,1,168,152Z"></path></svg>
);

const EmailPanel = () => {
  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 py-8 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-[#0a0a0a]">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center p-3.5 mb-5 rounded-3xl bg-black dark:bg-white shadow-xl shadow-black/5 dark:shadow-white/5 ring-1 ring-black/5 dark:ring-white/10">
           <BotIcon className="w-8 h-8 text-white dark:text-black" />
        </div>
        <h1 className="text-4xl font-bold dark:text-white mb-3 tracking-tighter font-display">
          Kopi AI
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 max-w-[260px] mx-auto leading-relaxed">
          AI email marketing design agent.
        </p>
      </div>

      {/* Main Cards */}
      <div className="grid grid-col-1 gap-3 px-1">
        {/* Create with AI Card */}
        <div className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-violet-100/50 to-transparent dark:from-violet-900/10 dark:to-transparent rounded-bl-3xl -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          
          <div className="relative flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center shrink-0 border border-violet-100 dark:border-violet-900/50">
              <SparklesIcon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Create with AI</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                Generate emails from scratch tailored to your brand
              </p>
            </div>
          </div>
        </div>

        {/* Brand Loyal Card */}
        <div className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-100/50 to-transparent dark:from-orange-900/10 dark:to-transparent rounded-bl-3xl -mr-4 -mt-4 transition-transform group-hover:scale-110" />
          
          <div className="relative flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center shrink-0 border border-orange-100 dark:border-orange-900/50">
              <CustomFigmaIcon className="w-6 h-6 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Generate from Figma</h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                 Generate emails from Figma designs
              </p>
            </div>
          </div>
        </div>
      </div>

       {/* Subtext */}
       <div className="flex justify-center mt-6 mb-4">
         <p className="text-[11px] leading-relaxed text-gray-400 dark:text-gray-500 text-center max-w-[280px]">
            Clean, responsive, on-brand email HTML
         </p>
       </div>

      {/* CTA */}
      <div className="mt-auto pt-4 text-center">
        <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLSe6F4CKOoj3FgEsualL2pUunTki2aMfO2WK0v5ExO7k_8HjmA/viewform?usp=sharing&ouid=115251107698498111547"
          target="_blank"
          rel="noopener noreferrer"
          className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-900 dark:bg-gray-100 text-white dark:text-black text-sm font-bold transition-all shadow-lg hover:shadow-gray-900/20 dark:hover:shadow-white/10 hover:scale-[1.02] active:scale-[0.98]"
        >
          Get Started
          <ArrowRightIcon className="w-4 h-4 opacity-50 group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
};

export default EmailPanel;
