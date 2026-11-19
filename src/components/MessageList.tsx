import { useI18n } from "../lib/i18n";
import type { ChatMessage } from "../types";

type Props = {
  messages: ChatMessage[];
  onSuggest: (text: string) => void;
  onOpenSettings?: () => void;
};

export function MessageList({ messages, onSuggest, onOpenSettings }: Props) {
  const { t } = useI18n();
  const suggestions = [t("suggest1"), t("suggest2"), t("suggest3")];

  if (!messages.length) {
    return (
      <div className="messages">
        <div className="messages-inner">
          <div className="empty">
            <h1>{t("emptyTitle")}</h1>
            <p>{t("emptyDesc")}</p>
            <div className="suggestions">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="suggestion"
                  onClick={() => onSuggest(s)}
                >
                  {s}
                </button>
              ))}
              {onOpenSettings ? (
                <button
                  type="button"
                  className="suggestion suggestion-accent"
                  onClick={onOpenSettings}
                >
                  {t("pickEngine")}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="messages" id="messages">
      <div className="messages-inner">
        {messages.map((msg) =>
          msg.role === "user" ? (
            <div key={msg.id} className="msg user" data-id={msg.id}>
              <div className="bubble-wrap">
                <div className="bubble">{msg.content}</div>
              </div>
            </div>
          ) : (
            <div
              key={msg.id}
              className={`msg assistant${msg.error ? " error" : ""}`}
              data-id={msg.id}
            >
              <div className="avatar" aria-hidden>
                AI
              </div>
              <div className="msg-body">
                <div className="msg-role">
                  {msg.error ? t("tip") : t("assistant")}
                </div>
                <div className={`bubble${msg.streaming ? " streaming" : ""}`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
