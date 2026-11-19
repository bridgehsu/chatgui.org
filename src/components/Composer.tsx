import { useEffect, useRef } from "react";
import { useI18n } from "../lib/i18n";

type Props = {
  value: string;
  busy: boolean;
  hint: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop: () => void;
};

export function Composer({ value, busy, hint, onChange, onSubmit, onStop }: Props) {
  const { t } = useI18n();
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  return (
    <div className="composer-wrap">
      <div className="composer-shell">
        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            if (busy) onStop();
            else onSubmit();
          }}
        >
          <textarea
            id="input"
            ref={ref}
            rows={1}
            value={value}
            placeholder={t("askPlaceholder")}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (busy) onStop();
                else onSubmit();
              }
            }}
          />
          <button
            className={`primary-btn${busy ? " stop" : ""}`}
            type="submit"
            aria-label={busy ? t("stop") : t("send")}
            title={busy ? t("stop") : t("send")}
          >
            {busy ? (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
                <rect x="3" y="3" width="8" height="8" rx="1.5" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M5 12h12M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </form>
        <p className="hint">{hint}</p>
      </div>
    </div>
  );
}
