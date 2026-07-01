import { cn } from "@/lib/utils";

export type BrandMarkSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_CLASSES: Record<BrandMarkSize, string> = {
  xs: "h-8 w-8 text-[10px]",
  sm: "h-9 w-9 text-[10px]",
  md: "h-10 w-10 text-[11px] sm:text-[12px]",
  lg: "h-11 w-11 text-[11px]",
  xl: "h-14 w-14 text-[14px]",
};

/** DropBot monogram — black badge, white initials */
export function BrandMark({
  size = "md",
  rounded = "2xl",
}: {
  size?: BrandMarkSize;
  rounded?: "xl" | "2xl";
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-gray-900 font-semibold tracking-tight text-white shadow-[0_4px_12px_rgba(0,0,0,0.18)]",
        rounded === "xl" ? "rounded-xl" : "rounded-2xl",
        SIZE_CLASSES[size]
      )}
      aria-hidden="true"
    >
      DB
    </span>
  );
}
