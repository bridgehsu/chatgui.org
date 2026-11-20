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
    navChat: "会话",
    navModels: "模型",
    navDiscover: "发现",
    discoverLead: "AI 圈导航：可接入 ChatGUI 的源置顶，也可按场景浏览产品、工具与资讯。",
    discoverUse: "开始聊天",
    discoverConfigure: "去配置",
    discoverMore: "需要自定义接口？前往",
    discoverAll: "全部",
    discoverCategories: "分类",
    discoverAccess: "接入方式",
    discoverCanConnect: "可接入",
    discoverLinkOnly: "仅外链",
    discoverFree: "免费",
    discoverNeedsKey: "需 Key",
    discoverPaid: "付费",
    discoverVisit: "访问网站",
    discoverOpen: "打开",
    discoverEmpty: "没有符合筛选的条目。",
    settingsLead: "选择模型来源并保存。默认提供 Chrome 浏览器与 Ollama 等本机选项。",
    modelsLead: "三种接入：浏览器 / 本机 / 三方。显示名给人看，模型 ID 给接口用（有版本就写进 ID）。",
    builtinProviders: "模型来源",
    builtinProvidersHelp: "以下为内置可选来源，点选一行后填写配置并保存即可使用。",
    providerConfig: "当前配置",
    backToChat: "返回聊天",
    colSource: "来源",
    colIndex: "#",
    colName: "显示名",
    colType: "类型",
    colEndpoint: "地址",
    colModel: "模型 ID",
    colStatus: "状态",
    colAction: "操作",
    statusActive: "使用中",
    statusAvailable: "可用",
    useProvider: "使用",
    inUse: "当前",
    addModel: "新增",
    editModel: "编辑模型",
    edit: "编辑",
    delete: "删除",
    confirmDeleteModel: "确定删除「{name}」吗？",
    modelAdded: "已新增模型。",
    modelUpdated: "已保存修改。",
    modelDeleted: "已删除。",
    modelActivated: "已切换到「{name}」。",
    noModelsYet: "还没有模型，点击右上角「新增」添加一个。",
    currentActive: "当前使用",
    nameRequired: "请填写显示名。",
    baseUrlRequired: "请填写服务地址。",
    modelRequired: "请填写模型 ID。",
    nameHelp: "列表里显示的名字，可自定义。",
    modelIdHelp:
      "发给接口的完整模型名。有版本就写在一起（如 llama3.2:latest）；没有版本只写模型名即可。",
    modelIdPlaceholderLocal: "llama3.2 或 llama3.2:latest",
    modelIdPlaceholderCustom: "openai/gpt-4o-mini",
    typeHelp: "浏览器免安装；本机连 Ollama / LM Studio；三方可填任意兼容 API。",
    about: "关于",
    docs: "文档",
    selectModel: "选择模型",
    openMenu: "打开菜单",
    toggleSidebar: "收起或展开侧边栏",
    history: "历史会话",
    openHistory: "打开历史会话",
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
    navChat: "Chat",
    navModels: "Models",
    navDiscover: "Discover",
    discoverLead:
      "AI directory: ChatGUI-ready sources first, plus apps, tools, and news by use case.",
    discoverUse: "Start chat",
    discoverConfigure: "Configure",
    discoverMore: "Need a custom endpoint? Go to",
    discoverAll: "All",
    discoverCategories: "Categories",
    discoverAccess: "Access",
    discoverCanConnect: "Connectable",
    discoverLinkOnly: "External",
    discoverFree: "Free",
    discoverNeedsKey: "Needs key",
    discoverPaid: "Paid",
    discoverVisit: "Visit site",
    discoverOpen: "Open",
    discoverEmpty: "No items match these filters.",
    settingsLead:
      "Pick a model source and save. Chrome browser and Ollama-style local options are built in.",
    modelsLead:
      "Three ways in: browser / local / third-party. Display name for you; model ID for the API (put version in the ID when you have one).",
    builtinProviders: "Model sources",
    builtinProvidersHelp:
      "Built-in sources. Select a row, configure, then save.",
    providerConfig: "Configuration",
    backToChat: "Back to chat",
    colSource: "Source",
    colIndex: "#",
    colName: "Display name",
    colType: "Type",
    colEndpoint: "Endpoint",
    colModel: "Model ID",
    colStatus: "Status",
    colAction: "Action",
    statusActive: "Active",
    statusAvailable: "Available",
    useProvider: "Use",
    inUse: "In use",
    addModel: "Add",
    editModel: "Edit model",
    edit: "Edit",
    delete: "Delete",
    confirmDeleteModel: "Delete “{name}”?",
    modelAdded: "Model added.",
    modelUpdated: "Changes saved.",
    modelDeleted: "Deleted.",
    modelActivated: "Switched to “{name}”.",
    noModelsYet: "No models yet. Click Add in the top right.",
    currentActive: "Active",
    nameRequired: "Display name is required.",
    baseUrlRequired: "Base URL is required.",
    modelRequired: "Model ID is required.",
    nameHelp: "Shown in the list. Choose any label you like.",
    modelIdHelp:
      "Exact ID sent to the API. Include a version/tag when you have one (e.g. llama3.2:latest); otherwise just the model name.",
    modelIdPlaceholderLocal: "llama3.2 or llama3.2:latest",
    modelIdPlaceholderCustom: "openai/gpt-4o-mini",
    typeHelp:
      "Browser = zero install; Local = Ollama / LM Studio; Third-party = any compatible API.",
    about: "About",
    docs: "Docs",
    selectModel: "Select model",
    openMenu: "Open menu",
    toggleSidebar: "Toggle sidebar",
    history: "History",
    openHistory: "Open history",
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
