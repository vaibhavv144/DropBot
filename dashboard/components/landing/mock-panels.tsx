import { Bot, FileText, Globe, Sparkles } from "lucide-react";

/** A mock embedded chat widget — the product in action. */
export function MockChatPanel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 sm:rounded-2xl ${className}`}
    >
      <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-900 px-4 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white">
          <Bot className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold text-white">DropBot Assistant</p>
          <p className="text-[11px] text-white/60">Online · replies instantly</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 bg-[#f7f7f8] p-4">
        <div className="max-w-[80%] self-end rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-[13px] text-white">
          Do you offer a free plan?
        </div>
        <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-white px-3.5 py-2 text-[13px] text-gray-800 ring-1 ring-gray-100">
          Yes — the Free plan includes 1 bot and 100 messages a month.
          <span className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
            <FileText className="h-3 w-3" /> Source: pricing page
          </span>
        </div>
        <div className="flex items-center gap-1 self-start rounded-2xl rounded-bl-sm bg-white px-3 py-2.5 ring-1 ring-gray-100">
          <span className="typing-dot h-1.5 w-1.5 rounded-full bg-gray-400" />
          <span
            className="typing-dot h-1.5 w-1.5 rounded-full bg-gray-400"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="typing-dot h-1.5 w-1.5 rounded-full bg-gray-400"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </div>
    </div>
  );
}

/** A mock knowledge-base panel showing sources being indexed. */
export function MockSourcesPanel({ className = "" }: { className?: string }) {
  const sources = [
    { icon: Globe, label: "yoursite.com/pricing", tag: "crawled" },
    { icon: Globe, label: "yoursite.com/docs", tag: "crawled" },
    { icon: FileText, label: "handbook.pdf", tag: "uploaded" },
    { icon: FileText, label: "faq.md", tag: "uploaded" },
  ];
  return (
    <div
      className={`overflow-hidden rounded-xl bg-white p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 sm:rounded-2xl ${className}`}
    >
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-gray-900">Knowledge base</p>
        <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
          <Sparkles className="h-3 w-3" /> Indexed
        </span>
      </div>
      <ul className="space-y-2.5">
        {sources.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5"
          >
            <span className="flex items-center gap-2 text-[12px] text-gray-700">
              <s.icon className="h-3.5 w-3.5 text-gray-400" />
              {s.label}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-gray-400">
              {s.tag}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
