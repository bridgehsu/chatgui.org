import { useEffect, useRef, useState } from "react";
import { useI18n, type LocaleCode } from "../lib/i18n";

const LOCALE_OPTIONS: Array<{ key: LocaleCode; short: string; label: string }> = [
  { key: "zh", short: "中", label: "中文" },
  { key: "en", short: "EN", label: "English" },
];

export function LocaleSwitch() {
  const { locale, setLocale, t } = useI18n();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const current = LOCALE_OPTIONS.find((o) => o.key === locale) || LOCALE_OPTIONS[0];

  return (
    <div className="header-menu" ref={menuRef}>
      <button
        type="button"
        className="header-action-btn"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={t("language")}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        title={t("language")}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
        </svg>
        <span className="header-action-text">{current.short}</span>
      </button>

      {menuOpen && (
        <div className="header-dropdown" role="menu" aria-label={t("language")}>
          {LOCALE_OPTIONS.map((option) => {
            const active = locale === option.key;
            return (
              <button
                key={option.key}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className={`header-dropdown-item${active ? " active" : ""}`}
                onClick={() => {
                  setLocale(option.key);
                  setMenuOpen(false);
                }}
              >
                <span className="short">{option.short}</span>
                <span className="label">{option.label}</span>
                {active && <span className="check" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
