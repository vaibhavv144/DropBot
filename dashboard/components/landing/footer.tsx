import Link from "next/link";
import { TextRollButton } from "./text-roll-button";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Docs", href: "/docs" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "GDPR", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer id="docs" className="bg-gray-900 text-white">
      {/* Final CTA band */}
      <div className="mx-auto max-w-[1440px] px-5 pt-16 sm:px-8 sm:pt-20 lg:px-12 lg:pt-28">
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-16 lg:flex-row lg:items-end">
          <h2
            className="font-medium leading-[1.08] tracking-[-0.03em]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.6rem)" }}
          >
            Ready to add AI to
            <br />
            your website?
          </h2>
          <TextRollButton
            text="Get started free"
            href="/login"
            variant="accent"
            className="pl-6"
          />
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-2 gap-8 py-14 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-[11px] font-semibold tracking-tight text-gray-900">
                DB
              </span>
              <span className="text-[15px] font-semibold">DropBot</span>
            </div>
            <p className="mt-4 max-w-[240px] text-[13px] leading-relaxed text-white/50">
              The embeddable AI chatbot that answers from your own content.
              Trained on your site, live in 60 seconds.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-[13px] font-semibold text-white/90">
                {col.title}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-white/50 transition-colors duration-300 hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-white/10 py-8 text-[12px] text-white/40 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} DropBot. All rights reserved.</p>
          <p>Built with Next.js · Powered by Google Gemini</p>
        </div>
      </div>
    </footer>
  );
}
