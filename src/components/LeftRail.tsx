import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useI18n } from "../lib/i18n";

function ChatIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v7A2.5 2.5 0 0 1 16.5 16H10l-4 3.5V16H7.5A2.5 2.5 0 0 1 5 13.5v-7z"
      />
    </svg>
  );
}

function ModelsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M7 12h10M10 17h4" />
    </svg>
  );
}

function DiscoverIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.2 10.2l6.1-1.7-1.7 6.1-4.4-4.4z" />
    </svg>
  );
}

function DocsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path strokeLinecap="round" d="M8 8h8M8 12h8M8 16h6" />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 11v5.5" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RailItem({
  to,
  end,
  title,
  children,
}: {
  to: string;
  end?: boolean;
  title: string;
  children: ReactNode;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={title}
      className={({ isActive }) => (isActive ? "active" : undefined)}
    >
      <span className="app-rail-icon">{children}</span>
      <span className="app-rail-label">{title}</span>
    </NavLink>
  );
}

export function LeftRail() {
  const { t } = useI18n();

  return (
    <aside className="app-rail" aria-label="Primary">
      <nav className="app-rail-nav">
        <RailItem to="/" end title={t("navChat")}>
          <ChatIcon />
        </RailItem>
        <RailItem to="/models" title={t("navModels")}>
          <ModelsIcon />
        </RailItem>
        <RailItem to="/discover" title={t("navDiscover")}>
          <DiscoverIcon />
        </RailItem>
        <RailItem to="/docs" title={t("docs")}>
          <DocsIcon />
        </RailItem>
      </nav>

      <nav className="app-rail-nav app-rail-foot">
        <RailItem to="/about" title={t("about")}>
          <AboutIcon />
        </RailItem>
      </nav>
    </aside>
  );
}
