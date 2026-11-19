import type { ChatMessage } from "../types";

export function normalizeBaseUrl(url: string) {
  return (url || "").trim().replace(/\/+$/, "");
}

export function authHeaders(apiKey: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey.trim()) {
    headers.Authorization = `Bearer ${apiKey.trim()}`;
  }
  return headers;
}

export function friendlyError(err: unknown, status?: number, bodyText?: string) {
  const raw = String(err instanceof Error ? err.message : err || "");
  const lower = `${raw} ${bodyText || ""}`.toLowerCase();

  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("load failed")
  ) {
    return [
      "连不上模型服务。常见原因：",
      "1）本机还没打开 Ollama / LM Studio；",
      "2）网页跨域被拦（Ollama 需设置 OLLAMA_ORIGINS=*，LM Studio 需开启 CORS）；",
      "3）Base URL 填错。",
      "可点设置查看引导，或先测试连接。",
    ].join("\n");
  }
  if (status === 401 || status === 403) {
    return "鉴权失败。云端接口请检查 API Key；本地服务通常可以留空。";
  }
  if (status === 404) {
    return "接口地址好像不对，或模型不存在。请确认 Base URL 是否包含 /v1，以及模型名称是否正确。";
  }
  if (bodyText) {
    try {
      const data = JSON.parse(bodyText) as {
        error?: { message?: string } | string;
        message?: string;
      };
      const msg =
        (typeof data.error === "object" ? data.error?.message : data.error) ||
        data.message;
      if (msg) return String(msg);
    } catch {
      /* ignore */
    }
    if (bodyText.length < 300) return bodyText;
  }
  return raw || "请求失败";
}

export async function fetchModels(baseUrl: string, apiKey: string) {
  const base = normalizeBaseUrl(baseUrl);
  if (!base) throw new Error("请先填写 Base URL");
  const res = await fetch(`${base}/models`, { headers: authHeaders(apiKey) });
  const text = await res.text();
  if (!res.ok) throw new Error(friendlyError(new Error("models failed"), res.status, text));
  const data = JSON.parse(text) as {
    data?: Array<{ id?: string; name?: string }>;
    models?: Array<{ id?: string; name?: string }>;
  };
  return (data.data || data.models || [])
    .map((m) => m.id || m.name)
    .filter((id): id is string => Boolean(id));
}

function handleSSELine(line: string, onDelta: (delta: string) => void) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith(":")) return;
  if (!trimmed.startsWith("data:")) return;
  const data = trimmed.slice(5).trim();
  if (data === "[DONE]") return;
  try {
    const json = JSON.parse(data) as {
      choices?: Array<{ delta?: { content?: string }; message?: { content?: string } }>;
    };
    const delta =
      json.choices?.[0]?.delta?.content ?? json.choices?.[0]?.message?.content ?? "";
    if (delta) onDelta(delta);
  } catch {
    /* ignore partial chunks */
  }
}

async function readSSE(res: Response, onDelta: (delta: string) => void) {
  if (!res.body) {
    const text = await res.text();
    for (const line of text.split(/\r?\n/)) handleSSELine(line, onDelta);
    return;
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split(/\r?\n/);
    buffer = parts.pop() || "";
    for (const line of parts) handleSSELine(line, onDelta);
  }
  if (buffer) handleSSELine(buffer, onDelta);
}

export async function streamChat(options: {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: Pick<ChatMessage, "role" | "content">[];
  signal?: AbortSignal;
  onDelta: (delta: string) => void;
}) {
  const base = normalizeBaseUrl(options.baseUrl);
  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: authHeaders(options.apiKey),
    body: JSON.stringify({
      model: options.model,
      messages: options.messages,
      stream: true,
    }),
    signal: options.signal,
  });

  if (!res.ok) {
    const bodyText = await res.text();
    throw Object.assign(new Error("chat failed"), {
      status: res.status,
      bodyText,
    });
  }

  const ctype = res.headers.get("content-type") || "";
  if (ctype.includes("application/json") && !ctype.includes("text/event-stream")) {
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content || "";
    if (content) options.onDelta(content);
    return;
  }

  await readSSE(res, options.onDelta);
}
