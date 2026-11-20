import type { LocaleCode } from "./i18n";

export const SITE_URL = "https://chatgui.org";
export const SITE_NAME = "ChatGUI";

export type SeoPage = "home" | "about" | "docs" | "models" | "discover";

type SeoCopy = {
  title: string;
  description: string;
};

const pages: Record<SeoPage, Record<LocaleCode, SeoCopy>> = {
  home: {
    zh: {
      title: "ChatGUI — 浏览器 / 本地 / API 极简聊天壳",
      description:
        "免安装打开即用。支持 Chrome 内置模型、Ollama / LM Studio 本机模型，以及 OpenRouter 等 OpenAI 兼容接口。对话保存在浏览器本地。",
    },
    en: {
      title: "ChatGUI — Minimal chat for browser, local & API models",
      description:
        "Open in the browser with no install. Use Chrome on-device AI, Ollama / LM Studio locally, or any OpenAI-compatible API. Chats stay in your browser.",
    },
  },
  about: {
    zh: {
      title: "关于 ChatGUI — 为什么做这个极简聊天壳",
      description:
        "了解 ChatGUI：把浏览器内置 AI、本机大模型和第三方兼容 API 收进同一个干净界面，隐私优先、无中转服务器。",
    },
    en: {
      title: "About ChatGUI — Why this minimal chat shell",
      description:
        "Learn why ChatGUI exists: one clean UI for on-device browser AI, local models, and OpenAI-compatible APIs — privacy-first, no proxy backend.",
    },
  },
  docs: {
    zh: {
      title: "ChatGUI 文档 — 连接浏览器 / Ollama / API",
      description:
        "快速上手 ChatGUI：如何启用浏览器本地模型、连接 Ollama 或 LM Studio，以及配置 OpenRouter 等兼容接口。",
    },
    en: {
      title: "ChatGUI Docs — Browser, Ollama & API setup",
      description:
        "Get started with ChatGUI: enable browser on-device AI, connect Ollama or LM Studio, and configure OpenRouter or other compatible APIs.",
    },
  },
  models: {
    zh: {
      title: "ChatGUI 模型 — Chrome / Ollama / API",
      description:
        "选择 Chrome 浏览器内置模型、Ollama、LM Studio 或 OpenRouter 等来源，配置并保存后即可开始聊天。",
    },
    en: {
      title: "ChatGUI Models — Chrome / Ollama / API",
      description:
        "Choose Chrome on-device AI, Ollama, LM Studio, or OpenRouter, configure, and save to start chatting.",
    },
  },
  discover: {
    zh: {
      title: "ChatGUI 发现 — AI 导航与可接入模型",
      description:
        "按场景浏览 AI 产品、本机开源、模型平台与工具；可接入 ChatGUI 的来源可一键试用或配置。",
    },
    en: {
      title: "ChatGUI Discover — AI directory & connectable models",
      description:
        "Browse AI apps, local open-source, platforms, and tools by use case. Connectable sources can start a chat in ChatGUI.",
    },
  },
};

const pathByPage: Record<SeoPage, string> = {
  home: "/",
  about: "/about",
  docs: "/docs",
  models: "/models",
  discover: "/discover",
};

function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string,
) {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(
    `link[rel="${rel}"]`,
  ) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

export function pageFromPath(pathname: string): SeoPage {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean.endsWith("/about") || clean === "/about") return "about";
  if (clean.endsWith("/docs") || clean === "/docs") return "docs";
  if (clean.endsWith("/models") || clean === "/models") return "models";
  if (clean.endsWith("/settings") || clean === "/settings") return "models";
  if (clean.endsWith("/discover") || clean === "/discover") return "discover";
  return "home";
}

export function applySeo(page: SeoPage, locale: LocaleCode) {
  const copy = pages[page][locale];
  const path = pathByPage[page];
  const url = `${SITE_URL}${path === "/" ? "/" : path}`;
  const ogImage = `${SITE_URL}/favicon.svg`;

  document.title = copy.title;
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";

  upsertMeta("name", "description", copy.description);
  upsertMeta("name", "application-name", SITE_NAME);
  upsertMeta(
    "name",
    "keywords",
    locale === "zh"
      ? "ChatGUI,本地大模型,Ollama,LM Studio,浏览器AI,OpenRouter,OpenAI兼容"
      : "ChatGUI,local LLM,Ollama,LM Studio,browser AI,OpenRouter,OpenAI compatible",
  );

  upsertLink("canonical", url);

  upsertMeta("property", "og:type", "website");
  upsertMeta("property", "og:site_name", SITE_NAME);
  upsertMeta("property", "og:title", copy.title);
  upsertMeta("property", "og:description", copy.description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:image", ogImage);
  upsertMeta("property", "og:locale", locale === "zh" ? "zh_CN" : "en_US");

  upsertMeta("name", "twitter:card", "summary");
  upsertMeta("name", "twitter:title", copy.title);
  upsertMeta("name", "twitter:description", copy.description);
  upsertMeta("name", "twitter:image", ogImage);
}
