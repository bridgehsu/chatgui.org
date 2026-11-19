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
    <aside className={`sidebar${open ? " open" : ""}`} aria-label="sidebar">
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
          {t("settings")}
        </button>
      </div>
    </aside>
  );
}
