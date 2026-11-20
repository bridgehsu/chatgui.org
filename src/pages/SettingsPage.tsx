import { useState } from "react";
import { useI18n } from "../lib/i18n";
import {
  activateModelEntry,
  emptyModelDraft,
  endpointLabel,
  loadActiveModelId,
  loadModelEntries,
  saveActiveModelId,
  saveModelEntries,
  typeLabel,
} from "../lib/modelsStore";
import { normalizeBaseUrl } from "../lib/openai";
import { CUSTOM_PRESETS, LOCAL_PRESETS, uid } from "../lib/storage";
import type { EngineMode, ModelEntry, PresetKey } from "../types";

type EditorMode = "create" | "edit";

export function SettingsPage() {
  const { t, locale } = useI18n();
  const [entries, setEntries] = useState<ModelEntry[]>(() => loadModelEntries());
  const [activeId, setActiveId] = useState<string | null>(() =>
    loadActiveModelId(loadModelEntries()),
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>("create");
  const [draft, setDraft] = useState<ModelEntry>(emptyModelDraft);
  const [msg, setMsg] = useState("");

  function persist(next: ModelEntry[], nextActiveId: string | null) {
    setEntries(next);
    saveModelEntries(next);
    setActiveId(nextActiveId);
    saveActiveModelId(nextActiveId);
    if (nextActiveId) {
      const found = next.find((e) => e.id === nextActiveId);
      if (found) activateModelEntry(found);
    }
  }

  function openCreate() {
    setEditorMode("create");
    setDraft({
      ...emptyModelDraft(),
      name: locale === "en" ? "Custom API" : "自定义 API",
      engine: "custom",
      preset: "custom",
    });
    setEditorOpen(true);
    setMsg("");
  }

  function openEdit(entry: ModelEntry) {
    setEditorMode("edit");
    setDraft({ ...entry });
    setEditorOpen(true);
    setMsg("");
  }

  function closeEditor() {
    setEditorOpen(false);
  }

  function handleDelete(entry: ModelEntry) {
    if (!window.confirm(t("confirmDeleteModel").replace("{name}", entry.name))) {
      return;
    }
    const next = entries.filter((e) => e.id !== entry.id);
    const nextActive =
      activeId === entry.id ? next[0]?.id ?? null : activeId;
    persist(next, nextActive);
    setMsg(t("modelDeleted"));
  }

  function applyEngineDefaults(engine: EngineMode, prev: ModelEntry): ModelEntry {
    if (engine === "browser") {
      return {
        ...prev,
        engine,
        name: prev.name || (locale === "en" ? "Chrome browser" : "Chrome 浏览器"),
        preset: "ollama",
        baseUrl: "",
        apiKey: "",
        model: "Gemini Nano",
      };
    }
    if (engine === "local") {
      return {
        ...prev,
        engine,
        preset: "ollama",
        baseUrl: LOCAL_PRESETS.ollama.baseUrl,
        apiKey: "",
        model: prev.engine === "local" ? prev.model : "llama3.2",
        name: prev.name || "Ollama",
      };
    }
    return {
      ...prev,
      engine,
      preset: "custom",
      baseUrl: prev.engine === "custom" ? prev.baseUrl : "",
      model: prev.engine === "custom" ? prev.model : "",
      name: prev.name || (locale === "en" ? "Custom API" : "自定义 API"),
    };
  }

  function handleSaveEditor() {
    const name = draft.name.trim();
    if (!name) {
      setMsg(t("nameRequired"));
      return;
    }
    if (draft.engine !== "browser" && !draft.baseUrl.trim()) {
      setMsg(t("baseUrlRequired"));
      return;
    }
    if (draft.engine !== "browser" && !draft.model.trim()) {
      setMsg(t("modelRequired"));
      return;
    }

    const cleaned: ModelEntry = {
      ...draft,
      id: editorMode === "edit" && draft.id ? draft.id : uid(),
      name,
      baseUrl:
        draft.engine === "browser" ? "" : normalizeBaseUrl(draft.baseUrl),
      apiKey: draft.engine === "custom" ? draft.apiKey : "",
      model: draft.engine === "browser" ? "Gemini Nano" : draft.model.trim(),
      preset:
        draft.engine === "local"
          ? draft.preset === "lmstudio"
            ? "lmstudio"
            : "ollama"
          : draft.engine === "custom"
            ? draft.preset === "openrouter"
              ? "openrouter"
              : "custom"
            : draft.preset,
    };

    let next: ModelEntry[];
    if (editorMode === "edit") {
      next = entries.map((e) => (e.id === cleaned.id ? cleaned : e));
    } else {
      next = [...entries, cleaned];
    }

    const nextActive = activeId || cleaned.id;
    persist(next, nextActive);
    setEditorOpen(false);
    setMsg(editorMode === "edit" ? t("modelUpdated") : t("modelAdded"));
  }

  return (
    <div className="page-scroll page-fill">
      <div className="settings-page">
        <div className="page-panel">
          <header className="page-toolbar">
            <div className="page-toolbar-text">
              <h1>{t("navModels")}</h1>
            </div>
            <div className="page-toolbar-actions">
              <button
                type="button"
                className="save-btn models-add-btn"
                onClick={openCreate}
              >
                + {t("addModel")}
              </button>
            </div>
          </header>

          <div className="settings-table-wrap">
            <table className="settings-table">
              <thead>
                <tr>
                  <th scope="col" className="settings-col-index">
                    {t("colIndex")}
                  </th>
                  <th scope="col">{t("colName")}</th>
                  <th scope="col">{t("colType")}</th>
                  <th scope="col">{t("colEndpoint")}</th>
                  <th scope="col">{t("colModel")}</th>
                  <th scope="col">{t("colAction")}</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="settings-empty-cell">
                      {t("noModelsYet")}
                    </td>
                  </tr>
                ) : (
                  entries.map((entry, index) => (
                      <tr key={entry.id}>
                        <td className="settings-col-index">{index + 1}</td>
                        <td>
                          <div className="settings-source">
                            <strong>{entry.name}</strong>
                          </div>
                        </td>
                        <td>
                          {typeLabel(entry.engine, locale === "en" ? "en" : "zh")}
                        </td>
                        <td className="settings-cell-mono">
                          {endpointLabel(entry)}
                        </td>
                        <td className="settings-cell-mono">
                          {entry.model || "—"}
                        </td>
                        <td>
                          <div className="settings-row-actions">
                            <button
                              type="button"
                              className="settings-link"
                              onClick={() => openEdit(entry)}
                            >
                              {t("edit")}
                            </button>
                            <button
                              type="button"
                              className="settings-link danger"
                              onClick={() => handleDelete(entry)}
                            >
                              {t("delete")}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          {msg ? <p className="page-panel-msg">{msg}</p> : null}
        </div>
      </div>

      {editorOpen ? (
        <div
          className="drawer-overlay open"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditor();
          }}
        >
          <aside
            className="model-drawer open"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modelEditorTitle"
          >
            <header className="model-drawer-head">
              <h2 id="modelEditorTitle">
                {editorMode === "create" ? t("addModel") : t("editModel")}
              </h2>
              <button
                type="button"
                className="model-drawer-close"
                aria-label={t("close")}
                onClick={closeEditor}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </header>

            <div className="model-drawer-body">
              <div className="model-field">
                <label htmlFor="modelName">{t("colName")}</label>
                <input
                  id="modelName"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, name: e.target.value }))
                  }
                  placeholder={locale === "en" ? "My model" : "我的模型"}
                />
              </div>

              <div className="model-field">
                <label>{t("colType")}</label>
                <div className="model-seg" role="group" aria-label={t("colType")}>
                  {(["browser", "local", "custom"] as EngineMode[]).map((engine) => (
                    <button
                      key={engine}
                      type="button"
                      className={draft.engine === engine ? "active" : undefined}
                      onClick={() =>
                        setDraft((d) => applyEngineDefaults(engine, d))
                      }
                    >
                      {typeLabel(engine, locale === "en" ? "en" : "zh")}
                    </button>
                  ))}
                </div>
              </div>

              {draft.engine === "local" && (
                <div className="model-field">
                  <label>{t("localRuntime")}</label>
                  <div className="model-seg" role="group">
                    {(["ollama", "lmstudio"] as const).map((key) => (
                      <button
                        key={key}
                        type="button"
                        className={draft.preset === key ? "active" : undefined}
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            preset: key,
                            baseUrl: LOCAL_PRESETS[key].baseUrl,
                            name: d.name || LOCAL_PRESETS[key].label,
                          }))
                        }
                      >
                        {LOCAL_PRESETS[key].label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {draft.engine === "custom" && (
                <div className="model-field">
                  <label>{t("customPreset")}</label>
                  <div className="model-seg" role="group">
                    <button
                      type="button"
                      className={
                        draft.preset === "openrouter" ? "active" : undefined
                      }
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          preset: "openrouter",
                          baseUrl: CUSTOM_PRESETS.openrouter.baseUrl,
                          name: d.name || "OpenRouter",
                        }))
                      }
                    >
                      OpenRouter
                    </button>
                    <button
                      type="button"
                      className={draft.preset === "custom" ? "active" : undefined}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          preset: "custom" as PresetKey,
                        }))
                      }
                    >
                      {locale === "en" ? "Custom" : "自定义"}
                    </button>
                  </div>
                </div>
              )}

              {draft.engine !== "browser" && (
                <div className="model-field">
                  <label htmlFor="modelBaseUrl">{t("baseUrl")}</label>
                  <input
                    id="modelBaseUrl"
                    type="url"
                    spellCheck={false}
                    value={draft.baseUrl}
                    placeholder={
                      draft.engine === "local"
                        ? "http://localhost:11434/v1"
                        : "https://openrouter.ai/api/v1"
                    }
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, baseUrl: e.target.value }))
                    }
                  />
                </div>
              )}

              {draft.engine === "custom" && (
                <div className="model-field">
                  <label htmlFor="modelApiKey">{t("apiKey")}</label>
                  <input
                    id="modelApiKey"
                    type="password"
                    autoComplete="off"
                    value={draft.apiKey}
                    placeholder="sk-..."
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, apiKey: e.target.value }))
                    }
                  />
                </div>
              )}

              {draft.engine === "browser" ? (
                <div className="model-note">
                  <p>{t("browserHelp")}</p>
                  <p>
                    {t("colModel")}: <code>Gemini Nano</code>
                  </p>
                </div>
              ) : (
                <div className="model-field">
                  <label htmlFor="modelModel">{t("colModel")}</label>
                  <input
                    id="modelModel"
                    spellCheck={false}
                    value={draft.model}
                    placeholder={
                      draft.engine === "local"
                        ? t("modelIdPlaceholderLocal")
                        : t("modelIdPlaceholderCustom")
                    }
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, model: e.target.value }))
                    }
                  />
                  <p className="model-hint">{t("modelIdHelp")}</p>
                </div>
              )}

              {msg && editorOpen ? (
                <p className="model-drawer-msg">{msg}</p>
              ) : null}
            </div>

            <footer className="model-drawer-foot">
              <button
                type="button"
                className="model-drawer-cancel"
                onClick={closeEditor}
              >
                {t("close")}
              </button>
              <button
                type="button"
                className="model-drawer-save"
                onClick={handleSaveEditor}
              >
                {t("save")}
              </button>
            </footer>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
