"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Quote,
  ShieldCheck,
  Palette,
  Zap,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  tag: string;
};

const FEATURES: Feature[] = [
  {
    icon: Code2,
    title: "One-line embed",
    desc: "Drop a single script tag on any site — WordPress, Shopify, React, or plain HTML. No build step required.",
    tag: "Works everywhere",
  },
  {
    icon: Quote,
    title: "Cited answers",
    desc: "Replies come straight from your indexed content and link back to the source pages — accurate, never made up.",
    tag: "Grounded in your content",
  },
  {
    icon: ShieldCheck,
    title: "No CSS conflicts",
    desc: "The widget renders inside a Shadow DOM, so it never breaks your site's styles and your styles never break it.",
    tag: "Fully isolated",
  },
  {
    icon: Palette,
    title: "Fully on-brand",
    desc: "Match colors, greeting, launcher text, position, and tone from the dashboard — no redeploy needed.",
    tag: "Your look & voice",
  },
  {
    icon: Zap,
    title: "Streaming replies",
    desc: "Answers stream token-by-token for a fast, natural “live typing” feel that keeps visitors engaged.",
    tag: "Real-time",
  },
  {
    icon: Lock,
    title: "Secure & isolated",
    desc: "Each bot is isolated, enforces an allowed-domains list, and is rate-limited per visitor by default.",
    tag: "Safe by default",
  },
];

function FeatureCard({
  feature,
  isActive,
}: {
  feature: Feature;
  isActive: boolean;
}) {
  const Icon = feature.icon;
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col overflow-hidden rounded-[28px] border p-7 transition-colors duration-500 sm:p-8",
        isActive
          ? "border-primary/25 bg-gradient-to-b from-indigo-50/70 to-white shadow-[0_24px_60px_rgba(79,70,229,0.16)]"
          : "border-gray-200 bg-gray-50 shadow-sm"
      )}
    >
      {/* Subtle oversized icon watermark to fill the space */}
      <Icon
        className={cn(
          "pointer-events-none absolute -right-5 -top-5 h-36 w-36 transition-colors duration-500",
          isActive ? "text-primary/10" : "text-gray-900/[0.04]"
        )}
        strokeWidth={1}
      />

      {/* Icon tile */}
      <span
        className={cn(
          "relative flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-500",
          isActive ? "bg-primary text-white" : "bg-primary/10 text-primary"
        )}
      >
        <Icon className="h-6 w-6" />
      </span>

      {/* Title + description */}
      <h3 className="relative mt-6 text-[22px] font-semibold leading-tight tracking-tight text-gray-900 sm:text-[26px]">
        {feature.title}
      </h3>
      <p className="relative mt-3 text-[14px] leading-[1.65] text-gray-600 sm:text-[15px]">
        {feature.desc}
      </p>

      {/* Spacer pushes the footer to the bottom so the card never looks empty */}
      <div className="flex-1" />

      {/* Footer accent */}
      <div className="relative mt-6 flex items-center gap-2 border-t border-gray-200/70 pt-5 text-[13px] font-medium text-primary">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
          <Check className="h-3 w-3" />
        </span>
        {feature.tag}
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const [active, setActive] = useState(0);
  const n = FEATURES.length;

  const go = useCallback(
    (dir: number) => setActive((a) => (a + dir + n) % n),
    [n]
  );

  // Keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <section
      id="features"
      className="overflow-hidden bg-white pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-28 lg:pb-28"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          {/* Badge row */}
          <div className="mb-6 flex items-center gap-3 sm:mb-8">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
              3
            </span>
            <span className="rounded-full border border-gray-200 px-3 py-1 text-[12px] font-medium text-gray-700 sm:px-4 sm:py-1.5 sm:text-[13px]">
              Everything included
            </span>
          </div>

          <h2
            className="mb-10 max-w-[760px] font-medium leading-[1.1] tracking-[-0.02em] text-gray-900 sm:mb-12"
            style={{ fontSize: "clamp(1.6rem, 4vw, 3.2rem)" }}
          >
            Powerful out of the box, simple by design.
          </h2>
        </Reveal>

        {/* Carousel header: active title + counter */}
        <div className="flex items-baseline justify-between border-b border-gray-200 pb-4">
          <span className="text-[16px] font-medium text-gray-900 transition-all duration-300 sm:text-[18px]">
            {FEATURES[active].title}
          </span>
          <span className="text-[18px] font-medium tracking-tight text-gray-900 sm:text-[20px]">
            {String(active + 1).padStart(2, "0")}
            <span className="text-gray-400">/{String(n).padStart(2, "0")}</span>
          </span>
        </div>

        {/* Coverflow stage */}
        <div className="relative mt-10 flex h-[420px] items-center justify-center sm:h-[460px]">
          {FEATURES.map((f, i) => {
            let offset = i - active;
            if (offset > n / 2) offset -= n;
            if (offset < -n / 2) offset += n;
            const abs = Math.abs(offset);
            const isActive = offset === 0;
            const visible = abs <= 1;
            return (
              <div
                key={f.title}
                onClick={() => !isActive && visible && go(offset)}
                className={cn(
                  "absolute left-1/2 top-0 h-full w-[268px] transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] sm:w-[330px] lg:w-[360px]",
                  !isActive && visible && "cursor-pointer"
                )}
                style={{
                  transform: `translateX(-50%) translateX(${offset * 64}%) scale(${
                    isActive ? 1 : 0.82
                  })`,
                  opacity: visible ? (isActive ? 1 : 0.5) : 0,
                  filter: isActive ? "none" : "blur(1px)",
                  zIndex: 20 - abs,
                  pointerEvents: visible ? "auto" : "none",
                }}
              >
                <FeatureCard feature={f} isActive={isActive} />
              </div>
            );
          })}

          {/* Arrows */}
          <button
            type="button"
            aria-label="Previous"
            onClick={() => go(-1)}
            className="absolute left-0 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-[0_4px_16px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white sm:left-2"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => go(1)}
            className="absolute right-0 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-gray-700 shadow-[0_4px_16px_rgba(0,0,0,0.12)] backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white sm:right-2"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Dash pagination */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {FEATURES.map((f, i) => (
            <button
              key={f.title}
              type="button"
              aria-label={`Go to ${f.title}`}
              onClick={() => setActive(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active
                  ? "w-7 bg-gray-900"
                  : "w-4 bg-gray-300 hover:bg-gray-400"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
