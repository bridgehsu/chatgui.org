import { useEffect, useRef, useState } from "react";
import { useI18n } from "../lib/i18n";
import { ENGINE_OPTIONS } from "../lib/provider";
import type { EngineMode } from "../types";

type Props = {
  value: EngineMode;
  disabled?: boolean;
  onChange: (engine: EngineMode) => void;
};

export function EngineSwitch({ value, disabled, onChange }: Props) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const current =
    ENGINE_OPTIONS.find((o) => o.key === value) || ENGINE_OPTIONS[1];
  const label = locale === "en" ? current.en : current.zh;

  return (
    <div className="header-menu engine-switch" ref={ref}>
      <button
        type="button"
        className="model-pill engine-pill"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={t("engine")}
        title={t("engine")}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="engine-pill-label">{label}</span>
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
        <div className="header-dropdown engine-dropdown" role="menu">
          {ENGINE_OPTIONS.map((option) => {
            const active = option.key === value;
            return (
              <button
                key={option.key}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className={`header-dropdown-item${active ? " active" : ""}`}
                onClick={() => {
                  onChange(option.key);
                  setOpen(false);
                }}
              >
                <span className="label">
                  {locale === "en" ? option.en : option.zh}
                </span>
                {active && <span className="check" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
