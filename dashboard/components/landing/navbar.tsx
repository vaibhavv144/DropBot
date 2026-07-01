"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Pricing", href: "#pricing" },
  { label: "Docs", href: "/docs" },
];

const SHEET_EASE = "ease-[cubic-bezier(0.32,0.72,0,1)]";

/** Brand name + professional tagline */
function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col leading-none">
      <span
        className={cn(
          "font-semibold tracking-tight text-gray-900",
          compact ? "text-[16px]" : "text-[17px] sm:text-[18px]"
        )}
      >
        DropBot
      </span>
      {!compact && (
        <span className="mt-1 hidden text-[11px] font-medium tracking-wide text-gray-500 sm:block sm:text-[12px]">
          AI support for your website
        </span>
      )}
    </div>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/50 bg-[#EFEFEF]/90 backdrop-blur-md">
      <div className="relative flex h-[68px] w-full items-center justify-between px-5 sm:px-8 lg:px-12">
        {/* LEFT — brand */}
        <Link
          href="/"
          className="relative z-10 flex shrink-0 items-center gap-3 transition-opacity hover:opacity-85"
        >
          <BrandMark />
          <BrandWordmark />
        </Link>

        {/* CENTER — floating pill nav (desktop) */}
        <nav
          aria-label="Main navigation"
          className="absolute left-1/2 hidden -translate-x-1/2 md:flex"
        >
          <ul className="flex items-center gap-0.5 rounded-full border border-white/60 bg-white/70 p-1.5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-md">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="block rounded-full px-4 py-2 text-[13px] font-medium text-gray-700 transition-all duration-300 hover:bg-gray-100 hover:text-gray-900 sm:px-5 sm:text-[14px]"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* RIGHT — auth (desktop) */}
        <div className="relative z-10 hidden items-center gap-2 sm:gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-[13px] font-medium text-gray-600 transition-colors duration-300 hover:text-gray-900 sm:text-[14px]"
          >
            Log in
          </Link>
          <Link
            href="/login?mode=signup"
            className="rounded-full bg-gray-900 px-5 py-2.5 text-[13px] font-medium text-white transition-colors duration-300 hover:bg-gray-800 sm:text-[14px]"
          >
            Sign in
          </Link>
        </div>

        {/* MOBILE — menu toggle */}
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-900 shadow-sm md:hidden"
        >
          <Menu size={18} />
        </button>
      </div>

      {/* MOBILE menu overlay */}
      <div
        className={cn(
          "fixed inset-0 z-50 md:hidden",
          open ? "pointer-events-auto" : "pointer-events-none"
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity duration-500",
            open ? "opacity-100" : "opacity-0"
          )}
        />
        <div
          className={cn(
            "absolute inset-x-3 bottom-3 rounded-2xl bg-white p-6 transition-transform duration-500",
            SHEET_EASE,
            open ? "translate-y-0" : "translate-y-full"
          )}
        >
          <div className="mb-6 flex items-center justify-between">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5"
            >
              <BrandMark size="xs" />
              <BrandWordmark compact />
            </Link>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white"
            >
              <X size={18} />
            </button>
          </div>

          <ul className="mb-6 space-y-1">
            {NAV_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-2 py-2.5 text-[22px] font-medium leading-tight text-gray-900 transition-colors hover:bg-gray-50"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-full border border-gray-200 py-3.5 text-[15px] font-medium text-gray-900"
            >
              Log in
            </Link>
            <Link
              href="/login?mode=signup"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-full bg-gray-900 py-3.5 text-[15px] font-medium text-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
