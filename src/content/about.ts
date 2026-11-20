export type AboutCard = {
  title: string;
  body: string;
};

export type AboutContent = {
  title: string;
  lead: string;
  vision: {
    heading: string;
    paragraphs: string[];
  };
  whatWeDo: {
    heading: string;
    items: AboutCard[];
  };
  values: {
    heading: string;
    items: AboutCard[];
  };
  closing: {
    heading: string;
    paragraphs: string[];
  };
};

export const aboutZh: AboutContent = {
  title: "关于 ChatGUI",
  lead:
    "我们想做最薄的一层聊天壳：连接浏览器内置模型、本机本地大模型，以及你自行配置的 OpenAI 兼容接口。",
  vision: {
    heading: "我们的愿景",
    paragraphs: [
      "大模型正在同时走向云端和本地。很多人已经在用 Ollama、LM Studio，或浏览器里的轻量模型，但入口仍然分散：每个工具一套界面，换一个引擎就要重新学习。",
      "ChatGUI 不绑定某一家厂商，也不强迫流量经过我们的服务器——只提供一个干净、好用的聊天界面，把选择权留给用户。",
      "我们相信：接口会越来越统一，本地会越来越好跑；真正该省掉的，是「接上就能聊」之前那些多余的摩擦。",
    ],
  },
  whatWeDo: {
    heading: "我们做什么",
    items: [
      {
        title: "三种接入方式",
        body: "浏览器免安装试用、本机连接 Ollama / LM Studio、三方填写兼容 API，按场景自由切换。",
      },
      {
        title: "数据留在本机",
        body: "对话与设置保存在你的浏览器；请求直连所选引擎，不经过 ChatGUI 中转。",
      },
      {
        title: "发现与导航",
        body: "整理可接入来源与 AI 圈常用产品、工具与资讯，帮你更快找到下一步。",
      },
    ],
  },
  values: {
    heading: "我们坚持什么",
    items: [
      {
        title: "极简优先",
        body: "少概念、少弹窗、少失败。默认尽量少配置，连不上时给出人话引导。",
      },
      {
        title: "本机优先",
        body: "把本机模型当作主路径；云端与聚合 API 作为补充，需要时随时接上。",
      },
      {
        title: "用户可控",
        body: "模型列表可自管，备份可写到你授权的本地文件夹，数据路径由你决定。",
      },
      {
        title: "开放兼容",
        body: "只要提供 OpenAI 兼容接口，就能接入——不锁死某一家运行时或云厂商。",
      },
    ],
  },
  closing: {
    heading: "一起把聊天壳做薄",
    paragraphs: [
      "无论你是刚打开 Chrome 想试一把，还是已经在本机跑着模型的人，ChatGUI 都希望成为那层不碍事的界面。",
      "从会话开始聊，或到模型 / 发现页配置来源——选择权始终在你这边。",
    ],
  },
};

export const aboutEn: AboutContent = {
  title: "About ChatGUI",
  lead:
    "A thin chat shell for Chrome on-device AI, local models on your machine, and OpenAI-compatible APIs you configure yourself.",
  vision: {
    heading: "Our vision",
    paragraphs: [
      "Models are moving to both the cloud and the device. People already run Ollama, LM Studio, or lightweight browser models — but every stack has its own UI, and switching engines means starting over.",
      "ChatGUI is not locked to one vendor and does not route your chats through our servers. It is a clean chat interface that leaves the choice to you.",
      "Interfaces will keep converging and local models will keep getting easier. What should disappear is the friction before the first real conversation.",
    ],
  },
  whatWeDo: {
    heading: "What we do",
    items: [
      {
        title: "Three ways in",
        body: "Browser with zero install, local Ollama / LM Studio, or any compatible third-party API — switch by need.",
      },
      {
        title: "Data stays local",
        body: "Chats and settings live in your browser. Requests go straight to the engine you chose.",
      },
      {
        title: "Discover & navigate",
        body: "Curated connectable sources plus AI apps, tools, and news so the next step is easier to find.",
      },
    ],
  },
  values: {
    heading: "What we stand for",
    items: [
      {
        title: "Minimal by default",
        body: "Fewer concepts, fewer modals, fewer dead ends. Light setup first; plain-language help when things fail.",
      },
      {
        title: "Local first",
        body: "Treat on-device and local models as the main path; cloud APIs as a backup when you need them.",
      },
      {
        title: "Under your control",
        body: "Manage your model list, and back up to a folder you authorize — your data, your path.",
      },
      {
        title: "Open & compatible",
        body: "Any OpenAI-compatible endpoint can plug in. No lock-in to one runtime or cloud vendor.",
      },
    ],
  },
  closing: {
    heading: "Keep the shell thin",
    paragraphs: [
      "Whether you are trying Chrome AI for the first time or already running models locally, ChatGUI aims to stay out of the way.",
      "Start chatting, or configure sources under Models / Discover — the choice stays yours.",
    ],
  },
};

/** @deprecated kept for any old imports */
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
