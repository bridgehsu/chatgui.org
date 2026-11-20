import { useEffect, useRef, useState } from "react";
import { useI18n } from "../lib/i18n";
import { typeLabel } from "../lib/modelsStore";
import type { ModelEntry } from "../types";

type Props = {
  entries: ModelEntry[];
  activeId: string | null;
  disabled?: boolean;
  onSelect: (entry: ModelEntry) => void;
  onOpenSettings: () => void;
};

export function ModelPicker({
  entries,
  activeId,
  disabled,
  onSelect,
  onOpenSettings,
}: Props) {
  const { t, locale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const active = entries.find((e) => e.id === activeId) || entries[0] || null;
  const label = active
    ? active.name || active.model || t("selectModel")
    : t("selectModel");

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="model-picker" ref={ref}>
      <button
        type="button"
        className="model-picker-btn"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="menu"
        title={t("selectModel")}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 7h16M7 12h10M10 17h4"
          />
        </svg>
        <span className="model-picker-label">{label}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div className="model-picker-menu" role="menu">
          {entries.length === 0 ? (
            <p className="model-picker-empty">{t("noModelsYet")}</p>
          ) : (
            entries.map((entry) => {
              const selected = entry.id === (active?.id ?? activeId);
              const type = typeLabel(entry.engine, locale === "en" ? "en" : "zh");
              const detail = [type, entry.model].filter(Boolean).join(" · ");
              return (
                <button
                  key={entry.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={selected}
                  className={`header-dropdown-item${selected ? " active" : ""}`}
                  onClick={() => {
                    onSelect(entry);
                    setOpen(false);
                  }}
                >
                  <span className="label">
                    <strong>{entry.name}</strong>
                    {detail ? (
                      <span className="model-picker-meta">{detail}</span>
                    ) : null}
                  </span>
                  {selected && <span className="check" aria-hidden />}
                </button>
              );
            })
          )}
          <button
            type="button"
            role="menuitem"
            className="header-dropdown-item model-picker-settings"
            onClick={() => {
              setOpen(false);
              onOpenSettings();
            }}
          >
            <span className="label">{t("navModels")}</span>
          </button>
        </div>
      )}
    </div>
  );
}
