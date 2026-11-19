import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Composer } from "../components/Composer";
import { EngineSwitch } from "../components/EngineSwitch";
import { MessageList } from "../components/MessageList";
import { SettingsModal } from "../components/SettingsModal";
import { Sidebar } from "../components/Sidebar";
import { trackEvent } from "../lib/analytics";
import { useI18n } from "../lib/i18n";
import { friendlyError } from "../lib/openai";
import {
  canSend,
  engineHint,
  probeProvider,
  streamWithProvider,
} from "../lib/provider";
import {
  loadConversations,
  resolveInitialSettings,
  saveConversations,
  saveSettings,
  settingsForEngine,
  titleFromMessages,
  uid,
} from "../lib/storage";
import type {
  BrowserAIStatus,
  ChatMessage,
  ConnectionStatus,
  Conversation,
  EngineMode,
  Settings,
} from "../types";

function persistConversation(
  chats: Conversation[],
  chatId: string | null,
  nextMessages: ChatMessage[],
): { list: Conversation[]; id: string } {
  const now = Date.now();
  if (!chatId) {
    const id = uid();
    const created: Conversation = {
      id,
      title: titleFromMessages(nextMessages),
      updatedAt: now,
      messages: nextMessages,
    };
    return { list: [created, ...chats], id };
  }
  const list = chats
    .map((c) =>
      c.id === chatId
        ? {
            ...c,
            title: titleFromMessages(nextMessages) || c.title,
            updatedAt: now,
            messages: nextMessages,
          }
        : c,
    )
    .sort((a, b) => b.updatedAt - a.updatedAt);
  return { list, id: chatId };
}

export function ChatPage() {
  const { t } = useI18n();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadConversations(),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [browserStatus, setBrowserStatus] =
    useState<BrowserAIStatus>("unsupported");
  const [status, setStatus] = useState<ConnectionStatus>({
    kind: "busy",
    text: t("statusDetecting"),
  });

  const abortRef = useRef<AbortController | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const conversationsRef = useRef(conversations);

  useEffect(() => {
    activeIdRef.current = activeId;
  }, [activeId]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const hint = useMemo(() => {
    if (!settings) return t("statusDetecting");
    return engineHint(settings, browserStatus);
  }, [settings, browserStatus, t]);

  const commitMessages = useCallback((nextMessages: ChatMessage[]) => {
    setMessages(nextMessages);
    const { list, id } = persistConversation(
      conversationsRef.current,
      activeIdRef.current,
      nextMessages,
    );
    activeIdRef.current = id;
    setActiveId(id);
    conversationsRef.current = list;
    setConversations(list);
    saveConversations(list);
  }, []);

  const startNewChat = useCallback(() => {
    if (busy) abortRef.current?.abort();
    activeIdRef.current = null;
    setActiveId(null);
    setMessages([]);
    setInput("");
    setSidebarOpen(false);
  }, [busy]);

  const selectChat = useCallback(
    (id: string) => {
      if (busy) abortRef.current?.abort();
      const found = conversations.find((c) => c.id === id);
      if (!found) return;
      activeIdRef.current = id;
      setActiveId(id);
      setMessages(found.messages);
    },
    [busy, conversations],
  );

  const deleteChat = useCallback(
    (id: string) => {
      const next = conversations.filter((c) => c.id !== id);
      conversationsRef.current = next;
      setConversations(next);
      saveConversations(next);
      if (activeIdRef.current === id) {
        activeIdRef.current = null;
        setActiveId(null);
        setMessages([]);
      }
    },
    [conversations],
  );

  const applySettings = useCallback((next: Settings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const probeConnection = useCallback(
    async (cfg: Settings) => {
      setStatus({ kind: "busy", text: t("statusDetecting") });
      const result = await probeProvider(cfg);
      if (result.browserStatus) setBrowserStatus(result.browserStatus);

      if (result.ok) {
        if (
          result.suggestedModel &&
          result.suggestedModel !== cfg.model &&
          cfg.engine !== "browser"
        ) {
          const next = { ...cfg, model: result.suggestedModel };
          applySettings(next);
        } else if (cfg.engine === "browser" && cfg.model !== "Gemini Nano") {
          applySettings({ ...cfg, model: "Gemini Nano" });
        }
        setStatus({ kind: "ok", text: result.label });
        return result;
      }

      setStatus({ kind: "bad", text: result.label });
      return result;
    },
    [applySettings, t],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const initial = await resolveInitialSettings();
      if (cancelled) return;
      setSettings(initial);
      await probeConnection(initial);
    })();
    return () => {
      cancelled = true;
    };
  }, [probeConnection]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSettingsOpen(false);
        setSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  async function changeEngine(engine: EngineMode) {
    if (!settings || settings.engine === engine) return;
    const next = settingsForEngine(engine, settings);
    applySettings(next);
    const result = await probeConnection(next);
    if (engine === "browser" && !result.ok) {
      setSettingsOpen(true);
    }
  }

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || busy || !settings) return;

    if (!canSend(settings, browserStatus)) {
      setSettingsOpen(true);
      return;
    }

    const userMsg: ChatMessage = { id: uid(), role: "user", content };
    const assistantMsg: ChatMessage = {
      id: uid(),
      role: "assistant",
      content: "",
      streaming: true,
    };
    const history = [...messages, userMsg];
    commitMessages([...history, assistantMsg]);
    setInput("");
    setBusy(true);
    setStatus({ kind: "busy", text: t("statusGenerating") });
    trackEvent("chat_send", {
      engine: settings.engine,
      model: settings.model || "unknown",
    });

    const controller = new AbortController();
    abortRef.current = controller;
    let assembled = "";

    try {
      await streamWithProvider({
        settings,
        signal: controller.signal,
        messages: history
          .filter((m) => !m.error)
          .map(({ role, content: c }) => ({ role, content: c })),
        onDelta: (delta) => {
          assembled += delta;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id ? { ...m, content: assembled } : m,
            ),
          );
        },
      });

      commitMessages([
        ...history,
        {
          ...assistantMsg,
          streaming: false,
          content: assembled || "（模型没有返回内容）",
        },
      ]);
      setStatus({
        kind: "ok",
        text:
          settings.engine === "browser"
            ? "Gemini Nano"
            : settings.model || "ok",
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        commitMessages([
          ...history,
          {
            ...assistantMsg,
            streaming: false,
            content: assembled || "（已停止）",
          },
        ]);
        setStatus({
          kind: "ok",
          text: settings.model || "已停止",
        });
      } else {
        const e = err as { status?: number; bodyText?: string; message?: string };
        commitMessages([
          ...history,
          {
            id: uid(),
            role: "assistant",
            error: true,
            content: friendlyError(err, e.status, e.bodyText),
          },
        ]);
        setStatus({ kind: "bad", text: t("statusFailed") });
        trackEvent("chat_error", { engine: settings.engine });
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  if (!settings) {
    return (
      <div className="boot-screen">
        <p>{t("statusDetecting")}</p>
      </div>
    );
  }

  const modelLabel =
    settings.engine === "browser"
      ? "Gemini Nano"
      : settings.model || t("selectModel");

  return (
    <div className="app-shell">
      <div
        className={`sidebar-backdrop${sidebarOpen ? " show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar
        open={sidebarOpen}
        conversations={conversations}
        activeId={activeId}
        status={status}
        onNewChat={startNewChat}
        onSelect={selectChat}
        onDelete={deleteChat}
        onOpenSettings={() => setSettingsOpen(true)}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="main">
        <div className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="icon-btn menu-btn"
              aria-label={t("openMenu")}
              onClick={() => setSidebarOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <EngineSwitch
              value={settings.engine}
              disabled={busy}
              onChange={(engine) => {
                void changeEngine(engine);
              }}
            />
            <button
              type="button"
              className="model-pill"
              onClick={() => setSettingsOpen(true)}
              title={t("settings")}
            >
              {modelLabel}
            </button>
          </div>
          <button type="button" className="ghost-btn" onClick={startNewChat}>
            {t("newChat")}
          </button>
        </div>

        <MessageList
          messages={messages}
          onSuggest={(text) => {
            void sendMessage(text);
          }}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <Composer
          value={input}
          busy={busy}
          hint={hint}
          onChange={setInput}
          onSubmit={() => void sendMessage(input)}
          onStop={() => abortRef.current?.abort()}
        />
      </main>

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        browserStatus={browserStatus}
        onClose={() => setSettingsOpen(false)}
        onSave={async (next) => {
          applySettings(next);
          await probeConnection(next);
        }}
      />
    </div>
  );
}
