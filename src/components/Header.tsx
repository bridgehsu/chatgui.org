import { Link } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import { LocaleSwitch } from "./LocaleSwitch";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const { t } = useI18n();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-logo" to="/" aria-label={`${t("brand")} home`}>
          <img
            className="site-logo-img"
            src={`${import.meta.env.BASE_URL}favicon.svg`}
            alt=""
          />
          <strong>{t("brand")}</strong>
        </Link>

        <div className="site-header-actions">
          <LocaleSwitch />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
