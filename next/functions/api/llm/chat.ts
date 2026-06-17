interface Env {
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  OPENROUTER_HTTP_REFERER?: string;
  OPENROUTER_APP_TITLE?: string;
}

interface PagesContext {
  request: Request;
  env: Env;
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function onRequestPost(context: PagesContext): Promise<Response> {
  if (!context.env.OPENROUTER_API_KEY || !context.env.OPENROUTER_MODEL) {
    return json({ error: "OPENROUTER_API_KEY and OPENROUTER_MODEL must be configured." }, 503);
  }

  const body = await context.request.json().catch(() => undefined) as { messages?: ChatMessage[]; responseFormat?: unknown } | undefined;
  const messages = (body?.messages ?? []).filter(isChatMessage).slice(-20);
  if (!messages.length) return json({ error: "Missing messages." }, 400);

  const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "authorization": `Bearer ${context.env.OPENROUTER_API_KEY}`,
      "content-type": "application/json",
      ...(context.env.OPENROUTER_HTTP_REFERER ? { "http-referer": context.env.OPENROUTER_HTTP_REFERER } : {}),
      ...(context.env.OPENROUTER_APP_TITLE ? { "x-title": context.env.OPENROUTER_APP_TITLE } : {})
    },
    body: JSON.stringify({
      model: context.env.OPENROUTER_MODEL,
      messages,
      max_tokens: 900,
      temperature: 0.35,
      ...(body?.responseFormat ? { response_format: body.responseFormat } : {})
    })
  });

  const value = await upstream.json().catch(async () => ({ error: await upstream.text().catch(() => upstream.statusText) })) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: unknown;
  };
  if (!upstream.ok) return json({ error: openRouterError(value.error) }, upstream.status);
  const message = value.choices?.[0]?.message?.content?.trim();
  return json({ message: message || "(no response)" });
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return (candidate.role === "system" || candidate.role === "user" || candidate.role === "assistant")
    && typeof candidate.content === "string";
}

function openRouterError(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "OpenRouter request failed.";
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
