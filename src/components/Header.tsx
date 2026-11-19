import { Link, NavLink } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { LocaleSwitch } from "./LocaleSwitch";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { t } = useI18n();

  return (
    <header className="site-header">
      <div className="site-header-left">
        <Link className="site-logo" to="/" aria-label={`${t("brand")} home`}>
          <img
            className="site-logo-img"
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
          />
          <strong>{t("brand")}</strong>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : undefined)}>
            {t("about")}
          </NavLink>
          <NavLink to="/docs" className={({ isActive }) => (isActive ? "active" : undefined)}>
            {t("docs")}
          </NavLink>
        </nav>
      </div>

      <div className="site-header-actions">
        <LocaleSwitch />
        <ThemeToggle />
      </div>
    </header>
  );
}
