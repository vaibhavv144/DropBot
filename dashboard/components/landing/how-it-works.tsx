import { Code2, Link2, SlidersHorizontal } from "lucide-react";
import { Reveal } from "./reveal";

const STEPS = [
  {
    n: "01",
    icon: Link2,
    title: "Connect",
    desc: "Paste your website URL or upload documents. The bot reads and indexes everything.",
  },
  {
    n: "02",
    icon: SlidersHorizontal,
    title: "Customize",
    desc: "Pick your colors, greeting, and tone in the dashboard.",
  },
  {
    n: "03",
    icon: Code2,
    title: "Embed",
    desc: "Copy one line of code onto your site. Done — your AI agent is live.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      className="bg-[#F5F5F5] pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-28 lg:pb-28"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          {/* Badge row */}
          <div className="mb-6 flex items-center gap-3 sm:mb-8">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
              2
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-[12px] font-medium text-gray-700 sm:px-4 sm:py-1.5 sm:text-[13px]">
              How it works
            </span>
          </div>

          <h2
            className="mb-10 max-w-[720px] font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 sm:mb-14 lg:mb-16"
            style={{ fontSize: "clamp(1.75rem, 5vw, 3.4rem)" }}
          >
            Live in three steps
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3 lg:gap-7">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="group flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] sm:p-7">
                <div className="mb-6 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="text-[28px] font-medium tracking-tight text-gray-200 transition-colors duration-300 group-hover:text-primary/20">
                    {s.n}
                  </span>
                </div>
                <h3 className="text-[18px] font-semibold text-gray-900 sm:text-[20px]">
                  {s.title}
                </h3>
                <p className="mt-2 text-[14px] leading-[1.6] text-gray-600 sm:text-[15px]">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
