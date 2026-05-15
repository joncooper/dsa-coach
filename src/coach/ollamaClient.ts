// Browser → Ollama client. DSA Coach is a static, server-less SPA, so the
// coach talks directly to a local Ollama daemon. This is an opt-in feature:
// when Ollama is not reachable the UI degrades gracefully.
//
// Ollama must allow the app origin via CORS. Run it as:
//   OLLAMA_ORIGINS="http://127.0.0.1:5173" ollama serve
// (or OLLAMA_ORIGINS="*" for any local origin).

const OLLAMA_URL = "http://localhost:11434";
export const COACH_MODEL = "gemma4:latest";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface OllamaStatus {
  available: boolean;
  model: string | null;
  reason?: "unreachable" | "model-missing";
}

/** Probe whether Ollama is up and the coach model is installed. */
export async function checkOllama(): Promise<OllamaStatus> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(2500)
    });
    if (!res.ok) return { available: false, model: null, reason: "unreachable" };
    const data = (await res.json()) as { models?: Array<{ name: string }> };
    const names = (data.models ?? []).map((m) => m.name);
    const base = COACH_MODEL.split(":")[0];
    const found = names.some((n) => n === COACH_MODEL || n === base || n.startsWith(`${base}:`));
    return found
      ? { available: true, model: COACH_MODEL }
      : { available: false, model: null, reason: "model-missing" };
  } catch {
    return { available: false, model: null, reason: "unreachable" };
  }
}

/**
 * Stream a chat completion. Returns an async generator of text chunks
 * (already extracted from Ollama's NDJSON frames). Pass an AbortSignal
 * to cancel an in-flight response.
 */
export async function* streamChat(
  messages: ChatMessage[],
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: COACH_MODEL, messages, stream: true }),
    signal
  });

  if (!res.ok || !res.body) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Ollama ${res.status}${detail ? `: ${detail}` : ""}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const frame = JSON.parse(trimmed) as {
            message?: { content?: string };
            done?: boolean;
          };
          const chunk = frame.message?.content;
          if (chunk) yield chunk;
        } catch {
          // Skip malformed NDJSON frames.
        }
      }
    }
    const tail = buffer.trim();
    if (tail) {
      try {
        const frame = JSON.parse(tail) as { message?: { content?: string } };
        if (frame.message?.content) yield frame.message.content;
      } catch {
        // ignore trailing partial
      }
    }
  } finally {
    reader.releaseLock();
  }
}
