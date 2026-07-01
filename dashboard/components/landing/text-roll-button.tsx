"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "dark" | "accent" | "white";

const EASE = "ease-[cubic-bezier(0.25,0.1,0.25,1)]";

const variantStyles: Record<
  Variant,
  { button: string; circle: string; arrow: string }
> = {
  dark: {
    button: "bg-gray-900 text-white hover:bg-gray-800",
    circle: "bg-white",
    arrow: "text-gray-900",
  },
  accent: {
    button: "bg-primary text-white hover:opacity-90",
    circle: "bg-white",
    arrow: "text-primary",
  },
  white: {
    button: "bg-white text-gray-900 ring-1 ring-gray-200 hover:ring-gray-300",
    circle: "bg-gray-900",
    arrow: "text-white",
  },
};

export function TextRollButton({
  text,
  href,
  variant = "dark",
  className,
}: {
  text: string;
  href: string;
  variant?: Variant;
  className?: string;
}) {
  const v = variantStyles[variant];
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full pl-5 pr-2 py-2 text-[13px] font-medium transition-colors duration-300",
        v.button,
        className
      )}
    >
      {/* Hover text-roll: the label is duplicated and slides up on hover */}
      <span className="relative block h-[20px] overflow-hidden">
        <span
          className={cn(
            "flex flex-col transition-transform duration-500 group-hover:-translate-y-1/2",
            EASE
          )}
        >
          <span className="block h-[20px] leading-[20px]">{text}</span>
          <span className="block h-[20px] leading-[20px]">{text}</span>
        </span>
      </span>
      <span
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-500 group-hover:-rotate-45",
          EASE,
          v.circle
        )}
      >
        <ArrowRight className={cn("h-3.5 w-3.5", v.arrow)} />
      </span>
    </Link>
  );
}
