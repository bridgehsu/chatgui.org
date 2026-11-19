import { useEffect, useState } from "react";
import { useI18n } from "../lib/i18n";
import { detectBrowserAI, browserStatusLabel } from "../lib/browserAI";
import { fetchModels, normalizeBaseUrl } from "../lib/openai";
import { probeProvider } from "../lib/provider";
import {
  CUSTOM_PRESETS,
  LOCAL_PRESETS,
  settingsForEngine,
} from "../lib/storage";
import type {
  BrowserAIStatus,
  CustomPreset,
  EngineMode,
  LocalPreset,
  Settings,
} from "../types";
import { EngineSwitch } from "./EngineSwitch";

type Props = {
  open: boolean;
  settings: Settings;
  browserStatus?: BrowserAIStatus;
  onClose: () => void;
  onSave: (next: Settings) => Promise<void> | void;
};

export function SettingsModal({
  open,
  settings,
  browserStatus,
  onClose,
  onSave,
}: Props) {
  const { t, locale } = useI18n();
  const [draft, setDraft] = useState(settings);
  const [models, setModels] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [localBrowser, setLocalBrowser] = useState<BrowserAIStatus>(
    browserStatus || "unsupported",
  );

  useEffect(() => {
    if (open) {
      setDraft(settings);
      setMsg("");
      setLocalBrowser(browserStatus || "unsupported");
      if (settings.engine === "browser") {
        void detectBrowserAI().then(({ status }) => setLocalBrowser(status));
      }
    }
  }, [open, settings, browserStatus]);

  if (!open) return null;

  function setEngine(engine: EngineMode) {
    setDraft((d) => settingsForEngine(engine, d));
    setMsg("");
  }

  async function refreshModels(selectFirst: boolean) {
    setMsg(t("pullingModels"));
    try {
      const list = await fetchModels(draft.baseUrl, draft.apiKey);
      setModels(list);
      if (list.length) {
        const nextModel =
          selectFirst || !draft.model || !list.includes(draft.model)
            ? list[0]
            : draft.model;
        setDraft((d) => ({ ...d, model: nextModel }));
        setMsg(t("modelsFound").replace("{n}", String(list.length)));
      } else {
        setMsg(t("noModelsFound"));
      }
      return list;
    } catch (err) {
      setMsg(err instanceof Error ? err.message : t("pullFailed"));
      throw err;
    }
  }

  return (
    <div
      className={`overlay${open ? " open" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settingsTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="panel">
        <div className="panel-head">
          <h2 id="settingsTitle">{t("settings")}</h2>
          <button type="button" className="ghost-btn" onClick={onClose}>
            {t("close")}
          </button>
        </div>

        <div className="field">
          <label>{t("engine")}</label>
          <EngineSwitch value={draft.engine} onChange={setEngine} />
          <p className="help">{t("engineHelp")}</p>
        </div>

        {draft.engine === "browser" && (
          <div className="guide">
            <strong>{t("browserTitle")}</strong>
            <p style={{ margin: "8px 0 0" }}>
              {t("browserStatus")}:{" "}
              <strong>
                {browserStatusLabel(localBrowser, locale === "en" ? "en" : "zh")}
              </strong>
            </p>
            <p className="help" style={{ marginTop: 8 }}>
              {t("browserHelp")}
            </p>
          </div>
        )}

        {draft.engine === "local" && (
          <>
            <div className="field">
              <label>{t("localRuntime")}</label>
              <div className="presets">
                {(Object.keys(LOCAL_PRESETS) as LocalPreset[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`preset${draft.preset === key ? " active" : ""}`}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        preset: key,
                        baseUrl: LOCAL_PRESETS[key].baseUrl,
                        apiKey: "",
                      }))
                    }
                  >
                    {LOCAL_PRESETS[key].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label htmlFor="baseUrl">{t("baseUrl")}</label>
              <input
                id="baseUrl"
                type="url"
                spellCheck={false}
                value={draft.baseUrl}
                placeholder="http://localhost:11434/v1"
                onChange={(e) =>
                  setDraft((d) => ({ ...d, baseUrl: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="model">{t("model")}</label>
              <input
                id="model"
                list="modelList"
                spellCheck={false}
                value={draft.model}
                placeholder="llama3.2"
                onChange={(e) =>
                  setDraft((d) => ({ ...d, model: e.target.value }))
                }
              />
              <datalist id="modelList">
                {models.map((id) => (
                  <option key={id} value={id} />
                ))}
              </datalist>
            </div>
          </>
        )}

        {draft.engine === "custom" && (
          <>
            <div className="field">
              <label>{t("customPreset")}</label>
              <div className="presets">
                {(Object.keys(CUSTOM_PRESETS) as CustomPreset[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`preset${draft.preset === key ? " active" : ""}`}
                    onClick={() =>
                      setDraft((d) => ({
                        ...d,
                        preset: key,
                        baseUrl:
                          key === "custom"
                            ? d.baseUrl || ""
                            : CUSTOM_PRESETS[key].baseUrl,
                      }))
                    }
                  >
                    {CUSTOM_PRESETS[key].label}
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label htmlFor="baseUrl">{t("baseUrl")}</label>
              <input
                id="baseUrl"
                type="url"
                spellCheck={false}
                value={draft.baseUrl}
                placeholder="https://openrouter.ai/api/v1"
                onChange={(e) =>
                  setDraft((d) => ({ ...d, baseUrl: e.target.value, preset: "custom" }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="apiKey">{t("apiKey")}</label>
              <input
                id="apiKey"
                type="password"
                autoComplete="off"
                value={draft.apiKey}
                placeholder="sk-..."
                onChange={(e) =>
                  setDraft((d) => ({ ...d, apiKey: e.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="model">{t("model")}</label>
              <input
                id="model"
                list="modelList"
                spellCheck={false}
                value={draft.model}
                placeholder="openai/gpt-4o-mini"
                onChange={(e) =>
                  setDraft((d) => ({ ...d, model: e.target.value }))
                }
              />
              <datalist id="modelList">
                {models.map((id) => (
                  <option key={id} value={id} />
                ))}
              </datalist>
            </div>
          </>
        )}

        {draft.engine !== "browser" && (
          <div className="row-actions" style={{ marginBottom: 14 }}>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => refreshModels(true).catch(() => undefined)}
            >
              {t("pullModels")}
            </button>
            <button
              type="button"
              className="ghost-btn"
              onClick={() =>
                refreshModels(false)
                  .then(() => setMsg(t("connectionOk")))
                  .catch(() => undefined)
              }
            >
              {t("testConnection")}
            </button>
          </div>
        )}

        <div className="row-actions">
          <button
            type="button"
            className="save-btn"
            onClick={async () => {
              const next: Settings = {
                ...draft,
                baseUrl: normalizeBaseUrl(draft.baseUrl),
                model: draft.model.trim(),
              };
              if (next.engine === "browser") {
                next.model = "Gemini Nano";
              }
              setDraft(next);
              setMsg(t("saving"));
              await onSave(next);
              const probe = await probeProvider(next);
              if (next.engine === "browser") {
                setLocalBrowser(probe.browserStatus || "unsupported");
              }
              setMsg(probe.ok ? t("savedOk") : probe.message || t("savedBad"));
            }}
          >
            {t("save")}
          </button>
        </div>
        {msg ? <p className="help">{msg}</p> : null}

        <div className="guide" style={{ marginTop: 14 }}>
          <strong>{t("guideTitle")}</strong>
          <ol>
            <li>{t("guide1")}</li>
            <li>{t("guide2")}</li>
            <li>{t("guide3")}</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
