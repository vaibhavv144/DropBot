import { Bot, Send, X } from "lucide-react";

/**
 * A faithful, static mock of the embeddable chat widget. Pure function of its
 * props so the Appearance tab can render live changes as the owner edits.
 */
export function WidgetPreview({
  name,
  themeColor,
  greeting,
  launcherText,
  position,
  suggestedQuestions,
}: {
  name: string;
  themeColor: string;
  greeting: string;
  launcherText: string;
  position: string;
  suggestedQuestions: string[];
}) {
  const color = themeColor || "#4f46e5";
  const alignRight = position !== "left";

  return (
    <div className="flex flex-col">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400">
        Live preview
      </p>
      {/* Faux website canvas */}
      <div className="relative h-[460px] overflow-hidden rounded-2xl border border-gray-200 bg-[repeating-linear-gradient(45deg,#fafafa,#fafafa_12px,#f4f4f6_12px,#f4f4f6_24px)] p-3">
        {/* Chat panel */}
        <div
          className={`absolute bottom-16 ${
            alignRight ? "right-3" : "left-3"
          } flex w-[300px] max-w-[calc(100%-24px)] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_12px_48px_rgba(0,0,0,0.18)]`}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ background: color }}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/15">
                <Bot className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-[13px] font-semibold">{name || "Assistant"}</p>
                <p className="text-[11px] text-white/70">Online</p>
              </div>
            </div>
            <X className="h-4 w-4 opacity-80" />
          </div>

          {/* Body */}
          <div className="flex min-h-[210px] flex-col gap-2.5 bg-[#f7f7f9] p-3.5">
            <div className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-[13px] text-gray-800 shadow-sm ring-1 ring-gray-100">
              {greeting || "Hi! How can I help you today?"}
            </div>
            {suggestedQuestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {suggestedQuestions.map((q, i) => (
                  <span
                    key={i}
                    className="rounded-full border bg-white px-2.5 py-1 text-[11.5px] text-gray-700"
                    style={{ borderColor: `${color}55` }}
                  >
                    {q}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 border-t border-gray-100 bg-white p-2.5">
            <div className="flex-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[12px] text-gray-400">
              Type your message…
            </div>
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{ background: color }}
            >
              <Send className="h-4 w-4" />
            </span>
          </div>
          <div className="bg-white py-1 text-center text-[9px] text-gray-400">
            Powered by DropBot
          </div>
        </div>

        {/* Launcher */}
        <div
          className={`absolute bottom-3 ${alignRight ? "right-3" : "left-3"}`}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg"
            style={{ background: color }}
          >
            <Bot className="h-4 w-4" />
            {launcherText || "Chat with us"}
          </span>
        </div>
      </div>
    </div>
  );
}
