import { useI18n } from "../lib/i18n";
import type { ConnectionStatus, Conversation } from "../types";

type Props = {
  open: boolean;
  conversations: Conversation[];
  activeId: string | null;
  status: ConnectionStatus;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenSettings: () => void;
  onClose: () => void;
};

export function Sidebar({
  open,
  conversations,
  activeId,
  status,
  onNewChat,
  onSelect,
  onDelete,
  onOpenSettings,
  onClose,
}: Props) {
  const { t } = useI18n();

  return (
    <aside
      className={`history-drawer${open ? " open" : ""}`}
      aria-label={t("history")}
      aria-hidden={!open}
      inert={!open ? true : undefined}
    >
      <div className="history-drawer-head">
        <strong>{t("history")}</strong>
        <button
          type="button"
          className="icon-btn history-close"
          aria-label={t("close")}
          onClick={onClose}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="sidebar-actions">
        <button type="button" className="btn btn-new" onClick={onNewChat}>
          + {t("newChat")}
        </button>
      </div>

      <div className="chat-list">
        <div className="chat-list-label">{t("recent")}</div>
        {conversations.length === 0 && (
          <div className="chat-empty">{t("noChats")}</div>
        )}
        {conversations.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`chat-item${c.id === activeId ? " active" : ""}`}
            onClick={() => {
              onSelect(c.id);
              onClose();
            }}
          >
            <span>{c.title}</span>
            <span
              className="del"
              role="button"
              tabIndex={0}
              aria-label={t("deleteChat")}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c.id);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(c.id);
                }
              }}
            >
              ×
            </span>
          </button>
        ))}
      </div>

      <div className="sidebar-foot">
        <div className="status" title={status.text}>
          <span className={`dot ${status.kind}`} />
          <span>{status.text}</span>
        </div>
        <button type="button" className="ghost-btn" onClick={onOpenSettings}>
          {t("navModels")}
        </button>
      </div>
    </aside>
  );
}
