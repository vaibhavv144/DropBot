"use client";

import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { clearToken } from "@/lib/api";
import { LogOut } from "lucide-react";

export function Header() {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200/60 bg-[#f6f6f8]/85 backdrop-blur-md">
      <div className="mx-auto flex h-[64px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <button
          className="flex items-center gap-2.5 transition-opacity hover:opacity-85"
          onClick={() => router.push("/dashboard")}
        >
          <BrandMark size="xs" rounded="xl" />
          <span className="flex flex-col items-start leading-none">
            <span className="text-[16px] font-semibold tracking-tight text-gray-900">
              DropBot
            </span>
            <span className="mt-0.5 hidden text-[11px] font-medium text-gray-500 sm:block">
              Dashboard
            </span>
          </span>
        </button>
        <button
          onClick={() => {
            clearToken();
            router.replace("/login");
          }}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white/70 px-3.5 py-2 text-[13px] font-medium text-gray-600 shadow-sm transition-colors hover:bg-white hover:text-gray-900"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </header>
  );
}
