interface Env {
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
}

interface PagesContext {
  env: Env;
}

export function onRequestGet(context: PagesContext): Response {
  const model = context.env.OPENROUTER_MODEL ?? null;
  return new Response(JSON.stringify({
    available: Boolean(context.env.OPENROUTER_API_KEY && model),
    model,
    reason: context.env.OPENROUTER_API_KEY ? model ? undefined : "model-missing" : "unreachable"
  }), {
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
