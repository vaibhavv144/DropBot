(function () {
  "use strict";

  // Locate the <script> tag that loaded this file and read its config.
  var currentScript =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

  var BOT_KEY = currentScript.getAttribute("data-bot-id");
  var API_BASE = (
    currentScript.getAttribute("data-api") || "http://127.0.0.1:8000"
  ).replace(/\/$/, "");

  if (!BOT_KEY) {
    console.error("[chatbot] Missing data-bot-id on the embed script tag.");
    return;
  }

  var STORAGE_KEY = "chatbot_visitor_" + BOT_KEY;
  function getVisitorId() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (!v) {
        v = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem(STORAGE_KEY, v);
      }
      return v;
    } catch (e) {
      return "v_anon";
    }
  }

  var state = {
    open: false,
    conversationId: null,
    visitorId: getVisitorId(),
    loadingConfig: true,
    config: {
      name: "Assistant",
      theme_color: "#4f46e5",
      greeting: "Hi! How can I help you today?",
      position: "right",
      launcher_text: "Chat with us",
      suggested_questions: [],
    },
  };

  // ---- Build host element + Shadow DOM (full CSS isolation) ----
  var host = document.createElement("div");
  host.setAttribute("data-chatbot-widget", BOT_KEY);
  document.body.appendChild(host);
  var root = host.attachShadow({ mode: "open" });

  var style = document.createElement("style");
  root.appendChild(style);
  var container = document.createElement("div");
  root.appendChild(container);

  function css() {
    var c = state.config.theme_color || "#4f46e5";
    var side = state.config.position === "left" ? "left" : "right";
    return [
      ":host { all: initial; }",
      "* { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }",
      ".cb-launcher {",
      "  position: fixed; bottom: 20px; " + side + ": 20px; z-index: 2147483000;",
      "  display: flex; align-items: center; gap: 8px; cursor: pointer;",
      "  background: " + c + "; color: #fff; border: none; border-radius: 999px;",
      "  padding: 12px 18px; font-size: 15px; font-weight: 600;",
      "  box-shadow: 0 6px 24px rgba(0,0,0,0.18); transition: transform .15s ease;",
      "}",
      ".cb-launcher:hover { transform: translateY(-2px); }",
      ".cb-launcher svg { width: 20px; height: 20px; }",
      ".cb-panel {",
      "  position: fixed; bottom: 88px; " + side + ": 20px; z-index: 2147483000;",
      "  width: 380px; max-width: calc(100vw - 40px); height: 560px; max-height: calc(100vh - 120px);",
      "  background: #fff; border-radius: 16px; overflow: hidden; display: flex; flex-direction: column;",
      "  box-shadow: 0 12px 48px rgba(0,0,0,0.24); opacity: 0; pointer-events: none;",
      "  transform: translateY(12px); transition: opacity .18s ease, transform .18s ease;",
      "}",
      ".cb-panel.open { opacity: 1; pointer-events: auto; transform: translateY(0); }",
      ".cb-header { background: " + c + "; color: #fff; padding: 16px; display: flex; align-items: center; justify-content: space-between; }",
      ".cb-header h3 { margin: 0; font-size: 16px; font-weight: 600; }",
      ".cb-close { background: transparent; border: none; color: #fff; cursor: pointer; font-size: 22px; line-height: 1; opacity: .85; }",
      ".cb-close:hover { opacity: 1; }",
      ".cb-body { flex: 1; overflow-y: auto; padding: 16px; background: #f7f7f9; display: flex; flex-direction: column; gap: 12px; }",
      ".cb-msg { max-width: 85%; padding: 10px 14px; border-radius: 14px; font-size: 14px; line-height: 1.45; white-space: pre-wrap; word-wrap: break-word; }",
      ".cb-msg.user { align-self: flex-end; background: " + c + "; color: #fff; border-bottom-right-radius: 4px; }",
      ".cb-msg.bot { align-self: flex-start; background: #fff; color: #1f2937; border: 1px solid #ececf0; border-bottom-left-radius: 4px; }",
      ".cb-msg.bot p { margin: 0 0 8px; } .cb-msg.bot p:last-child { margin-bottom: 0; }",
      ".cb-msg.bot ul, .cb-msg.bot ol { margin: 4px 0 8px; padding-left: 20px; }",
      ".cb-msg.bot li { margin: 3px 0; }",
      ".cb-msg.bot strong { font-weight: 600; }",
      ".cb-msg.bot .cb-h { font-weight: 600; margin: 4px 0; }",
      ".cb-msg.bot a { color: " + c + "; text-decoration: underline; }",
      ".cb-msg.bot code { background: #f1f1f4; padding: 1px 5px; border-radius: 4px; font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 12.5px; }",
      ".cb-msg.bot pre { background: #f1f1f4; padding: 10px; border-radius: 8px; overflow-x: auto; margin: 6px 0; }",
      ".cb-msg.bot pre code { background: none; padding: 0; }",
      ".cb-sources { font-size: 11px; color: #6b7280; margin-top: 2px; }",
      ".cb-sources a { color: " + c + "; text-decoration: none; }",
      ".cb-typing { display: inline-flex; gap: 4px; }",
      ".cb-typing span { width: 6px; height: 6px; background: #b6b6c0; border-radius: 50%; animation: cb-bounce 1.2s infinite; }",
      ".cb-typing span:nth-child(2) { animation-delay: .2s; } .cb-typing span:nth-child(3) { animation-delay: .4s; }",
      "@keyframes cb-bounce { 0%,60%,100% { transform: translateY(0); opacity:.5 } 30% { transform: translateY(-5px); opacity:1 } }",
      ".cb-footer { display: flex; gap: 8px; padding: 12px; border-top: 1px solid #ececf0; background: #fff; }",
      ".cb-input { flex: 1; border: 1px solid #d8d8e0; border-radius: 10px; padding: 10px 12px; font-size: 14px; resize: none; outline: none; max-height: 96px; }",
      ".cb-input:focus { border-color: " + c + "; }",
      ".cb-send { background: " + c + "; color: #fff; border: none; border-radius: 10px; padding: 0 16px; cursor: pointer; font-weight: 600; }",
      ".cb-send:disabled { opacity: .5; cursor: default; }",
      ".cb-branding { text-align: center; font-size: 10px; color: #9ca3af; padding: 6px; background:#fff; }",
      ".cb-suggestions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 2px; }",
      ".cb-chip { background:#fff; border:1px solid #d8d8e0; color:#374151; border-radius:999px; padding:7px 12px; font-size:12.5px; line-height:1.2; cursor:pointer; text-align:left; transition: border-color .15s ease, color .15s ease; }",
      ".cb-chip:hover { border-color:" + c + "; color:" + c + "; }",
      ".cb-fb { display:flex; align-items:center; gap:4px; margin-top:2px; }",
      ".cb-fb button { background:transparent; border:none; cursor:pointer; color:#b6b6c0; padding:2px; display:inline-flex; border-radius:6px; }",
      ".cb-fb button:hover { color:#4b5563; background:#f1f1f4; }",
      ".cb-fb button.cb-up-on { color:#16a34a; }",
      ".cb-fb button.cb-down-on { color:#ef4444; }",
      ".cb-fb-thanks { font-size:11px; color:#9ca3af; margin-left:2px; }",
    ].join("\n");
  }

  function chatIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.6-.8L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>';
  }

  function render() {
    style.textContent = css();
    container.innerHTML =
      '<button class="cb-launcher" id="cb-launcher">' +
      chatIcon() +
      "<span>" +
      escapeHtml(state.config.launcher_text) +
      "</span></button>" +
      '<div class="cb-panel' +
      (state.open ? " open" : "") +
      '" id="cb-panel">' +
      '<div class="cb-header"><h3>' +
      escapeHtml(state.config.name) +
      '</h3><button class="cb-close" id="cb-close">&times;</button></div>' +
      '<div class="cb-body" id="cb-body"></div>' +
      '<div class="cb-footer">' +
      '<textarea class="cb-input" id="cb-input" rows="1" placeholder="Type your message..."></textarea>' +
      '<button class="cb-send" id="cb-send">Send</button></div>' +
      '<div class="cb-branding">Powered by RAG Chatbot</div>' +
      "</div>";

    root.getElementById("cb-launcher").addEventListener("click", toggle);
    root.getElementById("cb-close").addEventListener("click", toggle);
    root.getElementById("cb-send").addEventListener("click", onSend);
    var input = root.getElementById("cb-input");
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    });

    if (state.open && !state._greeted) {
      addMessage("bot", state.config.greeting);
      showSuggestions();
      state._greeted = true;
    }
  }

  function toggle() {
    state.open = !state.open;
    var panel = root.getElementById("cb-panel");
    if (panel) panel.classList.toggle("open", state.open);
    if (state.open && !state._greeted) {
      addMessage("bot", state.config.greeting);
      showSuggestions();
      state._greeted = true;
      root.getElementById("cb-input").focus();
    }
  }

  // Clickable starter prompts shown under the greeting until the visitor speaks.
  function showSuggestions() {
    var qs = state.config.suggested_questions || [];
    if (!qs.length) return;
    var b = bodyEl();
    if (!b) return;
    var wrap = document.createElement("div");
    wrap.className = "cb-suggestions";
    wrap.id = "cb-suggestions";
    qs.forEach(function (q) {
      var chip = document.createElement("button");
      chip.className = "cb-chip";
      chip.textContent = q;
      chip.addEventListener("click", function () {
        removeSuggestions();
        addMessage("user", q);
        sendToApi(q);
      });
      wrap.appendChild(chip);
    });
    b.appendChild(wrap);
    scrollDown();
  }

  function removeSuggestions() {
    var el = root.getElementById("cb-suggestions");
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function thumbIcon(down) {
    var d = down
      ? "M17 14V2M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z"
      : "M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z";
    return (
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' +
      d +
      '"/></svg>'
    );
  }

  // Thumbs up/down rating attached to a finished answer.
  function addFeedback(messageId) {
    if (!messageId) return;
    var b = bodyEl();
    if (!b) return;
    var wrap = document.createElement("div");
    wrap.className = "cb-fb";
    var up = document.createElement("button");
    up.title = "Helpful";
    up.innerHTML = thumbIcon(false);
    var down = document.createElement("button");
    down.title = "Not helpful";
    down.innerHTML = thumbIcon(true);
    var thanks = document.createElement("span");
    thanks.className = "cb-fb-thanks";

    function rate(rating) {
      up.classList.toggle("cb-up-on", rating === 1);
      down.classList.toggle("cb-down-on", rating === -1);
      thanks.textContent = "Thanks for the feedback";
      fetch(API_BASE + "/api/public/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bot_key: BOT_KEY,
          message_id: messageId,
          rating: rating,
        }),
      }).catch(function () {});
    }

    up.addEventListener("click", function () {
      rate(1);
    });
    down.addEventListener("click", function () {
      rate(-1);
    });
    wrap.appendChild(up);
    wrap.appendChild(down);
    wrap.appendChild(thanks);
    b.appendChild(wrap);
    scrollDown();
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  // Inline Markdown: escape HTML first, then apply safe formatting.
  function mdInline(s) {
    s = escapeHtml(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    s = s.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>'
    );
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    s = s.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
    return s;
  }

  // Minimal, dependency-free Markdown -> HTML for chat answers.
  function renderMarkdown(md) {
    var lines = String(md == null ? "" : md).split(/\r?\n/);
    var out = "";
    var listType = null; // "ul" | "ol" | null
    var inCode = false;
    var codeBuf = [];

    function closeList() {
      if (listType) {
        out += listType === "ol" ? "</ol>" : "</ul>";
        listType = null;
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      if (/^\s*```/.test(line)) {
        if (inCode) {
          out += "<pre><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>";
          codeBuf = [];
          inCode = false;
        } else {
          closeList();
          inCode = true;
        }
        continue;
      }
      if (inCode) {
        codeBuf.push(line);
        continue;
      }

      var ul = line.match(/^\s*[-*]\s+(.*)$/);
      var ol = line.match(/^\s*\d+\.\s+(.*)$/);
      var h = line.match(/^\s*(#{1,4})\s+(.*)$/);

      if (ul) {
        if (listType !== "ul") {
          closeList();
          out += "<ul>";
          listType = "ul";
        }
        out += "<li>" + mdInline(ul[1]) + "</li>";
      } else if (ol) {
        if (listType !== "ol") {
          closeList();
          out += "<ol>";
          listType = "ol";
        }
        out += "<li>" + mdInline(ol[1]) + "</li>";
      } else if (h) {
        closeList();
        out += '<div class="cb-h">' + mdInline(h[2]) + "</div>";
      } else if (line.trim() === "") {
        closeList();
      } else {
        closeList();
        out += "<p>" + mdInline(line) + "</p>";
      }
    }
    if (inCode) {
      out += "<pre><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>";
    }
    closeList();
    return out;
  }

  function bodyEl() {
    return root.getElementById("cb-body");
  }

  function scrollDown() {
    var b = bodyEl();
    if (b) b.scrollTop = b.scrollHeight;
  }

  function addMessage(role, text) {
    var b = bodyEl();
    var el = document.createElement("div");
    el.className = "cb-msg " + (role === "user" ? "user" : "bot");
    if (role === "user") {
      el.textContent = text;
    } else {
      el.innerHTML = renderMarkdown(text);
    }
    b.appendChild(el);
    scrollDown();
    return el;
  }

  function showTyping() {
    var b = bodyEl();
    var el = document.createElement("div");
    el.className = "cb-msg bot";
    el.innerHTML = '<span class="cb-typing"><span></span><span></span><span></span></span>';
    b.appendChild(el);
    scrollDown();
    return el;
  }

  function addSources(afterEl, sources) {
    if (!sources || !sources.length) return;
    var seen = {};
    var links = [];
    for (var i = 0; i < sources.length; i++) {
      var s = sources[i];
      var key = s.url || s.title;
      if (seen[key]) continue;
      seen[key] = true;
      var label = escapeHtml(s.title || s.url);
      if (s.url && /^https?:\/\//.test(s.url)) {
        links.push('<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' + label + "</a>");
      } else {
        links.push(label);
      }
    }
    if (!links.length) return;
    var src = document.createElement("div");
    src.className = "cb-sources";
    src.innerHTML = "Sources: " + links.join(", ");
    afterEl.insertAdjacentElement("afterend", src);
    scrollDown();
  }

  function onSend() {
    var input = root.getElementById("cb-input");
    var text = (input.value || "").trim();
    if (!text) return;
    input.value = "";
    removeSuggestions();
    addMessage("user", text);
    sendToApi(text);
  }

  function sendToApi(text) {
    var sendBtn = root.getElementById("cb-send");
    sendBtn.disabled = true;
    var typing = showTyping();

    var payload = {
      bot_key: BOT_KEY,
      message: text,
      conversation_id: state.conversationId,
      visitor_id: state.visitorId,
    };

    fetch(API_BASE + "/api/public/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (resp) {
        if (!resp.ok) {
          return resp.json().then(function (err) {
            var detail = (err && err.detail) || "HTTP " + resp.status;
            if (resp.status === 403) {
              detail =
                "This site is not allowed for this bot. Add this domain in the dashboard under Appearance → Allowed domains (use * for local testing).";
            }
            throw new Error(detail);
          }).catch(function (parseErr) {
            if (parseErr instanceof Error && parseErr.message.indexOf("not allowed") !== -1) throw parseErr;
            throw new Error("HTTP " + resp.status);
          });
        }
        if (!resp.body) throw new Error("HTTP " + resp.status);
        var reader = resp.body.getReader();
        var decoder = new TextDecoder();
        var buffer = "";
        var botEl = null;
        var answer = "";
        var messageId = null;

        function pump() {
          return reader.read().then(function (res) {
            if (res.done) {
              finish();
              return;
            }
            buffer += decoder.decode(res.value, { stream: true });
            var events = buffer.split("\n\n");
            buffer = events.pop();
            for (var i = 0; i < events.length; i++) {
              handleEvent(events[i]);
            }
            return pump();
          });
        }

        function handleEvent(raw) {
          var lines = raw.split("\n");
          var ev = "message";
          var data = "";
          for (var i = 0; i < lines.length; i++) {
            if (lines[i].indexOf("event:") === 0) ev = lines[i].slice(6).trim();
            else if (lines[i].indexOf("data:") === 0) data += lines[i].slice(5).trim();
          }
          if (!data) return;
          var parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            return;
          }
          if (ev === "meta") {
            state.conversationId = parsed.conversation_id;
            messageId = parsed.message_id || null;
          } else if (ev === "token") {
            if (!botEl) {
              if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
              botEl = addMessage("bot", "");
            }
            answer += parsed.t;
            botEl.innerHTML = renderMarkdown(answer);
            scrollDown();
          } else if (ev === "sources") {
            if (botEl) addSources(botEl, parsed);
          }
        }

        function finish() {
          if (!botEl) {
            if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
            addMessage("bot", "Sorry, I couldn't generate a response.");
          } else {
            addFeedback(messageId);
          }
          sendBtn.disabled = false;
        }

        return pump();
      })
      .catch(function (err) {
        if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
        var msg =
          err && err.message && err.message.indexOf("not allowed") !== -1
            ? err.message
            : "Sorry, something went wrong. Please try again.";
        addMessage("bot", msg);
        sendBtn.disabled = false;
        console.error("[chatbot]", err);
      });
  }

  // ---- Load public config, then render ----
  fetch(API_BASE + "/api/public/config/" + encodeURIComponent(BOT_KEY))
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .then(function (cfg) {
      if (cfg) state.config = Object.assign(state.config, cfg);
    })
    .catch(function () {})
    .finally(function () {
      state.loadingConfig = false;
      render();
    });
})();
