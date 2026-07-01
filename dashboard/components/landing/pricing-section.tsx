import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "For side projects and trying things out.",
    features: [
      "1 chatbot",
      "100 messages / month",
      "Crawl 1 website",
      "Grounded answers with citations",
      "Community support",
    ],
    cta: "Get started free",
    highlight: false,
  },
  // Uncomment the tiers below when you're ready to offer paid plans.
  // {
  //   name: "Pro",
  //   price: "$29",
  //   period: "per month",
  //   desc: "For growing sites that need more volume.",
  //   features: [
  //     "5 chatbots",
  //     "5,000 messages / month",
  //     "Website crawl + document uploads",
  //     "Custom branding & remove “Powered by DropBot”",
  //     "Email support",
  //   ],
  //   cta: "Start free trial",
  //   highlight: true,
  // },
  // {
  //   name: "Business",
  //   price: "$99",
  //   period: "per month",
  //   desc: "For teams running support at scale.",
  //   features: [
  //     "Unlimited chatbots",
  //     "50,000 messages / month",
  //     "Priority support & SSO",
  //     "Analytics & top-questions dashboard",
  //     "Scheduled re-crawl",
  //   ],
  //   cta: "Contact sales",
  //   highlight: false,
  // },
];

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="bg-[#F5F5F5] pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-28 lg:pb-28"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <Reveal>
          {/* Badge row */}
          <div className="mb-6 flex items-center gap-3 sm:mb-8">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
              4
            </span>
            <span className="rounded-full border border-gray-300 px-3 py-1 text-[12px] font-medium text-gray-700 sm:px-4 sm:py-1.5 sm:text-[13px]">
              Pricing
            </span>
          </div>

          <h2
            className="mb-10 max-w-[640px] font-medium leading-[1.1] tracking-[-0.02em] text-gray-900 sm:mb-14 lg:mb-16"
            style={{ fontSize: "clamp(1.6rem, 4vw, 3.2rem)" }}
          >
            Start free. Upgrade when you grow.
          </h2>
        </Reveal>

        <div className="mx-auto grid max-w-md grid-cols-1 gap-5 sm:gap-6 lg:gap-7">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 100} className="h-full">
            <div
              className={cn(
                "flex h-full flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1.5 sm:p-8",
                t.highlight
                  ? "border-transparent bg-gray-900 text-white shadow-[0_12px_40px_rgba(0,0,0,0.18)] hover:shadow-[0_20px_55px_rgba(0,0,0,0.28)] lg:-translate-y-2 lg:hover:-translate-y-3"
                  : "border-gray-200 bg-white text-gray-900 hover:border-primary/30 hover:shadow-[0_16px_44px_rgba(79,70,229,0.12)]"
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-[15px] font-semibold",
                    t.highlight ? "text-white" : "text-gray-900"
                  )}
                >
                  {t.name}
                </span>
                {t.highlight && (
                  <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-medium text-white">
                    Most popular
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-end gap-1.5">
                <span className="text-[40px] font-medium tracking-tight">
                  {t.price}
                </span>
                <span
                  className={cn(
                    "mb-2 text-[13px]",
                    t.highlight ? "text-white/60" : "text-gray-500"
                  )}
                >
                  {t.period}
                </span>
              </div>
              <p
                className={cn(
                  "mt-2 text-[14px] leading-[1.6]",
                  t.highlight ? "text-white/70" : "text-gray-600"
                )}
              >
                {t.desc}
              </p>

              <ul className="mt-7 flex-1 space-y-3">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[14px]">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        t.highlight ? "text-primary" : "text-primary"
                      )}
                    />
                    <span
                      className={t.highlight ? "text-white/85" : "text-gray-700"}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/login"
                className={cn(
                  "mt-8 inline-flex items-center justify-center rounded-full px-6 py-3 text-[14px] font-medium transition-colors duration-300",
                  t.highlight
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                )}
              >
                {t.cta}
              </Link>
            </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
