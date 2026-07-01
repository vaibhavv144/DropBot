"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, type Bot as BotType } from "@/lib/api";
import { useRequireAuth } from "@/lib/use-require-auth";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  MessageSquare,
  ArrowRight,
  Bot,
  Globe,
  Sparkles,
  X,
  Rocket,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [bots, setBots] = useState<BotType[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [domains, setDomains] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useRequireAuth();

  useEffect(() => {
    if (!getToken()) return;
    api
      .listBots()
      .then(setBots)
      .catch((e) => {
        if (String(e.message).includes("401")) router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function createBot(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const bot = await api.createBot(name || "My Assistant", domains || "*");
      router.push(`/dashboard/${bot.id}`);
    } catch (err: any) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="app-bg">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6">
        {/* Page hero */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white">
                {loading ? "·" : bots.length}
              </span>
              <span className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-[12px] font-medium text-gray-600 backdrop-blur-sm">
                Active bots
              </span>
            </div>
            <h1
              className="font-medium leading-[1.08] tracking-[-0.02em] text-gray-900"
              style={{ fontSize: "clamp(1.9rem, 4vw, 2.8rem)" }}
            >
              Your chatbots
            </h1>
            <p className="mt-2 max-w-md text-[15px] leading-relaxed text-gray-600">
              Create a bot, feed it your site content, and embed it anywhere —
              in 60 seconds.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/onboarding")}
              className="h-11 rounded-full px-4 text-[14px]"
            >
              <Rocket className="h-4 w-4" /> Guided setup
            </Button>
            <Button
              onClick={() => setCreating((c) => !c)}
              className="h-11 rounded-full bg-gray-900 px-6 text-[14px] shadow-[0_8px_24px_rgba(0,0,0,0.18)] hover:bg-gray-800"
            >
              {creating ? (
                <>
                  <X className="h-4 w-4" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> New bot
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Create form */}
        {creating && (
          <div className="animate-rise mt-8 overflow-hidden rounded-[24px] border border-primary/20 bg-gradient-to-b from-indigo-50/70 to-white p-6 shadow-[0_24px_60px_rgba(79,70,229,0.12)] sm:p-8">
            <div className="mb-5 flex items-start gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-[18px] font-semibold tracking-tight text-gray-900">
                  Create a new bot
                </h2>
                <p className="text-[13px] text-gray-500">
                  You can change all of this later.
                </p>
              </div>
            </div>
            <form
              onSubmit={createBot}
              className="flex flex-col gap-4 sm:flex-row sm:items-end"
            >
              <div className="flex-1 space-y-2">
                <Label htmlFor="name">Bot name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Acme Support"
                  className="h-11 bg-white"
                  autoFocus
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="domains">Allowed domains</Label>
                <Input
                  id="domains"
                  value={domains}
                  onChange={(e) => setDomains(e.target.value)}
                  placeholder="acme.com (or * for any)"
                  className="h-11 bg-white"
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="h-11 rounded-full px-6"
              >
                {submitting ? "Creating…" : "Create bot"}
              </Button>
            </form>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
          </div>
        )}

        {/* Bot list */}
        <div className="mt-10">
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-44 animate-pulse rounded-[24px] border border-gray-200 bg-white/60"
                />
              ))}
            </div>
          ) : bots.length === 0 ? (
            <div className="flex flex-col items-center gap-5 rounded-[28px] border border-dashed border-gray-300 bg-white/60 px-6 py-16 text-center backdrop-blur-sm">
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
                <MessageSquare className="h-8 w-8" />
              </span>
              <div>
                <p className="text-[17px] font-semibold tracking-tight text-gray-900">
                  No bots yet
                </p>
                <p className="mt-1 max-w-xs text-[14px] text-gray-500">
                  Create your first assistant to start answering questions from
                  your own content.
                </p>
              </div>
              <Button
                onClick={() => router.push("/dashboard/onboarding")}
                className="h-11 rounded-full px-6"
              >
                <Rocket className="h-4 w-4" /> Start guided setup
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {bots.map((bot, i) => (
                <button
                  key={bot.id}
                  onClick={() => router.push(`/dashboard/${bot.id}`)}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className="card-lift animate-rise group flex flex-col rounded-[24px] border border-gray-200 bg-white p-6 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:border-primary/30"
                >
                  <div className="flex items-start justify-between">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
                      style={{ background: bot.theme_color }}
                    >
                      <Bot className="h-6 w-6" />
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 transition-all duration-300 group-hover:bg-primary group-hover:text-white">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>

                  <h3 className="mt-5 truncate text-[18px] font-semibold tracking-tight text-gray-900">
                    {bot.name}
                  </h3>

                  <div className="mt-3 flex items-center gap-1.5 text-[13px] text-gray-500">
                    <Globe className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                    <span className="truncate">{bot.allowed_domains}</span>
                  </div>

                  <div className="mt-auto pt-5">
                    <code className="block truncate rounded-lg bg-gray-50 px-2.5 py-1.5 font-mono text-[11px] text-gray-500">
                      {bot.public_key}
                    </code>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
