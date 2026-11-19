import { useI18n } from "../lib/i18n";
import { LocaleSwitch } from "./LocaleSwitch";
import { ThemeToggle } from "./ThemeToggle";

type Props = {
  docsOpen: boolean;
  onToggleDocs: () => void;
};

export function Header({ docsOpen, onToggleDocs }: Props) {
  const { t } = useI18n();

  return (
    <header className="site-header">
      <a className="site-logo" href={import.meta.env.BASE_URL} aria-label={`${t("brand")} home`}>
        <img className="site-logo-img" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" />
        <strong>{t("brand")}</strong>
      </a>

      <div className="site-header-actions">
        <LocaleSwitch />
        <ThemeToggle />
        <button
          type="button"
          className={`header-action-btn${docsOpen ? " active" : ""}`}
          onClick={onToggleDocs}
          aria-pressed={docsOpen}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 3.5h7.5L19 8v12.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 3.5V8H19" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6" />
          </svg>
          <span className="header-action-text">{t("docs")}</span>
        </button>
      </div>
    </header>
  );
}
