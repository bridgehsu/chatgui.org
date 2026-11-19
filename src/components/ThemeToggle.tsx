import { useEffect, useRef, useState } from "react";
import { useI18n } from "../lib/i18n";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "chatgui_theme";

function readTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    // ignore
  }
  return "dark";
}

function applyDomTheme(mode: ThemeMode, systemDark: boolean) {
  const isDark = mode === "dark" || (mode === "system" && systemDark);
  document.documentElement.classList.toggle("dark", isDark);
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  document.documentElement.style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeToggle() {
  const { t } = useI18n();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(() =>
    typeof window === "undefined" ? "dark" : readTheme(),
  );
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
      : true,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    if (!mounted) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);
    applyDomTheme(theme, media.matches);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    const onChange = (e: MediaQueryListEvent) => {
      setSystemDark(e.matches);
      if (theme === "system") applyDomTheme("system", e.matches);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme, mounted]);

  const isDark =
    mounted && (theme === "dark" || (theme === "system" && systemDark));

  const options: Array<{ key: ThemeMode; label: string }> = [
    { key: "light", label: t("themeLight") },
    { key: "dark", label: t("themeDark") },
    { key: "system", label: t("themeSystem") },
  ];

  return (
    <div className="header-menu" ref={menuRef}>
      <button
        type="button"
        className="header-action-btn header-action-icon"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={t("theme")}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        title={t("theme")}
      >
        {isDark ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        )}
      </button>

      {menuOpen && (
        <div className="header-dropdown" role="menu" aria-label={t("theme")}>
          {options.map((option) => {
            const active = theme === option.key;
            return (
              <button
                key={option.key}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                className={`header-dropdown-item${active ? " active" : ""}`}
                onClick={() => {
                  setTheme(option.key);
                  setMenuOpen(false);
                }}
              >
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

/** 首屏前同步主题，避免闪烁 */
export function initThemeEarly() {
  try {
    const mode = readTheme();
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyDomTheme(mode, systemDark);
  } catch {
    document.documentElement.classList.add("dark");
  }
}
