"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  api,
  getToken,
  API_BASE,
  embedSnippet,
  type Bot,
  type Source,
  type Conversation,
  type Analytics,
} from "@/lib/api";
import { useRequireAuth } from "@/lib/use-require-auth";
import { Header } from "@/components/header";
import { WidgetPreview } from "@/components/widget-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Trash2,
  Globe,
  Upload,
  Copy,
  Check,
  RefreshCw,
  Bot as BotIcon,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Users,
  HelpCircle,
  RotateCw,
} from "lucide-react";

type Tab = "knowledge" | "appearance" | "embed" | "conversations" | "analytics";

export default function BotDetailPage() {
  const router = useRouter();
  const params = useParams();
  const botId = params.botId as string;

  const [bot, setBot] = useState<Bot | null>(null);
  const [tab, setTab] = useState<Tab>("knowledge");
  const [loading, setLoading] = useState(true);

  useRequireAuth();

  useEffect(() => {
    if (!getToken()) return;
    api
      .getBot(botId)
      .then(setBot)
      .catch(() => router.replace("/dashboard"))
      .finally(() => setLoading(false));
  }, [botId, router]);

  if (loading || !bot) {
    return (
      <div className="app-bg">
        <Header />
        <p className="mx-auto max-w-6xl px-4 py-8 text-muted-foreground sm:px-6">Loading...</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "knowledge", label: "Knowledge" },
    { id: "analytics", label: "Analytics" },
    { id: "appearance", label: "Appearance" },
    { id: "embed", label: "Embed" },
    { id: "conversations", label: "Conversations" },
  ];

  return (
    <div className="app-bg">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-8 sm:px-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-5 flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        <div className="mb-7 flex items-center gap-4">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{ background: bot.theme_color }}
          >
            <BotIcon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{bot.name}</h1>
            <p className="font-mono text-[12px] text-gray-500">{bot.public_key}</p>
          </div>
        </div>

        <div className="mb-7 flex gap-1 overflow-x-auto border-b border-gray-200">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "knowledge" && <KnowledgeTab botId={botId} />}
        {tab === "analytics" && <AnalyticsTab botId={botId} />}
        {tab === "appearance" && <AppearanceTab bot={bot} onSaved={setBot} />}
        {tab === "embed" && <EmbedTab bot={bot} />}
        {tab === "conversations" && <ConversationsTab botId={botId} />}
      </main>
    </div>
  );
}

function KnowledgeTab({ botId }: { botId: string }) {
  const [sources, setSources] = useState<Source[]>([]);
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => {
    api.listSources(botId).then(setSources).catch(() => {});
  }, [botId]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  async function addUrl(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api.addUrl(botId, url);
      setUrl("");
      refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      await api.addFile(botId, file);
      refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(id: string) {
    await api.deleteSource(botId, id);
    refresh();
  }

  async function setSync(s: Source, value: number) {
    // value 0 = off; otherwise the interval in hours.
    await api.updateSourceSync(
      botId,
      s.id,
      value === 0 ? 0 : 1,
      value === 0 ? s.sync_interval_hours || 24 : value
    );
    refresh();
  }

  async function resync(s: Source) {
    await api.resyncSource(botId, s.id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Crawl a website</CardTitle>
          <CardDescription>
            We fetch pages from this URL, extract the text, and index it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={addUrl} className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourwebsite.com"
            />
            <Button type="submit" disabled={busy}>
              <Globe className="h-4 w-4" /> Crawl
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload documents</CardTitle>
          <CardDescription>PDF, Markdown, TXT, or HTML.</CardDescription>
        </CardHeader>
        <CardContent>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept=".pdf,.md,.txt,.html,.htm,.csv,.json"
            onChange={onFile}
          />
          <Button variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Choose file
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Sources</CardTitle>
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sources yet.</p>
          ) : (
            <ul className="divide-y">
              {sources.map((s) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.location}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.kind} · {s.pages_count} pages · {s.chunks_count} chunks
                      {s.detail ? ` · ${s.detail}` : ""}
                      {s.last_synced_at
                        ? ` · synced ${new Date(s.last_synced_at).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                    {s.kind === "url" && (
                      <>
                        <select
                          value={s.auto_sync ? String(s.sync_interval_hours) : "0"}
                          onChange={(e) => setSync(s, Number(e.target.value))}
                          title="Automatic re-crawl"
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                        >
                          <option value="0">No auto-sync</option>
                          <option value="24">Daily</option>
                          <option value="168">Weekly</option>
                        </select>
                        <button
                          onClick={() => resync(s)}
                          title="Re-sync now"
                          disabled={s.status === "processing"}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-40"
                        >
                          <RotateCw
                            className={`h-4 w-4 ${s.status === "processing" ? "animate-spin" : ""}`}
                          />
                        </button>
                      </>
                    )}
                    <Badge status={s.status}>{s.status}</Badge>
                    <button
                      onClick={() => remove(s.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AppearanceTab({ bot, onSaved }: { bot: Bot; onSaved: (b: Bot) => void }) {
  const [form, setForm] = useState(bot);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function set<K extends keyof Bot>(key: K, value: Bot[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    try {
      const updated = await api.updateBot(bot.id, {
        name: form.name,
        allowed_domains: form.allowed_domains,
        system_prompt: form.system_prompt,
        answer_mode: form.answer_mode,
        theme_color: form.theme_color,
        greeting: form.greeting,
        position: form.position,
        launcher_text: form.launcher_text,
        suggested_questions: form.suggested_questions,
      });
      onSaved(updated);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const previewQuestions = form.suggested_questions
    .split("\n")
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, 6);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
    <Card>
      <CardHeader>
        <CardTitle>Appearance & behavior</CardTitle>
        <CardDescription>Customize how your bot looks and answers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bot name">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Launcher text">
            <Input
              value={form.launcher_text}
              onChange={(e) => set("launcher_text", e.target.value)}
            />
          </Field>
          <Field label="Theme color">
            <div className="flex gap-2">
              <input
                type="color"
                value={form.theme_color}
                onChange={(e) => set("theme_color", e.target.value)}
                className="h-10 w-12 rounded border"
              />
              <Input
                value={form.theme_color}
                onChange={(e) => set("theme_color", e.target.value)}
              />
            </div>
          </Field>
          <Field label="Position">
            <select
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="right">Bottom right</option>
              <option value="left">Bottom left</option>
            </select>
          </Field>
          <Field label="Answer mode">
            <select
              value={form.answer_mode}
              onChange={(e) => set("answer_mode", e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="grounded">Grounded (only site/docs)</option>
              <option value="hybrid">Hybrid (fallback to general)</option>
            </select>
          </Field>
          <Field label="Allowed domains">
            <Input
              value={form.allowed_domains}
              onChange={(e) => set("allowed_domains", e.target.value)}
              placeholder="* or example.com, localhost"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated hostnames where the widget may run. Use <code>*</code> for
              any domain, or add <code>localhost</code> when testing the widget demo locally.
            </p>
          </Field>
        </div>
        <Field label="Greeting message">
          <Input value={form.greeting} onChange={(e) => set("greeting", e.target.value)} />
        </Field>
        <Field label="System prompt (optional)">
          <Textarea
            value={form.system_prompt}
            onChange={(e) => set("system_prompt", e.target.value)}
            placeholder="Extra instructions, tone, persona..."
          />
        </Field>
        <Field label="Suggested questions">
          <Textarea
            value={form.suggested_questions}
            onChange={(e) => set("suggested_questions", e.target.value)}
            placeholder={"Do you offer a free plan?\nHow do I install the widget?\nWhat integrations are supported?"}
          />
          <p className="text-xs text-muted-foreground">
            One per line (up to 6). Shown as clickable chips when a visitor opens
            the chat.
          </p>
        </Field>
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </CardContent>
    </Card>

    <div className="lg:sticky lg:top-24 lg:h-fit">
      <WidgetPreview
        name={form.name}
        themeColor={form.theme_color}
        greeting={form.greeting}
        launcherText={form.launcher_text}
        position={form.position}
        suggestedQuestions={previewQuestions}
      />
    </div>
    </div>
  );
}

function EmbedTab({ bot }: { bot: Bot }) {
  const [copied, setCopied] = useState(false);
  const snippet = embedSnippet(bot.public_key);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Embed on your website</CardTitle>
        <CardDescription>
          Paste this snippet just before the closing &lt;/body&gt; tag.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <pre className="overflow-x-auto rounded-md bg-secondary p-4 text-sm">
            <code>{snippet}</code>
          </pre>
          <Button
            size="sm"
            variant="outline"
            className="absolute right-2 top-2"
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
        <p className="text-sm text-muted-foreground">
          During local development, point <code>src</code> at your widget file (e.g.{" "}
          <code>http://localhost:5173/embed.js</code>). The <code>data-api</code> value is
          your backend URL.
        </p>
        <p className="text-sm">
          <a
            href={`http://localhost:5173/demo/?bot=${encodeURIComponent(bot.public_key)}&api=${encodeURIComponent(API_BASE)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Open widget demo with this bot →
          </a>
          {" "}
          <span className="text-muted-foreground">
            (run <code className="text-xs">npm run serve</code> in <code className="text-xs">widget/</code> first)
          </span>
        </p>
      </CardContent>
    </Card>
  );
}

function ConversationsTab({ botId }: { botId: string }) {
  const [convos, setConvos] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listConversations(botId)
      .then(setConvos)
      .finally(() => setLoading(false));
  }, [botId]);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (convos.length === 0)
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No conversations yet.
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-4">
      {convos.map((c) => (
        <Card key={c.id}>
          <CardHeader>
            <CardDescription>
              {new Date(c.created_at).toLocaleString()} · visitor {c.visitor_id || "anon"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {c.messages.map((m, i) => (
              <div
                key={m.id || i}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary"
                  }`}
                >
                  {m.content}
                </div>
                {m.role === "assistant" && (m.rating !== 0 || m.is_fallback) && (
                  <div className="mt-1 flex items-center gap-2 px-1">
                    {m.rating === 1 && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-green-600">
                        <ThumbsUp className="h-3 w-3" /> Helpful
                      </span>
                    )}
                    {m.rating === -1 && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-red-500">
                        <ThumbsDown className="h-3 w-3" /> Not helpful
                      </span>
                    )}
                    {m.is_fallback === 1 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                        unanswered
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function AnalyticsTab({ botId }: { botId: string }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getAnalytics(botId, days)
      .then(setData)
      .finally(() => setLoading(false));
  }, [botId, days]);

  const ranges = [
    { label: "7 days", value: 7 },
    { label: "30 days", value: 30 },
    { label: "90 days", value: 90 },
  ];

  const satisfaction =
    data && data.thumbs_up + data.thumbs_down > 0
      ? Math.round((data.thumbs_up / (data.thumbs_up + data.thumbs_down)) * 100)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Activity over the last {days} days.
        </p>
        <div className="flex rounded-full border border-gray-200 bg-white p-1">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setDays(r.value)}
              className={`rounded-full px-3 py-1 text-[13px] font-medium transition-colors ${
                days === r.value
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white/60"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={MessageSquare}
              label="Conversations"
              value={data.total_conversations}
            />
            <StatCard
              icon={Users}
              label="Questions asked"
              value={data.visitor_messages}
            />
            <StatCard
              icon={HelpCircle}
              label="Unanswered rate"
              value={`${Math.round(data.unanswered_rate * 100)}%`}
              hint={`${data.unanswered} of ${data.answered + data.unanswered} answers`}
              tone={data.unanswered_rate > 0.3 ? "warn" : "default"}
            />
            <StatCard
              icon={ThumbsUp}
              label="Satisfaction"
              value={satisfaction === null ? "—" : `${satisfaction}%`}
              hint={`${data.thumbs_up} 👍 · ${data.thumbs_down} 👎`}
            />
          </div>

          {/* Volume chart */}
          <Card>
            <CardHeader>
              <CardTitle>Messages per day</CardTitle>
              <CardDescription>
                {data.total_messages} messages across {data.total_conversations}{" "}
                conversations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VolumeChart daily={data.daily} />
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top questions */}
            <Card>
              <CardHeader>
                <CardTitle>Top questions</CardTitle>
                <CardDescription>What visitors ask most.</CardDescription>
              </CardHeader>
              <CardContent>
                {data.top_questions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No questions yet.</p>
                ) : (
                  <ol className="space-y-2.5">
                    {data.top_questions.map((q, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-semibold text-gray-600">
                          {i + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                          {q.question}
                        </span>
                        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                          {q.count}×
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            {/* Needs attention */}
            <Card>
              <CardHeader>
                <CardTitle>Needs attention</CardTitle>
                <CardDescription>
                  Recent answers visitors marked unhelpful.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.recent_downvoted.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No 👎 feedback yet — nice.
                  </p>
                ) : (
                  <ul className="space-y-3">
                    {data.recent_downvoted.map((d, i) => (
                      <li
                        key={i}
                        className="rounded-xl border border-red-100 bg-red-50/50 p-3"
                      >
                        <p className="flex items-center gap-1.5 text-[13px] font-medium text-gray-900">
                          <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
                          {d.question || "(question unavailable)"}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[12px] text-gray-500">
                          {d.answer}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: typeof MessageSquare;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "warn";
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          tone === "warn"
            ? "bg-amber-100 text-amber-700"
            : "bg-primary/10 text-primary"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <p className="mt-3 text-[26px] font-semibold leading-none tracking-tight text-gray-900">
        {value}
      </p>
      <p className="mt-1.5 text-[13px] font-medium text-gray-600">{label}</p>
      {hint && <p className="mt-0.5 text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

function VolumeChart({
  daily,
}: {
  daily: { date: string; conversations: number; messages: number }[];
}) {
  const max = Math.max(1, ...daily.map((d) => d.messages));
  if (daily.every((d) => d.messages === 0)) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No activity in this period yet.
      </p>
    );
  }
  return (
    <div className="flex h-40 items-end gap-[3px]">
      {daily.map((d) => (
        <div
          key={d.date}
          className="group relative flex-1"
          style={{ minWidth: 0 }}
        >
          <div
            className="w-full rounded-t bg-primary/80 transition-colors hover:bg-primary"
            style={{ height: `${(d.messages / max) * 100}%`, minHeight: d.messages ? 2 : 0 }}
          />
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white group-hover:block">
            {d.date}: {d.messages} msg · {d.conversations} conv
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
