import React from "react";
import {
  SparklesIcon,
  ExternalLinkIcon,
  BotIcon,
  ArrowRightIcon,
} from "lucide-react";

// Correct Figma Icon Path (Monochrome)
const CustomFigmaIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    fill="currentColor"
    viewBox="0 0 256 256"
  >
    <path d="M192,96a40,40,0,0,0-24-72H96A40,40,0,0,0,72,96a40,40,0,0,0,1.37,65A44,44,0,1,0,144,196V160a40,40,0,1,0,48-64Zm0-32a24,24,0,0,1-24,24H144V40h24A24,24,0,0,1,192,64ZM72,64A24,24,0,0,1,96,40h32V88H96A24,24,0,0,1,72,64Zm24,88a24,24,0,0,1,0-48h32v48H96Zm32,44a28,28,0,1,1-28-28h28Zm40-44a24,24,0,1,1,24-24A24,24,0,0,1,168,152Z"></path>
  </svg>
);

const CustomKopiIcon = ({ className }: { className?: string }) => (
  <svg
    width="245"
    height="258"
    viewBox="0 0 245 258"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M182.795 184.569C148.649 217.944 93.9133 217.318 60.539 183.172C27.1647 149.025 27.7904 94.2875 61.9364 60.9123C82.0013 41.3004 104.926 14.6396 130.698 18.4112C148.784 21.058 170.43 48.2282 184.193 62.3096C217.567 96.4565 216.941 151.194 182.795 184.569Z"
      fill="#FF7670"
    />
    <g filter="url(#filter0_d_648_1676)">
      <path
        d="M184.596 161.597C163.89 196.277 118.992 207.606 84.3126 186.9C49.633 166.195 38.3046 121.295 59.0098 86.6148C66.8947 73.408 78.4774 59.3746 91.4787 53.4203C101.6 48.7849 114.218 56.9657 125.392 57.2423C137.556 57.5434 148.101 54.629 159.293 61.3114C193.973 82.0172 205.301 126.917 184.596 161.597Z"
        fill="#FFC070"
      />
    </g>
    <g filter="url(#filter1_d_648_1676)">
      <path
        d="M172.727 158.586C152.463 185.978 113.83 191.755 86.4384 171.49C59.047 151.225 53.2696 112.591 73.5342 85.1992C83.0748 72.303 104.377 87.558 118.97 84.7058C135.374 81.4998 145.328 61.5705 159.823 72.2948C187.214 92.5599 192.992 131.194 172.727 158.586Z"
        fill="#FFF06F"
      />
    </g>
    <defs>
      <filter
        id="filter0_d_648_1676"
        x="8.65625"
        y="32"
        width="226.289"
        height="225.254"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="20" />
        <feGaussianBlur stdDeviation="20" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_648_1676"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_648_1676"
          result="shape"
        />
      </filter>
      <filter
        id="filter1_d_648_1676"
        x="21.4297"
        y="49.1562"
        width="203.398"
        height="194.438"
        filterUnits="userSpaceOnUse"
        color-interpolation-filters="sRGB"
      >
        <feFlood flood-opacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="20" />
        <feGaussianBlur stdDeviation="20" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_648_1676"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_648_1676"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);

const EmailPanel = () => {
  return (
    <div className="flex flex-col h-full overflow-y-auto px-5 pt-4 pb-4 bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-[#0a0a0a]">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center justify-center">
          <CustomKopiIcon className="w-14 h-14 text-white dark:text-black" />
        </div>
        <h1 className="text-4xl font-bold dark:text-white mb-3 tracking-tighter font-display">
          Kopi AI
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 max-w-[260px] mx-auto leading-relaxed">
          HTML Email Design Agent.
        </p>
      </div>

      <div className="w-full bg-[#f8f8f8] dark:bg-zinc-900 rounded-xl p-4 mb-8">
        <p className="text-sm text-foreground leading-relaxed text-left">
          I'm launching my next project! Kopi is a tool for creating HTML
          marketing emails with AI, especially for Shopify stores working with
          Klaviyo, Mailchimp, etc.
        </p>
        <p className="text-sm text-muted-foreground mt-3 text-right">
          —Bernardo, creator of Figma to Code
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
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Create with AI
              </h3>
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
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                Generate from Figma
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                Generate emails from Figma designs
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subtext */}
      <div className="flex justify-center mt-4 mb-2">
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
