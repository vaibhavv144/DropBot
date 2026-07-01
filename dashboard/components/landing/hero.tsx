import { Bot } from "lucide-react";
import { Navbar } from "./navbar";
import { TextRollButton } from "./text-roll-button";
import { MockChatPanel } from "./mock-panels";

function StarburstIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <path d="m19.6 66.5 19.7-11 .3-1-.3-.5h-1l-3.3-.2-11.2-.3L14 53l-9.5-.5-2.4-.5L0 49l.2-1.5 2-1.3 2.9.2 6.3.5 9.5.6 6.9.4L38 49.1h1.6l.2-.7-.5-.4-.4-.4L29 41l-10.6-7-5.6-4.1-3-2-1.5-2-.6-4.2 2.7-3 3.7.3.9.2 3.7 2.9 8 6.1L37 36l1.5 1.2.6-.4.1-.3-.7-1.1L33 25l-6-10.4-2.7-4.3-.7-2.6c-.3-1-.4-2-.4-3l3-4.2L28 0l4.2.6L33.8 2l2.6 6 4.1 9.3L47 29.9l2 3.8 1 3.4.3 1h.7v-.5l.5-7.2 1-8.7 1-11.2.3-3.2 1.6-3.8 3-2L61 2.6l2 2.9-.3 1.8-1.1 7.7L59 27.1l-1.5 8.2h.9l1-1.1 4.1-5.4 6.9-8.6 3-3.5L77 13l2.3-1.8h4.3l3.1 4.7-1.4 4.9-4.4 5.6-3.7 4.7-5.3 7.1-3.2 5.7.3.4h.7l12-2.6 6.4-1.1 7.6-1.3 3.5 1.6.4 1.6-1.4 3.4-8.2 2-9.6 2-14.3 3.3-.2.1.2.3 6.4.6 2.8.2h6.8l12.6 1 3.3 2 1.9 2.7-.3 2-5.1 2.6-6.8-1.6-16-3.8-5.4-1.3h-.8v.4l4.6 4.5 8.3 7.5L89 80.1l.5 2.4-1.3 2-1.4-.2-9.2-7-3.6-3-8-6.8h-.5v.7l1.8 2.7 9.8 14.7.5 4.5-.7 1.4-2.6 1-2.7-.6-5.8-8-6-9-4.7-8.2-.5.4-2.9 30.2-1.3 1.5-3 1.2-2.5-2-1.4-3 1.4-6.2 1.6-8 1.3-6.4 1.2-7.9.7-2.6v-.2H49L43 72l-9 12.3-7.2 7.6-1.7.7-3-1.5.3-2.8L24 86l10-12.8 6-7.9 4-4.6-.1-.5h-.3L17.2 77.4l-4.7.6-2-2 .2-3 1-1 8-5.5Z" />
    </svg>
  );
}

/** Floating product preview shown beneath the headline. */
function HeroVisual() {
  return (
    <div className="animate-float relative w-[300px] sm:w-[360px] xl:w-[400px]">
      {/* Status pill */}
      <div className="absolute -left-8 -top-6 z-10 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[12px] font-medium text-gray-700 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Indexed yoursite.com
      </div>

      {/* The live chat widget */}
      <div className="rotate-[1.2deg] shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
        <MockChatPanel />
      </div>

      {/* Launcher bubble */}
      <div className="absolute -bottom-6 -right-5 flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white shadow-[0_12px_30px_rgba(0,0,0,0.25)] ring-4 ring-white">
        <Bot className="h-6 w-6" />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#EFEFEF]">
      {/* Animated background (stand-in for the WebGL shader stack) */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="hero-aurora">
          <span className="orb-1" />
          <span className="orb-2" />
          <span className="orb-3" />
          <span className="orb-4" />
        </div>
        <div className="hero-fluted" />
        <div className="hero-grain" />
      </div>

      <Navbar />

      {/* Hero content — headline is the main element on top, preview below */}
      <div className="relative z-20 mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 pb-12 pt-10 sm:px-8 sm:pb-16 sm:pt-14 lg:px-12 lg:pb-20 lg:pt-20">
        {/* Primary: label + headline + CTA */}
        <div className="max-w-[860px]">
          <p className="mb-5 text-[13px] tracking-wide text-gray-900 sm:mb-7 sm:text-[14px]">
            DropBot · AI Support
          </p>
          <h1
            className="font-medium leading-[1.08] tracking-[-0.03em] text-gray-900"
            style={{ fontSize: "clamp(1.75rem, 7vw, 4.2rem)" }}
          >
            <span className="sm:hidden">
              Add an AI chatbot to your website in sixty seconds.
            </span>
            <span
              className="hidden sm:inline"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.2rem)" }}
            >
              Add an AI chatbot to your
              <br />
              website that answers from
              <br />
              your content — in 60 seconds.
            </span>
          </h1>

          <div className="mt-8 flex flex-col items-start gap-4 sm:mt-10 sm:flex-row sm:items-center sm:gap-5">
            <TextRollButton
              text="Get started free"
              href="/login"
              variant="accent"
              className="pl-5 sm:pl-6"
            />

            {/* Partner / trust badge */}
            <div className="flex items-center gap-2.5 rounded-[4px] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <StarburstIcon className="h-5 w-5 fill-current text-primary sm:h-6 sm:w-6" />
              <span className="text-[13px] font-medium text-gray-900 sm:text-[14px]">
                Powered by RAG
              </span>
              <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] text-white sm:px-2 sm:text-[11px]">
                Gemini
              </span>
            </div>
          </div>
        </div>

        {/* Secondary: product preview sits below the headline */}
        <div className="mt-14 flex justify-center pr-2 sm:mt-16 lg:mt-auto lg:justify-end lg:pt-8">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
