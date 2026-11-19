import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LocaleCode = "zh" | "en";

const STORAGE_KEY = "chatgui_locale";

const dict = {
  zh: {
    brand: "ChatGUI",
    newChat: "新对话",
    recent: "最近",
    noChats: "还没有历史对话",
    settings: "设置",
    about: "关于",
    docs: "文档",
    selectModel: "选择模型",
    openMenu: "打开菜单",
    askPlaceholder: "询问 ChatGUI…",
    send: "发送",
    stop: "停止",
    emptyTitle: "你想聊点什么？",
    emptyDesc:
      "优先试用浏览器本地模型；不可用时改用本机 Ollama，或自行配置兼容 API。",
    suggest1: "用一句话介绍你自己",
    suggest2: "帮我写一封简短的邮件",
    suggest3: "解释一下什么是大模型",
    language: "语言",
    theme: "主题",
    themeLight: "明亮",
    themeDark: "暗色",
    themeSystem: "系统",
    close: "关闭",
    you: "你",
    assistant: "助手",
    tip: "提示",
    deleteChat: "删除对话",
    statusDetecting: "检测中",
    statusDisconnected: "未连接",
    statusNoModel: "无模型",
    statusGenerating: "生成中",
    statusFailed: "发送失败",
    engine: "引擎",
    engineHelp: "浏览器本地免安装；本机模型更强；自定义 API 适合云端 Key。",
    browserTitle: "浏览器本地模式",
    browserStatus: "状态",
    browserHelp:
      "需要较新的 Chrome，并支持内置 Prompt API / Gemini Nano。不可用时请切换本机模型。",
    localRuntime: "本机运行时",
    customPreset: "服务预设",
    baseUrl: "服务地址（Base URL）",
    apiKey: "API Key",
    model: "模型",
    pullModels: "拉取模型列表",
    testConnection: "测试连接",
    save: "保存",
    pullingModels: "正在拉取模型…",
    modelsFound: "已找到 {n} 个模型",
    noModelsFound: "服务已通，但没有模型。请先下载一个。",
    pullFailed: "拉取失败",
    connectionOk: "连接正常。",
    saving: "已保存，正在检测…",
    savedOk: "已保存，连接正常。",
    savedBad: "已保存，但当前还不能用。请按引导检查或切换引擎。",
    guideTitle: "怎么选引擎？",
    guide1: "浏览器本地：免安装试用，依赖 Chrome 内置小模型。",
    guide2: "本机模型：安装 Ollama / LM Studio，能力更强更稳。",
    guide3: "自定义 API：填 OpenRouter 等 OpenAI 兼容地址和 Key。",
    pickEngine: "换引擎",
  },
  en: {
    brand: "ChatGUI",
    newChat: "New chat",
    recent: "Recent",
    noChats: "No conversations yet",
    settings: "Settings",
    about: "About",
    docs: "Docs",
    selectModel: "Select model",
    openMenu: "Open menu",
    askPlaceholder: "Ask ChatGUI…",
    send: "Send",
    stop: "Stop",
    emptyTitle: "What do you want to chat about?",
    emptyDesc:
      "Try on-device browser AI first; fall back to local Ollama or your own API.",
    suggest1: "Introduce yourself in one sentence",
    suggest2: "Help me write a short email",
    suggest3: "Explain what an LLM is",
    language: "Language",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    themeSystem: "System",
    close: "Close",
    you: "You",
    assistant: "Assistant",
    tip: "Notice",
    deleteChat: "Delete chat",
    statusDetecting: "Checking",
    statusDisconnected: "Offline",
    statusNoModel: "No model",
    statusGenerating: "Generating",
    statusFailed: "Failed",
    engine: "Engine",
    engineHelp:
      "Browser = zero install; Local = stronger; Custom = your OpenAI-compatible API.",
    browserTitle: "Browser on-device mode",
    browserStatus: "Status",
    browserHelp:
      "Needs a recent Chrome with Prompt API / Gemini Nano. Switch to Local if unavailable.",
    localRuntime: "Local runtime",
    customPreset: "Provider preset",
    baseUrl: "Base URL",
    apiKey: "API Key",
    model: "Model",
    pullModels: "Fetch models",
    testConnection: "Test connection",
    save: "Save",
    pullingModels: "Fetching models…",
    modelsFound: "Found {n} models",
    noModelsFound: "Connected, but no models found. Download one first.",
    pullFailed: "Fetch failed",
    connectionOk: "Connection OK.",
    saving: "Saved. Checking…",
    savedOk: "Saved. Ready.",
    savedBad: "Saved, but not ready yet. Check the guide or switch engine.",
    guideTitle: "Which engine?",
    guide1: "Browser: zero install, built-in small model.",
    guide2: "Local: Ollama / LM Studio for stronger models.",
    guide3: "Custom: OpenRouter or any OpenAI-compatible endpoint.",
    pickEngine: "Switch engine",
  },
} as const;

export type MessageKey = keyof typeof dict.zh;

type I18nContextValue = {
  locale: LocaleCode;
  setLocale: (next: LocaleCode) => void;
  t: (key: MessageKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readLocale(): LocaleCode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    // ignore
  }
  return "zh";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(() =>
    typeof window === "undefined" ? "zh" : readLocale(),
  );

  const setLocale = useCallback((next: LocaleCode) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    document.documentElement.lang = next === "zh" ? "zh-CN" : "en";
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const t = useCallback(
    (key: MessageKey) => dict[locale][key] || dict.zh[key],
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
