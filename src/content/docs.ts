export type DocSection = {
  id: string;
  heading: string;
  paragraphs?: string[];
  steps?: string[];
  bullets?: string[];
};

export type DocPage = {
  title: string;
  lead: string;
  sections: DocSection[];
};

export const docsZh: DocPage = {
  title: "文档",
  lead: "按三档引擎快速上手：浏览器本地、本机模型、第三方 API。",
  sections: [
    {
      id: "overview",
      heading: "概览",
      paragraphs: [
        "顶栏可切换语言与主题；聊天页顶部可切换引擎并打开设置。对话保存在浏览器本地。",
      ],
    },
    {
      id: "browser",
      heading: "1. 浏览器本地",
      steps: [
        "使用较新的 Chrome（需支持 Prompt API / 内置 AI）。",
        "引擎选择「浏览器本地」。",
        "若显示需下载或不可用，请改用本机模型。",
      ],
    },
    {
      id: "local",
      heading: "2. 本机模型（推荐）",
      steps: [
        "安装并启动 Ollama，或使用 LM Studio 并开启 Local Server + CORS。",
        "拉取模型，例如：ollama pull llama3.2",
        "引擎选「本机模型」。Ollama 地址一般为 http://localhost:11434/v1；LM Studio 多为 http://localhost:1234/v1。",
        "若网站通过公网 HTTPS 访问，启动 Ollama 前设置 OLLAMA_ORIGINS=*（或你的域名）。",
      ],
    },
    {
      id: "custom",
      heading: "3. 第三方 / 自定义 API",
      bullets: [
        "OpenRouter：Base URL 填 https://openrouter.ai/api/v1，并填入 API Key。",
        "任意 OpenAI Chat Completions 兼容端点：填到 /v1，再选择或填写模型名。",
        "可在设置中「拉取模型列表」自动发现模型。",
      ],
    },
    {
      id: "privacy",
      heading: "隐私",
      paragraphs: [
        "对话与设置存储在本机 localStorage；请求直连你配置的引擎，不经过 ChatGUI 服务器中转。",
      ],
    },
  ],
};

export const docsEn: DocPage = {
  title: "Docs",
  lead: "Get started with the three engines: browser on-device, local runtime, and custom API.",
  sections: [
    {
      id: "overview",
      heading: "Overview",
      paragraphs: [
        "Use the header for language and theme. On the chat page, switch engines and open Settings. Conversations stay in your browser.",
      ],
    },
    {
      id: "browser",
      heading: "1. Browser on-device",
      steps: [
        "Use a recent Chrome build with Prompt API / built-in AI support.",
        "Select the Browser engine.",
        "If status is “needs download” or “unavailable”, switch to Local.",
      ],
    },
    {
      id: "local",
      heading: "2. Local models (recommended)",
      steps: [
        "Install and run Ollama, or use LM Studio with Local Server + CORS enabled.",
        "Pull a model, e.g. ollama pull llama3.2",
        "Select the Local engine. Ollama is usually http://localhost:11434/v1; LM Studio is often http://localhost:1234/v1.",
        "For a public HTTPS site, set OLLAMA_ORIGINS=* (or your domain) before starting Ollama.",
      ],
    },
    {
      id: "custom",
      heading: "3. Third-party / custom API",
      bullets: [
        "OpenRouter: Base URL https://openrouter.ai/api/v1 plus your API key.",
        "Any OpenAI Chat Completions–compatible endpoint: point to /v1, then pick a model.",
        "Use “Fetch models” in Settings to list available models.",
      ],
    },
    {
      id: "privacy",
      heading: "Privacy",
      paragraphs: [
        "Chats and settings live in localStorage. Requests go straight to your chosen engine — ChatGUI does not proxy them.",
      ],
    },
  ],
};
