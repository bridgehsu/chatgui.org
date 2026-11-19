export type ArticleSection = {
  heading: string;
  paragraphs: string[];
};

export type Article = {
  title: string;
  updated: string;
  lead: string;
  sections: ArticleSection[];
};

export const aboutZh: Article = {
  title: "关于 ChatGUI",
  updated: "2026",
  lead:
    "ChatGUI 是一个极简聊天壳：让你方便地使用 Chrome 浏览器内置模型、本机本地大模型，以及自行配置的第三方 OpenAI 兼容接口。",
  sections: [
    {
      heading: "我们在解决什么问题",
      paragraphs: [
        "大模型正在同时走向云端和本地。很多人已经在用 Ollama、LM Studio，或浏览器里的轻量模型，但入口仍然分散：每个工具一套界面，换一个引擎就要重新学习。",
        "ChatGUI 想做最薄的那一层——不绑定某一家厂商，不强迫流量经过我们的服务器，只提供一个干净、好用的聊天界面，把选择权留给用户。",
      ],
    },
    {
      heading: "三种使用方式",
      paragraphs: [
        "浏览器本地：在支持的 Chrome 上，可直接试用内置小模型（如 Gemini Nano / Prompt API），免安装、适合先体验。",
        "本机模型：连接 Ollama、LM Studio 等本地引擎，适合要更强能力、隐私和离线的日常使用。",
        "第三方模型：填写 OpenRouter 等 OpenAI 兼容地址与 API Key，在轻薄本或需要云端模型时也能立刻聊起来。",
      ],
    },
    {
      heading: "诞生背景",
      paragraphs: [
        "本地模型会越来越多、越来越好跑，但「接上就能聊」仍然不够省事。跨域、端口、Key、模型名……这些细节不该挡住第一次对话。",
        "所以我们做了 ChatGUI：默认尽量少配置，连不上时给出人话引导；进阶用户再打开设置，自由切换引擎。",
      ],
    },
    {
      heading: "对未来的判断",
      paragraphs: [
        "未来本地模型会更普及：更小的体积、更好的端侧芯片、更统一的接口。ChatGUI 会继续把「本机优先」当作主路径。",
        "与此同时，云端和聚合 API 不会消失。只要它们提供 OpenAI 兼容接口，ChatGUI 就能接上——本地跑不动时，你仍然有退路。",
      ],
    },
    {
      heading: "我们坚持什么",
      paragraphs: [
        "对话与设置保存在你的浏览器本地；请求直连你选择的引擎，不经过 ChatGUI 中转。",
        "界面保持极简：少概念、少弹窗、少失败。文档讲「怎么用」，关于页讲「为什么存在」。",
      ],
    },
  ],
};

export const aboutEn: Article = {
  title: "About ChatGUI",
  updated: "2026",
  lead:
    "ChatGUI is a minimal chat shell that makes it easy to use Chrome’s on-device AI, local models on your machine, and third-party OpenAI-compatible APIs you configure yourself.",
  sections: [
    {
      heading: "The problem",
      paragraphs: [
        "Models are moving to both the cloud and the device. People already run Ollama, LM Studio, or lightweight browser models — but every stack has its own UI, and switching engines means starting over.",
        "ChatGUI aims to be the thinnest layer: not locked to one vendor, not routing your chats through our servers — just a clean chat interface that leaves the choice to you.",
      ],
    },
    {
      heading: "Three ways to chat",
      paragraphs: [
        "Browser: on supported Chrome builds, try the built-in small model (Prompt API / Gemini Nano) with zero install.",
        "Local: connect Ollama or LM Studio for stronger, private, offline-friendly use.",
        "Third-party: paste an OpenAI-compatible Base URL and API key (e.g. OpenRouter) when you need cloud models.",
      ],
    },
    {
      heading: "Why we built it",
      paragraphs: [
        "Local models will keep getting better — but “just start chatting” is still too hard. CORS, ports, keys, model names shouldn’t block the first message.",
        "So ChatGUI defaults to low friction, explains failures in plain language, and keeps power features in Settings for people who want them.",
      ],
    },
    {
      heading: "Looking ahead",
      paragraphs: [
        "We expect local models to become more common: smaller weights, better NPUs, more standard APIs. ChatGUI will stay local-first.",
        "Cloud and aggregator APIs will remain. As long as they speak OpenAI-compatible chat completions, ChatGUI can connect — a fallback when your laptop can’t run a big model.",
      ],
    },
    {
      heading: "What we won’t compromise",
      paragraphs: [
        "Chats and settings stay in your browser. Requests go straight to the engine you pick — ChatGUI doesn’t proxy them.",
        "The UI stays minimal. Docs explain how to use it; this About page explains why it exists.",
      ],
    },
  ],
};
