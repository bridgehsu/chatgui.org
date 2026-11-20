import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DISCOVER_CATEGORIES,
  DISCOVER_ITEMS,
  type DiscoverAccess,
  type DiscoverCategory,
  type DiscoverItem,
  type DiscoverPricing,
} from "../content/discover";
import { useI18n } from "../lib/i18n";
import {
  activateModelEntry,
  loadModelEntries,
  saveModelEntries,
} from "../lib/modelsStore";
import {
  BUILTIN_PROVIDERS,
  settingsFromProvider,
  type BuiltinProviderId,
} from "../lib/providers";
import { CUSTOM_PRESETS, LOCAL_PRESETS, loadSettings, uid } from "../lib/storage";
import type { ModelEntry } from "../types";

function entryFromBuiltin(id: BuiltinProviderId): ModelEntry {
  const meta = BUILTIN_PROVIDERS.find((p) => p.id === id)!;
  const settings = settingsFromProvider(id, loadSettings());
  return {
    id: uid(),
    name: meta.zh,
    engine: settings.engine,
    preset: settings.preset,
    baseUrl:
      id === "ollama"
        ? LOCAL_PRESETS.ollama.baseUrl
        : id === "lmstudio"
          ? LOCAL_PRESETS.lmstudio.baseUrl
          : id === "openrouter"
            ? CUSTOM_PRESETS.openrouter.baseUrl
            : settings.baseUrl,
    apiKey: settings.apiKey,
    model:
      settings.engine === "browser"
        ? "Gemini Nano"
        : settings.model || meta.suggestedModels[0] || "",
  };
}

export function DiscoverPage() {
  const { t, locale } = useI18n();
  const navigate = useNavigate();
  const [category, setCategory] = useState<DiscoverCategory | "all">("all");
  const [accessFilter, setAccessFilter] = useState<DiscoverAccess | "all">(
    "all",
  );

  const lang = locale === "en" ? "en" : "zh";

  function ensureAndActivate(id: BuiltinProviderId) {
    const entries = loadModelEntries();
    const existing = entries.find((e) => {
      if (id === "chrome") return e.engine === "browser";
      if (id === "ollama") return e.engine === "local" && e.preset === "ollama";
      if (id === "lmstudio")
        return e.engine === "local" && e.preset === "lmstudio";
      if (id === "openrouter")
        return e.engine === "custom" && e.preset === "openrouter";
      return false;
    });
    if (existing) {
      activateModelEntry(existing);
      return existing;
    }
    const created = entryFromBuiltin(id);
    if (locale === "en") {
      const meta = BUILTIN_PROVIDERS.find((p) => p.id === id);
      if (meta) created.name = meta.en;
    }
    const next = [...entries, created];
    saveModelEntries(next);
    activateModelEntry(created);
    return created;
  }

  function useAndChat(id: BuiltinProviderId) {
    ensureAndActivate(id);
    navigate("/");
  }

  function configure(id: BuiltinProviderId) {
    ensureAndActivate(id);
    navigate("/models");
  }

  function openLink(item: DiscoverItem) {
    if (!item.url) return;
    if (item.url.startsWith("/")) {
      navigate(item.url);
      return;
    }
    window.open(item.url, "_blank", "noopener,noreferrer");
  }

  const filtered = useMemo(() => {
    return DISCOVER_ITEMS.filter((item) => {
      if (category !== "all" && item.category !== category) return false;
      if (accessFilter !== "all" && item.access !== accessFilter) return false;
      return true;
    });
  }, [category, accessFilter]);

  const grouped = useMemo(() => {
    if (category !== "all") {
      const meta = DISCOVER_CATEGORIES.find((c) => c.id === category)!;
      return [{ meta, items: filtered }];
    }
    return DISCOVER_CATEGORIES.map((meta) => ({
      meta,
      items: filtered.filter((item) => item.category === meta.id),
    })).filter((group) => group.items.length > 0);
  }, [category, filtered]);

  function pricingLabel(pricing: DiscoverPricing) {
    if (pricing === "free") return t("discoverFree");
    if (pricing === "key") return t("discoverNeedsKey");
    return t("discoverPaid");
  }

  function accessLabel(access: DiscoverAccess) {
    return access === "connect" ? t("discoverCanConnect") : t("discoverLinkOnly");
  }

  return (
    <div className="page-scroll page-fill">
      <div className="discover-page">
        <div className="page-panel">
          <header className="page-toolbar">
            <div className="page-toolbar-text">
              <h1>{t("navDiscover")}</h1>
              <p>{t("discoverLead")}</p>
            </div>
            <div className="page-toolbar-actions">
              <Link to="/models" className="ghost-btn page-tool-btn">
                {t("navModels")}
              </Link>
            </div>
          </header>

          <div className="discover-body">
            <div className="discover-filters">
              <div className="discover-tabs" role="tablist" aria-label={t("discoverCategories")}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={category === "all"}
                  className={category === "all" ? "active" : undefined}
                  onClick={() => setCategory("all")}
                >
                  {t("discoverAll")}
                </button>
                {DISCOVER_CATEGORIES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={category === c.id}
                    className={category === c.id ? "active" : undefined}
                    onClick={() => setCategory(c.id)}
                  >
                    {lang === "en" ? c.en : c.zh}
                  </button>
                ))}
              </div>
              <div className="discover-access-filter" role="group" aria-label={t("discoverAccess")}>
                <button
                  type="button"
                  className={accessFilter === "all" ? "active" : undefined}
                  onClick={() => setAccessFilter("all")}
                >
                  {t("discoverAll")}
                </button>
                <button
                  type="button"
                  className={accessFilter === "connect" ? "active" : undefined}
                  onClick={() => setAccessFilter("connect")}
                >
                  {t("discoverCanConnect")}
                </button>
                <button
                  type="button"
                  className={accessFilter === "link" ? "active" : undefined}
                  onClick={() => setAccessFilter("link")}
                >
                  {t("discoverLinkOnly")}
                </button>
              </div>
            </div>

            {grouped.length === 0 ? (
              <p className="discover-empty">{t("discoverEmpty")}</p>
            ) : (
              grouped.map(({ meta, items }) => (
                <section key={meta.id} className="discover-section">
                  <header className="discover-section-head">
                    <h2>{lang === "en" ? meta.en : meta.zh}</h2>
                    <p>{lang === "en" ? meta.descEn : meta.descZh}</p>
                  </header>
                  <div className="discover-grid">
                    {items.map((item) => {
                      const name = lang === "en" ? item.en : item.zh;
                      const hint = lang === "en" ? item.hintEn : item.hintZh;
                      const connectable =
                        item.access === "connect" && item.providerId;
                      return (
                        <article key={item.id} className="discover-card">
                          <div className="discover-card-top">
                            <div className="discover-badges">
                              <span
                                className={`discover-badge${
                                  item.access === "connect" ? " connect" : ""
                                }`}
                              >
                                {accessLabel(item.access)}
                              </span>
                              <span className="discover-badge">
                                {pricingLabel(item.pricing)}
                              </span>
                            </div>
                            <h3>{name}</h3>
                            <p>{hint}</p>
                            {item.tags && item.tags.length > 0 ? (
                              <ul className="discover-models">
                                {item.tags.map((tag) => (
                                  <li key={tag}>{tag}</li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                          <div className="discover-actions">
                            {connectable ? (
                              <>
                                <button
                                  type="button"
                                  className="save-btn"
                                  onClick={() => useAndChat(item.providerId!)}
                                >
                                  {t("discoverUse")}
                                </button>
                                <button
                                  type="button"
                                  className="ghost-btn"
                                  onClick={() => configure(item.providerId!)}
                                >
                                  {t("discoverConfigure")}
                                </button>
                              </>
                            ) : null}
                            {item.url ? (
                              <button
                                type="button"
                                className={
                                  connectable ? "ghost-btn" : "save-btn"
                                }
                                onClick={() => openLink(item)}
                              >
                                {item.url.startsWith("/")
                                  ? t("discoverOpen")
                                  : t("discoverVisit")}
                              </button>
                            ) : null}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))
            )}

            <p className="discover-more">
              {t("discoverMore")}{" "}
              <Link to="/models">{t("navModels")}</Link>
              {" · "}
              <Link to="/docs">{t("docs")}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
