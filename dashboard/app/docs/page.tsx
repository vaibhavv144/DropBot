import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export const metadata: Metadata = {
  title: "Installation Guide — DropBot",
  description:
    "Step-by-step guide to install and integrate DropBot on your website.",
};

// Published Notion installation guide.
// NOTION_EMBED_URL (the /ebd/ form) renders inside the iframe.
// NOTION_PAGE_URL opens the full page in a new tab.
const NOTION_EMBED_URL =
  "https://purple-whistle-824.notion.site/ebd/378f5104ab6c80149926e84fff319d41";
const NOTION_PAGE_URL =
  "https://purple-whistle-824.notion.site/378f5104ab6c80149926e84fff319d41";

export default function DocsPage() {
  return (
    <main className="bg-white">
      <Navbar />

      <section className="bg-[#F5F5F5] pt-12 pb-10 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-14">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-8 lg:px-12">
          <div className="mb-6 flex items-center gap-3">
            <span className="rounded-full border border-gray-300 px-3 py-1 text-[12px] font-medium text-gray-700 sm:px-4 sm:py-1.5 sm:text-[13px]">
              Docs
            </span>
          </div>

          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <h1
              className="max-w-[640px] font-medium leading-[1.1] tracking-[-0.02em] text-gray-900"
              style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
            >
              Installation guide
            </h1>

            <Link
              href={NOTION_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-[14px] font-medium text-white transition-colors duration-300 hover:bg-gray-800"
            >
              Open in Notion
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-4 max-w-[640px] text-[15px] leading-[1.6] text-gray-600">
            Everything you need to add DropBot to your website, step by step.
          </p>
        </div>
      </section>

      <section className="bg-white pb-16 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-[1100px] px-5 sm:px-8 lg:px-12">
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
            <iframe
              src={NOTION_EMBED_URL}
              title="DropBot installation guide"
              className="h-[80vh] min-h-[640px] w-full border-0 bg-white"
              loading="lazy"
            />
          </div>

          <p className="mt-4 text-center text-[13px] text-gray-500">
            Trouble viewing the guide?{" "}
            <Link
              href={NOTION_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-900 underline underline-offset-2 hover:text-gray-700"
            >
              Open it directly in Notion
            </Link>
            .
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
