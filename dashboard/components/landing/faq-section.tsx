"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

const FAQS = [
  {
    q: "Is it really free to start?",
    a: "Yes. The Free plan includes one chatbot and 100 messages a month, with no credit card required. Upgrade only when you need more volume or extra bots.",
  },
  {
    q: "Will it slow my site down?",
    a: "No. The widget loads asynchronously and renders inside a Shadow DOM, so it stays isolated from your page and has no measurable impact on load time.",
  },
  {
    q: "How does it learn my content?",
    a: "Paste a URL and we crawl your pages and sitemap, or upload PDFs, Markdown, TXT, and HTML. We index everything into a private knowledge base the bot answers from.",
  },
  {
    q: "Is my data secure?",
    a: "Each bot is isolated per account, enforces an allowed-domains list on every request, and is rate-limited per visitor. Your content is only used to answer your visitors.",
  },
  {
    q: "Which platforms are supported?",
    a: "Any website. Because it's a single script tag, it works on WordPress, Shopify, Webflow, React, Next.js, or plain HTML — no framework or build step needed.",
  },
  {
    q: "Can I remove the branding?",
    a: "Yes. The “Powered by DropBot” link in the widget is removable on the Pro and Business plans.",
  },
];

function AccordionItem({
  q,
  a,
  open,
  onToggle,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border transition-all duration-300",
        open
          ? "border-primary/30 bg-white shadow-[0_8px_30px_rgba(79,70,229,0.10)]"
          : "border-gray-200 bg-white/60 hover:border-gray-300 hover:bg-white"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <span
          className={cn(
            "text-[15px] font-medium transition-colors duration-300 sm:text-[16px]",
            open ? "text-primary" : "text-gray-900"
          )}
        >
          {q}
        </span>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300",
            open
              ? "rotate-45 bg-primary text-white"
              : "bg-gray-100 text-gray-500"
          )}
        >
          <Plus className="h-4 w-4" />
        </span>
      </button>
      {/* Smooth height animation via the grid-rows 0fr → 1fr trick */}
      <div
        className={cn(
          "grid transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-[14px] leading-[1.65] text-gray-600 sm:px-6 sm:pb-6 sm:text-[15px]">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-28 lg:pb-28">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <Reveal>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
                5
              </span>
              <span className="rounded-full border border-gray-200 px-3 py-1 text-[12px] font-medium text-gray-700 sm:px-4 sm:py-1.5 sm:text-[13px]">
                FAQ
              </span>
            </div>
            <h2
              className="font-medium leading-[1.1] tracking-[-0.02em] text-gray-900"
              style={{ fontSize: "clamp(1.6rem, 4vw, 3rem)" }}
            >
              Questions, answered.
            </h2>
          </Reveal>

          <div className="space-y-3">
            {FAQS.map((item, i) => (
              <Reveal key={item.q} delay={i * 70}>
                <AccordionItem
                  q={item.q}
                  a={item.a}
                  open={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
