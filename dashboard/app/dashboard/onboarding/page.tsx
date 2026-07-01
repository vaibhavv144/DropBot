"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, embedSnippet, type Bot } from "@/lib/api";
import { useRequireAuth } from "@/lib/use-require-auth";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Globe,
  Upload,
  Code2,
  Check,
  Copy,
  ArrowRight,
  ArrowLeft,
  Rocket,
} from "lucide-react";

const STEPS = [
  { n: 1, label: "Create", icon: Sparkles },
  { n: 2, label: "Add content", icon: Globe },
  { n: 3, label: "Embed", icon: Code2 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [bot, setBot] = useState<Bot | null>(null);

  useRequireAuth();

  return (
    <div className="app-bg">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pb-20 pt-10 sm:px-6">
        <div className="mb-3 flex items-center gap-2.5">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white">
            <Rocket className="h-3.5 w-3.5" />
          </span>
          <span className="rounded-full border border-gray-200 bg-white/70 px-3 py-1 text-[12px] font-medium text-gray-600 backdrop-blur-sm">
            Guided setup
          </span>
        </div>
        <h1
          className="font-medium leading-[1.1] tracking-[-0.02em] text-gray-900"
          style={{ fontSize: "clamp(1.7rem, 3.5vw, 2.4rem)" }}
        >
          Let&apos;s launch your first bot
        </h1>
        <p className="mt-2 text-[15px] text-gray-600">
          Three quick steps and you&apos;ll be live on your site.
        </p>

        {/* Stepper */}
        <div className="mt-8 flex items-center">
          {STEPS.map((s, i) => {
            const done = step > s.n;
            const active = step === s.n;
            return (
              <div key={s.n} className="flex flex-1 items-center last:flex-none">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${
                      done
                        ? "bg-primary text-white"
                        : active
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {done ? <Check className="h-4 w-4" /> : s.n}
                  </span>
                  <span
                    className={`hidden text-[13px] font-medium sm:block ${
                      active || done ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-3 h-px flex-1 ${
                      step > s.n ? "bg-primary" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8">
          {step === 1 && (
            <StepCreate
              onCreated={(b) => {
                setBot(b);
                setStep(2);
              }}
            />
          )}
          {step === 2 && bot && (
            <StepContent
              bot={bot}
              onBack={() => setStep(1)}
              onNext={() => setStep(3)}
            />
          )}
          {step === 3 && bot && (
            <StepEmbed
              bot={bot}
              onFinish={() => router.push(`/dashboard/${bot.id}`)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function StepCard({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: typeof Sparkles;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-rise rounded-[24px] border border-gray-200 bg-white p-6 shadow-[0_2px_16px_rgba(0,0,0,0.05)] sm:p-8">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-[18px] font-semibold tracking-tight text-gray-900">
            {title}
          </h2>
          <p className="text-[13px] text-gray-500">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function StepCreate({ onCreated }: { onCreated: (b: Bot) => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [domains, setDomains] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const bot = await api.createBot(name || "My Assistant", domains || "*");
      onCreated(bot);
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <StepCard
      icon={Sparkles}
      title="Name your assistant"
      desc="You can change everything later."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Bot name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Acme Support"
            className="h-11"
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="domains">Allowed domains</Label>
          <Input
            id="domains"
            value={domains}
            onChange={(e) => setDomains(e.target.value)}
            placeholder="acme.com (or * for any)"
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Where the widget may run. Use <code>*</code> while testing.
          </p>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={busy} className="h-11 w-full rounded-full">
          {busy ? "Creating…" : "Create bot"}
          {!busy && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>
    </StepCard>
  );
}

function StepContent({
  bot,
  onBack,
  onNext,
}: {
  bot: Bot;
  onBack: () => void;
  onNext: () => void;
}) {
  const [url, setUrl] = useState("");
  const [added, setAdded] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function addUrl(e: React.FormEvent) {
    e.preventDefault();
    const u = url.trim();
    if (!u) return;
    setError("");
    setBusy(true);
    try {
      await api.addUrl(bot.id, u);
      setAdded((a) => [...a, u]);
      setUrl("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      await api.addFile(bot.id, file);
      setAdded((a) => [...a, file.name]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <StepCard
      icon={Globe}
      title="Teach it your content"
      desc="Crawl a page or upload a document. It indexes in the background."
    >
      <form onSubmit={addUrl} className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourwebsite.com"
          className="h-11"
        />
        <Button type="submit" disabled={busy} className="h-11 shrink-0">
          <Globe className="h-4 w-4" /> Crawl
        </Button>
      </form>

      <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-gray-200" /> or{" "}
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".pdf,.md,.txt,.html,.htm,.csv,.json"
        onChange={onFile}
      />
      <Button
        variant="outline"
        disabled={busy}
        onClick={() => fileRef.current?.click()}
        className="h-11 w-full"
      >
        <Upload className="h-4 w-4" /> Upload a document
      </Button>

      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

      {added.length > 0 && (
        <ul className="mt-4 space-y-2">
          {added.map((a, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-[13px] text-gray-700"
            >
              <Check className="h-4 w-4 shrink-0 text-green-600" />
              <span className="truncate">{a}</span>
              <span className="ml-auto shrink-0 text-[11px] text-gray-400">
                indexing…
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <Button onClick={onNext} className="h-11 rounded-full px-6">
          {added.length ? "Continue" : "Skip for now"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </StepCard>
  );
}

function StepEmbed({ bot, onFinish }: { bot: Bot; onFinish: () => void }) {
  const [copied, setCopied] = useState(false);
  const snippet = embedSnippet(bot.public_key);

  return (
    <StepCard
      icon={Code2}
      title="Drop it on your site"
      desc="Paste this once, just before the closing </body> tag."
    >
      <div className="relative">
        <pre className="overflow-x-auto rounded-xl bg-gray-900 p-4 text-[12.5px] leading-relaxed text-gray-100">
          <code>{snippet}</code>
        </pre>
        <Button
          size="sm"
          variant="outline"
          className="absolute right-2 top-2 bg-white"
          onClick={() => {
            navigator.clipboard.writeText(snippet);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-[13px] text-gray-700">
        <p className="font-medium text-gray-900">🎉 That&apos;s it!</p>
        <p className="mt-1 text-gray-600">
          Your bot is ready. Open its dashboard to customize the look, review
          conversations, and track analytics.
        </p>
      </div>

      <Button onClick={onFinish} className="mt-6 h-11 w-full rounded-full">
        Go to my bot <ArrowRight className="h-4 w-4" />
      </Button>
    </StepCard>
  );
}
