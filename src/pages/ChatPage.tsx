import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Composer } from "../components/Composer";
import { MessageList } from "../components/MessageList";
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
  activateModelEntry,
  entryToSettings,
  loadActiveModelId,
  loadModelEntries,
} from "../lib/modelsStore";
import {
  loadConversations,
  resolveInitialSettings,
  saveConversations,
  saveSettings,
  titleFromMessages,
  uid,
} from "../lib/storage";
import type {
  BrowserAIStatus,
  ChatMessage,
  ConnectionStatus,
  Conversation,
  ModelEntry,
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
  const navigate = useNavigate();
  const goSettings = useCallback(() => navigate("/models"), [navigate]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadConversations(),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [browserStatus, setBrowserStatus] =
    useState<BrowserAIStatus>("unsupported");
  const [modelEntries, setModelEntries] = useState<ModelEntry[]>(() =>
    loadModelEntries(),
  );
  const [activeModelId, setActiveModelId] = useState<string | null>(() =>
    loadActiveModelId(loadModelEntries()),
  );
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
    setHistoryOpen(false);
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
      if (e.key === "Escape") setHistoryOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const refresh = () => {
      const next = loadModelEntries();
      setModelEntries(next);
      setActiveModelId(loadActiveModelId(next));
    };
    refresh();
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  function selectModelEntry(entry: ModelEntry) {
    activateModelEntry(entry);
    setActiveModelId(entry.id);
    const next = entryToSettings(entry);
    setSettings(next);
    void probeConnection(next);
  }

  async function sendMessage(text: string) {
    const content = text.trim();
    if (!content || busy || !settings) return;

    if (!canSend(settings, browserStatus)) {
      goSettings();
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

  return (
    <div className="app-shell">
      {historyOpen ? (
        <button
          type="button"
          className="history-backdrop show"
          aria-label={t("close")}
          onClick={() => setHistoryOpen(false)}
        />
      ) : null}
      <Sidebar
        open={historyOpen}
        conversations={conversations}
        activeId={activeId}
        status={status}
        onNewChat={startNewChat}
        onSelect={selectChat}
        onDelete={deleteChat}
        onOpenSettings={goSettings}
        onClose={() => setHistoryOpen(false)}
      />

      <main className="main">
        <div className="chat-tools">
          <button
            type="button"
            className="icon-btn"
            aria-label={t("openHistory")}
            aria-expanded={historyOpen}
            title={t("openHistory")}
            onClick={() => setHistoryOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 5.5h16A1.5 1.5 0 0 1 21.5 7v10a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 17V7A1.5 1.5 0 0 1 4 5.5z"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path d="M9 5.5v13" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </button>
          <button
            type="button"
            className="icon-btn"
            aria-label={t("newChat")}
            title={t("newChat")}
            onClick={startNewChat}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <MessageList
          messages={messages}
          onSuggest={(text) => {
            void sendMessage(text);
          }}
          onOpenSettings={goSettings}
        />

        <Composer
          value={input}
          busy={busy}
          hint={hint}
          modelEntries={modelEntries}
          activeModelId={activeModelId}
          onChange={setInput}
          onSubmit={() => void sendMessage(input)}
          onStop={() => abortRef.current?.abort()}
          onSelectModel={selectModelEntry}
          onOpenSettings={goSettings}
        />
      </main>
    </div>
  );
}
