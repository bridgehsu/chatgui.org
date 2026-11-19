# ChatGUI

**A minimal chat shell for on-device browser AI, local models (Ollama), and OpenAI-compatible APIs.**

ChatGUI is a privacy-friendly frontend: conversations stay in your browser, and requests go straight to the engine you choose — no ChatGUI backend in the middle.

[![License](https://img.shields.io/badge/license-MIT-0e1015?style=flat-square)](#license)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)

---

## Why ChatGUI

Most chat UIs either lock you into one cloud vendor or bury you in settings. ChatGUI keeps three clear paths:

| Engine | Best for | What you need |
|--------|----------|----------------|
| **Browser** | Zero-install trial | Recent Chrome with Prompt API / Gemini Nano |
| **Local** | Stronger everyday use | Ollama or LM Studio running on your machine |
| **Custom API** | Cloud / BYOK | OpenRouter or any OpenAI-compatible endpoint |

Switch engines from the top bar. Settings only show the fields that matter for the mode you’re in.

---

## Features

- **Three engines** — browser on-device AI → local runtime → custom OpenAI-compatible API
- **Streaming chat** — SSE for HTTP backends; Prompt API streaming when available
- **Conversation sidebar** — history kept in `localStorage`
- **Light / dark theme** — plus system preference
- **中文 / English** — UI locale switch
- **GitHub Pages ready** — Actions workflow included
- **Optional analytics** — Google Analytics 4 via env

---

## Quick start

### Requirements

- Node.js 20+ (22 recommended)
- For local models: [Ollama](https://ollama.com/) or [LM Studio](https://lmstudio.ai/)

### Develop

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://127.0.0.1:5173`).

### Build

```bash
npm run build
npm run preview
```

---

## Connect a model

### 1. Browser (on-device)

1. Use a recent Chrome build with built-in AI / Prompt API support.
2. Choose **Browser** in the engine switcher.
3. If status is “needs download” or “unavailable”, switch to **Local**.

### 2. Local (recommended)

**Ollama**

```bash
ollama pull llama3.2
# Base URL: http://localhost:11434/v1
```

If the site is served from a public HTTPS origin, allow CORS:

```bash
OLLAMA_ORIGINS=* ollama serve
```

**LM Studio**

- Start the local server and enable CORS.
- Base URL is usually `http://localhost:1234/v1`.

### 3. Custom API

- Preset **OpenRouter**: `https://openrouter.ai/api/v1` + your API key  
- Or any OpenAI Chat Completions–compatible `/v1` endpoint

---

## Deploy (GitHub Pages)

1. Push to `main` / `master` (workflow: `.github/workflows/deploy.yml`).
2. Repo **Settings → Pages → Source**: GitHub Actions.
3. Optional variables / secrets:

| Name | Where | Purpose |
|------|--------|---------|
| `VITE_BASE` | Actions variable | `/` for custom domain or user site; `/repo-name/` for project pages |
| `VITE_GA_MEASUREMENT_ID` | Actions secret | GA4 Measurement ID (`G-XXXXXXXX`) |

Local env template: [`.env.example`](./.env.example).

---

## Project layout

```text
src/
  components/     # Header, sidebar, chat, settings, engine switch
  lib/
    browserAI.ts  # Chrome Prompt API adapter
    openai.ts     # OpenAI-compatible HTTP client
    provider.ts   # Unified probe + stream
    storage.ts    # Settings & conversations
    i18n.tsx      # Locale strings
  App.tsx
```

Stack: **Vite + React + TypeScript**.

---

## Privacy

- Chats and settings are stored in the browser (`localStorage`).
- API keys (if any) never leave your machine except to the endpoint you configure.
- ChatGUI does not proxy model traffic through its own server.

---

## License

MIT — use it, fork it, make it yours.

---

<p align="center">
  <strong>ChatGUI</strong><br/>
  <sub>Open the page. Pick an engine. Start chatting.</sub>
</p>
