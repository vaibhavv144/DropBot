import { TextRollButton } from "./text-roll-button";
import { MockChatPanel, MockSourcesPanel } from "./mock-panels";

export function AboutSection() {
  return (
    <section
      id="about"
      className="overflow-hidden bg-white pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-28 lg:pb-28"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — copy */}
          <div>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
                1
              </span>
              <span className="rounded-full border border-gray-200 px-3 py-1 text-[12px] font-medium text-gray-700 sm:px-4 sm:py-1.5 sm:text-[13px]">
                Why DropBot
              </span>
            </div>
            <h2
              className="font-medium leading-[1.12] tracking-[-0.02em] text-gray-900"
              style={{ fontSize: "clamp(1.6rem, 3.6vw, 2.9rem)" }}
            >
              A self-serve AI assistant that already knows your business.
            </h2>
            <p className="mt-6 max-w-[560px] text-[15px] leading-[1.7] text-gray-600 sm:text-[17px]">
              Our platform turns any website into a self-serve AI assistant.
              Paste one line of code, and a smart chatbot appears that already
              knows your business — because it has read your website and
              documents. It answers visitor questions instantly, around the
              clock, in your brand&apos;s look and voice, without you writing a
              single line of code or training anything yourself.
            </p>
            <div className="mt-8">
              <TextRollButton
                text="See how it works"
                href="#how"
                variant="accent"
              />
            </div>
          </div>

          {/* Right — product visuals (stacked, no overlap) */}
          <div className="mx-auto flex w-full max-w-[520px] flex-col gap-5 lg:mx-0 lg:ml-auto">
            <MockSourcesPanel />
            <MockChatPanel />
          </div>
        </div>
      </div>
    </section>
  );
}
