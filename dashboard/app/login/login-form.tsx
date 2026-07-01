"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { api, setToken } from "@/lib/api";
import { cn } from "@/lib/utils";

const TRUST_POINTS = [
  { icon: Zap, text: "Live on your site in under 60 seconds" },
  { icon: ShieldCheck, text: "Grounded answers from your own content" },
  { icon: Sparkles, text: "Free plan — no credit card required" },
];

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMode(searchParams.get("mode") === "signup" ? "signup" : "login");
  }, [searchParams]);

  function switchMode(next: "login" | "signup") {
    setMode(next);
    setError("");
    setShowPassword(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res =
        mode === "login"
          ? await api.login(email, password)
          : await api.signup(email, password);
      setToken(res.access_token);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const passwordValid = password.length >= 6;

  return (
    <div className="flex min-h-screen bg-[#EFEFEF]">
      {/* LEFT — brand panel (desktop) */}
      <aside className="relative hidden w-[44%] overflow-hidden bg-gray-900 lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-aurora opacity-40">
            <span className="orb-1" />
            <span className="orb-2" />
            <span className="orb-3" />
          </div>
          <div className="hero-grain opacity-[0.03]" />
        </div>

        <div className="relative z-10 p-10 xl:p-14">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-white/80 transition-colors hover:text-white"
          >
            <BrandMark size="sm" />
            <span className="text-[16px] font-semibold tracking-tight text-white">
              DropBot
            </span>
          </Link>
        </div>

        <div className="relative z-10 px-10 pb-14 xl:px-14 xl:pb-16">
          <BrandMark size="xl" />
          <h1
            className="mt-8 font-medium leading-[1.1] tracking-tight text-white"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
          >
            AI support that knows
            <br />
            your business.
          </h1>
          <p className="mt-4 max-w-[360px] text-[15px] leading-relaxed text-white/60">
            Train a chatbot on your website and documents. Embed it with one
            line of code — answers stay accurate, cited, and on-brand.
          </p>
          <ul className="mt-10 space-y-4">
            {TRUST_POINTS.map((item) => (
              <li key={item.text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-primary">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="text-[14px] text-white/80">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 px-10 pb-8 text-[12px] text-white/40 xl:px-14">
          © {new Date().getFullYear()} DropBot
        </p>
      </aside>

      {/* RIGHT — form */}
      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-5 py-4 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark size="sm" />
            <span className="text-[16px] font-semibold text-gray-900">
              DropBot
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-[420px]">
            <Link
              href="/"
              className="mb-8 hidden items-center gap-1.5 text-[13px] font-medium text-gray-500 transition-colors hover:text-gray-900 lg:inline-flex"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <div className="mb-8 flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
              {(["login", "signup"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={cn(
                    "flex-1 rounded-full py-2.5 text-[14px] font-medium transition-all duration-300",
                    mode === m
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {m === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>

            <div className="mb-6">
              <h2 className="text-[26px] font-semibold tracking-tight text-gray-900 sm:text-[28px]">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
                {mode === "login"
                  ? "Sign in to manage your chatbots and knowledge base."
                  : "Start free — set up your first bot in minutes."}
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-[13px] font-medium text-gray-700"
                >
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="you@company.com"
                  required
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-[14px] text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="text-[13px] font-medium text-gray-700"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder={
                      mode === "signup"
                        ? "Create a password (6+ characters)"
                        : "Enter your password"
                    }
                    minLength={6}
                    required
                    className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 pr-12 text-[14px] text-gray-900 shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {mode === "signup" && password.length > 0 && (
                  <p
                    className={cn(
                      "flex items-center gap-1.5 text-[12px]",
                      passwordValid ? "text-emerald-600" : "text-gray-500"
                    )}
                  >
                    <Check
                      className={cn(
                        "h-3.5 w-3.5",
                        !passwordValid && "opacity-40"
                      )}
                    />
                    At least 6 characters
                  </p>
                )}
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13px] leading-relaxed text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (mode === "signup" && !passwordValid)}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-[14px] font-medium text-white shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "login" ? "Signing in…" : "Creating account…"}
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Log in" : "Create free account"}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-[13px] text-gray-500">
              {mode === "login" ? (
                <>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("signup")}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign up free
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-medium text-primary hover:underline"
                  >
                    Log in
                  </button>
                </>
              )}
            </p>

            <p className="mt-6 text-center text-[11px] leading-relaxed text-gray-400">
              By continuing, you agree to DropBot&apos;s Terms of Service and
              Privacy Policy.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
